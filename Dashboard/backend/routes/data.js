const express = require('express');
const router = express.Router();
const NILMData = require('../models/NILMData');
const PVData = require('../models/PVData');

// @route   GET /api/data/nilm
// @desc    Get NILM data from database (with filtering options)
// @access  Public
router.get('/nilm', async (req, res) => {
  try {
    const { building, location, limit = 100, sort = -1, startTime, endTime } = req.query;
    
    console.log('NILM request params:', req.query); // Debug log
    
    // Build query
    const query = {};
    if (building) query.building = building;
    if (location) query.location = location;
    if (startTime || endTime) {
      query.timestamp = {};
      const parseTs = (v) => {
        if (v === undefined) return undefined;
        const n = Number(v);
        if (!Number.isNaN(n)) return new Date(n);
        const d = new Date(v);
        return isNaN(d.getTime()) ? undefined : d;
      };
      const start = parseTs(startTime);
      const end = parseTs(endTime);
      if (start) query.timestamp.$gte = start;
      if (end) query.timestamp.$lte = end;
    }
    
    console.log('NILM query:', query); // Debug log
    
    // Fetch data
    const sortOrder = parseInt(sort);
    let queryExec = NILMData.find(query).sort({ timestamp: sortOrder });
    const limitInt = parseInt(limit);
    if (!Number.isNaN(limitInt) && limitInt > 0) {
      queryExec = queryExec.limit(limitInt);
    } // limit <=0 means no cap
    const data = await queryExec;
    
    console.log(`Found ${data.length} NILM records for building: ${building}, location: ${location}`); // Debug log
    
    // If no data found, log available combinations
    if (data.length === 0) {
      const availableBuildings = await NILMData.distinct('building');
      const availableLocations = await NILMData.distinct('location');
      console.log('No data found. Available buildings:', availableBuildings);
      console.log('Available locations:', availableLocations);
    }
    
    res.json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    console.error('Error fetching NILM data:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching NILM data',
      message: error.message
    });
  }
});

// @route   GET /api/data/nilm/range
// @desc    Get min/max timestamp for NILM data (optionally filtered by building/location)
// @access  Public
router.get('/nilm/range', async (req, res) => {
  try {
    const { building, location } = req.query;
    const match = {};
    if (building) match.building = building;
    if (location) match.location = location;

    const pipeline = [];
    if (Object.keys(match).length > 0) {
      pipeline.push({ $match: match });
    }
    pipeline.push({
      $group: {
        _id: null,
        minDate: { $min: '$timestamp' },
        maxDate: { $max: '$timestamp' },
        count: { $sum: 1 }
      }
    });

    const stats = await NILMData.aggregate(pipeline);
    if (!stats.length) {
      return res.json({ success: true, count: 0, range: null });
    }
    res.json({
      success: true,
      count: stats[0].count,
      range: { minDate: stats[0].minDate, maxDate: stats[0].maxDate }
    });
  } catch (error) {
    console.error('Error fetching NILM range:', error);
    res.status(500).json({ success: false, error: 'Server error while fetching NILM range' });
  }
});

// @route   GET /api/data/nilm/latest
// @desc    Get latest NILM readings
// @access  Public
router.get('/nilm/latest', async (req, res) => {
  try {
    const { building, location } = req.query;
    
    const query = {};
    if (building) query.building = building;
    if (location) query.location = location;
    
    const data = await NILMData.findOne(query)
      .sort({ timestamp: -1 });
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error fetching latest NILM data:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching latest NILM data'
    });
  }
});

// @route   GET /api/data/pv
// @desc    Get PV data from database (with filtering options)
// @access  Public
router.get('/pv', async (req, res) => {
  try {
    const { limit = 100, sort = -1, startTime, endTime } = req.query;
    
    // Build query
    const query = {};
    if (startTime || endTime) {
      query.time = {};
      if (startTime) query.time.$gte = parseInt(startTime);
      if (endTime) query.time.$lte = parseInt(endTime);
    }
    
    // Fetch data
    const sortOrder = parseInt(sort);
    const data = await PVData.find(query)
      .sort({ time: sortOrder })
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      count: data.length,
      data: data
    });
  } catch (error) {
    console.error('Error fetching PV data:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching PV data',
      message: error.message
    });
  }
});

// @route   GET /api/data/pv/latest
// @desc    Get latest PV readings
// @access  Public
router.get('/pv/latest', async (req, res) => {
  try {
    const data = await PVData.findOne()
      .sort({ time: -1 });
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error fetching latest PV data:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching latest PV data'
    });
  }
});

// @route   GET /api/data/pv/random
// @desc    Get random PV record for testing
// @access  Public
router.get('/pv/random', async (req, res) => {
  try {
    const count = await PVData.countDocuments();
    const random = Math.floor(Math.random() * count);
    const data = await PVData.findOne().skip(random);
    
    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error fetching random PV data:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching random PV data'
    });
  }
});

// @route   GET /api/data/nilm/stats
// @desc    Get NILM statistics
// @access  Public
router.get('/nilm/stats', async (req, res) => {
  try {
    const stats = await NILMData.aggregate([
      {
        $group: {
          _id: { building: '$building', location: '$location' },
          count: { $sum: 1 },
          avgAggregate: { $avg: '$aggregate' },
          avgEVSE: { $avg: '$appliances.EVSE' },
          avgPV: { $avg: '$appliances.PV' },
          avgCS: { $avg: '$appliances.CS' },
          avgCHP: { $avg: '$appliances.CHP' },
          avgBA: { $avg: '$appliances.BA' }
        }
      }
    ]);
    
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    console.error('Error fetching NILM stats:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching NILM stats'
    });
  }
});

module.exports = router;
