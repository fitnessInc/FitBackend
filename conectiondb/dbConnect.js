
const mongoose = require('mongoose');

class Datab {
  constructor() {
    this._setupEvents();
  }

  async connect() {
   
    const options = {
      serverSelectionTimeoutMS: 5000, // stop trying if server is unreachable
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
      w: 'majority',
    };

    // Prevent multiple connections
    if (mongoose.connection.readyState >= 1) {
      console.log('MongoDB already connected, skipping connect()');
      return;
    }

    try {
      await mongoose.connect(process.env.MONGODB_URI, options);
      console.log('MongoDB connected successfully');
    } catch (err) {
      console.error('MongoDB connection failed:', err.message);

      if (process.env.NODE_ENV === 'production') {
        // Fail fast in production
        process.exit(1);
      }
    }
  }

  _setupEvents() {
    mongoose.connection.on('connected', () => {
      console.log('📡 Mongoose connected');
    });

    mongoose.connection.on('error', (err) => {
      console.error(' Mongoose error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn(' Mongoose disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('🔄 Mongoose reconnected');
    });
  }

  async disconnect() {
    if (mongoose.connection.readyState === 0) {
      console.log('MongoDB already disconnected');
      return;
    }

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


