const Reserva = require('../models/Reserva')
const Sala = require('../models/Sala')
const User = require('../models/Utilizador')
const Notificacao = require('../models/Notificacao')
const { Op } = require('sequelize')
const sequelize = require('sequelize')
const Utilizador = require('../models/Utilizador')
const Uteis = require('../middleware/uteis')
const Moment = require('moment');
const MomentRange = require('moment-range');
const { notificarUtilizador } = require('./NotificacaoController')
const Notification = require("../config/firebase.js")
const { promisePedido } = require('./PedidosController')


module.exports = {

    async list(req, res) {
        const reservas = await Reserva.findAll()
        return res.json(reservas)
    },

    async getByPk(req, res) {
      const { nreserva } = req.params
      if(nreserva == null || nreserva == "" | nreserva == undefined)
        return res.send(false)

      Reserva.findByPk(nreserva, {
        estado: {
          [Op.notIn]: [0,2]
        },
        include: [
          { association: 'utilizadores', attributes: ['utilizador', 'cargo', 'imagem', ['estado', 'estadouser']]},
          { association: 'sala', attributes: [['sala', 'nomesala'], 'descricao', 'lugares', 'alocacao']},
        ]
      }).then(function(reserva) {
        return res.json(reserva)
      }).catch(function(err){
        return res.send(false)
      });
      
    },

    async addFromParams(req, res) {
        const { nsala, nutilizador, datareserva, horainicio, horafim } = req.body
        let estado = 1
        console.log(nsala + " " + nutilizador + " " +  datareserva + " " +  horainicio + " " +  horafim )
        if(nsala == undefined || nutilizador  == undefined || datareserva == undefined || horainicio == undefined || horafim == undefined )
            return res.status(400).send(false)
        
        const user = await Utilizador.findByPk(nutilizador)
        if(!user) return res.status(400).send(false)

        Sala.findByPk(nsala).then(sala => {
          var minutes = sala.intervalolimpeza
          var fimreserva = Uteis.removeMinutes(horafim, minutes)
          var hInicio = String(horainicio).padStart(5, '0')
          var hFim = String(horafim).padStart(5, '0')

          if(hInicio >= fimreserva) return res.send(false)

          Reserva.create({
            nsala,
            nutilizador,
            datareserva,
            horainicio: hInicio,
            horafim: hFim,
            fimreserva,
            estado
          }).then(result => {
            return res.send(true)
          }).catch(error => {
            return res.send(false)
          })

        })       
    },

    async addReserva(req, res) {
      const { nsala, datareserva, horainicio, horafim } = req.body
      const nutilizador = req.decoded.nuser
      let estado = 1
      console.log(nsala + " " + nutilizador + " " +  datareserva + " " +  horainicio + " " +  horafim )
      if(nsala == undefined || nutilizador  == undefined || datareserva == undefined || horainicio == undefined || horafim == undefined )
          return res.status(400).send(false)
      
      const user = await Utilizador.findByPk(nutilizador)
      if(!user) return res.status(400).send(false)

      Sala.findByPk(nsala).then(sala => {
        var minutes = sala.intervalolimpeza
        var fimreserva = Uteis.removeMinutes(horafim, minutes)
        var hInicio = String(horainicio).padStart(5, '0')
        var hFim = String(horafim).padStart(5, '0')

        if(hInicio >= fimreserva) return res.send(false)

        Reserva.create({
          nsala,
          nutilizador,
          datareserva,
          horainicio: hInicio,
          horafim: hFim,
          fimreserva,
          estado
        }).then(result => {
          return res.send(true)
        }).catch(error => {
          return res.send(false)
        })

      })       
    },

    async listaReservasSala(req, res) {

      const { nsala } = req.params
        
      const reservas = await Reserva.findAll({
          attributes: ['nreserva', 'datareserva', 'horainicio', 'horafim', ['estado', 'estadoreserva']],
          where: {
              nsala: {
                [Op.eq]: nsala,
              },
              estado: {
                [Op.notIn]: [0,2]
              }
          },
          order: [
            ['horainicio', 'ASC']
          ],
          include: [
            { association: 'utilizadores', where: { estado: 1 }, attributes: ['utilizador', ['estado', 'estadouser']]},
            { association: 'sala', attributes: [['sala', 'nomesala']]},
          ]
          
      })

      return res.json({"data": reservas})

    },

    async ReservasHoje(req, res){

      const { nestabelecimento } = req.params

      Reserva.findAll({
          attributes: ['nreserva', 'nsala', 'nutilizador', 'datareserva', 'horainicio', 'horafim', 'fimreserva', 'estado'],
          where: {
            datareserva: {
              [Op.eq]: Uteis.todayDate(),
            },
            estado: {
              [Op.in]: [1, 3]
            },
          },
          order: [
            ['horainicio', 'ASC'],
            ['datareserva', 'ASC']
          ],
          include: [
            { association: 'utilizadores', where: { estado: 1 }, attributes: ['utilizador', 'cargo', 'imagem', ['estado', 'estadouser']]},
            { association: 'sala', where: { nestabelecimento, estadosala: 1, nestado: { [Op.notIn]: [2,3,6] } }, attributes: [['sala', 'nomesala'], 'descricao', 'nestabelecimento', 'estadosala', 'nestado', 'intervalolimpeza']},
          ]
      }).then(reservas => {
        return res.json({"data": reservas})
      }).catch(error => {
        res.json(error)
      })

    },

    async obterReservasSalaHoje(req, res) {

      const { nsala } = req.params
      
      if(nsala == undefined || nsala == null)
      return res.json({data: []})
  
      const reservas = await Reserva.findAll({
          attributes: ['nreserva', 'datareserva', 'horainicio', 'horafim', ['estado', 'estadoreserva']],
          where: {
              datareserva: {
                [Op.eq]: Uteis.todayDate(),
              },
              estado: {
                [Op.notIn]: [0,2]
              },
              nsala: {
                [Op.eq]: nsala,
              },
          },
          order: [
            ['datareserva', 'ASC']
          ],
          include: [
            { association: 'utilizadores', where: { estado: 1 }, attributes: ['utilizador', ['estado', 'estadouser']]},
            { association: 'sala', attributes: [['sala', 'nomesala']]},
          ]
          
      })
  
      return res.json({data: reservas})
  
    },

    async unionReservas(req, res){

      const { nestabelecimento } = req.params

      const dataHoje = Uteis.todayDate()
      const dataAmanha = Uteis.addToDate(1)
      const dataTop10 = Uteis.addToDate(2)

      Promise.all([
          //Reservas Hoje
          Reserva.findAll({
            attributes: [[sequelize.literal(1), 'tipolista'], 'nreserva', 'nsala', 'nutilizador', 'datareserva', 'horainicio', 'horafim', 'fimreserva', 'estado'],
            where: {
              datareserva: {
                [Op.eq]: dataHoje,
              },
              estado: {
                [Op.notIn]: [0,2]
              },
              fimreserva: {
                [Op.gte]: Uteis.horasAtuais()
              }
            },
            order: [
              ['horainicio', 'ASC'],
              ['datareserva', 'ASC']
            ],
            include: [
              { association: 'utilizadores', where: { estado: 1 }, attributes: ['utilizador', 'cargo', 'imagem', ['estado', 'estadouser']]},
              { association: 'sala', where: { nestabelecimento, estadosala: 1 }, attributes: [['sala', 'nomesala'], 'descricao', 'nestabelecimento', 'estadosala']},
            ]
        }),
         //Reservas Amanha
         Reserva.findAll({
          attributes: [[sequelize.literal(2), 'tipolista'], 'nreserva', 'nsala', 'nutilizador', 'datareserva', 'horainicio', 'horafim', 'fimreserva', 'estado'],
          where: {
            datareserva: {
              [Op.eq]: dataAmanha,
            },
            estado: {
              [Op.notIn]: [0,2]
            },
          },
          order: [
            ['horainicio', 'ASC'],
            ['datareserva', 'ASC']
          ],
          include: [
            { association: 'utilizadores', where: { estado: 1 }, attributes: ['utilizador', 'cargo', 'imagem', ['estado', 'estadouser']]},
            { association: 'sala', where: { nestabelecimento, estadosala: 1 }, attributes: [['sala', 'nomesala'], 'descricao']},
          ]
      }),
      //Top10
      Reserva.findAll({
        attributes: [[sequelize.literal(3), 'tipolista'], 'nreserva', 'nsala', 'nutilizador', 'datareserva', 'horainicio', 'horafim', 'fimreserva', 'estado'],
        where: {
          datareserva: {
            [Op.gte]: dataTop10, //Maior ou igual a dataHoje
          },
          estado: {
            [Op.notIn]: [0,2]
          },
        },
        order: [
          ['horainicio', 'ASC'],
          ['datareserva', 'ASC']
        ],
        limit: 10, //Até 10 reservas
        include: [
          { association: 'utilizadores', where: { estado: 1 }, attributes: ['utilizador', 'cargo', 'imagem', ['estado', 'estadouser']]},
          { association: 'sala', where: { nestabelecimento, estadosala: 1 }, attributes: [['sala', 'nomesala'], 'descricao', 'nestabelecimento', 'estadosala']},
        ]
      })

       
    ]).then((modelReturn) => res.json({data: modelReturn.flat()}))
    },

    async validarReservas(req, res) {
      const { nestabelecimento } = req.params
      const { nutilizador, inicio, fim, data, nsala } = req.body
      let user = parseInt(nutilizador)
      let sala = parseInt(nsala)

      const dataHoje = Uteis.todayDate()

      if(dataHoje > data){
        console.log("Estas a reservar no passado")
        return res.send(false)
      }
      if(Uteis.horasAtuais() > inicio && dataHoje == data){
        console.log("Estas horas ja passaram")
        return res.send(false)
      }

      const reservas = await Reserva.findAll({
          attributes: ['horainicio', 'horafim'],
          where: {
            datareserva: {
              [Op.eq]: data, //Maior ou igual a dataHoje
            },
            estado: {
              [Op.notIn]: [0,2]
            },
            nsala: {
              [Op.eq]: nsala
            }
          },
          order: [
            ['horainicio', 'ASC']
          ],
          include: [
            { association: 'utilizadores', where: { nutilizador: user, estado: 1 }, attributes: [['estado', 'estadouser']]},
            { association: 'sala', where: { estadosala: 1, nsala: sala }},
          //  { association: 'sala', where: { nestabelecimento, estadosala: 1, nsala: sala }},
          ]
      }).then((reservas) => {

        const arrInicio = reservas.map(reserva => reserva.horainicio)
        const arrFim = reservas.map(reserva => reserva.horafim)

        const intervalos = [];
        for (index = 0; index < arrInicio.length; index++) {
          intervalos.push({start:arrInicio[index], end:arrFim[index]});
        }

        intervalos.push({start:inicio, end:fim}); //Horario fornecido pelo utilizador
        console.log(intervalos);

        const overlapping = (a, b) => {
          const getMinutes = s => {
             const p = s.split(':').map(Number);
             return p[0] * 60 + p[1];
          };
          return getMinutes(a.end) > getMinutes(b.start) && getMinutes(b.end) > getMinutes(a.start);
        };
        const isOverlapping = (arr) => {
            let i, j;
            for (i = 0; i < arr.length - 1; i++) {
                for (j = i + 1; j < arr.length; j++) {
                  if (overlapping(arr[i], arr[j])) {
                    return true;
                  }
              };
            };
            return false;
        };
        if(!isOverlapping(intervalos)){
            // we need a function that makes hours and minutes a two digit number

            // get current date and time
            let min = new Date(2022, 05, 05, 9, 00, 0, 0)
            aberturaLocal = String(min.getHours()).padStart(2, '0') + ':' + String(min.getMinutes()).padStart(2, '0');
            let max = new Date(2022, 05, 05, 20, 00, 0, 0)
            fechoLocal = String(max.getHours()).padStart(2, '0') + ':' + String(max.getMinutes()).padStart(2, '0');
            let atual = new Date()
            console.log("-->" + atual)
            horasAtuais = String(atual.getHours()).padStart(2, '0') + ':' + String(atual.getMinutes()).padStart(2, '0');        

            // test if timeOfDay is within a given time frame
            if (inicio >= aberturaLocal && fim <= fechoLocal) {
              console.log('O horario escolhido não sobrepoem outro!');
              if(data == Uteis.todayDate()){
                if(inicio >= horasAtuais){
                  console.log('Reserva Aceite!');
                  res.send(true)
                }else{
                  console.log('Não pode reservar no passado!');
                  res.send(false)
                }
              }else res.send(true)
              

            } else {
              console.log('Fora do horario de funcionamento' + inicio + ' < ' + aberturaLocal + " e " + fim + ' < ' + fechoLocal);
              res.send(false)
            }
          
        }else{
          console.log("O horario escolhido sobrepoem outro!");
          res.send(false)
        }

      })

  },

  async obterReservasSala(req, res) {

    const { nsala } = req.params
    
    if(nsala == undefined || nsala == null)
    return res.json({"data": false})

    const reservas = await Reserva.findAll({
        attributes: ['nreserva', 'datareserva', 'horainicio', 'horafim', ['estado', 'estadoreserva']],
        where: {
            estado: {
              [Op.notIn]: [0,2]
            },
            nsala: {
              [Op.eq]: nsala,
            },
        },
        order: [
          ['datareserva', 'ASC']
        ],
        include: [
          { association: 'utilizadores', where: { estado: 1 }, attributes: ['utilizador', ['estado', 'estadouser']]},
          { association: 'sala', attributes: [['sala', 'nomesala']]},
        ]
        
    })

    return res.json({"data": reservas})

  },

  async apagarReserva(req, res) {

    const { nreserva } = req.body
    if(nreserva == undefined || nreserva == null)
      return res.status(400).send(false)

    const reserva = await Reserva.findByPk(nreserva);
    
    if(reserva){
      reserva.update({
        estado: 0
      }).then(result => {
        const message = "A reserva agendada para o dia " + Moment(new Date(Date.parse(reserva.datareserva)), "DD/MM/YYYY").format("DD/MM/YYYY") + " foi cancelada!"
        console.log(message)
        notificarUtilizador(reserva.nutilizador, 2, "Reserva Cancelada", message)
        .then((res) => console.log(message))
        .catch((err) => console.log("Erro ao enviar notificacao: ", err))
        res.status(200).send(true)
      }).catch(error => {
        res.status(400).send(false)
      })
    }else res.status(400).send(false);

  },

  async terminarReserva(req, res) {

    const { nreserva, fim, fimintervalo } = req.body
    if(nreserva == undefined || nreserva == null)
      return res.status(400).send(false)

    const reserva = await Reserva.findByPk(nreserva);
    const sala = await Reserva.findByPk(nreserva, {
      include: [
        { association: 'sala', attributes: ['nestado', 'intervalolimpeza'], where: { nestado: 5 }},
      ]
      
    })
    
    if(reserva && sala){

      var minutes = sala.sala.intervalolimpeza
      var fimreserva = Uteis.addMinutes(fim, minutes)
      var hFim = String(fim).padStart(5, '0')

      reserva.update({
        estado: 2,
        horafim: fimreserva,
        fimreserva: hFim
      }).then(result => {
        if(sala.intervalolimpeza != 0){
          console.log("Intervalo:")
          console.log(sala.sala.intervalolimpeza)
          promisePedido(sala.nsala, 'limpeza', 'A reserva foi concluida com sucesso, aguardando agora limpeza', Uteis.todayDate(), Uteis.horasAtuais(), Uteis.addMinutes(Uteis.horasAtuais(), parseInt(sala.sala.intervalolimpeza)))
          .then((res) => console.log("Pedido de limpeza efectuado."))
          .catch((err) => console.log("Erro ao criar pedido: ", err))
        }
        res.status(200).send(true)
      }).catch(error => {
        res.status(400).send(false)
      })

    }else res.status(400).send(false);

  },

  async reservasUtilizadorOrganizadas(req, res) {

    const { nutilizador } = req.params

    const dataHoje = Uteis.todayDate()
    const dataAmanha = Uteis.addToDate(1)

    Promise.all([
        //Reservas Hoje
        Reserva.findAll({
          attributes: ['nreserva', 'datareserva', 'horainicio', 'horafim', 'fimreserva', ['estado', 'estadoreserva']],
          where: {
            datareserva: {
              [Op.eq]: dataHoje,
            },
            estado: {
              [Op.notIn]: [0,2]
            },
            horafim: {
              [Op.gte]: Uteis.horasAtuais()
            },
            nutilizador : {
              [Op.eq]: nutilizador
            }
          },
          order: [
            ['horainicio', 'ASC'],
            ['datareserva', 'ASC']
          ],
          include: [
            { association: 'utilizadores', where: { estado: 1 }, attributes: ['utilizador', ['estado', 'estadouser']]},
            { association: 'sala', attributes: ['nsala', ['sala', 'nomesala'], 'intervalolimpeza', 'nestado']},
          ]
        }),
        //Reservas Amanha
        Reserva.findAll({
          attributes: ['nreserva', 'datareserva', 'horainicio', 'horafim', 'fimreserva', ['estado', 'estadoreserva']],
          where: {
            datareserva: {
              [Op.gte]: dataAmanha,
            },
            estado: {
              [Op.notIn]: [0,2]
            },
            nutilizador : {
              [Op.eq]: nutilizador
            }
          },
          order: [
            ['horainicio', 'ASC'],
            ['datareserva', 'ASC']
          ],
          include: [
            { association: 'utilizadores', where: { estado: 1 }, attributes: ['utilizador', ['estado', 'estadouser']]},
            { association: 'sala', attributes: ['nsala', ['sala', 'nomesala'], 'intervalolimpeza', 'nestado']},
          ]
        })

      ]).then((modelReturn) => res.json({ data: modelReturn.flat() }))
    },

    async reservasUtilizadorEstabelecimento(req, res) {

      const { nestabelecimento } = req.params
      const { nutilizador } = req.body

      console.log(nestabelecimento, nutilizador)

      if(nestabelecimento == undefined || nutilizador == undefined)
        return res.json({ data: [] })
  
      const dataHoje = Uteis.todayDate()
      const dataAmanha = Uteis.addToDate(1)
  
      Promise.all([
          //Reservas Hoje
          Reserva.findAll({
            attributes: ['nreserva', 'datareserva', 'horainicio', 'horafim', 'fimreserva', ['estado', 'estadoreserva']],
            where: {
              datareserva: {
                [Op.eq]: dataHoje,
              },
              estado: {
                [Op.notIn]: [0,2]
              },
              horafim: {
                [Op.gte]: Uteis.horasAtuais()
              },
              nutilizador : {
                [Op.eq]: nutilizador
              }
            },
            order: [
              ['horainicio', 'ASC'],
              ['datareserva', 'ASC']
            ],
            include: [
              { association: 'utilizadores', where: { estado: 1 }, attributes: ['utilizador', ['estado', 'estadouser']]},
              { association: 'sala', attributes: ['nsala', ['sala', 'nomesala'], 'intervalolimpeza', 'nestado', 'imagem'], where: { nestabelecimento }},
            ]
          }),
          //Reservas Amanha
          Reserva.findAll({
            attributes: ['nreserva', 'datareserva', 'horainicio', 'horafim', 'fimreserva', ['estado', 'estadoreserva']],
            where: {
              datareserva: {
                [Op.gte]: dataAmanha,
              },
              estado: {
                [Op.notIn]: [0,2]
              },
              nutilizador : {
                [Op.eq]: nutilizador
              }
            },
            order: [
              ['horainicio', 'ASC'],
              ['datareserva', 'ASC']
            ],
            include: [
              { association: 'utilizadores', where: { estado: 1 }, attributes: ['utilizador', ['estado', 'estadouser']]},
              { association: 'sala', attributes: ['nsala', ['sala', 'nomesala'], 'intervalolimpeza', 'nestado', 'imagem'], where: { nestabelecimento }},
            ]
          })
  
        ]).then((modelReturn) => res.json({ data: modelReturn.flat() }))
    },

    async obterReservas_Sala_Data(req, res) {

      const { nsala, data, nreserva } = req.body
      if(nsala == undefined || nsala == null)
      return res.json({"data": false})
  
      const reservas = await Reserva.findAll({
          attributes: ['nreserva', 'datareserva', 'horainicio', 'horafim', 'fimreserva', ['estado', 'estadoreserva']],
          where: {
              estado: {
                [Op.notIn]: [0,2]
              },
              nsala: {
                [Op.eq]: nsala,
              },
              datareserva: {
                [Op.eq]: data
              },
              nreserva: {
                [Op.ne]: nreserva
              }
          },
          order: [
            ['horainicio', 'ASC']
          ],
          include: [
            { association: 'utilizadores', where: { estado: 1 }, attributes: ['utilizador', ['estado', 'estadouser']]},
            { association: 'sala', attributes: [['sala', 'nomesala'], 'intervalolimpeza']},
          ]
          
      })
  
      return res.json({"data": reservas})
  
    },
    
    async validarReservasEdit(req, res) {
      const { nestabelecimento } = req.params
      const { nutilizador, inicio, fim, data, nsala, nreserva } = req.body

      let user = parseInt(nutilizador)
      let sala = parseInt(nsala)

      Reserva.findAll({
          attributes: ['horainicio', 'horafim'],
          where: {
            datareserva: {
              [Op.eq]: data,
            },
            estado: {
              [Op.notIn]: [0,2]
            },
            nsala: {
              [Op.eq]: nsala
            },
            nreserva: {
              [Op.ne]: nreserva
            }
          },
          order: [
            ['horainicio', 'ASC']
          ],
          include: [
            { association: 'utilizadores', where: { nutilizador: user, estado: 1 }, attributes: [['estado', 'estadouser']]},
            { association: 'sala', where: { nestabelecimento, estadosala: 1, nsala: sala }},
          ]
      }).then((reservas) => {

        const arrInicio = reservas.map(reserva => reserva.horainicio)
        const arrFim = reservas.map(reserva => reserva.horafim)

        const intervalos = [];
        for (index = 0; index < arrInicio.length; index++) {
          intervalos.push({start:arrInicio[index], end:arrFim[index]});
        }

        intervalos.push({start:inicio, end:fim}); //Horario fornecido pelo utilizador
        console.log(intervalos);

        const overlapping = (a, b) => {
          const getMinutes = s => {
             const p = s.split(':').map(Number);
             return p[0] * 60 + p[1];
          };
          return getMinutes(a.end) > getMinutes(b.start) && getMinutes(b.end) > getMinutes(a.start);
        };
        const isOverlapping = (arr) => {
            let i, j;
            for (i = 0; i < arr.length - 1; i++) {
                for (j = i + 1; j < arr.length; j++) {
                  if (overlapping(arr[i], arr[j])) {
                    return true;
                  }
              };
            };
            return false;
        };
        if(!isOverlapping(intervalos)){
            // we need a function that makes hours and minutes a two digit number

            // get current date and time
            let min = new Date(2022, 05, 05, 9, 00, 0, 0)
            aberturaLocal = String(min.getHours()).padStart(2, '0') + ':' + String(min.getMinutes()).padStart(2, '0');
            let max = new Date(2022, 05, 05, 20, 00, 0, 0)
            fechoLocal = String(max.getHours()).padStart(2, '0') + ':' + String(max.getMinutes()).padStart(2, '0');
            let atual = new Date()
            horasAtuais = String(atual.getHours()).padStart(2, '0') + ':' + String(atual.getMinutes()).padStart(2, '0');             

            // test if timeOfDay is within a given time frame
            if (inicio >= aberturaLocal && fim <= fechoLocal) {
              console.log('O horario escolhido não sobrepoem outro!');
              if(data == Uteis.todayDate()){
                if(inicio >= horasAtuais){
                  console.log('Reserva Aceite!');
                  res.send(true)
                }else{
                  console.log('Não pode reservar no passado!');
                  res.send(false)
                }
              }else res.send(true)
              

            } else {
              console.log('Fora do horario de funcionamento' + inicio + ' < ' + aberturaLocal + " e " + fim + ' < ' + fechoLocal);
              res.send(false)
            }
          
        }else{
          console.log("O horario escolhido sobrepoem outro!");
          res.send(false)
        }

      })

    },
    
    async filtrarSalasDataHora(req, res){
      const { nestabelecimento, datareserva, horainicio, horafim } = req.body

      if(horainicio == "00:00" && horafim == "00:00"){

        Reserva.findAll({
          attributes: [],
          where: {
            datareserva: {
              [Op.eq]: datareserva
            },
            estado: {
              [Op.notIn]: [0,2]
            },
          },
          include: [
            { association: 'sala', where: { nestabelecimento, estadosala: 1 }},
          ]
        }).then(reserva => {
  
          const arraySalas = reserva.map(sala => sala.sala.nsala)
          Sala.findAll({
              where: {
                  nsala: {
                    [Op.notIn]: arraySalas
                  },
                  nestabelecimento: {
                      [Op.eq]: nestabelecimento
                  },
                  estadosala: {
                    [Op.eq]: 1
                  }
              },
           }).then(sala => {
              return res.json({"status": true, data: sala})
           }).catch(error => {
              return res.json({"status": true, "message": error})
           })
  
        }).catch(error => {
           return res.json({"status": true, "message": error})
        })

      }else if(horainicio != "00:00" && horafim == "00:00"){

        Reserva.findAll({
          attributes: ['horafim'],
          where: {
            datareserva: {
              [Op.eq]: datareserva
            },
            horainicio: {
              [Op.gte]: horainicio
            },
            estado: {
              [Op.notIn]: [0,2]
            },
          },
          include: [
            { association: 'sala', where: { nestabelecimento, estadosala: 1 }},
          ]
        }).then(reserva => {
  
          const arraySalas = reserva.map(sala => sala.sala.nsala)
          Sala.findAll({
              where: {
                  nsala: {
                    [Op.notIn]: arraySalas
                  },
                  nestabelecimento: {
                      [Op.eq]: nestabelecimento
                  },
                  estadosala: {
                    [Op.eq]: 1
                  }
              },
           }).then(sala => {
              return res.json({"status": true, data: sala})
           }).catch(error => {
              return res.json({"status": true, "message": error})
           })
  
        }).catch(error => {
           return res.json({"status": true, "message": error})
        })

      }else{

        Reserva.findAll({
          attributes: [],
          where: {
            datareserva: {
              [Op.eq]: datareserva
            },
            horainicio: {
              [Op.gte]: horainicio
            },
            horafim: {
              [Op.lte]: horafim
            },
            estado: {
              [Op.notIn]: [0,2]
            },
          },
          include: [
            { association: 'sala', where: { nestabelecimento, estadosala: 1 }},
          ]
        }).then(reserva => {
  
          const arraySalas = reserva.map(sala => sala.sala.nsala)
          Sala.findAll({
              where: {
                  nsala: {
                    [Op.notIn]: arraySalas
                  },
                  nestabelecimento: {
                      [Op.eq]: nestabelecimento
                  },
                  estadosala: {
                    [Op.eq]: 1
                  }
              },
           }).then(sala => {
              return res.json({"status": true, data: sala})
           }).catch(error => {
              return res.json({"status": true, "message": error})
           })
  
        }).catch(error => {
           return res.json({"status": true, "message": error})
        })


      }

    },

    async validarReservasTablet(req, res) {

      const { inicio, fim, data, nsala } = req.body
      console.log(inicio)
      console.log(fim)
      console.log(data)
      console.log(nsala)

      Reserva.findAll({
          attributes: ['horainicio', 'horafim'],
          where: {
            datareserva: {
              [Op.eq]: data, //Maior ou igual a dataHoje
            },
            estado: {
              [Op.notIn]: [0,2]
            },
            nsala: {
              [Op.eq]: nsala
            }
          },
          order: [
            ['horainicio', 'ASC']
          ],
          include: [
            { association: 'sala', where: { estadosala: 1 }, attributes: ['estadosala']},
          ]
      }).then((reservas) => {

        const arrInicio = reservas.map(reserva => reserva.horainicio)
        const arrFim = reservas.map(reserva => reserva.horafim)

        const intervalos = [];
        for (index = 0; index < arrInicio.length; index++) {
          intervalos.push({start:arrInicio[index], end:arrFim[index]});
        }

        intervalos.push({start:inicio, end:fim}); //Horario fornecido pelo utilizador
        console.log(intervalos);

        const overlapping = (a, b) => {
          const getMinutes = s => {
             const p = s.split(':').map(Number);
             return p[0] * 60 + p[1];
          };
          return getMinutes(a.end) > getMinutes(b.start) && getMinutes(b.end) > getMinutes(a.start);
        };
        const isOverlapping = (arr) => {
            let i, j;
            for (i = 0; i < arr.length - 1; i++) {
                for (j = i + 1; j < arr.length; j++) {
                  if (overlapping(arr[i], arr[j])) {
                    return true;
                  }
              };
            };
            return false;
        };
        if(!isOverlapping(intervalos)){
            // we need a function that makes hours and minutes a two digit number

            // get current date and time
            let min = new Date(2022, 05, 05, 9, 00, 0, 0)
            aberturaLocal =String( min.getHours()).padStart(2, '0') + ':' + String(min.getMinutes()).padStart(2, '0');
            let max = new Date(2022, 05, 05, 20, 00, 0, 0)
            fechoLocal = String(max.getHours()).padStart(2, '0') + ':' + String(max.getMinutes()).padStart(2, '0');
            let atual = new Date()
            horasAtuais = String(atual.getHours()).padStart(2, '0') + ':' + String(atual.getMinutes()).padStart(2, '0');                 

            // test if timeOfDay is within a given time frame
            if (inicio >= aberturaLocal && fim <= fechoLocal) {
              console.log('O horario escolhido não sobrepoem outro!');
              if(data == Uteis.todayDate()){
                if(inicio >= horasAtuais){
                  console.log('Reserva Aceite!');
                  res.send(true)
                }else{
                  console.log('Não pode reservar no passado!');
                  res.send(false)
                }
              }else res.send(true)
              

            } else {
              console.log('Fora do horario de funcionamento' + inicio + ' < ' + aberturaLocal + " e " + fim + ' < ' + fechoLocal);
              res.send(false)
            }
          
        }else{
          console.log("O horario escolhido sobrepoem outro!");
          res.send(false)
        }

      }).catch(error => {
        console.log(error)
      })

  },

  async obterReservasSala(req, res) {

    const { nsala } = req.params
    if(nsala == undefined || nsala == null)
    return res.json({"data": false})

    const reservas = await Reserva.findAll({
        attributes: ['nreserva', 'datareserva', 'horainicio', 'horafim', ['estado', 'estadoreserva']],
        where: {
            estado: {
              [Op.notIn]: [0]
            },
            nsala: {
              [Op.eq]: nsala,
            },
        },
        order: [
          ['datareserva', 'ASC']
        ],
        include: [
          { association: 'utilizadores', where: { estado: 1 }, attributes: ['utilizador', ['estado', 'estadouser']]},
          { association: 'sala', attributes: [['sala', 'nomesala']]},
        ]
        
    })

    return res.json({"data": reservas})

  },

  async getAgendadas(req, res){

    const { nestabelecimento } = req.params

    if(nestabelecimento == undefined || isNaN(nestabelecimento)) return res.json({"success": true, "data": 0 })

    const count = await Reserva.count({
      where: {
        [Op.or]: [{        
            datareserva: {
              [Op.eq]: Uteis.todayDate()
            },
            horainicio: {
              [Op.gte]: Uteis.horasAtuais()
            },
        },
        {        
          datareserva: {
            [Op.gte]: Uteis.todayDate()
          },
        },

      ],

        estado: {
          [Op.notIn]: [0],
        }
      },
      include: [
        { association: 'sala', where: { nestabelecimento: nestabelecimento }},
      ]
    })

    res.json({"success": true, data: count})

  },

  async getCanceladas(req, res){

    const { nestabelecimento } = req.params

    if(nestabelecimento == undefined || isNaN(nestabelecimento)) return res.json({"success": true, "data": 0 })

    const count = await Reserva.count({
      where: {
        estado: {
          [Op.eq]: 0
        }
      },
      include: [
        { association: 'sala', where: { nestabelecimento: nestabelecimento }},
      ]
    })

    res.json({"success": true, data: count})

  },

  async getTotalReservas(req, res){

    const { nestabelecimento } = req.params
    const { inicio, fim } = req.body

    if(nestabelecimento == undefined || isNaN(nestabelecimento)) return res.json({"success": true, "data": 0 })

    var checkInicio = Date.parse(inicio);
    var checkFim = Date.parse(fim);

    if (isNaN(checkInicio) == true || isNaN(checkFim) == true) {
      return res.json({"success": false, data: 0})
    }

    const count = await Reserva.count({
      where: {
        estado: {
          [Op.notIn]: [0]
        },
        datareserva: {
          [Op.between]: [inicio, fim]
        }
      },
      include: [
        { association: 'sala', where: { nestabelecimento: nestabelecimento }},
      ]
    })

    res.json({"success": true, data: count})

  },

  async necessidadeLimpeza(req, res){

    const { nestabelecimento } = req.params

    if(nestabelecimento == undefined || isNaN(nestabelecimento))
      return res.status(400).json({success: false, message: "Campos vazios"});

    const reservas = await Reserva.findAll({
      attributes: ['nreserva', 'datareserva', 'horainicio', 'horafim', ['estado', 'estadoreserva']],
      where: {
          datareserva: {
            [Op.eq]: Uteis.todayDate()
          },
          fimreserva: {
            [Op.lte]: Uteis.horasAtuais()
          },
          horafim: {
            [Op.gte]: Uteis.horasAtuais()
          }
      },
      order: [
        ['datareserva', 'ASC']
      ],
      include: [
        { association: 'utilizadores', where: { estado: 1 }, attributes: ['utilizador', ['estado', 'estadouser']]},
        { association: 'sala', attributes: ['sala', 'nestado', 'nestabelecimento'], where: { nestabelecimento: nestabelecimento, nestado: {[Op.in]: [2,3,4]} }, order: ['nestado', 'DESC']},
      ],
      limit: 10
    })

    res.json({data: reservas})
    
  },

  async ultimasReservas(req, res){

    const { nestabelecimento } = req.params

    if(nestabelecimento == undefined || isNaN(nestabelecimento))
      return res.status(400).json({success: false, message: "Campos vazios"});

    const reservas = await Reserva.findAll({
      attributes: ['nreserva', 'datareserva', 'horainicio', 'horafim', ['estado', 'estadoreserva']],
      where: {
          datareserva: {
            [Op.gte]: Uteis.todayDate()
          },
          estado: {
            [Op.notIn]: [0, 2]
          }
      },
      order: [
        ['nreserva', 'DESC']
      ],
      include: [
        { association: 'utilizadores', where: { estado: 1 }, attributes: ['utilizador', ['estado', 'estadouser']]},
        { association: 'sala', attributes: ['sala', 'nestado', 'nestabelecimento'], where: { nestabelecimento: nestabelecimento }},
      ],
      limit: 5
    })

    res.json({data: reservas})

  },

  async reservasEstabelecimento(req, res){

    const { nestabelecimento } = req.params

    if(nestabelecimento == undefined || isNaN(nestabelecimento))
      return res.status(400).json({success: false, message: "Campos vazios"});

    const reservas = await Reserva.findAll({
      attributes: ['nreserva', 'datareserva', 'horainicio', 'horafim', 'fimreserva', ['estado', 'estadoreserva']],
      order: [
        ['nreserva', 'DESC']
      ],
      include: [
        { association: 'utilizadores', where: { estado: 1 }, attributes: ['utilizador', ['estado', 'estadouser']]},
        { association: 'sala', attributes: ['nsala', 'sala', 'nestado', 'nestabelecimento','intervalolimpeza'], where: { nestabelecimento: nestabelecimento }},
      ],
    })

    res.json({data: reservas})

  },

  async getReserva(req, res){

    const { nreserva } = req.params

    if(nreserva == undefined)
      return res.status(400).json({success: false, message: "Campos vazios"});

    const reservas = await Reserva.findByPk(nreserva, {
      attributes: ['nreserva', 'datareserva', 'horainicio', 'horafim', ['estado', 'estadoreserva']],
      include: [
        { association: 'utilizadores', attributes: ['utilizador', ['estado', 'estadouser']]},
        { association: 'sala', attributes: ['nsala', 'sala', 'nestado', 'nestabelecimento','intervalolimpeza']},
      ],
    })

    res.json({data: reservas})

  },

  async removerReserva(req, res) {

    const { nreserva } = req.params
    if(nreserva == undefined)
      return res.status(400).json({success: false, message: "Campos vazios"});

    const reserva = await Reserva.findByPk(nreserva);
    
    if(reserva){
      if(reserva.estado != 0 || reserva.estado != 2){
        const message = "A reserva agendada para o dia " + Moment(new Date(Date.parse(reserva.datareserva)), "DD/MM/YYYY").format("DD/MM/YYYY") + " foi removida por um gestor!"
        notificarUtilizador(reserva.nutilizador, 2, "Reserva Cancelada", message)
          .then((res) => console.log(message))
          .catch((err) => console.log("Erro ao enviar notificacao: ", err))
      }
      reserva.destroy().then(result => {
        res.status(200).send(true)
      }).catch(error => {
        res.status(400).send(false)
      })
    }else res.status(400).send(false);

  },

  async alterarReserva(req, res) {

    const { nreserva } = req.params
    const { nsala, datareserva, horainicio, horafim, intervalo } = req.body

    if(nreserva == undefined || nsala == undefined || datareserva == undefined || horainicio == undefined || horafim == undefined)
      return res.status(400).json({success: false, message: "Campos vazios"});

    var fimreserva = Uteis.removeMinutes(horafim, intervalo)
    var hInicio = String(horainicio).padStart(5, '0')
    var hFim = String(horafim).padStart(5, '0')

    const reserva = await Reserva.findByPk(nreserva)

    if(reserva){
      Reserva.update({
        nsala: nsala,
        datareserva: datareserva,
        horainicio: hInicio,
        horafim: hFim,
        fimreserva: fimreserva
      }, 
      {where: {nreserva: nreserva}}).then(result => {
        const moment = MomentRange.extendMoment(Moment);
        const message = "A reserva agendada para o dia " + Moment(new Date(Date.parse(reserva.datareserva)), "DD/MM/YYYY").format("DD/MM/YYYY") + " sofreu alterações!"
        notificarUtilizador(reserva.nutilizador, 2, "Reserva Alterada", message)
        .then((res) => console.log(message))
        .catch((err) => console.log("Erro ao enviar notificacao: ", err))
        return res.status(200).json({success: true, message: "A Reserva foi alterada."});
      }).catch(error => {
        console.log(error)
        return res.status(400).json({success: false, message: "A Reserva não foi alterada."});
      })
    }else return res.status(400).json({success: false, message: "A Reserva não foi alterada."});


  },

  async validarSobreposicaoEdit(req, res){

    const { nreserva } = req.params
    const { datareserva, horainicio, horafim, nsala } = req.body

    console.log("A verificar disponibilidade...")

    Reserva.findAll({
      attributes: ['horainicio', 'horafim'],
      where: {
        nreserva: {
          [Op.ne]: nreserva
        },
        datareserva: {
          [Op.eq]: datareserva
        },
        nsala: {
          [Op.eq]: nsala
        },
        estado: {
          [Op.ne]: 0
        }
      }
    }).then(result => {

      const arrInicio = result.map(reserva => reserva.horainicio)
      const arrFim = result.map(reserva => reserva.horafim)

      const moment = MomentRange.extendMoment(Moment);

      const inicio = moment(horainicio, 'HH:mm')
      const fim    = moment(horafim, 'HH:mm')
      const novo = moment.range(inicio, fim);

      const intervalos = [];
      for (i = 0; i < arrInicio.length; i++) {
        intervalos.push({inicio:arrInicio[i], fim:arrFim[i]});
      }

      console.log(intervalos)

      var overlaps = false
      intervalos.map(data => {
        const range = moment.range(moment(data.inicio, 'HH:mm'), moment(data.fim, 'HH:mm'));
        if(novo.overlaps(range)) overlaps = true
      })

      if(!overlaps){
        if (inicio.isSameOrAfter(moment("09:00", 'HH:mm')) && fim.isSameOrBefore(moment("20:00", 'HH:mm'))) {
          if(datareserva == Uteis.todayDate()){
            if(horainicio >= Uteis.horasAtuais()){
              return res.json({success: true, message: "Reserva validada!"})
            }else{
              return res.json({success: false, message: "não pode reservar no passado"})
            }
          }else res.json({success: true, message: "Reserva validada!"})     
        }else {
          return res.json({success: false, message: "o intervalo escolhido esta fora do horario de funcionamento do estabelecimento!"})
        }
      }else return res.json({success: false, message: "já existe uma reserva no intervalo selecionado!"})

    }).catch(error => {
      console.log(error)
      return res.json({success: false, message: error})
    })

  },

  async validarSobreposicaoNew(req, res){

    const { datareserva, horainicio, horafim, nsala } = req.body

    console.log("A verificar disponibilidade...")

    Sala.findByPk(nsala).then(sala => {
      if(sala.estadosala === 0 || sala.nestado === 6) return res.json({success: false, message: "a sala selecionada esta desativada!"})
      else{
        Reserva.findAll({
          attributes: ['horainicio', 'horafim'],
          where: {
            datareserva: {
              [Op.eq]: datareserva
            },
            nsala: {
              [Op.eq]: nsala
            },
            estado: {
              [Op.ne]: 0
            }
          },
          include: [
            { association: 'sala', attributes: ['nestado']},
          ],
        }).then(result => {
    
          const arrInicio = result.map(reserva => reserva.horainicio)
          const arrFim = result.map(reserva => reserva.horafim)
    
          const moment = MomentRange.extendMoment(Moment);
    
          const inicio = moment(horainicio, 'HH:mm')
          const fim    = moment(horafim, 'HH:mm')
          const novo = moment.range(inicio, fim);
    
          const intervalos = [];
          for (i = 0; i < arrInicio.length; i++) {
            intervalos.push({inicio:arrInicio[i], fim:arrFim[i]});
          }
    
          var overlaps = false
          intervalos.map(data => {
            const range = moment.range(moment(data.inicio, 'HH:mm'), moment(data.fim, 'HH:mm'));
            if(novo.overlaps(range)) overlaps = true
          })
    
          if(!overlaps){
            if (inicio.isSameOrAfter(moment("09:00", 'HH:mm')) && fim.isSameOrBefore(moment("20:00", 'HH:mm'))) {
              if(datareserva == Uteis.todayDate()){
                if(horainicio >= Uteis.horasAtuais()){
                  return res.json({success: true, message: "Reserva validada!"})
                }else{
                  return res.json({success: false, message: "Atenção, não pode reservar no passado!"})
                }
              }else if(datareserva > Uteis.todayDate()){
                return res.json({success: true, message: "Reserva validada!"}) 
              }else return res.json({success: false, message: "Atenção, não pode reservar no passado!"})
            }else {
              return res.json({success: false, message: "Atenção, o intervalo escolhido esta fora do horario de funcionamento do estabelecimento!"})
            }
          }else return res.json({success: false, message: "Atenção, já existe uma reserva no intervalo selecionado!"})
    
        }).catch(error => {
          console.log(error)
          return res.json({success: false, message: error})
        })
      }
    }).catch(error => {
      return res.json({success: false, message: "Atenção, a sala escolhida não existe!"})
    })

  },

  async usedYears(req, res){

    const { nestabelecimento } = req.params

    if(nestabelecimento == undefined)
      return res.status(400).json({success: false, message: "Campo vazio"});

    Reserva.findAll({
      attributes: ['datareserva'],
      include: [
        { association: 'sala', attributes: ['nestabelecimento'], where: { nestabelecimento: nestabelecimento }},
      ],
    }).then(result => {
      const datas = []
      result.forEach(item => {
        datas.push(new Date(Date.parse(item.datareserva)).getFullYear().toString())
      })
      const anos = []
      datas.forEach((c) => {
        if (!anos.includes(c)) {
          anos.push(c);
        }
      });
      console.log(anos)
      return res.status(200).json({success: true, data: anos.sort()}); 
    }).catch(error => {
      return res.status(400).json({success: false, message: error});
    })
    
  },

  async notificarDesativacao(req, res){

    const { nsala } = req.params
    const { tipo, title, message } = req.body

    Reserva.findAll({
      where: {
        nsala: {
          [Op.eq]: nsala
        }
      },
      include: [
        { association: 'utilizadores', attributes: ['nutilizador', 'tokenfirebase'], group: ['nutilizador'], where: {tokenfirebase: {[Op.ne]: null}}},
      ]
    }).then(result => {

      result.forEach(item => {

        const data = {
          tokenId: item.utilizadores.tokenfirebase,
          title: title,
          message: message
        }

         Notification.sendPushToOneUser(data);
         Notificacao.create({
             nutilizador: item.utilizadores.nutilizador, 
             ntipo: parseInt(tipo), 
             titulo: title, 
             descricao: message, 
             datahora: new Date(), 
             permanencia: 24                    
            }).then(result => {
              console.log("Notificação adicionada a base de dados.")
            }).catch(error => {
              console.log(error)
            })
    })

      return res.status(200).json({success: true, message: "Utilizadores notificados."});
    }).catch(error => {
      return res.status(400).json({success: false, message: error});
    })


  },

  async promiseNotificarDesativacao(nsala, tipo, title, message){

    return new Promise(function(resolve, reject) {
      Reserva.findAll({
        where: {
          nsala: {
            [Op.eq]: nsala
          }
        },
        include: [
          { association: 'utilizadores', attributes: ['nutilizador', 'tokenfirebase'], group: ['nutilizador'], where: {tokenfirebase: {[Op.ne]: null}}},
        ]
      }).then(result => {
  
        result.forEach(item => {
  
          const data = {
            tokenId: item.utilizadores.tokenfirebase,
            title: title,
            message: message
          }

          console.log(data)
  
           Notification.sendPushToOneUser(data);
           Notificacao.create({
               nutilizador: item.utilizadores.nutilizador, 
               ntipo: parseInt(tipo), 
               titulo: title, 
               descricao: message, 
               datahora: new Date(), 
               permanencia: 24                    
              }).then(result => {
                console.log("Notificação adicionada a base de dados.")
              }).catch(error => {
                console.log(error)
                reject(false)
              })
        })
  
        resolve(true)
      }).catch(error => {
        reject(false)
      })
    })


  },

  async promiseNotificarEstabelecimento(nestabelecimento, tipo, title, message){

    return new Promise(function(resolve, reject) {
      Reserva.findAll({
        include: [
          { association: 'utilizadores', attributes: ['nutilizador', 'tokenfirebase'], group: ['nutilizador'], where: {tokenfirebase: {[Op.ne]: null}}},
          { association: 'sala', attributes: ['nestabelecimento'], where: { nestabelecimento }},
        ]
      }).then(result => {
  
        result.forEach(item => {
  
          const data = {
            tokenId: item.utilizadores.tokenfirebase,
            title: title,
            message: message
          }

          console.log(data)
  
           Notification.sendPushToOneUser(data);
           Notificacao.create({
               nutilizador: item.utilizadores.nutilizador, 
               ntipo: parseInt(tipo), 
               titulo: title, 
               descricao: message, 
               datahora: new Date(), 
               permanencia: 24                    
              }).then(result => {
                console.log("Notificação adicionada a base de dados.")
              }).catch(error => {
                console.log(error)
                reject(false)
              })
        })
  
        resolve(true)
      }).catch(error => {
        reject(false)
      })
    })


  },

  async reservasEmBreve(){

    return new Promise(function(resolve, reject) {
        
      Reserva.findAll({
        where: { 
          datareserva: {
              [Op.eq]: Uteis.todayDate()
          },
          estado: {
              [Op.eq]: 1
          },
          notificado: {
              [Op.eq]: 0
          }
       },
       include: [
          { association: 'sala', attributes: ['sala']},
       ]
      }).then(result => {

        result.forEach(item => {
          if(Uteis.addAtuais(1) >= item.horainicio){
            console.log(item.horainicio + " >= " + Uteis.addAtuais(1))
            console.log("Tenho um user a notificar")

            let title = "Reserva Agendada"
            let message = "Tem uma reserva agendada para hoje as " + item.horainicio + " na " + item.sala.sala
            let nreserva = item.nreserva
            let nutilizador = parseInt(item.nutilizador)

            Reserva.update({notificado: 1}, {where: {nreserva: parseInt(nreserva)}}).then(result => {
              console.log("Reserva foi atualizada com sucesso")
            }).catch(error => {
                console.log(error)
                reject(false)
            })

            User.findByPk(nutilizador).then(user => {
              console.log("A enviar uma notificação ao utilizador " + nutilizador)
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
                      reject(false)
                    })
              }else console.log("O utilizador " + nutilizador + " não tem um token valido!")
            }).catch(error => {
                console.log(error)
                reject(false)
            })

          }
            
        })
        resolve(true)
      }).catch(error => {
        console.log(error)
        reject(false)
      })

    });

  }


}

