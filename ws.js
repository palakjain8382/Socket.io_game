// Establish a connection to the server
const socket = io('http://localhost:3000'); // Change the URL to your server URL

// Event listener for hosting a room
document.getElementById('hostRoomButton').addEventListener('click', () => {
    socket.emit('hostRoom');
});

// Event listener for receiving the created room ID
socket.on('roomCreated', (roomId) => {
    alert(`Room created! Room ID: ${roomId}`);
    window.location.href = `room.html?roomId=${roomId}`;
});
