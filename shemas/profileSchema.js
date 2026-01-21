const mongoose = require('mongoose');
const { Schema } = mongoose;

const profileSchema = ({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    firts_Name: { type: String, required: true },
    last_Name: { type: String, required: true },
    certification: { type: String },
    avatr: {
        uiri: { type: string },
        thumbnail: { type: string }
    },
    videos_ids: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video',

        }
    ],
    photos_ids: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Photo',

        },

    ]


});

const Profile = mongoose.model('Profile', profileSchema)

module.exports = Profile