const express = require('express');
const router = express.Router();

const { Photo, Profile, User, Video }= require('../shemas/combine');

const { body, validationResult } = require('express-validator')


const app = express()
app.use(express.json());


router.route('/')


    .post(  async (req,res)=>{
           
        

        try {
            const {  full_Name, email, certificate, Function  } = req.body;
            let user = await User.findOne({full_Name});
            if (!user) {
                user = new User({ full_Name, Function, certificate });
                await user.save();

                
               
            }

            const profile = new Profile({
                user_id: user._id,
                full_Name,
                email,
                certificate,
                Function
            });
              const savedProfile = await profile.save();

            

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
            console.log('updatedata:',data)
           
            if(! user_id){
                return res.status(400).json({message:'user_id is required'})
            }

            const result = await Profile.updateOne(
                {user_id},
                {$set:data},
            );
              console.log("update Result",result);

            if (result.matchedCount === 0 && result.modifiedCount===0) {
                return res.status(404).json({ message: ' profile not found ' });
              }; 
              res.json ({msg:'profile updated successfully'})

        }catch(error){
            console.error('Error updating profile:', error);
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

         await Profile.deleteOne({user_id});
         res.json({msg:'profile  succefully deleted'})
          


       }catch (error) {
        console.error('Error deleting Profile:', error);
        console.error('Error deleting Profile:', error);
       }

    });


    module.exports = router