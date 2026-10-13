const mongoose = require('mongoose');

let mongodInstance = null;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/agritech';

  // Configure public DNS resolution for MongoDB Atlas SRV records
  if (uri.startsWith('mongodb+srv://')) {
    try {
      const dns = require('dns');
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (dnsErr) {
      console.warn('DNS server configuration warning:', dnsErr.message);
    }
  }

  try {
    // Attempt standard connection with 6s timeout
    console.log(`Connecting to MongoDB at: ${uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 6000,
      dbName: 'agritech'
    });
    console.log(`✅ MongoDB Connected successfully to: ${mongoose.connection.host} (Database: ${mongoose.connection.name})`);
  } catch (err) {
    console.warn(`Could not connect to external MongoDB: ${err.message}`);

    if (
      err.message &&
      (err.message.includes('SSL alert number 80') ||
        err.message.includes('tlsv1 alert internal error') ||
        err.message.includes('whitelist') ||
        err.message.includes('Could not connect to any servers'))
    ) {
      console.warn(`\n============================================================`);
      console.warn(`⚠️  MONGODB ATLAS IP ACCESS LIST REQUIRED:`);
      console.warn(`Atlas rejected the connection (TLS/SSL alert 80).`);
      console.warn(`To allow this machine to connect directly:`);
      console.warn(`1. Log into https://cloud.mongodb.com`);
      console.warn(`2. Navigate to "Network Access" under Security`);
      console.warn(`3. Click "Add IP Address" -> choose "Allow Access From Anywhere" (0.0.0.0/0)`);
      console.warn(`   or add your current public IP address.`);
      console.warn(`============================================================\n`);
    }

    console.log('Attempting to initialize MongoMemoryServer fallback for zero-config local environment...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongodInstance.getUri();
      console.log(`Using In-Memory MongoDB Server at: ${inMemoryUri}`);
      
      await mongoose.connect(inMemoryUri);
      console.log('Connected to In-Memory MongoDB successfully.');
    } catch (fallbackErr) {
      console.error('Fatal: Failed to connect to MongoDB and could not start MongoMemoryServer.');
      console.error(fallbackErr);
      process.exit(1);
    }
  }
};

const closeDB = async () => {
  await mongoose.connection.close();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
};

module.exports = { connectDB, closeDB };
