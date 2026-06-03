// src/controllers/grupoController.js
const { PrismaClient } = require('@prisma/client');
const { publicarEvento } = require('../config/redis');
const { getCached, setCached, invalidateCache } = require('../config/cache');

const prisma = new PrismaClient();

// Obtener todos los grupos (CON CACHÉ)
const getAllGrupos = async (req, res) => {
  const { materia, q, page, limit } = req.query;
  const usuarioId = req.usuario.id;
  
  // Crear clave única para caché basada en los parámetros
  const cacheKey = `grupos:${usuarioId}:${materia || ''}:${q || ''}:${page || ''}:${limit || ''}`;
  
  // Intentar obtener del caché
  const cachedData = await getCached(cacheKey);
  if (cachedData) {
    console.log('📦 Respuesta desde caché Redis');
    return res.status(200).json(cachedData);
  }
  
  // Construir filtros
  let where = { usuarioId };
  
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
    
    // Guardar en caché para próximas consultas
    await setCached(cacheKey, grupos);
    
    res.status(200).json(grupos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los grupos" });
  }
};

// Obtener grupo por ID (CON CACHÉ)
const getGrupoById = async (req, res) => {
  const { id } = req.params;
  const usuarioId = req.usuario.id;
  
  const cacheKey = `grupo:${usuarioId}:${id}`;
  
  // Intentar obtener del caché
  const cachedData = await getCached(cacheKey);
  if (cachedData) {
    console.log('📦 Respuesta desde caché Redis');
    return res.status(200).json(cachedData);
  }
  
  try {
    const grupo = await prisma.grupo.findFirst({
      where: { 
        id: parseInt(id),
        usuarioId 
      }
    });
    
    if (!grupo) {
      return res.status(404).json({ error: `Grupo no encontrado` });
    }
    
    // Guardar en caché
    await setCached(cacheKey, grupo);
    
    res.status(200).json(grupo);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar el grupo" });
  }
};

// Crear un grupo (INVALIDA CACHÉ)
const createGrupo = async (req, res) => {
  const { nombre, materia, integrantes } = req.body;
  const usuarioId = req.usuario.id;

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
      data: { 
        nombre, 
        materia, 
        integrantes,
        usuarioId 
      }
    });
    
    // PUBLICAR EVENTO EN REDIS
    await publicarEvento('GRUPO_CREADO', nuevoGrupo);
    
    // INVALIDAR CACHÉ de listas de grupos
    await invalidateCache(`grupos:${usuarioId}:*`);
    
    res.status(201).json(nuevoGrupo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear el grupo" });
  }
};

// Actualizar un grupo (INVALIDA CACHÉ)
const updateGrupo = async (req, res) => {
  const { id } = req.params;
  const { nombre, materia, integrantes } = req.body;
  const usuarioId = req.usuario.id;

  if (!nombre || !materia || !integrantes) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const grupo = await prisma.grupo.findFirst({
      where: { id: parseInt(id), usuarioId }
    });
    
    if (!grupo) {
      return res.status(404).json({ error: `Grupo no encontrado` });
    }
    
    const grupoActualizado = await prisma.grupo.update({
      where: { id: parseInt(id) },
      data: { nombre, materia, integrantes }
    });
    
    await publicarEvento('GRUPO_ACTUALIZADO', grupoActualizado);
    
    // INVALIDAR CACHÉ
    await invalidateCache(`grupos:${usuarioId}:*`);
    await invalidateCache(`grupo:${usuarioId}:${id}`);
    
    res.status(200).json(grupoActualizado);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: `Grupo no encontrado` });
    }
    res.status(500).json({ error: "Error al actualizar el grupo" });
  }
};

// Eliminar un grupo (INVALIDA CACHÉ)
const deleteGrupo = async (req, res) => {
  const { id } = req.params;
  const usuarioId = req.usuario.id;
  
  try {
    const grupo = await prisma.grupo.findFirst({
      where: { id: parseInt(id), usuarioId }
    });
    
    if (!grupo) {
      return res.status(404).json({ error: `Grupo no encontrado` });
    }
    
    await prisma.grupo.delete({
      where: { id: parseInt(id) }
    });
    
    await publicarEvento('GRUPO_ELIMINADO', {
      id: grupo.id,
      nombre: grupo.nombre
    });
    
    // INVALIDAR CACHÉ
    await invalidateCache(`grupos:${usuarioId}:*`);
    await invalidateCache(`grupo:${usuarioId}:${id}`);
    
    res.status(200).json({ message: `Grupo con ID ${id} eliminado correctamente` });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: `Grupo no encontrado` });
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