// MongoDB Connection Diagnostic Script
require('dotenv/config');

console.log('🔍 MongoDB Connection Diagnostic');
console.log('================================\n');

// Check environment variables
console.log('📋 Environment Configuration:');
console.log(`MONGODB_URI: ${process.env.MONGODB_URI || 'Not set (using defaults)'}`);
console.log(`MONGODB_HOST: ${process.env.MONGODB_HOST || 'Not set'}`);
console.log(`MONGODB_PORT: ${process.env.MONGODB_PORT || 'Not set'}`);
console.log(`MONGODB_DATABASE: ${process.env.MONGODB_DATABASE || 'Not set'}`);
console.log(`MONGODB_USERNAME: ${process.env.MONGODB_USERNAME ? 'Set' : 'Not set'}`);
console.log(`MONGODB_PASSWORD: ${process.env.MONGODB_PASSWORD ? 'Set' : 'Not set'}`);

// Build connection URI
const uri = process.env.MONGODB_URI || 
  `${process.env.MONGODB_PROTOCOL || 'mongodb'}://${process.env.MONGODB_USERNAME ? process.env.MONGODB_USERNAME + ':' + (process.env.MONGODB_PASSWORD || '***') + '@' : ''}${process.env.MONGODB_HOST || 'localhost'}:${process.env.MONGODB_PORT || 27017}/${process.env.MONGODB_DATABASE || 'auth-system'}`;

console.log(`\n🔗 Connection URI: ${uri.replace(/\/\/.*@/, '//***:***@')}`);

// Test connection
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('\n🔄 Testing connection...');
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    
    console.log('✅ Connection successful!');
    
    // Get database info
    const db = mongoose.connection.db;
    console.log(`📊 Database: ${db.databaseName}`);
    
    const collections = await db.listCollections().toArray();
    console.log(`📁 Collections: ${collections.length} found`);
    
    if (collections.length > 0) {
      console.log('   Collections:', collections.map(c => c.name).join(', '));
    }
    
    await mongoose.disconnect();
    console.log('\n🎉 MongoDB is ready for your application!');
    
  } catch (error) {
    console.error('\n❌ Connection failed:', error.message);
    
    // Provide specific solutions
    console.log('\n💡 Possible solutions:');
    
    if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.log('   → Host not found. Check MONGODB_HOST');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('   → Connection refused. Check if MongoDB is running');
    } else if (error.message.includes('authentication') || error.message.includes('auth')) {
      console.log('   → Authentication failed. Check username/password');
    } else if (error.message.includes('timeout')) {
      console.log('   → Connection timeout. Check network/firewall');
    } else {
      console.log('   → General connection issue. Check all settings');
    }
    
    console.log('\n🔧 Quick fixes:');
    console.log('   1. For local MongoDB: Make sure "mongod" is running');
    console.log('   2. For MongoDB Atlas: Check IP whitelist and credentials');
    console.log('   3. Verify the database name exists');
    console.log('   4. Check network connectivity');
    
    process.exit(1);
  }
}

testConnection();
