const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notificacion = sequelize.define('Notificacion', {
  mensaje: {
    type: DataTypes.STRING,
    allowNull: false
  },
  barberoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  citaId: {
    type: DataTypes.INTEGER
  },
  visto: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Notificacion;