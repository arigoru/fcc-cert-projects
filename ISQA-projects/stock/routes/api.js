/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb");
var mongoose = require("mongoose");
const sanitize = require("mongo-sanitize");
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const CONNECTION_STRING = process.env.DATABASE;

mongoose.connection.on("error", function(err) {
	console.log("Could not connect to mongo server!");
	return console.log(err);
});

mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true });

let stockSchema = new mongoose.Schema({
	stock: String,
	likescount: { type: Number, default: 0 },
	likesIP: { type: Array, default: [] }
});

let StockModel = mongoose.model("stock", stockSchema);

function sanitizeInput(request, response, next) {
	response.header("Content-Type", "application/json");
	request.query = sanitize(request.query);
	next();
}

module.exports = function(app, next) {
	mongoose.connection.on("open", function(ref) {
		console.log("Connected to mongo server.");
		app.route("/api/stock-prices").get(sanitizeInput, getStock);
		next();
	});
};

function getStock(request, response) {
	response.header("Content-Type", "application/json");
	let responseJSON = {};
	if (Array.isArray(request.query.stock)) {
		console.log("requested double stock");
		getStockPriceFromAPI(
			[request.query.stock[0], request.query.stock[1]],
			stockPrices => {
				if (stockPrices === null)
					response.json({ error: "API request error" });
				else {
					responseJSON.stockData = [];
					let likes = [];
					for (let key in stockPrices) {
						responseJSON.stockData.push({
							stock: key,
							price: stockPrices[key].price
						});
					}
					if (request.query.liked) {
						updateLikes(
							responseJSON.stockData[0].stock,
							request.ip,
							result => {
								likes[0] = result.likescount;
								updateLikes(
									responseJSON.stockData[1].stock,
									request.ip,
									result => {
										likes[1] = result.likescount;
										responseJSON.stockData[0].rel_likes =
											likes[0] - likes[1];
										responseJSON.stockData[1].rel_likes =
											likes[1] - likes[0];
										console.log(responseJSON);
										response.json(responseJSON);
									}
								);
							}
						);
					} else {
						getLikes(responseJSON.stockData[0].stock, result => {
							likes[0] = result;
							getLikes(
								responseJSON.stockData[1].stock,
								result => {
									likes[1] = result;
									responseJSON.stockData[0].rel_likes =
										likes[0] - likes[1];
									responseJSON.stockData[1].rel_likes =
										likes[1] - likes[0];
									console.log(responseJSON);
									response.json(responseJSON);
								}
							);
						});
					}
				}
			}
		);
	} else {
		console.log("requested single stock");
		getStockPriceFromAPI([request.query.stock], stockPrices => {
			if (stockPrices === null)
				response.json({ error: "API request error" });
			else {
				responseJSON.stockData = {
					stock: request.query.stock.toUpperCase(),
					price: stockPrices[request.query.stock.toUpperCase()].price
				};
				if (request.query.liked) {
					updateLikes(
						responseJSON.stockData.stock,
						request.ip,
						result => {
							console.log(result);
							responseJSON.stockData.likes = result.likescount;
							response.json(responseJSON);
						}
					);
				} else {
					getLikes(responseJSON.stockData.stock, likes => {
						responseJSON.stockData.likes = likes;
						response.json(responseJSON);
					});
				}
			}
		});
	}
	console.log(request.query);
	// response.json(stockData);
}

function getLikes(stock, next) {
	StockModel.findOne({ stock: stock }, (error, data) => {
		if (error) {
			next(0);
		} else {
			if (data === null || data.likescount === undefined) {
				next(0);
			} else next(data.likescount);
		}
	});
}

function updateLikes(stock, ip, next) {
	let newIP = true;
	// check if ip already here first
	StockModel.findOne({ stock: stock }, (error, data) => {
		if (!error && data !== null) {
			if (data.likesIP.indexOf(ip) >= 0) newIP = false;
		}
		if (newIP) {
			var query = {
					stock: stock
				},
				update = {
					$push: { likesIP: ip },
					$inc: { likescount: 1 }
				},
				options = {
					upsert: true,
					new: true,
					setDefaultsOnInsert: true
				};
			StockModel.findOneAndUpdate(query, update, options, function(
				error,
				result
			) {
				if (error) next({likescount:0});
				else next(result);
			});
		} else {
			next({likescount:data.likescount});
		}
	});
}

function getStockPriceFromAPI(stocks, next) {
	// api link example:
	// https://api.iextrading.com/1.0/stock/market/batch?symbols=goog,msft&types=price
	let symbols = stocks.join(",");
	let url = `https://api.iextrading.com/1.0/stock/market/batch?symbols=${symbols}&types=price`;
	sendRequest(
		url,
		"GET",
		null,
		apiRequest => {
			next(JSON.parse(apiRequest.responseText));
		},
		apiRequest => {
			next(null);
		}
	);
}

function sendRequest(url, method, data, onLoad, onError = () => {}) {
	var request = new XMLHttpRequest();
	request.open(method, url, true);

	request.onload = function() {
		onLoad(request);
	};
	request.onerror = function() {
		onError(request);
	};

	request.send(data);
}
