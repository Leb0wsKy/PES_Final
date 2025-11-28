const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pes_dashboard';
    
    await mongoose.connect(mongoURI);

    console.log('✅ MongoDB Connected Successfully');
    console.log('   Database:', mongoose.connection.db.databaseName);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    // Don't exit process - allow app to run without DB for now
    console.log('⚠️  Application will continue without database...');
  }
};

module.exports = connectDB;
