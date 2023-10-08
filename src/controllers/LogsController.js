const Log = require('../models/Log')

module.exports = {

    async list(req, res) {
        const logs = await Log.findAll({
            attributes: ['nlog', 'tipo', 'acao', 'descricao', 'datahora'],
            where: {
                lido: 0
            },
            include: [
                { association: 'utilizador', attributes: ['nutilizador', 'utilizador'] },
            ],
            order: [['nlog', 'DESC']]
        })
        return res.json({data: logs})
    },

    async store(req, res) {

        const { nutilizador, tipo, acao, descricao } = req.body

        if(nutilizador == undefined || tipo == undefined || acao == undefined)
            return res.json({"success": false, "message": "Campos vazios"})

        var desc = ""
        if(descricao != undefined) desc = descricao

        const log = await Log.create({ nutilizador, tipo, acao, descricao: desc, datahora: new Date() })

        return res.json({"success": true, "message": log})
    }
    
}