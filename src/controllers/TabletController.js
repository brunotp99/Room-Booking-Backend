const Tablet = require('../models/Tablet')
const Sala = require('../models/Sala')

module.exports = {

    async list(req, res) {
        const tablets = await Tablet.findAll()
        return res.json(tablets)
    },

    async get(req, res) {

        const { ntablet } = req.params

        if(ntablet == undefined)
            return res.status(400).json({success: false, message: "Campos vazios"});

        const tablet = await Tablet.findByPk(ntablet)

        if(tablet) return res.status(200).json({success: true, data: tablet})
        return res.status(400).json({success: false, message: "Tablet nao encontrado"});
    },

    async listEstabelecimento(req, res) {

        const { nestabelecimento } = req.params

        if(nestabelecimento == undefined)
            return res.status(400).json({success: false, message: "Campos vazios"});

        const tablets = await Tablet.findAll({
            include: [{ association: 'salas', attributes: ['nestabelecimento', 'sala'], where: {nestabelecimento: nestabelecimento}},]
        })

        return res.status(200).json({data: tablets})
    },

    async store(req, res) {

        const { nsala } = req.params
        const { marca, modelo, pin } = req.body

        const sala = await Sala.findByPk(nsala)
        if(!sala){
            return res.status(400).json(0)
        }

        const tablet = await Tablet.create({ nsala, marca, modelo, pin: parseInt(pin) })

        if(tablet) return res.json(tablet.ntablet)
        else return res.json(0)

    },

    async updateDispositivo(req, res){
        
        const { ntablet, marca, modelo, nsala, pin } = req.body

        if(nsala != 0){
            Tablet.update({
                nsala,
                marca,
                modelo,
                pin
            }, {where: {ntablet: parseInt(ntablet)}}).then(result => {
                return res.send(true)
            }).catch(error => {
                return res.send(false)
            })
        }else{
            Tablet.update({
                marca,
                modelo,
                pin
            }, {where: {ntablet: parseInt(ntablet)}}).then(result => {
                return res.send(true)
            }).catch(error => {
                return res.send(false)
            })
        }

    },

    async apagarTablet(req, res){
        const { ntablet } = req.params

        if(ntablet == undefined)
            return res.status(400).json({success: false, message: "Campos vazios"});

        Tablet.destroy({where: {ntablet: ntablet}}).then(ok => {
            return res.status(200).json({success: true, message: "Tablet removido"});
        }).catch(error => {
            console.log(error)
            return res.status(400).json({success: false, message: "Tablet não removido"});
        })
    },

    async atualizarTablet(req, res){

        const { ntablet } = req.params
        const { nsala, marca, modelo, codigo } = req.body

        console.log(codigo)
        console.log(codigo)
        console.log(codigo)
        console.log(codigo)
        console.log(codigo)

        if(ntablet == undefined || nsala == undefined || marca == undefined || modelo == undefined)
            return res.status(400).json({success: false, message: "Campos vazios"});

        Tablet.update({nsala, marca, modelo, pin: codigo}, {where: {ntablet}}).then(ok => {
            return res.status(200).json({success: true, message: "Tablet Atualizado"});
        }).catch(error => {
            console.log(error)
            return res.status(400).json({success: false, message: "Tablet não Atualizado"});
        })

    },

    async validatePin(req, res){

        const { ntablet } = req.params
        const { pin } = req.body

        const tablet = await Tablet.findByPk(ntablet)

        if(tablet){
            if(parseInt(pin) === tablet.pin) return res.json({success: true, message: "Pin Validadado"});
            else return res.json({success: false, message: "Pin Invalido"});
        }

        return res.json({success: false, message: "Pin Invalido"});

    },

    async tabletExists(req, res){

        const { ntablet } = req.params

        const tablet = await Tablet.findByPk(ntablet)

        if(tablet){
            return res.json({success: true, message: "Tablet existe"});
        }

        return res.json({success: false, message: "Tablet não existe"});

    }

    
}