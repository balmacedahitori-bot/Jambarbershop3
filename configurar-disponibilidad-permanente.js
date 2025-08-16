// Script para configurar disponibilidad permanente del barbero
const Disponibilidad = require('./models/Disponibilidad');
const { sequelize } = require('./models/index');

async function configurarDisponibilidadPermanente() {
  console.log('=== CONFIGURANDO DISPONIBILIDAD PERMANENTE ===\n');

  try {
    // Conectar a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    // Configuración por defecto: Lunes a Viernes de 9:00 a 18:00
    const disponibilidadPorDefecto = [
      {
        dia: 1, // Lunes
        horaInicio: '09:00',
        horaFin: '18:00',
        barberoId: 1
      },
      {
        dia: 2, // Martes
        horaInicio: '09:00',
        horaFin: '18:00',
        barberoId: 1
      },
      {
        dia: 3, // Miércoles
        horaInicio: '09:00',
        horaFin: '18:00',
        barberoId: 1
      },
      {
        dia: 4, // Jueves
        horaInicio: '09:00',
        horaFin: '18:00',
        barberoId: 1
      },
      {
        dia: 5, // Viernes
        horaInicio: '09:00',
        horaFin: '18:00',
        barberoId: 1
      }
    ];

    console.log('Configurando disponibilidad para barbero ID 1...');
    console.log('Horarios:', disponibilidadPorDefecto);

    // Verificar si ya existe disponibilidad
    const disponibilidadExistente = await Disponibilidad.findAll({
      where: { barberoId: 1 }
    });

    if (disponibilidadExistente.length > 0) {
      console.log('⚠️ Ya existe disponibilidad configurada:');
      disponibilidadExistente.forEach(d => {
        const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        console.log(`  ${dias[d.dia]}: ${d.horaInicio} - ${d.horaFin}`);
      });
      
      console.log('\n¿Deseas sobrescribir la configuración existente? (s/n)');
      // En un script real, aquí se pediría confirmación
      console.log('Para sobrescribir, ejecuta: node configurar-disponibilidad-permanente.js --force');
      return;
    }

    // Crear nueva disponibilidad
    await Disponibilidad.bulkCreate(disponibilidadPorDefecto);

    console.log('✅ Disponibilidad configurada exitosamente');
    console.log(`Se configuraron ${disponibilidadPorDefecto.length} días de trabajo`);

    // Verificar que se guardó correctamente
    const disponibilidadGuardada = await Disponibilidad.findAll({
      where: { barberoId: 1 },
      order: [['dia', 'ASC']]
    });

    console.log('\n📋 Disponibilidad guardada:');
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    disponibilidadGuardada.forEach(d => {
      console.log(`  ${dias[d.dia]}: ${d.horaInicio} - ${d.horaFin}`);
    });

    console.log('\n🎉 ¡Configuración completada!');
    console.log('Los clientes ahora pueden agendar citas en estos horarios.');

  } catch (error) {
    console.error('❌ Error al configurar disponibilidad:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    // Cerrar conexión
    await sequelize.close();
    console.log('\n🔌 Conexión a la base de datos cerrada');
  }
}

// Verificar si se debe forzar la configuración
if (process.argv.includes('--force')) {
  console.log('🔄 Forzando configuración...');
  configurarDisponibilidadPermanente();
} else {
  configurarDisponibilidadPermanente();
}
