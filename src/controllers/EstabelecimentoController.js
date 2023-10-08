const Estabelecimento = require('../models/Estabelecimento')
const Utilizador = require('../models/Utilizador')
const Algoritmos = require('../controllers/AlgoritmosController')
const User = require('../models/Utilizador')
const Sala = require('../models/Sala')
const Tablet = require('../models/Tablet')

module.exports = {

    async list(req, res) {
        const est = await Estabelecimento.findAll()
        return res.json({"data" : est})
    },

    async listDisponiveis(req, res) {
        const est = await Estabelecimento.findAll({
            where: {
                estado:  1
            }
        })
        return res.json({"data" : est})
    },

    async get(req, res) {
        const { nestabelecimento } = req.params
        if(nestabelecimento == undefined)
            return res.status(400).json({success: false, message: "Campos vazios"});

        const est = await Estabelecimento.findByPk(nestabelecimento)
        return res.json({"data" : est})
    },

    async store(req, res) {

        const { estabelecimento, localidade } = req.body

        var estado = 1
        if(estabelecimento == undefined || localidade == undefined)
            return res.status(400).json({success: false, message: "Campos vazios"});

        const est = await Estabelecimento.create({ estabelecimento, estado, localidade })

        res.status(200).json({success: true, message: "Estabelecimento criado!"});
    }, 

    async associate(req, res) {
        const { nutilizador } = req.params;
        const { estabelecimento, estado, localidade } = req.body

        const user = await User.findByPk(nutilizador)
        if(!user){
            return res.status(400).json({ error: 'User not found' })
        }

        const [_estabelecimento] = await Estabelecimento.findOrCreate({
            where: {  estabelecimento, estado, localidade }
        })

        await user.addEstabelecimento(_estabelecimento)
        return res.json(_estabelecimento)

    },

    async checkEstabelecimento(req, res){

        Utilizador.findAll({
            where: {
                nutilizador: 2
            },
            include: { association: 'locais', attributes: ['nestabelecimento']},
        }).then(results => {
            const obj = Object.values(results).map(value => value.estabelecimentos)
            console.log(obj)
            for(i = 0; i < obj.length; i++){
               // console.log(obj[0][i].nestabelecimento)
            } 
            res.json(obj)      
        })
    },

    async atualizarEstabelecimento(req, res){

        const { nestabelecimento } = req.params
        const { estabelecimento, localidade } = req.body

        if(nestabelecimento == undefined || estabelecimento == undefined || localidade == undefined)
            return res.status(400).json({success: false, message: "Campos vazios"});

        Estabelecimento.update({
            estabelecimento,
            localidade
        }, {
            where: {nestabelecimento: nestabelecimento}
        }).then(ok => {
            return res.status(200).json({success: true, message: "Estabelecimento atualizado com sucesso!"});  
        }).catch(error => {
            console.log(error)
            return res.status(400).json({success: false, message: "Não foi póssivel atualizar o Estabelecimento", error: error});  
        })

    },

    async atualizarEstado(req, res){

        const { nestabelecimento } = req.params
        const { option } = req.body

        if(nestabelecimento == undefined)
            return res.status(400).json({success: false, message: "Campos vazios"});

        const estabelecimento = await Estabelecimento.findByPk(nestabelecimento)

        if(estabelecimento){

            var estado = 0
            if(estabelecimento.estado == 0) estado = 1

            if(estado == 0){

                Estabelecimento.update({estado: 0}, {where: {nestabelecimento: nestabelecimento}}).then(ok => {

                    Sala.update({estadosala: 0, nestado: 6}, {where: {nestabelecimento: nestabelecimento}}).then(ok => {
                        console.log("Salas Desativadas")
                    }).catch(error => {
                        console.log(error)
                    })        
    
                    if(option == "delete"){
                        Algoritmos.RemoverTodasReservas(nestabelecimento)
                            .then((res) => console.log("Reservas Removidas"))
                            .catch((err) => console.log("Reservas não Removidas"))
                    }
                }).catch(error => {
                    return res.status(200).json({success: true, message: "Estabelecimento não foi atualizado!"});  
                })

            }else{

                Estabelecimento.update({estado: 1}, {where: {nestabelecimento: nestabelecimento}}).then(ok => {
                    Sala.update({estadosala: 1, nestado: 1}, {where: {nestabelecimento: nestabelecimento}}).then(ok => {
                        console.log("Sala Ativada")
                    }).catch(error => {
                        console.log(error)
                    })  
                }).catch(error => {
                    return res.status(400).json({success: false, message: "Estabelecimento não foi atualizado!"});  
                })

            }

            return res.status(200).json({success: true, message: "Estabelecimento atualizado com sucesso!"});  

        }else return res.status(400).json({success: false, message: "Estabelecimento não foi atualizado!"}); 

    },

    async apagarEstabelecimento(req, res){

        const { nestabelecimento } = req.params

        if(nestabelecimento == undefined)
            return res.status(400).json({success: false, message: "Campos vazios"});

        const estabelecimento = await Estabelecimento.findByPk(nestabelecimento)

        if(estabelecimento){

            Algoritmos.RemoverTodasReservas(nestabelecimento)
                .then((res) => console.log("Reservas Removidas"))
                .catch((err) => console.log("Reservas não Removidas"))

            Tablet.findAll({
                include: [{ association: 'salas', attributes: ['nestabelecimento'], where: {nestabelecimento: nestabelecimento}},]
            }).then(tablets => {
                tablets.destroy().then(ok => {
                    console.log("Tablets removidos")
                }).catch(error => {
                    console.log(error)
                })
            }).catch(error => {
                console.log("Não foi possivel remover tablets")
                console.log(error)
            })

            Algoritmos.RemoverTodosUsers(nestabelecimento)
            .then((res) => console.log("Utilizadores Associados Removidos"))
            .catch((err) => console.log("Utilizadores Associados não Removidos"))

            Sala.destroy({where: {nestabelecimento: nestabelecimento}}).then(ok => {
                console.log("Salas Removidas")
            }).catch(error => {
                console.log(error)
            })

            Estabelecimento.destroy({where: {nestabelecimento: nestabelecimento}}).then(ok => {
                console.log("Estabelecimento Removido")
            }).catch(error => {
                console.log(error)
            })

            return res.status(200).json({success: true, message: "Estabelecimento atualizado com sucesso!"});  

        }else return res.status(400).json({success: false, message: "Estabelecimento não foi atualizado!"}); 

    }
    
}