
 const express = require('express');
const http = require('http');
const messageRouter = require("./routes/message");
const profileRouter =  require('./routes/userProfile');
const userRouter = require('./routes/user')
const cors = require('cors');
const { client, connection } = require('./conectiondb/dbConnect');
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
app.use('/users',userRouter)

//port hostname//

const port = process.env.PORT || 3000;
const hostname = 'localhost';

//db connection//

connection().then(()=>{

    // Initialize Socket.io after DB connection//

    init(server);


     // Start the server only after the DB connection is successful//
    server.listen(port, hostname, () => {
        console.log(`Server running at http://${hostname}:${port}/`);
    });

}).catch((err) => {
    console.error('Failed to start the server because the DB connection failed.', err);
});