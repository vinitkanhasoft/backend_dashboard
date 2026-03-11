const mongoose = require('mongoose');

// Test MongoDB connection
async function testConnection() {
  try {
    // Try to connect with your current configuration
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/auth-system';
    
    console.log('Testing MongoDB connection with URI:', uri.replace(/\/\/.*@/, '//***:***@'));
    
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connection successful!');
    
    // Test basic operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📁 Available collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Disconnected successfully');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('\n💡 Possible solutions:');
    console.log('1. Make sure MongoDB is running locally or update MONGODB_URI in .env');
    console.log('2. Check if your MongoDB Atlas credentials are correct');
    console.log('3. Verify network connectivity to MongoDB server');
    console.log('4. Check if MongoDB is accessible from your IP (whitelisted for Atlas)');
    
    process.exit(1);
  }
}

testConnection();
