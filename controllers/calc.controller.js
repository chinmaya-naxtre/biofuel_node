const { localDb } = require("../db");
const { calculateBioFuel } = require("./common.controller");

module.exports = {
  updateFormula: (req, res) => {
    localDb.update(
      { _id: "1" },
      {
        discount: req.body.discount,
        gst: req.body.gst,
        freight: req.body.freight,
        date: "08-07-2021",
      },
      (err, ress) => {
        console.log(ress);
        localDb.loadDatabase();
        if (ress > 0) {
          res.status(200).send({ message: "Updated" });
        } else {
          res.status(500).send({ message: "Somethings went wrong" });
        }
      }
    );
  },

  getFormulaDetails: (req, res) => {
    localDb.find({ _id: "1" }, (err, result) => {
      if (err) {
        res.status(500).send({ message: err.message });
      } else {
        res.status(200).send({
          message: "Data found",
          data: result[0],
        });
      }
    });
  },
  testCalculation: (req, res) => {
    let discount = Number(req.body.discount);
    let gst = Number(req.body.gst);
    let freight = Number(req.body.freight);
    let price = Number(req.body.baseprice);
    let result = (price - discount + (price * gst) / 100 + freight).toFixed(2);

    res.send({ result: result });
  },
};
