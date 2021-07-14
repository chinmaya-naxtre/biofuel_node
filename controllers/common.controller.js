const { localDb } = require("../db");
module.exports = {
  calculateBioFuel: (price) => {
    return new Promise((resolve, reject) => {
      localDb.find({}, (err, data) => {
        if (err) {
          reject(err);
        } else {
          let discount = Number(data[0].discount);
          let gst = Number(data[0].gst);
          let freight = Number(data[0].freight);
          let result = (Number(price) - discount + ((Number(price)-discount) * gst) / 100 + freight ).toFixed(2);
          resolve(result);
        }
      });
    });
  },

  calculateBioFuelPrice: (price) => {
    return new Promise((resolve, reject) => {
      localDb.find({}, (err, data) => {
        if (err) {
          reject(err);
        } else {
          let discount = Number(data[0].discount);
          let gst = Number(data[0].gst);
          let freight = Number(data[0].freight);

          let gstPrice = (((Number(price) - discount) * gst) / 100).toFixed(2)
          let res = {
            baseprice: Number(price) - discount,
            gst: gstPrice,
            freight: freight,
            totalPrice: (Number(price) - discount + Number(gstPrice) + freight).toFixed(2)
          };

          // let result = ( Number(price) - discount +  (Number(price) * gst) / 100 + freight ).toFixed(2);
          resolve(res);
        }
      });
    });
  },
};
