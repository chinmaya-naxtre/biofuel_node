const jwt = require("jsonwebtoken");
const { adminDb } = require("../db");
module.exports = {
  authunticate: (req, res, next) => {
    const token = req.headers.authorization;
    console.log(token);
    jwt.verify(
      token,
      "iy68iy6uu76577uhyu86ykyu76jtr6jfdetuugf5y76y5yh",
      (err, decode) => {
        if (err) {
          res.status(401).send({ message: err.message });
        }else{
          const username = decode.username;
          adminDb.find({ username: username }, (err1, docs) => {
            if (err1) {
              res.status(500).send({ message: err1.message });
            } else {
              if (docs.length > 0) {
                next();
              } else {
                res.status(401).send({ message: "Session expired" });
              }
            }
          });
        }
        
      }
    );
  },
};
