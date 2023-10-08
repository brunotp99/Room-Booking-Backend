const express = require('express');
const router = express.Router();
const fs = require("fs");
//Upload System
const uploadController = require("../controllers/UploadController");
const { uploadUser, uploadSala } = require("../middleware/upload");
const middleware = require("../middleware/jsonWebToken");

router.post("/upload/:nutilizador", uploadUser.single("file"), uploadController.uploadFiles)
router.post("/sala/upload/:nsala", uploadSala.single("file"), uploadController.uploadSala)
router.get("/sala/image/:nome", uploadController.obterSala)

router.get('/image/:nome', function (req, res) {    
    const img = req.params
    console.log(img.nome)
    fs.readFile('uploads/' + img.nome, function(err, data) {
          if(err) {
            fs.readFile('uploads/default.jpg', function(err, data) {
                if(err) res.send(false)
                else{
                  res.writeHead(200, {'Content-Type': 'image/jpeg'});
                  res.end(data); // Send the file data to the browser.
                }
            });
          }
          else{
            res.writeHead(200, {'Content-Type': 'image/jpeg'});
            res.end(data); // Send the file data to the browser.
          }
      });
});

router.get('/file/bulk', (req, res) => {
  const file = 'downloads/bulkInsert.xlsx';
  res.download(file);
})

router.get('/file/mobile', (req, res) => {
  const file = 'downloads/softinsaMobile.apk';
  res.download(file);
})

router.get('/file/tablet', (req, res) => {
  const file = 'downloads/softinsaTablet.apk';
  res.download(file);
})

module.exports = router