const User = require('../models/User');
const bcrypt = require('bcryptjs');
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await User.findAll({
      attributes: ['id', 'name', 'email', 'role']
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener usuarios',
      error: error.message
    });
  }
};


exports.crearUsuario = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    // Verificar si ya existe un usuario con ese correo
    const existe = await User.findOne({ where: { email } });
    if (existe) {
      return res.status(400).json({ message: 'Ya existe un usuario con ese correo.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const usuario = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json(usuario);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear usuario', error: error.message });
  }
};

exports.editarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role } = req.body;

    const usuario = await User.findByPk(id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    await usuario.update({ name, email, role });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: 'Error al editar usuario', error: error.message });
  }
};

exports.eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await User.findByPk(id);
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });

    await usuario.destroy();
    res.json({ message: 'Usuario eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar usuario', error: error.message });
  }
};