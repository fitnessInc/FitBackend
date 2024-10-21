
const express = require('express');
const http = require('http')
const messageRouter = require("./routes/message");
const cors = require('cors');
const socketIo = require('socket.io')
const {client,connection}= require('./conectiondb/dbConnect');
const { ObjectId } = require('mongodb');
const {init} = require('./socket')



const app = express();
const server = http.createServer(app);


app.use(express.json());
app.use(cors());

app.use('/messages', messageRouter);

const io = socketIo(server);

const users = {};

io.on('connection', (socket) => {
    console.log("A User Connected  ", socket.id);

    socket.on('registerUser', (username) => {
        users[username] = socket.id;
        console.log(`User ${username} registered with socket ID: ${socket.id}`);
    });



    socket.on('newMessage', async(data) => {
        const{sender, recipient,content}=data;
        const message= {sender,recipient,content,createdAt:new Date()}
        console.log(` message: ${message}`);

        try{
            await connection();
            const db = client.db('testDB');
            const collection = db.collection('messages');
            await collection.insertOne(message);
            io.to(users[recipient]).emit('content',{from:sender,content})

        
        }catch (err){
            console.log('error  persisting message',err)

        }
        

    });

    socket.on('updateContent',async(data)=>{

        const {id,newContent}= data;
        console.log(data);

        try{
            await connection();
            const db = client.db('testDB');
            const collection= db.collection('message');
            const objectId = new ObjectId(id);
           const update= await collection.updateOne(
                {_id:objectId},
                {$set:{content:newContent}}

            )

            if(update.modifiedCount>0){
                io.emit('updateContent',{id,newContent})
            }else{
                console.log('Content is not updated');

            }
        }catch(err){
            console.log("error updating message",err)
        }

    })

    socket.on('deleteContent', async (id) => {

        try{
            await connection();
            const db = client.db('testDB');
            const collection = db.collection('messages');
            const deleteOp = await collection.deleteOne({_id: new  ObjectId(id)});
            if(deleteOp.deletedCount>0){
                io.emit('deletContent',{id})
            }
        }catch(err){
            console.log("error deleting message",err)
        }
        

    });

    socket.on('disconnect', () => {
        for (const username in users) {
            if (users[username] === socket.id) {
                delete users[username];
                console.log(`User ${username} disconnected`);
                break;
            }
            
            
        }

    });

});

init(server);

const port = process.env.PORT || 3000;
const hostname = 'localhost';

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

