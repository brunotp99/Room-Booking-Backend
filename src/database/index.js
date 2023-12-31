const Sequelize = require('sequelize')
const dbConfig = require('../config/database')

const Estabelecimento = require('../models/Estabelecimento')
const Utilizador = require('../models/Utilizador')
const Gestor = require('../models/Gestor')
const Requisitante = require('../models/Requisitante')
const Outro = require('../models/Outro')
const TipoNotificacao = require('../models/TipoNotificacao')
const Notificacao = require('../models/Notificacao')
const Tablet = require('../models/Tablet')
const Estado = require('../models/Estado')
const Sala = require('../models/Sala')
const Reserva = require('../models/Reserva')
const Log = require('../models/Log')
const Pedido = require('../models/Pedido')

const connection = new Sequelize(dbConfig)

Estabelecimento.init(connection)
Utilizador.init(connection)
Gestor.init(connection)
Requisitante.init(connection)
Outro.init(connection)
TipoNotificacao.init(connection)
Notificacao.init(connection)
Tablet.init(connection)
Estado.init(connection)
Sala.init(connection)
Reserva.init(connection)
Log.init(connection)
Pedido.init(connection)

Gestor.associate(connection.models)
Requisitante.associate(connection.models)
Outro.associate(connection.models)
Utilizador.associate(connection.models)
Estabelecimento.associate(connection.models)
TipoNotificacao.associate(connection.models)
Notificacao.associate(connection.models)
Estado.associate(connection.models)
Sala.associate(connection.models)
Tablet.associate(connection.models)
Reserva.associate(connection.models)
Log.associate(connection.models)
Pedido.associate(connection.models)

module.exports = connection