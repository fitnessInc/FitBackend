// socket.js
const { Server } = require('socket.io');

let io; // Will hold the socket instance

function init(server) {
    io = new Server(server);
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

            // Emit message to the recipient
            io.to(users[recipient]).emit('content', { from: sender, content });
        });

        // Other socket event handlers...

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

// Export the init function to be called in your server file
module.exports = { init };