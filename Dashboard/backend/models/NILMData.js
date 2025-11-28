const mongoose = require('mongoose');

const NILMDataSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    required: true
  },
  aggregate: {
    type: Number,
    required: true
  },
  appliances: {
    EVSE: { type: Number, default: 0 },
    PV: { type: Number, default: 0 },
    CS: { type: Number, default: 0 },
    CHP: { type: Number, default: 0 },
    BA: { type: Number, default: 0 }
  },
  building: {
    type: String,
    enum: ['Dealer', 'Logistic', 'Office'],
    required: true
  },
  location: {
    type: String,
    enum: ['LA', 'Offenbach', 'Tokyo'],
    required: true
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
NILMDataSchema.index({ building: 1, location: 1, timestamp: 1 });

module.exports = mongoose.model('NILMData', NILMDataSchema);
