const express = require('express')
var cors = require('cors')
 
const axios = require('axios')
const app = express()
const port = 8080
app.use(cors())

app.get('/prices', async(req, res) => {
//TODO the coin price api call
    try {
      const response = await axios.get('https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=20&convert=EUR',{
        headers: {
          "X-CMC_PRO_API_KEY": "3484a1fc-bf64-4206-9f73-2592b24719df",
        },
      });
      console.log(response);
      res.json(response.data)
    } catch (error) {
      console.error(error);
      res.json(error)

    }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})