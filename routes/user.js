const express = require('express');
const router = express.Router();

const { Photo, Profile, User, Video } = require('../shemas/combine');




const app = express()
app.use(express.json());

router.route('/')

    .post(async (req, res) => {

        try {

            const { full_Name, Function, certificate } = req.body;
            let user = await User.findOne({ full_Name });

            if (!user) {
                user = new User({ full_Name, Function, certificate });
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
            const user = User.findById(id);
            if (!user) {
                return res.status(404).json({ msg: 'user not found ' });

            }
            res.status.json(user)

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
            if (!id) {
                return res.status(400).json({ message: 'user Id is required' })

            }

            const result = await User.updateOne(
                { id },
                { $set: data }
            )

            if (result.matchedCount === 0) {
                return res.status(404.).json({ msg: 'user not found' });
            }
            res.status(200).json({ msg: 'user  update succefully ' })


        } catch (err) {
            console.log(err.message);
            res.status(500).json({ msg: 'erro server' })
        }
    })

    .delete(async (req, res) => {

        try {
            const { id } = req.params;
            const user = await User.findById(id);
            if (!user) {
                console.log('User  doest not exist');
            }

            const result = await User.deleteOne({ _id:id });

            if (result.deletedCount === 0) {
                return res.status(404.).json({ msg: 'User not found' });
            }
            res.status(200).json({ msg: 'User  deleted succefully ' })


        } catch (err) {
            console.log('Error deleting user',err.message);
            res.status(500).json({ msg: 'erro server' })
        }
    });



    module.exports= router

