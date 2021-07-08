const { localDb } = require("../db");
module.exports = {
  calculateBioFuel: (price) => {
    console.log(price);
    return new Promise((resolve, reject) => {
      localDb.find({}, (err, data) => {
        // console.log(data)
        if (err) {
          reject(err);
        } else {
          let discount = Number(data[0].discount);
          let gst = Number(data[0].gst);
          let freight = Number(data[0].freight);
          let result = (
            Number(price) -
            discount +
            (Number(price) * gst) / 100 +
            freight
          ).toFixed(2);
          resolve(result);
        }
      });
    });
  },
};
