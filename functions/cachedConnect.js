





// cached hold the connection  to reuse across function invocation   in first invocation of the function dbConnect cached is null subsequent cached will
// will holde the first connection and reuse it in the others  calls dbconnect call  the same instance that's  holded ion cached wil be reused 
// let cached = null;


// the if condition check  if caches is null truthy then open a new connection 
// if cached hold a previous connection object (assigned later )  , it's truthy conntinue the second check 
// mongoose readyState is a  mongoose prop that indicates connnection status 
// async function dbConnection(uri) {
//     if (cached && mongoose.connection.readyState === 1) {
//         console.log(' using cached database connection ');
//         return cached;
//     }

//     //   the below code replace functions.config() in Gen2
//     const mongoUri = MONGODB_URI.value()
//     if (!mongoUri) {
//         throw new Error("mongodb Uri is not set ")
//     }
//     console.log('Creating new database connection');
//     const opts = {
//         serverSelectionTimeoutMS: 5000,
//         socketTimeoutMS: 45000,
//         maxPoolSize: 5,
//         minPoolSize: 1,
//     };

//     await mongoose.connect(mongoUri, opts);
//     cached = mongoose.connection;
//     return cached;



// };

const mongoose = require("mongoose");

let cachedConnection = null;

 async function dbConnection(uri) {

  if (!uri) {
    throw new Error('MongoDB URI is missing');
  }


  // if already connected then reuse oldconnection cachedConnection 
  if (cachedConnection) {
    return cachedConnection;
  }

  try {

    /*
      Create new mongoose connection if not 
    */
    const connection = await mongoose.connect(uri, {
      maxPoolSize: 10,
    });

    cachedConnection = connection;

    console.log('MongoDB connected');

    return connection;

  } catch (error) {

    console.error('MongoDB connection error:', error);

    throw error;
  }
}

module.exports = { dbConnection }



