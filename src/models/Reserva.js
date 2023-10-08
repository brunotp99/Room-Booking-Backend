const { Model, DataTypes } = require('sequelize')

class Reserva extends Model {
    static init(connection){
        super.init({
            nreserva: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
              },
              nsala: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'salas', key: 'nsala'},
              },
              nutilizador: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'utilizadores', key: 'nutilizador'},
              },
              datareserva: {
                type: DataTypes.DATEONLY,
              },
              horainicio: {
                type: DataTypes.STRING(6),
              },
              horafim: {
                type: DataTypes.STRING(6),
              },
              fimreserva: {
                type: DataTypes.STRING(6),
              },
              estado: {
                type: DataTypes.INTEGER,
              },
              notificado: {
                type: DataTypes.INTEGER,
              },
        }, {
            sequelize: connection,
            tableName: 'reservas'
        })
    }

    static associate(models){
        this.belongsTo(models.Utilizador, { foreignKey: 'nutilizador', as: 'utilizadores' });
        this.belongsTo(models.Sala, { foreignKey: 'nsala', as: 'sala' });

    }

}

module.exports = Reserva