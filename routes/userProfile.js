const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// const { Photo, Profile, User, Video }= require('../schemas/combine');
const User = require('../schemas/usersSchema');
const Profile = require("../schemas/profileSchema");
const Photo = require('../schemas/photoSchemas');
const Video = require('../schemas/videoSchema');
const { bucket } = require('../firebase/firebaseConfig')
const { body, validationResult } = require('express-validator');
const { error } = require('node:console');
const chekFbToken = require('./midFirebaseToken');
const checkCurrentUser = require('./checkCurrentUser')



const proBio = (profile) => ({
    full_Name: profile.full_Name,
    bio: profile.bio,
    avatar: profile.avatar,
    certification: profile.certification,

})






function cleanGallery(gallery) {

    return (
        gallery
            .map((item) => {
                if (item.photo) {
                    return {
                        type: 'photo',
                        id: item.photo._id,
                        url: item.photo.url,
                        thumbnail: item.photo.thumbnail,
                        title: item.photo.title,
                        caption: item.photo.caption,
                    };
                }
                if (item.video) {
                    return {
                        type: 'video',
                        id: item.video._id,
                        url: item.video.url,
                        thumbnail: item.video.thumbnail,
                        title: item.video.title,
                        description: item.video.description,
                    };
                }
                return null;
            })
            .filter(Boolean)

    )

};
function findGallery(userId) {

    return (
        Profile.findOne({ user_id: userId })
            .populate('gallery.photo')
            .populate('gallery.video')
    )

};

function coalescingProfile(profile) {

    return {
        profile_id: profile._id,
        full_Name: profile.full_Name,
        certification: profile.certification,
        function: profile.function,
        avatar: profile.avatar?.uri ?? null,
    };


}

// the  below route get all profiles just bio 

router.route(("/"))

    .get(chekFbToken, checkCurrentUser, async (req, res) => {
        try {
            const profiles = await Profile.find({ user_id: { $ne: req.currentUser._id } })
                .select('-email -gallery -__v');
            res.status(200).json({ success: true, profiles });
        } catch (e) {
            console.log('List profiles error:', e);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });

// route fetching profile bio 






// the bellow  route fetch   user's own gallery 

router.route('/me/gallery')
    .get(chekFbToken, checkCurrentUser, async (req, res) => {

        try {
            console.log('me/gallery currentUser:', req.currentUser?._id, req.currentUser?.uid);


            const profile = await findGallery(req.currentUser._id);
            if (!profile) return res.status(404).json({ error: 'Profile not found' });

            res.status(200).json({ success: true, isOwner: true, bioAvatar: coalescingProfile(profile), gallery: cleanGallery(profile.gallery) })
        } catch (e) {
            console.log(e);
            res.status(500).json({ success: false, message: 'server error ' })
        }

    })

// route fetching profile bio 
router.route('/me')
    .get(chekFbToken, checkCurrentUser, async (req, res) => {

        try {

            const profile = await Profile.findOne({ user_id: req.currentUser._id })
            if (!profile) {
                return res.status(404).json({ success: false, message: 'profile not found' });

            }

            res.status(200).json({
                success: true,
                isOwner: true,
                profile: proBio(profile)
            })


        } catch (e) {
            console.error('error from GET /profiles/me:', e);
            res.status(500).json({ success: false, message: 'Server error' });
        }



    })
// route  post and update  bio 
router.route('/me')
    .put(chekFbToken, checkCurrentUser, async (req, res) => {
        try {
            const bio = ['full_Name', 'certification', 'function', 'email', "phoneNumber"];
            const bioUpdate = {};

            for (const field of bio) {
                if (typeof req.body[field] === 'string') {
                    bioUpdate[field] = req.body[field].trim();
                }
            }

            if (Object.keys(bioUpdate).length === 0) {
                return res.status(400).json({ success: false, message: 'Nothing to update' });
            }

            const profile = await Profile.findOneAndUpdate(
                { user_id: req.currentUser._id },
                { $set: bioUpdate },
                { new: true, runValidators: true },
                { upsert: true }
            );

            if (!profile) {
                return res.status(404).json({ success: false, message: 'Profile not found' });
            }

            res.json({ success: true, message: 'Profile updated', profile });
        } catch (e) {
            console.log('Edit profile error:', e);
            res.status(500).json({ success: false, message: 'Server error' });
        }
    });


router.route('/profile/:userId')

    .get(async (req, res) => {

        //get profile Bio 

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

        // post profile bio 

        const { id } = req.params;
        const { Full_Name, Certification, Function } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: 'Invalid user ID' });
        }

        try {

            const yesProfile = await Profile.findOne({ user_id: id })
            if (!yesProfile) {
                return res.status(400).json({ error: 'profile exite ' })
            }



            const profile = await Profile.create({
                user_id: id,
                Full_Name,
                Certification,
                Function,
                Email



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


            if (!user_id) {
                return res.status(404).json({ msg: 'profile not found' });
            }

            res.status(200).json(profile)

        } catch (err) {
            console.error(err.message);
            res.status(500).json({ msg: 'Server Error' });
        }
    })


    .put(async (req, res) => {
        // update  bio  and delete  avatar  
        try {

            const { user_id } = req.params;
            const data = req.body;
            console.log('updatedata:', data);


            if (!user_id) {
                return res.status(400).json({ message: 'user_id is required' })
            }

            const result = await Profile.findOneAndUpdate(
                { user_id },
                { $set: data },
                { new: true }
            );
            console.log("update Result", result);
            if (!result) {
                return res.status(404).json({ message: 'Profile not found' });
            }

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

// route of viwedUser   profile.bio 
router.route('/:userId')

.get(chekFbToken, checkCurrentUser,async(req,res)=>{
    try {
      const { userId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: 'Invalid user id' });
      }

      const profile = await Profile.findOne({ user_id: userId });
      if (!profile) {
        return res.status(404).json({ success: false, message: 'Profile not found' });
      }

      res.status(200).json({
        success: true,
        isOwner: userId === req.currentUser._id.toString(),
        profile: proBio(profile),    // public fields only
      });
    } catch (e) {
      console.error('error from GET /profiles/:userId:', e);
      res.status(500).json({ success: false, message: 'Server error' });
    }

})


    





// /:userId/gallery is what loads when a user taps someone’s card in the profile list and opens their profile. 
// The :userId in the URL is the MongoDB ID of the person being viewed.


router.route('/:userId/gallery')


    .get(chekFbToken, checkCurrentUser, async (req, res) => {

        const userId = req.params.userId.trim();
        console.log('received:', userId);
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).json({ success: false, message: 'Invalid user id' });
        }

        try {

            const profile = await findGallery(userId)
            if (!profile) {
                return res.status(404).json({ message: "profile dose not existe" })


            }

            res.status(200).json({
                success: true,
                gallery: cleanGallery(profile.gallery),
                isOwner: profile.user_id.equals(req.currentUser._id),
                bioAvatar: coalescingProfile(profile)

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
            console.log(' gallery mediaId:', mediaId);
            // json.stringify(value, custom rule,indentation )
            console.log(' Gallery items (raw):', JSON.stringify(profile.gallery, null, 2));
            const galleryMedia = profile.gallery.findIndex(item => item.photo?.toString() === mediaId || item.video?.toString() === mediaId);

            if (galleryMedia === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Media not found in gallery or does not exist ',

                });
            };
            // 3. Determine media type and remove from gallery
            const mediaItem = profile.gallery[galleryMedia];
            //  converting value to a boolean   whit !! if isPhoto is true then  galleryMedia is photo and delete from
            // profile.gallery if it false or undefined then galleryMedia is video delete from profile.gallery
            const isPhoto = !!mediaItem.photo;

            // Remove from gallery array
            profile.gallery.splice(galleryMedia, 1);
            await profile.save();

            // 4. Delete the actual media document
            // if (isPhoto) {
            //     await Photo.findByIdAndDelete(mediaId);
            // } else {
            //     await Video.findByIdAndDelete(mediaId);
            // }

            const mediaModel = isPhoto ? Photo : Video;
            const deleteDoc = await mediaModel.findByIdAndDelete(mediaId)



            //   firebase deletion
            // const fileRef =  bucket.file(mediaItem.filePath)
            // await  fileRef.delete();
            let firebaseStorage = false;

            if (deleteDoc.filePath) {
                try {
                    await bucket.file(deleteDoc.filePath).delete();
                    console.log('firebase deletion succeed')
                    firebaseStorage = true;
                } catch (e) {
                    console.log('firebase deletion is bugging :', e.message)
                }
            } else {
                console.log("firebase deletion is skipped ")
            }



            return res.status(200).json({
                success: true,
                message: 'item deleted from  db doc and bucket :)'
            })








        } catch (error) {
            console.log(error)
            res.status(500).json({
                success: false,
                message: 'failed to delete media ',
                error: error.message


            })

        };


    })




module.exports = router