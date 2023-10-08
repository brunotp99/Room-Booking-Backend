const express = require('express')
const RequisitanteController = require('../controllers/RequisitanteController');
const routes = express.Router();

routes.get('/get/:nutilizador', RequisitanteController.list)
routes.post('/adicionar/:nutilizador', RequisitanteController.store)

module.exports = routes;