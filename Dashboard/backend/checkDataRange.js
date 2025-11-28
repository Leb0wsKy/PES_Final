const mongoose = require('mongoose');

// Define schema inline to ensure correct collection name
const nilmSchema = new mongoose.Schema({
  timestamp: Date,
  aggregate: Number,
  building: String,
  location: String
}, { strict: false, collection: 'nilmdatas' });

const NILMData = mongoose.model('NILMData', nilmSchema);

mongoose.connect('mongodb://localhost:27017/energy_dashboard')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Get overall stats
    const stats = await NILMData.aggregate([
      {
        $group: {
          _id: null,
          minDate: { $min: '$timestamp' },
          maxDate: { $max: '$timestamp' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    if (stats.length > 0) {
      const minDate = new Date(stats[0].minDate);
      const maxDate = new Date(stats[0].maxDate);
      const days = (maxDate - minDate) / (1000 * 60 * 60 * 24);
      
      console.log('\n=== NILM Data Range ===');
      console.log('Total records:', stats[0].count.toLocaleString());
      console.log('Earliest timestamp:', minDate.toLocaleString());
      console.log('Latest timestamp:', maxDate.toLocaleString());
      console.log('Days of data:', days.toFixed(2));
      console.log('Approximately:', (days * 24).toFixed(1), 'hours');
    }
    
    // Get stats per building/location
    const breakdown = await NILMData.aggregate([
      {
        $group: {
          _id: { building: '$building', location: '$location' },
          count: { $sum: 1 },
          minDate: { $min: '$timestamp' },
          maxDate: { $max: '$timestamp' }
        }
      },
      { $sort: { '_id.building': 1, '_id.location': 1 } }
    ]);
    
    console.log('\n=== Data by Building & Location ===');
    breakdown.forEach(item => {
      const days = (new Date(item.maxDate) - new Date(item.minDate)) / (1000 * 60 * 60 * 24);
      console.log(`${item._id.building} - ${item._id.location}: ${item.count.toLocaleString()} records (${days.toFixed(2)} days)`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
