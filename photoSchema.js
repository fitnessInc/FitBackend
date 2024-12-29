const mongoose = require('mongoose');
const { Schema } = mongoose;


const PhotoSchema = new Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, },
    url: { type: String, required:true },
    caption: { type: String }
});

const Photo = mongoose.model('Photo', PhotoSchema);
module.exports  = Photo;