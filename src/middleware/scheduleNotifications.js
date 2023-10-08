const cron = require('node-cron')
const Notificacao = require('../models/Notificacao')
const Notification = require("../config/firebase.js")
const Reserva = require('../models/Reserva')
const User = require('../models/Utilizador')
const Uteis = require('../middleware/uteis')
const { Op } = require('sequelize')

module.exports = { notificarReservas }

function notificarReservas() {
    /* Verificar existencia de reservas a cada 5 minutos */
    cron.schedule("* * * * *", function() {
        console.log("Vou verificar se existem reservas agendadas e notificar usuarios...");
        Reserva.findAll({
            where: { 
                datareserva: {
                    [Op.eq]: Uteis.todayDate()
                },
                horainicio: {
                    [Op.lte]: Uteis.addAtuais(1)
                },
                estado: {
                    [Op.ne]: 0
                },
                notificado: {
                    [Op.eq]: 0
                }
             },
             include: [
                { association: 'sala', attributes: ['sala']},
             ]
        }).then(notify => {
            const nreserva = notify.map(reserva => reserva.nreserva)
            const nutilizador = notify.map(reserva => reserva.nutilizador)
            const sala = notify.map(reserva => reserva.sala.sala)
            const horainicio = notify.map(reserva => reserva.horainicio)

            if(nreserva.length === 0) console.log("Nenhum utilizador a notificar, push concluido...")

            for(i = 0; i < nreserva.length; i++){
                console.log(nreserva[i])
                let title = "Reserva Agendada"
                let message = "Tem uma reserva agendada para hoje as " + horainicio[i] + " na " + sala[i]
                Reserva.findByPk(nreserva[i]).then(reserva => {
                    reserva.update({notificado: 1})
                    User.findByPk(nutilizador[i]).then(user => {
                        console.log("A enviar uma notificação ao utilizador " + nutilizador[i])
                        if(user.tokenfirebase != null){
                            const data = {
                                tokenId: user.tokenfirebase,
                                title: title,
                                message: message
                            }
                            Notification.sendPushToOneUser(data);
                            Notificacao.create({
                                nutilizador: nutilizador, 
                                ntipo: 1, 
                                titulo: title, 
                                descricao: message, 
                                datahora: new Date(), 
                                permanencia: 24                    
                            }).then(result => {
                                console.log("Notificação adicionada a base de dados.")
                            }).catch(error => {
                                console.log(error)
                            })
                        }
                    }).catch(error => {
                        console.log(error)
                    })
                }).catch(error => {
                    console.log(error)
                })
            }
        }).catch(error => {
            console.log(error)
        })
    });

}