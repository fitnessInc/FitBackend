
const mongoose = require('mongoose');
const { Schema } = mongoose;

const VideoSchema = new Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
    title: { type: String, required: true },
    url: { type: String, required: true },
    thumbnail:{type: String},
    description: { type: String }
}, { timestamps: true });

const Video = mongoose.model('Video', VideoSchema);
module.exports  = Video;