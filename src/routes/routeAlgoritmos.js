const express = require('express')
const AlgoritmosController = require('../controllers/AlgoritmosController');
const routes = express.Router();

/* Routes Aplicação Mobile */
routes.post('/salas', AlgoritmosController.salasDisponiveisEdit)
routes.put('/editsala/:nreserva', AlgoritmosController.editSala)
routes.post('/datas', AlgoritmosController.datasDisponiveisEdit)
routes.put('/editdata/:nreserva', AlgoritmosController.editData)
routes.post('/horas', AlgoritmosController.findNextReserva)
routes.put('/edithora/:nreserva', AlgoritmosController.extendReserva)
routes.post('/editar_horas', AlgoritmosController.editarHorasReserva)
routes.get('/minutos/:nsala', AlgoritmosController.minutosDisponiveis)

/* Routes Aplicação Web */
routes.get('/count/utilizadores/:nestabelecimento', AlgoritmosController.getUtilizadores)
routes.get('/chart/salas/:nestabelecimento', AlgoritmosController.getSalasMaisReservadas)
routes.post('/chart/reservas/mes/:nestabelecimento', AlgoritmosController.getReservasMensais)
routes.get('/list/estabelecimentos/associados/:nestabelecimento', AlgoritmosController.UtilizadoresEstabelecimento)
routes.get('/list/estabelecimentos/nulos/:nestabelecimento', AlgoritmosController.UtilizadoresEstabelecimentoNulos)
routes.get('/table/user/estabelecimento/:nutilizador', AlgoritmosController.UtilizadoresAssociados)
routes.get('/table/user/sem/estabelecimento/:nutilizador', AlgoritmosController.UtilizadoresNaoAssociados)
routes.post('/notificar/todos/:nestabelecimento', AlgoritmosController.notificarTodosUsers)

module.exports = routes;