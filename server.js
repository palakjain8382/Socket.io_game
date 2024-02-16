const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://localhost:8080',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

// Serve static files from the 'ui' directory
app.use(express.static('ui'));

// Store active rooms and their players
const activeRooms = {};

// Listen for socket connections
io.on('connection', (socket) => {
    console.log('A user connected');

    // Host a new room
    socket.on('hostRoom', (playerName) => {
        const roomId = generateRoomId(); // Room ID generated here
        const playerId = generatePlayerId();
        socket.join(roomId);
        // Initialize activeRooms[roomId] as an empty array if it's undefined
        if (!activeRooms[roomId]) {
            activeRooms[roomId] = [];
        }
        // Emit 'roomCreated' event with roomId and playerId
        socket.emit('roomCreated', { roomId, playerId, playerName }); // Emit to the specific socket
        
        // Log the received data
        console.log(`Room created: ${roomId}, Player name: ${playerName}`);
    });

    // Join a room
    socket.on('joinRoom', ({ roomId, playerName }) => {
        socket.join(roomId);
        const playerId = generatePlayerId();
        // Initialize activeRooms[roomId] as an empty array if it's undefined
        if (!activeRooms[roomId]) {
            activeRooms[roomId] = [];
        }
        // Push player information into the room's array
        activeRooms[roomId].push({ id: playerId, name: playerName });
        console.log('Player', playerName, 'joined Room', roomId);
        io.to(roomId).emit('updatePlayerList', activeRooms[roomId]);
    });

    // Remove player from active rooms when disconnected
    function removePlayer(socketId) {
        for (const roomId in activeRooms) {
            const index = activeRooms[roomId].findIndex(player => player.id === socketId);
            if (index !== -1) {
                activeRooms[roomId].splice(index, 1);
                io.to(roomId).emit('updatePlayerList', activeRooms[roomId]);
                break;
            }
        }
    }

    // Generate a random room ID
    function generateRoomId() {
        return Math.random().toString(36).substring(2, 8);
    }

    // Generate a random player ID
    function generatePlayerId() {
        return Math.random().toString(36).substring(2, 8);
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});