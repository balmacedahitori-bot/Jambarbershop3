const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const sequelize = require('./config/database');
//const clientNoteRoutes = require('./routes/notaRoute');


// 🧪 Cargar .env
dotenv.config();

// Configuración por defecto si no hay .env
if (!process.env.PORT) {
  process.env.PORT = 3000;
}

// 🚀 Inicializar app
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// 🔌 Importar modelos
require('./models/User');
require('./models/Servicio');
require('./models/Categoria');
require('./models/Cita');
require('./models/Paquete');
require('./models/PaqueteServicio');
require('./models/Notificacion');
require('./models/associations');
require('./models/Disponibilidad')
require('./jobs/task');

//require('./jobs/recordatorioCitas');

// 📦 Importar rutas (las crearemos enseguida)
app.use('/api/auth', require('./routes/authRoute'));
app.use('/api/citas', require('./routes/citaRoute'));
app.use('/api/servicios', require('./routes/servicioRoute'));
app.use('/api/paquetes', require('./routes/paqueteRoute'));
app.use('/api/barberos', require('./routes/barberoRoute'));
app.use('/api/admin', require('./routes/adminRoute'));
app.use('/api/disponibilidad', require('./routes/disponibilidadRoute'));
//app.use('/client-notes', clientNoteRoutes);

// 🧭 Ruta base
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'splash.html'));
});


// Ruta para el formulario de login
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login-registro.html'));
});

// 🔁 Conectar base de datos y levantar servidor
sequelize.sync().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`🔥 Servidor activo en http://localhost:${process.env.PORT}`);
  });
}).catch(err => {
  console.error('❌ Error al conectar con DB:', err);
});