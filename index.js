
const express = require('express');
const  http = require('http')
const messageRouter = require("./routes/message");
const cors = require('cors');
const socketIo = require('socket.io')



 const app = express();
 const server = http.createServer(app);
 

 app.use(express.json());
 app.use(cors());

 app.use('/messages', messageRouter);

 const io = socketIo(server);

 io.on('connection',(socket)=>{
    console.log("A User Connected  " , socket.id);

    

    socket.on('sendMessage', (message) => {
        console.log(`Received message: ${message}`);
        // Broadcast the message to all clients
        io.emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
 })
 


const port = process.env.PORT || 3000;
const hostname = 'localhost';

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

