const express = require("express")
const axios = require("axios")
const PORT = process.env.PORT || 3002
const moment = require("moment")
const cors = require('cors')
const cheerio = require('cheerio')

const app = express()
app.use(cors())

app.get("/last_days/:dayCount", (req, res) => {
    let day
    if (req.params.dayCount <= 0) {
        day = 1
    } else {
        day = req.params.dayCount
    }
    axios.get("https://www.bankbazaar.com/fuel/fetchCommodityPriceHistory.html?landingPageNamespace=fuel/diesel-price-punjab&daysCount=" + day).then((result) => {
        if (result) {
            // console.log(result.data)
            let data = result.data
            let disel = data.Diesel
            console.log(disel)
            console.log(moment().format("YYYY MM DD"))
            res.send(disel)
        }
    })
})

app.get("/fuel_price", (req, res) => {
    axios.get("https://www.bankbazaar.com/fuel/diesel-price-punjab.html").then(result => {
        // console.log(result.data)
        let x = result.data
        let pos = x.search("bigfont")
        let data = x.substring(pos + 18, pos + 23)
        console.log(data)
        res.send({ price: data })
    })
})


app.get("/diesel_price", (req, res) => {
    axios.get("https://www.bankbazaar.com/fuel/diesel-price-india.html").then(result => {
        const $ = cheerio.load(result.data)
        const scrappedData = []

        $("#grey-btn > div > div > table > tbody > tr").each((index, element) => {

            const city = $(element).find("a").text()
            const price = $($(element).find("td")[1]).text()

            const tableRow = { city, price }
            scrappedData.push(tableRow)
        })
        let jsonData = JSON.parse(JSON.stringify(scrappedData))
        jsonData=jsonData.slice(1)
        res.send(jsonData)
    })
})

app.listen(PORT, () => {
    console.log("App is running at", PORT)
})