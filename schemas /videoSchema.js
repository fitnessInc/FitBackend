const mongoose = require('mongoose');
const { Schema } = mongoose;


const videoSchema = new Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    description: { type: String }
});

const Video = mongoose.model('Video', videoSchema);
module.exports  = Video;