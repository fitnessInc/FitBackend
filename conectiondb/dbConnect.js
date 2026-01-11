require('dotenv').config();


const mongoose = require('mongoose');

class Datab {
  constructor() {
    this._setupEvents();
  }

  async connect() {
    const options = {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      w: 'majority',
    };

    try {
      await mongoose.connect(process.env.MONGODB_URI, options);
      console.log('✅ MongoDB connected successfully');
    } catch (err) {
      console.error('❌ MongoDB connection failed:', err.message);

      // Fail fast in production misconfig
      if (process.env.NODE_ENV === 'production') {
        process.exit(1);
      }

      setTimeout(() => this.connect(), 5000);
    }
  }

  _setupEvents() {
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('❌ Mongoose error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ Mongoose disconnected');
    });
  }

  async disconnect() {
    try {
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
    } catch (err) {
      console.error('Error closing DB:', err);
    }
  }

  getNativeDb() {
    return mongoose.connection.db;
  }

  getNativeClient() {
    return mongoose.connection.getClient();
  }
}

module.exports = new Datab();
