const fs = require('fs');
const path = require('path');
const {bucket} = require('./firebaseConfig');


async function  uploadFile(filePath,usreId){
     

         

            try{
                const fileName = ` metadata/${usreId}/${Date.now()}_${path.basename(filePath)}`;
                const file = bucket.file(fileName);
                await  file.save(fs.readFileSync(filePath),{resumable:false});
                await file.makePublic();

                
                return{
                    sucess:true,
                    url:`https://storage.googleapis.com/${bucket.name}/${fileName}`
                }


            }catch(error){
                reject(`Failed to upload ${filePath}: ${error.message}`);
                
            }
              
        
   
        
}

module.exports= uploadFile
