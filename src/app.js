const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const grupoRoutes = require('./routes/grupoRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares globales
app.use(express.json());

// ========== CONFIGURACIÓN DE SWAGGER ==========
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'StudySync API',
      version: '1.0.0',
      description: 'API REST para gestión de grupos de estudio - José Ricardo López Flores',
      contact: {
        name: 'José Ricardo López Flores',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local',
      },
      {
        url: 'https://studysync-api-jrlopez.onrender.com',
        description: 'Servidor de producción (Render)',
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Ruta para Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Ruta para obtener el JSON de Swagger
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ========== RUTAS DE TU API ==========
app.use('/api/grupos', grupoRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a StudySync API',
    author: 'José Ricardo López Flores',
    swagger: '/api-docs',
    endpoints: {
      GET_all: '/api/grupos',
      GET_one: '/api/grupos/:id',
      POST: '/api/grupos',
      PUT: '/api/grupos/:id',
      DELETE: '/api/grupos/:id',
    }
  });
});

// Middleware de errores
app.use(errorHandler);

module.exports = app;