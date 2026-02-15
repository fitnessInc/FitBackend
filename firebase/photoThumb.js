const fs = require('fs');
const path = require('path');
const functions = require("firebase-functions");
const { getStorage } = require("firebase-admin/storage");
const sharp = require("sharp");
const os = require('os')




exports.imageThumb = functions.storage.object.onFinalize(async (object) => {

    if (!object.contentType || !object.contentType.startsWith('image/')) {
        console.log("Skipping non image  ", object.name);
        return null
    }

    if (object.name.startsWith('thumbnails/')) {
        console.log('Skipping thumbnail:', object.name);
        return null;
    }
    const bucket = getStorage().bucket();
    const fileName = path.basename(object.name);
    const filePath = object.name;

    const tempFilePath = path.join(os.tmpdir(), fileName);
    const thumbImageFilePath = path.join(os.tmpdir(), `imageThumb_${fileName}`);

    try {
        // downloading  an object from the bucket to the  a temporary directory in  GCF MV    
        await bucket.file(filePath).download({
            destination: tempFilePath
        });
        console.log(`Downloaded to temp: ${tempFilePath}`);
        // thumbnail generation and resize
        await sharp(tempFilePath)
            .resize(300, 300, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 85, mozjpeg: true })
            .toFile(thumbImageFilePath);

        console.log('Thumbnail created:', thumbPath);


        // uploading thumbnail  to The GC

        await bucket.upload(thumbImageFilePath, {
            destination: `thumbnails/thumb_${fileName}`,
            metadata: { contentType: 'image/jpeg' }
        })

        // clean up temp fil
            fs.unlinkSync(tempFilePath);
            fs.unlinkSync(thumbImageFilePath);



    } catch (err) {
        return console.log(" faild to generate  the image thumbnail", err)
    }finally {
    // Cleanup temp files in VM
    if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
    if (fs.existsSync(thumbImageFilePath)) fs.unlinkSync(thumbImageFilePath);
  }

    return null 


})