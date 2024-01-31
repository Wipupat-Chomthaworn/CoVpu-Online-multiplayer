// app.js
const socket = io();
const playerNameSpan = document.getElementById('player-name');

socket.on('join_game_success', ({ success, message }) => {
  if (success) {
    handleSuccessfulJoin();
  } else {
    handleUnsuccessfulJoin(message);
  }
});

socket.on('start_turn', ({ currentPlayer }) => {
  handleStartTurn(currentPlayer);
});

socket.on('update_game_state', (gameState) => {
  updateGameState(gameState);
});

function handleSuccessfulJoin() {
  console.log('Successfully joined the game.');
}

function handleUnsuccessfulJoin(message) {
  console.error(`Failed to join the game: ${message}`);
}

function handleStartTurn(currentPlayer) {
  console.log(`It's now ${currentPlayer}'s turn.`);
}

function updateGameState(gameState) {
  console.log('Received updated game state:', gameState);
  playerNameSpan.textContent = `Your Name: ${gameState.currentPlayer}`;
  // Implement your logic to update the game UI based on the gameState
  // For example, update player hands, influence tokens, etc.
}

function performAction(action, targetPlayer) {
  socket.emit('perform_action', { action, targetPlayer });
}

const playerName = prompt('Enter your name:');
socket.emit('join_game', playerName);
