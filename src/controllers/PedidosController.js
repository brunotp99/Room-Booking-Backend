const { todayDate } = require('../middleware/uteis')
const Pedido = require('../models/Pedido')
const Sala = require('../models/Sala')
const { Op } = require('sequelize')
const { notificarFuncionarios } = require('./NotificacaoController')

module.exports = {

    async list(req, res) {
        
        const { nestabelecimento } = req.params

        if(nestabelecimento == undefined)
            return res.json({"success": false, "message": "Campos vazios"})

        const pedidos = await Pedido.findAll({
            include: [
                { association: 'utilizador', attributes: ['nutilizador', 'utilizador'] },
                { association: 'sala', attributes: ['nestabelecimento', 'sala'], where: {nestabelecimento} },
            ],
        })
        return res.json({data: pedidos})
    },

    async listType(req, res) {
        
        const { nestabelecimento } = req.params
        const { tipo } = req.body

        console.log(tipo)
        console.log(tipo)
        console.log(tipo)
        console.log(tipo)

        if(nestabelecimento == undefined || tipo == undefined)
            return res.json({"success": false, "message": "Campos vazios"})

        if(tipo == 'aguarda'){
            Pedido.findAll({
                where: {
                    data: {
                        [Op.eq]: todayDate()
                    },
                    terminado: {
                        [Op.eq]: 'aguarda'
                    }
                },
                include: [
                    { association: 'utilizador', attributes: ['nutilizador', 'utilizador'] },
                    { association: 'sala', attributes: ['nestabelecimento', 'sala'], where: {nestabelecimento} },
                ],
            }).then(result => {
                return res.json({data: result})
            }).catch(error => {
                return res.json({data: []})
            })
        }else if(tipo == 'atraso'){
            Pedido.findAll({
                where: {
                    terminado: {
                        [Op.eq]: 'atraso'
                    }
                },
                include: [
                    { association: 'utilizador', attributes: ['nutilizador', 'utilizador'] },
                    { association: 'sala', attributes: ['nestabelecimento', 'sala'], where: {nestabelecimento} },
                ],
                order: [['npedido', 'DESC'], ['horainicio']],
                limit: 10
            }).then(result => {
                return res.json({data: result})
            }).catch(error => {
                return res.json({data: []})
            })
        }else if(tipo == 'concluidos'){
            Pedido.findAll({
                where: {
                    terminado: {
                        [Op.in]: ['limpo', 'desinfetado', 'concluido']
                    }
                },
                include: [
                    { association: 'utilizador', attributes: ['nutilizador', 'utilizador'] },
                    { association: 'sala', attributes: ['nestabelecimento', 'sala'], where: {nestabelecimento} },
                ],
                order: [['npedido', 'DESC'], ['horainicio']],
                limit: 10
            }).then(result => {
                return res.json({data: result})
            }).catch(error => {
                return res.json({data: []})
            })
        }else return res.json({data: []})
        
    },

    async get(req, res) {
        
        const { npedido } = req.params

        if(npedido == undefined)
            return res.json({"success": false, "message": "Campos vazios"})

        const pedidos = await Pedido.findByPk(npedido, {
            include: [
                { association: 'utilizador', attributes: ['nutilizador', 'utilizador'] },
                { association: 'sala', attributes: ['nestabelecimento', 'sala'] },
            ],
        })
        return res.json({data: pedidos})
    },

    async necessidadeAtual(req, res) {
        
        const { nestabelecimento } = req.params

        if(nestabelecimento == undefined)
            return res.json({"success": false, "message": "Campos vazios"})

        const pedidos = await Pedido.findAll({
            where: {
                terminado: {
                    [Op.eq]: 'aguarda'
                },
                data: {
                    [Op.eq]: todayDate()
                }
            },
            include: [
                { association: 'utilizador', attributes: ['nutilizador', 'utilizador'] },
                { association: 'sala', attributes: ['nestabelecimento', 'sala'], where: {nestabelecimento} },
            ],
        })
        return res.json({data: pedidos})

    },

    async novoPedido(req, res) {

        const { nsala, tipo, descricao, data, horainicio, horafim } = req.body

        if(nsala == undefined || tipo == undefined || data == undefined || horainicio == undefined || horafim == undefined)
            return res.json({"success": false, "message": "Campos vazios"})

        const sala = await Sala.findByPk(nsala)

        if(sala){
            Pedido.create({
                nsala,
                tipo,
                descricao,
                data,
                horainicio,
                horafim
            }).then(result => {
                notificarFuncionarios(1, "Pedido de Serviço", "Foi adicionado um novo pedido de " + tipo + " para as " + horainicio + " até " + horafim)
                    .then((res) => console.log("Notificações enviadas com sucesso!"))
                    .catch((err) => console.log("Erro ao enviar notificacao: ", err))
                return res.json({"success": true, "message": "Pedido adicionado com sucesso"})
            }).catch(error => {
                return res.json({"success": false, "message": "Não foi póssivel adicionar o pedido", "error": error})
            })
        }else return res.json({"success": false, "message": "Não foi póssivel adicionar o pedido, a sala nao existe"})

    },

    async terminarPedido(req, res){
        
        const { npedido, nutilizador, terminado } = req.body

        if(npedido == undefined || nutilizador == undefined || terminado == undefined)
            return res.json({"success": false, "message": "Campos vazios"})

        const user = parseInt(nutilizador)
        const pedido = parseInt(npedido)

        Pedido.update({nutilizador: user, terminado}, {where: {npedido: pedido}}).then(result => {
            return res.json({"success": true, "message": "Pedido atualizado com sucesso"})
        }).catch(error => {
            console.log(error)
            return res.json({"success": false, "message": "Não foi póssivel atualizar o pedido"})
        })
        
    },

    async promisePedido(nsala, tipo, descricao, data, horainicio, horafim){
        return new Promise(function(resolve, reject) {
            Pedido.create({
                nsala,
                tipo,
                descricao,
                data,
                horainicio,
                horafim
            }).then(result => {
                notificarFuncionarios(1, "Pedido de Serviço", "Foi adicionado um novo pedido de " + tipo + " para as " + horainicio + " até " + horafim)
                .then((res) => console.log("Notificações enviadas com sucesso!"))
                .catch((err) => console.log("Erro ao enviar notificacao: ", err))
                resolve(true)
            }).catch(error => {
                reject(false)
            })
        });
    },

    async removerPedido(req, res){

        const { npedido } = req.params

        const pedido = await Pedido.findByPk(npedido)

        if(pedido){
            pedido.destroy()
            return res.json({"success": true, "message": "O pedido foi removido com sucesso"})
        }else return res.json({"success": false, "message": "O pedido não foi removido com sucesso"})

    },

    async alterarPedido(req, res){

        const { npedido } = req.params
        const { nsala, tipo, descricao, data, horainicio, horafim, terminado } = req.body

        if(npedido == undefined || nsala == undefined || tipo == undefined || data == undefined || horainicio == undefined || horafim == undefined || descricao == undefined || terminado == undefined)
            return res.json({"success": false, "message": "Campos vazios"})

        Pedido.update({
            nsala,
            tipo,
            descricao,
            data,
            horainicio,
            horafim,
            terminado
        }, {where: {npedido}}).then(result => {
            return res.json({"success": true, "message": "Pedido atualizado com sucesso"})
        }).catch(error => {
            return res.json({"success": false, "message": "Não foi póssivel atualizar o pedido"})
        })

    }

}