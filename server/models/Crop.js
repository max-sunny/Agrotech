const mongoose = require('mongoose');

const soilReportSchema = new mongoose.Schema(
  {
    pH: { type: Number, required: true },
    nitrogen: { type: Number, required: true },
    phosphorus: { type: Number, required: true },
    potassium: { type: Number, required: true },
    moisture: { type: Number, required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    rating: {
      type: String,
      enum: ['poor', 'fair', 'good', 'excellent'],
      required: true
    },
    recommendations: [{ type: String }],
    date: { type: Date, default: Date.now }
  },
  { _id: true }
);

const activityLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['irrigation', 'fertilizing', 'spraying', 'weeding', 'harvesting', 'other'],
      required: true
    },
    date: { type: Date, default: Date.now },
    notes: { type: String, default: '', trim: true }
  },
  { _id: true }
);

const cropSchema = new mongoose.Schema(
  {
    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true
    },
    variety: {
      type: String,
      trim: true,
      default: ''
    },
    sowingDate: {
      type: Date,
      required: [true, 'Sowing date is required']
    },
    expectedHarvest: {
      type: Date,
      required: [true, 'Expected harvest date is required']
    },
    status: {
      type: String,
      enum: ['planned', 'sown', 'growing', 'harvested'],
      default: 'sown'
    },
    soilReports: [soilReportSchema],
    activityLogs: [activityLogSchema]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Crop', cropSchema);
