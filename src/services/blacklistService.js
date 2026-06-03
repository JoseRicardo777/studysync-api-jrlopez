// src/services/blacklistService.js
const { redisClient } = require('../config/redis');

// Agregar token a la blacklist (con expiración automática)
const addToBlacklist = async (token, expiresIn) => {
  try {
    // Usar el tiempo de expiración del token como TTL en Redis
    await redisClient.set(`blacklist:${token}`, 'revoked', 'EX', expiresIn);
    console.log(`✅ Token agregado a blacklist, expira en ${expiresIn}s`);
    return true;
  } catch (error) {
    console.error('❌ Error al agregar token a blacklist:', error);
    return false;
  }
};

// Verificar si un token está en la blacklist
const isBlacklisted = async (token) => {
  try {
    const result = await redisClient.get(`blacklist:${token}`);
    return result === 'revoked';
  } catch (error) {
    console.error('❌ Error al verificar blacklist:', error);
    return false;
  }
};

module.exports = { addToBlacklist, isBlacklisted };