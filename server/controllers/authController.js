const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateStudentRegistration, validateLogin, validateProfileUpdate } = require('../utils/validators');


const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 12);

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '8h' }
  );
}

function toPublicProfile(user) {
  return {
    id: user._id.toString(),
    role: user.role,
    usn: user.usn,
    staffId: user.staffId,
    name: user.name,
    email: user.email,
    phone: user.phone,
    branch: user.branch,
    category: user.category,
    gender: user.gender,
    photoUrl: user.photoUrl,
  };
}


async function register(req, res) {
  const errors = validateStudentRegistration(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const { usn, name, email, password, phone, branch, category, gender } = req.body;


  const existing = await User.findOne({
    $or: [{ usn: usn.toUpperCase() }, { email: email.toLowerCase() }],
  });

  if (existing) {
    return res.status(409).json({ error: 'An account with this USN or email already exists' });
  }


  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  let user;
  try {
    user = await User.create({
      role: 'STUDENT',
      usn,
      name,
      email,
      passwordHash,
      phone,
      branch,
      category,
      gender,
    });
  } catch (err) {

    if (err.code === 11000) {
      return res.status(409).json({ error: 'An account with this USN or email already exists' });
    }
    throw err;
  }

  const token = signToken(user);
  return res.status(201).json({ token, user: toPublicProfile(user) });
}


async function login(req, res) {
  const errors = validateLogin(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const { identifier, password, role } = req.body;
  if (role !== undefined) {
    if (!['STUDENT', 'WARDEN', 'GATE_STAFF', 'ADMIN'].includes(role)) {
      return res.status(400).json({ error: 'Invalid account type' });
    }
  }
  const normalized = identifier.trim();


  const user = await User.findOne({
    $or: [
      { usn: normalized.toUpperCase() },
      { staffId: normalized.toUpperCase() },
      { email: normalized.toLowerCase() },
    ],
  }).select('+passwordHash');


  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  if (role !== undefined && user.role !== role) {
    return res.status(403).json({ error: `These credentials do not belong to the ${role.toLowerCase().replace('_', ' ')} account type` });
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = signToken(user);
  return res.status(200).json({ token, user: toPublicProfile(user) });
}


async function me(req, res) {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  return res.status(200).json({ user: toPublicProfile(user) });
}


async function updateProfile(req, res) {
  const errors = validateProfileUpdate(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }


  const allowedUpdates = {};
  const { name, phone, branch, gender } = req.body;

  if (name !== undefined) allowedUpdates.name = name.trim();
  if (phone !== undefined) allowedUpdates.phone = phone;
  if (branch !== undefined) allowedUpdates.branch = branch.trim();
  if (gender !== undefined) allowedUpdates.gender = gender.trim();

  if (Object.keys(allowedUpdates).length === 0) {
    return res.status(400).json({ error: 'No valid fields provided to update' });
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    allowedUpdates,
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.status(200).json({ user: toPublicProfile(user) });
}

module.exports = { register, login, me, updateProfile };