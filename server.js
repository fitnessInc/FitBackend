const express = require('express');
const  http = require('http')
const messageRouter = require("./routes/message");
const cors = require('cors');



 const app = express();

 app.use(express.json());
 app.use(cors());

 app.use('/messages', messageRouter);
 


const port = process.env.PORT || 3000;
const hostname = 'localhost';

app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

