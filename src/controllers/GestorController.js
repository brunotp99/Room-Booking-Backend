const Gestor = require('../models/Gestor')
const User = require('../models/Utilizador')

module.exports = {

    async listAll(req, res) {
        const gestor = await Gestor.findAll({
            include: { association: 'utilizadores', attributes: { exclude: ['password']} }
        })
        return res.json(gestor)
    },

    async listDecoded(req, res) {
        
        const nutilizador = req.decoded.nuser
        if(nutilizador == undefined) res.json({success: false})
        
        const gestor = await Gestor.findByPk(nutilizador, {
            include: { association: 'utilizadores', attributes: { exclude: ['password']} }
        })
        if(gestor) return res.json({success: true, data: gestor})
        else res.json({success: false})
    },

    async list(req, res) {
        
        const { nutilizador } = req.params
        
        if(nutilizador == undefined) res.json({success: false})
        
        const gestor = await Gestor.findByPk(nutilizador, {
            include: { association: 'utilizadores', attributes: { exclude: ['password']} }
        })
        if(gestor) return res.json({success: true, data: gestor})
        else res.json({success: false})
    },

    async store(req, res) {
        const { nutilizador } = req.params
        const { grau } = req.body

        const user = await User.findByPk(nutilizador)
        if(!user){
            return res.status(400).json({ error: 'User not found' })
        }

        const gestor = await Gestor.create({nutilizador, grau})

        return res.json(gestor)

    },

    async AssociarGestor(nutilizador, grau){
        return new Promise(function(resolve, reject) {
            Gestor.create({nutilizador, grau}).then(results => {      
              resolve(true);
            }).catch(error => {
              console.log(error)
              reject(false);
            })
          });
    },

    async RemoverGestor(nutilizador){
        return new Promise(function(resolve, reject) {
            Gestor.destroy({where: nutilizador}).then(results => {      
                resolve(true);
            }).catch(error => {
                console.log(error)
                reject(false);
            })
        });
    },
    
}