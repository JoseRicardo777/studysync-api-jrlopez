// Datos en memoria (simula DB)
let grupos = [];
let nextId = 1;

// Obtener todos los grupos CON FILTROS Y BÚSQUEDA
const getAllGrupos = (req, res) => {
  let resultados = [...grupos];
  
  // 🔍 FILTRO por materia (ej: ?materia=Fisica)
  const materia = req.query.materia;
  if (materia) {
    resultados = resultados.filter(g => 
      g.materia.toLowerCase().includes(materia.toLowerCase())
    );
  }
  
  // 🔍 BÚSQUEDA por nombre (ej: ?q=algoritmos)
  const busqueda = req.query.q;
  if (busqueda) {
    resultados = resultados.filter(g => 
      g.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      g.materia.toLowerCase().includes(busqueda.toLowerCase())
    );
  }
  
  // 📄 PAGINACIÓN (ej: ?page=1&limit=5)
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  
  if (page && limit) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    resultados = resultados.slice(startIndex, endIndex);
  }
  
  res.status(200).json(resultados);
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