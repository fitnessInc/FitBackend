const { MongoClient } = require('mongodb');
const express = require('express');



const app = express();
const port = 3000;
const uri = 'mongodb://localhost:27017/mydatabase';
const client = new MongoClient(uri,{

    useNewUrlParser: true,
    useUnifiedTopology: true,
    

});

 async function connection(){
    try{
       await client.connect();
       console.log('Connected to the database.');

    }catch (err){
        console.log(err)
    }
 }

 module.exports ={client,connection}