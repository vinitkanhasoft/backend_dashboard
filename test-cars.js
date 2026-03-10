const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/auth-system')
  .then(async () => {
    const Car = require('./src/models/Car').Car;
    
    try {
      const cars = await Car.find().limit(10);
      
      if (cars.length > 0) {
        console.log('\n✅ Available Car IDs for testimonials:');
        console.log('='.repeat(50));
        
        cars.forEach((car, index) => {
          console.log(`${index + 1}. ID: ${car._id}`);
          console.log(`   Title: ${car.title}`);
          console.log(`   Brand: ${car.brand}`);
          console.log(`   Model: ${car.carModel}`);
          console.log(`   Year: ${car.year}`);
          console.log('---');
        });
        
        console.log('\n📝 Use any of these IDs in your testimonial creation:');
        console.log('Example: "carId": "' + cars[0]._id + '"');
        
      } else {
        console.log('\n❌ No cars found in database!');
        console.log('Please create some cars first using your car creation endpoints.');
        console.log('Or create testimonials without carId.');
      }
      
      mongoose.connection.close();
      process.exit(0);
      
    } catch (error) {
      console.error('Error finding cars:', error);
      mongoose.connection.close();
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
