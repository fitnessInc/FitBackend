const express = require('express');
const router = express.Router();
const Profile = require('../schemas/profileSchema');
const Photo = require('../schemas/photoSchemas');
const Video = require('../schemas/videoSchema');




// GET /profile/:id/gallery
router.route('/profile/:id/gallery')
  .get(async (req, res) => {
    const profileId = req.params.id;

    try {
      // 1. Get profile (without populating – we'll fetch manually for clarity)
      const profile = await Profile.findById(profileId);
      if (!profile) {
        return res.status(404).json({ success: false, message: 'Profile not found' });
      }

      // 2. Separate photo and video IDs
      const photoIds = [];
      const videoIds = [];
      // using for to loop in to  the profile find by id  above  the first operation 
      for (const item of profile.gallery) {
        if (item.photo) photoIds.push(item.photo);
        if (item.video) videoIds.push(item.video);
      }

      // 3. Fetch all documents in parallel using promise.all  in order to querry concurently  
      const [photos, videos] = await Promise.all([
        Photo.find({ _id: { $in: photoIds } }),
        Video.find({ _id: { $in: videoIds } })
      ]);

      // 4. Build lookup maps
      const photoMap = new Map(photos.map(p => [p._id.toString(), p]));
      const videoMap = new Map(videos.map(v => [v._id.toString(), v]));

      // 5. Build thumbnails array (preserving gallery order)
      const thumbnails = profile.gallery.map(item => {
        if (item.photo) {
          const photo = photoMap.get(item.photo.toString());
          // ✅ Ternary: if photo exists, return its URL; otherwise null
          return photo ? photo.url : null;
        }
        if (item.video) {
          const video = videoMap.get(item.video.toString());
          // ✅ Ternary: if video exists, return its thumbnail; otherwise null
          return video ? video.thumbnail : null;
        }
        return null;
      }).filter(url => url !== null); // remove any null entries

      res.status(200).json({ success: true, thumbnails });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

module.exports = router;