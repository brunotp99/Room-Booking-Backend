const User = require('../models/Utilizador')
const Sala = require('../models/Sala')
const fs = require("fs");

const uploadFiles = async (req, res) => {

    const { nutilizador } = req.params

    if (req.file == undefined) {
      return res.send('Não foi submetido nenhum ficheiro.');
    }

    const updatedRows = await User.update(
        {
          imagem: req.file.filename,
        },
        {
          where: { nutilizador },
        }
      );
    console.log(updatedRows)
    return res.send(req.file.filename);
};

const uploadSala = async (req, res) => {

  const { nsala } = req.params

  if (req.file == undefined) {
    return res.send('Não foi submetido nenhum ficheiro.');
  }

  const updatedRows = await Sala.update(
      {
        imagem: req.file.filename,
      },
      {
        where: { nsala },
      }
    );
  if(updatedRows) return res.json({"success": true, message: req.file.filename});
  else return res.json({"success": false, message: req.file.filename});
};

const obterSala = async (req, res) => {

    const { nome } = req.params

    fs.readFile('uploads/salas/' + nome, function(err, data) {
        if(err) {
          fs.readFile('uploads/salas/defaultSala.jpg', function(err, data) {
              if(err) res.send(false)
              else{
                res.writeHead(200, {'Content-Type': 'image/jpeg'});
                res.end(data);
              }
          });
        }
        else{
          res.writeHead(200, {'Content-Type': 'image/jpeg'});
          res.end(data);
        }
    });

}

const uploadFilesSecure = async (req, res) => {

 const nutilizador = req.decoded.nuser

  if (req.file == undefined) {
    return res.send('Não foi submetido nenhum ficheiro.');
  }

  const updatedRows = await User.update(
      {
        imagem: req.file.filename,
      },
      {
        where: { nutilizador },
      }
    );
  console.log(updatedRows)
  return res.send(req.file.filename);
};

module.exports = {
  uploadFiles,
  uploadFilesSecure,
  obterSala,
  uploadSala
};