const mongoose = require('mongoose');
const { Schema } = mongoose;

const profileSchema = new Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    firts_Name: { type: String, required: true },
    last_Name: { type: String, required: true },
    certification: { type: String },
    avatr: {
        uiri: { type: String },
        thumbnail: { type: String }
    },
   gallery:[{
         media:{type:Schema.Types.ObjectId, ref:"media"}
   }]


});

module.exports = mongoose.model('Profile', profileSchema)