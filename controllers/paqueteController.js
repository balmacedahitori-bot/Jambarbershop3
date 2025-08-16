const Paquete = require('../models/Paquete');
const Servicio = require('../models/Servicio');

exports.crearPaquete = async (req, res) => {
  const { nombre, descripcion, precio, serviciosIds } = req.body;

  try {
    const paquete = await Paquete.create({ nombre, descripcion, precio });

    if (serviciosIds && serviciosIds.length > 0) {
      await paquete.setServicios(serviciosIds);
    }

    res.status(201).json({ message: 'Paquete creado', paquete });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.listarPaquetes = async (req, res) => {
  try {
    const paquetes = await Paquete.findAll({ include: Servicio });
    res.json(paquetes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.obtenerPaquete = async (req, res) => {
  try {
    const paquete = await Paquete.findByPk(req.params.id, { include: Servicio });
    if (!paquete) return res.status(404).json({ message: 'Paquete no encontrado' });
    res.json(paquete);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.actualizarPaquete = async (req, res) => {
  try {
    const paquete = await Paquete.findByPk(req.params.id);
    if (!paquete) return res.status(404).json({ message: 'Paquete no encontrado' });

    await paquete.update(req.body);

    if (req.body.serviciosIds) {
      await paquete.setServicios(req.body.serviciosIds);
    }

    res.json({ message: 'Paquete actualizado', paquete });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.eliminarPaquete = async (req, res) => {
  try {
    const paquete = await Paquete.findByPk(req.params.id);
    if (!paquete) return res.status(404).json({ message: 'Paquete no encontrado' });

    await paquete.destroy();
    res.json({ message: 'Paquete eliminado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};