const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/Utilizador')
const config = require('../config/jwtSecret')
const { Op } = require('sequelize')
const Gestor = require('../models/Gestor')
const Requisitante = require('../models/Requisitante')
const Outro = require('../models/Outro')
const Algoritmos = require('../controllers/AlgoritmosController')
const GestorController = require('../controllers/GestorController')
const OutroController = require('../controllers/OutroController')
const RequisitanteController = require('../controllers/RequisitanteController')
const Reserva = require('../models/Reserva')
const Notifiacao = require('../models/Notificacao')
const readXlsxFile = require("read-excel-file/node");
const SMTPController = require('./SMTPController')

module.exports = {

    async listDados(req, res) {
        const { nutilizador } = req.params

        const infos = await User.findByPk(nutilizador, {
            attributes: ['nutilizador', 'utilizador', 'email', 'telemovel', 'cargo', 'verifypassword', 'imagem', 'notify'],
            where: { nutilizador, estado: 1 },
        })

        const outro = await Outro.findByPk(nutilizador)
        const requi = await Requisitante.findByPk(nutilizador)

        if(outro != null) return res.json({infos, tipo: "outro"})
        else if(requi != null) return res.json({infos, tipo: "requisitante"})
        else return res.json({infos, tipo: "gestor"})
    },

    async UtilizadoresTable(req, res) {

        const { nutilizador } = req.params

        if (nutilizador == undefined || nutilizador == null)
            return res.status(400).send(false)

        const infos = await User.findByPk(nutilizador, {
            attributes: ['nutilizador', 'utilizador', 'email', 'telemovel', 'cargo', 'verifypassword', 'imagem', 'notify'],
            where: { nutilizador, estado: 1 },
        })

        const outro = await Outro.findByPk(nutilizador)
        const requi = await Requisitante.findByPk(nutilizador)
        const gestor = await Gestor.findByPk(nutilizador)

        if(outro != null) return res.json({infos, tipo: "Funcionário"})
        else if(requi != null) return res.json({infos, tipo: "Requisintante"})
        else if(gestor != null)  return res.json({infos, tipo: "Gestor de Espaços"})
        else return res.json({infos, tipo: "unknown"})
    },

    async UtilizadoresPerfil(req, res) {

        const nutilizador = req.decoded.nuser

        if (nutilizador == undefined || nutilizador == null)
            return res.status(400).send(false)

        const infos = await User.findByPk(nutilizador, {
            attributes: ['nutilizador', 'utilizador', 'email', 'telemovel', 'cargo', 'verifypassword', 'imagem', 'notify'],
            where: { nutilizador, estado: 1 },
        })

        const outro = await Outro.findByPk(nutilizador)
        const requi = await Requisitante.findByPk(nutilizador)
        const gestor = await Gestor.findByPk(nutilizador)

        if(outro != null) return res.json({infos, tipo: "Funcionário"})
        else if(requi != null) return res.json({infos, tipo: "Requisintante"})
        else if(gestor != null)  return res.json({infos, tipo: "Gestor de Espaços"})
        else return res.json({infos, tipo: "unknown"})
    },

    async getIdUser(req, res) {

        const nutilizador = req.decoded.nuser

        if (nutilizador == undefined || nutilizador == null)
            return res.status(400).send(false)

        const user = await User.findByPk(nutilizador, {
            attributes: ['nutilizador'],
        })

        if(user){
            return res.json({success: true, nutilizador: user.nutilizador})
        }else return res.json({success: false, nutilizador: 0})

    },

    async updateNotify(req, res) {

        const { nutilizador, estado } = req.body

        const notify = await User.update(
            {
                notify: estado,
            },
            {
                where: { nutilizador },
            }
        );

        return res.json(true)
    },

    async updateNome(req, res) {

        const { nutilizador } = req.params
        const { nome } = req.body

        if (nutilizador == undefined || nutilizador == null)
            return res.status(400).send(false)

        const user = await User.findByPk(nutilizador)

        if (user) {
            user.update({
                utilizador: nome
            }).then(result => {
                return res.status(200).json(true)
            }).catch(error => {
                return res.status(400).json(false)
            })
        } else return res.status(400).json(false)

    },

    async updateCargo(req, res) {

        const { nutilizador } = req.params
        const { cargo } = req.body

        if (nutilizador == undefined || nutilizador == null)
            return res.status(400).send(false)

        const user = await User.findByPk(nutilizador)

        if (user) {
            user.update({
                cargo: cargo
            }).then(result => {
                return res.status(200).json(true)
            }).catch(error => {
                return res.status(400).json(false)
            })
        } else return res.status(400).json(false)

    },

    async listNotificacoes(req, res) {
        const { nutilizador } = req.params

        const notificacoes = await User.findByPk(nutilizador, {
            include: { association: 'notificacoes' }
        })

        return res.json(notificacoes)
    },

    async list(req, res) {
        const users = await User.findAll()
        return res.json(users)
    },

    async store(req, res) {
        const { utilizador, telemovel, cargo, email, password, verifypassword, estado, imagem, notify } = req.body

        const user = await User.create({ utilizador, telemovel, cargo, email, password, verifypassword, estado, imagem, notify })

        return res.json(user)
    },

    async userValidation(req, res) {

        const { email, password } = req.query
        if ((email || password) == undefined)
            return res.json({ "data": { "status": "false" } })
        const utilizadores = await User.findOne({
            where: {
                email: {
                    [Op.iLike]: email,
                },
                password: {
                    [Op.iLike]: password,
                }
            },
            include: [
                { association: 'requisitantes' },
            ]
        })
        if (utilizadores == null)
            return res.json({ "data": { "status": "false" } })
        else res.json({ "data": { "status": "true" } })

    },

    async registroUtilizador(req, res) {

    },

    async updateToken(req, res) {

        const { nutilizador, token } = req.body

        User.update({tokenfirebase: token}, {where: {nutilizador: parseInt(nutilizador)}}).then(result => {
            return res.json({success: true, result: result})
        }).catch(error => {
            return res.json({success: false, result: error})
        })

    },

    async register(req, res) {
        const { name, email, password } = req.body;
        const data = await User.create({
            name: name,
            email: email,
            password: password
        })
            .then(function (data) {
                return data;
            })
            .catch(error => {
                console.log("Erro: " + error);
                return error;
            })
        res.status(200).json({
            success: true,
            message: "Registado",
            data: data
        });
    },

    async login(req, res){
        let status = false
        if (req.body.email && req.body.password) {
            var email = req.body.email;
            var password = req.body.password;
            var estabelecimento = req.body.estabelecimento
        }

        var user = await User.findOne({ where: { email: email } })
            .then(function (data) {
                return data;
            })
            .catch(error => {
                console.log("Erro: " + error);
                return error;
            })
        if (password === null || typeof password === "undefined") {
            res.status(200).json({
                success: false,
                message: 'vazio'
            });

        } else {
            if (req.body.email && req.body.password && user) {
                const isMatch = bcrypt.compareSync(password, user.password);
                if (req.body.email === user.email && isMatch) {
                    let token = jwt.sign({ email: req.body.email }, config.jwtSecret,
                        {
                            expiresIn: '1h' //expira em 1 hora
                        })

                        if(user.estado == 0) return res.status(200).json({ success: false, message: 'utilizador_desativado' });

                        Gestor.findByPk(user.nutilizador).then(gestor => {
                            if(gestor.grau == 1){
                                res.json({ success: true, message: 'Autenticação realizada com sucesso!', token: token, id: user.nutilizador });       
                            }else{
                                Algoritmos.getEstabelecimentos(user.nutilizador)
                                .then((result) => {                      
                                    for(i = 0; i < result.length; i++){
                                        console.log(result[0])
                                        if(estabelecimento == result[0])
                                            status = true
                                    }  
    
                                    if(status) res.json({ success: true, message: 'Autenticação realizada com sucesso!', token: token, id: user.nutilizador });
                                    else res.status(200).json({ success: false, message: 'nao_associado' });   
                                }).catch((err) => console.log("Erro login: ", err))  
                            }
     
                        }).catch(error => {
                            
                            Algoritmos.getEstabelecimentos(user.nutilizador)
                            .then((result) => {                        
                                for(i = 0; i < result.length; i++){
                                    console.log(result[0])
                                    if(estabelecimento == result[0])
                                        status = true
                                }  

                                if(status) res.json({ success: true, message: 'Autenticação realizada com sucesso!', token: token, id: user.nutilizador });
                                else res.status(200).json({ success: false, message: 'nao_associado' });   
    
                            })
                            .catch((err) => console.log("Erro login: ", err))   
                        })

                } else {
                    res.status(200).json({ success: false, message: 'dados_invalidos' });
                }
            } else {
                res.status(200).json({ success: false, message: 'Erro no processo de autenticação. Tente de novo mais tarde.' });
            }
        }
    },

    async loginGestor(req, res){
        let status = false
        if (req.body.email && req.body.password) {
            var email = req.body.email;
            var password = req.body.password;
        }

        var user = await User.findOne({ where: { email: email } })
            .then(function (data) {
                return data;
            })
            .catch(error => {
                console.log("Erro: " + error);
                return error;
            })
        if (password === null || typeof password === "undefined") {
            res.status(403).json({
                success: false,
                message: 'Por favor, preencha todos os campos!'
            });

        } else {
            if (req.body.email && req.body.password && user) {
                const isMatch = bcrypt.compareSync(password, user.password);
                if (req.body.email === user.email && isMatch) {

                    if(user.estado == 0) return res.status(403).json({ success: false, message: 'Atenção, a sua conta foi desativada, por favor entre em contacto com um administrador.' });

                    Gestor.findByPk(user.nutilizador).then(gestor => {
                        var list = []
                        if(gestor.grau == 1){
                            Algoritmos.todosEstabelecimentos()
                            .then((result) => {                         
                                result.forEach((x, i) => list.push(x.id));
                               let token = jwt.sign({ email: req.body.email, nuser: user.nutilizador, roles: [gestor.grau], locais: list }, config.jwtSecret, {
                                expiresIn: '1h' //expira em 1 hora
                               });
                               res.json({success: true, message: 'Autenticação realizada com sucesso!', accessToken: token, nome: user.utilizador, cargo: user.cargo, imagem: user.imagem, verify: user.verifypassword});                               
                            })
                            .catch((error) => {
                                res.json({success: false, message: error});
                            }) 
                        }else{
                            Algoritmos.algunsEstabelecimentos(user.nutilizador)
                            .then((result) => {                     
                               result.forEach((x, i) => list.push(x.id));
                               let token = jwt.sign({ email: req.body.email, nuser: user.nutilizador, roles: [gestor.grau], locais: list }, config.jwtSecret, {
                                expiresIn: '1h' //expira em 1 hora
                               });
                               res.json({success: true, message: 'Autenticação realizada com sucesso!', accessToken: token, nome: user.utilizador, cargo: user.cargo, imagem: user.imagem, verify: user.verifypassword});
                            
                            })
                            .catch((error) => {
                                res.json({success: false, message: error});
                            }) 
                        }
 
                    }).catch(error => {
                        res.status(403).json({ success: false, message: 'Desculpe, a sua conta não tem acesso a aplicação web.' });
                    })

                } else {
                    res.status(403).json({ success: false, message: 'Desculpe, os dados de acesso fornecidos são invalidos!' });
                }
            } else {
                res.status(403).json({ success: false, message: 'Desculpe, o endereço email fornecido não esta registado.' });
            }
        }
    },

    async refreshToken(req, res){
        if(req.decoded.nuser){

            const user = await User.findByPk(req.decoded.nuser)

            if(user){
                Gestor.findByPk(user.nutilizador).then(gestor => {
                    var list = []
                    if(gestor.grau == 1){
                        Algoritmos.todosEstabelecimentos()
                        .then((result) => {                         
                            result.forEach((x, i) => list.push(x.id));
                           let token = jwt.sign({ email: req.body.email, nuser: user.nutilizador, roles: [gestor.grau], locais: list }, config.jwtSecret, {
                            expiresIn: '1h' //expira em 1 hora
                           });
                           res.json({success: true, message: 'Autenticação realizada com sucesso!', accessToken: token, nome: user.utilizador, cargo: user.cargo, imagem: user.imagem, verify: user.verifypassword});                               
                        })
                        .catch((error) => {
                            res.json({success: false, message: error});
                        }) 
                    }else{
                        Algoritmos.algunsEstabelecimentos(user.nutilizador)
                        .then((result) => {                     
                           result.forEach((x, i) => list.push(x.id));
                           let token = jwt.sign({ email: req.body.email, nuser: user.nutilizador, roles: [gestor.grau], locais: list }, config.jwtSecret, {
                            expiresIn: '1h' //expira em 1 hora
                           });
                           res.json({success: true, message: 'Autenticação realizada com sucesso!', accessToken: token, nome: user.utilizador, cargo: user.cargo, imagem: user.imagem, verify: user.verifypassword});
                        
                        })
                        .catch((error) => {
                            res.json({success: false, message: error});
                        }) 
                    }
    
                }).catch(error => {
                    res.status(403).json({ success: false, message: 'Desculpe, a sua conta não tem acesso a aplicação web.' });
                })
            }

        }
    },

    async ForceChangePassword(req, res){
        const { email, password } = req.body;
        console.log(password)
        let newPassword
        User.findOne({
            where: {email}
        }).then(result => {
            bcrypt.hash(password, 10)
            .then(hash => {
                newPassword = hash;
                result.update({ password: newPassword, verifypassword: 1 })
            })
            .catch(error => {
                console.log("Erro Bcrypt: " + error);
                return error;
            });
        })
        .catch(error => {
            console.log("Erro: " + error);
            return error;
        })
        res.status(200).send(true);
    },

    async alterarSenhaMobile(req, res){

        const { nutilizador, antiga, nova } = req.body

        if(nutilizador == undefined || antiga == undefined || nova == undefined)
            return res.status(200).json({ success: false, message: 'Porfavor, preencha todos os campos!' });

        var password = nova.toString()
        var nuser = parseInt(nutilizador)

        const user = await User.findByPk(nuser)

        if (nuser && antiga && user) {
            const isMatch = bcrypt.compareSync(antiga.toString(), user.password);
            console.log(nuser, user.nutilizador, isMatch)
            console.log(antiga, user.password)
            if (nuser === user.nutilizador && isMatch) {
                bcrypt.hash(password, 10)
                .then(hash => {
                    password = hash;
                    User.update({password: password}, {where: {nutilizador: nuser}}).then(result => {
                        return result;
                    })
                    .catch(error => {
                        console.log("Erro: " + error);
                        return error;
                    })
                })
                .catch(error => {
                    console.log("Erro Bcrypt: " + error);
                    return error;
                });
                return res.json({ success: true, message: 'A sua palavra-passe foi atualizada com sucesso!' });
            }else return res.json({ success: false, message: 'Desculpe, a sua palavra-passe antiga esta incorreta!' });
        }else return res.json({ success: false, message: 'Porfavor, entre novamente na sua conta!' });

    },

    async alterarSenha(req, res){

        const { antiga, nova } = req.body

        if(antiga == undefined || nova == undefined)
            return res.status(200).json({ success: false, message: 'Porfavor, preencha todos os campos!' });

        var password = nova

        if(req.decoded.nuser){

            const user = await User.findByPk(req.decoded.nuser)

            if(user){
                const nutilizador = req.decoded.nuser
                const isMatch = bcrypt.compareSync(antiga, user.password);
                if (req.decoded.nuser === user.nutilizador && isMatch) {
                    bcrypt.hash(password, 10)
                    .then(hash => {
                        password = hash;
                        User.update({password: password}, {where: {nutilizador}}).then(result => {
                            return result;
                        })
                        .catch(error => {
                            console.log("Erro: " + error);
                            return error;
                        })
                    })
                    .catch(error => {
                        console.log("Erro Bcrypt: " + error);
                        return error;
                    });
                    return res.status(200).json({ success: true, message: 'A sua palavra-passe foi atualizada com sucesso!' });
                }else return res.status(200).json({ success: false, message: 'Desculpe, a sua palavra-passe antiga esta incorreta!' });
            }else return res.status(200).json({ success: false, message: 'Porfavor, entre novamente na sua conta!' });

        }else return res.status(200).json({ success: false, message: 'Porfavor, entre novamente na sua conta!' });

    },

    async alterarSenhaForce(req, res){

        const { nova } = req.body

        if(nova == undefined)
            return res.status(200).json({ success: false, message: 'Porfavor, preencha todos os campos!' });

        var password = nova
        const nutilizador = req.decoded.nuser

        bcrypt.hash(password, 10)
        .then(hash => {
            password = hash;
            User.update({password: password, verifypassword: 1}, {where: {nutilizador}}).then(result => {
                return result;
            })
            .catch(error => {
                console.log("Erro: " + error);
                return error;
            })
        })
        .catch(error => {
            console.log("Erro Bcrypt: " + error);
            return error;
        });
        return res.status(200).json({ success: true, message: 'A sua palavra-passe foi atualizada com sucesso!' });
               
    },

    async AdicionarUtilizador(req, res){
        const { nome, cargo, telemovel, email, tipo, estabelecimentos, grau } = req.body

        if(nome == undefined || cargo == undefined || telemovel == undefined || email == undefined || tipo == undefined || estabelecimentos == undefined || grau == undefined) 
            return res.status(200).json({success: false, message: "Campos Vazios"});

        const password = Math.random().toString(36).slice(-8);
        const data = await User.create({
            utilizador: nome,
            cargo: cargo,
            telemovel: telemovel,
            email: email,
            verifypassword: 0,
            estado: 1,
            imagem: "default.jpg",
            notify: 1,
            password: password
        }).then(function (data) {
            
            if(tipo == "1"){
                GestorController.AssociarGestor(data.nutilizador, grau)
                .then((res) => console.log("Associado Gestor"))
                .catch((err) => console.log("Erro Gestor: ", err))
            }     
            else if(tipo == "2"){
                OutroController.AssociarOutros(data.nutilizador)
                .then((res) => console.log("Associado Outro"))
                .catch((err) => console.log("Erro Outro: ", err))
            }
            else if(tipo == "3"){
                RequisitanteController.AssociarRequisitante(data.nutilizador)
                .then((res) => console.log("Associado Requsisitante"))
                .catch((err) => console.log("Erro Requsisitante: ", err))
            }

            const array = estabelecimentos.split(",");
            for(i=0; i < array.length; i++){
                Algoritmos.AssociarEstabelecimento(data.nutilizador, parseInt(array[i]))
                .then((res) => console.log("Associado a Estabelecimentos"))
                .catch((err) => console.log("Erro: ", err))
            }
            SMTPController.primeiro_registo([{utilizador: nome, cargo: cargo, email: email, password: password}])
                .then((res) => console.log("Fim envio de confirmações"))
                .catch((err) => console.log("Erro ao enviar confirmações: ", err))
            return data;
        }).catch(error => {
            console.log("Erro: " + error);
            return error;
        })
        res.status(200).json({
            success: true,
            message: "Registado",
            data: data
        });

    },

    async bulkInsert(req, res){

        const { users } = req.body

        const usersJSONOriginal = JSON.parse(users)
        const usersJSON = JSON.parse(users)

        usersJSON.map((item, i, row) => {

            if (i + 1 === row.length) {

                bcrypt.hash(item.password, 10)
                .then(hash => {
                    item.password = hash
                    User.bulkCreate(usersJSON).then((result) => {
                        var i = 0
                        usersJSON.map(item => {
                            console.log("ID: " + result[i].nutilizador)
                            if(item.tipo != undefined){
                                if(item.tipo == "Gestor" || item.tipo == "gestor"){
                                    GestorController.AssociarGestor(result[i].nutilizador, 0)
                                    .then((res) => { console.log("Associado a Gestor") })
                                    .catch((err) => {})
                                }     
                                else if(item.tipo == "Outro" || item.tipo == "outro"){
                                    OutroController.AssociarOutros(result[i].nutilizador)
                                    .then((res) => { console.log("Associado a Outro") })
                                    .catch((err) => {})
                                }
                                else if(item.tipo == "Requisitante" || item.tipo == "requisitante"){
                                    RequisitanteController.AssociarRequisitante(result[i].nutilizador)
                                    .then((res) => { console.log("Associado a Requisitante") })
                                    .catch((err) => {})
                                }
                            }
                            if(item.estabelecimentos != undefined){
                                const array = item.estabelecimentos.split(", ");
                                console.log(array)
                                array.map(x => {
                                    Algoritmos.AssociarEstabelecimentoLocalidade(x, result[i].nutilizador)
                                    .then((res) => { console.log("Associado Estabelecimento: " + x) })
                                    .catch((err) => { })
                                })
                            }
                            i++;
                        })
                        
                        SMTPController.primeiro_registo(usersJSONOriginal)
                            .then((res) => console.log("Fim envio de confirmações"))
                            .catch((err) => console.log("Erro ao enviar confirmações: ", err))
                          res.status(200).send({
                              success: true,
                              message: "Utilizadores introduzidos com sucesso"
                          });
                        console.log("Fim")
                      }).catch((error) => {
                        console.log(error)
                        res.status(500).send({
                          success: false,
                          message: "Não foi póssivel carregar os utilizadores!",
                          error: error.message,
                        });
                    });
                })
                .catch(err => {
                    console.log(err)
                });

            } else {
                bcrypt.hash(item.password, 10)
                .then(hash => {
                    item.password = hash
                })
                .catch(err => {
                    console.log(err)
                });
            }


        })


    },

    async apagarUtilizador(req, res){
        const { nutilizador } = req.params

        if(nutilizador == undefined) return res.status(400).json({success: false, message: "Campo vazio"});

        const user = await User.findByPk(nutilizador)

        if(user != null){

            Gestor.destroy({where: {nutilizador: user.nutilizador}}).then(result => {
                console.log("Removido Gestor")
            }).catch(error => {
                console.log("Não era Gestor")
            })
               
            Outro.destroy({where: {nutilizador: user.nutilizador}}).then(result => {
                console.log("Removido Outro")
            }).catch(error => {
                console.log("Não era Outro")
            })
            
            Requisitante.destroy({where: {nutilizador: user.nutilizador}}).then(result => {
                console.log("Removido Requisitante")
            }).catch(error => {
                console.log("Não era Requisitante")
            })

            Reserva.destroy({where: {nutilizador: user.nutilizador}}).then(apagados => {
                console.log("Reservas Removidas")
            }).catch(error => {
                console.log("Reservas Não Removidas")
            })

            Notifiacao.destroy({where: {nutilizador: user.nutilizador}}).then(apagados => {
                console.log("Notificacoes Removidas")
            }).catch(error => {
                console.log("Notificacoes Não Removidas")
            })

            Algoritmos.RemoverTodosEstabelecimentos(user.nutilizador)
            .then((res) => console.log("Estabelecimentos Removidos"))
            .catch((err) => console.log("Estabelecimentos não Removidos"))

            user.destroy().then(result => {
                return res.json({success: true, message: "Utilizador foi Removido"});
            }).catch(error => {
                return res.status(500).json({success: false, message: "Utilizador não foi Removido"});
            })

        }else return res.status(400).json({success: false, message: "Utilizador Nao Encontrado"});
    },

    async updateUtilizador(req, res){

        const { nutilizador } = req.params
        const { nome, cargo, telemovel, email, oldtipo, tipo, adicionar, remover, grau, changed } = req.body

        if(nome == undefined || cargo == undefined || telemovel == undefined || email == undefined)  
            return res.status(400).json({success: false, message: "Campo vazio"});

        const user = await User.update({
            utilizador: nome,
            cargo: cargo,
            telemovel: telemovel,
            email: email,
        }, { where: {nutilizador: nutilizador} })
        
        const data = await User.findByPk(nutilizador)

        if(data && oldtipo != ""){
            console.log("OldTipo: " + oldtipo)
            console.log("Tipo: " + tipo)
            if(oldtipo == "1" || oldtipo == 1){
               await Gestor.destroy({where: {nutilizador: data.nutilizador}}).then(result => {
                    console.log("Removido Gestor")
                }).catch(error => {
                    console.log(error)
                })
            }     
            else if(oldtipo == "2" || oldtipo == 2){
                await Outro.destroy({where: {nutilizador: data.nutilizador}}).then(result => {
                    console.log("Removido Outro")
                }).catch(error => {
                    console.log(error)
                })
            }
            else if(oldtipo == "3" || oldtipo == 3){
                await Requisitante.destroy({where: {nutilizador: data.nutilizador}}).then(result => {
                    console.log("Removido Requisitante")
                }).catch(error => {
                    console.log(error)
                })
            }          
        }

        if(tipo == "1"){
            await GestorController.AssociarGestor(data.nutilizador, grau)
            .then((res) => console.log("Associado Gestor"))
            .catch((err) => console.log("Erro Gestor: ", err))
        }else if(tipo == "2"){
            await OutroController.AssociarOutros(data.nutilizador)
            .then((res) => console.log("Associado Outro"))
            .catch((err) => console.log("Erro Outro: ", err))
        }else if(tipo == "3"){
            await RequisitanteController.AssociarRequisitante(data.nutilizador)
            .then((res) => console.log("Associado Requsisitante"))
            .catch((err) => console.log("Erro Requsisitante: ", err))
        }

        if(adicionar != ""){
            const array = adicionar.split(",");
            for(i=0; i < array.length; i++){
                Algoritmos.AssociarEstabelecimento(data.nutilizador, parseInt(array[i]))
                .then((res) => console.log("Associado Estabelecimento: " + array[i]))
                .catch((err) => console.log("Erro: ", err))
            }
        }

        if(remover != ""){
            const array = remover.split(",");
            for(i=0; i < array.length; i++){
                Algoritmos.RemoverEstabelecimento(data.nutilizador, parseInt(array[i]))
                .then((res) => console.log("Associado Estabelecimento: " + array[i]))
                .catch((err) => console.log("Erro: ", err))
            }
        }

        return res.status(200).json({success: true, message: "Utilizador foi Atualizado"});

    },

    async updateGestor(req, res){

        const { nome, cargo, telemovel, email } = req.body
        const nutilizador = req.decoded.nuser

        if(nutilizador == undefined || nome == undefined || cargo == undefined || telemovel == undefined || email == undefined)  
            return res.status(400).json({success: false, message: "Campo vazio"});

        const user = await User.update({
            utilizador: nome,
            cargo: cargo,
            telemovel: telemovel,
            email: email,
        }, { where: {nutilizador: nutilizador} })

        return res.status(200).json({success: true, message: "Utilizador foi Atualizado"});

    },

    async validateToken(req, res){
        const { token } = req.body
        console.log(token)
        if (token.toString().startsWith('Bearer ')) {
            token = token.slice(7, token.length); //remove a palavra ‘Bearer ’
        }
        if (token) {
            jwt.verify(token, config.jwtSecret, (err, decoded) => {
                if (err) {
                    return res.json({
                        success: false,
                        message: 'O token não é válido.'
                    });
                } else {
                    req.decoded = decoded;
                    return res.json({
                        success: true,
                        message: 'O token é válido.'
                    });
                }
            });
        } else {
            return res.json({
                success: false,
                message: 'Token indisponível.'
            });
        }
    },

    async alterarEstado(req, res){
        const { nutilizador } = req.params

        if(nutilizador == undefined) return res.status(400).json({success: false, message: "Nao foi fornecido um ID"});

        const user = await User.findByPk(nutilizador)

        if(user){
            var estado = 0
            if(user.estado == 0) estado = 1
            User.update({estado: estado}, {where: {nutilizador: nutilizador}}).then(result => {
                /* Utilizador Desativado! */
                if(user.estado == 1 && estado == 0){
                    Reservas.destroy({where: {nutilizador}}).then(apagados => {
                        return res.json({success: true, message: "Utilizador foi Atualizado && Reservas Removidas"});
                    }).catch(error => {
                        return res.json({success: true, message: "Utilizador foi Atualizado && Reservas nao Removidas"});
                    })
                }else return res.json({success: true, message: "Utilizador foi Atualizado"});
                
            }).catch(error => {
                console.log(error)
                return res.json({success: false, message: "Utilizador nao foi Atualizado"});
            })
        }else return res.json({success: false, message: "Utilizador não foi atualizado"});
    },

    async estabelecimentosAssociados(req, res){

        if(req.decoded.nuser == undefined || isNaN(req.decoded.nuser)) return res.status(400).json({success: false, message: "Nao foi fornecido um ID"});

        const nutilizador = req.decoded.nuser

        const user = await Gestor.findByPk(nutilizador)

        if(user){
            if(user.grau == 1){
                Algoritmos.todosEstabelecimentos()
                .then((result) => {                         
                    res.json({success: true, data: result});
                })
                .catch((error) => {
                    res.json({success: false, message: error});
                }) 
            }else{
                Algoritmos.algunsEstabelecimentos(nutilizador)
                .then((result) => {                     
                    res.json({success: true, data: result});
                })
                .catch((error) => {
                    res.json({success: false, message: error});
                }) 
            }
        }else return res.json({success: false, message: "Utilizador não encontrado"});
    },

    async decodeRole(req, res){

        const role = req.decoded.roles

        if(role == undefined)  
            return res.status(400).json({success: false, message: "Campo vazio"});

        return res.status(200).json({success: true, role: role});

    },

    async checkEmail(req, res){
        const emails = await User.findAll({
            attributes: ['email'],
        })
        if(emails) return res.status(200).json({success: true, data: emails});
        return res.status(400).json({success: false});
    },

    async firstLogin(req, res){
        if(req.decoded.nuser == undefined || isNaN(req.decoded.nuser)) return res.status(400).json({success: false, message: "Nao foi fornecido um ID"});
        const nutilizador = req.decoded.nuser

        const user = await User.findByPk(nutilizador)

        if(user){
            if(user.verifypassword) return res.status(200).json({success: true});
            else return res.status(200).json({success: false});
        } 
        return res.status(400).json({success: false});
    },

}