const { Model, DataTypes } = require('sequelize')

class TipoNotificacao extends Model {
    static init(connection){
        super.init({
            ntipo: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            tipo: DataTypes.STRING(40),
        }, {
            sequelize: connection,
            tableName: 'tiponotificacoes'
        })
    }

    static associate(models){
        this.hasMany(models.Notificacao, { foreignKey: 'ntipo', as: 'tipos' });
    }

}

module.exports = TipoNotificacao