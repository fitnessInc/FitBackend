const mongoose = require('mongoose');
const { Schema } = mongoose;



const userSchema = new Schema({
    Full_Name: { type: String, required: false},
    Function: { type: String, required: false},
    profile_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
    
    
});


module.exports=mongoose.model('User', userSchema);
// module.exports= mongoose.models.User || mongoose.model('User', userSchema).   meaning if  User model exist then reuse it otherwise use the one above 
