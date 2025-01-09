const mongoose = require('mongoose');
const {Schema}= mongoose;

const profileSchema= ({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    firts_Name:{type:String,required:true},
    last_Name:{type:String,required:true},
    email: {type:String,required:true},
    certification:{type:String},


});

const Profile = mongoose.model('Profile', profileSchema)

module.exports = Profile