const Cita = require('../models/Cita');
const Servicio = require('../models/Servicio');
const User = require('../models/User');

exports.obtenerHistorialDelCliente = async (req, res) => {
  try {
    const citas = await Cita.findAll({
      where: { clienteId: req.user.id },
      include: [
        { model: Servicio, attributes: ['nombre', 'duracion', 'precio'] },
        { model: User, as: 'barbero', attributes: ['name'] }
      ],
      order: [['fecha', 'DESC'], ['hora', 'DESC']]
    });

    const resultado = citas.map(cita => ({
      fecha: cita.fecha,
      hora: cita.hora,
      estado: cita.estado,
      servicio: cita.Servicio?.nombre,
      duracion: cita.Servicio?.duracion,
      precio: cita.Servicio?.precio,
      barbero: cita.barbero?.name
    }));

    res.json(resultado);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener historial', error: error.message });
  }
};


