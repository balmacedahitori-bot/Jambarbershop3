const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddleware');

// Registro público (rol cliente por defecto)
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Obtener perfil autenticado
router.get('/perfil', authenticate, authController.obtenerPerfil);

// Crear usuario con rol (solo admin)
router.post('/admin/create-user', authenticate, authorizeRoles('admin'), authController.createUserByAdmin);

// Listar barberos (admin)
router.get('/barberos', authenticate, authorizeRoles('admin'), authController.getBarberos);

// Actualizar barbero (admin)
router.put('/barberos/:id', authenticate, authorizeRoles('admin'), authController.updateBarbero);

// Eliminar barbero (admin)
router.delete('/barberos/:id', authenticate, authorizeRoles('admin'), authController.deleteBarbero);

// Ver barberos públicamente (cliente)
router.get('/public/barberos', authenticate, authController.getBarberosPublic);

module.exports = router;