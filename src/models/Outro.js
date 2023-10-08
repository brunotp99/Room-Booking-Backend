const { Model, DataTypes } = require('sequelize')

class Outro extends Model {
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
            tableName: 'outros'
        })
    }

    static associate(models){
        this.belongsTo(models.Utilizador, { foreignKey: 'nutilizador', as: 'utilizadores' });
    }

}

module.exports = Outro