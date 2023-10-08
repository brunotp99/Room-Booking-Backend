const Sala = require('../models/Sala')
const Estabelecimento = require('../models/Estabelecimento')
const Gestor = require('../models/Gestor')
const Reserva = require('../models/Reserva')
const Uteis = require('../middleware/uteis')
const moment = require('moment')
const { Op } = require('sequelize')
const Tablet = require('../models/Tablet')
const { promiseNotificarDesativacao } = require('./ReservaController')
const { promiseNotificarAtivacao } = require('./AlgoritmosController')

module.exports = {

    async list(req, res) {
        const salas = await Sala.findAll()
        return res.json(salas)
    },

    async store(req, res) {
        const { nestabelecimento } = req.params
        const { nutilizador, nestado, sala, lugares, estadosala, descricao, alocacao, intervalolimpeza } = req.body

        const est = await Estabelecimento.findByPk(nestabelecimento)
        if(!est){
            return res.status(400).json({ error: 'Estabelecimento nao encontrado' })
        }

        const gestor = await Gestor.findByPk(nutilizador)
        if(!gestor){
            return res.status(400).json({ error: 'Utilizador nao existe ou não pertence aos gestores' })
        }

        const _sala = await Sala.create({ nestabelecimento, nutilizador, nestado, sala, lugares, estadosala, descricao, alocacao, intervalolimpeza })

        return res.json(_sala)

    },

    async salasEstabelecimento(req, res) {
        const { nestabelecimento } = req.params

        if(nestabelecimento == undefined) return res.json({data: []})

        const salas = await Sala.findAll({
            where: { nestabelecimento },
            include: [
                { association: 'estado'},
            ],
            order: [
                ['nestado', 'ASC']
            ],
        })
        return res.json({data: salas})
    },

    async getSala(req, res) {
        const { nsala } = req.params
        if(nsala == undefined) return res.json({})
        const sala = await Sala.findByPk(nsala)
        return res.json({sala})
    },

    async getSalaById(req, res) {

        const { nsala } = req.params

        if(nsala == undefined) return res.json({success: false, data: {}})

        const sala = await Sala.findByPk(nsala)

        if(sala) return res.json({success: true, data: sala})
        return res.json({success: false, data: {}})
    },

    async getCurrentState(req, res){

        const { nsala } = req.params

        const dataHoje = Uteis.todayDate()

        Reserva.findAll({
            where: {
                nsala: {
                    [Op.eq]: nsala
                },
                datareserva: {
                    [Op.eq]: dataHoje
                },
                horainicio: {
                    [Op.lte]: Uteis.horasAtuais()
                },
                horafim: {
                    [Op.gte]: Uteis.horasAtuais()
                },
                estado: {
                    [Op.eq]: 3
                }
            }
        }).then(result => {
            const array = result.map(reserva => reserva.nreserva)
            if(array.length > 0) return res.json(true)
            else return res.json(false)
        })

    },

    async proximaReserva(req, res){

        const { nsala } = req.params
        const dataHoje = Uteis.todayDate()

        Reserva.findAll({
            where: {
                nsala: {
                    [Op.eq]: nsala
                },
                datareserva: {
                    [Op.eq]: dataHoje
                },
            },
        }).then(result => {
            const inicio = result.map(hora => hora.horainicio)
            const fim = result.map(hora => hora.horafim)

            function timeToSecs(time) {
                let [h, m, s] = time.split(':');
                return h*3.6e3 + m*60 + s*1;
              }

              const OGArray = [];
              for (index = 0; index < inicio.length; index++) {
                OGArray.push({time:inicio[index] + ":00", end:fim[index]});
              }
              
              var timeArray = []
              timeArray.push('19:00:00')
              var next = ""
              
              timeArray.forEach(time => {
                let secs = timeToSecs(time);
                let closest = null;
                // Find closest element in OGArray
                OGArray.reduce((acc, obj, i) => {
                  let diff = Math.abs(timeToSecs(obj.time) - secs);
                  if (diff < acc) {
                    acc = diff;
                    closest = obj;
                  }
                  return acc;
                }, Number.POSITIVE_INFINITY);

                if(closest != null)
                    next = closest.time
              });

            var atualHM = Uteis.horasAtuais()

            Sala.findByPk(nsala).then(sala => {

                let aberturaLocal = moment("09:00", "HH:mm").format("HH:mm")
                let fechoLocal = moment("20:00", "HH:mm").subtract(sala.intervalolimpeza, 'm').format("HH:mm")

                if(atualHM < aberturaLocal || atualHM > fechoLocal) 
                    return res.json({"status": false})
                else if(next != ""){

                    var startTime = moment(Uteis.horasAtuais(), "HH:mm").format("HH:mm")
                    var endTime = moment(next, "HH:mm").format("HH:mm")

                    var minutes = moment.utc(moment(endTime, "HH:mm:ss").diff(moment(startTime, "HH:mm:ss"))).format("mm")

                    console.log(minutes)

                    if(minutes > 120) minutes = 120
                    else if(minutes < 10) return res.json({"status": false})
                    res.json({"status": true, limit: minutes})

                }else res.json({"status": true, limit: 120})

            }).catch(error => {
                console.log(error)
            })
            
        })
    },
    
    async updateSala(req, res){

        const { nsala, sala, lugares, alocacao, intervalo, estado, descricao, mensagem } = req.body

        if(sala != ""){
            Sala.findByPk(nsala).then(result => {
                result.update({ sala: sala })
            }).catch(error => {
                return res.json(error)
            })
        }
        
        if(lugares != 99){
            Sala.findByPk(nsala).then(result => {
                result.update({ lugares: lugares })
            })
        }

        if(alocacao != 101){
            Sala.findByPk(nsala).then(result => {
                result.update({ alocacao: alocacao })
            })
        }

        if(intervalo != 101){
            Sala.findByPk(nsala).then(result => {
                result.update({ intervalolimpeza: intervalo })
            })
        }

        if(estado != 99){
            Sala.findByPk(nsala).then(result => {
                result.update({ estadosala: estado })
            })
        }

        if(descricao != ""){
            Sala.findByPk(nsala).then(result => {
                result.update({ descricao: descricao })
            })
        }

        if(mensagem != ""){
            Sala.findByPk(nsala).then(result => {
                result.update({ mensagem: mensagem })
            })
        }

        res.json(true)

    },

    async updateEstado(req, res){

        const { nsala, nreserva, nestado } = req.body

        if(nsala != "" && nestado != ""){
            Sala.findByPk(nsala).then(result => {
                result.update({ nestado: nestado })
                if(nreserva != ""){
                    Reserva.findByPk(nreserva).then(result => {
                        if(result.horafim > Uteis.horasAtuais())
                        result.update({ horafim: Uteis.horasAtuais() })
                        return res.json(true)
                    }).catch(error => {
                        return res.json(error)
                    })
                }
            }).catch(error => {
                console.log(error)
            })
        }

    },

    async getSalas(req, res){

        const { nestabelecimento } = req.params
        
        if(nestabelecimento == undefined || isNaN(nestabelecimento)) return res.json({"success": true, "data": 0 })

        const count = await Sala.count({
          where: {
            nestabelecimento: {
              [Op.eq]: nestabelecimento
            }
          },
        })
    
        res.json({"success": true, data: count})
    
      },

      async createSala(req, res){

        const { nestabelecimento, nestado, sala, lugares, estadosala, descricao, alocacao, intervalolimpeza } = req.body
        const nutilizador = req.decoded.nuser

        if(nestabelecimento == undefined || nutilizador == undefined || nestado == undefined || sala == undefined || lugares == undefined || estadosala == undefined || alocacao == undefined || intervalolimpeza == undefined)
            return res.status(400).json({success: false, message: "Campos vazios"});

        var desc = ""
        if(descricao != undefined)
            desc = descricao

        Sala.create({
            nestabelecimento,
            nutilizador,
            nestado,
            sala,
            lugares,
            estadosala,
            descricao: desc,
            alocacao,
            intervalolimpeza
        }).then(ok => {
            return res.status(200).json({success: true, message: "Sala adicionada com sucesso!", nsala: ok.nsala});  
        }).catch(error => {
            console.log(error)
            return res.status(400).json({success: false, message: "Não foi póssivel adicionar a sala", error: error});  
        })

      },

      async editarSala(req, res){

        const { nsala } = req.params
        const { sala, lugares, descricao, alocacao, intervalolimpeza } = req.body

        console.log(sala, lugares, descricao, alocacao, intervalolimpeza)

        if(sala == undefined || lugares == undefined || alocacao == undefined || intervalolimpeza == undefined)
            return res.status(400).json({success: false, message: "Campos vazios"});

        var desc = ""
        if(descricao != undefined)
            desc = descricao

        Sala.update({
            sala,
            lugares: parseInt(lugares),
            descricao: desc,
            alocacao: parseInt(alocacao),
            intervalolimpeza: parseInt(intervalolimpeza)
        }, {
            where: {nsala: nsala}
        }).then(ok => {
            return res.status(200).json({success: true, message: "Sala atualizada com sucesso!"});  
        }).catch(error => {
            console.log(error)
            return res.status(400).json({success: false, message: "Não foi póssivel atualizar a sala", error: error});  
        })

      },

      async atualizarEstado(req, res){

        const { nsala } = req.params
        const { option, message } = req.body

        console.log(nsala, option, message)

        if(nsala == undefined)
            return res.status(400).json({success: false, message: "Campos vazios"});

        const sala = await Sala.findByPk(nsala, {
            include: [
                { association: 'estabelecimento', attributes: ['estado']},
            ]
        })

        if(sala){

            if(sala.estabelecimento.estado == 1){

                var estado = 0
                var atual = 6
                if(sala.estadosala == 0){
                    estado = 1
                    atual = 1
                }

                Sala.update({ estadosala: estado, nestado: atual, mensagem: message }, {where: {nsala: nsala}}).then(ok => {
                    if(estado){
                        promiseNotificarAtivacao(nsala, 2, "Sala Reativada", "A " + sala.sala + " foi reativada, pode novamente criar reservas na mesma!")
                        .then((result) => {
                            console.log("Sala ativada, utilizadores notificados")
                            return res.status(200).json({success: true, message: "Sala ativada, utilizadores notificados!"}); 
                        })
                        .catch((err) => {
                            console.log("Erro ao enviar notificacao: ", err)
                            return res.status(200).json({success: true, message: "Sala desativada, utilizador nao notificado!"}); 
                        })
                    }else{
                        promiseNotificarDesativacao(nsala, 2, "Sala Desativada", "A " + sala.sala + " foi desativada. " + message)
                        .then((result) => {
                            console.log("Sala desativada, utilizadores notificados")
                            if(option === "delete"){
                                Reserva.destroy({where: {nsala: nsala}}).then(result => {
                                    return res.status(200).json({success: true, message: "Sala desativada com sucesso && Reservas removidas!"});  
                                }).catch(error => {
                                    console.log(error)
                                    return res.status(200).json({success: true, message: "Sala desativada com sucesso && Reservas não removidas!"});  
                                })
                            }else return res.status(200).json({success: true, message: "Sala desativada com sucesso && Reservas não removidas!"}); 
                        })
                        .catch((err) => {
                            console.log("Erro ao enviar notificacao: ", err)
                            return res.status(200).json({success: true, message: "Sala desativada, utilizador nao notificado!"}); 
                        })
                    }
                }).catch(error => {
                    console.log(error)
                })

            }else return res.status(400).json({success: false, message: "Sala não foi desativada!"}); 

        }else return res.status(400).json({success: false, message: "Sala não foi desativada!"}); 

    },

    async apagarSala(req, res){
        const { nsala } = req.params

        if(nsala == undefined)
            return res.status(400).json({success: false, message: "Campos vazios"});

        const sala = await Sala.findByPk(parseInt(nsala))

        if(sala){

            promiseNotificarDesativacao(sala.nsala, 2, "Sala Apagada", "A " + sala.sala + " foi apagada, todas as suas reservas foram removidas!")
                .then((result) => {
                    console.log("Sala apagada, utilizadores notificados")
                    Reserva.destroy({where: {nsala: nsala}}).then(result => {

                        Tablet.destroy({where: {nsala: nsala}}).then(ok => {
                            console.log("Tablets removidos")
                        }).catch(error => {
                            console.log("Tablets nao removidos")
                        })
                        
                        Sala.destroy({where: {nsala: nsala}}).then(result => {
                            return res.status(200).json({success: true, message: "Reservas foram apagadas && Sala apagada!"}); 
                        }).catch(error => {
                            console.log(error)
                            return res.status(200).json({success: true, message: "Reservas foram apagadas && Sala nao apagada!", error: error}); 
                        })
            
                    }).catch(error => {
                        console.log(error)
                        return res.status(400).json({success: false, message: "Reservas não foram apagadas!"}); 
                    })
                })
                .catch((err) => {
                    console.log("Erro ao enviar notificacao: ", err)
                    Reserva.destroy({where: {nsala: nsala}}).then(result => {

                        Tablet.destroy({where: {nsala: nsala}}).then(ok => {
                            console.log("Tablets removidos")
                        }).catch(error => {
                            console.log("Tablets nao removidos")
                        })
                        
                        Sala.destroy({where: {nsala: nsala}}).then(result => {
                            return res.status(200).json({success: true, message: "Reservas foram apagadas && Sala apagada!"}); 
                        }).catch(error => {
                            console.log(error)
                            return res.status(200).json({success: true, message: "Reservas foram apagadas && Sala nao apagada!", error: error}); 
                        })
            
                    }).catch(error => {
                        console.log(error)
                        return res.status(400).json({success: false, message: "Reservas não foram apagadas!"}); 
                    })
                })

        }else return res.status(400).json({success: false, message: "A sala não foi encontrada"}); 

        

    }

}