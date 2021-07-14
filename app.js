const express = require("express");
const axios = require("axios");
const PORT = process.env.PORT || 3002;
const cors = require("cors");
const cheerio = require("cheerio");
const stateData = require("./doc.json");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const moment = require('moment')
const gb=require('./global.json')

require("./db");

const cron = require("node-cron");
const { sendEmail } = require("./controllers/email.controller");
// cron.schedule("1 * * * *", () => {
//   axios
//     .get("https://current-fuel-price.herokuapp.com/diesel/updateNewPrice")
//     .then((result) => {
//       console.log(result);
//       sendEmail;
//     });
// });

setInterval(() => {
  let now = moment(moment().format("hh:mma"), "hh:mma");
  // let beginningTime = moment("3:00pm", "hh:mma");
  // let endTime = moment("4:00pm", "hh:mma");
  let beginningTime = moment("2:00am", "hh:mma");
  let endTime = moment("3:00am", "hh:mma");
  if (now.isAfter(beginningTime) && now.isBefore(endTime)) {
    axios.get(gb.localBaseUrl + "diesel/updateNewPriceAuto").then((result) => {
      console.log(result);
      sendEmail;
    }).catch(error=>{
      console.log(error)
    });
  } else {
    console.log("not the time");
  }
  console.log(now);
  },720000)
// }, 10000);

//  var cron = require("node-cron");

//  cron.schedule(
//    "0 1 * * *",
//    () => {
//      console.log("Running a job at 01:00 at Asia/Kolkata timezone");
//    },
//    {
//      scheduled: true,
//      timezone: "Asia/Kolkata",
//    }
//  );



let jsonData;

const app = express();
app.use(express.static("public"));

app.use(cors());
app.use(morgan("dev"));
app.set("view engine", "ejs");
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
app.get("/sendmail", (req, res) => {
  sendEmail;
});

app.use("/user", require("./routes/user"));
app.use("/diesel", require("./routes/diesel"));
app.use("/calculator", require("./routes/calculator"));
app.get("/last_days/:dayCount", (req, res) => {
  let day;
  if (req.params.dayCount <= 0) {
    day = 1;
  } else {
    day = req.params.dayCount;
  }
  axios
    .get(
      "https://www.bankbazaar.com/fuel/fetchCommodityPriceHistory.html?landingPageNamespace=fuel/diesel-price-punjab&daysCount=" +
        day
    )
    .then((result) => {
      if (result) {
        // console.log(result.data)
        let data = result.data;
        let disel = data.Diesel;
        res.send(disel);
      }
    });
});

app.get("/fuel_price", (req, res) => {
  axios
    .get("https://www.bankbazaar.com/fuel/diesel-price-punjab.html")
    .then((result) => {
      let x = result.data;
      let pos = x.search("bigfont");
      let data = x.substring(pos + 18, pos + 23);
      res.send({ price: data });
    });
});

app.get("/", (req, res) => {
  let stateName;
  let states;

  axios
    .get("https://www.bankbazaar.com/fuel/diesel-price-india.html")
    .then((result) => {
      const $ = cheerio.load(result.data);
      const scrappedData = [];

      $("#grey-btn > div > div > table > tbody > tr").each((index, element) => {
        const city = $(element).find("a").text();
        const price = $($(element).find("td")[1]).text();

        const tableRow = { city, price };
        scrappedData.push(tableRow);
      });
      jsonData = JSON.parse(JSON.stringify(scrappedData));
      states = stateData;
      stateName = Object.keys(states);
      //  res.render('pages/oil-prices', { keys: stateName })
      res.render("pages/home", { keys: stateName });
    });
});

app.post("/fuel_price_by_state", async (req, res) => {
  //   console.log(jsonData);
  const states = stateData;
  const allCities = JSON.parse(JSON.stringify(jsonData));
  allCities.splice(0, 1);

  const stateNames = Object.keys(states); //list of states from json file
  const stateName = req.body.selectpicker; //state name from url body , from user request
  const stateWiseCities = states[stateName]; // statewise cities
  const scrappedData = [];
  const stateWiseCityFuelPrices = [];

  await axios
    .get("https://www.bankbazaar.com/fuel/diesel-price-" + stateName + ".html")
    .then((result) => {
      let x = result.data;
      let pos = x.search("bigfont");
      let data = x.substring(pos + 18, pos + 23);
      const state = stateName;
      const price = data;
      const tableRow = { state, price };
      scrappedData.push(tableRow);
    });

  for (let i = 0; i < stateWiseCities.length; i++) {
    let cityVal = stateWiseCities[i].toUpperCase();
    const result = allCities.find(({ city }) => city === cityVal);
    stateWiseCityFuelPrices.push(result);
  }
  res.json({
    stateWithPrice: scrappedData,
    cityWithPrice: stateWiseCityFuelPrices,
  });
  // res.render('pages/oil-price-by-state', { stateWithPrice: scrappedData, cityWithPrice: stateWiseCityFuelPrices })
});

app.listen(PORT, () => {
  console.log("App is running at", PORT);
});
