const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const NILMData = require('./models/NILMData');
const PVData = require('./models/PVData');
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

// Import PV data from CSV
async function importPVData() {
  const csvPath = path.join(__dirname, '../../PV/Simulink_Matlab/Irr_temp_ariana.csv');
  const data = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        // Parse CSV data
        const pvRecord = {
          timestamp: new Date(Date.now() + parseInt(row.time) * 3600000), // Convert hour to timestamp
          time: parseInt(row.time),
          P: parseFloat(row.P),
          Gb_i: parseFloat(row['Gb(i)']),
          Gd_i: parseFloat(row['Gd(i)']),
          T2m: parseFloat(row.T2m),
          Gt: parseFloat(row.Gt),
          Irradiance: parseFloat(row.Gt), // Gt is total irradiance
          Temperature: parseFloat(row.T2m) // T2m is temperature at 2m
        };
        data.push(pvRecord);
      })
      .on('end', async () => {
        try {
          // Clear existing data
          await PVData.deleteMany({});
          
          // Insert new data
          await PVData.insertMany(data);
          console.log(`✅ Imported ${data.length} PV data records`);
          resolve();
        } catch (error) {
          console.error('❌ Error inserting PV data:', error);
          reject(error);
        }
      })
      .on('error', reject);
  });
}

// Import NILM data from CSV files for all building and location combinations
async function importNILMData() {
  const basePath = path.join(__dirname, '../../SIDED/SIDED');
  
  // Define all building types and locations
  const buildings = ['Office', 'Dealer', 'Logistic'];
  const locations = ['LA', 'Offenbach', 'Tokyo'];
  
  let totalRecords = 0;
  
  // Clear all existing NILM data before import
  await NILMData.deleteMany({});
  console.log('🗑️  Cleared existing NILM data');
  
  for (const building of buildings) {
    for (const location of locations) {
      const csvPath = path.join(basePath, building, `${building}_${location}.csv`);
      
      if (!fs.existsSync(csvPath)) {
        console.log(`⚠️  File not found: ${csvPath}`);
        continue;
      }
      
      console.log(`📥 Importing ${building} - ${location}...`);
      try {
        const recordCount = await importSingleNILMFile(csvPath, building, location);
        totalRecords += recordCount;
        console.log(`✅ Imported ${recordCount} records for ${building} - ${location}`);
      } catch (error) {
        console.error(`❌ Failed to import ${building} - ${location}:`, error.message);
      }
    }
  }
  
  console.log(`🎉 Total NILM records imported: ${totalRecords}`);
}

// Helper function to import a single NILM CSV file
async function importSingleNILMFile(csvPath, building, location) {
  const data = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (row) => {
        try {
          // Parse Unix timestamp - skip if invalid
          const timestamp = parseInt(row.Time);
          if (isNaN(timestamp) || timestamp === 0) {
            return; // Skip invalid timestamps
          }
          
          // Parse CSV data with actual column names from SIDED dataset
          const nilmRecord = {
            timestamp: new Date(timestamp * 1000), // Convert Unix timestamp to Date
            aggregate: parseFloat(row.Aggregate || 0),
            appliances: {
              EVSE: parseFloat(row.EVSE || 0),
              PV: parseFloat(row.PV || 0),
              CS: parseFloat(row.CS || 0),
              CHP: parseFloat(row.CHP || 0),
              BA: parseFloat(row.BA || 0)
            },
            building: building,
            location: location
          };
          
          data.push(nilmRecord);
        } catch (err) {
          // Skip invalid records
        }
      })
      .on('end', async () => {
        try {
          // Insert new data in batches to avoid memory issues
          const batchSize = 1000;
          for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            await NILMData.insertMany(batch);
          }
          
          resolve(data.length);
        } catch (error) {
          console.error(`❌ Error inserting NILM data for ${building} - ${location}:`, error);
          reject(error);
        }
      })
      .on('error', reject);
  });
}

// Generate sample NILM data if CSV not available
async function generateSampleNILMData() {
  const data = [];
  const now = new Date();
  
  // Generate 24 hours of sample data (144 points at 10-min intervals)
  for (let i = 0; i < 144; i++) {
    const timestamp = new Date(now.getTime() - (144 - i) * 10 * 60 * 1000);
    const hour = timestamp.getHours();
    
    // Simulate realistic power consumption patterns
    const baseLoad = 1000;
    const evse = hour >= 8 && hour <= 18 ? Math.random() * 3000 : Math.random() * 500;
    const pv = hour >= 6 && hour <= 18 ? -Math.random() * 2000 * Math.sin((hour - 6) * Math.PI / 12) : 0;
    const cs = hour >= 9 && hour <= 17 ? Math.random() * 1500 : Math.random() * 300;
    const chp = 500 + Math.random() * 1000;
    const ba = Math.random() * 800;
    
    const appliances = {
      EVSE: parseFloat(evse.toFixed(2)),
      PV: parseFloat(pv.toFixed(2)),
      CS: parseFloat(cs.toFixed(2)),
      CHP: parseFloat(chp.toFixed(2)),
      BA: parseFloat(ba.toFixed(2))
    };
    
    const aggregate = baseLoad + evse + pv + cs + chp + ba;
    
    data.push({
      timestamp,
      aggregate: parseFloat(aggregate.toFixed(2)),
      appliances,
      building: 'Office',
      location: 'LA'
    });
  }
  
  try {
    await NILMData.deleteMany({});
    await NILMData.insertMany(data);
    console.log(`✅ Generated ${data.length} sample NILM data records`);
  } catch (error) {
    console.error('❌ Error generating NILM data:', error);
    throw error;
  }
}

// Main import function
async function importData() {
  try {
    console.log('📊 Starting data import...\n');
    
    console.log('1️⃣  Importing PV data from CSV...');
    await importPVData();
    
    console.log('\n2️⃣  Importing NILM data...');
    await importNILMData();
    
    console.log('\n✨ Data import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Data import failed:', error);
    process.exit(1);
  }
}

// Run import
importData();
