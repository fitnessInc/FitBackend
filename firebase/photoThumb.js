const fs = require('fs');
const path = require('path');
const functions = require("firebase-functions");
const { getStorage } = require("firebase-admin/storage");
const sharp = require("sharp");
const os = require('os');
const user = require('../schemas/usersSchema');
const image = require('../schemas/photoShmas')





exports.imageThumb = functions.storage.object.onFinalize(async (object) => {
    // checking the file  type 
    if (!object.contentType || !object.contentType.startsWith('image/')) {
        console.log("Skipping non image  ", object.name);
        return null
    }
    // checking if  the file is not process already 
    if (object.name.startsWith('thumbnails/')) {
        console.log('Skipping thumbnail:', object.name);
        return null;
    }
    const bucket = getStorage().bucket();
    const filePath = object.name;  // object name full path of the upload file inside bucket
    const fileName = path.basename(object.name);// extraction of the file name from the full path via path.basename 

    //  displaying  temporary directory in the system
    const tempFilePath = path.join(os.tmpdir(), fileName);// here  the file name would be anchored to the temporary directory
    // attributting a name index for  the file 
    const thumbImageFilePath = path.join(os.tmpdir(), `imageThumb_${fileName}`);

    //  file process to thumbnail starts from here below

    try {
        // downloading  an object from the bucket to the  a temporary directory in  GCF MV    
        await bucket.file(filePath).download({
            destination: tempFilePath
        });
        console.log(`Downloaded to temp: ${tempFilePath}`);// tempFilePath temporary directory in GCS
        // thumbnail generation and resize
        await sharp(tempFilePath)
            .resize(300, 300, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 85, mozjpeg: true })
            .toFile(thumbImageFilePath);

        console.log('Thumbnail created:', thumbImageFilePath);


        // uploading thumbnail  to The GCs

        await bucket.upload(thumbImageFilePath, {
            destination: `thumbnails/thumb_${fileName}`,
            metadata: { // metadata prop description of the file and  instruction 
                contentType: 'image/jpeg',
                cacheControl: 'public, max-age=31536000'// keeping the file frech for the defined length of time max-age value 

            },

        });

        // uploading Thumbfile to  mongoDB;

        // first step construction and access to url for saving in the db 

        const photoThumFolder = `thumbnails/thumb_${fileName}`;
        const bucketName = bucket.name;
        const publicUrl = `https://storage.googleapis.com/${bucketName}/${photoThumFolder}`;

        // uploading the the pubilc url in db  specially updating the  thumbnailUrl prop  in image/photo doc 

        const imageDoc = await image.findOneAndUpdate(
            { originalImagePath: filePath },
            { thumbnailUrl: publicUrl },
            { upsert: false }
        )



        // clean up temp fil
        fs.unlinkSync(tempFilePath);
        fs.unlinkSync(thumbImageFilePath);



    } catch (err) {
        return console.log(" faild to generate  the image thumbnail", err)
    } finally {
        // Cleanup temp files in VM
        if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
        if (fs.existsSync(thumbImageFilePath)) fs.unlinkSync(thumbImageFilePath);
    }

    return null


})