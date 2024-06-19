const multer = require("multer");

const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage }).array("image", 5);

module.exports = upload;
