require("dotenv").config(); // use enviroment variables coming from a .env file. We use this to hide sensible information in the code which would be otherwise exposed to github. We can then use them with process.env.VARIABLE_NAME
const key = 'qGBPWsu4YOtu+jSqHsTBfjj0bLW+FML48ZyjF1BG5vy5VAicyzWEx7Lz'; // API Key
const secret = '1xyb8Y5Wdoqm8N51IZkD+GTyVD2yEXEAAEA3OjQ0ekwb85870j0sKebvHONc2nK7gL2Wd5S/kiKT2N7mgH3+ZA=='; // API Private Key
const KrakenClient = require('kraken-api');
const kraken = new KrakenClient(key, secret);

const express = require("express");
var cors = require("cors"); // Since our frontend runs on a different port than the backend, we need to deactivate CORS on the server (here). Because of security this is usually blocked. Requests from eg. Facebook.com, should not go to google.com (could be risky)
const axios = require("axios"); // Library to make HTTP request easier
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const saltRounds = 10;
const app = express(); // Initatinate our express app
const port = process.env.PORT || 8080; // When there is a environemnt variable called PORT - use it, otherwise fallback to 8080
const mongoose = require('mongoose'); // ORM (object relational model) layer to communicate with the operating system agnostic mongodb. Translates mongo-language into javascript.

main().catch(err => console.log(err)); // if mongo connection fails, it fuckes up here and prints the error
async function main() {
  await mongoose.connect('mongodb://localhost:27017/crypto'); // try to connect to the mongo protocol url connection string.
  //                     PROTOCOL://HOST:     PORT/ DB_NAME
  // protocoll can be compared with eg. http://... ftp://... https://... - mongodb://...
}
const cryptoSchema = new mongoose.Schema({ // we define how our data looks like. Like a blueprint (Schema) you define which fields you want to have and what type they gonna be
  name: String, // other datatypes could be Boolean, Float, Date, Geospital
  price: Number // mongodb is strictly typed. Eg. if you try to save a price with the value "hello", mongo tells you that price should NOT bet a string, it should be a Number
});
const Crypto = mongoose.model('Crypto', cryptoSchema); //Instatinate the Model from the Schema. With this Object (Crypto) you will make your database transactions. Like: Crptyo.save(), Crypto.new(), Crypto.removeAll()
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
const User = mongoose.model('User', userSchema);
const historicalCryptoSchema = new mongoose.Schema({ // we define how our data looks like. Like a blueprint (Schema) you define which fields you want to have and what type they gonna be
  date: Date,
  currencies: [{
    name: String, // other datatypes could be Boolean, Float, Date, Geospital
    price: Number // mongodb is strictly typed. Eg. if you try to save a price with the value "hello", mongo tells you that price should NOT bet a string, it should be a Number
  }]
});
const HistoricCryptos = mongoose.model('HistoricCryptos', historicalCryptoSchema);

// Middlewares - tell express to use certain libraries or configuration what you need for your app
app.use(cors()); // Tell express to ignore the CORS security feature
app.use(express.json()); //Used to parse JSON bodies
app.use(express.urlencoded()); //Parse URL-encoded bodies

app.use((req, res, next) => { // Define a express middleware that logs the req.method, the date and the path
  console.log("Exress got a ", req.method, " request at " + Date.now() + " from " + req.url)
  next() // tell express not to stop here, tell it to continue with the next middlware/route/stuff/ whatever
})

const dir = `${__dirname}/currencyThreshold`;

const getPricesFromAPI = async () => {
  const response = await axios.get(
    "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=20&convert=EUR",
    {
      headers: {
        "X-CMC_PRO_API_KEY": process.env.API_KEY, // use one of our evnironment variables as API key so that this one is not hardcoded on github - nobody can steal our credentials
      },
    }
  );
  return response;
};

const getSavedThresholds = async () => {
  const cryptos = await Crypto.find() // ask our mongomodel to retrieve ALL records it can find in this collection
  return cryptos;
};

app.get("/prices", async (req, res) => { // define a get route with the /prices path: http://localhost:8080/prices
  try { // opens a try/catch block which helps us with handling errors gracefully
    let token = req.headers.authorization // get the token out of the req header (where you send it with fetch)
    var decoded = jwt.verify(token, 'super_secure_hash_to_harden_the_token'); // check if the token signature is valid - otherwise throw error and jump in catch statement
    console.log(`The decoded token is`, decoded)
    if (token !== "") { // if token is present and valid respond with data to frontend
      const response = await getPricesFromAPI();
      const currencies = await getSavedThresholds();
      res.json({ currencies: currencies, prices: response.data });
    } else {
      res.json(`UNAUTHENTICATED`)
    }
  } catch (error) { // when the try block fails, it catches the error and prints it in a structred way below in the catch block
    console.error(error);
    res.json(error); // return the error as json to the frontend to evtl. display it on the page
  }
});

app.post("/setthreshhold", async (req, res) => { // define a post route with the /setthreshol path: POST http://localhost:8080/setthreshold
  try {
    let cryptoToSave = await Crypto.findOne({ name: req.body.currency })
    if (cryptoToSave) {
      cryptoToSave.price = req.body.value
    } else {
      cryptoToSave = new Crypto({ name: req.body.currency, price: req.body.value }) // receive the post body and create a new database record with the values.
    }
    await cryptoToSave.save() //save the database record. Its async - you need to wait. You want to make your code be blocking the next operation before continueing
    res.json({ message: `successfully saved ${req.body.currency}` });
  } catch (err) {
    console.error(err);
  }
});
app.post("/register", async (req, res) => {
  let userToRegister = await User.findOne({ email: req.body.email })
  if (userToRegister) {
    res.json({ message: ` ${req.body.email} already registered` });
  } else {
    bcrypt.hash(req.body.password, saltRounds, async function (err, hash) {
      // Store hash in your password DB.
      await User.create({ email: req.body.email, password: hash })
      res.json({ message: `successfully saved ${req.body.email}` });
    });
  }
})
app.post("/login", async (req, res) => {
  let userToLogin = await User.findOne({ email: req.body.email }) // somebody wants to login and we try to find this user by email
  if (userToLogin) {
    bcrypt.compare(req.body.password, userToLogin.password, function (err, bcryptRes) { // we have a user in the DB and a user that wants to login. Bcrypt can compare a plaintext password (req.body.password) with the hash that we saved in the DB
      if (err) {
        console.error(err)
      }
      if (bcryptRes) { // If there is no error, lets create a token with a small payload ({ email: userToLogin.email }) and a secure key (like salt)
        console.log(`Pw match`)
        var token = jwt.sign({ email: userToLogin.email }, 'super_secure_hash_to_harden_the_token'); // creates a token with a payload and private_key
        console.log(`token`, token)
        return res.json({ token }); // send token back to client (react app)
        // TODO generate a valid and fresh JWT token and respond it to the user
      } else {
        console.log(`Pw DO NOT match`)
        return res.json({ success: false, message: 'passwords do not match' });
      }
    });
  } else {
    res.json({ message: ` ${req.body.email} already registered` });
  }
})
setInterval(async () => {
  const response = await getPricesFromAPI();
  await HistoricCryptos.create({
    date: Date.now(),
    currencies: response.data.data.map(c => ({ name: c.name, price: c.quote.EUR.price }))
  })
  const thresholds = await getSavedThresholds();
  thresholds.map(async (localSavedCurrency) => {
    const cryptoToCompare = response.data.data.find(
      (apiCurr) => localSavedCurrency.name === apiCurr.name
    );
    if (cryptoToCompare.quote.EUR.price < Number(localSavedCurrency.price)) { //TODO make two thresholds, to check if you want to sell of buy
      console.log(localSavedCurrency.name + " you shall buy now!!!!");
      try {
        const response = await axios.post(
          `https://api.telegram.org/${process.env.TELEGRAM_API_KEY}/sendMessage`, { chat_id: process.env.CHAT_ID, text: localSavedCurrency.currency + " you shall buy now!!!!" });

        var value = await kraken.api('AddOrder', {
          pair: 'XDGEUR', //TODO sell or buy the crypto-fiat pair which is in the threshold => ETHEUR, EURETH, EURBT, EURDG
          type: "sell", // TODO if under threshold buy, if over sell
          ordertype: 'limit',
          volume: 50, // TODO if the threshold is super under - buy a lot. If its over sell a lot. Calculate how much of the crypto you want to sell/buy
          price: 0.20, // TODO adjust  the price 
          validate: true // TODO remove for REAL trading
        });

        var arrays = JSON.stringify(value);
        console.log(arrays);

      } catch (error) {
        console.log(error)
      }
    } else {
      console.log(localSavedCurrency.name + " is not under our threshold");
    }
  });
  console.log("    ");
}, process.env.INTERVAL);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
