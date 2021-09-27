import "./App.css";
import React, { useEffect, useState } from "react"; // import state and effekt hooks
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";
import CryptoPricingTable from "./CryptoPricingTable";
function App() {
  const [data, setdata] = useState({});
  const potentialToken = localStorage.getItem('crypto-token')
  const [loggedin, setloggedin] = useState(potentialToken && potentialToken !== "" ? true : false);
  useEffect(() => {
    const existingToken = localStorage.getItem('crypto-token') // check if there is a token, because /prices is a protected endpoint and should not be queried if you are not logged in (no token present)
    if (existingToken && loggedin) { // jjust fetch to the protected endpoint if we are logged in
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
  }, [loggedin]);
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
      <Router>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <div className="container-fluid">

            <Link className="navbar-brand" to="/">Crypto price alert bot</Link>
            <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">
                <li className="nav-item">
                  <Link className="nav-link" to="/prices">Prices</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/about">About</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/history">History</Link>
                </li>
              </ul>
            </div>
            <span class="navbar-text">
              Hello {loggedin ? <button className="btn btn-danger" onClick={() => {
                setloggedin(false)
                localStorage.removeItem("crypto-token")
              }}>
                {loggedin ? " log out" : " login"}
              </button> : " you are logged out"}
            </span>
          </div>
        </nav>

        <Switch>
          <Route path="/about">
            About
          </Route>
          <Route path="/history">
            History
          </Route>
          <Route path="/prices">
            {!loggedin ? (
              <>
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
                    <button className={`btn btn-primary`} type="submit">Register</button>
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
                      if (res.token) { // if the backend issued successfully a token, save it locally in the browser (localStorage, or cookie or whatever)
                        localStorage.setItem("crypto-token", res.token)
                        setloggedin(true)

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
              </>
            ) : (
              <CryptoPricingTable
                sortBy={sortBy}
                data={data}

              />
            )}
          </Route>
          <Route path="/">
            Welcome
          </Route>
        </Switch>
        <br />
      </Router>
    </div>
  );
}

export default App;
