const mongoose = require('mongoose');

// Disable buffering so queries fail immediately or fallback to memory instead of hanging 10 seconds
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/Excel_analysis';
  try {
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 3000, // Timeout fast after 3 seconds instead of hanging
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.warn(`💡 Tip: If you do not have local MongoDB running on 127.0.0.1:27017:`);
    console.warn(`   1. Start your local MongoDB server: net start MongoDB (or run mongod)`);
    console.warn(`   2. Or set a free MongoDB Atlas connection string in backend/.env:`);
    console.warn(`      MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/Excel_analysis`);
    console.warn(`   ✨ The analyzer will continue running with in-memory caching for live analysis.`);
    return null;
  }
};

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

module.exports = connectDB;
module.exports.isDbConnected = isDbConnected;
