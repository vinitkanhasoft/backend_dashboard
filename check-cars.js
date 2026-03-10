const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/auth-system')
  .then(() => {
    const Car = require('./src/models/Car').Car;
    
    Car.find().limit(5)
      .then(cars => {
        console.log('Found', cars.length, 'cars:');
        cars.forEach((car, index) => {
          console.log(`${index + 1}. ID: ${car._id}, Title: ${car.title}, Brand: ${car.brand}, Model: ${car.carModel}`);
        });
        
        if (cars.length === 0) {
          console.log('No cars found in database. You need to create some cars first.');
        }
        
        process.exit(0);
      })
      .catch(err => {
        console.error('Error finding cars:', err);
        process.exit(1);
      });
  })
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });
