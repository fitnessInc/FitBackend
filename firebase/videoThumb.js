// const fs = require('fs');
// const path = require('path');
// const functions = require("firebase-functions");
// const { getStorage } = require("firebase-admin/storage");
// const sharp = require("sharp");
// const os = require('os');
// const ffmpeg = require('fluent-ffmpeg');
// const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;



//   ffmpeg.setFfmpegPath(ffmpegPath);
   

// const videofile = (object) => {
//     // checking file 
//     if (!object.contentType || !object.contentType.startsWith('video/')) {
//         return false;
//     };

//     const videoExt = ['.mp4', '.mov', '.avi', '.mkv',
//         '.flv', '.wmv', '.webm', '.m4v', '.mpg', '.mpeg', '.3gp'

//     ];

//     return videoExt.some(ext => object.name.toLowerCase().endsWith(ext));


// }

// exports.videoThumb = functions.storage.object.onFinalize(async (object) => {

//     try {
//           // checking file 
//         if (!videofile(object)) {

//             console.log('Skipping non-video-file', object.name);
//             return null

//         }
//         // cheking fiel if already a thumb 

//         if (object.name.includes("/thumbnails/")) {
//             console.log("Skipping thumbnail file itself:", object.name);
//             return null;
//         };

//         console.log(object.name);


//         const bucket = getStorage().bucket();
//         const fileName = path.basename(object.name);
//         // attaching fileName plus thumb  to the temporary directory
//         const tempObjectPath = path.join(os.tmpdir(), fileName);
//         const thumbVideoFilePath = path.join(os.tmpdir(), `videoThumb_${fileName}`);

//          // thumbnail generation 
//         await bucket.file(object.name).download({ destination: tempObjectPath });
//         console.log(tempVideoPath);

//         await new Promise((resolve, reject) => {
//             ffmpeg(tempObjectPath)
//                 .screenshots({
//                     timestamps: ["00:00:01"],
//                     filename: path.basename(thumbVideoFilePath),
//                     folder: path.dirname(thumbVideoFilePath),
//                     size: "320x?"
//                 })
//                 .on("end", resolve)
//                 .on("error", reject);
//         });


//         const videoThumb = `thumbnails/${fileName}.jpg`;
//         await bucket.upload(thumbVideoFilePath, {
//             destination: videoThumb,
//             metadata: { contentType: "image/jpeg" }
//         });

//         console.log(` log video upload in:${videoThumb}`);



//     }catch (err) {
//     console.error("Video thumbnail generation failed:", err);
//   } finally {
//     // 🔹 GUARANTEED /tmp CLEANUP
//     if (fs.existsSync(tempVideoPath)) {
//       fs.unlinkSync(tempVideoPath);
//     }
//     if (fs.existsSync(tempThumbPath)) {
//       fs.unlinkSync(tempThumbPath);
//     }
//     console.log("Temp files cleaned up 🧹");
//   }


//    return null


// })

const fs = require('fs');
const path = require('path');
const functions = require("firebase-functions");
const { getStorage } = require("firebase-admin/storage");
const os = require('os');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const video =require('../schemas/videoSchema');
 const admin = require('firebase-admin');
 
 admin.initializeApp()


ffmpeg.setFfmpegPath(ffmpegPath);

const videofile = (object) => {
    if (!object.contentType || !object.contentType.startsWith('video/')) return false;
    const videoExt = ['.mp4', '.mov', '.avi', '.mkv', '.flv', '.wmv', '.webm', '.m4v', '.mpg', '.mpeg', '.3gp'];
    return videoExt.some(ext => object.name.toLowerCase().endsWith(ext));
};

exports.videoThumb = functions.runWith({ memory: '1GB' }).storage.object.onFinalize(async (object) => {
      await  dbConnection()
    let tempThumbPath = null;

    try {
        if (!videofile(object)) {
            console.log('Skipping non-video file:', object.name);
            return null;
        }
        if (object.name.includes("/thumbnails/")) {
            console.log("Skipping thumbnail file itself:", object.name);
            return null;
        }

        console.log('Processing video:', object.name);

        const bucket = getStorage().bucket();
        const bucketName = bucket.name;
         const filePath = object.name;  // object name full path of the upload file inside bucket
        const fileName = path.basename(object.name);
        tempThumbPath = path.join(os.tmpdir(), `videoThumb_${fileName}.jpg`);

        // 🔓 Build public URL (requires bucket to be public, dev mode only)
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;

        //  FFmpeg reads directly from public URL – no download!
        await new Promise((resolve, reject) => {
            ffmpeg(publicUrl)
                .screenshots({
                    timestamps: ["00:00:01"],   // 1 second into video
                    filename: path.basename(tempThumbPath),
                    folder: path.dirname(tempThumbPath),
                    size: "320x?"               // width 320, height auto
                })
                .on("end", resolve)
                .on("error", reject);
        });

        console.log('Thumbnail created at:', tempThumbPath);

        // Upload thumbnail to thumbnails/ folder
        const thumbnailFolder = `thumbnails/${fileName}.jpg`;
        await bucket.upload(tempThumbPath, {
            destination: thumbnailFolder,
            metadata: { contentType: "image/jpeg" }
        });

        console.log(`✅ Thumbnail uploaded to ${thumbnailFolder}`);

        
                //  we bucketName aboth  initialise   on the same segma withy fileName
                 const publicUrl1 = `https://storage.googleapis.com/${bucketName}/${thumbnailFolder}`;
         
                 // uploading the the pubilc url in db  specially updating the  thumbnailUrl prop  in video  doc 
         
                 const videoDoc = await video.findOneAndUpdate(
                     { url: filePath },
                     { thumbnail: publicUrl1 },
                     { upsert: false }
                 );

                 if (videodoc){
                     console.log(` mongo-Video-Doc-thumb -updated ${publicUrl}`)
                 }else{
                    console.log(`there was no Video-Url found With ${filePath}`)
                 }

    } catch (err) {
        console.error("Video thumbnail generation failed:", err);
    } finally {
        // Clean up local thumbnail file
        if (tempThumbPath && fs.existsSync(tempThumbPath)) {
            fs.unlinkSync(tempThumbPath);
            console.log("Cleaned up temp thumbnail");
        }
    }
    return null;
});
