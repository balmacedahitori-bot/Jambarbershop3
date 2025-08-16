const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/servicioController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');

// 🛠️ Ruta pública para listar servicios sin necesidad de token
router.get('/public', servicioController.listarServiciosPublicos);

// 🔐 Crear servicio (solo admin)
router.post('/', authenticate, authorizeRoles('admin'), servicioController.crearServicio);

// 🔒 Listar todos los servicios (requiere login, cualquier rol)
router.get('/', authenticate, servicioController.listarServicios);

// 🔒 Obtener un servicio por ID (solo admin)
router.get('/:id', authenticate, authorizeRoles('admin'), servicioController.obtenerServicio);

// 🔒 Actualizar servicio (solo admin)
router.put('/:id', authenticate, authorizeRoles('admin'), servicioController.actualizarServicio);

// 🔒 Verificar si se puede eliminar servicio (solo admin)
router.get('/:id/verificar-eliminacion', authenticate, authorizeRoles('admin'), servicioController.verificarEliminacionServicio);

// 🔒 Eliminar servicio (solo admin)
router.delete('/:id', authenticate, authorizeRoles('admin'), servicioController.eliminarServicio);

module.exports = router;