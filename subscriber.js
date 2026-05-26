// subscriber.js - Servicio independiente que ESCUCHA eventos de Redis
const Redis = require('ioredis');
require('dotenv').config();

console.log('🎧 Iniciando Servicio Suscriptor de StudySync...');

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

// Crear conexión SEPARADA para suscribirse
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

// Función que procesa los mensajes recibidos
const procesarMensaje = (canal, mensaje) => {
  console.log('\n' + '='.repeat(60));
  console.log(`📨 [${new Date().toLocaleTimeString()}] Mensaje recibido:`);
  console.log(`   📡 Canal: ${canal}`);
  
  try {
    const datos = JSON.parse(mensaje);
    console.log(`   🏷️  Tipo: ${datos.tipo}`);
    console.log(`   📦 Payload:`, datos.payload);
    console.log(`   ⏰ Timestamp: ${datos.timestamp}`);
    console.log(`   🔢 Versión: ${datos.version}`);
    
    // Lógica de negocio según el tipo de evento
    switch(datos.tipo) {
      case 'GRUPO_CREADO':
        console.log(`   🎉 ACCIÓN: Nuevo grupo creado: "${datos.payload.nombre}" (${datos.payload.materia})`);
        break;
      case 'GRUPO_ACTUALIZADO':
        console.log(`   ✏️ ACCIÓN: Grupo actualizado: "${datos.payload.nombre}"`);
        break;
      case 'GRUPO_ELIMINADO':
        console.log(`   🗑️ ACCIÓN: Grupo eliminado: "${datos.payload.nombre}" (ID: ${datos.payload.id})`);
        break;
      default:
        console.log(`   ℹ️ ACCIÓN: Evento desconocido`);
    }
  } catch (error) {
    console.log(`   ⚠️ Error al parsear mensaje: ${mensaje}`);
  }
  console.log('='.repeat(60));
};

// Suscribirse a MÚLTIPLES CANALES (usando patrón wildcard)
redisSubscriber.psubscribe('study:grupo:*', (err, count) => {
  if (err) {
    console.error('❌ Error al suscribirse:', err);
  } else {
    console.log(`📡 Suscrito a ${count} patrón(es) de canales`);
  }
});

// Escuchar mensajes en los canales suscritos
redisSubscriber.on('pmessage', (pattern, channel, message) => {
  procesarMensaje(channel, message);
});

// Mantener el proceso vivo
console.log('🟢 Suscriptor listo. Esperando eventos...');
console.log('💡 Presiona Ctrl+C para detener el suscriptor\n');