const express = require('express')
const SMTPController = require('../controllers/SMTPController');
const routes = express.Router();

routes.post('/recuperacao', SMTPController.envio_recuperacao)

module.exports = routes;