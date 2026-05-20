const express = require('express');
const router = express.Router();
const grupoController = require('../controllers/grupoController');

/**
 * @swagger
 * components:
 *   schemas:
 *     Grupo:
 *       type: object
 *       required:
 *         - nombre
 *         - materia
 *         - integrantes
 *       properties:
 *         id:
 *           type: integer
 *           description: ID autogenerado
 *         nombre:
 *           type: string
 *           description: Nombre del grupo
 *         materia:
 *           type: string
 *           description: Materia del grupo
 *         integrantes:
 *           type: integer
 *           description: Número de integrantes
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: 1
 *         nombre: Grupo Física
 *         materia: Física II
 *         integrantes: 4
 */

/**
 * @swagger
 * /api/grupos:
 *   get:
 *     summary: Obtiene todos los grupos
 *     tags: [Grupos]
 *     responses:
 *       200:
 *         description: Lista de grupos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Grupo'
 */
router.get('/', grupoController.getAllGrupos);

/**
 * @swagger
 * /api/grupos/{id}:
 *   get:
 *     summary: Obtiene un grupo por ID
 *     tags: [Grupos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del grupo
 *     responses:
 *       200:
 *         description: Grupo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Grupo'
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Grupo'
 *     responses:
 *       201:
 *         description: Grupo creado exitosamente
 *       400:
 *         description: Faltan campos obligatorios
 */
router.post('/', grupoController.createGrupo);

/**
 * @swagger
 * /api/grupos/{id}:
 *   put:
 *     summary: Actualiza un grupo completo
 *     tags: [Grupos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del grupo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Grupo'
 *     responses:
 *       200:
 *         description: Grupo actualizado
 *       404:
 *         description: Grupo no encontrado
 *       400:
 *         description: Faltan campos obligatorios
 */
router.put('/:id', grupoController.updateGrupo);

/**
 * @swagger
 * /api/grupos/{id}:
 *   delete:
 *     summary: Elimina un grupo
 *     tags: [Grupos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del grupo
 *     responses:
 *       200:
 *         description: Grupo eliminado
 *       404:
 *         description: Grupo no encontrado
 */
router.delete('/:id', grupoController.deleteGrupo);

module.exports = router;