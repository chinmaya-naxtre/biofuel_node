const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment");
const { cityDb, stateDb,localDb } = require("../db");
const stateData = require("../doc.json");
const globalVar = require("../global.json");
const { calculateBioFuel,calculateBioFuelPrice } = require("./common.controller");

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
    let responseData = {};
    stateDb.find({ date: today }, async function (err, docs) {
      if (docs.length > 0) {
        stateDb.remove(
          { date: today },
          { multi: true },
          function (err, numRemoved) {
            console.log(numRemoved);
          }
        );
      }
      stateDb.loadDatabase();
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
        message: "Price Updated",
      };

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
      if (docs.length > 0) {
        cityDb.remove(
          { date: today },
          { multi: true },
          function (err, numRemoved) {
            console.log(numRemoved);
          }
        );
      }
      cityDb.loadDatabase();
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
    });
  },

  getInitialPrice: async (req, res) => {
    let today = moment().format("DD-MM-YYYY");
    localDb.find({ _id: "1" }, async (err, result) => {
      if (err) {
        res.status(500).send({ message: err.message });
      } else {
        let gstPer = result[0].gst;
        await stateDb
          .find({ date: today })
          .sort({ state: 1 })
          .exec(async function (err, docs) {
            // console.log(docs);
            let data = [];
            for (const element of docs) {
              let bioDieselPrice = await calculateBioFuelPrice(
                element.dieselPrice
              );

              let newData = element;
              newData.bioDieselPrice = bioDieselPrice;
              newData.stateBioDieselPrice = bioDieselPrice.totalPrice;
              newData.gst=gstPer

              data.push(newData);
            }
            // console.log(data);
            await res.json(data);
          });
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
        const bioDieselPrice = await calculateBioFuelPrice(price);
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
          message: "This City price can not be access",
        };
      }
      res.status(200).send(data);
    });
  },

  updateNewPrice: (req, res) => {
    axios
      .get(globalVar.localBaseUrl + "diesel/loadDieselPriceByState")
      .then((result) => {
        console.log(result);
        if (result.status == 200) {
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

  searchStateCity: async (req, res) => {
    let keyword = req.params.keyword;
    let searchVal = new RegExp(keyword, "i");
    let stateSearch = [
      { state: { $regex: searchVal } },
      { cities: { $regex: searchVal } },
    ];
    let today = moment().format("DD-MM-YYYY");
    await stateDb
      .find({ $or: stateSearch })
      .sort({ state: 1 })
      .exec(async function (err, docs) {
        let data = [];
        for (const element of docs) {
          let bioDieselPrice = await calculateBioFuelPrice(element.dieselPrice);

          let newData = element;
          newData.bioDieselPrice = bioDieselPrice;
          newData.stateBioDieselPrice = bioDieselPrice.totalPrice;

          data.push(newData);
        }
        // console.log(data);
        await res.json(data);
      });
  },
};
