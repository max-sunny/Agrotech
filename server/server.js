const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration (PRD Section 13.6)
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoints
app.get(['/api/health', '/health', '/'], (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Agri-Tech API server is healthy',
    timestamp: new Date().toISOString()
  });
});

// Route imports
const authRoutes = require('./routes/authRoutes');
const farmRoutes = require('./routes/farmRoutes');
const cropRoutes = require('./routes/cropRoutes');
const soilRoutes = require('./routes/soilRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const orderRoutes = require('./routes/orderRoutes');
const forumRoutes = require('./routes/forumRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Mount routes (PRD Section 11)
app.use('/api/auth', authRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/soil', soilRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/alerts', weatherRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/posts', forumRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found`
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Start server
const startServer = async () => {
  await connectDB();

  // Seed resource catalog only if catalog is empty
  const Resource = require('./models/Resource');
  const resourceCount = await Resource.countDocuments();
  if (resourceCount === 0) {
    try {
      await Resource.insertMany([
        {
          name: 'Organic Neem Seed Cake Fertilizer',
          category: 'fertilizers',
          price: 450,
          stock: 85,
          description: '100% organic neem cake rich in NPK and natural limonoids. Controls soil nematodes and white grubs.',
          image: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=500&auto=format&fit=crop&q=60',
          unit: '25 kg bag'
        },
        {
          name: 'Hybrid Bt Cotton Seeds (Bollgard II)',
          category: 'seeds',
          price: 850,
          stock: 120,
          description: 'High-yielding bollworm resistant hybrid cotton seed packets with superior ginning outturn.',
          image: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=500&auto=format&fit=crop&q=60',
          unit: '450 g packet'
        },
        {
          name: 'Bio-Fungicide Trichoderma Viride 1% WP',
          category: 'pesticides',
          price: 220,
          stock: 64,
          description: 'Beneficial antagonist fungus for seed treatment against root rot, damping-off, and wilt.',
          image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=500&auto=format&fit=crop&q=60',
          unit: '1 kg packet'
        },
        {
          name: 'Drip Irrigation Inline Lateral Pipe (16mm)',
          category: 'tools',
          price: 1850,
          stock: 35,
          description: 'Class-2 ISI certified UV stabilized dripper line with 40cm dripper spacing.',
          image: 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=500&auto=format&fit=crop&q=60',
          unit: '400 m bundle'
        },
        {
          name: 'Water Soluble NPK 19-19-19 Fertigation Salt',
          category: 'fertilizers',
          price: 1200,
          stock: 45,
          description: 'Fully water soluble fertilizer ideal for fertigation during vegetative and flowering stages.',
          image: 'https://images.unsplash.com/photo-1585314062604-1a357de8b000?w=500&auto=format&fit=crop&q=60',
          unit: '25 kg bag'
        },
        {
          name: 'Yellow Sticky Insect Traps (Pack of 25)',
          category: 'tools',
          price: 320,
          stock: 90,
          description: 'Non-toxic, weatherproof sticky glue sheets for controlling aphids, whiteflies, and thrips.',
          image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60',
          unit: 'Pack of 25'
        }
      ]);
      console.log('Agricultural resource catalog initialized.');
    } catch (catErr) {
      console.warn('Catalog initialization notice:', catErr.message);
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 Agri-Tech Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
};

startServer();

module.exports = app;
