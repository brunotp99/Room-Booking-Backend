const Tipo = require('../models/TipoNotificacao')

module.exports = {

    async list(req, res) {
        const tiponotificacao = await Tipo.findAll()
        return res.json(tiponotificacao)
    },

    async store(req, res) {

        const { tipo } = req.body

        const tiponotificacao = await Tipo.create({ tipo })

        return res.json(tiponotificacao)
    }
    
}