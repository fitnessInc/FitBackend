const { MongoClient } = require('mongodb');
const express = require('express');


const uri = 'mongodb://localhost:27017/testDB';
// const app = express();
// const port = 3000;

const client = new MongoClient(uri,{

    useNewUrlParser: true,
    useUnifiedTopology: true,
    

});

 async function connection(){
    try{
       await client.connect();
       console.log('Connected to the database.');

    }catch (err){
        console.error('Failed to connect to the database', err);
        process.exit(1);
    }
 }

 module.exports ={client,connection}