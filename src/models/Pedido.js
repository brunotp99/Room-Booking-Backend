const { Model, DataTypes } = require('sequelize')

class Pedido extends Model {
    static init(connection){
        super.init({
            npedido: {
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
                allowNull: true,
                references: { model: 'utilizadores', key: 'nutilizador'},
              },
              tipo: {
                type: DataTypes.STRING(30),
              },
              descricao: {
                type: DataTypes.STRING(200),
              },
              data: {
                type: DataTypes.DATEONLY,
              },
              horainicio: {
                type: DataTypes.STRING(6),
              },
              horafim: {
                type: DataTypes.STRING(6),
              },
              terminado: {
                type: DataTypes.STRING(30),
              },
        }, {
            sequelize: connection,
            tableName: 'pedidos'
        })
    }

    static associate(models){
        this.belongsTo(models.Utilizador, { foreignKey: 'nutilizador', as: 'utilizador' })
        this.belongsTo(models.Sala, { foreignKey: 'nsala', as: 'sala' });
    }
}

module.exports = Pedido