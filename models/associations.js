const User = require('./User');
const Servicio = require('./Servicio');
const Categoria = require('./Categoria');
const Cita = require('./Cita');
const Paquete = require('./Paquete');
const PaqueteServicio = require('./PaqueteServicio');
const Notificacion = require('./Notificacion');

// 🧑‍💼 Relaciones de Usuario
User.hasMany(Cita, { as: 'citasCliente', foreignKey: 'clienteId' });
User.hasMany(Cita, { as: 'citasBarbero', foreignKey: 'barberoId' });
User.hasMany(Notificacion, { foreignKey: 'barberoId' });

// 🗓️ Relaciones de Cita
Cita.belongsTo(User, { as: 'cliente', foreignKey: 'clienteId' });
Cita.belongsTo(User, { as: 'barbero', foreignKey: 'barberoId' });
Cita.belongsTo(Servicio, { as: 'servicio', foreignKey: 'servicioId' });

// Relaciones inversas para Servicio
Servicio.hasMany(Cita, { as: 'citas', foreignKey: 'servicioId' });

// 🔔 Notificaciones
Notificacion.belongsTo(User, { foreignKey: 'barberoId' });
Notificacion.belongsTo(Cita, { foreignKey: 'citaId' });
Cita.hasOne(Notificacion, { foreignKey: 'citaId' });

// 🧴 Servicio con categoría
Categoria.hasMany(Servicio, { foreignKey: 'categoriaId' });
Servicio.belongsTo(Categoria, { foreignKey: 'categoriaId' });

// 🎁 Paquetes y servicios
Paquete.belongsToMany(Servicio, {
  through: PaqueteServicio,
  foreignKey: 'paqueteId',
  otherKey: 'servicioId'
});
Servicio.belongsToMany(Paquete, {
  through: PaqueteServicio,
  foreignKey: 'servicioId',
  otherKey: 'paqueteId'
});