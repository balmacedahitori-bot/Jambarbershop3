const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,           // railway
  process.env.DB_USER,           // root
  process.env.DB_PASSWORD,       // HchNGlTalbsJOtWoqAnhUMyRFItBRfrf
  {
    host: process.env.DB_HOST,   // caboose.proxy.rlwy.net
    port: Number(process.env.DB_PORT), // convierte el puerto a número
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false, // 🔐 NECESARIO para Railway
      },
    },
  }
);

module.exports = sequelize;
