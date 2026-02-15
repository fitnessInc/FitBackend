const express = require('express');
const router = express.Router();
const fs = require('fs');
const busboy = require('busboy');
// const { Photo, Profile, User, Video } = require('../schemas/combine');
const Photo = require('../schemas/photoShmas');
const User = require('../schemas/usersSchema');
const Video = require("../schemas/videoSchema")
const {bucket} = require('../firebase/firebaseConfig');


router.route('/user/:id')

.post(async(req,res)=>{
    

const  id  = (req.params.id || '').trim();// .trim() revoving space  in the string

console.log("User ID:", id);

  const bb = busboy({ headers: req.headers });// it tells busboy how the body is formatted 



  let metadata = {};// a holder container of  extracted form-field tha is used later with the file 
  bb.on('field', (fieldname, value) => {
    metadata[fieldname] = value;
  });

  bb.on('file', (fieldname, file, filename) => {
    if (!filename) {
      return res.status(400).json({ success: false, message: 'Filename is missing' });
    }

    const filePath = `metadata/${id}/${Date.now()}_${filename}`;// creating a file-path
    const firebaseFile = bucket.file(filePath);// initiatting the file-path in  firebase  via bucket

    // the bellow file.pipe streaming   file  chunk parse from  the request to firebase   and the  finish is call  or process after the  piping process then  make it  public access and inserting in mongodb 

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
                filePath: filePath,
              })
            : new Video({
                user_id:id,
                title: metadata.title || filename,
                url: fileUrl,
                caption: metadata.caption || '',
                filePath: filePath,
              });

          await metadataObject.save();

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

router.route('/:user_id/:id')
.delete(async (req, res) => {
    try {
        
        const user_id = req.params.user_id; // user_id is in the URL, not the body
        const { type } = req.body; // type should be in the body
        const id = (req.params.id || '').trim(); // ID of the photo/video to delete

        // Validate that user_id is passed
        if (!user_id) {
            return res.status(400).json({
                success: false,
                message: 'user_id is required and cannot be undefined.',
            });
        }

        // Validate the type (photo or video)
        if (!type || (type !== 'photo' && type !== 'video')) {
            return res.status(400).json({
                success: false,
                message: 'Invalid type. It should be either "photo" or "video".',
            });
        }

        // Find the user by user_id
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(400).json({
                success: false,
                message: `User with user_id ${user_id} does not exist`,
            });
        }

        // Handle the deletion based on the type (photo or video)
        let metadataObject;
        if (type === 'photo') {
            metadataObject = await Photo.findByIdAndDelete(id);
            if (!metadataObject) {
                return res.status(404).json({
                    success: false,
                    message: 'Photo not found in database',
                });
            }
            user.photos_ids.pull(metadataObject._id);
        } else if (type === 'video') {
            metadataObject = await Video.findByIdAndDelete(id);
            if (!metadataObject) {
                return res.status(404).json({
                    success: false,
                    message: 'Video not found in database',
                });
            }
            user.videos_ids.pull(metadataObject._id);
        }

        // Delete the file from Firebase Storage
        // const filePath = `metadata/${metadataObject.user_id}/${metadataObject._id}}`;
        // const fileRef = bucket.file(filePath);
        // await fileRef.delete();
        const fileRef = bucket.file(metadataObject.filePath);
        await fileRef.delete();

        // Save the updated user document
        await user.save();

        // Send success response
        res.status(200).json({
            success: true,
            message: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete file and metadata',
            error: error.message,
        });
    }
});


    module.exports = router;

