const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cita = sequelize.define('Cita', {
  fecha: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  hora: {
    type: DataTypes.STRING,
    allowNull: false
  },
  estado: {
    type: DataTypes.ENUM('pendiente', 'confirmada', 'completada', 'cancelada', 'rechazada'),
    defaultValue: 'pendiente'
  },
  comentario: {
    type: DataTypes.TEXT
  },
  notaInterna: {
    type: DataTypes.TEXT
  },
  clienteId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  barberoId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  servicioId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Cita;