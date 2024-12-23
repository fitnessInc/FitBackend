const mongoose = require('mongoose');
const { Schema } = mongoose;



const userSchema = new Schema({
    full_NAme: { type: String, required: true },
    function: { type: String, required: true },
    profile_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
    videos_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
    photos_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }]
});

const User =mongoose.model('User', userSchema);
module .exports= User
