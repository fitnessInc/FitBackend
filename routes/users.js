const express = require('express');
const router = express.Router();

const Profile = require('../schemas /profileSchema');
const User = require('../schemas /userSchema');
const { body, validationResult } = require('express-validator')


const app = express()
app.use(express.json());


router.route('/create')


    .post([
        body('First_Name').notEmpty().withMessage('firstname is required'),
        body('last_Name').notEmpty().withMessage('Last name is required'),
        body('email').isEmail().withMessage('Please enter a valid email'),
        body('certificate').notEmpty().withMessage('certificate is required for trainer else just inpute your status ')

    ], async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
             return res.status(400).json({ errors: errors.array() })

        }

        try {
            const { user_id, First_Name, last_Name, email, certification } = req.body;
            const user = await User.findById(user_id);
            if (!user) {
                return res.status(404).json({ msg: 'user not found' })
            };


            const profile = new Profile({
                user_id,
                First_Name,
                last_Name,
                email,
                certification
            });
            await profile.save();

            // Associate the profile with the user (optional but recommended)
            user.profile_id = profile._id;
            await user.save();

            res.status(201).json({ msg: 'Profile created successfully', profile });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ msg: 'Server Error' });
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
            const update ={$set:data};

            const result = await db.collection('Profile').updateOne(
                {user_id},
                update
            );

            if (result.matchedCount === 0 && result.modifiedCound===0) {
                return res.status(404).json({ message: ' profile not found ' });
              }; 
              res.json ({msg:'profile updated successfully'})

        }catch(error){
            res.status(500).json({msg:' server error'})
        }

        
    })
    .delete( async(req,res)=>{
       try{
        const { user_id } = req.params;
         const profile =  await Profile.findOne({user_id});

          if (!profile){
             return res.status(404).json({msg:'profile not found'});
          };

          const result =  await db.collection('Pofile').deleteOne(profile);
           if (result.deletedCount===0){
            return res.status(404).json({msg:'profile not found'})
           }


       }catch (error) {
        console.error('Error deleting Profile:', error);
       }

    });