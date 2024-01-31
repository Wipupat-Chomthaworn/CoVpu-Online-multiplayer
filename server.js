// server.js
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

class CoupGame {
  constructor() {
    this.players = [];
    this.currentPlayerIndex = 0;
    this.deck = ['Duke', 'Duke', 'Duke', 'Assassin', 'Assassin', 'Captain', 'Captain', 'Ambassador', 'Ambassador', 'Contessa', 'Contessa'];
    this.shuffleDeck();
    this.playerHands = {};
  }

  shuffleDeck() {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  addPlayer(playerName) {
    if (this.players.length < 5) {
      this.players.push(playerName);
      this.playerHands[playerName] = [this.drawCard(), this.drawCard()];
      return true;
    } else {
      return false; // Game is full
    }
  }

  drawCard() {
    if (this.deck.length > 0) {
      return this.deck.pop();
    } else {
      return null; // Deck is empty
    }
  }

  startGame() {
    this.shuffleDeck();
    this.currentPlayerIndex = 0;
    io.emit('update_game_state', this.getGameState());
    this.startTurn();
  }

  startTurn() {
    io.emit('start_turn', { currentPlayer: this.players[this.currentPlayerIndex] });
  }

  performAction(playerName, action, targetPlayer) {
    switch (action) {
      case 'Income':
        this.incomeAction(playerName);
        break;
      case 'Foreign Aid':
        this.foreignAidAction(playerName, targetPlayer);
        break;
      case 'Coup':
        this.coupAction(playerName, targetPlayer);
        break;
      // Add cases for other actions
      default:
        break;
    }
  }

  incomeAction(playerName) {
    // Handle Income action logic
    this.gainCoins(playerName, 1);
    this.advanceTurn();
  }

  foreignAidAction(playerName, targetPlayer) {
    // Handle Foreign Aid action logic
    if (!this.blockAction(playerName, 'Duke')) {
      this.gainCoins(playerName, 2);
      this.advanceTurn();
    }
  }

  coupAction(playerName, targetPlayer) {
    // Handle Coup action logic
    if (this.coinsAvailable(playerName) >= 7) {
      this.payCoins(playerName, 7);
      this.eliminateInfluence(playerName, targetPlayer);
    }
    this.advanceTurn();
  }

  blockAction(playerName, blockingCard) {
    // Implement blocking logic if needed
    // For simplicity, return false (no blocking)
    return false;
  }

  eliminateInfluence(playerName, targetPlayer) {
    // Implement influence elimination logic if needed
    // For simplicity, do nothing
  }

  advanceTurn() {
    // Move to the next player's turn
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    io.emit('update_game_state', this.getGameState());
    this.startTurn();
  }

  getGameState() {
    return {
      players: this.players,
      currentPlayer: this.players[this.currentPlayerIndex],
      playerHands: this.playerHands,
    };
  }

  gainCoins(playerName, amount) {
    // Implement coin gain logic if needed
    // For simplicity, do nothing
  }

  coinsAvailable(playerName) {
    // Implement coin availability logic if needed
    // For simplicity, return a fixed value (e.g., 0)
    return 0;
  }

  payCoins(playerName, amount) {
    // Implement coin payment logic if needed
    // For simplicity, do nothing
  }
}

const coupGame = new CoupGame();

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join_game', (playerName) => {
    const success = coupGame.addPlayer(playerName);

    if (success) {
      socket.emit('join_game_success', { success: true });
      io.emit('update_game_state', coupGame.getGameState());

      if (coupGame.players.length === 5) {
        coupGame.startGame();
      }
    } else {
      socket.emit('join_game_success', { success: false, message: 'Game is full.' });
    }
  });

  socket.on('perform_action', ({ action, targetPlayer }) => {
    coupGame.performAction(socket.id, action, targetPlayer);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
server.js