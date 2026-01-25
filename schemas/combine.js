

// const mongoose = require('mongoose');
// const { Schema } = mongoose;

// mongoose.connect('mongodb://localhost:27017/testDB', {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });


// const PhotoSchema = new Schema({
//     user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  },
//     title: { type: String, },
//     url: { type: String, required:true },
//     caption: { type: String },
//     filePath: { type: String},
// });

// const Photo = mongoose.model('Photo', PhotoSchema);


// const profileSchema= ({
//     user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     full_Name:{type:String,required:true},
//     email: {type:String,required:true},
//     certificate:{type:String},
//     Function:{type:String},


// });

// const Profile = mongoose.model('Profile', profileSchema)



// const userSchema = new Schema({
//     full_Name: { type: String, required: true },
//     Function: { type: String},
//     certificate:{ type: String},
//     profile_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
//     videos_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }],
//     photos_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Photo' }]
// });

// const User =mongoose.model('User', userSchema);
// module .exports= User; 

// const videoSchema = new Schema({
//     user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User',  },
//     title: { type: String },
//     url: { type: String, required: true },
//     caption: { type: String },
//     filePath: { type: String},
// });

// const Video = mongoose.model('Video', videoSchema);

// module.exports = {
//     Photo,
//     Profile,
    
//     Video,
//   };
