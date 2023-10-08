const express = require('express')
const LogsController = require('../controllers/LogsController');
const routes = express.Router();

routes.get('/list', LogsController.list)
routes.post('/create', LogsController.store)

module.exports = routes;