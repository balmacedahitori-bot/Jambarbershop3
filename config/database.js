const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        // Acepta certificados autofirmados
        rejectUnauthorized: false
      }
    }
  }
);

sequelize.authenticate()
  .then(() => console.log('Conexión a MySQL en Railway exitosa!'))
  .catch(err => console.error('Error de conexión:', err));

module.exports = sequelize;
