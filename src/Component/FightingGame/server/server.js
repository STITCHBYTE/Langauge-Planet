const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// In-memory storage for rooms and clients
const rooms = new Map();
const clients = new Map(); // Maps a WebSocket client to their roomId

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('✅ Client connected');
  ws.id = uuidv4(); // Assign a unique ID to each client for easier tracking
  clients.set(ws.id, { ws });

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      const clientInfo = clients.get(ws.id);
      const roomId = clientInfo ? clientInfo.roomId : null;
      const room = roomId ? rooms.get(roomId) : null;

      switch (data.type) {
        case 'CREATE_ROOM':
          {
            console.log(`📝 CREATE_ROOM request from client ${ws.id}`);
            
            const newRoomId = uuidv4();
            const newRoom = {
              id: newRoomId,
              players: [{ ws, playerNum: 1 }], // The creator is Player 1
            };
            rooms.set(newRoomId, newRoom);
            clients.set(ws.id, { ws, roomId: newRoomId });

            console.log(`🚪 Room created: ${newRoomId} by client ${ws.id}`);
            ws.send(JSON.stringify({
              type: 'ROOM_CREATED',
              roomId: newRoomId,
              playerNum: 1,
              message: `Room created with ID: ${newRoomId}`,
            }));
            break;
          }

        case 'JOIN_ROOM':
          {
            const roomToJoin = rooms.get(data.roomId);
            if (roomToJoin) {
              if (roomToJoin.players.length < 2) {
                roomToJoin.players.push({ ws, playerNum: 2 }); // The joiner is Player 2
                clients.set(ws.id, { ws, roomId: data.roomId });

                console.log(`🤝 Client ${ws.id} joined room ${data.roomId}`);

                // Notify both players that the game is starting
                roomToJoin.players.forEach(player => {
                  player.ws.send(JSON.stringify({
                    type: 'GAME_START',
                    roomId: roomToJoin.id,
                    message: 'Both players are connected. The game can start!',
                    playerNum: player.playerNum,
                  }));
                });
              } else {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Room is full.' }));
              }
            } else {
              ws.send(JSON.stringify({ type: 'ERROR', message: 'Room not found.' }));
            }
            break;
          }

        case 'PLAYER_ACTION':
          if (room && room.players.length === 2) {
            const otherPlayer = room.players.find(p => p.ws.id !== ws.id);
            if (otherPlayer && otherPlayer.ws.readyState === WebSocket.OPEN) {
              otherPlayer.ws.send(JSON.stringify({
                type: 'OPPONENT_ACTION',
                action: data.action,
              }));
            }
          }
          break;

        case 'PLAYER_MOVE':
          if (room && room.players.length === 2) {
            const otherPlayer = room.players.find(p => p.ws.id !== ws.id);
            if (otherPlayer && otherPlayer.ws.readyState === WebSocket.OPEN) {
              otherPlayer.ws.send(JSON.stringify({
                type: 'OPPONENT_MOVE',
                x: data.x,
                action: data.action,
                direction: data.direction,
              }));
            }
          }
          break;
        
        case 'HEALTH_UPDATE':
          if (room && room.players.length === 2) {
            const otherPlayer = room.players.find(p => p.ws.id !== ws.id);
            if (otherPlayer && otherPlayer.ws.readyState === WebSocket.OPEN) {
              otherPlayer.ws.send(JSON.stringify({
                type: 'OPPONENT_HEALTH_UPDATE',
                playerNum: data.playerNum,
                health: data.health,
                isKO: data.isKO,
              }));
            }
          }
          break;

        case 'PING':
          ws.send(JSON.stringify({ type: 'PONG' }));
          break;
      }
    } catch (error) {
      console.error('Error processing message:', error);
    }
  });

  ws.on('close', () => {
    const clientInfo = clients.get(ws.id);
    const roomId = clientInfo ? clientInfo.roomId : null;
    
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        console.log(`Client ${ws.id} disconnected from room ${roomId}`);
        
        // Notify the other player about the disconnection
        const otherPlayer = room.players.find(p => p.ws.id !== ws.id);
        if (otherPlayer && otherPlayer.ws.readyState === WebSocket.OPEN) {
          otherPlayer.ws.send(JSON.stringify({
            type: 'OPPONENT_DISCONNECTED',
            message: 'The other player has disconnected.'
          }));
        }
        
        // Clean up the room
        rooms.delete(roomId);
        console.log(`🗑️ Room ${roomId} has been deleted.`);
      }
    } else {
      console.log(`❓ Client ${ws.id} disconnected (was not in a room)`);
    }
    clients.delete(ws.id);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for client ${ws.id}:`, error);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Game WebSocket Server running on ws://localhost:${PORT}`);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Game Server Online', 
    activeRooms: rooms.size,
    connectedClients: wss.clients.size,
    timestamp: Date.now() 
  });
});
