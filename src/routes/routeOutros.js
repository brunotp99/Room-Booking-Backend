const express = require('express')
const OutroController = require('../controllers/OutroController');
const routes = express.Router();

routes.get('/get/:nutilizador', OutroController.list)
routes.post('/adicionar/:nutilizador', OutroController.store)

module.exports = routes;