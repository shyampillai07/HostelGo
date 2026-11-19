require('dotenv').config();

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const HostelBlock = require('../models/HostelBlock');
const HostelRoom = require('../models/HostelRoom');
const PaymentLedger = require('../models/PaymentLedger');
const Pass = require('../models/Pass');
const MaintenanceTicket = require('../models/MaintenanceTicket');

const ACADEMIC_YEAR = '2026-2027';
const DEMO_STUDENT_COUNT = 120;
const FULLY_PAID_COUNT = 59;
const ROOM_COUNT = 100;
const BEDS_PER_ROOM = 2;
const DEMO_PASSWORD = 'HostelGo@123';

const firstNames = ['Aarav', 'Ananya', 'Arjun', 'Diya', 'Ishaan', 'Kavya', 'Mira', 'Nikhil', 'Riya', 'Vihaan'];
const lastNames = ['Sharma', 'Pillai', 'Rao', 'Patil', 'Shetty', 'Nair', 'Bhat', 'Gowda', 'Iyer', 'Desai'];
const branches = ['CSE', 'ISE', 'ECE', 'ME', 'CV'];

function demoStudentId(index) {
  return `DEMO${String(index).padStart(3, '0')}`;
}

function demoEmail(index) {
  return `${demoStudentId(index).toLowerCase()}@hostelgo.demo`;
}

function studentName(index) {
  return `${firstNames[index % firstNames.length]} ${lastNames[Math.floor(index / firstNames.length) % lastNames.length]}`;
}

function paymentState(index) {
  if (index < FULLY_PAID_COUNT) return { vtuRentStatus: 'VERIFIED', messDdStatus: 'VERIFIED', isFullyPaid: true };
  if (index % 3 === 0) return { vtuRentStatus: 'REJECTED', messDdStatus: 'PHYSICAL_DD_RECEIVED', isFullyPaid: false };
  return { vtuRentStatus: 'PENDING', messDdStatus: 'PHYSICAL_DD_RECEIVED', isFullyPaid: false };
}

async function upsertStaff() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const staff = [
    {
      role: 'ADMIN',
      staffId: 'DEMO-ADMIN',
      name: 'Demo Administrator',
      email: 'demo.admin@hostelgo.demo',
      phone: '9000000000',
      passwordHash,
    },
    {
      role: 'WARDEN',
      staffId: 'DEMO-WARDEN',
      name: 'Demo Warden',
      email: 'demo.warden@hostelgo.demo',
      phone: '9000000001',
      passwordHash,
    },
    {
      role: 'GATE_STAFF',
      staffId: 'DEMO-GATE',
      name: 'Demo Gate Staff',
      email: 'demo.gate@hostelgo.demo',
      phone: '9000000002',
      passwordHash,
    },
  ];

  for (const account of staff) {
    await User.findOneAndUpdate(
      { staffId: account.staffId },
      { $set: account },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }
}

async function upsertStudents() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const students = [];

  for (let index = 0; index < DEMO_STUDENT_COUNT; index += 1) {
    const number = index + 1;
    const student = await User.findOneAndUpdate(
      { usn: demoStudentId(number) },
      {
        $set: {
          role: 'STUDENT',
          usn: demoStudentId(number),
          name: studentName(index),
          email: demoEmail(number),
          passwordHash,
          phone: `91${String(9000000000 + number)}`,
          branch: branches[index % branches.length],
          category: index % 2 === 0 ? 'UG' : 'PG',
          gender: index % 2 === 0 ? 'Male' : 'Female',
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    students.push(student);
  }

  return students;
}

async function upsertPayments(students, warden) {
  for (let index = 0; index < students.length; index += 1) {
    const number = index + 1;
    const state = paymentState(index);
    await PaymentLedger.findOneAndUpdate(
      { studentId: students[index]._id, academicYear: ACADEMIC_YEAR },
      {
        $set: {
          studentId: students[index]._id,
          usn: students[index].usn,
          academicYear: ACADEMIC_YEAR,
          vtuDuReference: `DEMO-VTU-${String(number).padStart(3, '0')}`,
          vtuRentAmount: 42000,
          vtuReceiptPdfUrl: '',
          vtuRentStatus: state.vtuRentStatus,
          ddNumber: `DEMO-DD-${String(number).padStart(3, '0')}`,
          ddBankName: 'Demo Bank',
          messFeeAmount: 28000,
          messDdStatus: state.messDdStatus,
          isFullyPaid: state.isFullyPaid,
          ...(state.isFullyPaid ? { verifiedByStaffId: warden._id } : {}),
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }
}

async function upsertRooms(students) {
  const blocks = {};
  for (const category of ['UG', 'PG']) {
    blocks[category] = await HostelBlock.findOneAndUpdate(
      { blockName: `DEMO-${category}-BLOCK` },
      { $set: { blockName: `DEMO-${category}-BLOCK`, category, active: true } },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }

  const allocatedStudentIndexes = { UG: 0, PG: 1 };
  for (let roomIndex = 0; roomIndex < ROOM_COUNT; roomIndex += 1) {
    const category = roomIndex < ROOM_COUNT / 2 ? 'UG' : 'PG';
    const beds = [];
    for (let bedIndex = 0; bedIndex < BEDS_PER_ROOM; bedIndex += 1) {
      const studentIndex = allocatedStudentIndexes[category];
      const student = studentIndex < 20 ? students[studentIndex] : null;
      beds.push({
        bedNumber: `B${bedIndex + 1}`,
        status: student ? 'OCCUPIED' : roomIndex % 17 === 0 && bedIndex === 1 ? 'OUT_OF_SERVICE' : 'AVAILABLE',
        assignedStudentId: student?._id || null,
        assignedAt: student ? new Date() : null,
      });
      if (student) allocatedStudentIndexes[category] += 2;
    }

    await HostelRoom.findOneAndUpdate(
      { blockId: blocks[category]._id, roomNumber: `D${String(roomIndex + 1).padStart(3, '0')}` },
      {
        $set: {
          blockId: blocks[category]._id,
          roomNumber: `D${String(roomIndex + 1).padStart(3, '0')}`,
          totalCapacity: BEDS_PER_ROOM,
          beds,
          occupiedBedsCount: beds.filter((bed) => bed.status === 'OCCUPIED').length,
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }
}

async function upsertPasses(students) {
  for (let index = 0; index < 20; index += 1) {
    await Pass.findOneAndUpdate(
      { studentId: students[index]._id, academicYear: ACADEMIC_YEAR },
      {
        $set: {
          studentId: students[index]._id,
          usn: students[index].usn,
          academicYear: ACADEMIC_YEAR,
          validFrom: new Date('2026-08-01T00:00:00.000Z'),
          validUntil: new Date('2027-07-31T23:59:59.000Z'),
          status: 'ACTIVE',
          tokenVersion: 1,
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }
}

async function upsertMaintenanceTickets(students, warden) {
  const states = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
  for (let index = 0; index < 24; index += 1) {
    const status = states[index % states.length];
    await MaintenanceTicket.findOneAndUpdate(
      { usn: students[index].usn, description: `Demo maintenance issue ${index + 1}` },
      {
        $set: {
          studentId: students[index]._id,
          usn: students[index].usn,
          description: `Demo maintenance issue ${index + 1}`,
          status,
          resolutionNote: status === 'RESOLVED' ? 'Issue resolved by the hostel maintenance team.' : '',
          resolvedByStaffId: status === 'RESOLVED' ? warden._id : null,
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
  }
}

async function seed() {
  await connectDB();
  await upsertStaff();
  const refreshedWarden = await User.findOne({ staffId: 'DEMO-WARDEN' });
  const students = await upsertStudents();
  await upsertPayments(students, refreshedWarden);
  await upsertRooms(students);
  await upsertPasses(students);
  await upsertMaintenanceTickets(students, refreshedWarden);

  console.log(`Seeded ${ROOM_COUNT} rooms, ${DEMO_STUDENT_COUNT} students (${FULLY_PAID_COUNT} fully paid, ${DEMO_STUDENT_COUNT - FULLY_PAID_COUNT} not fully paid), 20 passes, and 24 maintenance tickets.`);
  console.log(`Demo student login: DEMO001 / ${DEMO_PASSWORD}`);
  console.log(`Demo admin login: DEMO-ADMIN / ${DEMO_PASSWORD}`);
  console.log(`Demo warden login: DEMO-WARDEN / ${DEMO_PASSWORD}`);
  console.log(`Demo gate login: DEMO-GATE / ${DEMO_PASSWORD}`);
}

seed()
  .catch((error) => {
    console.error('[seed] failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
