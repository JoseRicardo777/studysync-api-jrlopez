// subscriber.js
const Redis = require('ioredis');
require('dotenv').config();

console.log('🎧 Iniciando Servicio Suscriptor de StudySync...');

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

const redisSubscriber = new Redis(redisConfig);

redisSubscriber.on('connect', () => {
  console.log('✅ Conectado a Redis (Suscriptor)');
  console.log('📡 Escuchando canales: study:grupo:*');
});

redisSubscriber.on('error', (err) => {
  console.error('❌ Error en Redis (Suscriptor):', err.message);
});

const procesarMensaje = (canal, mensaje) => {
  console.log('\n' + '='.repeat(60));
  console.log(`📨 [${new Date().toLocaleTimeString()}] Mensaje recibido:`);
  console.log(`   📡 Canal: ${canal}`);
  
  try {
    const datos = JSON.parse(mensaje);
    console.log(`   🏷️  Tipo: ${datos.tipo}`);
    console.log(`   📦 Payload:`, datos.payload);
    
    switch(datos.tipo) {
      case 'GRUPO_CREADO':
        console.log(`   🎉 NUEVO GRUPO: "${datos.payload.nombre}" (${datos.payload.materia})`);
        break;
      case 'GRUPO_ACTUALIZADO':
        console.log(`   ✏️ GRUPO ACTUALIZADO: "${datos.payload.nombre}"`);
        break;
      case 'GRUPO_ELIMINADO':
        console.log(`   🗑️ GRUPO ELIMINADO: "${datos.payload.nombre}"`);
        break;
    }
  } catch (error) {
    console.log(`   ⚠️ Error: ${mensaje}`);
  }
  console.log('='.repeat(60));
};

redisSubscriber.psubscribe('study:grupo:*', (err, count) => {
  if (err) {
    console.error('❌ Error al suscribirse:', err);
  } else {
    console.log(`📡 Suscrito a ${count} patrón(es) de canales`);
  }
});

redisSubscriber.on('pmessage', (pattern, channel, message) => {
  procesarMensaje(channel, message);
});

console.log('🟢 Suscriptor listo. Esperando eventos...');
console.log('💡 Presiona Ctrl+C para detener\n');