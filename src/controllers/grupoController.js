// src/controllers/grupoController.js
const { PrismaClient } = require('@prisma/client');
const { publicarEvento } = require('../config/redis');

const prisma = new PrismaClient();

// Obtener todos los grupos (CON FILTROS Y PAGINACIÓN)
const getAllGrupos = async (req, res) => {
  const { materia, q, page, limit } = req.query;

  // Construir filtros
  let where = {};
  if (materia) {
    where.materia = { contains: materia, mode: 'insensitive' };
  }
  if (q) {
    where.OR = [
      { nombre: { contains: q, mode: 'insensitive' } },
      { materia: { contains: q, mode: 'insensitive' } }
    ];
  }

  // Paginación
  let pagination = {};
  if (page && limit) {
    pagination.skip = (parseInt(page) - 1) * parseInt(limit);
    pagination.take = parseInt(limit);
  }

  try {
    const grupos = await prisma.grupo.findMany({
      where,
      orderBy: { id: 'asc' },
      ...pagination
    });
    res.status(200).json(grupos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los grupos" });
  }
};

// Obtener grupo por ID
const getGrupoById = async (req, res) => {
  const { id } = req.params;
  try {
    const grupo = await prisma.grupo.findUnique({
      where: { id: parseInt(id) }
    });
    if (!grupo) {
      return res.status(404).json({ error: `Grupo con ID ${id} no encontrado` });
    }
    res.status(200).json(grupo);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar el grupo" });
  }
};

// Crear un grupo (PUBLICA EVENTO)
const createGrupo = async (req, res) => {
  const { nombre, materia, integrantes } = req.body;

  if (!nombre || !materia || !integrantes) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios',
      required: ['nombre', 'materia', 'integrantes']
    });
  }

  if (typeof integrantes !== 'number' || integrantes <= 0) {
    return res.status(400).json({ error: 'El campo "integrantes" debe ser un número positivo' });
  }

  try {
    const nuevoGrupo = await prisma.grupo.create({
      data: { nombre, materia, integrantes }
    });
    
    // PUBLICAR EVENTO EN REDIS
    await publicarEvento('GRUPO_CREADO', nuevoGrupo);
    
    res.status(201).json(nuevoGrupo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el grupo en la base de datos" });
  }
};

// Actualizar un grupo (PUBLICA EVENTO)
const updateGrupo = async (req, res) => {
  const { id } = req.params;
  const { nombre, materia, integrantes } = req.body;

  if (!nombre || !materia || !integrantes) {
    return res.status(400).json({ error: 'Faltan campos obligatorios para actualización' });
  }

  try {
    const grupoActualizado = await prisma.grupo.update({
      where: { id: parseInt(id) },
      data: { nombre, materia, integrantes }
    });
    
    // PUBLICAR EVENTO EN REDIS
    await publicarEvento('GRUPO_ACTUALIZADO', grupoActualizado);
    
    res.status(200).json(grupoActualizado);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: `Grupo con ID ${id} no encontrado` });
    }
    res.status(500).json({ error: "Error al actualizar el grupo" });
  }
};

// Eliminar un grupo (PUBLICA EVENTO)
const deleteGrupo = async (req, res) => {
  const { id } = req.params;
  try {
    const grupoEliminado = await prisma.grupo.findUnique({
      where: { id: parseInt(id) }
    });
    
    if (!grupoEliminado) {
      return res.status(404).json({ error: `Grupo con ID ${id} no encontrado` });
    }
    
    await prisma.grupo.delete({
      where: { id: parseInt(id) }
    });
    
    // PUBLICAR EVENTO EN REDIS
    await publicarEvento('GRUPO_ELIMINADO', {
      id: grupoEliminado.id,
      nombre: grupoEliminado.nombre
    });
    
    res.status(200).json({ message: `Grupo con ID ${id} eliminado correctamente` });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: `Grupo con ID ${id} no encontrado` });
    }
    res.status(500).json({ error: "Error al eliminar el grupo" });
  }
};

module.exports = {
  getAllGrupos,
  getGrupoById,
  createGrupo,
  updateGrupo,
  deleteGrupo
};