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
            console.log(`📝 CREATE_ROOM request from client ${ws.id}, data:`, data);
            
            // Use the provided roomId or generate a new one
            let newRoomId = data.roomId || uuidv4();
            // Ensure the roomId is clean
            newRoomId = newRoomId.trim();
            console.log('Creating new room with ID:', newRoomId);
            
            // Check if room already exists
            if (rooms.has(newRoomId)) {
              console.log(`⚠️  Room ${newRoomId} already exists, joining instead`);
              const existingRoom = rooms.get(newRoomId);
              if (existingRoom.players.length < 2) {
                existingRoom.players.push({ ws, playerNum: 2 });
                clients.set(ws.id, { ws, roomId: newRoomId });
                
                console.log(`🤝 Client ${ws.id} joined existing room ${newRoomId}`);
                
                // Notify both players that the game is starting
                existingRoom.players.forEach(player => {
                  player.ws.send(JSON.stringify({
                    type: 'GAME_START',
                    roomId: newRoomId,
                    message: 'Both players are connected. The game can start!',
                    playerNum: player.playerNum,
                  }));
                });
              } else {
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Room is full.' }));
              }
            } else {
              // Create new room
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
            }
            break;
          }

        case 'JOIN_ROOM':
          {
            console.log(`🚪 JOIN_ROOM request from client ${ws.id}, roomId: ${data.roomId}`);
            console.log(`📋 Available rooms:`, Array.from(rooms.keys()));
            
            const roomToJoin = rooms.get(data.roomId?.trim()); // Ensure we trim any whitespace
            console.log('Attempting to join room:', data.roomId, 'Room exists:', !!roomToJoin);
            if (roomToJoin) {
              if (roomToJoin.players.length < 2) {
                // Always assign player 2 to joining player for consistency
                const newPlayerNum = 2;
                
                roomToJoin.players.push({ ws, playerNum: newPlayerNum });
                clients.set(ws.id, { ws, roomId: data.roomId });

                console.log(`🤝 Client ${ws.id} joined room ${data.roomId} as Player ${newPlayerNum}`);

                // If we now have 2 players, notify both that the game is starting
                if (roomToJoin.players.length === 2) {
                  roomToJoin.players.forEach(player => {
                    player.ws.send(JSON.stringify({
                      type: 'GAME_START',
                      roomId: roomToJoin.id,
                      message: 'Both players are connected. The game can start!',
                      playerNum: player.playerNum,
                    }));
                  });
                } else {
                  // Just acknowledge the join
                  ws.send(JSON.stringify({
                    type: 'ROOM_JOINED',
                    roomId: data.roomId,
                    playerNum: newPlayerNum,
                    message: 'Waiting for another player to join...',
                  }));
                }
              } else {
                console.log(`❌ Room ${data.roomId} is full`);
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Room is full.' }));
              }
            } else {
              console.log(`❌ Room ${data.roomId} not found. Available rooms:`, Array.from(rooms.keys()));
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
          
        default:
          console.log(`❓ Unknown message type: ${data.type}`);
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
        
        // Remove the disconnected player from the room
        room.players = room.players.filter(p => p.ws.id !== ws.id);
        
        // Notify the other player about the disconnection
        const otherPlayer = room.players[0]; // Get remaining player
        if (otherPlayer && otherPlayer.ws.readyState === WebSocket.OPEN) {
          otherPlayer.ws.send(JSON.stringify({
            type: 'OPPONENT_DISCONNECTED',
            message: 'The other player has disconnected.'
          }));
        }
        
        // Keep the room alive for 30 seconds to allow reconnection
        if (room.players.length === 1) {
          console.log(`⏳ Room ${roomId} now has 1 player, keeping alive for 30 seconds`);
          setTimeout(() => {
            const currentRoom = rooms.get(roomId);
            if (currentRoom && currentRoom.players.length === 1) {
              rooms.delete(roomId);
              console.log(`🗑️ Room ${roomId} deleted after timeout`);
            }
          }, 30000); // 30 second timeout
        } else if (room.players.length === 0) {
          // If no players left, delete immediately
          rooms.delete(roomId);
          console.log(`🗑️ Room ${roomId} deleted (no players left)`);
        }
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
