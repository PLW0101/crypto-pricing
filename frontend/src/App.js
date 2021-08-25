import logo from "./logo.svg";
import "./App.css";
import React, { useEffect, useState } from "react"; // import state and effekt hooks

function App() {
  const [data, setdata] = useState([]);
  const [loggedin, setloggedin] = useState(false);
  useEffect(() => {
    console.log("Hi");
    fetch(`http://localhost:8080/prices`) //async
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        setdata(res.data);
      });
  }, []);
  console.log(data);
  //TODO save the trheshold value somewhere
  // send the number while typing or on button click to the backend and store it in a file name like the currency
  //TODO make a interval which checks the price all 10 minues
  //TODO when the threshold is undergone trigger a notification (mail/telegram)
  return (
    <div className="App">
      Hello you are {loggedin ? " logged in" : " logged out"}
      <button onClick={() => setloggedin(!loggedin)}>
        {loggedin ? " log out" : " login"}
      </button>
      <table class="table">
        <thead>
          <tr>
            <th scope="col">Currency</th>
            <th scope="col">Price</th>
            <th scope="col">Threshold</th>
          </tr>
        </thead>
        <tbody>
          {data.map((currency) => (
            <tr>
              <th scope="row">{currency.name}</th>
              <td>
                <code>{currency.quote.EUR.price.toFixed(5)}</code>
              </td>
              <td>
                <div className="input-group mb-3">
                  <span className="input-group-text">$</span>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      console.log(e.target.elements[0].value);
                      //TODO perform a post request to a new backend endpoint
                      fetch(`http://localhost:8080/setthreshhold`, {
                        method: "POST",
                        body: JSON.stringify({
                          currency: currency.name,
                          value: e.target.elements[0].value
                        }),
                        headers: {
                          "content-type": "application/json"
                        }
                      })
                        .then((res) => res.json())
                        .then((res) => {
                          console.log(res);
                        });
                    }}
                  >
                    <input
                      type="text"
                      className="form-control"
                      aria-label="Amount (to the nearest dollar)"
                    />
                    <button className={`btn btn-success`} type="submit">
                      Save
                    </button>
                  </form>
                  <span className="input-group-text">.00</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
