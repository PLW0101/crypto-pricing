import "./App.css";
import React, { useEffect, useState } from "react"; // import state and effekt hooks

function App() {
  const [data, setdata] = useState({});
  const [loggedin, setloggedin] = useState(false);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API}/prices`) //async
      .then((res) => res.json())
      .then((res) => {        
        setdata(res);
      });
  }, []);
  const sortBy = (e) => {
    const columnName = e.target.innerText
    let dataClone = {...data}
    if(columnName === "Price"){
      dataClone.prices.data = dataClone.prices.data.sort((a, b) => a.quote.EUR.price > b.quote.EUR.price)
    }else if(columnName === "Currency") {
      dataClone.prices.data = dataClone.prices.data.sort((a, b) => a.name > b.name)
    } else {
      dataClone.prices.data = dataClone.prices.data.sort((a, b) => a.quote.EUR.percent_change_1h > b.quote.EUR.percent_change_1h)
    }
    setdata(dataClone)
  }
  return (
    <div className="App">
      Hello you are {loggedin ? " logged in" : " logged out"}
      <button onClick={() => setloggedin(!loggedin)}>
        {loggedin ? " log out" : " login"}
      </button>
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
