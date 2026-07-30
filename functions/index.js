
const admin = require("firebase-admin");
admin.initializeApp();
const { getStorage } = require("firebase-admin/storage");
const { onObjectFinalized } = require('firebase-functions/v2/storage');
const Bucket_Name = 'sporty-6fdac.appspot.com';
const { defineSecret } = require("firebase-functions/params");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require('ffmpeg-static');
ffmpeg.setFfmpegPath(ffmpegStatic);
const { exec, spawn, execSync, fork } = require('child_process');


// we are going to define mongoUri a global constant a  key of defineScret value whit MONGODB_URI param for the the value 
const mongoUri = defineSecret('MONGODB_URI')

exports.imageThumb = onObjectFinalized({ secrets: [mongoUri] }, async (event) => {


  console.log('trigger is fired ');

  const { getStorage } = require("firebase-admin/storage");
  const os = require("os");
  const path = require("path");
  const sharp = require("sharp");
  const fs = require("fs");
  const { dbConnection } = require("./cachedConnect");
  const image = require("./photoSchemas");
  //  connection initialization
  await dbConnection(mongoUri.value());
  console.log("connection State :",dbConnection)
  console.log(mongoUri.value())
  console.log("Image function triggered");

  const object = event.data  // gen2 style 
  console.log(JSON.stringify(event.data, null, 2));
  // checking the file  type
  if (!object.contentType || !object.contentType.startsWith("image/")) {
    console.log("Skipping non image  ", object.name);
    return null;
  }
  // checking if  the file is not process already
  if (object.name.startsWith("thumbnails/")) {
    console.log("Skipping thumbnail:", object.name);
    return null;
  }
  const bucket = getStorage().bucket();
  const filePath = object.name; // object name full path of the upload file inside bucket
  const fileName = path.basename(object.name);// extraction of the file name from the full path via path.basename

  //  displaying  temporary directory in the system
  const tempFilePath = path.join(os.tmpdir(), fileName);// here  the file name would be anchored to the temporary directory
  // attributting a name index for  the file
  const thumbImageFilePath = path.join(os.tmpdir(), `imageThumb_${fileName}`);

  //  file process to thumbnail starts from here below

  try {
    // downloading  an object from the bucket to the  a temporary directory in  GCF MV
    await bucket.file(filePath).download({
      destination: tempFilePath,
    });
    console.log(`Downloaded to temp: ${tempFilePath}`);// tempFilePath temporary directory in GCS
    // thumbnail generation and resize
    await sharp(tempFilePath)
      .resize(300, 300, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(thumbImageFilePath);

    console.log("Thumbnail created:", thumbImageFilePath);


    // uploading thumbnail  to The GCs

    await bucket.upload(thumbImageFilePath, {
      destination: `thumbnails/thumb_${fileName}`,
      metadata: { // metadata prop description of the file and  instruction
        contentType: "image/jpeg",
        cacheControl: "public, max-age=31536000", // keeping the file frech for the defined length of time max-age value

      },

    });
    // making public
    const thumbPath = `thumbnails/thumb_${fileName}`;
    await bucket.file(thumbPath).makePublic();

    // uploading Thumbfile to  mongoDB;

    // first step construction and access to url for saving in the db

    const photoThumFolder = `thumbnails/thumb_${fileName}`;
    const bucketName = bucket.name;
    const publicUrl = `https://storage.googleapis.com/${bucketName}/${photoThumFolder}`;

    // uploading the the pubilc url in db  specially updating the  thumbnailUrl prop  in image/photo doc
      const  photoUrl =`https://storage.googleapis.com/${bucketName}/${filePath}` ;
       console.log('originalUrl', photoUrl);
       const documentsaved = await image.findOne({url:photoUrl});
       console.log('checking insideMango',documentsaved);
         const docs= await image.findOne({},{ url: 1, _id: 0 });
         console.log("URLs in MongoDB:", JSON.stringify(docs));
        // saving urls in  db cluster 
    const imageDoc = await image.findOneAndUpdate(
      { url: `https://storage.googleapis.com/${bucketName}/${filePath}` },  // ✅ match url
      { thumbnail: publicUrl },
      { new:true,
        upsert:true

      }
    );

    console.log('image saved in db', imageDoc)


    // clean up temp fil
    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(thumbImageFilePath);
  } catch (err) {
    return console.log(" faild to generate  the image thumbnail", err);
  } finally {
    // Cleanup temp files in VM
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    if (fs.existsSync(thumbImageFilePath)) fs.unlinkSync(thumbImageFilePath);
  }

  return null;
});

// video thumbnail generation


// ffmpeg.setFfmpegPath(ffmpegPath);

const videofile = (object) => {
  if (!object.contentType || !object.contentType.startsWith("video/")) return false;
  const videoExt = [".mp4", ".mov", ".avi", ".mkv", ".flv", ".wmv", ".webm", ".m4v", ".mpg", ".mpeg", ".3gp"];
  return videoExt.some((ext) => object.name.toLowerCase().endsWith(ext));
};

exports.videoThumb = onObjectFinalized({ memory: "2GiB", cpu: 2, timeoutSeconds: 240, secrets: [mongoUri] }, async (event) => {
  console.log('trigger is fired ')

  const { getStorage } = require("firebase-admin/storage");
  const os = require("os");
  const path = require("path");
  const fs = require("fs");
  const { dbConnection } = require("./cachedConnect");
  const video = require("./videoSchema");
  // const ffmpeg = require("fluent-ffmpeg");
  // const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
  // ffmpeg.setFfmpegPath(ffmpegPath);

  await dbConnection(mongoUri.value());
  const object = event.data
  let tempThumbPath = null;

  try {
    if (!videofile(object)) {
      console.log("Skipping non-video file:", object.name);
      return null;
    }
    if (object.name.includes("/thumbnails/")) {
      console.log("Skipping thumbnail file itself:", object.name);
      return null;
    }

    console.log("Processing video:", object.name);

    const bucket = getStorage().bucket();
    const bucketName = bucket.name;
    const filePath = object.name; // object name full path of the upload file inside bucket
    const fileName = path.basename(object.name);
    const tempThumbPath = path.join(os.tmpdir(), `videoThumb_${fileName}.jpg`);
    const tempVideoPath = path.join(os.tmpdir(), fileName);// downloading video to a temporary path



    try {
      await bucket.file(filePath).download({ destination: tempVideoPath });
    } catch (error) {
      console.log(error)
    }



    // 🔓 Build public URL (requires bucket to be public, dev mode only)
    // const publicUrl = `https://storage.googleapis.com/${bucketName}/${filePath}`;

    //  FFmpeg reads directly from public URL – no download!

    console.log('tempVideoPath =', tempVideoPath);
    console.log('tempThumbPath =', tempThumbPath);
    console.log('Video exists?', fs.existsSync(tempVideoPath));
    await new Promise((resolve, reject) => {
      ffmpeg(tempVideoPath)
        .screenshots({
          timestamps: ["00:00:01"], // 1 second into video
          filename: path.basename(tempThumbPath),
          folder: path.dirname(tempThumbPath),
          size: "320x?", // width 320, height auto
        })
        .on("end", resolve)
        .on("error", reject);
    });

    console.log("Thumbnail created at:", tempThumbPath);

    // Upload thumbnail to thumbnails/ folder
    const thumbnailFolder = `thumbnails/${fileName}.jpg`;
    await bucket.upload(tempThumbPath, {
      destination: thumbnailFolder,
      metadata: { contentType: "image/jpeg" },
    });

    console.log(`✅ Thumbnail uploaded to ${thumbnailFolder}`);

    // making public 
    await bucket.file(thumbnailFolder).makePublic();

    //  we bucketName aboth  initialise   on the same segma withy fileName
    const publicUrl1 = `https://storage.googleapis.com/${bucketName}/${thumbnailFolder}`;

    // uploading the the pubilc url in db  specially updating the  thumbnailUrl prop  in video  doc

    const videoDoc = await video.findOneAndUpdate(
      { url: filePath },
      { thumbnail: publicUrl1 },
      { new:true,
         upsert:true

      },
    );

    if (videoDoc) {
      console.log(` mongo-Video-Doc-thumb -updated ${publicUrl}`);
    } else {
      console.log(`there was no Video-Url found With ${filePath}`);
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
