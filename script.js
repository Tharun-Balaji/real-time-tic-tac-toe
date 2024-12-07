// Hide all the elements that are not needed until the user enters their name
document.getElementById("loading").style.display = "none"
document.getElementById("bigcont").style.display = "none"
document.getElementById("userCont").style.display = "none"
document.getElementById("oppNameCont").style.display = "none"
document.getElementById("valueCont").style.display = "none"
document.getElementById("whosTurn").style.display = "none"

const socket = io();

let name;

// When the user clicks the "search for a player" button, get the name they entered and send it to the server
document.getElementById('find').addEventListener("click", function () {
  // Get the name the user entered
  name = document.getElementById("name").value
  // Show the name in the "You: <name>" paragraph
  document.getElementById("user").innerText = name

  // If the user didn't enter a name, show an alert
  if (name == null || name == '') {
    alert("Please enter a name")
  }
  else {
    // Send the name to the server
    socket.emit("find", { name: name })

    // Show the loading animation and disable the search button
    document.getElementById("loading").style.display = "block"
    document.getElementById("find").disabled = true;
  }
})

// When the server sends a list of players, check if the user is in the list and show the game board if they are
socket.on("find", (e) => {
  // Extract the array of all players from the event
  let allPlayersArray = e.allPlayers;
  console.log("html", allPlayersArray);

  if (name !== '') {
    // Display the game board and relevant player information
    document.getElementById("userCont").style.display = "block";
    document.getElementById("oppNameCont").style.display = "block";
    document.getElementById("valueCont").style.display = "block";
    document.getElementById("loading").style.display = "none";
    document.getElementById("name").style.display = "none";
    document.getElementById("find").style.display = "none";
    document.getElementById("enterName").style.display = "none";
    document.getElementById("bigcont").style.display = "block";
    document.getElementById("whosTurn").style.display = "block";
    document.getElementById("whosTurn").innerText = "X's Turn";
  }

  // Variables to hold the opponent's name and the player's value (X or O)
  let oppName;
  let value;

  // Find the current user's object in the array of players
  const foundObject = allPlayersArray.find(obj => obj.p1.p1name === name || obj.p2.p2name === name);

  // Determine the opponent's name and the player's value based on the found object
  oppName = (foundObject.p1.p1name === name) ? foundObject.p2.p2name : foundObject.p1.p1name;
  value = (foundObject.p1.p1name === name) ? foundObject.p1.p1value : foundObject.p2.p2value;

  // Update the DOM with the opponent's name and the player's value
  document.getElementById("oppName").innerText = oppName;
  document.getElementById("value").innerText = value;

  // Disable buttons initially
  disableButtonsBasedOnTurn(foundObject.sum, value);
});

// Function to disable buttons based on whose turn it is
function disableButtonsBasedOnTurn(sum, playerValue) {
  const currentTurn = (sum % 2 == 0) ? 'X' : 'O';

  // Disable all buttons if it IS the current player's turn
  document.querySelectorAll(".btn").forEach(btn => {
    btn.disabled = (currentTurn === playerValue);
  });
}

// When the user clicks a button on the game board, send the move to the server
// Add event listeners to each button on the game board
document.querySelectorAll(".btn").forEach(e => {
  e.addEventListener("click", function () {
    // Get the current player's value (X or O)
    let value = document.getElementById("value").innerText;
    // Set the button's text to the current player's value
    e.innerText = value;

    // Emit a 'playing' event to the server with the current move details
    socket.emit("playing", { value: value, id: e.id, name: name });
  });
});

// When the server sends a move, update the game board and show whose turn it is
socket.on("playing", (e) => {
  // Find the current game object
  const foundObject = (e.allPlayers).find(obj => obj.p1.p1name == `${name}` || obj.p2.p2name == `${name}`);

  // Get the move details
  p1id = foundObject.p1.p1move
  p2id = foundObject.p2.p2move

  // Update the game board and show whose turn it is
  if ((foundObject.sum) % 2 == 0) {
    // Show that it's O's turn
    document.getElementById("whosTurn").innerText = "O's Turn"
  }
  else {
    // Show that it's X's turn
    document.getElementById("whosTurn").innerText = "X's Turn"
  }

  // Update the game board with the current moves
  if (p1id != '') {
    // Update the button text and disable it
    document.getElementById(`${p1id}`).innerText = "X"
    document.getElementById(`${p1id}`).disabled = true
    // Change the button text color to black
    document.getElementById(`${p1id}`).style.color = "black"
  }
  if (p2id != '') {
    // Update the button text and disable it
    document.getElementById(`${p2id}`).innerText = "O"
    document.getElementById(`${p2id}`).disabled = true
    // Change the button text color to black
    document.getElementById(`${p2id}`).style.color = "black"
  }

  // Disable buttons based on whose turn it is
  const playerValue = document.getElementById("value").innerText;
  disableButtonsBasedOnTurn(foundObject.sum, playerValue);

  // Check if the game is over
  check(name, foundObject.sum);
})

// Function to check if the game is over
function check(name, sum) {

  // Get the text of each button on the game board
  document.getElementById("btn1").innerText == '' ? b1 = "a" : b1 = document.getElementById("btn1").innerText
  document.getElementById("btn2").innerText == '' ? b2 = "b" : b2 = document.getElementById("btn2").innerText
  document.getElementById("btn3").innerText == '' ? b3 = "c" : b3 = document.getElementById("btn3").innerText
  document.getElementById("btn4").innerText == '' ? b4 = "d" : b4 = document.getElementById("btn4").innerText
  document.getElementById("btn5").innerText == '' ? b5 = "e" : b5 = document.getElementById("btn5").innerText
  document.getElementById("btn6").innerText == '' ? b6 = "f" : b6 = document.getElementById("btn6").innerText
  document.getElementById("btn7").innerText == '' ? b7 = "g" : b7 = document.getElementById("btn7").innerText
  document.getElementById("btn8").innerText == '' ? b8 = "h" : b8 = document.getElementById("btn8").innerText
  document.getElementById("btn9").innerText == '' ? b9 = "i" : b9 = document.getElementById("btn9").innerText


  // Check for a win
  if ((b1 == b2 && b2 == b3) || (b4 == b5 && b5 == b6) || (b7 == b8 && b8 == b9) || (b1 == b4 && b4 == b7) || (b2 == b5 && b5 == b8) || (b3 == b6 && b6 == b9) || (b1 == b5 && b5 == b9) || (b3 == b5 && b5 == b7)) {

    socket.emit("gameOver", { name: name });

    setTimeout(() => {

      sum % 2 == 0 ? alert("X WON !!") : alert("O WON !!")

      setTimeout(() => {
        location.reload()

      }, 2000)

    }, 100)

  }

  else if (sum == 10) {
    socket.emit("gameOver", { name: name });

    setTimeout(() => {

      alert("DRAW!!")

      setTimeout(() => {
        location.reload()

      }, 2000)

    }, 100)
  }

}