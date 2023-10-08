var nodemailer = require('nodemailer');
const Utilizador = require('../models/Utilizador');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const template = require('../config/smtp')

module.exports = {
    async envio_recuperacao(req, res) {

        console.log("A executar pedido de recuperação de palavra-passe")

        const { email } = req.body
        var nome = email.substring(0, email.lastIndexOf("@"));
        
        var unencrypted = Math.random().toString(36).slice(-8);
        var password = unencrypted

        const user = await Utilizador.findOne({where: {email}})

        if(user == undefined)
            return res.json({success: false, message: 'Desculpe, não encontramos nenhum utilizador com o email fornecido.'});

        Utilizador.findOne({
            where: {email}
        }).then(result => {
            bcrypt.hash(password, 10)
            .then(hash => {
                password = hash;
                result.update({ password: password, verifypassword: 0 })
                var transporter = nodemailer.createTransport({
                    host: "webdomain04.dnscpanel.com",
                    port: 465,
                    auth: {
                        user: process.env.SMTP_USERNAME,
                        pass: process.env.SMTP_PASSWORD,
                    }
                });
            
                var mailOptions = {
                    from: process.env.SMTP_USERNAME,
                    to: email,
                    subject: 'appSoftinsa - Recuperação da palavra-passe',
                    html: template.recuperacao(nome, unencrypted),
                };
            
                transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    return res.json({success: true, "Email enviado": info.response});
                }
                });
            })
            .catch(error => {
                console.log("Erro Bcrypt: " + error);
                return  res.json({success: false, message: 'Desculpe, não foi póssivel efetuar o pedido de recuperação da palavra-passe.'});
            });
        })
        .catch(error => {
            console.log("Erro: " + error);
            return res.json({success: false, message: 'Desculpe, não encontramos nenhum utilizador com o email fornecido.'});
        })

    },

    async primeiro_registo(infos) {

        return new Promise(function(resolve, reject) {

            infos.map(data => {

                var email = data.email
                var password = data.password

                var transporter = nodemailer.createTransport({
                    host: "webdomain04.dnscpanel.com",
                    port: 465,
                    auth: {
                        user: process.env.SMTP_USERNAME,
                        pass: process.env.SMTP_PASSWORD
                    }
                });
            
                var mailOptions = {
                    from: process.env.SMTP_USERNAME,
                    to: email,
                    subject: 'appSoftinsa - Bem-vindo a nossa aplicação!',
                    html: template.ativacao(data.utilizador, password),
                };
            
                transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                    console.log(error);
                } else {
                    console.log("Confirmação de registo enviada a " + email)
                }
                });
                
            })

            resolve(true);

        });

    }
    
}