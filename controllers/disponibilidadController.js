const Disponibilidad = require('../models/Disponibilidad');

exports.obtenerDisponibilidad = async (req, res) => {
  try {
    const disponibilidad = await Disponibilidad.findAll({
      where: { barberoId: req.params.id },
      order: [['dia', 'ASC'], ['horaInicio', 'ASC']]
    });
    res.json(disponibilidad);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener disponibilidad', error: error.message });
  }
};

exports.guardarDisponibilidad = async (req, res) => {
  try {
    const { disponibilidad } = req.body;
    const barberoId = req.params.id;

    console.log('=== DEBUG GUARDAR DISPONIBILIDAD ===');
    console.log('Barbero ID:', barberoId);
    console.log('Disponibilidad recibida:', disponibilidad);

    // Validar que se envíen datos
    if (!disponibilidad || !Array.isArray(disponibilidad)) {
      return res.status(400).json({ 
        message: 'Se requiere un array de disponibilidad válido' 
      });
    }

    // Validar y filtrar horarios válidos
    const horariosFiltrados = disponibilidad
      .filter(h => {
        // Verificar que tenga todos los campos requeridos
        if (typeof h.dia !== 'number' || h.dia < 0 || h.dia > 6) {
          console.log('Día inválido:', h.dia);
          return false;
        }
        
        if (!h.inicio || !h.fin) {
          console.log('Horarios faltantes:', h);
          return false;
        }

        // Verificar que la hora de inicio sea menor que la de fin
        if (h.inicio >= h.fin) {
          console.log('Horario inválido (inicio >= fin):', h);
          return false;
        }

        // Solo incluir días activos
        if (h.activo !== true) {
          console.log('Día no activo:', h);
          return false;
        }

        return true;
      })
      .map(h => ({
        dia: h.dia,
        horaInicio: h.inicio,
        horaFin: h.fin,
        barberoId: barberoId
      }));

    console.log('Horarios filtrados:', horariosFiltrados);

    // Eliminar disponibilidad anterior
    await Disponibilidad.destroy({ where: { barberoId } });

    // Crear nueva disponibilidad si hay horarios válidos
    if (horariosFiltrados.length > 0) {
      await Disponibilidad.bulkCreate(horariosFiltrados);
    }

    res.status(201).json({ 
      message: 'Disponibilidad actualizada correctamente',
      horariosGuardados: horariosFiltrados.length
    });
  } catch (error) {
    console.error('Error al guardar disponibilidad:', error);
    res.status(500).json({ 
      message: 'Error al guardar disponibilidad', 
      error: error.message 
    });
  }
};

// 🗓️ Obtener disponibilidad para un día específico
exports.obtenerDisponibilidadPorDia = async (req, res) => {
  try {
    const { barberoId, dia } = req.params;
    
    const disponibilidad = await Disponibilidad.findOne({
      where: { 
        barberoId: barberoId,
        dia: parseInt(dia)
      }
    });

    if (!disponibilidad) {
      return res.status(404).json({ 
        message: 'No hay disponibilidad configurada para este día' 
      });
    }

    res.json(disponibilidad);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error al obtener disponibilidad del día', 
      error: error.message 
    });
  }
};

// 📅 Obtener horarios disponibles para agendar
exports.obtenerHorariosDisponibles = async (req, res) => {
  try {
    const { barberoId, fecha } = req.params;
    
    console.log('=== DEBUG HORARIOS DISPONIBLES ===');
    console.log('Barbero ID:', barberoId);
    console.log('Fecha:', fecha);
    
    // Obtener el día de la semana (0 = domingo, 1 = lunes, etc.)
    // Corregir el parsing de fecha para evitar problemas de zona horaria
    const [year, month, day] = fecha.split('-').map(Number);
    const fechaObj = new Date(year, month - 1, day); // month - 1 porque los meses van de 0-11
    const diaSemana = fechaObj.getDay();
    
    console.log('Día de la semana (getDay):', diaSemana);
    
    // Buscar disponibilidad del barbero para ese día
    const disponibilidad = await Disponibilidad.findOne({
      where: { 
        barberoId: barberoId,
        dia: diaSemana 
      }
    });

    console.log('Disponibilidad encontrada:', disponibilidad);

    if (!disponibilidad) {
      return res.status(404).json({ 
        message: 'El barbero no trabaja en este día',
        horariosDisponibles: []
      });
    }

    // Generar horarios disponibles (cada hora)
    const horariosDisponibles = [];
    const horaInicio = parseInt(disponibilidad.horaInicio.split(':')[0]);
    const horaFin = parseInt(disponibilidad.horaFin.split(':')[0]);

    for (let hora = horaInicio; hora < horaFin; hora++) {
      const horario = `${hora.toString().padStart(2, '0')}:00`;
      horariosDisponibles.push(horario);
    }

    res.json({
      message: 'Horarios disponibles obtenidos',
      disponibilidad: disponibilidad,
      horariosDisponibles: horariosDisponibles
    });

  } catch (error) {
    console.error('Error al obtener horarios disponibles:', error);
    res.status(500).json({ 
      message: 'Error al obtener horarios disponibles', 
      error: error.message 
    });
  }
};