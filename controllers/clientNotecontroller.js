const { crearnota } = require('../models/crearnota');

exports.crearnota = async (req, res) => {
  try {
    const { clientId, barberId, content, important } = req.body;
    const newNote = await ClientNote.create({ clientId, barberId, content, important });
    res.status(201).json({ ok: true, data: newNote });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Error al crear nota', error });
  }
};

exports.getNotesByClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    const notes = await ClientNote.findAll({
      where: { clientId },
      order: [['createdAt', 'DESC']]
    });
    res.json({ ok: true, data: notes });
  } catch (error) {
    res.status(500).json({ ok: false, message: 'Error al obtener notas', error });
  }
};