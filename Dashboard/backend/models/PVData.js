const mongoose = require('mongoose');

const PVDataSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true
  },
  time: {
    type: Number,
    required: true
  },
  P: {
    type: Number,
    required: true
  },
  Gb_i: {
    type: Number,
    required: true
  },
  Gd_i: {
    type: Number,
    required: true
  },
  T2m: {
    type: Number,
    required: true
  },
  Gt: {
    type: Number,
    required: true
  },
  // Additional calculated fields
  Irradiance: {
    type: Number
  },
  Temperature: {
    type: Number
  }
}, {
  timestamps: true
});

// Create index for efficient time-based queries
PVDataSchema.index({ time: 1 });
PVDataSchema.index({ timestamp: 1 });

module.exports = mongoose.model('PVData', PVDataSchema);
