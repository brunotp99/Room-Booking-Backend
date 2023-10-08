const { Model, DataTypes } = require('sequelize')

class Requisitante extends Model {
    static init(connection){
        super.init({
            nutilizador: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                references: { model: 'utilizadores', key: 'nutilizador'},
            },
        }, {
            sequelize: connection,
            tableName: 'requisitantes'
        })
    }

    static associate(models){
        this.belongsTo(models.Utilizador, { foreignKey: 'nutilizador', as: 'utilizadores' });
    }

}

module.exports = Requisitante