const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Farm name is required'],
      trim: true,
      maxlength: [120, 'Farm name cannot exceed 120 characters']
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true
    },
    areaInAcres: {
      type: Number,
      required: [true, 'Area in acres is required'],
      min: [0.01, 'Area must be greater than 0']
    },
    soilType: {
      type: String,
      required: [true, 'Soil type is required'],
      enum: ['Alluvial', 'Black', 'Red', 'Laterite', 'Sandy', 'Clay', 'Loamy', 'Other'],
      default: 'Loamy'
    },
    waterSource: {
      type: String,
      required: [true, 'Water source is required'],
      enum: ['Rainfed', 'Borewell', 'Canal', 'Drip Irrigation', 'River', 'Other'],
      default: 'Borewell'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Farm', farmSchema);
