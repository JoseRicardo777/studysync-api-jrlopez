// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const grupoRoutes = require('./routes/grupoRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// ========== MEDIDAS DE SEGURIDAD ==========
// Configurar Helmet con CSP relajado para permitir scripts y WebSockets
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https:", "wss:", "ws:"],
            fontSrc: ["'self'", "https:", "data:"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// Configurar trust proxy para rate limiting en Render
app.set('trust proxy', 1);

const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.' },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);
app.use('/auth/', limiter);

app.use(express.json());

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../public')));

// ========== SWAGGER ==========
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'StudySync API',
            version: '1.0.0',
            description: 'API REST para gestión de grupos de estudio - José Ricardo López Flores',
            contact: { name: 'José Ricardo López Flores' },
        },
        servers: [
            { url: 'http://localhost:3000', description: 'Servidor local' },
            { url: 'https://studysync-api-jrlopez.onrender.com', description: 'Servidor de producción (Render)' },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
});

// ========== RUTAS ==========
app.use('/auth', authRoutes);
app.use('/api/grupos', grupoRoutes);

app.get('/', (req, res) => {
    res.json({
        message: 'Bienvenido a StudySync API',
        author: 'José Ricardo López Flores',
        swagger: '/api-docs',
        endpoints: {
            auth_register: '/auth/register',
            auth_login: '/auth/login',
            grupos: '/api/grupos',
        }
    });
});

app.use(errorHandler);

module.exports = app;