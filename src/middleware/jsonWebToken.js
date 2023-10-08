const jwt = require('jsonwebtoken'); //módulo NPM
const config = require('../config/jwtSecret'); //ficheiro de configuração
let checkToken = (req, res, next) => {

    let token = req.headers['x-access-token'] || req.headers['authorization'];

    console.log(token)

    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length); //remove a palavra 'Bearer '
    }
    if (token) {
        jwt.verify(token, config.jwtSecret, (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    message: 'Desculpe, a sua sessão foi exedida!'
                });
            } else {
                req.decoded = decoded;
                next();
            }
        });
    } else {

        return res.json({
            success: false,
            message: 'Token indisponível.'
        });
    }
};

module.exports = {
    checkToken: checkToken
}