const fs = require('fs');
const path = require('path');
const functions = require("firebase-functions");
const { getStorage } = require("firebase-admin/storage");
const sharp = require("sharp");
const os = require('os');





const videofile = (object) => {
    if (!object.contentType || !object.contentType.startsWith('video/')) {
        return false;
    };

    const videoExt = ['.mp4', '.mov', '.avi', '.mkv',
        '.flv', '.wmv', '.webm', '.m4v', '.mpg', '.mpeg', '.3gp'

    ];

    return videoExt.some(ext => object.name.toLowerCase().endsWith(ext));


}

exports.videoThumb = functions.storage.object.onFinalize(async (object) => {

    try {

        if (!videofile(object)) {

            console.log('Skipping non-video-file', object.name);
            return null

        }

        if (object.name.includes("/thumbnails/")) {
            console.log("Skipping thumbnail file itself:", object.name);
            return null;
        };

        console.log(object.name);


        const bucket = getStorage().bucket();
        const fileName = path.basename(object.name);
        const tempObjectPath = path.join(os.tmpdir(), fileName);
        const thumbVideoFilePath = path.join(os.tmpdir(), `videoThumb_${fileName}`);


        await bucket.file(object.name).download({ destination: tempObjectPath });
        console.log(tempVideoPath);

        await new Promise((resolve, reject) => {
            ffmpeg(tempObjectPath)
                .screenshots({
                    timestamps: ["00:00:01"],
                    filename: path.basename(thumbVideoFilePath),
                    folder: path.dirname(thumbVideoFilePath),
                    size: "320x?"
                })
                .on("end", resolve)
                .on("error", reject);
        });


        const videoThumb = `thumbnails/${fileName}.jpg`;
        await bucket.upload(thumbVideoFilePath, {
            destination: videoThumb,
            metadata: { contentType: "image/jpeg" }
        });

        console.log(` log video upload in:${videoThumb}`);



    }catch (err) {
    console.error("Video thumbnail generation failed:", err);
  } finally {
    // 🔹 GUARANTEED /tmp CLEANUP
    if (fs.existsSync(tempVideoPath)) {
      fs.unlinkSync(tempVideoPath);
    }
    if (fs.existsSync(tempThumbPath)) {
      fs.unlinkSync(tempThumbPath);
    }
    console.log("Temp files cleaned up 🧹");
  }


   return null


})



