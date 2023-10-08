const Notificacao = require('../models/Notificacao')
const User = require('../models/Utilizador')
const Outro = require('../models/Outro')
const { Op } = require('sequelize')

const Notification = require("../config/firebase.js")
const GenerateToken = require("../middleware/generateTokens")
const moment = require("moment")

GenerateToken.getAccessToken()
    .then((token) => console.log("Token Firebase gerado com sucesso!"))
    .catch((err) => console.log("Error: ", err))

module.exports = {

    async list(req, res) {
        const { nutilizador } = req.params

        const notificacoes = await Notificacao.findAll({
            where: { 
                nutilizador: {
                    [Op.eq]: nutilizador
                },
                datahora: {
                    [Op.gte]: moment(moment(), "YYYY-MM-DD HH:mm:ss").subtract(8, 'hours')
                },
                lido: {
                    [Op.ne]: 1
                }
             },
            order: [
                ['nnotificacao', 'DESC']
            ],
            limit: 10
        })
        
        if(notificacoes) return res.json({sucess: true, data: notificacoes})
        return res.json({sucess: false, data: []})
            
    },

    async store(req, res) {

        const { nutilizador } = req.params
        const { ntipo, titulo, descricao, datahora, permanencia } = req.body

        const user = await User.findByPk(nutilizador)
        if(!user){
            return res.status(400).json({ error: 'User not found' })
        }

        const notificacao = await Notificacao.create({nutilizador, ntipo, titulo, descricao, datahora, permanencia})

        return res.json(notificacao)
    },

    async update(req, res) {

        const { nnotificacao } = req.params
        const notificacao = await Notificacao.findByPk(nnotificacao)
        if(notificacao){
        notificacao.update({
            lido: 1,
        })
          res.status(200).json(true);
        }else res.status(200).json(false);
            
    },

    async one_user(req, res){

        const { nutilizador, tipo, title, message } = req.body

        User.findByPk(nutilizador).then(user => {
  
            const data = {
                tokenId: user.tokenfirebase,
                title: title,
                message: message
            }

            Notification.sendPushToOneUser(data);
            Notificacao.create({
                nutilizador: nutilizador, 
                ntipo: parseInt(tipo), 
                titulo: title, 
                descricao: message, 
                datahora: new Date(), 
                permanencia: 24
            }).then(result => {
                console.log("Notificação adicionada a base de dados.")
            }).catch(error => {
                console.log(error)
            })
            return res.json({success: true})
        }).catch(error => {
            return res.json(false)
        })


    },

    async notificarUtilizador(nutilizador, tipo, title, message){
        return new Promise(function(resolve, reject) {
            User.findByPk(nutilizador).then(user => {
                if(user.tokenfirebase != null){
                    const data = {
                        tokenId: user.tokenfirebase,
                        title: title,
                        message: message
                    }
                    Notification.sendPushToOneUser(data);
                    Notificacao.create({
                        nutilizador: nutilizador, 
                        ntipo: parseInt(tipo), 
                        titulo: title, 
                        descricao: message, 
                        datahora: new Date(), 
                        permanencia: 24
                    }).then(notificacao => {
                        resolve(true);
                    }).catch(error => {
                        reject(false);
                    })
                }else reject(false);
            }).catch(error => {
                console.log(error)
                reject(false);
            })
        });
    },

    async notificarFuncionarios(tipo, title, message){
        return new Promise(function(resolve, reject) {

            Outro.findAll({
                include: [
                    { association: 'utilizadores', attributes: ['nutilizador', 'tokenfirebase'] },
                ],
            }).then(result => {
                result.forEach(item => {
                    if(item.utilizadores.tokenfirebase != null){
                        const data = {
                            tokenId: item.utilizadores.tokenfirebase,
                            title: title,
                            message: message
                        }
                        Notification.sendPushToOneUser(data);
                        Notificacao.create({
                            nutilizador: item.nutilizador, 
                            ntipo: parseInt(tipo), 
                            titulo: title, 
                            descricao: message, 
                            datahora: new Date(), 
                            permanencia: 24
                        }).then(notificacao => {
                            console.log("O funcionario " + item.nutilizador + " foi notificado")
                        }).catch(error => {
                            console.log(error)
                            console.log("O funcionario " + item.nutilizador + " não foi notificado")
                        })
                    }else console.log("O funcionario " + item.nutilizador + " nao tem um token valido")
                })
                resolve(true);
            }).catch(error => {
                console.log(error)
                reject(false);
            })
        })

    },
    
}