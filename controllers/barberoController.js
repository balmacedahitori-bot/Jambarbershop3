const User = require('../models/User');

exports.obtenerBarberos = async (req, res) => {
  try {
    const barberos = await User.findAll({
      where: { role: 'barbero' },
      attributes: ['id', 'name']
    });
    res.json(barberos);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener barberos', error: error.message });
  }
};