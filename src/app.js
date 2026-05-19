const express = require('express');
const grupoRoutes = require('./routes/grupoRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Middlewares globales
app.use(express.json()); // para parsear JSON

// Rutas
app.use('/api/grupos', grupoRoutes);

// Ruta de bienvenida
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a StudySync API',
    author: 'José Ricardo López Flores',
    endpoints: {
      GET_all: '/api/grupos',
      GET_one: '/api/grupos/:id',
      POST: '/api/grupos',
      PUT: '/api/grupos/:id',
      DELETE: '/api/grupos/:id'
    }
  });
});

// Middleware de errores (siempre al final)
app.use(errorHandler);

module.exports = app;