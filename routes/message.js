const express = require('express');
const router = express.Router();
const { connection, client } = require('../conectiondb/dbConnect')
const { ObjectId } = require('mongodb');


const app = express()
app.use(express.json());

router.route('/')
  .get(async (req,res) => {
    const {recipient} = req.query

    try {
   
        await connection();
        const db = client.db('testDB')
      const collection =  db.collection('messages');
      const data = recipient? {recipient}:{}
      const message = await collection.findOne(data);
      if (message) {
        res.status(200).json(message)
      } else {
        res.status(404).json({ error: 'Message not found' });
                     
     } 

     }catch (err) {
      console.log("error fetching message", err)
      res.status(500).json({ error: 'failed to fetch message' })
    }
    
  })
  .post(async (req, res, next) => {
    
    try {
       await  connection();
       const db = client.db('testDB')
      const collection = db.collection('messages');
      const { sender,recipient, content } = req.body;
      const message = await collection.insertOne({sender,recipient,content, createdAt: new Date()})
      res.status(201).json({ id: message.insertedId, sender, content });

    }catch (err) {
      console.error('Error inserting message:', err);
      res.status(500).json({ error: 'Failed to insert message' });
  }
     
  });


router.route('/:id')

.get(async (req,res ) => {
  const {id}= req.params

  try {
    
      await connection();
      const db = client.db('testDB')
    const collection =  db.collection('messages');
    const objectId= new ObjectId(id);
    const message = await collection.findOne({_id:objectId});
    if (message) {
      res.status(200).json(message)
    } else {
      res.status(404).json({ error: 'Message not found' });
                   
   } 

   }catch (err) {
    console.log("error fetching message", err)
    res.status(500).json({ error: 'failed to fetch message' })
  }
  
})
.delete(async(req,res,next)=>{

   try {
     await connection();
     const db= client.db("testDB");
     const collection= db.collection('messages');
     const  {id} = req.params
     const objectId= new ObjectId(id);
     const message= await collection.deleteOne({ _id: objectId });
     if (message.deletedCount===1){
       res.status(200).json({message:"message succefully deleted"})
     }else{
      res.status(404).json({error:'message  is not deleted ',err})

     }

   }catch (err) {
    console.log("error deleting message", err)
    res.status(500).json({ error: 'failed to delete message' })
   }

})
.put(async(req,res)=>{

  try{
     await connection();
     const db=  client.db('tstDB');
     const collection= db.collection('messages');
      const {id}=req.params;
      const {NewContent} = req.body;
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid message ID' });
      };
      const objectId = new ObjectId(id);
      const object= {_id:objectId}
      const updateDocument= {
        $set:{
          content:NewContent
        }
      } 
      const message = await collection.updateOne(object,updateDocument);
      if (message.matchedCount === 0) {
        return res.status(404).json({ error: 'Message not found' });
      }
  
      if (message.modifiedCount === 1) {
        return res.status(200).json({ message: 'Message successfully updated' });
      } else {
        return res.status(200).json({ message: 'No changes made to the message' });
      }
        
  }catch (err) {
    res.status(500).json({ error: 'failed to update the  message' })
   }

})

module.exports = router
