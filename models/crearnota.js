// models/ClientNote.js
module.exports = (sequelize, DataTypes) => {
  const ClientNote = sequelize.define('ClientNote', {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    important: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  });

  ClientNote.associate = (models) => {
    ClientNote.belongsTo(models.User, { as: 'client', foreignKey: 'clientId' });
    ClientNote.belongsTo(models.Barber, { foreignKey: 'barberId' });
  };

  return ClientNote;
};