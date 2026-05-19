const express = require('express');
const router = express.Router();
const grupoController = require('../controllers/grupoController');

router.get('/', grupoController.getAllGrupos);
router.get('/:id', grupoController.getGrupoById);
router.post('/', grupoController.createGrupo);
router.put('/:id', grupoController.updateGrupo);
router.delete('/:id', grupoController.deleteGrupo);

module.exports = router;