const mongoose = require('mongoose');
const { Schema } = mongoose;

const profileSchema = new Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    full_Name: { type: String, required: false },
    certification: { type: String,required:false },
    email:{type: String ,required:false},
    avatar: {
        uri: { type: String },
        thumbnail: { type: String }
    },

    gallery: [
        {
            photo: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Photo"
            },
            video: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        }
    ], 
});
  
    
  
   



module.exports = mongoose.model('Profile', profileSchema)