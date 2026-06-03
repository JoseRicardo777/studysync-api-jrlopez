// src/config/cache.js
const redisPublisher = require('./redis');

const CACHE_TTL = 60; // 60 segundos de caché

const getCached = async (key) => {
  try {
    const data = await redisPublisher.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error leyendo caché:', error);
    return null;
  }
};

const setCached = async (key, data, ttl = CACHE_TTL) => {
  try {
    await redisPublisher.set(key, JSON.stringify(data), 'EX', ttl);
  } catch (error) {
    console.error('Error guardando caché:', error);
  }
};

const invalidateCache = async (pattern) => {
  try {
    const keys = await redisPublisher.keys(pattern);
    if (keys.length > 0) {
      await redisPublisher.del(keys);
      console.log(`🗑️ Caché invalidado: ${keys.length} claves eliminadas`);
    }
  } catch (error) {
    console.error('Error invalidando caché:', error);
  }
};

module.exports = { getCached, setCached, invalidateCache };