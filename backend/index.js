const express = require("express");
var cors = require("cors");
const fs = require("fs");
const axios = require("axios");
const app = express();
const port = 8080;
app.use(cors());
app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded()); //Parse URL-encoded bodies

app.get("/prices", async (req, res) => {
  //TODO the coin price api call
  try {
    const response = await axios.get(
      "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=20&convert=EUR",
      {
        headers: {
          "X-CMC_PRO_API_KEY": "3484a1fc-bf64-4206-9f73-2592b24719df",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.json(error);
  }
});

app.post("/setthreshhold", async (req, res) => {
  try {
    const dir=`currencyThreshold`
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
