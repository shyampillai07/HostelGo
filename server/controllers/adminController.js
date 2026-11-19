const bcrypt = require('bcryptjs');
const User = require('../models/User');
const HostelBlock = require('../models/HostelBlock');
const HostelRoom = require('../models/HostelRoom');
const PaymentLedger = require('../models/PaymentLedger');
const MaintenanceTicket = require('../models/MaintenanceTicket');
const SystemSetting = require('../models/SystemSetting');
const { validateStaffCreation } = require('../utils/validators');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);


async function createStaff(req, res) {
  const errors = validateStaffCreation(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  const { role, staffId, name, email, phone, password } = req.body;

  const existing = await User.findOne({
    $or: [{ staffId: staffId.toUpperCase() }, { email: email.toLowerCase() }],
  }).lean();
  if (existing) return res.status(409).json({ error: 'A staff account with this Staff ID or email already exists' });

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  let user;
  try {
    user = await User.create({ role, staffId, name, email, phone, passwordHash });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'A staff account with this Staff ID or email already exists' });
    throw err;
  }

  return res.status(201).json({ user: { id: user._id, role: user.role, staffId: user.staffId, name: user.name, email: user.email } });
}


async function listStaff(req, res) {
  const staff = await User.find({ role: { $in: ['WARDEN', 'GATE_STAFF'] } })
    .select('role staffId name email phone createdAt')
    .sort({ createdAt: -1 })
    .lean();
  return res.status(200).json({ staff });
}

async function getOverview(req, res) {
  const [
    studentCount,
    wardenCount,
    gateStaffCount,
    adminCount,
    blockCount,
    rooms,
    ledgers,
    maintenanceCounts,
  ] = await Promise.all([
    User.countDocuments({ role: 'STUDENT' }),
    User.countDocuments({ role: 'WARDEN' }),
    User.countDocuments({ role: 'GATE_STAFF' }),
    User.countDocuments({ role: 'ADMIN' }),
    HostelBlock.countDocuments(),
    HostelRoom.find().select('beds occupiedBedsCount').lean(),
    PaymentLedger.find().select('isFullyPaid vtuRentStatus messDdStatus').lean(),
    MaintenanceTicket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const totalBeds = rooms.reduce((total, room) => total + (room.beds?.length || 0), 0);
  const occupiedBeds = rooms.reduce((total, room) => total + (room.beds?.filter((bed) => bed.status === 'OCCUPIED').length || 0), 0);
  const availableBeds = rooms.reduce((total, room) => total + (room.beds?.filter((bed) => bed.status === 'AVAILABLE').length || 0), 0);
  const fullyPaidStudents = ledgers.filter((ledger) => ledger.isFullyPaid).length;
  const pendingPayments = ledgers.filter((ledger) => ledger.vtuRentStatus === 'PENDING' || ledger.messDdStatus === 'PHYSICAL_DD_RECEIVED').length;
  const maintenance = maintenanceCounts.reduce((result, item) => ({ ...result, [item._id]: item.count }), {});

  return res.status(200).json({
    overview: {
      studentCount,
      wardenCount,
      gateStaffCount,
      adminCount,
      blockCount,
      roomCount: rooms.length,
      totalBeds,
      occupiedBeds,
      availableBeds,
      fullyPaidStudents,
      pendingPayments,
      maintenance,
    },
  });
}

async function listStudents(req, res) {
  const { search = '', category = 'ALL' } = req.query;
  const filter = { role: 'STUDENT' };
  if (category === 'UG' || category === 'PG') filter.category = category;
  if (typeof search === 'string' && search.trim()) {
    const term = search.trim();
    filter.$or = [
      { name: { $regex: term, $options: 'i' } },
      { usn: { $regex: term, $options: 'i' } },
      { email: { $regex: term, $options: 'i' } },
    ];
  }

  const students = await User.find(filter)
    .select('_id usn name email phone branch category gender createdAt')
    .sort({ name: 1 })
    .lean();
  const studentIds = students.map((student) => student._id);

  const [ledgers, rooms] = await Promise.all([
    PaymentLedger.find({ studentId: { $in: studentIds } }).select('studentId isFullyPaid vtuRentStatus messDdStatus academicYear').lean(),
    HostelRoom.find({ 'beds.assignedStudentId': { $in: studentIds } }).select('roomNumber beds blockId').populate('blockId', 'blockName category').lean(),
  ]);

  const ledgerByStudent = new Map(ledgers.map((ledger) => [String(ledger.studentId), ledger]));
  const roomByStudent = new Map();
  for (const room of rooms) {
    for (const bed of room.beds || []) {
      if (bed.assignedStudentId) roomByStudent.set(String(bed.assignedStudentId), { roomNumber: room.roomNumber, blockName: room.blockId?.blockName, bedNumber: bed.bedNumber });
    }
  }

  return res.status(200).json({
    students: students.map((student) => ({
      ...student,
      payment: ledgerByStudent.get(String(student._id)) || null,
      allocation: roomByStudent.get(String(student._id)) || null,
    })),
  });
}

async function resetStudentPassword(req, res) {
  const password = typeof req.body.password === 'string' ? req.body.password : '';
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const user = await User.findOne({ _id: req.params.id, role: 'STUDENT' });
  if (!user) return res.status(404).json({ error: 'Student not found' });
  user.passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  await user.save();
  return res.status(200).json({ success: true });
}

async function listInventory(req, res) {
  const [blocks, rooms] = await Promise.all([
    HostelBlock.find().sort({ blockName: 1 }).lean(),
    HostelRoom.find().populate('blockId', 'blockName category').sort({ roomNumber: 1 }).lean(),
  ]);
  return res.status(200).json({ blocks, rooms });
}

async function createBlock(req, res) {
  const { blockName, category } = req.body;
  if (!blockName || typeof blockName !== 'string' || !blockName.trim()) return res.status(400).json({ error: 'Block name is required' });
  if (!['UG', 'PG'].includes(category)) return res.status(400).json({ error: 'Category must be UG or PG' });

  try {
    const block = await HostelBlock.create({ blockName: blockName.trim(), category, active: true });
    return res.status(201).json({ block });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'A block with this name already exists' });
    throw error;
  }
}

async function createRoom(req, res) {
  const { blockId, roomNumber, capacity } = req.body;
  const bedCount = Number(capacity);
  if (!blockId || !roomNumber || !Number.isInteger(bedCount) || bedCount < 1 || bedCount > 8) {
    return res.status(400).json({ error: 'Block, room number, and a capacity from 1 to 8 are required' });
  }

  const block = await HostelBlock.findById(blockId);
  if (!block) return res.status(404).json({ error: 'Block not found' });

  const beds = Array.from({ length: bedCount }, (_, index) => ({
    bedNumber: `B${index + 1}`,
    status: 'AVAILABLE',
    assignedStudentId: null,
    assignedAt: null,
  }));

  try {
    const room = await HostelRoom.create({
      blockId,
      roomNumber: roomNumber.trim(),
      totalCapacity: bedCount,
      beds,
      occupiedBedsCount: 0,
    });
    return res.status(201).json({ room });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ error: 'This room number already exists in the block' });
    throw error;
  }
}

async function updateBedStatus(req, res) {
  const { bedId } = req.params;
  const { status } = req.body;
  if (!['AVAILABLE', 'OCCUPIED', 'OUT_OF_SERVICE'].includes(status)) return res.status(400).json({ error: 'Invalid bed status' });

  const room = await HostelRoom.findOne({ 'beds._id': bedId });
  if (!room) return res.status(404).json({ error: 'Bed not found' });
  const bed = room.beds.id(bedId);
  if (status !== 'OCCUPIED' && bed.assignedStudentId) {
    bed.assignedStudentId = null;
    bed.assignedAt = null;
  }
  if (status === 'OCCUPIED' && !bed.assignedStudentId) {
    return res.status(400).json({ error: 'An occupied bed must remain assigned to a student. Allocate it from the allocation page.' });
  }
  bed.status = status;
  await room.save();
  return res.status(200).json({ room });
}

async function getPaymentOverview(req, res) {
  const ledgers = await PaymentLedger.find()
    .populate('studentId', 'name usn branch category')
    .sort({ createdAt: -1 })
    .lean();
  return res.status(200).json({ ledgers });
}

async function getMaintenanceOverview(req, res) {
  const tickets = await MaintenanceTicket.find()
    .populate('studentId', 'name usn branch category phone')
    .sort({ createdAt: -1 })
    .lean();
  return res.status(200).json({ tickets });
}

async function getSettings(req, res) {
  const settings = await SystemSetting.find().lean();
  const values = settings.reduce((result, setting) => ({ ...result, [setting.key]: setting.value }), {});
  return res.status(200).json({
    settings: {
      academicYear: values.academicYear || '2026-2027',
      hostelName: values.hostelName || 'HostelGo',
      maintenanceEnabled: values.maintenanceEnabled !== false,
    },
  });
}

async function updateSettings(req, res) {
  const { academicYear, hostelName, maintenanceEnabled } = req.body;
  if (typeof academicYear !== 'string' || !/^\d{4}-\d{4}$/.test(academicYear)) return res.status(400).json({ error: 'Academic year must use the format YYYY-YYYY' });
  if (!hostelName || typeof hostelName !== 'string' || !hostelName.trim()) return res.status(400).json({ error: 'Hostel name is required' });

  const entries = [
    ['academicYear', academicYear.trim()],
    ['hostelName', hostelName.trim()],
    ['maintenanceEnabled', Boolean(maintenanceEnabled)],
  ];
  await Promise.all(entries.map(([key, value]) => SystemSetting.findOneAndUpdate(
    { key },
    { $set: { key, value } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )));

  return res.status(200).json({
    settings: { academicYear: academicYear.trim(), hostelName: hostelName.trim(), maintenanceEnabled: Boolean(maintenanceEnabled) },
  });
}

module.exports = {
  createStaff,
  listStaff,
  getOverview,
  listStudents,
  resetStudentPassword,
  listInventory,
  createBlock,
  createRoom,
  updateBedStatus,
  getPaymentOverview,
  getMaintenanceOverview,
  getSettings,
  updateSettings,
};