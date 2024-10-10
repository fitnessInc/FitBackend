const express = require('express');
const router = express.Router();

  const app = express()
  app.use(express.json());

 let messages = [];


 router.route('/')
  .get((req,res,next)=>{
    res.json(messages)
  })
  .post((req,res,next)=>{
      const {sender,content}= req.body;
      const message = { id: messages.length + 1, sender, content };
      messages.push(message);
      res.status(201).json(message);
  });

  module.exports= router
