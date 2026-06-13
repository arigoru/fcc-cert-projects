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
var bleach = require('bleach');


const CONNECTION_STRING = process.env.DATABASE;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

mongoose.connection.on("error", function(err) {
  console.log("Could not connect to mongo server!");
  return console.log(err);
});

mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true });

let bookSchema = new mongoose.Schema({
  title: String,
  commentcount: { type: Number, default: 0 },
  comments: { type: Array, default: [] }
});

let bookModel = mongoose.model("books", bookSchema);

function sanitizeInput(request, response, next) {
  response.header("Content-Type", "application/json");
  request.query =  sanitize(request.query);
  request.params = sanitize(request.params);
  request.fields = sanitize(request.fields);
  request.body = sanitize(request.body);
  next();
}

module.exports = function(app, next) {
  mongoose.connection.on("open", function(ref) {
    console.log("Connected to mongo server.");
    app
      .route("/api/books")
      .get(sanitizeInput, booksGet)
      .post(sanitizeInput, booksPost)
      .delete(sanitizeInput, booksDelete);

    app
      .route("/api/books/:id")
      .get(sanitizeInput, booksGet)
      .post(sanitizeInput, booksPost)
      .delete(sanitizeInput, booksDelete);
    next();
  });
};

function booksGet(request, response) {
  if (request.params.id === undefined) {
    let filter = {};
    bookModel.find(filter, "-__v -comments", (error, data) => {
      if (error) {
        console.log("Error: ", error.message);
        response.json({ error: error });
      } else {
        response.json(data);
      }
    });
  } else {
    var bookid = request.params.id;
    bookModel.findById(bookid, "-__v", (error, data) => {
      if (error !== null || data === null)
        response.json({ error: "no book exists" });
      else response.json(data);
    });
  }
}

function booksPost(request, response) {
  if (request.params.id === undefined) {
    // console.log("body: ", request.body);
    // console.log("fields: ", request.fields);
    if (request.body.title !== undefined && request.body.title.length > 0) {
      var bookData = {
        title: bleach.sanitize(request.body.title)
      };
      let book = new bookModel(bookData);
      book.save((error, data) => {
        if (error !== null) response.json({ error: error });
        else {
          // console.log(`\nAdded new book:\n${data}`);
          response.json(data);
        }
      });
    } else {
      response.json({ error: "no title" })
    }
  } else {
    var bookid = request.params.id;
    var comment = bleach.sanitize(request.body.comment);
    if (comment !== undefined && comment.length > 0) {
      bookModel.findOneAndUpdate(
        { _id: bookid },
        {
          $push: { comments: comment },
          $inc: { commentcount: 1 }
        },
        (error, data) => {
          if (error !== null) response.json({ error: "no book exists" });
          else {
            console.log("adding coment",data);
            response.json(data);
          }
        }
      );
    } else {
      response.json({ error: "empty comment" })
    }
  }
}

function booksDelete(request, response) {
  if (request.params.id === undefined) {
    bookModel.deleteMany({}, error => {
      if (error !== null) response.json({ error: error });
      else response.json({ status: "complete delete successful" });
    });
  } else {
    var bookid = request.params.id;
    bookModel.findByIdAndRemove(bookid, (error, data) => {
      if (error) response.json({ error: "no book exists" });
      else response.json({ status: "delete successful" });
    });
  }
}
