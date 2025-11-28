const mongoose = require('mongoose');
require('dotenv').config();
const NILMData = require('./models/NILMData');
const PVData = require('./models/PVData');
const connectDB = require('./config/db');

async function testData() {
  await connectDB();
  
  console.log('\n🔍 Testing NILM Data...');
  const nilmCount = await NILMData.countDocuments();
  console.log(`Total NILM records: ${nilmCount}`);
  
  const nilmSample = await NILMData.findOne({ aggregate: { $gt: 0 } }).sort({ timestamp: -1 });
  console.log('\nSample NILM record with data:', JSON.stringify(nilmSample, null, 2));
  
  // Get 3 records
  const nilmRecords = await NILMData.find().sort({ timestamp: -1 }).limit(3);
  console.log('\nLast 3 NILM records:', JSON.stringify(nilmRecords, null, 2));
  
  console.log('\n🔍 Testing PV Data...');
  const pvCount = await PVData.countDocuments();
  console.log(`Total PV records: ${pvCount}`);
  
  const pvSample = await PVData.findOne({ P: { $gt: 0 } }).sort({ time: -1 });
  console.log('\nSample PV record with power:', JSON.stringify(pvSample, null, 2));
  
  process.exit(0);
}

testData().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
