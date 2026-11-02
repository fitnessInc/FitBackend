const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const chekFbToken = require('./midFirebaseToken');
const Profile = require('../schemas/profileSchema')
const User = require('../schemas/usersSchema')



router.route('/')

    .post( chekFbToken,async (req, res) => {
         console.log("POST /users hit");

        try {

            const { uid, email } = req.firebaseUser;
            const { Full_Name, Function } = req.body;
            let user = await User.findOne({firebaseUid:uid});

            if (!user) {
                user = new User({ firebaseUid: uid, email, Full_Name, Function });
                await user.save();
            }

            const profile = await Profile.create({user_id:user._id, full_Name:Full_Name ?? '', email:email ?? ''});
            user.profile_id = profile._id;
            await user.save();

            res.status(201).json({ msg: 'User created successfully', user });

        } catch (err) {
            console.log(err.message);
            res.status(500).json({ msg: 'Server Error' });


        }


    });
    router.route('/me')
    .get(chekFbToken,async (req,res)=>{
        try{
            const  user = await  User.findOne({firebaseUid:req.firebaseUser.uid})
               .populate('profile_id')
             if(!user){

                return res.status(404).json({msg:'user does not existe neither having a profile, thank you for signUp'})
             }
             res.json({user})
        }catch(err){
            console.log(e.message)
            
        }
    })

router.route('/:id')

    .get(async (req, res) => {

        try {
            const { id } = req.params;
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ msg: 'Invalid user ID' });
            }


            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ msg: 'user not found ' });

            }
            res.status(200).json(user)

        } catch (err) {
            console.log(err.message);
            res.status(500).json({ msg: ' Server Error' })
        }

    })

    .put(async (req, res) => {
        try {

            const { id } = req.params;
            const data = req.body;
            console.log('data to be updated ', data);

            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ msg: 'Invalid user ID' });
            }

            const result = await User.findByIdAndUpdate(
                id,
                { $set: data },
                { new: true }// it returns the updated value 
            )

            if (!result) {
                return res.status(404).json({ msg: 'user not found' });
            }
            res.status(200).json({ msg: 'user  update successfully ' })


        } catch (err) {
            console.log(err.message);
            res.status(500).json({ msg: 'Server error' })
        }
    })

    .delete(async (req, res) => {

        try {
            const { id } = req.params
            if (!mongoose.Types.ObjectId.isValid(id)) {
                return res.status(400).json({ msg: 'Invalid user ID' });
            }

            const result = await User.deleteOne({ _id: id });

            if (result.deletedCount === 0) {
                return res.status(404).json({ msg: 'User not found' });
            }
            res.status(200).json({ msg: 'User  deleted successfully ' })


        } catch (err) {
            console.log('Error deleting user', err.message);
            res.status(500).json({ msg: 'erro server' })
        }
    });







module.exports = router

