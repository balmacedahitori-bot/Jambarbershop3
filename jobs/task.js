const cron = require('node-cron');
const { Op } = require('sequelize');
const Cita = require('../models/Cita');


cron.schedule('* * * * *', async () => {
  const ahora = new Date();
  const fechaActual = ahora.toISOString().slice(0, 10);
  const horaActual = ahora.toTimeString().slice(0, 5);

  try {
    const citas = await Cita.findAll({
      where: {
        estado: 'confirmada',
        fecha: { [Op.lte]: fechaActual },
        hora: { [Op.lte]: horaActual }
      }
    });

    for (const cita of citas) {
      cita.estado = 'completada';
      await cita.save();
      console.log(`✔️ Cita ${cita.id} marcada como completada`);
    }
  } catch (err) {
    console.error('Error al actualizar citas:', err.message);
  }
});

cron.schedule('* * * * *', async () => {
  console.log('Cron activo');
});
