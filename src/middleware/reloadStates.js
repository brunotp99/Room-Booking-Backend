const cron = require('node-cron');
const AlgoritmosController = require('../controllers/AlgoritmosController');
const ReservaController = require('../controllers/ReservaController');

module.exports = { runEstados, runPedidos, runNotificacoes }

function runEstados() {
    //Atualiza os estados a cada minuto
    cron.schedule("* * * * *", function() {
        console.log("Atualização de estados em curso...")
        AlgoritmosController.atualizarAutomatico()
            .then((res) => console.log("Estados atualizados com sucesso!"))
            .catch((err) => console.log("Occorreu um problema ao atualizar os estados"))
    });

}

function runPedidos() {
    //Atualiza os pedidos a cada minuto
    cron.schedule("* * * * *", function() {
        console.log("Atualização dos pedidos em curso...")
        AlgoritmosController.atualizarPedidos()
            .then((res) => console.log("Pedidos atualizados com sucesso!"))
            .catch((err) => console.log("Occorreu um problema ao atualizar os pedidos"))
    });

}

function runNotificacoes() {
    //Verifica a existencia de notificacoes a cada 5 minutos
    cron.schedule("*/5 * * * *", function() {
        console.log("Verificação da existencia de utilizadores a notificar.")
        ReservaController.reservasEmBreve()
            .then((res) => console.log("Notificacoes verificadas com sucesso!"))
            .catch((err) => console.log("Occorreu um problema ao verificar as notificacoes"))
    });

}
