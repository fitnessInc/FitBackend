const express = require('express');
const router = express.Router();
const fs = require('fs');
const busboy = require('busboy');
const { Photo, Profile, User, Video } = require('../shemas/combine');
const {bucket} = require('../firebase/firebaseConfig');

const app = express()
app.use(express.json());

router.route('/:id')

.post(async(req,res)=>{
    

const  id  = (req.params.id || '').trim();

console.log("User ID:", id);

  const bb = busboy({ headers: req.headers });



  let metadata = {};
  bb.on('field', (fieldname, value) => {
    metadata[fieldname] = value;
  });

  bb.on('file', (fieldname, file, filename) => {
    if (!filename) {
      return res.status(400).json({ success: false, message: 'Filename is missing' });
    }

    const filePath = `metadata/${id}/${Date.now()}_${filename}`;
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

       
          const isPhoto = fieldname === 'photo'; 
          const metadataObject = isPhoto
            ? new Photo({
                user_id:id,
                title: metadata.title || '',
                url: fileUrl,
                caption: metadata.caption || '',
              })
            : new Video({
                user_id:id,
                title: metadata.title || filename,
                url: fileUrl,
                caption: metadata.caption || '',
              });

          await metadataObject.save();

          // Populate user with metadata
          const user = await User.findById(id);

          if (!user) {
            return res.status(404).json({
              success: false,
              message: 'User not found. Cannot associate metadata with user.',
            });
          }

          if (isPhoto) {
            user.photos_ids.push(metadataObject._id);
          } else {
            user.videos_ids.insertOne(metadataObject._id);
          }  

          await user.save();

          res.status(201).json({
            success: true,
            message: `${isPhoto ? 'Photo' : 'Video'} uploaded and saved successfully`,
            url: fileUrl,
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            message: 'Failed to save file metadata to MongoDB',
            error: error.message,
          });
        }
      })
      .on('error', (error) => {
        res.status(500).json({
          success: false,
          message: 'File upload failed',
          error: error.message,
        });
      });
  });

  bb.on('error', (error) => {
    res.status(500).json({
      success: false,
      message: 'Busboy error',
      error: error.message,
    });
  });

req.pipe(bb);



});


    module.exports = router;

