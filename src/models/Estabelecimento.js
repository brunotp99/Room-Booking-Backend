const { Model, DataTypes } = require('sequelize')

class Estabelecimento extends Model {
    static init(connection){
        super.init({
            nestabelecimento: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            estabelecimento: DataTypes.STRING(30),
            estado: DataTypes.INTEGER,
            localidade: DataTypes.STRING(40),
        }, {
            sequelize: connection,
            tableName: 'estabelecimentos'
        })
    }

    static associate(models){
        this.belongsToMany(models.Utilizador, { foreignKey: 'nutilizador', through: 'users_estabelecimentos', as: 'locais' })
        this.hasMany(models.Sala, { foreignKey: 'nsala', as: 'salas' });

    }
}

module.exports = Estabelecimento