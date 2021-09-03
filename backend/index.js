require("dotenv").config();
const express = require("express");
var cors = require("cors");
const fs = require("fs");
const axios = require("axios");
const app = express();
const port = process.env.PORT || 8080;
const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://localhost:27017/crypto');
}

const cryptoSchema = new mongoose.Schema({
  name: String,
  price: Number
});
const Crypto = mongoose.model('Crypto', cryptoSchema);
app.use(cors());
app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded()); //Parse URL-encoded bodies
const dir = `${__dirname}/currencyThreshold`;

const getPricesFromAPI = async () => {
  const response = await axios.get(
    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=20&convert=EUR",
    {
      headers: {
        "X-CMC_PRO_API_KEY": process.env.API_KEY,
      },
    }
  );
  return response;
};

const getSavedThresholds = async () => {
  let currencies = [];
  fs.readdirSync(dir).forEach((file) => {
    const content = fs.readFileSync(dir + `/` + file, { encoding: "utf-8" });
    currencies.push({
      currency: file.replace("_threshold_price.txt", ""),
      value: content,
    });
  });
  return currencies;
};

app.get("/prices", async (req, res) => {
  //TODO the coin price api call
  try {
    const response = await getPricesFromAPI();
    const currencies = await getSavedThresholds();

    res.json({ currencies: currencies, prices: response.data });
  } catch (error) {
    console.error(error);
    res.json(error);
  }
});

app.post("/setthreshhold", async (req, res) => {
  try {
    let cryptoToSave = new Crypto({name: req.body.currency, price: req.body.value})
    await cryptoToSave.save()
    res.json({ message: `successfully saved ${req.body.currency}` });
  } catch (err) {
    console.error(err);
  }
});

setInterval(async () => {
  const response = await getPricesFromAPI();
  const thresholds = await getSavedThresholds();
  thresholds.map(async (localSavedCurrency) => {
    const cryptoToCompare = response.data.data.find(
      (apiCurr) => localSavedCurrency.currency === apiCurr.name
    );
    
    if (cryptoToCompare.quote.EUR.price < Number(localSavedCurrency.value)) {
      console.log(localSavedCurrency.currency + " you shall buy now!!!!");
      try {
        const response = await axios.post(
          `https://api.telegram.org/${process.env.TELEGRAM_API_KEY}/sendMessage`,{chat_id: process.env.CHAT_ID, text: localSavedCurrency.currency + " you shall buy now!!!!"});
        
      } catch (error) {
        console.log(error)
      }
    } else {
      console.log(localSavedCurrency.currency + " is not under our threshold");
    }
  });
  console.log("    ");
}, process.env.INTERVAL);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
