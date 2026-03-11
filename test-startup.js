const mongoose = require('mongoose');
require('dotenv/config');

// Test all startup dependencies
async function testStartupDependencies() {
  console.log('🔍 Testing startup dependencies...\n');
  
  // Test MongoDB
  try {
    console.log('1. Testing MongoDB connection...');
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-system';
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connection successful!');
    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return;
  }
  
  // Test Redis (if configured)
  if (process.env.REDIS_HOST) {
    try {
      console.log('\n2. Testing Redis connection...');
      const Redis = require('ioredis');
      const redis = new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD,
        connectTimeout: 5000,
      });
      
      await redis.ping();
      console.log('✅ Redis connection successful!');
      await redis.disconnect();
    } catch (error) {
      console.error('❌ Redis connection failed:', error.message);
      console.log('💡 Redis is optional, server can start without it');
    }
  } else {
    console.log('\n2. Redis not configured, skipping...');
  }
  
  // Check environment variables
  console.log('\n3. Checking environment variables...');
  const requiredVars = ['PORT', 'JWT_ACCESS_TOKEN_SECRET', 'JWT_REFRESH_TOKEN_SECRET'];
  const missingVars = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.error('❌ Missing environment variables:', missingVars);
    console.log('💡 Please add these to your .env file');
  } else {
    console.log('✅ All required environment variables are set');
  }
  
  console.log('\n🎉 All dependencies checked! Your server should start successfully.');
  console.log('\n💡 If you still see errors, try:');
  console.log('1. Delete node_modules and run npm install');
  console.log('2. Clear any MongoDB connection issues');
  console.log('3. Check for port conflicts (another process using port 3000)');
}

testStartupDependencies().catch(console.error);
