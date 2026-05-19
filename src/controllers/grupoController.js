// Datos en memoria (simula DB)
let grupos = [];
let nextId = 1;

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

// Crear un nuevo grupo
const createGrupo = (req, res) => {
  const { nombre, materia, integrantes } = req.body;

  // Validación de campos obligatorios
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
  res.status(201).json(nuevoGrupo);
};

// Actualizar un grupo completo (PUT)
const updateGrupo = (req, res) => {
  const id = parseInt(req.params.id);
  const { nombre, materia, integrantes } = req.body;

  const index = grupos.findIndex(g => g.id === id);
  if (index === -1) {
    return res.status(404).json({ error: `Grupo con ID ${id} no encontrado` });
  }

  // Validación de campos
  if (!nombre || !materia || !integrantes) {
    return res.status(400).json({
      error: 'Faltan campos obligatorios para actualización completa',
      required: ['nombre', 'materia', 'integrantes']
    });
  }

  if (typeof integrantes !== 'number' || integrantes <= 0) {
    return res.status(400).json({ error: 'El campo "integrantes" debe ser un número positivo' });
  }

  grupos[index] = {
    ...grupos[index],
    nombre,
    materia,
    integrantes,
    updatedAt: new Date()
  };

  res.status(200).json(grupos[index]);
};

// Eliminar un grupo
const deleteGrupo = (req, res) => {
  const id = parseInt(req.params.id);
  const index = grupos.findIndex(g => g.id === id);

  if (index === -1) {
    return res.status(404).json({ error: `Grupo con ID ${id} no encontrado` });
  }

  grupos.splice(index, 1);
  res.status(200).json({ message: `Grupo con ID ${id} eliminado correctamente` });
};

module.exports = {
  getAllGrupos,
  getGrupoById,
  createGrupo,
  updateGrupo,
  deleteGrupo
};