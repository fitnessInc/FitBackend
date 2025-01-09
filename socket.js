const { Server } = require('socket.io');
const { client, connection } = require('./conectiondb/dbConnect');
const { ObjectId } = require('mongodb');


let io; // Will hold the socket instance

function init(server) {
    io = new Server(server,{
        cors:{
            origin:'*',
            methods:['GET','POST','DELET','UPDATE']
        }
    });
    const users = {};

    io.on('connection', (socket) => {
        console.log("A User Connected", socket.id);

        socket.on('registerUser', (username) => {
            users[username] = socket.id;
            console.log(`User ${username} registered with socket ID: ${socket.id}`);
        });

        socket.on('newMessage', async (data) => {
            const { sender, recipient, content } = data;
            const message = { sender, recipient, content, createdAt: new Date() };
            console.log(`Message: ${message}`);
            try {
                // Connect to the database
                await connection();
                const db = client.db('testDB');
                const collection = db.collection('messages');
                
                // Insert the message into the database
                await collection.insertOne(message);
                
                // Emit the message to the recipient if they are connected
                if (users[recipient]) {
                    io.to(users[recipient]).emit('newMessage', message);
                    console.log(`Message sent to recipient:${recipient}, message  :${content}`)
                } else {
                    console.log(`Recipient ${recipient} is not connected`);
                }
            } catch (err) {
                console.error('Error persisting message', err);
            }
        });

        // Handle content update
        socket.on('updateContent', async (data) => {
            const { id, newContent } = data;
            console.log('Update content:', data);

            try {
                await connection();
                const db = client.db('testDB');
                const collection = db.collection('messages');
                const objectId = new ObjectId(id);
                
                // Update the message content in the database
                const update = await collection.updateOne(
                    { _id: objectId },
                    { $set: { content: newContent } }
                );

                if (update.modifiedCount > 0) {
                    io.emit('updateContent', { id, newContent });
                } else {
                    console.log('Content not updated');
                }
            } catch (err) {
                console.log("Error updating message", err);
            }
        });

        socket.on('deleteContent', async (id) => {
            try {
                await connection();
                const db = client.db('testDB');
                const collection = db.collection('messages');
                const deleteOp = await collection.deleteOne({ _id: new ObjectId(id) });
                if (deleteOp.deletedCount > 0) {
                    io.emit('deleteContent', { id });
                }
            } catch (err) {
                console.log("Error deleting message", err);
            }
        });
       

        // Handle user disconnect
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
}

// Function to get the socket.io instance
function getIo() {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
}


// Export the init function to be called in your server file
module.exports = { init, getIo };
