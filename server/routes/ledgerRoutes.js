const express = require('express');
const { submitLedger, listLedgers, getLedgerReceipt, verifyLedger } = require('../controllers/ledgerController');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { uploadReceiptPdf } = require('../middleware/upload');


const router = express.Router();


router.post(
  '/',
  requireAuth,
  requireRole('STUDENT'),
  uploadReceiptPdf.single('receipt'), 
  submitLedger
);

router.get(
  '/',
  requireAuth,
  requireRole('WARDEN', 'GATE_STAFF'),
  listLedgers
);

router.get(
  '/:id/receipt',
  requireAuth,
  requireRole('WARDEN'),
  getLedgerReceipt
);

router.put(
  '/:id/verify',
  requireAuth,
  requireRole('WARDEN'),
  verifyLedger
);

module.exports = router;