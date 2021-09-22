import "./App.css";
import React, { useEffect, useState } from "react"; // import state and effekt hooks

function App() {
  const [data, setdata] = useState({});
  const [loggedin, setloggedin] = useState(false);
  useEffect(() => {
    const existingToken = localStorage.getItem('crypto-token') // check if there is a token, because /prices is a protected endpoint and should not be queried if you are not logged in (no token present)
    if(existingToken){ // jjust fetch to the protected endpoint if we are logged in
      fetch(`${process.env.REACT_APP_API}/prices`, {
        headers: {
          "Authorization": existingToken // since the backend is expecting a authenticated request, we have to provide the fetch with a authorization header
        }
      }) //async
        .then((res) => res.json())
        .then((res) => {
          setdata(res);
        });
    } else {
      console.log("not logged in")
    }
  }, []);
  const sortBy = (e) => {
    const columnName = e.target.innerText
    let dataClone = { ...data }
    if (columnName === "Price") {
      if (dataClone.prices.data[0].quote.EUR.price < dataClone.prices.data[dataClone.prices.data.length - 1].quote.EUR.price) {
        dataClone.prices.data = dataClone.prices.data.sort((a, b) => a.quote.EUR.price < b.quote.EUR.price)
      } else {
        dataClone.prices.data = dataClone.prices.data.sort((a, b) => a.quote.EUR.price > b.quote.EUR.price)
      }
    } else if (columnName === "Currency") {
      if (dataClone.prices.data[0].name < dataClone.prices.data[dataClone.prices.data.length - 1].name) {
        dataClone.prices.data = dataClone.prices.data.sort((a, b) => a.name < b.name)
      } else {
        dataClone.prices.data = dataClone.prices.data.sort((a, b) => a.name > b.name)
      }
    } else {
      if (dataClone.prices.data[0].quote.EUR.percent_change_1h < dataClone.prices.data[dataClone.prices.data.length - 1].quote.EUR.percent_change_1h) {
        dataClone.prices.data = dataClone.prices.data.sort((a, b) => a.quote.EUR.percent_change_1h < b.quote.EUR.percent_change_1h)
      } else {
        dataClone.prices.data = dataClone.prices.data.sort((a, b) => a.quote.EUR.percent_change_1h > b.quote.EUR.percent_change_1h)
      }
    }
    setdata(dataClone)
  }
  return (
    <div className="App">
      Hello you are {loggedin ? " logged in" : " logged out"}
      <button onClick={() => setloggedin(!loggedin)}>
        {loggedin ? " log out" : " login"}
      </button>
      <br />

      <form onSubmit={(e) => {
        e.preventDefault()
        const payload = {
          email: e.target.elements.email.value,
          password: e.target.elements.password.value
        }
        console.log(payload)
        fetch(`${process.env.REACT_APP_API}/register`, {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
            "content-type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((res) => {
            console.log(res);
          });
      }}>
        <div className={`input-group`}>
          <span className="input-group-text">Register</span>
          <input className={`form-control`} type="email" placeholder="email" name="email" />
          <input className={`form-control`} type="password" placeholder="password" name="password" />
          <button className={`btn btn-primary`} type="submit">Login</button>
        </div>
      </form>

      <form onSubmit={(e) => {
        e.preventDefault()
        const payload = {
          email: e.target.elements.email.value,
          password: e.target.elements.password.value
        }
        console.log(payload)
        fetch(`${process.env.REACT_APP_API}/login`, {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
            "content-type": "application/json",
          },
        })
          .then((res) => res.json())
          .then((res) => {
            console.log(res);
            if(res.token){ // if the backend issued successfully a token, save it locally in the browser (localStorage, or cookie or whatever)
              localStorage.setItem("crypto-token", res.token)
            }
          });
      }}>
        <div className={`input-group`}>
          <span className="input-group-text">Login</span>
          <input className={`form-control`} type="email" placeholder="email" name="email" />
          <input className={`form-control`} type="password" placeholder="password" name="password" />
          <button className={`btn btn-primary`} type="submit">Login</button>
        </div>
      </form>
      <table class="table text-start">
        <thead>
          <tr>
            <th onClick={(e) => sortBy(e)} scope="col">Currency</th>
            <th onClick={(e) => sortBy(e)} scope="col">Price</th>
            <th onClick={(e) => sortBy(e)} scope="col">Growth</th>
            <th onClick={(e) => sortBy(e)} scope="col">Threshold</th>
          </tr>
        </thead>
        <tbody>
          {data.prices &&
            data.prices.data.map((currency) => (
              <tr>
                <th scope="row">{currency.name}</th>
                <td>
                  <code>{currency.quote.EUR.price.toFixed(5)}</code>
                </td>
                <td>
                  <code>{currency.quote.EUR.percent_change_1h.toFixed(2)}%</code>
                </td>
                <td>
                  <form
                    className={`d-flex`}
                    onSubmit={(e) => {
                      e.preventDefault();
                      console.log(e.target.elements[0].value);
                      //TODO perform a post request to a new backend endpoint
                      fetch(`${process.env.REACT_APP_API}/setthreshhold`, {
                        method: "POST",
                        body: JSON.stringify({
                          currency: currency.name,
                          value: e.target.elements[0].value,
                        }),
                        headers: {
                          "content-type": "application/json",
                        },
                      })
                        .then((res) => res.json())
                        .then((res) => {
                          console.log(res);
                        });
                    }}
                  >
                    <div className="input-group mb-3">
                      <span className="input-group-text">EUR</span>
                      <input
                        type="text"
                        className="form-control"
                        defaultValue={
                          data.currencies.find(
                            (c) => c.name === currency.name
                          )
                            ? data.currencies.find(
                              (c) => c.name === currency.name
                            ).price
                            : 0
                        }
                        aria-label="Amount (to the nearest dollar)"
                      />
                      <button className={`btn btn-success`} type="submit">
                        Save
                      </button>
                    </div>
                  </form>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
