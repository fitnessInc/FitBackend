const express = require('express');
const router = express.Router();
const { connection, client } = require('../conectiondb/dbConnect')
const { ObjectId } = require('mongodb');
const {getIo} = require("../socket")



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
      const io = getIo();
      io.emit('newMessage', { id: message.insertedId, sender, recipient, content })
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
  const { id } = req.params;

   try {
     await connection();
     const db= client.db("testDB");
     const collection= db.collection('messages');
  
     const objectId= new ObjectId(id);
     const message= await collection.deleteOne({ _id: objectId });
     const io= getIo()
     if (message.deletedCount===1){
      io.emit('deleteContent',id)
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
  const {id}=req.params;
  const {NewContent} = req.body;


  try{
     await connection();
     const db=  client.db('testDB');
     const collection= db.collection('messages');
      
      const objectId = new ObjectId(id);
      const updatedocument  = await collection.updateOne({_id:objectId}, {$set:{content:NewContent}});
      const io = getIo();
      if (updatedocument.modifiedCount === 1) {
        // Emit the updated message
        io.emit('updateContent', { id, newContent: NewContent });
        return res.status(200).json({ message: 'Message successfully updated' });
      } else {
        return res.status(404).json({ error: 'Message not found' });
      }
      
        
  }catch (err) {
    res.status(500).json({ error: 'failed to update the  message' })
   }

})

module.exports = router
