const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PaqueteServicio = sequelize.define('PaqueteServicio', {
  paqueteId: { type: DataTypes.INTEGER, allowNull: false },
  servicioId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = PaqueteServicio;