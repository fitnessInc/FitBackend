const express = require('express');
const router = express.Router();
const fs = require('fs');
const busboy = require('busboy');
// const { Photo, Profile, User, Video } = require('../schemas/combine');
const Photo = require('../schemas/photoSchemas');
const User = require('../schemas/usersSchema');
const Video = require("../schemas/videoSchema")
const { bucket } = require('../firebase/firebaseConfig');
const Profile = require('../schemas/profileSchema');
const checkCurrentUser= require('./checkCurrentUser');
const chekFbToken = require('./midFirebaseToken')



const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
const VIDEO_TYPES = ['video/mp4', 'video/quicktime'];

router.route('/me/media')
  .post(chekFbToken, checkCurrentUser, async (req, res) => {
    const userId = req.currentUser._id;
    const uid = req.firebaseUser.uid;

    // Check the profile exists before accepting any file
    const profile = await Profile.findOne({ user_id: userId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }

    const send = (status, body) => {
      if (!res.headersSent) res.status(status).json(body);
    };

    const bb = busboy({
      headers: req.headers,
      limits: { files: 1, fileSize: 100 * 1024 * 1024 }, // 100 MB
    });

    const metadata = {};
    let gotFile = false;

    bb.on('field', (name, value) => {
      metadata[name] = value;
    });

    bb.on('file', (fieldname, file, info) => {
      gotFile = true;
      const { filename, mimeType } = info;

      const isAvatar = fieldname === 'avatar';
      const isPhoto = fieldname === 'photo';
      const isVideo = fieldname === 'video';

      if (!filename || !(isAvatar || isPhoto || isVideo)) {
        file.resume();
        return send(400, { success: false, message: 'Invalid upload field' });
      }

      const allowed = isVideo ? VIDEO_TYPES : IMAGE_TYPES;
      if (!allowed.includes(mimeType)) {
        file.resume();
        return send(400, { success: false, message: 'Unsupported file type' });
      }

      const folder = isAvatar ? 'avatar' : isPhoto ? 'photos' : 'videos';
      const safeName = filename.replace(/[^\w.-]/g, '_');
      const filePath = `users/${uid}/${folder}/${Date.now()}_${safeName}`;
      const firebaseFile = bucket.file(filePath);

      let tooLarge = false;
      file.on('limit', () => {
        tooLarge = true;
      });

      file
        .pipe(firebaseFile.createWriteStream({
          metadata: { contentType: mimeType },
          resumable: false,
        }))
        .on('finish', async () => {
          try {
            if (tooLarge) {
              await firebaseFile.delete({ ignoreNotFound: true });
              return send(413, { success: false, message: 'File too large' });
            }

            await firebaseFile.makePublic();
            const fileUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

            if (isAvatar) {
              const oldPath = profile.avatar?.filePath;
              profile.avatar = { uri: fileUrl, filePath };
              await profile.save();
              if (oldPath) {
                bucket.file(oldPath).delete({ ignoreNotFound: true }).catch(() => {});
              }
              return send(201, { success: true, message: 'Avatar uploaded', url: fileUrl });
            }

            const media = isPhoto
              ? await Photo.create({
                  user_id: userId,
                  title: metadata.title || '',
                  caption: metadata.caption || '',
                  url: fileUrl,
                  filePath,
                })
              : await Video.create({
                  user_id: userId,
                  title: metadata.title || '',
                  description: metadata.description || metadata.caption || '',
                  url: fileUrl,
                  filePath,
                });

            profile.gallery.push(isPhoto ? { photo: media._id } : { video: media._id });
            await profile.save();

            send(201, {
              success: true,
              message: `${isPhoto ? 'Photo' : 'Video'} uploaded`,
              url: fileUrl,
              id: media._id,
            });
          } catch (error) {
            console.error('Upload save error:', error);
            send(500, { success: false, message: 'Failed to save upload' });
          }
        })
        .on('error', (error) => {
          console.error('Upload stream error:', error);
          send(500, { success: false, message: 'File upload failed' });
        });
    });

    bb.on('close', () => {
      if (!gotFile) send(400, { success: false, message: 'No file uploaded' });
    });

    bb.on('error', (error) => {
      console.error('Busboy error:', error);
      send(500, { success: false, message: 'Upload error' });
    });

    req.pipe(bb);
  });

const MEDIA = { photo: Photo, video: Video };

router.route('/me/media/:type/:mediaId')
  .delete(chekFbToken, checkCurrentUser, async (req, res) => {
    const { type } = req.params;
    const mediaId = req.params.mediaId.trim();
    const Model = MEDIA[type];

    if (!Model) {
      return res.status(400).json({ success: false, message: 'Type must be photo or video' });
    }
    if (!mongoose.isValidObjectId(mediaId)) {
      return res.status(400).json({ success: false, message: 'Invalid media id' });
    }

    try {
      // Ownership check: the item must be in THIS user's gallery
      const profile = await Profile.findOne({
        user_id: req.currentUser._id,
        [`gallery.${type}`]: mediaId,
      });
      if (!profile) {
        return res.status(403).json({ success: false, message: 'Not allowed' });
      }

      const media = await Model.findById(mediaId);
      if (media) {
        const paths = [media.filePath, media.thumbnailPath].filter(Boolean);
        await Promise.all(
          paths.map((p) => bucket.file(p).delete({ ignoreNotFound: true }))
        );
      }

      await Profile.updateOne(
        { _id: profile._id },
        { $pull: { gallery: { [type]: mediaId } } }
      );
      await Model.findByIdAndDelete(mediaId);

      res.json({ success: true, message: `${type} deleted` });
    } catch (error) {
      console.error('Delete media error:', error);
      res.status(500).json({ success: false, message: 'Failed to delete' });
    }
  });



module.exports = router;

