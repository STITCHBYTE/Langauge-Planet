const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});


// --- Bot Mode (Default Namespace) ---
function createFighter() {
  return {
    hp: 100,
    currentAnimation: "idle",
    isDodging: false,
    cooldown: false,
  };
}
let player = createFighter();
let bot = createFighter();

function setAnimation(fighter, animation) {
  fighter.currentAnimation = animation;
}

function applyAction(actor, target, action) {
  setAnimation(actor, action);
  

  switch (action) {
    case "attack1":
      target.hp = Math.max(target.hp - 15, 0);
      break;
    case "attack2":
      target.hp = Math.max(target.hp - 10, 0);
      break;
    case "combo":
      target.hp = Math.max(target.hp - 25, 0);
      break;
    case "heal":
      actor.hp = Math.min(actor.hp + 12, 100);
      return;
    case "dodge":
      actor.isDodging = true;
      return;
  }

  setAnimation(target, target.hp <= 0 ? "death" : "hit");
}



function emitBotGameState() {
  io.emit("gameState", { player, bot });
}

function resetBotGame() {
  player = createFighter();
  bot = createFighter();
  emitBotGameState();
}

function botChooseAction() {
  if (bot.hp < 30) return Math.random() < 0.5 ? "heal" : "dodge";
  const actions = ["attack1", "attack2", "combo", "dodge"];
  return actions[Math.floor(Math.random() * actions.length)];
}

function botPassedQuiz() {
  return Math.random() < 0.65;
}

setInterval(() => {
  if (player.hp <= 0 || bot.hp <= 0 || bot.cooldown) return;
  const action = botChooseAction();
  if (!botPassedQuiz()) return;

  applyAction(bot, player, action);
  bot.cooldown = true;
  emitBotGameState();

  setTimeout(() => {
    bot.cooldown = false;
    bot.isDodging = false;
    if (bot.hp > 0) setAnimation(bot, "idle");
    emitBotGameState();
  }, 2000);
}, 5000);

io.on("connection", (socket) => {
  console.log("🤖 Bot client connected:", socket.id);
  socket.emit("gameState", { player, bot });

  socket.on("playerAction", (action) => {
    if (player.cooldown || player.hp <= 0 || bot.hp <= 0) return;

    applyAction(player, bot, action);
    player.cooldown = true;
    emitBotGameState();

    setTimeout(() => {
      player.cooldown = false;
      player.isDodging = false;
      if (player.hp > 0) setAnimation(player, "idle");
      emitBotGameState();
    }, 2000);
  });

  socket.on("restartGame", () => {
    if (player.hp <= 0 || bot.hp <= 0) resetBotGame();
  });

  socket.on("disconnect", () => {
    console.log("🤖 Bot client disconnected:", socket.id);
  });
});

// --- Friend Mode (/friend namespace) ---
const friendNamespace = io.of("/friend");
const friendGames = new Map();

friendNamespace.on("connection", (socket) => {
  console.log("👥 Friend connected:", socket.id);

  socket.on("createRoom", () => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    socket.join(roomCode);
    friendGames.set(roomCode, {
      players: [socket.id],
      states: { [socket.id]: createFighter() },
    });

    console.log(`🆕 Room ${roomCode} created by ${socket.id}`);
    socket.emit("roomCreated", { success: true, roomCode });
  });

  socket.on("joinRoom", (roomCode) => {
  const game = friendGames.get(roomCode);
  console.log(`👥 ${socket.id} attempting to join room ${roomCode}`);

  if (!game) {
    return socket.emit("joinRoomResult", { success: false, message: "Room not found" });
  }

  if (game.players.length >= 2) {
    return socket.emit("joinRoomResult", { success: false, message: "Room is full" });
  }

  // Join and update game state
  socket.join(roomCode);
  game.players.push(socket.id);
  game.states[socket.id] = createFighter();

  // Notify both players
  friendNamespace.in(roomCode).emit("playersUpdated", { players: game.players });

  // Start game if 2 players present
  if (game.players.length === 2) {
    friendNamespace.in(roomCode).emit("startGame", {
      roomCode,
      players: game.players,
    });
  }

  // Respond to the joining player
  socket.emit("joinRoomResult", {
    success: true,
    roomCode,
    playerId: socket.id,
  });

  console.log(`✅ ${socket.id} joined room ${roomCode}`);
});

  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {
      if (roomId === socket.id) continue;
      const game = friendGames.get(roomId);
      if (!game) continue;

      game.players = game.players.filter((id) => id !== socket.id);
      delete game.states[socket.id];

      if (game.players.length === 0) {
  // Delay deletion by 50 seconds in case of quick reconnect
  setTimeout(() => {
    const currentGame = friendGames.get(roomId);
    if (currentGame && currentGame.players.length === 0) {
      friendGames.delete(roomId);
      console.log(`🗑️ Deleted empty room ${roomId}`);
    }
  }, 50000);
}

      else {
        friendNamespace.in(roomId).emit("playerLeft", socket.id);
        friendNamespace.in(roomId).emit("playersUpdated", { players: game.players });
      }
    }
  });
 socket.on("playerAction", ({ roomCode, action }) => {
  const game = friendGames.get(roomCode);
  if (!game) return;

  const playerState = game.states[socket.id];
  if (!playerState) return;

  let animation = null;

  switch (action) {
    case "attack1":
      animation = "attack1";
      const opponentId1 = game.players.find((id) => id !== socket.id);
      if (opponentId1 && game.states[opponentId1]) {
        game.states[opponentId1].hp = Math.max(0, game.states[opponentId1].hp - 10);
      }
      break;

    case "attack2":
      animation = "attack2";
      const opponentId2 = game.players.find((id) => id !== socket.id);
      if (opponentId2 && game.states[opponentId2]) {
        game.states[opponentId2].hp = Math.max(0, game.states[opponentId2].hp - 20);
      }
      break;

    case "combo":
      animation = "combo";
      const opponentId3 = game.players.find((id) => id !== socket.id);
      if (opponentId3 && game.states[opponentId3]) {
        game.states[opponentId3].hp = Math.max(0, game.states[opponentId3].hp - 30);
      }
      break;

    case "heal":
      animation = "heal";
      playerState.hp = Math.min(100, playerState.hp + 15);
      break;

    case "dodge":
      animation = "dodge";
      break;

    default:
      return; // unknown action
  }

  // Optional: add cooldown or other flags here
  // playerState.cooldown = true;

  // First emit actionResult for animation, etc.
  friendNamespace.in(roomCode).emit("actionResult", {
    actorId: socket.id,
    action,
    updatedStates: game.states,
  });

  // ✅ Emit full game state so frontend updates HP, etc.
  friendNamespace.in(roomCode).emit("gameState", {
    players: game.states,
  });

  console.log(`🎮 ${socket.id} performed ${action} in ${roomCode}`);
});


});

const PORT = process.env.PORT || 8082;
server.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
