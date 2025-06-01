import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

// Fighter structure
interface Fighter {
  hp: number;
  currentAnimation: string;
  isDodging: boolean;
  cooldown: boolean;
}

const createFighter = (): Fighter => ({
  hp: 100,
  currentAnimation: "idle",
  isDodging: false,
  cooldown: false
});

let player: Fighter = createFighter();
let bot: Fighter = createFighter();

// Optional: Log history
// const actionLog: string[] = [];

function applyAction(actor: Fighter, target: Fighter, action: string) {
  setAnimation(actor, action);

  switch (action) {
    case "attack1":
      if (!target.isDodging) {
        target.hp = Math.max(target.hp - 15, 0);
        setAnimation(target, target.hp <= 0 ? "death" : "hit");
      }
      break;
    case "attack2":
      if (!target.isDodging) {
        target.hp = Math.max(target.hp - 10, 0);
        setAnimation(target, target.hp <= 0 ? "death" : "hit");
      }
      break;
    case "combo":
      if (!target.isDodging) {
        target.hp = Math.max(target.hp - 25, 0);
        setAnimation(target, target.hp <= 0 ? "death" : "hit");
      }
      break;
    case "heal":
      actor.hp = Math.min(actor.hp + 12, 100);
      break;
    case "dodge":
      if (!actor.isDodging) {
        actor.isDodging = true;
      }
      break;
  }

  // Optional: Log the action
  // logAction(actor === player ? "Player" : "Bot", action);
}

function setAnimation(fighter: Fighter, animation: string) {
  fighter.currentAnimation = animation;
}

// function logAction(actor: string, action: string) {
//   actionLog.push(`${actor} used ${action}`);
// }

function emitGameState() {
  io.emit("gameState", { player, bot /* , actionLog */ });
}

function resetGame() {
  player = createFighter();
  bot = createFighter();
  // actionLog.length = 0;
  emitGameState();
}

// Simple decision logic based on HP
function botChooseAction(): string {
  if (bot.hp < 30) {
    return Math.random() < 0.5 ? "heal" : "dodge";
  }
  const actions = ["attack1", "attack2", "dodge", "combo1"];
  return actions[Math.floor(Math.random() * actions.length)];
}

// Simulated quiz success rate
function botPassedQuiz(): boolean {
  return Math.random() < 0.65;
}

// Bot loop
setInterval(() => {
  if (player.hp <= 0 || bot.hp <= 0 || bot.cooldown) return;

  const action = botChooseAction();
  const passed = botPassedQuiz();

  if (!passed) {
    console.log("🤖 Bot failed quiz, skipping action:", action);
    return;
  }

  applyAction(bot, player, action);
  bot.cooldown = true;
  emitGameState();

  setTimeout(() => {
    bot.cooldown = false;
    bot.isDodging = false;
    if (bot.hp > 0) setAnimation(bot, "idle");
    emitGameState();
  }, 2000);
}, 5000);

// Socket.io events
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.emit("gameState", { player, bot /* , actionLog */ });

  socket.on("playerAction", (action: string) => {
    if (player.cooldown || player.hp <= 0 || bot.hp <= 0) return;

    applyAction(player, bot, action);
    player.cooldown = true;
    emitGameState();

    setTimeout(() => {
      player.cooldown = false;
      player.isDodging = false;
      if (player.hp > 0) setAnimation(player, "idle");
      emitGameState();
    }, 2000);
  });

  socket.on("restartGame", () => {
    if (player.hp <= 0 || bot.hp <= 0) resetGame();
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

server.listen(3001, () => {
  console.log("✅ Server running at http://localhost:3001");
});
