// config/database.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,       // Nombre de la base de datos
  process.env.DB_USER,       // Usuario
  process.env.DB_PASSWORD,   // Contraseña
  {
    host: process.env.DB_HOST,           // Host de Railway
    port: Number(process.env.DB_PORT),   // Puerto convertido a número
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false       // Aceptar certificados autofirmados de Railway
      }
    }
  }
);

// Probar la conexión
sequelize.authenticate()
  .then(() => console.log('✅ Conexión a MySQL en Railway exitosa!'))
  .catch(err => console.error('❌ Error de conexión:', err));

module.exports = sequelize;
