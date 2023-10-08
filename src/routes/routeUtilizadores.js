const express = require('express')
const UserController = require('../controllers/UtilizadorController');
const routes = express.Router();
const middleware = require('../middleware/jsonWebToken')

/* Routes Aplicação Mobile */
routes.post('/register', UserController.register);
routes.post('/login', UserController.login);
routes.post('/edit/forcepassword', UserController.ForceChangePassword)
routes.post('/edit/password', UserController.alterarSenhaMobile)
routes.get('/notificacoes/:nutilizador', UserController.listNotificacoes)
routes.post('/notify/:nutilizador', UserController.updateNotify)
routes.post('/nome/:nutilizador', UserController.updateNome)
routes.post('/cargo/:nutilizador', UserController.updateCargo)
routes.post('/update/token', UserController.updateToken)

/* Routes Aplicação Web */
routes.get('/locais', middleware.checkToken, UserController.estabelecimentosAssociados)
routes.post('/gestor/definir/senha', middleware.checkToken, UserController.alterarSenha)
routes.post('/gestor/force/senha', middleware.checkToken, UserController.alterarSenhaForce)
routes.get('/table/info/:nutilizador', UserController.UtilizadoresTable)
routes.get('/perfil/info', middleware.checkToken, UserController.UtilizadoresPerfil)
routes.post('/gestor/login', UserController.loginGestor);
routes.post('/gestor/verify', UserController.validateToken);
routes.put('/gestor/atualizar', middleware.checkToken, UserController.updateGestor)
routes.get('/infos/:nutilizador', UserController.listDados)
routes.post("/adicionar/bulk", UserController.bulkInsert);
routes.post('/adicionar/single', UserController.AdicionarUtilizador)
routes.delete('/remover/:nutilizador', UserController.apagarUtilizador)
routes.put('/atualizar/:nutilizador', UserController.updateUtilizador)
routes.put('/estado/:nutilizador', UserController.alterarEstado)
routes.get('/nuser', middleware.checkToken, UserController.getIdUser)
routes.get('/role', middleware.checkToken, UserController.decodeRole)
routes.get('/emails', middleware.checkToken, UserController.checkEmail)
routes.get('/verified', middleware.checkToken, UserController.firstLogin)
routes.get('/refresh/token', middleware.checkToken, UserController.refreshToken)

module.exports = routes;