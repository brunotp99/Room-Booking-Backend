const Requisitante = require('../models/Requisitante')
const User = require('../models/Utilizador')

module.exports = {

    async list(req, res) {
        const { nutilizador } = req.params
        
        const requisitantes = await Requisitante.findByPk(nutilizador, {
            include: { association: 'utilizadores' }
        })

        return res.json(requisitantes)
    },

    async store(req, res) {
        const { nutilizador } = req.params

        const user = await User.findByPk(nutilizador)
        if(!user){
            return res.status(400).json({ error: 'User not found' })
        }

        const requisitante = await Requisitante.create({nutilizador})

        return res.json(requisitante)

    },

    async AssociarRequisitante(nutilizador){
        return new Promise(function(resolve, reject) {
        Requisitante.create({nutilizador}).then(results => {      
            resolve(true);
          }).catch(error => {
            console.log(error)
            reject(false);
          })
        });
      },

    async RemoverRequisitante(nutilizador){
        return new Promise(function(resolve, reject) {
            Requisitante.destroy({where: nutilizador}).then(results => {      
                resolve(true);
            }).catch(error => {
                console.log(error)
                reject(false);
            })
        });
    },
    
}