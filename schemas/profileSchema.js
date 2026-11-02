const mongoose = require('mongoose');
const { Schema } = mongoose;

const profileSchema = new Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    full_Name: { type: String, require: false },
    certification: { type: String,require:false },
    function:{ type: String,require:false },
    email:{type: String ,required:false},
    phoneNumber:{type: String ,required:false},
    avatar: {
        uri: { type: String },
        thumbnail: { type: String },
        filePath:{type:String,require:false},
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