/**
 * Provisions a WARDEN or GATE_STAFF account. Run manually from the terminal —
 * there's no public endpoint for this, since only students self-register.
 *
 * Usage:
 *   node scripts/seedStaff.js --role WARDEN --staffId W001 \
 *     --name "Jane Warden" --email jane.warden@example.edu \
 *     --phone 9876543210 --password "a-strong-password"
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const { validatePassword, validateEmail, validatePhone } = require('../utils/validators');

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    args[argv[i].replace(/^--/, '')] = argv[i + 1];
  }
  return args;
}

async function main() {
  const { role, staffId, name, email, phone, password } = parseArgs(process.argv.slice(2));

  if (!['WARDEN', 'GATE_STAFF','ADMIN'].includes(role)) throw new Error('--role must be WARDEN or GATE_STAFF or ADMIN');
  if (!staffId || !name) throw new Error('--staffId and --name are required');

  const emailErr = validateEmail(email);
  if (emailErr) throw new Error(emailErr);
  const phoneErr = validatePhone(phone);
  if (phoneErr) throw new Error(phoneErr);
  const passwordErr = validatePassword(password);
  if (passwordErr) throw new Error(passwordErr);

  await connectDB();

  const existing = await User.findOne({
    $or: [{ staffId: staffId.toUpperCase() }, { email: email.toLowerCase() }],
  }).lean();
  if (existing) throw new Error('A staff account with this staffId or email already exists');

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS || 12);
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = await User.create({ role, staffId, name, email, phone, passwordHash });

  console.log(`Created ${role} account: ${user.staffId} (${user.email})`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[seedStaff] Failed:', err.message);
  process.exit(1);
});