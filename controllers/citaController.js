const { Op } = require('sequelize');
const Cita = require('../models/Cita');
const User = require('../models/User');
const Servicio = require('../models/Servicio');
const Notificacion = require('../models/Notificacion');
const Disponibilidad = require('../models/Disponibilidad');
const transporter = require('../utils/email');

// 📅 Crear cita con validaciones completas de disponibilidad
exports.crearCita = async (req, res) => {
  const { fecha, hora, servicioId, barberoId } = req.body;
  const clienteId = req.user.id;

  if (!fecha || !hora || !servicioId || !barberoId)
    return res.status(400).json({ message: 'Faltan datos obligatorios' });

  try {
    // 🗓️ Validación 1: Verificar que la fecha no sea del pasado
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Normalizar al inicio del día

    // Corregir el parsing de fecha para evitar problemas de zona horaria
    const [year, month, day] = fecha.split('-').map(Number);
    const fechaIngresada = new Date(year, month - 1, day); // month - 1 porque los meses van de 0-11
    fechaIngresada.setHours(0, 0, 0, 0); // Normalizar al inicio del día

    if (fechaIngresada < hoy) {
      return res.status(400).json({ 
        message: 'No se puede agendar citas en días que ya han pasado. Por favor selecciona una fecha actual o futura.' 
      });
    }

    // 🕐 Validación 2: Verificar que la hora no sea del pasado si es hoy
    if (fechaIngresada.getTime() === hoy.getTime()) {
      const ahora = new Date();
      const horaActual = ahora.getHours();
      const minutosActual = ahora.getMinutes();
      
      const [horaStr, minutosStr = '00'] = hora.split(':');
      const horaCita = parseInt(horaStr);
      const minutosCita = parseInt(minutosStr);

      if (horaCita < horaActual || (horaCita === horaActual && minutosCita <= minutosActual)) {
        return res.status(400).json({ 
          message: 'No se puede agendar citas en horas que ya han pasado. Por favor selecciona una hora futura.' 
        });
      }
    }

    // 📅 Validación 3: Verificar disponibilidad del barbero
    const diaSemana = fechaIngresada.getDay(); // 0 = domingo, 1 = lunes, etc.
    
    console.log('=== DEBUG DISPONIBILIDAD ===');
    console.log('Fecha ingresada:', fecha);
    console.log('Fecha objeto:', fechaIngresada.toDateString());
    console.log('Día de la semana (getDay):', diaSemana);
    console.log('Nombre del día:', getNombreDia(diaSemana));
    console.log('Barbero ID:', barberoId);
    
    // Buscar la disponibilidad del barbero para ese día
    const disponibilidad = await Disponibilidad.findOne({
      where: { 
        barberoId: barberoId,
        dia: diaSemana 
      }
    });

    console.log('Disponibilidad encontrada:', disponibilidad);

    if (!disponibilidad) {
      // Verificar si el barbero tiene alguna disponibilidad configurada
      const disponibilidadTotal = await Disponibilidad.findAll({
        where: { barberoId: barberoId }
      });

      if (disponibilidadTotal.length === 0) {
        return res.status(400).json({ 
          message: 'El barbero no tiene horarios configurados. Por favor contacta al administrador.' 
        });
      }

      return res.status(400).json({ 
        message: `El barbero no trabaja los ${getNombreDia(diaSemana)}. Por favor selecciona otro día.` 
      });
    }

    // 🕐 Validación 4: Verificar que la hora esté dentro del horario configurado
    // Normalizar formatos de hora para comparación correcta
    const horaCita = hora;
    const horaInicio = disponibilidad.horaInicio;
    const horaFin = disponibilidad.horaFin;

    // Función para normalizar formato de hora (quitar segundos si existen)
    function normalizarHora(horaStr) {
      return horaStr.split(':').slice(0, 2).join(':');
    }

    const horaCitaNormalizada = normalizarHora(horaCita);
    const horaInicioNormalizada = normalizarHora(horaInicio);
    const horaFinNormalizada = normalizarHora(horaFin);

    console.log('=== DEBUG VALIDACIÓN DE HORARIO ===');
    console.log('Hora de la cita (original):', horaCita);
    console.log('Hora de la cita (normalizada):', horaCitaNormalizada);
    console.log('Hora de inicio del barbero (original):', horaInicio);
    console.log('Hora de inicio del barbero (normalizada):', horaInicioNormalizada);
    console.log('Hora de fin del barbero (original):', horaFin);
    console.log('Hora de fin del barbero (normalizada):', horaFinNormalizada);
    console.log('¿Hora cita < hora inicio?', horaCitaNormalizada < horaInicioNormalizada);
    console.log('¿Hora cita > hora fin?', horaCitaNormalizada > horaFinNormalizada);

    // Validación corregida: permitir la hora de inicio y la hora de fin
    if (horaCitaNormalizada < horaInicioNormalizada || horaCitaNormalizada > horaFinNormalizada) {
      console.log('❌ Hora fuera del rango permitido');
      return res.status(400).json({ 
        message: `El barbero trabaja de ${horaInicioNormalizada} a ${horaFinNormalizada} los ${getNombreDia(diaSemana)}. Por favor selecciona un horario dentro de este rango.` 
      });
    }

    console.log('✅ Hora dentro del rango permitido');

    // 🔍 Validación 5: Verificar que no haya conflicto con otra cita
    const citaExistente = await Cita.findOne({
      where: { 
        fecha, 
        hora, 
        barberoId,
        estado: {
          [Op.notIn]: ['cancelada', 'rechazada']
        }
      }
    });

    if (citaExistente) {
      return res.status(409).json({ 
        message: 'Ya hay una cita programada en ese horario. Por favor selecciona otra fecha u hora.' 
      });
    }

    // ✅ Crear la cita si todas las validaciones pasan
    const cita = await Cita.create({
      fecha,
      hora,
      servicioId,
      barberoId,
      clienteId,
      estado: 'pendiente'
    });

    // 📧 Crear notificación para el barbero
    await Notificacion.create({
      mensaje: `Nueva cita para el ${fecha} a las ${hora}`,
      barberoId,
      citaId: cita.id
    });

    res.status(201).json({ 
      message: 'Cita agendada correctamente', 
      cita 
    });

  } catch (error) {
    console.error('Error al crear cita:', error);
    res.status(500).json({ 
      message: 'Error interno del servidor al procesar la cita',
      error: error.message 
    });
  }
};

// 🗓️ Función auxiliar para obtener nombre del día
function getNombreDia(dia) {
  const dias = [
    'domingos', 'lunes', 'martes', 'miércoles', 
    'jueves', 'viernes', 'sábados'
  ];
  return dias[dia] || 'día desconocido';
}

// 📋 Listar citas por rol
exports.listarCitas = async (req, res) => {
  const { id, role } = req.user;
  const { estado, barberoId } = req.query;
  const where = {};

  if (role === 'cliente') where.clienteId = id;
  if (role === 'barbero') where.barberoId = id;
  
  // Filtrar por estado si se especifica
  if (estado) where.estado = estado;
  
  // Filtrar por barbero específico si se especifica
  if (barberoId) where.barberoId = barberoId;

  try {
    const citas = await Cita.findAll({
      where,
      order: [['fecha', 'DESC'], ['hora', 'DESC']],
      include: [
        { model: Servicio, as: 'servicio' },
        { model: User, as: 'cliente', attributes: ['id', 'name'] },
        { model: User, as: 'barbero', attributes: ['id', 'name'] }
      ]
    });

    res.json(citas);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔍 Ver una cita específica
exports.obtenerCita = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const role = req.user.role;

  try {
    const cita = await Cita.findByPk(id, {
      include: [
        { model: Servicio, as: 'servicio' },
        { model: User, as: 'cliente', attributes: ['id', 'name'] },
        { model: User, as: 'barbero', attributes: ['id', 'name'] }
      ]
    });

    if (!cita)
      return res.status(404).json({ message: 'Cita no encontrada' });

    if (role === 'cliente' && cita.clienteId !== userId)
      return res.status(403).json({ message: 'No podés ver esta cita' });

    if (role === 'barbero' && cita.barberoId !== userId)
      return res.status(403).json({ message: 'No podés ver esta cita' });

    res.json(cita);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔧 Actualizar estado de la cita
exports.actualizarCita = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  const { id: userId, role } = req.user;
  const estadosValidos = ['confirmada', 'completada', 'cancelada', 'rechazada'];

  if (!estado || !estadosValidos.includes(estado))
    return res.status(400).json({ message: 'Estado inválido' });

  try {
    const cita = await Cita.findByPk(id);
    if (!cita)
      return res.status(404).json({ message: 'Cita no encontrada' });

    if (role === 'barbero' && cita.barberoId !== userId)
      return res.status(403).json({ message: 'No podés modificar esta cita' });

    cita.estado = estado;
    await cita.save();

    const cliente = await User.findByPk(cita.clienteId);
    const barbero = await User.findByPk(cita.barberoId);
    const servicio = await Servicio.findByPk(cita.servicioId);

    const mensaje = `Hola ${cliente.name}, tu cita del ${cita.fecha} a las ${cita.hora} para "${servicio?.nombre}" fue ${estado} por ${barbero?.name}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: cliente.email,
      subject: `Tu cita fue ${estado}`,
      text: mensaje
    });

    res.json({ message: 'Cita actualizada', cita });
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar', error: error.message });
  }
};

// 🗑️ Eliminar cita
exports.eliminarCita = async (req, res) => {
  try {
    const cita = await Cita.findByPk(req.params.id);
    if (!cita)
      return res.status(404).json({ message: 'Cita no encontrada' });

    await cita.destroy();
    res.json({ message: 'Cita eliminada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 💬 Agregar comentario post-servicio
exports.agregarComentario = async (req, res) => {
  const { id } = req.params;
  const { comentario } = req.body;
  const userId = req.user.id;

  try {
    const cita = await Cita.findByPk(id);
    if (!cita || cita.clienteId !== userId || cita.estado !== 'completada')
      return res.status(403).json({ message: 'Solo podés comentar citas completadas tuyas' });

    cita.comentario = comentario;
    await cita.save();

    res.json({ message: 'Comentario agregado', cita });
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar comentario', error: error.message });
  }
};

// 📅 Historial por barbero
exports.obtenerHistorialPorBarbero = async (req, res) => {
  const { barberoId, desde, hasta } = req.query;
  const filtros = { barberoId, estado: 'completada' };

  if (desde && hasta)
    filtros.fecha = { [Op.between]: [desde, hasta] };
//sconsole.log('Buscando historial de barberoId:', barberoId);

  try {
    const citas = await Cita.findAll({
      where: filtros,
      order: [['fecha', 'DESC'], ['hora', 'DESC']],
      include: [
        { model: User, as: 'cliente', attributes: ['id', 'name'] },
        { model: Servicio, as: 'servicio', attributes: ['id', 'nombre'] }
      ]
    });

    res.json(citas);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener historial', error: error.message });
  }
};

// 📋 Todas las citas del barbero
exports.obtenerCitasPorBarbero = async (req, res) => {
  try {
    const barberoId = req.user.id;

    const citas = await Cita.findAll({
      where: { barberoId },
      include: ['cliente', 'servicio'],
      order: [['fecha', 'ASC']]
    });

    res.json(citas);
  } catch (error) {
    console.error('Error al obtener citas del barbero:', error);
    res.status(500).json({ message: 'Error al obtener citas' });
  }
};

const { Sequelize } = require('sequelize');

// 📊 Clientes con frecuencia de visita
exports.clientesFrecuentes = async (req, res) => {
  const barberoId = req.user.id;

  try {
    const resultados = await Cita.findAll({
      where: { barberoId },
      attributes: [
        'clienteId',
        [Sequelize.fn('COUNT', Sequelize.col('clienteId')), 'frecuencia'],
        [Sequelize.fn('MAX', Sequelize.col('fecha')), 'ultimaCita']
      ],
      include: [{ model: User, as: 'cliente', attributes: ['id', 'name'] }],
      group: ['clienteId', 'cliente.id'],
      order: [[Sequelize.literal('frecuencia'), 'DESC']]
    });

    res.json(resultados);
  } catch (error) {
    console.error('[📉] Error al obtener clientes:', error);
    res.status(500).json({ message: 'Error al obtener clientes', error: error.message });
  }
};



exports.notificacionesPanel = async (req, res) => {
  const barberoId = req.user.id;
  const ahora = new Date();
  const fechaHoy = ahora.toISOString().split('T')[0];
  const horaActual = ahora.toTimeString().slice(0, 5); // formato HH:mm

  // Calculamos hora 2 horas adelante
  const dentroDe2h = new Date(ahora.getTime() + 2 * 60 * 60 * 1000);
  const horaLimite = dentroDe2h.toTimeString().slice(0, 5);

  try {
    const citas = await Cita.findAll({
      where: {
        barberoId,
        estado: 'confirmada',
        fecha: fechaHoy,
        hora: { [Op.between]: [horaActual, horaLimite] }
      },
      include: [{ model: User, as: 'cliente', attributes: ['name'] }],
      order: [['hora', 'ASC']]
    });

    res.json(citas);
  } catch (error) {
    console.error('[🔔] Error en próximas citas:', error);
    res.status(500).json({ message: 'Error al obtener próximas citas' });
  }
};