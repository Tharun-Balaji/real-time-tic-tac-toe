// Import Express.js to create a simple web server
const express = require("express")
const app = express()

// Import the path module to easily resolve file paths
const path = require("path")

// Import the built-in HTTP module to create an HTTP server
const http = require("http")

// Import the Socket.IO module to create a Socket.IO server
// which will handle real-time communication with clients
const { Server } = require("socket.io")

// Create an HTTP server and wrap the express app
const server = http.createServer(app)

// Create a new Socket.IO server and attach it to the HTTP server
const io = new Server(server)

// Serve static files from the root directory
app.use(express.static(path.resolve("")))

// Arrays to hold player names and game sessions
let arr = []
let playingArray = []

// Listen for new connections from clients
io.on("connection", (socket) => {

  // Listen for 'find' event when a user searches for a player
  // Listen for 'find' event when a user searches for a player
  socket.on("find", (e) => {
    if (e.name != null) { // Ensure the name is not null
      arr.push(e.name) // Add the user's name to the array

      // If there are at least two players, create a new game session
      if (arr.length >= 2) {
        // Create objects for the two players in the game session
        let p1obj = {
          p1name: arr[0], // Name of the first player
          p1value: "X", // The first player is X
          p1move: "" // Initialize the player's move to an empty string
        }
        let p2obj = {
          p2name: arr[1], // Name of the second player
          p2value: "O", // The second player is O
          p2move: "" // Initialize the player's move to an empty string
        }

        // Create a new game session object
        let obj = {
          p1: p1obj, // Add the first player's object to the session
          p2: p2obj, // Add the second player's object to the session
          sum: 1 // Initialize the sum to track moves
        }

        // Add the new game session to the array of all game sessions
        playingArray.push(obj)

        // Remove the paired players from the waiting list
        arr.splice(0, 2)

        // Emit the updated list of all game sessions to all clients
        io.emit("find", { allPlayers: playingArray })
      }
    }
  })


  // Listen for 'playing' event when a player makes a move
  socket.on("playing", (e) => {
    // Check if the player is 'X'
    if (e.value == "X") {
      // Find the game session object for the player making the move
      let objToChange = playingArray.find(obj => obj.p1.p1name === e.name)
      // Update the move ID for player 'X'
      objToChange.p1.p1move = e.id
      // Increment the move count
      objToChange.sum++
    }
    // Check if the player is 'O'
    else if (e.value == "O") {
      // Find the game session object for the player making the move
      let objToChange = playingArray.find(obj => obj.p2.p2name === e.name)
      // Update the move ID for player 'O'
      objToChange.p2.p2move = e.id
      // Increment the move count
      objToChange.sum++
    }

    // Emit the updated list of all game sessions to all clients
    io.emit("playing", { allPlayers: playingArray })
  })

  // Listen for 'gameOver' event when a game ends
  socket.on("gameOver", (e) => {
    // Remove the game session for the player whose game is over
    playingArray = playingArray.filter(obj => obj.p1.p1name !== e.name)
    console.log(playingArray) // Log the updated game sessions for debugging
  })
})

// Serve the main HTML file for the root route
app.get("/", (req, res) => {
  return res.sendFile("index.html")
})

// Start the HTTP server on the specified port
const PORT = process.env.PORT || 3000
server.listen(PORT, () => {
  console.log("port connected to %i...", PORT)
})
