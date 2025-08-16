const Categoria = require('./Categoria');
const Servicio = require('./Servicio');

// Relación: una categoría tiene muchos servicios
Categoria.hasMany(Servicio, {
  foreignKey: 'categoriaId',
  as: 'servicios'
});

// Relación: un servicio pertenece a una categoría
Servicio.belongsTo(Categoria, {
  foreignKey: 'categoriaId',
  as: 'categoria'
});

module.exports = {
  Categoria,
  Servicio
};