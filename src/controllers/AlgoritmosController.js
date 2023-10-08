const Reserva = require('../models/Reserva')
const Uteis = require('../middleware/uteis')
const Sala = require('../models/Sala')
const { Op } = require('sequelize')
const Sequelize = require('sequelize')
const dbConfig = require('../config/database')
const sequelize = new Sequelize(dbConfig)
const Estabelecimento = require('../models/Estabelecimento')
const moment = require('moment')
const Pedido = require('../models/Pedido')
const Notificacao = require('../models/Notificacao')
const Notification = require("../config/firebase.js")

module.exports = {

    async AssociarEstabelecimentoLocalidade(localidade, n){
      return new Promise(function(resolve, reject) {
        Estabelecimento.findAll({where: {localidade: localidade}}).then(result => {
          if(result[0] != undefined){
            console.log("Estabelecimento: " + localidade)
            sequelize.query("INSERT INTO users_estabelecimentos (nutilizador, nestabelecimento) VALUES (" + parseInt(n) + ", " + parseInt(result[0].nestabelecimento) + ")").then(results => {      
              resolve(true);
            }).catch(error => {
              reject(false);
            })
          }else{
            console.log("Estabelecimento não encontrado.")
            reject(false);
          }
        }).catch(error => {
          reject(false);
        })
      });
    },

    async RemoverTodasReservas(id){
      return new Promise(function(resolve, reject) {
        console.log("Procuro: " + id)
        console.log("Procuro: " + id)
        console.log("Procuro: " + id)
        console.log("Procuro: " + id)
        sequelize.query("DELETE FROM reservas WHERE nsala IN (SELECT nsala FROM salas WHERE nestabelecimento = " + parseInt(id) + ")").then(results => {    
          console.log(results)  
          resolve(true);
        }).catch(error => {
          console.log(error)
          reject(false);
        })
      });
    },

    async RemoverTodosEstabelecimentos(id){
      return new Promise(function(resolve, reject) {
        sequelize.query("DELETE FROM users_estabelecimentos WHERE nutilizador = " + parseInt(id) + "").then(results => {      
          resolve(true);
        }).catch(error => {
          reject(false);
        })
      });
    },

    async RemoverTodosUsers(id){
      return new Promise(function(resolve, reject) {
        sequelize.query("DELETE FROM users_estabelecimentos WHERE nestabelecimento = " + parseInt(id) + "").then(results => {      
          resolve(true);
        }).catch(error => {
          reject(false);
        })
      });
    },

    async RemoverEstabelecimento(id, n){
      return new Promise(function(resolve, reject) {
        sequelize.query("DELETE FROM users_estabelecimentos WHERE nutilizador = " + parseInt(id) + " AND nestabelecimento = " + parseInt(n) + "").then(results => {      
          resolve(true);
        }).catch(error => {
          reject(false);
        })
      });
    },

    async AssociarEstabelecimento(id, n){
      return new Promise(function(resolve, reject) {
        sequelize.query("INSERT INTO users_estabelecimentos (nutilizador, nestabelecimento) VALUES (" + parseInt(id) + ", " + parseInt(n) + ")").then(results => {      
          resolve(true);
        }).catch(error => {
          reject(false);
        })
      });
    },

    async UtilizadoresAssociados(req, res){
      const { nutilizador } = req.params

      const query = `SELECT Estabelecimentos.nEstabelecimento, Estabelecimento 
                    FROM Estabelecimentos INNER JOIN Users_Estabelecimentos
                      ON Estabelecimentos.nEstabelecimento = Users_Estabelecimentos.nEstabelecimento
                    WHERE nUtilizador = '` + nutilizador + `'`

      sequelize.query(query).then(result => {
        res.json({data: result[0]})
      }).catch(error => {
        res.json({success: false, data: error})
      })
    },

    async todosEstabelecimentos(){

      return new Promise(function(resolve, reject) {
        
        sequelize.query("SELECT nestabelecimento, estabelecimento FROM estabelecimentos").then(results => {      
          var array = []
          console.log(results[0])
          results[0].map(data => {
            array.push({id: data.nestabelecimento, nome: data.estabelecimento})
          })
          resolve(array);
        }).catch(error => {
          reject(error);
        })

      });

    },

    async algunsEstabelecimentos(utilizador){

      return new Promise(function(resolve, reject) {
        
        sequelize.query("SELECT users_estabelecimentos.nestabelecimento, estabelecimento FROM users_estabelecimentos INNER JOIN estabelecimentos on users_estabelecimentos.nestabelecimento = estabelecimentos.nestabelecimento WHERE nutilizador = '" + utilizador + "'").then(results => {      
          var array = []
          results[0].map(data => {
            array.push({id: data.nestabelecimento, nome: data.estabelecimento})
          })
          resolve(array);
        }).catch(error => {
          reject(error);
        })

      });

    },

    async UtilizadoresNaoAssociados(req, res){
      const { nutilizador } = req.params

      const query = `SELECT Estabelecimentos.nEstabelecimento
                    FROM Estabelecimentos INNER JOIN Users_Estabelecimentos
                      ON Estabelecimentos.nEstabelecimento = Users_Estabelecimentos.nEstabelecimento
                    WHERE nUtilizador = '` + nutilizador + `'`

      sequelize.query(query).then(result => {
        const array = result[0].map(x => x.nestabelecimento)
        Estabelecimento.findAll({
          where: {
            nestabelecimento: {
              [Op.notIn]: array
            }
          }
        }).then(result => {
          res.json({data: result})
        }).catch(error => {
          res.json({success: false, data: error})
        })
      }).catch(error => {
        res.json({success: false, data: error})
      })
    },

    async UtilizadoresEstabelecimento(req, res){
      const { nestabelecimento } = req.params

      const query = `SELECT U.nutilizador, utilizador, telemovel, cargo, email, U.estado,  'Requisitante' AS Tipo, 0 AS Grau
                    FROM Utilizadores U LEFT OUTER JOIN users_estabelecimentos UE
                      ON U.nUtilizador = UE.nUtilizador
                    WHERE nEstabelecimento = '` + nestabelecimento + `' AND U.nUtilizador IN (SELECT nutilizador FROM Requisitantes)
                    UNION
                    SELECT U.nutilizador, utilizador, telemovel, cargo, email, U.estado, 'Gestor de Espaços' AS Tipo, (SELECT grau FROM Gestordeespacos GE WHERE GE.nUtilizador = U.nUtilizador) AS Grau
                    FROM Utilizadores U LEFT OUTER JOIN users_estabelecimentos UE
                      ON U.nUtilizador = UE.nUtilizador
                    WHERE nEstabelecimento = '` + nestabelecimento + `' AND U.nUtilizador IN (SELECT nutilizador FROM Gestordeespacos)
                    UNION
                    SELECT U.nutilizador, utilizador, telemovel, cargo, email, U.estado, 'Funcionário' AS Tipo, 0 AS Grau
                    FROM Utilizadores U LEFT OUTER JOIN users_estabelecimentos UE
                      ON U.nUtilizador = UE.nUtilizador
                    WHERE nEstabelecimento = '` + nestabelecimento + `' AND U.nUtilizador IN (SELECT nutilizador FROM Outros)`

      sequelize.query(query).then(result => {
        res.json({data: result[0]})
      }).catch(error => {
        res.json({success: false, data: error})
      })
      
    },

    async UtilizadoresEstabelecimentoNulos(req, res){
      const { nestabelecimento } = req.params

      const query = `SELECT U.nutilizador, utilizador, telemovel, cargo, email, U.estado,  'Requisitante' AS Tipo, 0 AS Grau
                    FROM Utilizadores U LEFT OUTER JOIN users_estabelecimentos UE
                      ON U.nUtilizador = UE.nUtilizador
                    WHERE nEstabelecimento = '` + nestabelecimento + `' AND U.nUtilizador IN (SELECT nutilizador FROM Requisitantes)
                    UNION
                    SELECT U.nutilizador, utilizador, telemovel, cargo, email, U.estado, 'Gestor de Espaços' AS Tipo, (SELECT grau FROM Gestordeespacos GE WHERE GE.nUtilizador = U.nUtilizador) AS Grau
                    FROM Utilizadores U LEFT OUTER JOIN users_estabelecimentos UE
                      ON U.nUtilizador = UE.nUtilizador
                    WHERE nEstabelecimento = '` + nestabelecimento + `' AND U.nUtilizador IN (SELECT nutilizador FROM Gestordeespacos)
                    UNION
                    SELECT U.nutilizador, utilizador, telemovel, cargo, email, U.estado, 'Funcionário' AS Tipo, 0 AS Grau
                    FROM Utilizadores U LEFT OUTER JOIN users_estabelecimentos UE
                      ON U.nUtilizador = UE.nUtilizador
                    WHERE nEstabelecimento = '` + nestabelecimento + `' AND U.nUtilizador IN (SELECT nutilizador FROM Outros)
                    UNION
                    SELECT U.nutilizador, utilizador, telemovel, cargo, email, U.estado,  'Requisitante' AS Tipo, 0 AS Grau
                    FROM Utilizadores U LEFT OUTER JOIN users_estabelecimentos UE
                      ON U.nUtilizador = UE.nUtilizador
                    WHERE nEstabelecimento IS NULL AND U.nUtilizador IN (SELECT nutilizador FROM Requisitantes)
                    UNION
                    SELECT U.nutilizador, utilizador, telemovel, cargo, email, U.estado, 'Gestor de Espaços' AS Tipo, (SELECT grau FROM Gestordeespacos GE WHERE GE.nUtilizador = U.nUtilizador) AS Grau
                    FROM Utilizadores U LEFT OUTER JOIN users_estabelecimentos UE
                      ON U.nUtilizador = UE.nUtilizador
                    WHERE nEstabelecimento IS NULL AND U.nUtilizador IN (SELECT nutilizador FROM Gestordeespacos)
                    UNION
                    SELECT U.nutilizador, utilizador, telemovel, cargo, email, U.estado, 'Funcionário' AS Tipo, 0 AS Grau
                    FROM Utilizadores U LEFT OUTER JOIN users_estabelecimentos UE
                      ON U.nUtilizador = UE.nUtilizador
                    WHERE nEstabelecimento IS NULL AND U.nUtilizador IN (SELECT nutilizador FROM Outros)`

      sequelize.query(query).then(result => {
        res.json({data: result[0]})
      }).catch(error => {
        res.json({success: false, data: error})
      })
      
    },

    async getReservasMensais(req, res){

      const { nestabelecimento } = req.params
      const { mes, ano } = req.body

      if(nestabelecimento == undefined || isNaN(nestabelecimento)) return res.json({"success": true, "data": 0 })

      function daysInMonth (month, year) {
        return new Date(year, month, 0).getDate();
      }
      var stringmes = mes.toString()
      if(mes.length = 1)
        stringmes = "0" + mes
      sequelize.query("SELECT COUNT(*) as nreservas, datareserva as data, EXTRACT(DAY FROM datareserva) as dia, EXTRACT(MONTH FROM datareserva) as mes FROM Reservas INNER JOIN Salas ON Reservas.nsala = Salas.nsala WHERE nestabelecimento = '" + nestabelecimento + "' AND EXTRACT(MONTH FROM datareserva) = '" + mes + "' AND EXTRACT(YEAR FROM datareserva) = '" + ano + "' AND Reservas.estado != 0 GROUP BY EXTRACT(DAY FROM datareserva), EXTRACT(MONTH FROM datareserva), datareserva ORDER BY dia").then(results => {
        var array = []
        var status = true
        for(i=1;i<daysInMonth(mes, Uteis.getYear())+1;i++){
            for(y=0;y<results[0].length;y++){
              if(results[0][y].dia == i.toString()){
                array.push(results[0][y])
                status = false
              }
            }
            if(status){
              array.push({"nreservas": "0", "data": Uteis.getYear() + "-" + stringmes + "-" + String(i).padStart(2, '0'), "dia": i.toString(), "mes": mes.toString()})
            }
            status = true     
        }
        res.json({"success": true, data: array})
      }).catch(error => {
        res.json({"success": false, data: error})
      })

    },

    async getSalasMaisReservadas(req, res){
      const { nestabelecimento } = req.params

      sequelize.query("SELECT Salas.Sala, Salas.lugares, (SELECT COUNT(*) FROM Reservas WHERE Reservas.nsala = Salas.nsala AND Reservas.estado != 0) as count FROM Salas WHERE nestabelecimento = '" + nestabelecimento + "' ORDER BY count DESC").then(results => {
        res.json({"success": true, data: results[0]})
      }).catch(error => {
        res.json({"success": false, data: 0, error: error})
      })
    },

    async getUtilizadores(req, res){

      const { nestabelecimento } = req.params

      if(nestabelecimento == undefined || isNaN(nestabelecimento)) res.json({"success": false, data: 0}) 

      sequelize.query("SELECT count(*) as count FROM users_estabelecimentos WHERE nestabelecimento = '" + nestabelecimento + "'").then(results => {
        const array = results[0].map(data => data.count)
        res.json({"success": true, data: array[0]})
      }).catch(error => {
        res.json({"success": false, data: 0, error: error})
      })

    },

    async getEstabelecimentos(n){

      return new Promise(function(resolve, reject) {
        
        sequelize.query("SELECT nestabelecimento FROM users_estabelecimentos WHERE nutilizador = '" + 2 + "'").then(results => {      
          const array = results[0].map(data => data.nestabelecimento)
          resolve(array);
        }).catch(error => {
          reject(error);
        })

    });

    },

    async salasDisponiveisEdit(req, res) {

        const { nestabelecimento, data, inicio, fim } = req.body

        console.log(nestabelecimento, data, inicio, fim)
        const array = data.split("-")
        const datareserva = array[2] + "-" + array[1] + "-" + array[0] 
        console.log(nestabelecimento, datareserva, inicio, fim)

        sequelize.query("SELECT nReserva, Salas.nSala FROM Reservas INNER JOIN Salas ON Reservas.nSala = Salas.nSala WHERE nEstabelecimento = '" + nestabelecimento + "' AND DataReserva = '" + datareserva + "' AND (('" + inicio + "' <= HoraFim) AND ('" + fim + "' >= HoraInicio))").then(results => {
            
            const arraySalas = results[0].map(sala => sala.nsala)

            Sala.findAll({
                where: {
                    nsala: {
                      [Op.notIn]: arraySalas
                    },
                    nestabelecimento: {
                        [Op.eq]: nestabelecimento
                    }
                },
             }).then(salas => {
                res.json({"status": true, data: salas})
             }).catch(err => {
              console.log(err)
              res.json({"status": false})
          }); 
            
        }).catch(err => {
            res.json({"status": false})
        }); 

    },

    async editSala(req, res){

        const { nreserva } = req.params
        const { nsala } = req.body 

        console.log("Vou atualizar a sala...")

        if(nreserva == undefined || nreserva == null)
          return res.status(400).send(false)

        Reserva.update({ nsala : parseInt(nsala) }, { where : { nreserva }}).then(result => {
          return res.status(200).send(true)
        }).catch(error => {
          console.log(error)
          return res.status(400).send(false)
        })
  
    },

    async datasDisponiveisEdit(req, res) {

        const { nsala, inicio, fim } = req.body

        const dataHoje = Uteis.todayDate()

        sequelize.query("SELECT datareserva FROM reservas WHERE nsala = " + nsala + " AND datareserva >= '" + dataHoje + "' AND (('" + inicio + "' < horafim) AND ('" + fim + "' > horainicio))").then(results => {
            res.json({"status": true, data: results[0]})        
        }).catch(err => {
            console.log(err)
            res.json({"status": false})
        }); 

    },

    async editData(req, res){

        const { nreserva } = req.params
        const { nsala, data, inicio, fim } = req.body 

        const dataHoje = Uteis.todayDate()
        
        if(data == dataHoje)
            if(Uteis.todayDate() > inicio)
                return res.json(false)

        sequelize.query("SELECT DataReserva FROM Reservas WHERE nsala = '" + nsala + "' AND DataReserva = '" + data + "' AND (('" + inicio + "' < HoraFim) AND ('" + fim + "' > HoraInicio))").then(results => {
            const arrayDatas = results[0].map(data => data.datareserva)
            console.log("Tam: " + arrayDatas.length)
            for (index = 0; index < arrayDatas.length; index++)
                console.log(arrayDatas[index])
            if(arrayDatas.length == 0){
                sequelize.query("UPDATE reservas SET datareserva = '" + data + "' WHERE nreserva = '" + nreserva + "'").then(results => {
                    res.json(true)  
                  }).catch(err => {
                    res.json(false)
                  }); 
            }else res.json({"status": false})
   
        }).catch(err => {
            res.json({"status": false})
        });  
  
    },

    async findNextReserva(req, res){
        const { nsala, data, inicio, fim } = req.body
        
        var maxReserva = 120 // 2 horas
        Reserva.findAll({
        attributes: ['horainicio'],
          where: {
            datareserva: {
              [Op.eq]: data,
            },
            estado: {
              [Op.notIn]: [0, 3] // Não quero reservas canceladas ou em curso
            },
            horainicio: {
              [Op.gte]: fim
            },
            nsala: {
              [Op.eq]: parseInt(nsala)
            }
          },
          order: [
            ['horainicio', 'ASC'],
            ['datareserva', 'ASC']
          ],
          limit: 1,
        }).then(result => {
            const horas = result.map(hora => hora.horainicio)
            if(horas.length == 1){

                var time_start = new Date();
                var time_end = new Date();

                var foundHM = horas[0].split(':'); 
                var storedHM = fim.split(':'); 

                time_start.setHours(storedHM[0], storedHM[1], 0, 0)
                time_end.setHours(foundHM[0], foundHM[1], 0, 0)
                var miliseconds
                if(time_end > time_start)
                    miliseconds = time_end - time_start
                else miliseconds = time_start - time_end
 
                var minutes = miliseconds / 60000
                console.log(horas[0] + " - " + fim + " = " + minutes)

                if(minutes > maxReserva) minutes = maxReserva
                else if(minutes < 5) return res.json({"status": false})

                res.json({"status": true, limit: minutes})
            }else res.json({"status": true, limit: 120})

            
        }).catch(error => {
            res.json({"status": false})
        })
    },

    async minutosDisponiveis(req, res){

      const { nsala } = req.params

      const data = Uteis.todayDate()
      const fim = Uteis.horasAtuais()

      var roundDown = function(num){
        var full = num.toString();
        var reg = /([\d]+)/i;
        var res = reg.exec(full);
        return res[1];
    }

      var maxReserva = 120 // 2 horas

      const sala = await Sala.findByPk(nsala)

      if(sala){
        Reserva.findAll({
          attributes: ['horainicio'],
          where: {
            datareserva: {
              [Op.eq]: data,
            },
            estado: {
              [Op.ne]: 0
            },
            horainicio: {
              [Op.gte]: fim
            },
            nsala: {
              [Op.eq]: nsala
            }
          },
          order: [
            ['horainicio', 'ASC'],
            ['datareserva', 'ASC']
          ],
          limit: 1,
          include: [
            { association: 'sala', attributes: [['sala', 'nomesala'], 'intervalolimpeza']},
          ]
        }).then(result => {
            const horas = result.map(hora => hora.horainicio)
            const intervalo = sala.intervalolimpeza
  
            console.log("------------- Minutos -------------")
            console.log("intervalo:" + intervalo)
  
            if(horas.length == 1){
  
                var time_start = new Date();
                var time_end = new Date();
  
                var foundHM = horas[0].split(':'); 
                var storedHM = fim.split(':'); 
  
                time_start.setHours(storedHM[0], storedHM[1], 0, 0)
                time_end.setHours(foundHM[0], foundHM[1], 0, 0)
                var miliseconds
                if(time_end > time_start)
                    miliseconds = time_end - time_start
                else miliseconds = time_start - time_end
  
                var minutes = miliseconds / 60000
                console.log(horas[0] + " - " + fim + " = " + minutes + " - " + intervalo)
                minutes = minutes - intervalo
                console.log(minutes)
  
                if(minutes > maxReserva) minutes = maxReserva
                else if(minutes < 15) return res.json({"status": false, "motivo": "tempo"})
  
                if(!(Uteis.horasAtuais() > moment("09:00", "HH:mm").format("HH:mm") && Uteis.horasAtuais() < moment("20:00", "HH:mm").format("HH:mm"))){
                  return res.json({"status": false, "motivo": "estabelecimento"})
                }
  
                if(Uteis.addMinutes(Uteis.horasAtuais(), minutes) > moment("20:00", "HH:mm").format("HH:mm")){
  
                  var atuais = new Date(Date.parse(moment(Uteis.horasAtuais(), "HH:mm")));
                  var fecho = new Date(Date.parse(moment("20:00", "HH:mm")));
                  var diffMs = (fecho - atuais);
                  var diffHrs = roundDown((diffMs % 86400000) / 3600000);
                  var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000) + (diffHrs * 60);
                  
                  console.log(diffMins);
                  var minutes = parseInt(diffMins) - parseInt(intervalo)
                  console.log(minutes);
    
                  if(minutes < 15) return res.json({"status": false, "motivo": "tempo"})
    
                  return res.json({"status": true, limit: minutes})
    
                }
  
                return res.json({"status": true, limit: minutes})
                
            }else{
              
              console.log(Uteis.addMinutes(Uteis.horasAtuais(), 120))
              console.log(">")
              console.log(moment("20:00", "HH:mm").format("HH:mm"))
  
              if(!(Uteis.horasAtuais() > moment("09:00", "HH:mm").format("HH:mm") && Uteis.horasAtuais() < moment("20:00", "HH:mm").format("HH:mm"))){
                return res.json({"status": false, "motivo": "estabelecimento"})
              }
  
              if(Uteis.addMinutes(Uteis.horasAtuais(), 120) > moment("20:00", "HH:mm").format("HH:mm")){
  
                var atuais = new Date(Date.parse(moment(Uteis.horasAtuais(), "HH:mm")));
                var fecho = new Date(Date.parse(moment("20:00", "HH:mm")));
                var diffMs = (fecho - atuais);
                var diffHrs = roundDown((diffMs % 86400000) / 3600000); // hours
                var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000) + (diffHrs * 60);
  
                console.log(diffMins);
                var minutes = parseInt(diffMins) - parseInt(intervalo)
                console.log(minutes); 
  
                if(minutes < 15) return res.json({"status": false, "motivo": "tempo"})
  
                return res.json({"status": true, limit: minutes})
  
              }else return res.json({"status": true, limit: 120})
            }
  
            
        }).catch(error => {
            console.log(error)
            return res.json({"status": false, "motivo": "estabelecimento"})
        })
      }else return res.json({"status": false, "motivo": "estabelecimento"})


  },

    async extendReserva(req, res){
        const { nreserva } = req.params
        const { horafim, intervalo } = req.body

        console.log(horafim)
        console.log(intervalo)

        const fimreserva = Uteis.removeMinutes(horafim, intervalo)

        sequelize.query("UPDATE reservas SET horafim = '" + horafim + "', fimreserva = '" + fimreserva + "' WHERE nreserva = '" + nreserva + "'").then(results => {
            res.json(true)  
          }).catch(err => {
            res.json(false)
          }); 
    },

    async atualizarAutomatico(req, res){


      return new Promise(function(resolve, reject) {       
 
        const dataHoje = Uteis.todayDate()
        
        Reserva.findAll({
          attributes:['nreserva', 'nsala', 'horainicio', 'horafim', 'fimreserva', 'estado'],
          where: {
            datareserva: {
              [Op.eq]: dataHoje
            },
            estado: {
              [Op.notIn]: [0]
            }
          },
          order: ['nsala'],
          include: [
            { association: 'sala', attributes: ['nestado'], where: {nestado: {[Op.notIn]: [6]}}},
          ]
        }).then(results => {

          var salas = results.map(reserva => reserva.nsala)
          var n = salas.length
          n = Uteis.removeDuplicates(salas, n)
          var format = 'HH:mm'

          for(var i = 0; i < n ; i++){
            var disponivel = false
            var limpeza = false
            var ocupado = false
            console.log("A procura na sala: " + salas[i])
            results.map(reserva => {

              var atuais = moment(Uteis.horasAtuais(), format).format(format)
  
              if(atuais > reserva.horafim && reserva.nsala == salas[i]){
                /* Se o estado da sala for nao disponivel ou limpa ou limpa e desinfectada então atualiza */
                if(reserva.sala.nestado != 2 && reserva.sala.nestado != 3){
                  console.log("Passei em disponivel")
                  var nreserva = reserva.nreserva
                  if(reserva.estado != 0) Reserva.update({ estado: 2 }, {where: { nreserva }})
                  disponivel = true
                }
  
              }else if(atuais > reserva.fimreserva && atuais < reserva.horafim && reserva.nsala == salas[i]){
                /* Se o estado da sala ainda não estiver no estado de aguarda limpeza então atualiza */
                console.log("Passei em limpeza")
                var nreserva = reserva.nreserva
                if(reserva.estado != 0) Reserva.update({ estado: 2 }, {where: { nreserva }})
                limpeza = true             
              }else if(atuais >= reserva.horainicio && atuais <= reserva.fimreserva && reserva.nsala == salas[i]){
                /* Se o estado da sala ainda não estiver a ocupado então atualiza */
                console.log("Passei em ocupado")
                var nreserva = reserva.nreserva
                if(reserva.estado != 0) Reserva.update({ estado: 3 }, {where: { nreserva }})
                ocupado = true 
              }
  
            })

            if(disponivel && !limpeza && !ocupado){
              console.log("Posso passar a disponivel " + salas[i])
              var nsala = salas[i]
              try {
                Sala.update({ nestado : 1 }, { where : { nsala }})
                console.log("Atualizei a sala " + nsala + " para Disponivel")
              } catch (error) {
                console.log(error)
                reject(false);
              }
            }else if(limpeza && !ocupado){
              console.log("Posso passar a aguarda limpeza " + salas[i])
              var nsala = salas[i]
              try {
                Sala.update({ nestado : 4 }, { where : { nsala }})
                console.log("Atualizei a sala " + nsala + " para Aguarda Limpeza")
              } catch (error) {
                console.log(error)
                reject(false);
              }
            }else if(ocupado){
              console.log("Posso passar a ocupado " + salas[i])
              var nsala = salas[i]
              try {
                Sala.update({ nestado : 5 }, { where : { nsala }})
                console.log("Atualizei a sala " + nsala + " para Ocupada")
              } catch (error) {
                console.log(error)
                reject(false);
              }
            }

          }

          resolve(true);

        }).catch(error => {
          console.log(error)
          reject(false)
        })
      });
    },

    async estadoReuniao(req, res){
      
      return res.send(true)

    },

    async editarHorasReserva(req, res) {
      const { horainicio, horafim, nreserva } = req.body

      const reserva = await Reserva.findByPk(nreserva)

      if(reserva != null){
        Sala.findByPk(reserva.nsala).then(sala => {
          var minutes = sala.intervalolimpeza
          var fimreserva = Uteis.removeMinutes(horafim, minutes)
          var hInicio = String(horainicio).padStart(5, '0')
          var hFim = String(horafim).padStart(5, '0')

            Reserva.update({horainicio: hInicio, horafim: hFim, fimreserva: fimreserva}, {where: {nreserva: nreserva}}).then(results => {
              console.log("Atualizado")
            }).catch(err => {
              console.log(err)
            }); 
        
          }).then(result => {
            return res.send(true)
          }).catch(error => {
            return res.send(false)
          })
      }

    },

    async atualizarPedidos(req, res){
      return new Promise(function(resolve, reject) {
        Pedido.findAll({
          where: {
            terminado: {
              [Op.eq]: 'aguarda'
            }
          }
        }).then(result => {
          result.forEach(pedido => {
            if(Uteis.horasAtuais() > pedido.horafim && pedido.data === Uteis.todayDate()){
              const n = pedido.npedido
              const descricao = 'O pedido não obteve nenhuma atualização de finalização.'
              Pedido.update({terminado: 'atraso', descricao: descricao}, {where: {npedido: n}}).then(result => {
                console.log("O pedido " + n + " foi atualizado para em atraso")
              }).catch(error => {
                console.log(error)
              })
            }
          })
          resolve(true)
        }).catch(error => {
          console.log(error)
          reject(false)
        })
      })
    },

    async notificarTodosUsers(req, res){

      const { nestabelecimento } = req.params
      const { tipo, title, message } = req.body

      const query = `
      SELECT tokenfirebase
      FROM Utilizadores INNER JOIN Users_Estabelecimentos 
        ON  Utilizadores.nUtilizador = Users_Estabelecimentos.nUtilizador
      WHERE nestabelecimento = '` + nestabelecimento + `' AND tokenfirebase IS NOT NULL
      ` 

      sequelize.query(query).then(results => {
        const array = results[0].map(result => result.tokenfirebase)
        results[0].forEach(token => {

            const data = {
              tokenId: token.tokenfirebase,
              title: title,
              message: message
            }
  
             Notification.sendPushToOneUser(data);
             Notificacao.create({
                 nutilizador: nutilizador, 
                 ntipo: parseInt(tipo), 
                 titulo: title, 
                 descricao: message, 
                 datahora: new Date(), 
                 permanencia: 24})
                }).then(result => {
                  console.log("Notificação adicionada a base de dados.")
                }).catch(error => {
                  console.log(error)
                })
        res.json({"success": true, data: "Os utilizadores com um token valido foram notificados"})
      }).catch(error => {
        res.json({"success": false, data: 0, "error": error})
      })

  },

  async promiseNotificarAtivacao(nsala, tipo, title, message){

    return new Promise(function(resolve, reject) {

      const query = `
        SELECT DISTINCT tokenfirebase, Utilizadores.nutilizador
        FROM Utilizadores INNER JOIN Users_Estabelecimentos 
          ON  Utilizadores.nUtilizador = Users_Estabelecimentos.nUtilizador INNER JOIN Salas
            ON Users_Estabelecimentos.nEstabelecimento = Salas.nEstabelecimento
        WHERE nsala = ` + nsala + ` AND tokenfirebase IS NOT NULL
        ` 

      console.log("A notificar utilizadores.")

      sequelize.query(query).then(results => {
          results[0].forEach(item => {

            console.log(item.tokenfirebase)
  
          const data = {
            tokenId: item.tokenfirebase,
            title: title,
            message: message
          }

          console.log(data)
  
           Notification.sendPushToOneUser(data);
           Notificacao.create({
               nutilizador: item.nutilizador, 
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
        console.log(error)
        reject(false)
      })
    })


  },

}