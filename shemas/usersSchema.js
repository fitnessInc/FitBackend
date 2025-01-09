const mongoose = require('mongoose');
const { Schema } = mongoose;



const userSchema = new Schema({
    firts_Name: { type: String, required: true },
    last_Name: { type: String, required: true },
    Function: { type: String, required: true },
    profile_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
    videos_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    photos_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }]
});

const User =mongoose.model('User', userSchema);
module .exports= User
