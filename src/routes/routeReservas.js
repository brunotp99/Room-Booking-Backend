const express = require('express')
const ReservaController = require('../controllers/ReservaController');
const routes = express.Router();
const middleware = require('../middleware/jsonWebToken')

/* Routes Aplicação Mobile */
routes.post('/validar/:nestabelecimento', ReservaController.validarReservas) 
routes.post('/validar_tablet', ReservaController.validarReservasTablet)
routes.post('/validar_edit/:nestabelecimento', ReservaController.validarReservasEdit)
routes.post('/minhas/:nestabelecimento', ReservaController.reservasUtilizadorEstabelecimento)
routes.get('/get/:nutilizador', ReservaController.reservasUtilizadorOrganizadas)
routes.get('/getbypk/:nreserva', ReservaController.getByPk)
routes.post('/delete', ReservaController.apagarReserva)
routes.post('/terminar', ReservaController.terminarReserva)
routes.post('/pesquisa/data', ReservaController.filtrarSalasDataHora)
routes.post('/list/data', ReservaController.obterReservas_Sala_Data)
routes.get('/list/sala/:nsala', ReservaController.obterReservasSala)
routes.get('/list/hoje/sala/:nsala', ReservaController.obterReservasSalaHoje)
routes.get('/union/:nestabelecimento', ReservaController.unionReservas)
routes.get('/reserva_sala/:nsala', ReservaController.unionReservas)
routes.get('/hoje/get/:nestabelecimento', ReservaController.ReservasHoje)

/* Routes Aplicação Web */
routes.post('/add', ReservaController.addFromParams) //
routes.post('/inserir/finalizar', middleware.checkToken, ReservaController.addReserva)
routes.get('/limpeza/:nestabelecimento', ReservaController.necessidadeLimpeza) //
routes.get('/ultimas/:nestabelecimento', ReservaController.ultimasReservas) //
routes.get('/todas/:nestabelecimento', ReservaController.reservasEstabelecimento) //
routes.delete('/remover/:nreserva', ReservaController.removerReserva) //
routes.get('/find/:nreserva', ReservaController.getReserva) //
routes.put('/alterar/finalizar/:nreserva', ReservaController.alterarReserva) //
routes.post('/alterar/validar/:nreserva', ReservaController.validarSobreposicaoEdit) //
routes.post('/inserir/validar', ReservaController.validarSobreposicaoNew) //
routes.get('/count/agendadas/:nestabelecimento', ReservaController.getAgendadas) //
routes.get('/count/canceladas/:nestabelecimento', ReservaController.getCanceladas) //
routes.post('/count/totalreservas/:nestabelecimento', ReservaController.getTotalReservas) //
routes.get('/years/:nestabelecimento', ReservaController.usedYears)
routes.post('/notificar/:nsala', ReservaController.notificarDesativacao)

routes.get('/', ReservaController.list)

module.exports = routes;