const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Servicio = sequelize.define('Servicio', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT
  },
  duracion: {
    type: DataTypes.INTEGER, // minutos
    allowNull: false
  },
  precio: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  categoriaId: {
    type: DataTypes.INTEGER
  },
  imagen: {
  type: DataTypes.STRING,
  allowNull: true, // para no forzarlo en cada servicio
}

});

module.exports = Servicio;