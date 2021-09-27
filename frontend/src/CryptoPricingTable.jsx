import React from "react"

const CryptoPricingTable =(props) => {
    return (
        <table className="table text-start">
          <thead>
            <tr>
              <th onClick={(e) => props.sortBy(e)} scope="col">Currency</th>
              <th onClick={(e) => props.sortBy(e)} scope="col">Price</th>
              <th onClick={(e) => props.sortBy(e)} scope="col">Growth</th>
              <th onClick={(e) => props.sortBy(e)} scope="col">Threshold</th>
            </tr>
          </thead>
          <tbody>
            {props.data.prices &&
              props.data.prices.data.map((currency) => (
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
                            props.data.currencies.find(
                              (c) => c.name === currency.name
                            )
                              ? props.data.currencies.find(
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
    )
};
export default CryptoPricingTable;