const express = require('express');
const router = express.Router();
const uploadFile = require('../firebase/firebaseUtils');
const path=require('path');
const fs = require('fs');
const busboy = require('busboy');
const { Photo, Profile, User, Video } = require('../shemas/combine');
const {bucket} = require('../firebase/firebaseConfig');




const app = express()
app.use(express.json());

router.route('/:user_id')

.post(async(req,res)=>{
    
     const{user_id}=req.params;
  const bb = busboy({ headers: req.headers });
  if (!user_id) {
    return res.status(400).json({ success: false, message: 'user_id is required' });
  }



let metadata={};
bb.on('field', (fieldname, value) => {
 
    metadata[fieldname] = value;
  });

  bb.on('file', (fieldname, file,filename) => {
    if (!filename) {
      return res.status(400).json({ success: false, message: 'Filename is missing' });
    }


const filePath = `metadata/${user_id}/${Date.now()}_${filename}`
    const firebaseFile = bucket.file(filePath);

    file.pipe(
        firebaseFile.createWriteStream({
          metadata: {
            contentType: file.mimetype,
          },
          resumable: false,
        })
      )

.on('finish', async () => {
    try {
      await firebaseFile.makePublic();
      const fileUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

      // Determine whether this is a photo or video based on `fieldname` or metadata
      const isPhoto = fieldname === 'photo'; // Adjust this condition based on your form data

      if (isPhoto) {
        // Create and save a Photo document
        const newPhoto = new Photo({
          user_id,
          title: metadata.title || '',
          url: fileUrl,
          caption: metadata.caption || '',
        });
        await newPhoto.save();
      } else {
        // Create and save a Video document
        const newVideo = new Video({
          user_id,
          title: metadata.title || filename,
          url: fileUrl,
          caption: metadata.caption || '',
        });
        await newVideo.save();
      }

      res.status(201).json({ success: true, message: 'File uploaded and saved to MongoDB successfully', url: fileUrl });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Failed to save file metadata to MongoDB', error: error.message });
    }
  })
  .on('error', (error) => {
    res.status(500).json({ success: false, message: 'File upload failed', error: error.message });
  });
});

bb.on('error', (error) => {
res.status(500).json({ success: false, message: 'Busboy error', error: error.message });
});

req.pipe(bb);



});


    module.exports = router;

