const express = require('express');
const router = express.Router();
const citaController = require('../controllers/citaController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');

// Crear cita (cliente)
router.post('/', authenticate, authorizeRoles('cliente'), citaController.crearCita);

// Listar citas según rol
router.get('/', authenticate, citaController.listarCitas);

// Ver una cita específica
router.get('/:id', authenticate, citaController.obtenerCita);

// Actualizar estado (barbero o admin)
router.patch('/:id', authenticate, authorizeRoles('barbero', 'admin'), citaController.actualizarCita);

// Eliminar cita (solo admin)
router.delete('/:id', authenticate, authorizeRoles('admin'), citaController.eliminarCita);

// Agregar comentario (cliente)
router.patch('/:id/comentario', authenticate, authorizeRoles('cliente'), citaController.agregarComentario);

// Historial del barbero
router.get('/historial', authenticate, authorizeRoles('barbero', 'admin'), citaController.obtenerHistorialPorBarbero);
router.get('/barbero', authenticate, authorizeRoles('barbero'), citaController.obtenerCitasPorBarbero);
router.get('/clientes/frecuencia', authenticate, authorizeRoles('barbero', 'admin'), citaController.clientesFrecuentes);
router.get('/panel/proximas-citas', authenticate, authorizeRoles('barbero'), citaController.notificacionesPanel);
module.exports = router;