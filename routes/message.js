const express = require('express');
const router = express.Router();
const { getIo } = require("../socket");
const Message = require('../schemas/messageSchema')




router.route('/')
  .get(async (req, res) => {
    const { recipient } = req.query

    try {
      const reciver = recipient ? { recipient } : {};
      const message = await Message.findOne(reciver)
      if (!message) {
       return  res.status(404).json({ error: 'Message not found' });
      }
      res.status(200).json(message)

    } catch (err) {
      console.log("error fetching message", err)
      res.status(500).json({ error: 'failed to fetch message' })
    }

  })
  .post(async (req, res,) => {

    const { sender, recipient, content } = req.body

    try {
      const message = await Message.create({ sender, recipient, content })
      const io = getIo();
      io.emit('newMessage', message)
      res.status(201).json(message);

    } catch (err) {
      console.error('Error inserting message:', err);
      res.status(500).json({ error: 'Failed to insert message' });
    }

  });


router.route('/:id')

  .get(async (req, res) => {
    const { id } = req.params

    try {

      const message = await Message.findById(id)
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
  .delete(async (req, res, ) => {
    const { id } = req.params;

    try {
      const message = await Message.findByIdAndDelete(id)

      if (!message) {
        return res.status(404).json({ error: 'Message not deleted' });
      }

      const io = getIo();
      io.emit('deleteContent', id);

      res.status(200).json({ message: 'Message successfully deleted' });



    } catch (err) {
      console.log("error deleting message", err)
      res.status(500).json({ error: 'failed to delete message' })
    }


  })


  .put(async (req, res) => {
    const { id } = req.params;
    const { NewContent } = req.body;


    try {

      const message = await Message.findByIdAndUpdate(
        id,
        { content: NewContent },
        { new: true }
      );
      if (!message) {
        return res.status(404).json({ error: 'Message not found' })
      }
      const io = getIo();
      io.emit('updateContent', {
        id: message._id.toStrin(),
        newContent: message.content,
      });

      res.status(200).json({ message: 'Message successfully updated' });

  }catch (err) {
    res.status(500).json({ error: 'failed to update the  message' })
  }

})

module.exports = router
