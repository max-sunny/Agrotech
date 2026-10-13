const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const Resource = require('../models/Resource');
const Order = require('../models/Order');
const WeatherData = require('../models/WeatherData');
const Post = require('../models/Post');
const { analyzeSoil } = require('../utils/soilAnalyzer');
const { generatePestAlerts } = require('../utils/pestAnalyzer');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/agritech';

    if (mongoUri.startsWith('mongodb+srv://')) {
      try {
        const dns = require('dns');
        dns.setServers(['8.8.8.8', '1.1.1.1']);
      } catch (dnsErr) {
        console.warn('DNS server configuration warning:', dnsErr.message);
      }
    }

    console.log(`Connecting to MongoDB for seeding: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);
    await mongoose.connect(mongoUri);

    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Farm.deleteMany({}),
      Crop.deleteMany({}),
      Resource.deleteMany({}),
      Order.deleteMany({}),
      WeatherData.deleteMany({}),
      Post.deleteMany({})
    ]);

    console.log('Seeding Users...');
    const adminUser = await User.create({
      name: 'Dr. Ramesh Sharma (Admin)',
      email: 'admin@agritech.com',
      password: 'Admin@12345',
      role: 'admin',
      phone: '+91 98230 11223',
      language: 'en'
    });

    const farmerUser = await User.create({
      name: 'Baliram Patil',
      email: 'farmer@agritech.com',
      password: 'Farmer@12345',
      role: 'farmer',
      phone: '+91 94220 55441',
      language: 'en'
    });

    const secondFarmer = await User.create({
      name: 'Sunita Deshmukh',
      email: 'sunita@agritech.com',
      password: 'Farmer@12345',
      role: 'farmer',
      phone: '+91 98765 43210',
      language: 'mr'
    });

    console.log('Seeding Farms...');
    const farm1 = await Farm.create({
      owner: farmerUser._id,
      name: 'Green Valley Organic Farm',
      location: 'Pune',
      areaInAcres: 8.5,
      soilType: 'Black',
      waterSource: 'Drip Irrigation'
    });

    const farm2 = await Farm.create({
      owner: farmerUser._id,
      name: 'Krishna River Basin Farm',
      location: 'Kolhapur',
      areaInAcres: 12.0,
      soilType: 'Alluvial',
      waterSource: 'Canal'
    });

    const farm3 = await Farm.create({
      owner: secondFarmer._id,
      name: 'Sahyadri Agro Orchards',
      location: 'Nashik',
      areaInAcres: 5.2,
      soilType: 'Loamy',
      waterSource: 'Borewell'
    });

    console.log('Seeding Crops with Soil Reports & Activities...');
    // Crop 1: Wheat
    const wheatAnalysis = analyzeSoil({
      pH: 6.8,
      nitrogen: 340,
      phosphorus: 38,
      potassium: 220,
      moisture: 52
    });

    const crop1 = await Crop.create({
      farm: farm1._id,
      name: 'Sharbati Wheat (गेहूं)',
      variety: 'HD-2967 High Yield',
      sowingDate: new Date('2026-11-15'),
      expectedHarvest: new Date('2027-03-25'),
      status: 'growing',
      soilReports: [
        {
          pH: 6.8,
          nitrogen: 340,
          phosphorus: 38,
          potassium: 220,
          moisture: 52,
          score: wheatAnalysis.score,
          rating: wheatAnalysis.rating,
          recommendations: wheatAnalysis.recommendations,
          date: new Date('2026-11-10')
        },
        {
          pH: 6.7,
          nitrogen: 310,
          phosphorus: 34,
          potassium: 200,
          moisture: 48,
          score: 88,
          rating: 'excellent',
          recommendations: ['Maintain current irrigation interval; top dress with 20 kg urea before flowering.'],
          date: new Date('2026-12-05')
        }
      ],
      activityLogs: [
        {
          type: 'irrigation',
          date: new Date('2026-11-16'),
          notes: 'Initial germinating irrigation via drip line for 3 hours.'
        },
        {
          type: 'fertilizing',
          date: new Date('2026-11-28'),
          notes: 'Applied 50 kg DAP and basal bio-fertilizer Trichoderma.'
        },
        {
          type: 'weeding',
          date: new Date('2026-12-10'),
          notes: 'Manual inter-cultivation weeding performed.'
        }
      ]
    });

    // Crop 2: Sugarcane
    const sugarcaneAnalysis = analyzeSoil({
      pH: 7.2,
      nitrogen: 410,
      phosphorus: 45,
      potassium: 310,
      moisture: 65
    });

    const crop2 = await Crop.create({
      farm: farm2._id,
      name: 'Co-86032 Sugarcane (ऊस)',
      variety: 'Nira Wonder Seedlings',
      sowingDate: new Date('2026-08-10'),
      expectedHarvest: new Date('2027-08-20'),
      status: 'growing',
      soilReports: [
        {
          pH: 7.2,
          nitrogen: 410,
          phosphorus: 45,
          potassium: 310,
          moisture: 65,
          score: sugarcaneAnalysis.score,
          rating: sugarcaneAnalysis.rating,
          recommendations: sugarcaneAnalysis.recommendations,
          date: new Date('2026-08-05')
        }
      ],
      activityLogs: [
        {
          type: 'fertilizing',
          date: new Date('2026-08-12'),
          notes: 'Basal dose of FYM (10 tonnes/acre) incorporated.'
        },
        {
          type: 'spraying',
          date: new Date('2026-09-15'),
          notes: 'Chlorpyrifos soil drenching against termite prevention.'
        }
      ]
    });

    // Crop 3: Soybean
    const crop3 = await Crop.create({
      farm: farm1._id,
      name: 'Soybean (सोयाबीन)',
      variety: 'JS-335',
      sowingDate: new Date('2026-06-20'),
      expectedHarvest: new Date('2026-10-15'),
      status: 'harvested',
      soilReports: [],
      activityLogs: []
    });

    console.log('Seeding Resources (Store Catalog)...');
    const resources = await Resource.insertMany([
      {
        name: 'Organic Neem Seed Cake Fertilizer',
        category: 'fertilizers',
        price: 450,
        stock: 85,
        description: '100% organic neem cake rich in NPK and natural limonoids. Controls soil nematodes and white grubs while enriching humus.',
        image: 'https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?w=500&auto=format&fit=crop&q=60',
        unit: '25 kg bag'
      },
      {
        name: 'Hybrid Bt Cotton Seeds (Bollgard II)',
        category: 'seeds',
        price: 850,
        stock: 120,
        description: 'High-yielding bollworm resistant hybrid cotton seed packets with superior ginning outturn and drought tolerance.',
        image: 'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=500&auto=format&fit=crop&q=60',
        unit: '450 g packet'
      },
      {
        name: 'Bio-Fungicide Trichoderma Viride 1% WP',
        category: 'pesticides',
        price: 220,
        stock: 64,
        description: 'Beneficial antagonist fungus for seed treatment and soil application against root rot, damping-off, and wilt pathogens.',
        image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=500&auto=format&fit=crop&q=60',
        unit: '1 kg packet'
      },
      {
        name: 'Drip Irrigation Inline Lateral Pipe (16mm)',
        category: 'tools',
        price: 1850,
        stock: 35,
        description: 'Class-2 ISI certified UV stabilized dripper line with 40cm dripper spacing and 4 LPH uniform discharge rate.',
        image: 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=500&auto=format&fit=crop&q=60',
        unit: '400 m bundle'
      },
      {
        name: 'Water Soluble NPK 19-19-19 Fertigation Salt',
        category: 'fertilizers',
        price: 1200,
        stock: 45,
        description: 'Fully water soluble fertilizer ideal for fertigation and foliar spray during vegetative and flowering stages.',
        image: 'https://images.unsplash.com/photo-1585314062604-1a357de8b000?w=500&auto=format&fit=crop&q=60',
        unit: '25 kg bag'
      },
      {
        name: 'Yellow & Blue Sticky Insect Traps (Pack of 25)',
        category: 'tools',
        price: 320,
        stock: 90,
        description: 'Non-toxic, weatherproof sticky glue sheets for monitoring and controlling aphids, whiteflies, and thrips in greenhouses and open fields.',
        image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=500&auto=format&fit=crop&q=60',
        unit: 'Pack of 25'
      },
      {
        name: 'Certified Basmati Rice Seeds (Pusa 1121)',
        category: 'seeds',
        price: 650,
        stock: 70,
        description: 'Export quality aromatic extra-long slender basmati rice seed variety with high disease resistance.',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60',
        unit: '10 kg bag'
      },
      {
        name: 'Rechargeable 16L Battery Knapsack Sprayer',
        category: 'tools',
        price: 2400,
        stock: 18,
        description: '12V 8Ah heavy duty battery backpack sprayer with dual nozzle, speed controller, and stainless steel telescopic lance.',
        image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=500&auto=format&fit=crop&q=60',
        unit: '1 unit'
      }
    ]);

    console.log('Seeding Sample Orders...');
    await Order.create({
      user: farmerUser._id,
      items: [
        {
          resource: resources[0]._id,
          name: resources[0].name,
          qty: 2,
          price: resources[0].price
        },
        {
          resource: resources[2]._id,
          name: resources[2].name,
          qty: 3,
          price: resources[2].price
        }
      ],
      totalAmount: 2 * 450 + 3 * 220, // 1560
      address: {
        fullName: 'Baliram Patil',
        street: 'Patil Wada, Post Baramati',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '413102',
        phone: '+91 94220 55441'
      },
      status: 'approved'
    });

    await Order.create({
      user: farmerUser._id,
      items: [
        {
          resource: resources[1]._id,
          name: resources[1].name,
          qty: 4,
          price: resources[1].price
        }
      ],
      totalAmount: 4 * 850, // 3400
      address: {
        fullName: 'Baliram Patil',
        street: 'Patil Wada, Post Baramati',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '413102',
        phone: '+91 94220 55441'
      },
      status: 'pending'
    });

    console.log('Seeding Weather & Pest Alerts...');
    const puneAlerts = generatePestAlerts({
      temperature: 28.5,
      humidity: 82,
      rainfall: 8.5,
      windSpeed: 16
    });

    await WeatherData.create({
      location: 'pune',
      displayName: 'Pune',
      date: new Date(),
      temperature: 28.5,
      tempMin: 22.0,
      tempMax: 32.5,
      humidity: 82,
      rainfall: 8.5,
      windSpeed: 16.0,
      condition: 'Humid with Light Showers',
      icon: 'cloud-rain',
      forecast: [
        {
          date: new Date(Date.now() + 86400000),
          tempMin: 21,
          tempMax: 31,
          humidity: 78,
          rainfall: 4.2,
          condition: 'Partly Cloudy',
          icon: 'sun'
        },
        {
          date: new Date(Date.now() + 2 * 86400000),
          tempMin: 22,
          tempMax: 33,
          humidity: 74,
          rainfall: 1.0,
          condition: 'Clear Sky',
          icon: 'sun'
        },
        {
          date: new Date(Date.now() + 3 * 86400000),
          tempMin: 23,
          tempMax: 34,
          humidity: 69,
          rainfall: 0,
          condition: 'Sunny',
          icon: 'sun'
        },
        {
          date: new Date(Date.now() + 4 * 86400000),
          tempMin: 22,
          tempMax: 32,
          humidity: 75,
          rainfall: 3.5,
          condition: 'Scattered Showers',
          icon: 'cloud-rain'
        },
        {
          date: new Date(Date.now() + 5 * 86400000),
          tempMin: 20,
          tempMax: 30,
          humidity: 80,
          rainfall: 6.0,
          condition: 'Rain Showers',
          icon: 'cloud-rain'
        }
      ],
      pestAlert: puneAlerts
    });

    console.log('Seeding Community Forum Posts...');
    const post1 = await Post.create({
      author: farmerUser._id,
      title: 'Yellowing of lower leaves in Sharbati Wheat crop - what fertilizer is needed?',
      body: 'My wheat crop is 35 days old. Noticeable yellowing starting from the leaf tips towards the base in older lower leaves. We received heavy morning fog and dew last week. Is this nitrogen deficiency or fungal infection?',
      category: 'Ask an Expert',
      isExpertFlagged: true,
      replies: [
        {
          author: adminUser._id,
          body: 'Hello Baliram ji. The V-shaped yellowing starting at the tip of older leaves is a hallmark symptom of Nitrogen deficiency. Because of fog and cooler soil temperatures, soil microbial nitrogen mineralization slows down. Apply top dressing of 25-30 kg Urea per acre or spray 2% Urea solution (20g in 1 liter of water) mixed with zinc sulfate.',
          createdAt: new Date(Date.now() - 3600000)
        }
      ]
    });

    const post2 = await Post.create({
      author: secondFarmer._id,
      title: 'Best organic method to control whitefly in vegetable crops without chemicals?',
      body: 'Looking for proven organic methods to control whiteflies and aphids in tomato and chili plots. Chemical sprays are leaving residues.',
      category: 'Pests',
      isExpertFlagged: false,
      replies: [
        {
          author: farmerUser._id,
          body: 'Namaste Sunita ji. Installing yellow sticky traps at canopy level works wonders. Also spray 5ml pure cold-pressed neem oil (10,000 ppm) with 1ml liquid detergent per liter water every 7 days in late evening.',
          createdAt: new Date(Date.now() - 7200000)
        }
      ]
    });

    console.log('Seeding completed successfully!');
    console.log('Demo Credentials:');
    console.log('  Admin:  admin@agritech.com / Admin@12345');
    console.log('  Farmer: farmer@agritech.com / Farmer@12345');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDatabase();
