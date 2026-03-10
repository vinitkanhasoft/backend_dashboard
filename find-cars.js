const mongoose = require('mongoose');

async function findCars() {
  try {
    await mongoose.connect('mongodb://localhost:27017/auth-system');
    const Car = require('./src/models/Car').Car;
    
    const cars = await Car.find().limit(5);
    console.log('Found', cars.length, 'cars:');
    
    if (cars.length > 0) {
      console.log('\nAvailable Car IDs:');
      cars.forEach((car, index) => {
        console.log(`${index + 1}. ID: ${car._id}`);
        console.log(`   Title: ${car.title}`);
        console.log(`   Brand: ${car.brand}`);
        console.log(`   Model: ${car.carModel}`);
        console.log('---');
      });
    } else {
      console.log('\n❌ No cars found in database!');
      console.log('Please create some cars first using your car creation endpoints.');
    }
    
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

findCars();
