const Outro = require('../models/Outro')
const User = require('../models/Utilizador')

module.exports = {

    async list(req, res) {
        const { nutilizador } = req.params
        
        const outros = await Outro.findByPk(nutilizador, {
            include: { association: 'utilizadores' }
        })

        return res.json(outros)
    },

    async store(req, res) {
        const { nutilizador } = req.params

        const user = await User.findByPk(nutilizador)
        if(!user){
            return res.status(400).json({ error: 'User not found' })
        }

        const outro = await Outro.create({nutilizador})

        return res.json(outro)

    },

    async AssociarOutros(nutilizador){
        return new Promise(function(resolve, reject) {
            Outro.create({nutilizador}).then(results => {      
            resolve(true);
          }).catch(error => {
            console.log(error)
            reject(false);
          })
        });
      },

    async RemoverOutros(nutilizador){
        return new Promise(function(resolve, reject) {
            Outro.destroy({where: nutilizador}).then(results => {      
                resolve(true);
            }).catch(error => {
                console.log(error)
                reject(false);
            })
        });
    },
    
}