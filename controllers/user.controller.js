const { adminDb } = require("../db");
const jwt = require("jsonwebtoken");

module.exports = {
  login: (req, res) => {
    let username = req.body.username;
    let password = req.body.password;
    let token;
    username = username.toLowerCase();
    adminDb.find({}).exec((err, result) => {
      console.log(req.body);
    });
    adminDb.find(
      { username: username, password: password },
      function (err, docs) {
        // console.log(docs)
        let response;
        if (docs.length > 0) {
          let payload = { username: username };
          (token = jwt.sign(
            {
              username: username,
            },
            "iy68iy6uu76577uhyu86ykyu76jtr6jfdetuugf5y76y5yh"
          )),
            { expiresIn: "1h" };
          response = {
            success: true,
            message: "Login Successful",
            data: {
              username: username,
              token: token,
            },
          };
          res.status(200).send(response);
        } else {
          response = {
            success: false,
            message: "Login Failed",
          };
          res.status(401).send(response);
        }
      }
    );
  },
};
