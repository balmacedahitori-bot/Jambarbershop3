const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Disponibilidad = sequelize.define('Disponibilidad', {
  dia: {
    type: DataTypes.INTEGER,     // 0 = domingo, 6 = sábado
    allowNull: false
  },
  horaInicio: {
    type: DataTypes.TIME,
    allowNull: false
  },
  horaFin: {
    type: DataTypes.TIME,
    allowNull: false
  },
  barberoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Disponibilidad;