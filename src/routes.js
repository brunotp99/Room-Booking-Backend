const express = require('express')
const routes = express.Router();

const estabelecimentoRouters = require('./routes/routeEstabelecimentos')
routes.use('/estabelecimentos', estabelecimentoRouters)

const userRouters = require('./routes/routeUtilizadores')
routes.use('/users', userRouters)

const gestorRouters = require('./routes/routeGestor')
routes.use('/gestores', gestorRouters)

const requisitanteRouters = require('./routes/routeRequisitantes')
routes.use('/requisitantes', requisitanteRouters)

const outroRouters = require('./routes/routeOutros')
routes.use('/outros', outroRouters)

const tipoRouters = require('./routes/routeTiposNotificacoes')
routes.use('/tipos', tipoRouters)

const notificacaoRouters = require('./routes/routeNotificacoes')
routes.use('/notificacoes', notificacaoRouters)

const reservaRouters = require('./routes/routeReservas.js')
routes.use('/reservas', reservaRouters)

const salaRouters = require('./routes/routeSalas.js')
routes.use('/salas', salaRouters)

const estadoRouters = require('./routes/routeEstados')
routes.use('/estados', estadoRouters)

const tabletRouters = require('./routes/routeTablets')
routes.use('/tablets', tabletRouters)

const algoritmosRouters = require('./routes/routeAlgoritmos.js')
routes.use('/algoritmos', algoritmosRouters)

const uploadRouters = require('./routes/uploadRoute.js')
routes.use('/uploads', uploadRouters)

const SMTPRouters = require('./routes/routeSMTP')
routes.use('/send/email', SMTPRouters)

const LogRoute = require('./routes/routeLogs')
routes.use('/logs', LogRoute)

const PedidoRoute = require('./routes/routePedidos')
routes.use('/pedidos', PedidoRoute)

routes.get('/', (req, res) => {
    return res.json({status: true, message: "Servidor em execução...", autores: [{autor: "Bruno Pinto - 20261"}, {autor: "Carlos Silva - 16805"}, {autor: "Tiago Martins - 20333"}]})
})

module.exports = routes;