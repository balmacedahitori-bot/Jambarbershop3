const express = require('express');
const router = express.Router();
const disponibilidadController = require('../controllers/disponibilidadController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');

// Ver disponibilidad del barbero
router.get('/barbero/:id', authenticate, authorizeRoles('barbero', 'admin'), disponibilidadController.obtenerDisponibilidad);

// Guardar o actualizar disponibilidad semanal
router.put('/barbero/:id', authenticate, authorizeRoles('barbero'), disponibilidadController.guardarDisponibilidad);

// Obtener disponibilidad para un día específico
router.get('/barbero/:barberoId/dia/:dia', authenticate, disponibilidadController.obtenerDisponibilidadPorDia);

// Obtener horarios disponibles para agendar en una fecha específica
router.get('/barbero/:barberoId/fecha/:fecha', authenticate, disponibilidadController.obtenerHorariosDisponibles);

module.exports = router;