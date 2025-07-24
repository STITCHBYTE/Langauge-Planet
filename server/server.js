const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const rooms = new Map();
const clients = new Map();

console.log("WebSocket server starting...");

// --- Heartbeat/Connection Check ---
const interval = setInterval(function ping() {
    wss.clients.forEach(function each(ws) {
        if (ws.isAlive === false) {
            console.log(`Client ${ws.id} did not respond to ping. Terminating connection.`);
            return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
    });
}, 15000);

wss.on('close', function close() {
    clearInterval(interval);
});

// --- Helper Functions ---
function broadcastToRoom(roomId, message, senderWsId = null) {
    const room = rooms.get(roomId);
    if (room) {
        room.players.forEach(player => {
            if (player.ws.readyState === WebSocket.OPEN && player.ws.id !== senderWsId) {
                player.ws.send(JSON.stringify(message));
            }
        });
    }
}

// --- WebSocket Connection Handling ---
wss.on('connection', (ws) => {
    ws.id = uuidv4();
    ws.isAlive = true;
    clients.set(ws.id, { ws });
    console.log(`✅ Client connected with ID: ${ws.id}`);

    ws.on('pong', () => {
        ws.isAlive = true;
    });

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            const clientInfo = clients.get(ws.id);
            const roomId = clientInfo ? clientInfo.roomId : null;
            const room = roomId ? rooms.get(roomId) : null;

            switch (data.type) {
                case 'ENTER_ROOM': {
                    const roomId = data.roomId?.trim();
                    if (!roomId) return;
                    
                    let room = rooms.get(roomId);
                    if (!room) {
                        const newRoom = { id: roomId, players: [{ ws, playerNum: 1, character: null, health: 100 }] };
                        rooms.set(roomId, newRoom);
                        clients.set(ws.id, { ...clientInfo, roomId: roomId });
                        ws.send(JSON.stringify({ type: 'START_CHARACTER_SELECT', roomId: roomId, playerNum: 1, message: 'Room created! Choose your fighter.' }));
                    } else {
                        if (room.players.length >= 2) {
                            ws.send(JSON.stringify({ type: 'ERROR', message: 'Room is full.' }));
                            return;
                        }
                        const player1 = room.players.find(p => p.playerNum === 1);
                        room.players.push({ ws, playerNum: 2, character: null, health: 100 });
                        clients.set(ws.id, { ...clientInfo, roomId: roomId });
                        ws.send(JSON.stringify({ type: 'START_CHARACTER_SELECT', roomId: roomId, playerNum: 2, message: 'Joined room! Choose your fighter.', initialSelections: { player1: player1 ? player1.character : null } }));
                        if (player1) {
                            player1.ws.send(JSON.stringify({ type: 'PLAYER_JOINED', message: 'Player 2 has joined!' }));
                        }
                    }
                    break;
                }
                
                case 'SELECT_CHARACTER': {
                    if (!room) return;
                    const senderPlayer = room.players.find(p => p.ws.id === ws.id);
                    if (senderPlayer) {
                        senderPlayer.character = data.characterKey;
                        broadcastToRoom(roomId, { type: 'UPDATE_SELECTION', playerNum: senderPlayer.playerNum, characterKey: data.characterKey }, ws.id);
                        const player1 = room.players.find(p => p.playerNum === 1);
                        const player2 = room.players.find(p => p.playerNum === 2);
                        if (player1 && player1.character && player2 && player2.character) {
                            const gameStartMsg = { type: 'START_GAME', player1Character: player1.character, player2Character: player2.character };
                            room.players.forEach(p => p.ws.send(JSON.stringify(gameStartMsg)));
                        }
                    }
                    break;
                }

                case 'PLAYER_MOVE': {
                    if (room) {
                        const senderPlayer = room.players.find(p => p.ws.id === ws.id);
                        if (!senderPlayer) return;
                        broadcastToRoom(roomId, { type: 'PLAYER_MOVE', playerNumber: senderPlayer.playerNum, x: data.x, action: data.action, direction: data.direction }, ws.id);
                    }
                    break;
                }

                case 'PLAYER_ACTION': {
                    if (!room) return;
                    const senderPlayer = room.players.find(p => p.ws.id === ws.id);
                    if (!senderPlayer) return;

                    console.log('PLAYER_ACTION received:', data);

                    // Broadcast the attack action to both players
                    room.players.forEach(p => {
                        p.ws.send(JSON.stringify({
                            type: 'PLAYER_ACTION',
                            playerNumber: senderPlayer.playerNum,
                            action: data.action
                        }));
                    });

                    // If the attack hits, send health update
                    if (data.hit) {
                        const opponentPlayer = room.players.find(p => p.ws.id !== ws.id);
                        if (opponentPlayer) {
                            opponentPlayer.health = Math.max(0, (opponentPlayer.health || 100) - data.damage);
                            room.players.forEach(p => {
                                p.ws.send(JSON.stringify({
                                    type: 'HEALTH_UPDATE',
                                    playerNum: opponentPlayer.playerNum,
                                    damage: data.damage,
                                    health: opponentPlayer.health
                                }));
                            });
                        }
                    }
                    break;
                }

                case 'RESTART_GAME': {
                    // Reset characters for both players in the room
                    if (!room) return;
                    room.players.forEach(p => { p.character = null; });
                    room.players.forEach(p => {
                        p.ws.send(JSON.stringify({
                            type: 'START_CHARACTER_SELECT',
                            roomId: room.id,
                            playerNum: p.playerNum,
                            message: 'Game restarted! Choose your fighter.'
                        }));
                    });
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
                const playerNum = room.players.find(p => p.ws.id === ws.id)?.playerNum || 'Unknown';
                room.players = room.players.filter(p => p.ws.id !== ws.id);
                if (room.players.length > 0) {
                    broadcastToRoom(roomId, { type: 'OPPONENT_DISCONNECTED', message: `Player ${playerNum} has left.` });
                } else {
                    rooms.delete(roomId);
                }
            }
        }
        clients.delete(ws.id);
    });

    ws.on('error', (error) => {
        console.error(`🛑 WebSocket error for client ${ws.id}:`, error);
    });
});

const PORT = process.env.PORT || 8001;
server.listen(PORT, () => console.log(`🚀 WebSocket server is running on ws://localhost:${PORT}`));
