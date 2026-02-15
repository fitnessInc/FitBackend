const express = require('express');
const router = require('express').Router()

const Photo = require('../schemas/photoShmas');
const User = require('../schemas/usersSchema');
const Video = require("../schemas/videoSchema")
const { bucket } = require('../firebase/firebaseConfig');



router.route('/profile/media')

    .post(async (req, res) => {

        try {

            // const userId = req.user.id;
            const userId = '670b31d45c1c769ac8163e68'
            const { mediaType, url, thumbnail, filePath, title, caption } = req.body;

            if (!mediaType || !['photo', 'video'].includes(mediaType)) {
                return res.status(400).json({ success: false, message: " not a media" })
            };

            if (!url || !filePath) {
                return res.status(400).json({ success: false, message: ' URL and filePath are required.' });
            };

            const fileType = mediaType === 'photo'
                ? new Photo({
                    user_id: userId,
                    url,
                    thumbnail: thumbnail || '',
                    filePath,
                    title: title || '',
                    caption: caption || ''

                })
                : new Video({
                    user_id: userId,
                    url,
                    thumbnail: thumbnail || '',
                    filePath,
                    title: title || '',
                    caption: caption || ''

                })

            await fileType.save();

            const userUpdate = mediaType === 'photo'
                ? { $push: { photos_ids: fileType._id } }
                : { $push: { videos_ids: fileType._id } }

            await User.findByIdAndUpdate(userId, userUpdate)

            return res.status(201).json({
                success: true,
                message: `${mediaType.charAt(0)} metadata saved successfully`,
                mediaId: fileType._id,
                url: fileType.url,
                thumbnail: fileType.thumbnail


            })



        } catch (error) {

            console.log('Failed to save media metadata:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to save media metadata',
                error: error.message
            });

        }
    });

router.route('/profile/media/:userId/:mediaId')


    .delete(async (req, res) => {

        const userId = '670b31d45c1c769ac8163e68';  
        const mediaId = req.params.mediaId;
        // const { userId, mediaId } = req.params;
        const { mediaType } = req.body;

        try {
            const user = await User.findById(userId);
            if (!user) {
                return console.log(` the fallowing user with the ID : ${userId}  dos not have access to delete`);

            };

            let metaDoc;// variable object  return from Db after deletion it contains all the field of the deleted 

            if (mediaType === "photo") {

                metaDoc = await Photo.findByIdAndDelete(mediaId);
                if (metaDoc) user.photos_ids.pull(metaDoc._id); // it pulls the ids in the array of Object  in User Schema and  persiste 
                // the change in the memory

            } else {
                metaDoc = await Video.findByIdAndDelete(mediaId);
                if (metaDoc) user.videos_ids.pull(metaDoc._id);
            };
            // deleting file  or object from the bucket firebase
            if (metaDoc) {
                const fileRef = bucket.file(metaDoc.filePath);
                await fileRef.delete();
            }

            await user.save();// we using save to persiste  the change in db 

            res.status(200).json({ success: true, message: `${mediaType} deleted` });
        } catch (error) {
            console.log(error);
            console.log(error.stack);
        }

    })

module.exports = router








