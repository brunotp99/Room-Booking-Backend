const { Model, DataTypes } = require('sequelize')

class Sala extends Model {
    static init(connection){
        super.init({
            nsala: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
              },
              nestabelecimento: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'estabelecimentos', key: 'nestabelecimento'},
              },
              nutilizador: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'utilizadores', key: 'nutilizador'},
              },
              nestado: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: { model: 'estados', key: 'nestado'},
              },
              sala: {
                type: DataTypes.STRING(20),
              },
              lugares: {
                type: DataTypes.INTEGER,
              },
              estadosala: {
                type: DataTypes.INTEGER,
              },
              descricao: {
                type: DataTypes.STRING(200),
              },
              mensagem: {
                type: DataTypes.STRING(400),
              },
              alocacao: {
                type: DataTypes.INTEGER,
              },
              intervalolimpeza: {
                type: DataTypes.INTEGER,
              },
              imagem: {
                type: DataTypes.STRING(100),
              },
        }, {
            sequelize: connection,
            tableName: 'salas'
        })
    }

    static associate(models){
        this.hasMany(models.Tablet, { foreignKey: 'nsala', as: 'tablets' })
        this.belongsTo(models.Estado, { foreignKey: 'nestado', as: 'estado' });
        this.belongsTo(models.Estabelecimento, { foreignKey: 'nestabelecimento', as: 'estabelecimento' });
        this.belongsTo(models.Gestor, { foreignKey: 'nutilizador', as: 'gestor' });
        this.hasMany(models.Reserva, { foreignKey: 'nsala', as: 'reservas' });


    }
}

module.exports = Sala