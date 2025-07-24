import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});
const createFighter = () => ({
    hp: 100,
    currentAnimation: "idle",
    isDodging: false,
    cooldown: false
});
let player = createFighter();
let bot = createFighter();
function applyAction(actor, target, action) {
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
}
function setAnimation(fighter, animation) {
    fighter.currentAnimation = animation;
}
function emitGameState() {
    io.emit("gameState", { player, bot});
}
function resetGame() {
    player = createFighter();
    bot = createFighter();
    emitGameState();
}
function botChooseAction() {
    if (bot.hp < 30) {
        return Math.random() < 0.5 ? "heal" : "dodge";
    }
    const actions = ["attack1", "attack2", "dodge", "combo1"];
    return actions[Math.floor(Math.random() * actions.length)];
}
function botPassedQuiz() {
    return Math.random() < 0.65;
}
setInterval(() => {
    if (player.hp <= 0 || bot.hp <= 0 || bot.cooldown)
        return;
    const action = botChooseAction();
    const passed = botPassedQuiz();
    if (!passed) {
        return;
    }
    applyAction(bot, player, action);
    bot.cooldown = true;
    emitGameState();
    setTimeout(() => {
        bot.cooldown = false;
        bot.isDodging = false;
        if (bot.hp > 0)
            setAnimation(bot, "idle");
        emitGameState();
    }, 2000);
}, 5000);
io.on("connection", (socket) => {
    socket.emit("gameState", { player, bot });
    socket.on("playerAction", (action) => {
        if (player.cooldown || player.hp <= 0 || bot.hp <= 0)
            return;
        applyAction(player, bot, action);
        player.cooldown = true;
        emitGameState();
        setTimeout(() => {
            player.cooldown = false;
            player.isDodging = false;
            if (player.hp > 0)
                setAnimation(player, "idle");
            emitGameState();
        }, 2000);
    });
    socket.on("restartGame", () => {
        if (player.hp <= 0 || bot.hp <= 0)
            resetGame();
    });
    socket.on("disconnect", () => {
    });
});
server.listen(3001, () => {
    console.log("✅ Server running at http://localhost:3001");
});
