/*
 *
 *
 *       Complete the API routing below
 *
 *
 */

"use strict";

var expect = require("chai").expect;
var MongoClient = require("mongodb").MongoClient;
var mongoose = require("mongoose");
var ObjectId = require("mongodb").ObjectId;
const sanitize = require("mongo-sanitize");

const CONNECTION_STRING = process.env.DATABASE;

mongoose.connection.on("error", function(err) {
	console.log("Could not connect to mongo server!");
	return console.log(err);
});

mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true });

let schemas = {};
schemas.replies = new mongoose.Schema({
	text: String,
	delete_password: { type: String, select: false },
	thread_id: String,
	created_on: { type: Date, default: Date.now },
	reported: { type: Boolean, default: false, select: false }
});
// https://mongoosejs.com/docs/subdocs.html
schemas.threads = new mongoose.Schema({
	text: String,
	delete_password: { type: String, select: false },
	created_on: { type: Date, default: Date.now },
	bumped_on: { type: Date, default: Date.now },
	reported: { type: Boolean, default: false, select: false },
	replies: [schemas.replies],
	replies_count: { type: Number, default: 0 },
	board: { type: String, default: "general" }
});

let threads = {
	get: function(request, response) {
		let filter = { board: request.params.board };
		threads.model
			.find(filter, {
				replies: { $slice: -3 }
			})
			.sort({ bumped_on: -1 })
			.limit(10)
			.exec((error, data) => {
				response.json(data);
			});
	},
	post: function(request, response) {
		let threadData = {
			board: request.params.board,
			text: request.body.text,
			delete_password: request.body.delete_password
		};
		let thread = new threads.model(threadData);
		thread.save((error, data) => {
			if (error !== null) response.json({ status: "error" });
			else {
				response.redirect(`/b/${request.params.board}/`);
			}
		});
	},
	put: function(request, response) {
		threads.model.findOneAndUpdate(
			{
				_id: request.body.thread_id
			},
			{
				$set: {reported:true}
			},
			(error, data) => {
				response.type("html");
				// console.log(`err: ${error}, data: ${data}`);
				if (error) response.send("DB error");
				else {
					if (data) response.send("success");
					else response.send("error");
				}
			}
		);
	},
	delete: function(request, response) {
		// console.log("delete requested");
		threads.model.findOneAndRemove(
			{
				_id: request.body.thread_id,
				delete_password: request.body.delete_password
			},
			(error, data) => {
				response.type("html");
				// console.log(`err: ${error}, data: ${data}`);
				if (error) response.send("DB error");
				else {
					if (data) response.send("success");
					else response.send("incorrect password");
				}
			}
		);
	},
	model: mongoose.model("board_threads", schemas.threads)
};

const replies = {
	get: function(request, response) {
		threads.model.findById(request.query.thread_id).exec((error, data) => {
			response.json(data);
		});
	},
	post: function(request, response) {
		let board = request.params.board;
		let id = request.body.thread_id;
		let reply = {
			text: request.body.text,
			delete_password: request.body.delete_password,
			thread_id: request.body.thread_id
		};
		threads.model.findOneAndUpdate(
			{ _id: id },
			{
				$push: { replies: reply },
				$inc: { replies_count: 1 },
				$currentDate: { bumped_on: true }
			},
			(error, data) => {
				if (error) response.json({status:"error"});
				else response.redirect(`/b/${board}/${id}`);
			}
		);
	},
	put: function(request, response) {
		threads.model.findOneAndUpdate(
			{
				_id: request.body.thread_id,
				replies: {
					$elemMatch: {
						_id: request.body.reply_id
					}
				}
			},
			{
				$set: { "replies.$.reported": true }
			},
			(error, data) => {
				response.type("html");
				if (error) response.send("DB error");
				else {
					if (data) response.send("success");
					else response.send("error");
				}
			}
		);
	},
	delete: function(request, response) {
		threads.model.findOneAndUpdate(
			{
				_id: request.body.thread_id,
				replies: {
					$elemMatch: {
						_id: request.body.reply_id,
						delete_password: request.body.delete_password
					}
				}
			},
			{
				$set: { "replies.$.text": "[deleted]" }
			},
			(error, data) => {
				response.type("html");
				if (error) response.send("DB error");
				else {
					if (data) response.send("success");
					else response.send("incorrect password");
				}
			}
		);
	}
};

function sanitizeInput(request, response, next) {
	response.header("Content-Type", "application/json");
	request.query = sanitize(request.query);
	request.params = sanitize(request.params);
	request.fields = sanitize(request.fields);
	request.body = sanitize(request.body);
	next();
}

module.exports = function(app, next) {
	mongoose.connection.on("open", function(ref) {
		console.log("Connected to mongo server.");
		app.set("json spaces", 2);

		app.route("/api/threads/:board")
			.get(sanitizeInput, threads.get)
			.post(sanitizeInput, threads.post)
			.put(sanitizeInput, threads.put)
			.delete(sanitizeInput, threads.delete);

		app.route("/api/replies/:board")
			.get(sanitizeInput, replies.get)
			.post(sanitizeInput, replies.post)
			.put(sanitizeInput, replies.put)
			.delete(sanitizeInput, replies.delete);
		next();
	});
};
