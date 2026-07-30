const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// const { Photo, Profile, User, Video }= require('../schemas/combine');
const User = require('../schemas/usersSchema');
const Profile = require("../schemas/profileSchema");
const Photo= require('../schemas/photoSchemas');
const Video= require('../schemas/videoSchema')

const { body, validationResult } = require('express-validator');
const { error } = require('node:console');



router.route('/profile/:userId')

    .get(async (req, res) => {

        const { userId } = req.params


        try {
            const profile = await Profile.findById({ user_id: userId });
            if (!profile) {
                res.status(404).json({ error: 'profile not found ' })
            }

            res.json({
                success: true,
                data: {
                    id: user_Id,
                    firstName: profile.FirstName,
                    LastName: profile.LastName,
                    Profession: profile.Profession,
                    Certificate: profile.Certificate

                }

            })


        } catch (err) {
            console.log('profile does not exist therefore we can display it', err);
            res.status(500).json({ err: "faild to fetch  Pro screen " })
        }

    });

router.route("/profiles/:id")

    .get(async (req, res) => {

        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: 'Invalid user ID' });
        }

        try {
            if (!id) {
                res.status(400).json({ error: ' profile is required' });
            }

            const profile = await Profile
                .findById(id)
                .populate('avatar')
                .populate('gallery.media')

            if (!profile) {
                return res.status(404).json({ error: 'profile not found' });

            }
            return res.status(200).json(profile)
        } catch (error) {
            console.log('profiole does not existe', error);
            res.status(500).json({ error: 'faild to fetch the profile' })
        }

    })


    .post(async (req, res) => {

        const { id } = req.params;
        const { first_name, last_name, certification, avatar, gallery } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: 'Invalid user ID' });
        }

        try {

            const yesProfile = await Profile.findOne({ user_id: id })
            if (yesProfile) {
                return res.status(400).json({ error: 'profile exite ' })
            }



            const profile = await Profile.create({
                user_id: id,
                first_name,
                last_name,
                certification,
                avatar,
                gallery



            })



            res.status(201).json({ msg: 'Profile created successfully', profile });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ msg: 'Server Error' });
        }


    })

    .put(async (req, res) => {

        const { id } = req.params;
        const data = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: 'Invalid user ID' });
        };

        try {
            const profile = await Profile.findOne({ user_id: id })

            if (!profile) {
                return res.status(400).json({ error: 'no profile , therfore no update' })
            }

            const updatePro = await Profile.findOneAndUpdate(

                { user_id: id },
                { $set: data },
                { new: true }

            )

            if (!updatePro) {
                return res.status(400).json({ error: 'no :( fiald to update' })
            }
            return res.status(200).json({ msg: ' Yes! :) profile updated ', profile: updatePro })


        } catch (err) {
            console.error('faild to update :( ', err)
            return res.status(500).json({ err: 'Server bugs ' })
        }
        e

    })
    .delete(async (req, res) => {

        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: 'Invalid user ID' });
        };

        try {

            const profile = await Profile.findOneAndDelete({ user_id: id });
            if (!profile) {
                return res.status(404).json({ msg: 'there is no profile to delete' })
            }

            return res.status(200).json({ msg: 'YUP! Profile is deleted', Pro: profile })



        } catch (err) {
            console.error(" faild to delete Profile", err);
            return res.status(500).json({ err: "Server error " })
        }








    });




router.route('/:user_id')

    .get(async (req, res) => {
        try {
            const { user_id } = req.params;
            const profile = await Profile.findOne({ user_id });

            if (!profile) {
                return res.status(404).json({ msg: 'profile not found' });
            }

            res.status(200).json(profile)

        } catch (err) {
            console.error(err.message);
            res.status(500).json({ msg: 'Server Error' });
        }
    })

    .put(async (req, res) => {
        try {

            const { user_id } = req.params;
            const data = req.body;
            console.log('updatedata:', data)

            if (!user_id) {
                return res.status(400).json({ message: 'user_id is required' })
            }

            const result = await Profile.updateOne(
                { user_id },
                { $set: data },
            );
            console.log("update Result", result);

            if (result.matchedCount === 0 && result.modifiedCount === 0) {
                return res.status(404).json({ message: ' profile not found ' });
            };
            res.json({ msg: 'profile updated successfully' })

        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).json({ msg: ' server error' })
        }


    })
    .delete(async (req, res) => {
        try {
            const { user_id } = req.params;
            const profile = await Profile.findOne({ user_id });

            if (!profile) {
                return res.status(404).json({ msg: 'profile not found' });
            };

            await Profile.deleteOne({ user_id });
            res.json({ msg: 'profile  succefully deleted' })



        } catch (error) {
            console.error('Error deleting Profile:', error);
            console.error('Error deleting Profile:', error);
        }

    });


router.route('/:userId/gallery')


    .get(async (req, res) => {

        const userId = req.params.userId.trim();
        console.log('received:', userId);
        console.log("Database:", mongoose.connection.name);
        console.log(Profile.collection.name);
        console.log("mongooseUri:", process.env.MONGODB_URI)


        try {

            const allProfiles = await Profile.find();
            console.log("Number of profiles:", allProfiles.length);
            console.log("Profiles:", allProfiles);
            // using populate  a monggose methode  that subsitue references(objectId)via  full document 
            // my quarry style if the user exist means he has his profile meaning profile existe also 
            const profile = await Profile.findOne({ user_id: userId })
                .populate('gallery.photo')
                .populate('gallery.video')
            if (!profile) {
                return res.status(404).json({ error: 'profile not found ' })


            }

            const galleryMedia = profile.gallery.map((item) => {
                if (item.photo) {
                    return {

                        type: 'photo',
                        id: item.photo._id,
                        url: item.photo.url,
                        thumbnail: item.photo.thumbnail,
                        title: item.photo.title,
                        caption: item.photo.caption

                    }
                } else if (item.video) {
                    return {
                        type: 'video',
                        id: item.video._id,
                        url: item.video.url,
                        thumbnail: item.video.thumbnail,
                        title: item.video.title,
                        description: item.video.description

                    }


                } else {
                    return null
                }

            }).filter(item => item !== null)

            return res.status(200).json({
                success: true,
                gallery: galleryMedia
            })
        } catch (error) {
            console.error('Error fetching gallery:', error);
            res.status(500).json({
                success: false,
                message: 'Server error'
            });

        }



    });

router.route('/:userId/gallery/:mediaId')
    .delete(async (req, res) => {

        const { userId, mediaId } = req.params

        try {
            const profile = await Profile.findOne({ user_id: userId });

            if (!profile) {
                return res.status(404).json({ error: 'profileGAllery does not exit' })

            };

            // finding mediaId in the gallery 
             console.log('mediaId:', mediaId);
             console.log('📦 Gallery items (raw):', JSON.stringify(profile.gallery, null, 2));
            const galleryMedia = profile.gallery.findIndex(item => item.photo?.toString() === mediaId || item.video?.toString() === mediaId);

            if (galleryMedia === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Media not found in gallery or does not exist ',

                });
            };
                // 3. Determine media type and remove from gallery
                const mediaItem = profile.gallery[galleryMedia];
                const isPhoto = !!mediaItem.photo;

                // Remove from gallery array
                profile.gallery.splice(galleryMedia, 1);
                await profile.save();

                // 4. Delete the actual media document
                if (isPhoto) {
                    await Photo.findByIdAndDelete(mediaId);
                } else {
                    await Video.findByIdAndDelete(mediaId);
                }


                return res.status(200).json({
                    success:true,
                    message:'item deleted'
                })


            





        }catch(error)
        {
            console.log(error)
            res.status(500).json({
                success:false,
                message:'failed to delete media ',
                error:error.message


            })

        };
        

    })




module.exports = router