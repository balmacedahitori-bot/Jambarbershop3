const express = require('express');
const router = express.Router();
const paqueteController = require('../controllers/paqueteController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');

// Crear paquete (admin)
router.post('/', authenticate, authorizeRoles('admin'), paqueteController.crearPaquete);

// Ver todos los paquetes (cualquiera)
router.get('/', authenticate, paqueteController.listarPaquetes);

// Eliminar paquete (admin)
router.delete('/:id', authenticate, authorizeRoles('admin'), paqueteController.eliminarPaquete);

module.exports = router;