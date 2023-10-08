const { Model, DataTypes } = require('sequelize')

class Tablet extends Model {
    static init(connection){
        super.init({
            ntablet: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
              },
              nsala: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'salas', key: 'nsala'},
              },
              marca: DataTypes.STRING(30),
              modelo: DataTypes.STRING(30),
              pin: DataTypes.INTEGER,
        }, {
            sequelize: connection,
            tableName: 'tablets'
        })
    }

    static associate(models){
        this.belongsTo(models.Sala, { foreignKey: 'nsala', as: 'salas' })
    }
}

module.exports = Tablet