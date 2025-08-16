const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Registro público
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existe = await User.findOne({ where: { email } });
    if (existe) return res.status(409).json({ message: 'Correo ya registrado' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: 'cliente' });

    res.status(201).json({ message: 'Registro exitoso', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ message: 'Login exitoso', token, user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Perfil
exports.obtenerPerfil = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'role']
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear usuario desde admin
exports.createUserByAdmin = async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    const existe = await User.findOne({ where: { email } });
    if (existe) return res.status(409).json({ message: 'Correo ya registrado' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });

    res.status(201).json({ message: 'Usuario creado por admin', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Barberos públicos (cliente)
exports.getBarberosPublic = async (req, res) => {
  try {
    const barberos = await User.findAll({
      where: { role: 'barbero' },
      attributes: ['id', 'name', 'email']
    });
    res.json(barberos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Barberos internos (admin)
exports.getBarberos = async (req, res) => {
  try {
    const barberos = await User.findAll({ where: { role: 'barbero' } });
    res.json(barberos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBarbero = async (req, res) => {
  try {
    const barbero = await User.findByPk(req.params.id);
    if (!barbero || barbero.role !== 'barbero') {
      return res.status(404).json({ message: 'Barbero no encontrado' });
    }

    await barbero.update(req.body);
    res.json({ message: 'Barbero actualizado', barbero });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBarbero = async (req, res) => {
  try {
    const barbero = await User.findByPk(req.params.id);
    if (!barbero || barbero.role !== 'barbero') {
      return res.status(404).json({ message: 'Barbero no encontrado' });
    }

    await barbero.destroy();
    res.json({ message: 'Barbero eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};