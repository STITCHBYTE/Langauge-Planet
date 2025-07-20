const WebSocket = require('ws');
const express = require('express');
const http = require('http');
const uuidv4 = require('uuid').v4; // Correct import for v4

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// In-memory storage for rooms and clients
const rooms = new Map();
const clients = new Map(); // Maps a WebSocket client to their roomId

// Helper function to broadcast messages to all players in a room
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
console.log("roomID Map (initial):", rooms); // Log initial map

// WebSocket connection handling
wss.on('connection', (ws, request) => {
  console.log('✅ Client connected');
  
  // Assign a unique ID to each client upon connection
  ws.id = uuidv4(); 
  clients.set(ws.id, { ws }); // Store the client's WebSocket object

  console.log(`🆔 Client ID assigned: ${ws.id}`); // Log client ID assignment

  // Removed URL-based auto-room logic from here.
  // The server will now wait for the client to send a CREATE_ROOM or JOIN_ROOM message
  // via the 'message' event, which is triggered after the WebSocket is fully open on the client side.

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
            let newRoomId = (data.roomId && data.roomId.trim()) || uuidv4();
            
            if (rooms.has(newRoomId)) {
                // Room exists, check if it's full or has one player to join
                const existingRoom = rooms.get(newRoomId);
                if (existingRoom.players.length < 2) {
                    // This scenario means a client trying to "create" a room already existing but not full.
                    // Treat it as joining as Player 2.
                    existingRoom.players.push({ ws, playerNum: 2 });
                    clients.set(ws.id, { ws, roomId: newRoomId });
                    
                    console.log(`🤝 Client ${ws.id} joined existing room ${newRoomId} as Player 2 (from CREATE_ROOM attempt)`);
                    
                    // If we now have 2 players, notify both that the game is starting
                    if (existingRoom.players.length === 2) {
                      existingRoom.players.forEach(player => {
                        player.ws.send(JSON.stringify({
                          type: 'GAME_START',
                          roomId: newRoomId,
                          message: 'Both players are connected. The game can start!',
                          playerNum: player.playerNum,
                        }));
                      });
                    }
                } else {
                    // Room full, send error
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

              console.log(`🚪 Room created: ${newRoomId} by client ${ws.id} (Player 1)`);
              ws.send(JSON.stringify({
                type: 'ROOM_CREATED',
                roomId: newRoomId,
                playerNum: 1, // Explicitly send player number
                message: `Room created with ID: ${newRoomId}`,
              }));
            }
            break;
          }

        case 'JOIN_ROOM':
          {
            console.log(`🚪 JOIN_ROOM request from client ${ws.id}, roomId: ${data.roomId}`);
            const roomToJoin = rooms.get(data.roomId?.trim());
            
            if (roomToJoin) {
              if (roomToJoin.players.length < 2) {
                // Assign player number: P1 if room is empty, P2 if one player already there.
                const newPlayerNum = roomToJoin.players.length === 0 ? 1 : 2; 
                
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
                      playerNum: player.playerNum, // Explicitly send player number
                    }));
                  });
                } else {
                  // This case implies joining a room that previously had a player but they disconnected (and room wasn't deleted yet)
                  ws.send(JSON.stringify({
                    type: 'ROOM_JOINED', // Acknowledge join, but game might not start immediately if only 1 player
                    roomId: data.roomId,
                    playerNum: newPlayerNum, // Explicitly send player number
                    message: 'Waiting for another player to join...',
                  }));
                }
              } else {
                console.log(`❌ Room ${data.roomId} is full`);
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Room is full.' }));
              }
            } else {
              console.log(`❌ Room ${data.roomId} not found. Attempting to create it.`);
              // If JOIN_ROOM fails because room not found, server can try to create it with that ID
              const newRoom = {
                  id: data.roomId.trim(),
                  players: [{ ws, playerNum: 1 }],
              };
              rooms.set(newRoom.id, newRoom);
              clients.set(ws.id, { ws, roomId: newRoom.id });
              ws.send(JSON.stringify({
                  type: 'ROOM_CREATED', // Send ROOM_CREATED, as the client is now the creator
                  roomId: newRoom.id,
                  playerNum: 1,
                  message: `Room not found, created new room with ID: ${newRoom.id}`,
              }));
              console.log(`🚪 Room ${newRoom.id} created as fallback by client ${ws.id} (Player 1)`);
            }
            break;
          }

        case 'PLAYER_ACTION': 
          if (room && room.players.length === 2) {
            const senderPlayer = room.players.find(p => p.ws.id === ws.id);
            if (!senderPlayer) return;

            broadcastToRoom(roomId, {
                type: 'PLAYER_ACTION', 
                playerNumber: senderPlayer.playerNum, 
                action: data.action, 
                hit: data.hit, 
                damage: data.damage, 
                healAmount: data.healAmount, 
                newHealth: data.newHealth 
            }, ws.id); 
            console.log(`📡 Broadcasted PLAYER_ACTION: ${data.action} from P${senderPlayer.playerNum} in room ${roomId}`);
          }
          break;

        case 'PLAYER_MOVE':
          if (room && room.players.length === 2) {
            const senderPlayer = room.players.find(p => p.ws.id === ws.id);
            if (!senderPlayer) return;

            broadcastToRoom(roomId, {
                type: 'PLAYER_MOVE',
                playerNumber: senderPlayer.playerNum, 
                x: data.x,
                action: data.action,
                direction: data.direction,
            }, ws.id); 
            console.log(`📡 Broadcasted PLAYER_MOVE from P${senderPlayer.playerNum} in room ${roomId}`);
          }
          break;
        
        case 'HEALTH_UPDATE': 
          if (room && room.players.length === 2) {
            const senderPlayer = room.players.find(p => p.ws.id === ws.id);
            if (!senderPlayer) return;

            broadcastToRoom(roomId, {
                type: 'HEALTH_UPDATE',
                playerNum: data.playerNum, 
                health: data.health,
                isKO: data.isKO,
                winner: data.winner 
            }, ws.id);
            console.log(`📡 Broadcasted HEALTH_UPDATE for P${data.playerNum} in room ${roomId} (KO: ${data.isKO})`);
          }
          break;

        case 'QUIZ_RESULT': 
            if (room && room.players.length === 2) {
                const senderPlayer = room.players.find(p => p.ws.id === ws.id);
                if (!senderPlayer) return;

                console.log(`📝 Quiz result from P${senderPlayer.playerNum}: ${data.result}`);
            }
            break;

        case 'PING':
          ws.send(JSON.stringify({ type: 'PONG' }));
          break;
          
        default:
          console.log(`❓ Unknown message type from client ${ws.id}: ${data.type}`);
          break;
      }
    } catch (error) {
      console.error('Error processing message from client:', ws.id, 'Message:', message, 'Error:', error);
      ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid message format.' }));
    }
  });

  ws.on('close', () => {
    const clientInfo = clients.get(ws.id);
    const roomId = clientInfo ? clientInfo.roomId : null;
    
    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        console.log(`Client ${ws.id} disconnected from room ${roomId}`);
        
        room.players = room.players.filter(p => p.ws.id !== ws.id);
        
        const otherPlayer = room.players[0]; 
        if (otherPlayer && otherPlayer.ws.readyState === WebSocket.OPEN) {
          otherPlayer.ws.send(JSON.stringify({
            type: 'OPPONENT_DISCONNECTED',
            message: 'The other player has disconnected.'
          }));
          console.log(`📢 Notified P${otherPlayer.playerNum} in room ${roomId} about disconnection.`);
        }
        
        if (room.players.length === 0) {
          rooms.delete(roomId);
          console.log(`🗑️ Room ${roomId} deleted (no players left)`);
        } else if (room.players.length === 1) {
          console.log(`⏳ Room ${roomId} has 1 player left. Keeping room alive for potential reconnect.`);
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

app.get('/health', (req, res) => {
  res.json({ 
    status: 'Game Server Online', 
    activeRooms: rooms.size,
    connectedClients: wss.clients.size,
    timestamp: Date.now() 
  });
});