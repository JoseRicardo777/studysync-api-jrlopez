// jest.setup.js
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno desde .env
const envPath = path.resolve(process.cwd(), '.env');
console.log(`📁 Buscando .env en: ${envPath}`);

const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Error cargando .env:', result.error.message);
} else {
  console.log('✅ .env cargado correctamente');
}

// Configurar NODE_ENV para pruebas
process.env.NODE_ENV = 'test';

// Forzar variables de entorno necesarias para las pruebas
if (!process.env.DATABASE_URL) {
  console.warn('⚠️ DATABASE_URL no encontrada, asignando manualmente');
  process.env.DATABASE_URL = 'postgresql://postgres.vgjvkintejgmrunxpxrx:Josericardo200208j@aws-1-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true';
}

// Asegurar que JWT_SECRET existe
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ JWT_SECRET no encontrada, asignando manualmente');
  process.env.JWT_SECRET = 'tu_secreto_muy_largo_y_seguro_2026_para_jwt';
}

if (!process.env.JWT_EXPIRES_IN) {
  process.env.JWT_EXPIRES_IN = '1h';
}

console.log('✅ Variables de entorno configuradas para pruebas');

// Silenciar logs de Redis durante las pruebas
console.log = jest.fn();
console.error = jest.fn();