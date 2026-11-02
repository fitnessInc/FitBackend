const fs = require('fs');
const path = require('path');
const {bucket} = require('./firebaseConfig');


async function  uploadFile(filePath,userId){
     

        const fileName = ` metadata/${userId}/${Date.now()}_${path.basename(filePath)}`;
        const file = bucket.file(fileName);

        return new Promise((resolve, reject) => {
        // Create a write stream to Cloud Storage
        const writeStream = file.createWriteStream({
            resumable: true,  // Enables resumable uploads for large files
            metadata: {
                contentType: getContentType(filePath), // Optional: set MIME type
            },
        });
        
        // Create a read stream from the local file
        const readStream = fs.createReadStream(filePath);
        
        // Handle stream events
        readStream.on('error', (err) => {
            reject(new Error(`Failed to read file: ${err.message}`));
        });
        
        writeStream.on('error', (err) => {
            reject(new Error(`Failed to upload: ${err.message}`));
        });
        
        writeStream.on('finish', async () => {
            // Optionally make public for testing
            // await file.makePublic();
            resolve({
                success: true,
                url: `https://storage.googleapis.com/${bucket.name}/${fileName}`
            });
        });
        
        // Pipe the file data from local file to Cloud Storage
        readStream.pipe(writeStream);
    }); 
               
   
        
}

module.exports= uploadFile
