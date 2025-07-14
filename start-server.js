#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting WebSocket server for multiplayer fighting game...');

const serverPath = path.join(__dirname, 'src', 'Component', 'FightingGame', 'server', 'server.js');
const server = spawn('node', [serverPath], {
  stdio: 'inherit',
  cwd: __dirname
});

server.on('close', (code) => {
  console.log(`Server process exited with code ${code}`);
});

server.on('error', (err) => {
  console.error('Failed to start server:', err);
});

process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.kill('SIGINT');
  process.exit(0);
});
