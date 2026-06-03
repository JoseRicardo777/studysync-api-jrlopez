// src/routes/grupoRoutes.js
const express = require('express');
const router = express.Router();
const grupoController = require('../controllers/grupoController');
const autenticar = require('../middlewares/authMiddleware');

router.use(autenticar);

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Grupo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         nombre:
 *           type: string
 *         materia:
 *           type: string
 *         integrantes:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/grupos:
 *   get:
 *     summary: Obtiene todos los grupos del usuario autenticado
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: materia
 *         schema: { type: string }
 *         description: Filtra por materia
 *       - in: query
 *         name: q
 *         schema: { type: string }
 *         description: Búsqueda por nombre o materia
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *         description: Resultados por página
 *     responses:
 *       200:
 *         description: Lista de grupos
 *       401:
 *         description: No autorizado
 */
router.get('/', grupoController.getAllGrupos);

/**
 * @swagger
 * /api/grupos/{id}:
 *   get:
 *     summary: Obtiene un grupo por ID
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Grupo encontrado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Grupo no encontrado
 */
router.get('/:id', grupoController.getGrupoById);

/**
 * @swagger
 * /api/grupos:
 *   post:
 *     summary: Crea un nuevo grupo
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, materia, integrantes]
 *             properties:
 *               nombre: { type: string }
 *               materia: { type: string }
 *               integrantes: { type: integer }
 *     responses:
 *       201:
 *         description: Grupo creado
 *       400:
 *         description: Faltan campos
 *       401:
 *         description: No autorizado
 */
router.post('/', grupoController.createGrupo);

/**
 * @swagger
 * /api/grupos/{id}:
 *   put:
 *     summary: Actualiza un grupo
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [nombre, materia, integrantes]
 *             properties:
 *               nombre: { type: string }
 *               materia: { type: string }
 *               integrantes: { type: integer }
 *     responses:
 *       200:
 *         description: Grupo actualizado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Grupo no encontrado
 */
router.put('/:id', grupoController.updateGrupo);

/**
 * @swagger
 * /api/grupos/{id}:
 *   delete:
 *     summary: Elimina un grupo
 *     tags: [Grupos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Grupo eliminado
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Grupo no encontrado
 */
router.delete('/:id', grupoController.deleteGrupo);

module.exports = router;