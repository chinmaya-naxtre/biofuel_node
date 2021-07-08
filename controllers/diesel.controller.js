const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment");
const { cityDb, stateDb } = require("../db");
const stateData = require("../doc.json");
const globalVar = require("../global.json");
const { calculateBioFuel } = require("./common.controller");

const getCityData = (city) => {
  return new Promise((resolve, reject) => {
    cityDb.find({ city: city }).exec(async (error, records) => {
      let obj;
      if (records.length > 0) {
        let price = records[0].price;
        const bioDieselCityPrice = await calculateBioFuel(price);
        obj = {
          cityPrice: records[0].price,
          bioDieselCityPrice: bioDieselCityPrice,
        };
      } else {
        obj = { cityPrice: "0.00", bioDieselCityPrice: "0.00" };
      }

      resolve(obj);
    });
  });
};

module.exports = {
  loadStateDieselPrice: async (req, res) => {
    let today = moment().format("DD-MM-YYYY");
    const states = stateData;
    const stateNames = Object.keys(stateData);
    let responseData;
    stateDb.find({ date: today }, async function (err, docs) {
      // console.log(docs);
      if (docs.length === 0) {
        for (let i = 0; i < stateNames.length; i++) {
          const stateName = stateNames[i];
          let cities = states[stateName];

          await axios
            .get(
              "https://www.bankbazaar.com/fuel/diesel-price-" +
                stateName +
                ".html"
            )
            .then((result) => {
              let x = result.data;
              let pos = x.search("bigfont");
              let data = x.substring(pos + 18, pos + 23);
              const state = stateName.toLocaleUpperCase();
              let dieselPrice = data;

              if (dieselPrice.includes("<")) {
                dieselPrice = dieselPrice.slice(0, dieselPrice.length - 1);
              }

              const stateCities = cities;

              stateDb.insert({
                state,
                cities,
                dieselPrice,
                date: today,
              });
            });
        }

        responseData = {
          success: true,
          message: "New Data Inserted",
        };
      } else {
        responseData = {
          success: false,
          message: "No Data Inserted",
        };
      }

      res.status(200).json(responseData);
    });
  },

  loadDieselPriceByCity: (req, res) => {
    let scrappedData = [];
    let dieselPriceByCity;
    const states = stateData;
    const stateNames = Object.keys(states);
    let today = moment().format("DD-MM-YYYY");
    cityDb.find({ date: today }, function (err, docs) {
      if (docs.length === 0) {
        axios
          .get("https://www.bankbazaar.com/fuel/diesel-price-india.html")
          .then((result) => {
            const $ = cheerio.load(result.data);

            $("#grey-btn > div > div > table > tbody > tr").each(
              (index, element) => {
                const city = $(element).find("a").text();
                let price = $($(element).find("td")[1]).text();
                price = price.replace("₹", "").trim();

                const tableRow = { city, price };
                scrappedData.push(tableRow);
              }
            );
            dieselPriceByCity = JSON.parse(JSON.stringify(scrappedData));
            dieselPriceByCity.splice(0, 1);

            for (let i = 0; i < dieselPriceByCity.length; i++) {
              cityDb.insert({
                city: dieselPriceByCity[i].city,
                price: dieselPriceByCity[i].price,
                date: today,
              });
            }

            res.status(200).send({ message: "City price updated" });
          });
      } else {
        res.status(200).send({ message: "No price updated" });
      }
    });
  },
  getStateDieselPrice: async (req, res) => {
    let today = moment().format("DD-MM-YYYY");
    // console.log(today);
    await stateDb
      .find({ date: today })
      .sort({ state: 1 })
      .exec(async function (err, docs) {
        // console.log(docs);
        let data = [];
        for (const element of docs) {
          let city = element.cities[0];
          let cityPrice = await getCityData(city);
          let bioDieselPrice = await calculateBioFuel(element.dieselPrice);

          let newData = element;
          newData.bioDieselPrice = bioDieselPrice;
          newData.cityPrice = cityPrice.cityPrice;
          newData.biocityPrice = cityPrice.bioDieselCityPrice;
          newData.city = city;

          data.push(newData);
        }
        // console.log(data);
        await res.json(data);
      });
  },
  getCityDieselPrice: async (req, res) => {
    let today = moment().format("DD-MM-YYYY");
    cityDb.find({ date: today }, (err, data) => {
      if (err) {
        res.end();
        return;
      }

      res.json(data);
    });
  },

  getDieselPriceByCity: (req, res) => {
    let city = req.params.city;
    // console.log(city);
    let today = moment().format("DD-MM-YYYY");
    cityDb.find({ city: city, date: today }, async (error, result) => {
      // console.log(result);
      let data;
      if (result.length > 0) {
        let price = result[0].price;
        const bioDieselPrice = await calculateBioFuel(price);
        data = {
          success: true,
          data: {
            dieselPrice: price,
            bioDieselPrice: bioDieselPrice,
          },
        };
      } else {
        data = {
          success: false,
          message: "This City price can be access",
        };
      }
      res.status(200).send(data);
    });
  },

  updateNewPrice: (req, res) => {
    axios
      .get(globalVar.localBaseUrl + "diesel/loadDieselPriceByState")
      .then((result) => {
        if (result.status == 200) {
          console.log("ok");
          axios
            .get(globalVar.localBaseUrl + "diesel/LoadDieselPriceByCity")
            .then((result1) => {
              // console.log(result1.status);
              res
                .status(200)
                .send({ success: true, message: "Data updated for today" });
            })
            .catch((error) => {
              console.log(error);
            });
        }
      })
      .catch((error) => {
        console.log(error);
      });
  },
};
