
require('dotenv').config();

if (!process.env.MONGODB_URI){
    throw new Error('db uri is  undefined ')
};
 const express = require('express');
const http = require('http');
const profileRouter =  require('./routes/userProfile');
const userRouter = require('./routes/user');
const uploadRouter = require('./routes/fileUpload');
const galleryThumbUrl= require('./routes/thumbnailUrl');


const cors = require('cors');
const db= require('./conectiondb/dbConnect')


      
const app = express();
const server = http.createServer(app);

  
app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send('API is running'));


app.use('/profiles' ,profileRouter);
app.use('/users',userRouter);
app.use('/upload',uploadRouter);
app.use('/gaThumbUrl',galleryThumbUrl);

const port = process.env.PORT || 3000;
const hostname = '0.0.0.0';


(async ()=>{
    try{
        await db.connect();
    

     server.listen(port,hostname,()=>{
        console.log(`the middle man is running at http://${hostname}:${port}`);
     })
    }catch(err){
        console.log('faild to boostrap the middle man ', err );
        process.exit(1)
    }
})();

let shuttingDown = false;

const shutdown = async(signal)=>{
    if(shuttingDown) return;
     shuttingDown =true;
     console.log(`middle man is shutting down (${signal})`);

  setTimeout(() => process.exit(1), 10000).unref(); // safety net

   server.close(async ()=>{
    try{
         await db.disconnect();

    }catch (err) {
      console.log('error during shutdown', err);
    }
    process.exit(0)

   })
    
   
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);