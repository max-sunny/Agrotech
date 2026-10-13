const mongoose = require('mongoose');

const weatherDataSchema = new mongoose.Schema(
  {
    location: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true
    },
    displayName: {
      type: String,
      default: ''
    },
    date: {
      type: Date,
      default: Date.now,
      index: true
    },
    temperature: {
      type: Number,
      required: true
    },
    tempMin: {
      type: Number,
      default: 0
    },
    tempMax: {
      type: Number,
      default: 0
    },
    humidity: {
      type: Number,
      required: true
    },
    rainfall: {
      type: Number,
      default: 0
    },
    windSpeed: {
      type: Number,
      default: 0
    },
    condition: {
      type: String,
      default: 'Clear'
    },
    icon: {
      type: String,
      default: 'sun'
    },
    forecast: [
      {
        date: { type: Date, required: true },
        tempMin: { type: Number, required: true },
        tempMax: { type: Number, required: true },
        humidity: { type: Number, required: true },
        rainfall: { type: Number, default: 0 },
        condition: { type: String, default: 'Clear' },
        icon: { type: String, default: 'sun' }
      }
    ],
    pestAlert: [
      {
        id: { type: String },
        severity: {
          type: String,
          enum: ['low', 'medium', 'high'],
          required: true
        },
        title: { type: String, required: true },
        description: { type: String, required: true },
        recommendedAction: { type: String, required: true },
        createdAt: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Compound index for caching lookup
weatherDataSchema.index({ location: 1, date: -1 });

module.exports = mongoose.model('WeatherData', weatherDataSchema);
