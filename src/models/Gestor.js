const { Model, DataTypes } = require('sequelize')

class Gestor extends Model {
    static init(connection){
        super.init({
            nutilizador: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                allowNull: false,
                references: { model: 'utilizadores', key: 'nutilizador'},
            },
            grau: DataTypes.INTEGER,
        }, {
            sequelize: connection,
            tableName: 'gestordeespacos'
        })
    }

    static associate(models){
        this.belongsTo(models.Utilizador, { foreignKey: 'nutilizador', as: 'utilizadores' });
        this.hasMany(models.Sala, { foreignKey: 'nsala', as: 'salas' });

    }

}

module.exports = Gestor