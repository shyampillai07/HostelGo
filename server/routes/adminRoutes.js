const express = require('express');
const {
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
} = require('../controllers/adminController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

const router = express.Router();
router.post('/staff', requireAuth, requireRole('ADMIN'), createStaff);
router.get('/staff', requireAuth, requireRole('ADMIN'), listStaff);
router.get('/overview', requireAuth, requireRole('ADMIN'), getOverview);
router.get('/students', requireAuth, requireRole('ADMIN'), listStudents);
router.patch('/students/:id/password', requireAuth, requireRole('ADMIN'), resetStudentPassword);
router.get('/inventory', requireAuth, requireRole('ADMIN'), listInventory);
router.post('/blocks', requireAuth, requireRole('ADMIN'), createBlock);
router.post('/rooms', requireAuth, requireRole('ADMIN'), createRoom);
router.patch('/beds/:bedId/status', requireAuth, requireRole('ADMIN'), updateBedStatus);
router.get('/payments', requireAuth, requireRole('ADMIN'), getPaymentOverview);
router.get('/maintenance', requireAuth, requireRole('ADMIN'), getMaintenanceOverview);
router.get('/settings', requireAuth, requireRole('ADMIN'), getSettings);
router.patch('/settings', requireAuth, requireRole('ADMIN'), updateSettings);

module.exports = router;