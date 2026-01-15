const { Server } = require('socket.io');
const { client, connection } = require('./conectiondb/dbConnect');
const { ObjectId } = require('mongodb');
const Message = require('./shemas/messageSchema')


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

        socket.on('newMessage', async ({sender,recipient,content}) => {
     
        
            try {
                   // create new message documment in mongo via mongoose 

                   const message=  await new Message.create({
                      sender,
                      recipient,
                      content
                   });

                   console.log(' message inserted in the db', message)
                 
                
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
        socket.on('updateContent', async ({id, newContent}) => {
            console.log( id , newContent);

            try {
              const updated= await Message.findByIdAndUpdate(
                id,
                {conten:newContent},
                {new:true}
              )
                
                
                // emiting the updated content
                if (updated) {
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
                  const deleted = await Message.findByIdAndDelete(id)

                  
                if (deleted) {
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
