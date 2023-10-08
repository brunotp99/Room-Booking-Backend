const Estado = require('../models/Estado')

module.exports = {

    async list(req, res) {
        const estados = await Estado.findAll()
        return res.json(estados)
    },

    async store(req, res) {

        const { estado } = req.body

        const _estado = await Estado.create({ estado })

        return res.json(_estado)
    }
    
}