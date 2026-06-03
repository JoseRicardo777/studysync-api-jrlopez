// src/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { initNotificaciones } = require('./subscribers/notificaciones');

const app = require('./app');
const server = http.createServer(app);

// Configurar Socket.IO correctamente
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST'],
        credentials: true
    },
    // Permitir transporte websocket
    transports: ['websocket', 'polling']
});

// Hacer io accesible para las rutas
app.set('io', io);

// Inicializar el suscriptor de Redis con Socket.io
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