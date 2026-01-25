const mongoose = require('mongoose');
const { Schema } = mongoose;



const userSchema = new Schema({
    Full_Name: { type: String, required: true },
    Function: { type: String, required: true },
    profile_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
    
});

// const User =mongoose.model('User', userSchema);
// module .exports= User
module.exports=mongoose.model('User', userSchema);
// module.exports= mongoose.models.User || mongoose.model('User', userSchema).   meaning if  User model exist then reuse it otherwise use the one above 
