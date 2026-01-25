const express = require('express');
const router = express.Router();

// const { Photo, Profile, User, Video }= require('../schemas/combine');
const User = require('../schemas/usersSchema');
const Profile = require("../schemas/profileSchema")

const { body, validationResult } = require('express-validator');
const { error } = require('node:console');



router.route('/')

    .get(async (req, res) => {


        try {
            const profile = await Profile.findById(user_id);
            if (!user_id) {
                res.status(404).json({ error: 'profile not found ' })
            }
            res.status(200).json(profile)


        } catch (err) {
            console.log('profile does not exist therefore we can display it', err);
            res.status(500).json({ err: "faild to fetch propropro" })
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

            const yesProfile= await Profile.findOne({user_id:id})
            if(yesProfile){
                return res.status(400).json({error:'profile exite '})
            }

           

            const profile = await Profile.create({
                user_id:id,
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

     .put(async(req,res)=>{

        const {id}= req.params;
        const data= req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: 'Invalid user ID' });
        };

        try{
            const profile = await Profile.findOne({user_id:id})

            if(!profile){
                return res.status(400).json({error:'no profile , therfore no update'})
            }

            const updatePro = await Profile.findOneAndUpdate(

                {user_id:id},
                {$set:data},
                {new:true}

            )

            if(!updatePro){
                return res.status(400).json({error:'no :( fiald to update'})
            }
            return res.status(200).json({msg:' Yes! :) profile updated ',profile:updatePro})

          
        }catch(err){
            console.error('faild to update :( ' ,err)
            return res.status(500).json({err:'Server bugs '})
        }
e

    })
    .delete (async(req,res)=>{
        
     const {id}= req.params ;
      if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ msg: 'Invalid user ID' });
        };

        try{

             const profile = await  Profile.findOneAndDelete({user_id:id});
             if(!profile){
                return res.status(404).json({msg:'there is no profile to delete'})
             }

             return res.status(200).json({msg:'YUP! Profile is deleted', Pro:profile})



        }catch(err){
            console.error(" faild to delete Profile",err);
            return res.status(500).json({err:"Server error "})
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


module.exports = router