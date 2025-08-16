const express = require('express');
const router = express.Router();
const { obtenerUsuarios, crearUsuario, editarUsuario, eliminarUsuario } = require('../controllers/admineController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');

// Obtener todos los usuarios
router.get('/usuarios', authenticate, authorizeRoles('admin'), obtenerUsuarios);

// Crear usuario
router.post('/usuarios', authenticate, authorizeRoles('admin'), crearUsuario);

// Editar usuario
router.put('/usuarios/:id', authenticate, authorizeRoles('admin'), editarUsuario);

// Eliminar usuario
router.delete('/usuarios/:id', authenticate, authorizeRoles('admin'), eliminarUsuario);

module.exports = router;