const multer = require("multer");
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("Apenas é possivel submeter imagens.", false);
  }
};

var storageUser = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

var storageSala = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/salas/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

var uploadUser = multer({ storage: storageUser, fileFilter: imageFilter });
var uploadSala = multer({ storage: storageSala, fileFilter: imageFilter });

module.exports = {
  uploadUser,
  uploadSala
}