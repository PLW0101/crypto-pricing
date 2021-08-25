require('dotenv').config()
const express = require("express");
var cors = require("cors");
const fs = require("fs");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 8080;
app.use(cors());
app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded()); //Parse URL-encoded bodies
const dir=`currencyThreshold`

app.get("/prices", async (req, res) => {
  //TODO the coin price api call
  try {
    const response = await axios.get(
      "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=20&convert=EUR",
      {
        headers: {
          "X-CMC_PRO_API_KEY": process.env.API_KEY,
        },
      }
    );
    let currencies = []
    fs.readdirSync(dir).forEach(file => {
      const content = fs.readFileSync(dir + `/` + file, {encoding: 'utf-8'})
      currencies.push({currency: file.replace("_threshold_price.txt",""), value: content})
    });
    res.json({currencies: currencies, prices: response.data});
  } catch (error) {
    console.error(error);
    res.json(error);
  }
});
console.log(process.env.API_KEY);

app.post("/setthreshhold", async (req, res) => {
  try {
    if (!fs.existsSync(dir)){
      fs.mkdirSync(dir, { recursive: true });
    }
    const fileWriteResponse = fs.writeFileSync(`./${dir}/${req.body.currency}_threshold_price.txt`, req.body.value);
    res.json({ message: "success" });
  } catch (err) {
    console.error(err);
  }  
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
