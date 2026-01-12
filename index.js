console.log('CWD:', process.cwd());
console.log('ENV URI:', process.env.MONGODB_URI);
require('dotenv').config();

if (!process.env.MONGODB_URI){
    throw new Error('db uri is  undefined ')
};
 const express = require('express');
const http = require('http');
const messageRouter = require("./routes/message");
const profileRouter =  require('./routes/userProfile');
const userRouter = require('./routes/user');
const uploadRouter = require('./routes/fileUpload')
const cors = require('cors');

const db= require('./conectiondb/dbConnect')
const { init } = require('./socket');

      

//  creation of express application //
const app = express();
const server = http.createServer(app);

//middleware//
  
app.use(express.json());
app.use(cors());


//routes//
app.use('/messages', messageRouter);
app.use('/profiles' ,profileRouter);
app.use('/users',userRouter);
app.use('/uploads', uploadRouter)

//port hostname//

const port = process.env.PORT || 3000;
const hostname = 'localhost';
// console.log("environemt var:",process.env)

//db connection//

(async ()=>{
    try{
        await db.connect();// data base connection 
    init(server)// second sock.Io connection 
 

    // then server boostrap 
     server.listen(port,hostname,()=>{
        console.log(`the middle man is running at http://${hostname}:${port}`);
     })
    }catch(err){
        console.log('faild to boostrap the middle man ', err );
        process.exit(1)
    }
})();

const shutdown = async()=>{
    console.log('middle man is shutting down');
    await db.disconnect();
    server.close(()=>process.exit(0))
};

process.on('SIGINT', shutdown);// will be fire in production mode
process.on('SIGTERM', shutdown);// will be fire in production mode