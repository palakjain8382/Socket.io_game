// Function to show play options
function showPlayOptions() {
    // Hide the initial buttons
    document.getElementById("startGameButton").style.display = "none";
    document.getElementById("playWithFriendsButton").style.display = "none";
    // Show the play options container
    document.getElementById("playOptions").style.display = "block";
}

// Function to start the game
function startGame() {
    // Replace 'your_nodejs_api_url_for_start_game' with your actual API endpoint URL for starting the game
    fetch('http://localhost:3000/startGame')
        .then(response => {
            // Handle response as needed
            if (response.ok) {
                // Proceed to next page or handle response data
                window.location.href = 'next_page.html'; // Redirect to the next page
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .catch(error => {
            console.error('Error starting game:', error);
        });
}

// Function to join a friend's room
function joinRoom() {
    var roomId = document.getElementById("roomIdInput").value;
    var playerName = document.getElementById("playerNameInput").value;
  
    // Here you can perform any validation on the roomId and playerName
  
    // For demonstration, alert the entered values
    alert("Joining Room ID: " + roomId + "\nPlayer Name: " + playerName);
  
    // Close the modal after joining
    closeJoinRoomPopup();

    // Replace 'your_nodejs_api_url_for_join_room' with your actual API endpoint URL for joining a room
    fetch('your_nodejs_api_url_for_join_room', {
        method: 'POST', // Or 'GET', 'PUT', etc.
        headers: {
            'Content-Type': 'application/json',
            // Add any additional headers as needed
        },
        body: JSON.stringify({
            roomId: roomId,
            playerName: playerName
        })
    })
    .then(response => {
        // Handle response as needed
        if (response.ok) {
            // Proceed to next page or handle response data
            window.location.href = 'next_page.html'; // Redirect to the next page
        } else {
            throw new Error('Network response was not ok.');
        }
    })
    .catch(error => {
        console.error('Error joining room:', error);
    });
}

// Function to host a room
function hostRoom() {
    // Replace 'your_nodejs_api_url_for_host_room' with your actual API endpoint URL for hosting a room
    fetch('your_nodejs_api_url_for_host_room')
        .then(response => {
            // Handle response as needed
            if (response.ok) {
                // Proceed to next page or handle response data
                window.location.href = 'next_page.html'; // Redirect to the next page
            } else {
                throw new Error('Network response was not ok.');
            }
        })
        .catch(error => {
            console.error('Error hosting room:', error);
        });
}

// Function to show join room popup
function showJoinRoomPopup() {
  var modal = document.getElementById("joinRoomModal");
  modal.style.display = "block";
}

// Function to close join room popup
function closeJoinRoomPopup() {
  var modal = document.getElementById("joinRoomModal");
  modal.style.display = "none";
}
