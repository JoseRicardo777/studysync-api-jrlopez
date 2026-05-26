// Datos en memoria
let grupos = [];
let nextId = 1;

// Importar Redis para publicar mensajes
const redisPublisher = require('../config/redis');

// Función auxiliar para publicar eventos
const publicarEvento = async (tipo, payload) => {
  const mensaje = {
    tipo: tipo,
    payload: payload,
    timestamp: new Date().toISOString(),
    version: '1.0'
  };
  
  // Publicar en el canal principal
  await redisPublisher.publish('study:grupo:eventos', JSON.stringify(mensaje));
  
  // Publicar en canal específico según el tipo de evento
  let canalEspecifico = '';
  if (tipo === 'GRUPO_CREADO') canalEspecifico = 'study:grupo:creado';
  if (tipo === 'GRUPO_ACTUALIZADO') canalEspecifico = 'study:grupo:actualizado';
  if (tipo === 'GRUPO_ELIMINADO') canalEspecifico = 'study:grupo:eliminado';
  
  if (canalEspecifico) {
    await redisPublisher.publish(canalEspecifico, JSON.stringify(mensaje));
  }
  
  console.log(`📢 Evento publicado: ${tipo}`, payload);
};

// Obtener todos los grupos
const getAllGrupos = (req, res) => {
  res.status(200).json(grupos);
};

// Obtener grupo por ID
const getGrupoById = (req, res) => {
  const id = parseInt(req.params.id);
  const grupo = grupos.find(g => g.id === id);

  if (!grupo) {
    return res.status(404).json({ error: `Grupo con ID ${id} no encontrado` });
  }

  res.status(200).json(grupo);
};

// Crear un nuevo grupo (PUBLICA EVENTO)
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

  const nuevoGrupo = {
    id: nextId++,
    nombre,
    materia,
    integrantes,
    createdAt: new Date()
  };

  grupos.push(nuevoGrupo);
  
  // 📢 PUBLICAR EVENTO
  await publicarEvento('GRUPO_CREADO', nuevoGrupo);
  
  res.status(201).json(nuevoGrupo);
};

// Actualizar un grupo (PUBLICA EVENTO)
const updateGrupo = async (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, materia, integrantes } = req.body;

  const index = grupos.findIndex(g => g.id === id);
  if (index === -1) {
    return res.status(404).json({ error: `Grupo con ID ${id} no encontrado` });
  }

  if (!nombre || !materia || !integrantes) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios para actualización completa',
      required: ['nombre', 'materia', 'integrantes']
    });
  }

  if (typeof integrantes !== 'number' || integrantes <= 0) {
    return res.status(400).json({ error: 'El campo "integrantes" debe ser un número positivo' });
  }

  const grupoActualizado = {
    ...grupos[index],
    nombre,
    materia,
    integrantes,
    updatedAt: new Date()
  };

  grupos[index] = grupoActualizado;
  
  // 📢 PUBLICAR EVENTO
  await publicarEvento('GRUPO_ACTUALIZADO', grupoActualizado);
  
  res.status(200).json(grupoActualizado);
};

// Eliminar un grupo (PUBLICA EVENTO)
const deleteGrupo = async (req, res) => {
  const id = parseInt(req.params.id);
  const index = grupos.findIndex(g => g.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Grupo con ID ${id} no encontrado` });
  }

  const grupoEliminado = grupos[index];
  grupos.splice(index, 1);
  
  // 📢 PUBLICAR EVENTO
  await publicarEvento('GRUPO_ELIMINADO', { id: grupoEliminado.id, nombre: grupoEliminado.nombre });
  
  res.status(200).json({ message: `Grupo con ID ${id} eliminado correctamente` });
};

module.exports = {
  getAllGrupos,
  getGrupoById,
  createGrupo,
  updateGrupo,
  deleteGrupo
};