const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new socketIo.Server(server, {
  cors: {
    origin: "http://localhost:8080", // Change this to your client's origin
    methods: ["GET", "POST"] // Add any additional methods you need
  }
});

const PORT = process.env.PORT || 3000;

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });

    // Handle host room
    socket.on('hostRoom', () => {
        // Generate a unique room ID (You can use any logic here to generate room ID)
        const roomId = Math.random().toString(36).substring(2, 8);

        console.log('Room created:', roomId);

        // Send the room ID to the client
        socket.emit('roomCreated', roomId);
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
