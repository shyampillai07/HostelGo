const MaintenanceTicket = require('../models/MaintenanceTicket');
const { validateMaintenanceTicket } = require('../utils/validators');


async function createTicket(req, res) {
  const errors = validateMaintenanceTicket(req.body);
  if (errors.length > 0) return res.status(400).json({ errors });

  const ticket = await MaintenanceTicket.create({
    studentId: req.user.id,
    usn: req.user.usn,
    description: req.body.description,
  });
  return res.status(201).json({ ticket });
}


async function listMyTickets(req, res) {
  const tickets = await MaintenanceTicket.find({ studentId: req.user.id }).sort({ createdAt: -1 }).lean();
  return res.status(200).json({ tickets });
}


async function listAllTickets(req, res) {
  const { status } = req.query;
  const ALLOWED_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
  const filter = typeof status === 'string' && ALLOWED_STATUSES.includes(status)
    ? { status }
    : {};
  const tickets = await MaintenanceTicket.find(filter)
    .populate('studentId', 'name usn email phone branch category')
    .sort({ createdAt: -1 })
    .lean();
  return res.status(200).json({ tickets });
}


async function updateTicket(req, res) {
  const { status, resolutionNote } = req.body;
  if (!['OPEN', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  const ticket = await MaintenanceTicket.findByIdAndUpdate(
    req.params.id,
    { status, resolutionNote: resolutionNote || '', resolvedByStaffId: req.user.id },
    { new: true }
  );
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
  return res.status(200).json({ ticket });
}

module.exports = { createTicket, listMyTickets, listAllTickets, updateTicket };