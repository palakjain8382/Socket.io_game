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

        // Add the host player to the active room
        activeRooms[roomId].push({ playerId, playerName });

        // Emit 'roomCreated' event with roomId and playerId
        socket.emit('roomCreated', { roomId, playerId, playerName });

        // Emit updated player list to all clients in the room
        io.to(roomId).emit('updatePlayerList', { roomId, players: activeRooms[roomId] });
        consolePlayerList();

        // Log the received data
        console.log(`Room created: ${roomId}, Player name: ${playerName}`);
    });

// Join a room
socket.on('joinRoom', ({ roomId, playerName }) => {
    socket.join(roomId);
    const playerId = generatePlayerId();
    
    // If the room doesn't exist, create it
    if (!activeRooms[roomId]) {
        activeRooms[roomId] = [];
    }

    // Add the joined player to the active room
    activeRooms[roomId].push({ playerId, playerName });

    // Emit room ID and player name back to the client
    socket.emit('roomDetails', { roomId, playerName });

    // Emit 'roomJoined' event to the specific socket with room details
    socket.emit('roomJoined', { roomId, playerName });

     // Emit updated player list to the client who just joined
     socket.emit('updatePlayerList', { roomId, players: activeRooms[roomId] });
    // Log the player joining the room
    console.log('Player', playerName, 'joined Room', roomId);

    // Log the updated player list
    console.log('Updated Player List for Room', roomId, ':', activeRooms[roomId]);

    // Emit updated player list to all clients in the room after adding the player
    io.to(roomId).emit('updatePlayerList', { roomId, players: activeRooms[roomId] });

    // Log the player list after updating
    consolePlayerList();
});



    // Remove player from active rooms when disconnected
    // socket.on('disconnect', () => {
    //     removePlayer(socket.id);
    //     consolePlayerList();
    // });

// Remove player from active rooms when disconnected
// function removePlayer(socketId) {
//     for (const roomId in activeRooms) {
//         const index = activeRooms[roomId].findIndex(player => player.playerId === socketId);
//         if (index !== -1) {
//             const removedPlayer = activeRooms[roomId].splice(index, 1)[0];
//             io.to(roomId).emit('updatePlayerList', { roomId, players: activeRooms[roomId] });
//             console.log(`Player ${removedPlayer.playerName} disconnected from Room ${roomId}`);
//             break;
//         }
//     }
// }

    // Generate a random room ID
    function generateRoomId() {
        return Math.random().toString(36).substring(2, 8);
    }

    // Generate a random player ID
    function generatePlayerId() {
        return socket.id; // You can use the socket ID as the player ID
    }
});


function consolePlayerList(){
    // Log list of all players
console.log('List of all players:');
for (const roomId in activeRooms) {
    console.log(`Room: ${roomId}`);
    console.log('Players:');
    activeRooms[roomId].forEach(player => {
        console.log(`Player ID: ${player.playerId}, Player Name: ${player.playerName}`);
    });
    console.log(" -- ", activeRooms[roomId])
}

}

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
