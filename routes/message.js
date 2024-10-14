const express = require('express');
const router = express.Router();
const { connection, client } = require('../conectiondb/dbConnect')


const app = express()
app.use(express.json());

let messages = [];


router.route('/')
  .get(async (req, res, next) => {
    try {
      const db = await connection();
      const collection = db.collection('messages')
      // const { messageId } = req.params;
      // const message = await collection.findOne({ _id: new MongoClient.ObjectId(messageId) })
      const message = req.body
      const result = await collection.findOne(message)
      if (message) {
        res.status(200).json(message)
      } else {
        res.status(404).json({ error: 'Message not found' });
      }
    } catch (err) {
      console.log("error fetching message", err)
      res.status(500).json({ error: 'failed to fetch message' })

    }

  })
  .post(async (req, res, next) => {
    
    try {
      const db = await connection();
      const collection = db.collection('messages');
      const { sender, content } = req.body;
      const message = await collection.insertOne({sender,content, createdAt: new Date()})
      res.status(201).json({ id: message.insertedId, sender, content });

    }catch (err) {
      console.error('Error inserting message:', err);
      res.status(500).json({ error: 'Failed to insert message' });
  }
     
  });

module.exports = router
