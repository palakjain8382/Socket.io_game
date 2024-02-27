const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: '*',
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
    console.log('A user connected', socket.id);

    // Log socket events
    socket.onAny((event, ...args) => {
        console.log(`Event: ${event}, Args: `, args);
    });

   // Host a new room
socket.on('hostRoom', (playerName) => {
    console.log({
        method: 'socket.on.hostRoom',
        playerName
    });

    const roomId = generateRoomId(); // Room ID generated here
    const playerId = generatePlayerId();

    socket.join(roomId);

    // Initialize activeRooms[roomId] as an empty array if it's undefined
    if (!activeRooms[roomId]) {
        activeRooms[roomId] = {
            playerInfo: [{ playerId, playerName }],
            playerChats: []
        };
    }

    // Emit 'roomCreated' event with roomId and playerId
    socket.emit('roomCreated', { roomId, playerId, playerName });

    // Emit updated player list to all clients in the room
    io.to(roomId).emit('updatePlayerList', activeRooms[roomId].playerInfo);

    // Log the received data
    console.log(`Room created: ${roomId}, Player name: ${playerName}`);
});


    // Listen for startGame event
    socket.on('startGame', (roomId) => {
        // Broadcast redirectToStartGame event to all clients in the room
        io.to(roomId).emit('redirectToStartGame');
    });

// Listen for fetchPlayersList event, not fetchPlayerList
socket.on('fetchPlayersList', (roomId) => {
    if (activeRooms[roomId]) {
        console.log(activeRooms[roomId].playerInfo);
        io.to(roomId).emit('sendPlayersList', activeRooms[roomId].playerInfo);
    } else {
        console.log(`Room with ID ${roomId} does not exist.`);
    }
});




// Join a room
    socket.on('joinRoom', ({roomId, playerName}) => {
        console.log({
            method: 'socket.on.joinRoom',
            roomId,
            playerName
        });

        socket.join(roomId);
        const playerId = generatePlayerId();

        // If the room doesn't exist, create it
        if (!activeRooms[roomId]) {
            activeRooms[roomId] = {
                playerInfo: [],
                playerChats: []
            };
        }

        // Add the joined player to the active room
        activeRooms[roomId].playerInfo.push({playerId, playerName});

        // Emit room ID and player name back to the client
        socket.emit('roomDetails', {roomId, playerName});

        // Emit 'roomJoined' event to the specific socket with room details
        socket.emit('roomJoined', {roomId, playerName});

        // Log the player joining the room
        console.log('Player', playerName, 'joined Room', roomId);

        // Emit updated player list to all clients in the room after adding the player
        io.to(roomId).emit('updatePlayerList', activeRooms[roomId].playerInfo);

        // Log the player list after updating
        // consolePlayerList();
    });


    // Generate a random room ID
    function generateRoomId() {
        return Math.random().toString(36).substring(2, 8);
    }

    // Generate a random player ID
    function generatePlayerId() {
        return socket.id; // You can use the socket ID as the player ID
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
