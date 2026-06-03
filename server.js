// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { initNotificaciones } = require('./src/subscribers/notificaciones');

const app = require('./src/app');
const server = http.createServer(app);

// Configurar Socket.IO
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// Inicializar el suscriptor de Redis con Socket.IO
initNotificaciones(io);

io.on('connection', (socket) => {
    console.log('🟢 Cliente conectado:', socket.id);
    
    socket.on('disconnect', () => {
        console.log('🔴 Cliente desconectado:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`📚 API de grupos de estudio - José Ricardo López Flores`);
});