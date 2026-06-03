// src/config/redis.js
const Redis = require('ioredis');
require('dotenv').config();

// Silenciar logs durante pruebas
const isTest = process.env.NODE_ENV === 'test';

if (!isTest) {
  console.log('🔍 Conectando a Redis...');
}

const redisConfig = {
  host: 'fond-drum-136895.upstash.io',
  port: 6379,
  password: 'gQAAAAAAAha_AAIgcDIyNTYxZmVkZDBhZmU0ZTkxOTc2ODAwMmNhMTI5MGZhNA',
  tls: {},
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    if (!isTest) console.log(`🔄 Reintentando conexión Redis en ${delay}ms...`);
    return delay;
  }
};

// Cliente para operaciones generales (incluyendo caché)
const redisClient = new Redis(redisConfig);

// Cliente específico para publicar eventos
const redisPublisher = new Redis(redisConfig);

if (!isTest) {
  redisClient.on('connect', () => {
    console.log('✅ Conectado a Redis (Cliente general)');
  });

  redisPublisher.on('connect', () => {
    console.log('✅ Conectado a Redis (Publicador)');
  });

  redisPublisher.on('ready', () => {
    console.log('🚀 Redis (Publicador) listo para usar');
  });
}

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
    if (!isTest) console.log(`📢 Evento publicado: ${tipo} en canal ${canal}`);
    return true;
  } catch (error) {
    if (!isTest) console.error(`❌ Error publicando evento ${tipo}:`, error.message);
    return false;
  }
};

// Funciones de caché (para pruebas, no hacer nada)
const getCached = async (key) => {
  if (isTest) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
};

const setCached = async (key, data, ttl = 60) => {
  if (isTest) return;
  try {
    await redisClient.set(key, JSON.stringify(data), 'EX', ttl);
  } catch (error) {
    // Ignorar errores en pruebas
  }
};

const invalidateCache = async (pattern) => {
  if (isTest) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  } catch (error) {
    // Ignorar errores en pruebas
  }
};

// Exportar
module.exports = { redisClient, redisPublisher, publicarEvento, getCached, setCached, invalidateCache };