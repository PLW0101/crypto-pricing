const key = 'qGBPWsu4YOtu+jSqHsTBfjj0bLW+FML48ZyjF1BG5vy5VAicyzWEx7Lz'; // API Key
const secret = '1xyb8Y5Wdoqm8N51IZkD+GTyVD2yEXEAAEA3OjQ0ekwb85870j0sKebvHONc2nK7gL2Wd5S/kiKT2N7mgH3+ZA=='; // API Private Key
const KrakenClient = require('kraken-api');
const kraken = new KrakenClient(key, secret);

(async () => {
	// Display user's balance
	console.log(await kraken.api('Balance'));


	var value = await kraken.api('AddOrder', {
		pair: 'XDGEUR',
		type: "sell",
		ordertype: 'limit',
		volume: 50,
		price: 0.20,
		validate: true
	});

	var arrays = JSON.stringify(value);
	console.log(arrays);

})();

