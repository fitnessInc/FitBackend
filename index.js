
 const express = require('express');
const http = require('http');
const messageRouter = require("./routes/message");
const cors = require('cors');
const { client, connection } = require('./conectiondb/dbConnect');
const { init } = require('./socket');

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());



app.use('/messages', messageRouter);

const port = process.env.PORT || 3000;
const hostname = 'localhost';

init(server); // Initialize socket.io here

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});