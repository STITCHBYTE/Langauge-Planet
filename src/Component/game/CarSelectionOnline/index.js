const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = new Map();
const clients = new Map();

console.log("🚀 Typing Race WebSocket server starting...");

const RACE_LENGTH = 100;
const BASE_SPEED = 0.2;
const BOOST_AMOUNT = 3.0;
const BOOST_DECAY = 0.05;
const GAME_TICK_RATE = 50;

function broadcastToRoom(roomId, message, excludeId = null) {
    const room = rooms.get(roomId);
    if (!room) return;
    room.players.forEach(player => {
        if (player.id !== excludeId && player.ws.readyState === WebSocket.OPEN) {
            player.ws.send(JSON.stringify(message));
        }
    });
}

function startGameLoop(roomId) {
    const room = rooms.get(roomId);
    if (!room || room.gameInterval) return;
    console.log(`🏁 Starting game loop for room: ${roomId}`);
    room.gameState.status = 'racing';
    const totalQuestions = 3;
    const gameInterval = setInterval(() => {
        const room = rooms.get(roomId);
        if (!room || room.gameState.status !== 'racing') {
            clearInterval(gameInterval);
            return;
        }
        let winner = null;
        room.players.forEach(player => {
            player.progress += BASE_SPEED;
            if (player.boost > 0) {
                player.progress += player.boost;
                player.boost = Math.max(0, player.boost - BOOST_DECAY);
            }
            player.progress = Math.min(RACE_LENGTH, player.progress);
            if (
                player.progress >= RACE_LENGTH &&
                player.questionsAnswered >= totalQuestions &&
                !winner
            ) {
                winner = player;
            }
        });
        const positions = {
            player1: room.players.find(p => p.playerNum === 1)?.progress || 0,
            player2: room.players.find(p => p.playerNum === 2)?.progress || 0,
        };
        broadcastToRoom(roomId, { type: 'GAME_STATE_UPDATE', positions });
        if (winner) {
            console.log(`🏆 Winner found in room ${roomId}: Player ${winner.playerNum}`);
            room.gameState.status = 'finished';
            room.gameState.winner = winner.playerNum;
            broadcastToRoom(roomId, { type: 'GAME_OVER', winner: winner.playerNum });
            clearInterval(gameInterval);
            room.gameInterval = null;
        }
    }, GAME_TICK_RATE);
    room.gameInterval = gameInterval;
}

wss.on('connection', (ws) => {
    ws.id = uuidv4();
    clients.set(ws.id, { ws });
    console.log(`✅ Client connected: ${ws.id}`);
    ws.send(JSON.stringify({ type: 'CLIENT_CONNECTED', clientId: ws.id }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            const clientInfo = clients.get(ws.id);
            const roomId = clientInfo ? clientInfo.roomId : null;
            const room = roomId ? rooms.get(roomId) : null;
            switch (data.type) {
                case 'JOIN_ROOM': {
                    const targetRoomId = data.roomId;
                    let roomToJoin = rooms.get(targetRoomId);
                    if (!roomToJoin) {
                        roomToJoin = {
                            id: targetRoomId,
                            players: [],
                            gameState: { status: 'waiting' },
                            gameInterval: null
                        };
                        rooms.set(targetRoomId, roomToJoin);
                        console.log(`🚪 Room created: ${targetRoomId}`);
                    }
                    if (roomToJoin.players.length >= 2) {
                        ws.send(JSON.stringify({ type: 'ERROR', message: 'Room is full.' }));
                        return;
                    }
                    const playerNum = roomToJoin.players.length === 0 ? 1 : 2;
                    const newPlayer = {
                        ws,
                        id: ws.id,
                        playerNum,
                        carId: null,
                        progress: 0,
                        boost: 0,
                    };
                    roomToJoin.players.push(newPlayer);
                    clients.set(ws.id, { ...clientInfo, roomId: targetRoomId });
                    ws.send(JSON.stringify({
                        type: 'ROOM_JOINED',
                        roomId: targetRoomId,
                        playerNum: newPlayer.playerNum
                    }));
                    if (playerNum === 2) {
                        const player1 = roomToJoin.players.find(p => p.playerNum === 1);
                        if (player1 && player1.carId) {
                           ws.send(JSON.stringify({ type: 'OPPONENT_CAR_SELECTED', carId: player1.carId }));
                        }
                    }
                    broadcastToRoom(targetRoomId, { type: 'PLAYER_JOINED', playerNum: newPlayer.playerNum }, ws.id);
                    console.log(`Player ${playerNum} (${ws.id}) joined room ${targetRoomId}`);
                    break;
                }
                case 'SELECT_CAR': {
                    if (!room) return;
                    const player = room.players.find(p => p.id === ws.id);
                    if (player) {
                        player.carId = data.carId;
                        console.log(`Player ${player.playerNum} in room ${room.id} selected car: ${data.carId}`);
                        broadcastToRoom(roomId, { type: 'OPPONENT_CAR_SELECTED', carId: data.carId }, ws.id);
                        const player1 = room.players.find(p => p.playerNum === 1);
                        const player2 = room.players.find(p => p.playerNum === 2);
                        if (player1 && player1.carId && player2 && player2.carId) {
                            room.gameState = {
                                status: 'starting',
                                winner: null,
                                questions: [],
                            };
                            broadcastToRoom(roomId, { type: 'START_RACE' });
                            startGameLoop(roomId);
                        }
                    }
                    break;
                }
                case 'SUBMIT_ANSWER': {
                    if (!room || room.gameState.status !== 'racing') return;
                    const player = room.players.find(p => p.id === ws.id);
                    if (player) {
                        player.questionsAnswered = (player.questionsAnswered || 0) + 1;
                        if (data.isCorrect) {
                            player.boost += BOOST_AMOUNT;
                            console.log(`Player ${player.playerNum} got a correct answer. Applying boost.`);
                        }
                    }
                    break;
                }
                case 'RESTART_GAME': {
                    if (!room) return;
                    console.log(`🔄 Restarting game in room ${room.id}`);
                    if (room.gameInterval) {
                        clearInterval(room.gameInterval);
                        room.gameInterval = null;
                    }
                    room.players.forEach(p => {
                        p.carId = null;
                        p.progress = 0;
                        p.boost = 0;
                        p.questionsAnswered = 0;
                    });
                    room.gameState = { status: 'waiting' };
                    broadcastToRoom(roomId, { type: 'GAME_RESTARTED' });
                    break;
                }
                default:
                    console.log(`❓ Unknown message type from ${ws.id}: ${data.type}`);
                    break;
            }
        } catch (error) {
            console.error(`🛑 Error processing message from ${ws.id}:`, error);
        }
    });

    ws.on('close', () => {
        console.log(`❌ Client disconnected: ${ws.id}`);
        const clientInfo = clients.get(ws.id);
        if (clientInfo && clientInfo.roomId) {
            const roomId = clientInfo.roomId;
            const room = rooms.get(roomId);
            if (room) {
                room.players = room.players.filter(p => p.id !== ws.id);
                if (room.players.length === 0) {
                    if(room.gameInterval) clearInterval(room.gameInterval);
                    rooms.delete(roomId);
                    console.log(`🗑️ Room ${roomId} is empty and has been deleted.`);
                } else {
                    broadcastToRoom(roomId, { type: 'OPPONENT_DISCONNECTED' });
                    if(room.gameInterval) clearInterval(room.gameInterval);
                    room.gameInterval = null;
                    room.gameState = { status: 'waiting' };
                }
            }
        }
        clients.delete(ws.id);
    });

    ws.on('error', (error) => {
        console.error(`🛑 WebSocket error for client ${ws.id}:`, error);
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🎧 Server is listening on ws://localhost:${PORT}`));