const mongoose = require('mongoose');

const RETRY_DELAY_MS = 2000;
const MAX_ATTEMPTS = 3;

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not set. Check your .env file.');
  }

  mongoose.set('strictQuery', true);

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        family: 4,
      });
      break;
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) {
        throw new Error(
          `[db] Unable to connect to MongoDB after ${MAX_ATTEMPTS} attempts: ${error.message}. `
          + 'Check Atlas network access, DNS, and MONGODB_URI.'
        );
      }
      console.warn(`[db] connection attempt ${attempt} failed; retrying in ${RETRY_DELAY_MS / 1000}s`);
      await wait(RETRY_DELAY_MS);
    }
  }

  console.log(`[db] connected to MongoDB Atlas (db: ${mongoose.connection.name})`);


  mongoose.connection.on('error', (err) => {
    console.error('[db] connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[db] disconnected');
  });
}

module.exports = connectDB;