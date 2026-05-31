// src/config/redis.js
const Redis = require('ioredis');
require('dotenv').config();

console.log('🔍 Conectando a Redis...');

// Configuración para Upstash con TLS
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

// Crear conexión para PUBLICAR
const redisPublisher = new Redis(redisConfig);

redisPublisher.on('connect', () => {
  console.log('✅ Conectado a Redis (Publicador)');
});

redisPublisher.on('error', (err) => {
  console.error('❌ Error en Redis (Publicador):', err.message);
});

redisPublisher.on('ready', () => {
  console.log('🚀 Redis (Publicador) listo para usar');
});

// Función para publicar eventos
const publicarEvento = async (tipo, payload) => {
  try {
    const canal = `study:grupo:${tipo.toLowerCase()}`;
    const mensaje = JSON.stringify({
      tipo: tipo,
      payload: payload,
      timestamp: new Date().toISOString(),
      version: '1.0'
    });
    
    await redisPublisher.publish(canal, mensaje);
    console.log(`📢 Evento publicado: ${tipo} en canal ${canal}`);
    return true;
  } catch (error) {
    console.error(`❌ Error publicando evento ${tipo}:`, error.message);
    return false;
  }
};

module.exports = { redisPublisher, publicarEvento };