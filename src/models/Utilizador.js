const { Model, DataTypes } = require('sequelize')
const bcrypt = require('bcrypt');

class Utilizador extends Model {
    static init(connection) {
        super.init({
            nutilizador: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            utilizador: DataTypes.STRING(30),
            telemovel: DataTypes.INTEGER,
            cargo: DataTypes.STRING(30),
            email: DataTypes.STRING(100),
            password: DataTypes.STRING(400),
            verifypassword: DataTypes.INTEGER,
            estado: DataTypes.INTEGER,
            imagem: DataTypes.STRING(100),
            notify: DataTypes.STRING(100),
            lastlogin: DataTypes.DATE,
            tokenfirebase: DataTypes.STRING(400),
        }, {
            sequelize: connection,
            tableName: 'utilizadores'
        })
    }

    static associate(models) {
        this.belongsToMany(models.Estabelecimento, { foreignKey: 'nestabelecimento', through: 'users_estabelecimentos', as: 'locais' })
        this.hasMany(models.Utilizador, { foreignKey: 'nutilizador', as: 'notificacoes' });

        models.Utilizador.beforeCreate((user, options) => {
            return bcrypt.hash(user.password, 10)
                .then(hash => {
                    user.password = hash;
                })
                .catch(err => {
                    throw new Error();
                });
        });
    }

}


module.exports = Utilizador

