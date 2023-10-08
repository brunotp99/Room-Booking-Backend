const express = require('express')
const routes = require('./routes')
const Uteis = require('./middleware/uteis')
const reloadStates = require('./middleware/reloadStates')
const Scheduled = require("./middleware/scheduleNotifications")
const cors = require('cors')
require('./database')

const port = process.env.PORT || 24023
const app = express()

app.use(cors())
app.use(express.json())
app.use(routes)

reloadStates.runEstados()
reloadStates.runPedidos()
reloadStates.runNotificacoes()

app.listen(port, () => {
    console.log('Servidor executado na porta: ' + port)
    console.log(Uteis.todayDate())
    console.log(Uteis.horasAtuais())
})
