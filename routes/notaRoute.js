const express = require('express');
const router = express.Router();
const clientNoteController = require('../controllers/clientNotecontroller');

// Crear nueva nota
router.post('/', clientNoteController.createNote);

// Obtener notas por cliente
router.get('/:clientId', clientNoteController.getNotesByClient);

module.exports = router;