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

    // Log socket events
    socket.onAny((event, ...args) => {
        console.log(`Event: ${event}, Args: `, args);
    });

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
        activeRooms[roomId].push({ id: playerId, name: playerName }); // Add host to the player list
        io.to(roomId).emit('updatePlayerList', activeRooms[roomId]); // Emit updated player list to all clients in the room

        // Log the received data
        console.log(`Room created: ${roomId}, Player name: ${playerName}`);
    });

// Emit the room details to the client after a player joins the room
socket.on('joinRoom', ({ roomId, playerName }) => {
    socket.join(roomId);
    const playerId = generatePlayerId();
    if (!activeRooms[roomId]) {
        activeRooms[roomId] = [];
    }
    // Emit 'roomJoined' event to the specific socket with room details
    socket.emit('roomJoined', { roomId, playerName });
    
    activeRooms[roomId].push({ id: playerId, name: playerName }); // Add joined player to the player list
    console.log('Player', playerName, 'joined Room', roomId);
    io.to(roomId).emit('updatePlayerList', activeRooms[roomId]); // Emit updated player list to all clients in the room

    // Emit room ID and player name back to the client
    socket.emit('roomDetails', { roomId, playerName });
});


    // Remove player from active rooms when disconnected
    socket.on('disconnect', () => {
        removePlayer(socket.id);
    });

    // Remove player from active rooms when disconnected
    function removePlayer(socketId) {
        for (const roomId in activeRooms) {
            const index = activeRooms[roomId].findIndex(player => player.id === socketId);
            if (index !== -1) {
                activeRooms[roomId].splice(index, 1);
                io.to(roomId).emit('updatePlayerList', activeRooms[roomId]); // Emit updated player list to all clients in the room
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
