// src/subscribers/notificaciones.js
const Redis = require('ioredis');
require('dotenv').config();

let io = null;

// Configuración de Redis
const redisConfig = {
    host: 'fond-drum-136895.upstash.io',
    port: 6379,
    password: 'gQAAAAAAAha_AAIgcDIyNTYxZmVkZDBhZmU0ZTkxOTc2ODAwMmNhMTI5MGZhNA',
    tls: {},
    retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        console.log(`🔄 Reintentando conexión Redis en ${delay}ms...`);
        return delay;
    }
};

// Crear suscriptor de Redis
const redisSubscriber = new Redis(redisConfig);

redisSubscriber.on('connect', () => {
    console.log('✅ Conectado a Redis (Suscriptor)');
    console.log('📡 Escuchando canales: study:grupo:*');
});

redisSubscriber.on('error', (err) => {
    console.error('❌ Error en Redis (Suscriptor):', err.message);
});

redisSubscriber.on('ready', () => {
    console.log('🚀 Redis (Suscriptor) listo para usar');
});

// Inicializar el suscriptor con Socket.IO
const initNotificaciones = (socketIo) => {
    io = socketIo;
    console.log('📡 Suscriptor de Redis inicializado con Socket.IO');
    
    // Suscribirse a patrones de canales de Redis
    redisSubscriber.psubscribe('study:grupo:*', (err, count) => {
        if (err) {
            console.error('❌ Error al suscribirse a Redis:', err);
        } else {
            console.log(`📡 Suscrito a ${count} patrón(es) de canales Redis`);
        }
    });
    
    // Escuchar mensajes de Redis
    redisSubscriber.on('pmessage', (pattern, channel, message) => {
        console.log(`📡 Evento Redis recibido - Canal: ${channel}`);
        
        try {
            const evento = JSON.parse(message);
            console.log(`📢 Evento parseado: ${evento.tipo}`);
            
            if (io) {
                io.emit('nuevo-evento', evento);
                console.log(`📢 Evento broadcast a ${io.engine?.clientsCount || 0} clientes`);
            } else {
                console.error('❌ Socket.IO no inicializado');
            }
        } catch (error) {
            console.error('❌ Error procesando mensaje Redis:', error.message);
        }
    });
};

module.exports = { initNotificaciones };