require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const HostelBlock = require('../models/HostelBlock');
const HostelRoom = require('../models/HostelRoom');

async function main() {
  await connectDB();

  const blockA = await HostelBlock.findOneAndUpdate(
    { blockName: 'Block A' }, { blockName: 'Block A', category: 'PG' },
    { upsert: true, new: true }
  );
  const blockB = await HostelBlock.findOneAndUpdate(
    { blockName: 'Block B' }, { blockName: 'Block B', category: 'UG' },
    { upsert: true, new: true }
  );

  const rooms = [
    { blockId: blockA._id, roomNumber: '204', totalCapacity: 2, beds: [{ bedNumber: 'A' }, { bedNumber: 'B' }] },
    { blockId: blockA._id, roomNumber: '205', totalCapacity: 2, beds: [{ bedNumber: 'A' }, { bedNumber: 'B' }] },
    { blockId: blockB._id, roomNumber: '101', totalCapacity: 3, beds: [{ bedNumber: 'A' }, { bedNumber: 'B' }, { bedNumber: 'C' }] },
  ];

  for (const r of rooms) {
    await HostelRoom.findOneAndUpdate(
      { blockId: r.blockId, roomNumber: r.roomNumber }, r,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  console.log('Seeded 2 blocks, 3 rooms, 7 beds.');
  await mongoose.disconnect();
}

main().catch((err) => { console.error(err); process.exit(1); });