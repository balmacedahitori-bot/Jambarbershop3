const express = require('express');
const router = express.Router();
const { obtenerBarberos } = require('../controllers/barberoController');

router.get('/', obtenerBarberos);

module.exports = router;