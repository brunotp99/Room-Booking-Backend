const { Model, DataTypes } = require('sequelize')

class Estado extends Model {
    static init(connection){
        super.init({
            nestado: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            estado: DataTypes.STRING(30),
        }, {
            sequelize: connection,
            tableName: 'estados'
        })
    }

    static associate(models){
        this.hasMany(models.Sala, { foreignKey: 'nestado', as: 'salas' });

    }

}

module.exports = Estado