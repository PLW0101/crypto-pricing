import logo from "./logo.svg";
import "./App.css";
import React, { useEffect, useState } from "react"; // import state and effekt hooks

function App() {
  const [data, setdata] = useState([]);
  const [loggedin, setloggedin] = useState(false);
  useEffect(() => {
    console.log("Hi");
    fetch(
      `http://0.0.0.0:8080/pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?start=1&limit=20&convert=EUR`,
      {
        headers: {
          "X-CMC_PRO_API_KEY": "3484a1fc-bf64-4206-9f73-2592b24719df",
        }
      }
    ) //async
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        setdata(res.data);
      });
  }, []);
  console.log(data);
  return (
    <div className="App">
      Hello you are {loggedin ? " logged in" : " logged out"}
      <button onClick={() => setloggedin(!loggedin)}>{loggedin ? " log out" : " login"}</button>
      {data.map((currency) => (
        <div>
          <h1>{currency.name}</h1>
          Price: <code>{currency.quote.EUR.price.toFixed(5)}</code> Euro
        </div>
      ))}
    </div>
  );
}

export default App;
