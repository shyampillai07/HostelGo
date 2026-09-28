require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const multer = require('multer');
const ledgerRoutes = require('./routes/ledgerRoutes');
const roomRoutes = require('./routes/roomRoutes');
const app = express();
const statusRoutes = require('./routes/statusRoutes');
const passRoutes = require('./routes/passRoutes');
const scannerRoutes = require('./routes/scannerRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const adminRoutes = require('./routes/adminRoutes');


// --- Middleware stack ---

app.use(helmet()); 

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN, 
    credentials: true,
  })
);

app.use(express.json()); 

// --- Routes ---

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/ledger', ledgerRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/pass', passRoutes);
app.use('/api/scanner', scannerRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/admin', adminRoutes);

// --- 404 handler ---
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// --- Error handler ---

app.use((err, req, res, next) => {
  console.error('[error]', err);

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: `File too large. Max size is ${process.env.UPLOAD_MAX_MB || 5}MB` });
    }
    return res.status(400).json({ error: err.message });
  }

  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: 'Duplicate value violates a unique constraint' });
  }

  return res.status(500).json({ error: 'Internal server error' });
});

// --- Startup ---

const PORT = process.env.PORT || 5000;

async function start() {
  const required = ['MONGODB_URI', 'JWT_ACCESS_SECRET', 'CLIENT_ORIGIN'];
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    console.error(`[startup] Missing required env vars: ${missing.join(', ')}`);
    process.exit(1);
  }

  await connectDB();

  app.listen(PORT, () => {
    console.log(`[server] HostelGo API listening on port ${PORT}`);
  });
}

start();