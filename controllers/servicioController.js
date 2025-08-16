const Servicio = require('../models/Servicio');
const Categoria = require('../models/Categoria');
const Cita = require('../models/Cita');
const PaqueteServicio = require('../models/PaqueteServicio');

// Crear servicio
exports.crearServicio = async (req, res) => {
  const { nombre, descripcion, duracion, precio, categoriaId, imagen } = req.body;

  if (!nombre || !duracion || !precio)
    return res.status(400).json({ message: 'Faltan datos obligatorios' });

  try {
    const servicio = await Servicio.create({
      nombre,
      descripcion,
      duracion,
      precio,
      categoriaId,
      imagen // ✅ Aseguramos que el link se guarde
    });
    res.status(201).json({ message: 'Servicio creado', servicio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Listar todos los servicios (admin)
exports.listarServicios = async (req, res) => {
  try {
    const servicios = await Servicio.findAll({
      include: [{ model: Categoria }]
    });
    res.json(servicios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener servicio por ID
exports.obtenerServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findByPk(req.params.id, {
      include: [{ model: Categoria }]
    });
    if (!servicio) return res.status(404).json({ message: 'Servicio no encontrado' });
    res.json(servicio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar servicio
exports.actualizarServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findByPk(req.params.id);
    if (!servicio) return res.status(404).json({ message: 'Servicio no encontrado' });

    await servicio.update(req.body); // incluye imagen si se envía ✅
    res.json({ message: 'Servicio actualizado', servicio });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar servicio
exports.eliminarServicio = async (req, res) => {
  try {
    const servicio = await Servicio.findByPk(req.params.id);
    if (!servicio) return res.status(404).json({ message: 'Servicio no encontrado' });

    // Verificar si el servicio está siendo usado por citas
    const citasConServicio = await Cita.findOne({
      where: { servicioId: req.params.id }
    });

    if (citasConServicio) {
      return res.status(400).json({ 
        message: 'No se puede eliminar el servicio porque está siendo usado por citas existentes. Primero debe eliminar o cambiar las citas que usan este servicio.' 
      });
    }

    // Verificar si el servicio está siendo usado por paquetes
    const paquetesConServicio = await PaqueteServicio.findOne({
      where: { servicioId: req.params.id }
    });

    if (paquetesConServicio) {
      return res.status(400).json({ 
        message: 'No se puede eliminar el servicio porque está siendo usado por paquetes existentes. Primero debe eliminar o modificar los paquetes que incluyen este servicio.' 
      });
    }

    await servicio.destroy();
    res.json({ message: 'Servicio eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    res.status(500).json({ 
      message: 'Error al eliminar servicio',
      error: error.message 
    });
  }
};

// Listar servicios públicos
exports.listarServiciosPublicos = async (req, res) => {
  try {
    const servicios = await Servicio.findAll();
    res.json(servicios);
  } catch (error) {
    res.status(500).json({
      message: 'Error al obtener servicios públicos',
      error: error.message
    });
  }
};

// Verificar si un servicio puede ser eliminado
exports.verificarEliminacionServicio = async (req, res) => {
  try {
    const servicioId = req.params.id;
    
    // Verificar si el servicio existe
    const servicio = await Servicio.findByPk(servicioId);
    if (!servicio) {
      return res.status(404).json({ message: 'Servicio no encontrado' });
    }

    // Verificar citas
    const citasConServicio = await Cita.findOne({
      where: { servicioId }
    });

    // Verificar paquetes
    const paquetesConServicio = await PaqueteServicio.findOne({
      where: { servicioId }
    });

    const puedeEliminar = !citasConServicio && !paquetesConServicio;
    
    res.json({
      puedeEliminar,
      razones: {
        tieneCitas: !!citasConServicio,
        tienePaquetes: !!paquetesConServicio
      }
    });
  } catch (error) {
    console.error('Error al verificar eliminación:', error);
    res.status(500).json({ 
      message: 'Error al verificar si el servicio puede ser eliminado',
      error: error.message 
    });
  }
};