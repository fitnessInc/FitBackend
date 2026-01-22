const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')

// const {  User } = require('../shemas/combine');
const User = require('../shemas/usersSchema')



const app = express()
app.use(express.json());

router.route('/')

    .post(async (req, res) => {

        try {

            const { userId, Full_Name, Function } = req.body;
            let user = await User.findById(userId);

            if (!user) {
                user = new User({ Full_Name, Function });
                await user.save();
            }

            res.status(201).json({ msg: 'User created successfully', user });

        } catch (err) {
            console.log(err.message);
            res.status(500).json({ msg: 'Server Error' });


        }


    });

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
            res.status(500).json({ msg: ' erro server' })
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
            res.status(200).json({ msg: 'user  update succefully ' })


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

            const result = await User.deleteOne({_id:id});

            if (result.deletedCount === 0) {
                return res.status(404).json({ msg: 'User not found' });
            }
            res.status(200).json({ msg: 'User  deleted succefully ' })


        } catch (err) {
            console.log('Error deleting user', err.message);
            res.status(500).json({ msg: 'erro server' })
        }
    });







module.exports = router

