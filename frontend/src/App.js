import "./App.css";
import React, { useEffect, useState } from "react"; // import state and effekt hooks

function App() {
  const [data, setdata] = useState([]);
  const [loggedin, setloggedin] = useState(false);
  useEffect(() => {
    fetch(`${process.env.REACT_APP_API}/prices`) //async
      .then((res) => res.json())
      .then((res) => {        
        setdata(res);
      });
  }, []);
  
  return (
    <div className="App">
      Hello you are {loggedin ? " logged in" : " logged out"}
      <button onClick={() => setloggedin(!loggedin)}>
        {loggedin ? " log out" : " login"}
      </button>
      <table class="table text-start">
        <thead>
          <tr>
            <th scope="col">Currency</th>
            <th scope="col">Price</th>
            <th scope="col">Threshold</th>
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
                            (c) => c.currency === currency.name
                          )
                            ? data.currencies.find(
                                (c) => c.currency === currency.name
                              ).value
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
