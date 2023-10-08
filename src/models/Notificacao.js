const { Model, DataTypes } = require('sequelize')

class Notificacao extends Model {
    static init(connection){
        super.init({
            nnotificacao: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
              },
              nutilizador: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'utilizadores', key: 'nutilizador'},
              },
              ntipo: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                references: { model: 'tiponotificacoes', key: 'ntipo'},
              },
              titulo: DataTypes.STRING(30),
              descricao: DataTypes.STRING(200),
              datahora: DataTypes.DATE,
              lido: DataTypes.INTEGER,
              permanencia: DataTypes.INTEGER,
        }, {
            sequelize: connection,
            tableName: 'notificacoes'
        })
    }

    static associate(models){
        this.belongsTo(models.TipoNotificacao, { foreignKey: 'ntipo', as: 'tipo' })
        this.belongsTo(models.Utilizador, { foreignKey: 'nutilizador', as: 'utilizador' })
    }
}

module.exports = Notificacao