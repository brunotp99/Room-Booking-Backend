const { Model, DataTypes } = require('sequelize')

class Log extends Model {
    static init(connection){
        super.init({
            nlog: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
              },
              nutilizador: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'utilizadores', key: 'nutilizador'},
              },
              tipo: DataTypes.STRING(30),
              acao: DataTypes.STRING(30),
              descricao: DataTypes.STRING(200),
              datahora: DataTypes.DATE,
              lido: DataTypes.INTEGER,
        }, {
            sequelize: connection,
            tableName: 'logs'
        })
    }

    static associate(models){
        this.belongsTo(models.Utilizador, { foreignKey: 'nutilizador', as: 'utilizador' })
    }
}

module.exports = Log