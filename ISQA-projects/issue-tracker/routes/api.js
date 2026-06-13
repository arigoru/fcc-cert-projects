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
var ObjectId = require("mongodb").ObjectID;
const sanitize = require("mongo-sanitize");
var bleach = require('bleach');


const CONNECTION_STRING = process.env.DATABASE;
//MongoClient.connect(CONNECTION_STRING, function(err, db) {});

mongoose.connection.on("error", function(err) {
  console.log("Could not connect to mongo server!");
  return console.log(err);
});

mongoose.connect(CONNECTION_STRING, { useNewUrlParser: true });

let issueSchema = new mongoose.Schema({
  issue_title: String,
  issue_text: String,
  created_by: String,
  assigned_to: String,
  status_text: String,
  created_on: { type: Date, default: Date.now },
  updated_on: { type: Date, default: Date.now },
  open: { type: Boolean, default: true },
  project: String
});

let issueModel = mongoose.model("issues", issueSchema);

module.exports = function(app,next) {
  mongoose.connection.on("open", function(ref) {
    console.log("Connected to mongo server.");
    app
      .route("/api/issues/:project")
      .get(sanitizeInput, issueGet)
      .post(sanitizeInput, issuePost)
      .put(sanitizeInput, issuePut)
      .delete(sanitizeInput, issueDelete);
    next();
  });
};

function sanitizeInput(request, response, next) {
  response.header("Content-Type", "application/json");
  request.query = sanitize(request.query);
  request.params = sanitize(request.params);
  request.fields = sanitize(request.fields);
  next();
}

const FILTERFIELDS = [
  "issue_title",
  "issue_text",
  "created_by",
  "assigned_to",
  "status_text",
  "created_on",
  "updated_on",
  "open"
];

function issueGet(request, response) {
  let filterObject = { project: request.params.project };

  for (let key in request.query) {
    if (FILTERFIELDS.indexOf(key) >= 0) {
      filterObject[key] = request.query[key];
    }
  }

  listIssues(filterObject, issuesList => {
    response.json({ filter: filterObject, list: issuesList });
  });
}

const REQUIREDFIELDS = ["issue_title", "issue_text", "created_by"];
function issuePost(request, response) {
  var project = request.params.project;
  let fieldsAreOk = true;

  // check that all required fields are filled
  REQUIREDFIELDS.forEach(requiredField => {
    if ((request.fields[requiredField]===undefined)||(!request.fields[requiredField].length > 0)) fieldsAreOk = false;
  });
  if (fieldsAreOk) {
    createIssue(
      data => {
        response.json(data);
      },
      request.fields,
      project
    );
  } else {
    response.json({ error: "missing required field" });
  }
}

function issuePut(request, response, next) {
  var project = request.params.project;
  let responseJSON = {};
  updateIssue(
    (data, status, id) => {
      if (data !== null) responseJSON.updatedIssue = data;
      responseJSON.status = status;
      if (id !== null) responseJSON._id = id;
      response.json(responseJSON);
    },
    request.fields,
    project
  );
}

function issueDelete(request, response, next) {
  var project = request.params.project;
  let responseJSON = {};
  if ((request.fields._id!==undefined)&&(request.fields._id.length > 0)) {
    deleteIssue(request.fields._id, status => {
      responseJSON.status = status;
      responseJSON._id = request.fields._id;
      response.json(responseJSON);
      // console.log("Deleting issue, status: ", status);
    });
  } else {
    responseJSON.status = "_id error";
    response.json(responseJSON);
  }
}


const VALIDFIELDS = [
  "issue_title",
  "issue_text",
  "created_by", "assigned_to",
  "status_text",
  "open"
];


function createIssue(next, data, project) {
  let result;
  let issueData = {
    issue_title: bleach.sanitize(data.issue_title),
    issue_text:  bleach.sanitize(data.issue_text),
    created_by:  bleach.sanitize(data.created_by),
    assigned_to: bleach.sanitize(data.assigned_to),
    status_text: bleach.sanitize(data.status_text),
    project: project
  };

  for (let i=0;i<VALIDFIELDS.length-1;i++)  // ignore last valid element - open has default value on DB side
    if (issueData[VALIDFIELDS[i]]===undefined) issueData[VALIDFIELDS[i]]="";

  let issue = new issueModel(issueData);

  issue.save((error, data) => {
    if (error !== null) result = error;
    else {
      // console.log(`\nCreated new issue:\n${data}`);
      result = data;
    }
    next(result);
  });
}

function updateIssue(next, formData, project) {
  let result;
  let status, _id;
  let updated = false;
  let newObj = {};
  // only take form fields that are not empty and are valid
  for (let key in formData) {
   // console.log(key,' : ',formData[key]);
    if (formData[key].length > 0 && VALIDFIELDS.indexOf(key) >= 0) {
      updated = true;
      newObj[key] = bleach.sanitize(formData[key]);
    }
  }
  if (newObj.open===undefined) newObj.open = true;

  if (!updated) {
    status = "no updated field sent";
    next(null, status, null);
  } else {
    _id = formData._id;
    /*
      $currentDate: {
        lastModified: true,
     }
    */
    issueModel.findOneAndUpdate(
      { _id: _id },
      { $set: newObj, $currentDate: { updated_on: true } },
      { new: true },
      (error, data) => {
        if (error !== null) {
          result = error;
          status = "could not update";
        } else {
          status = "successfully updated";
          _id = data._id;
          // console.log(`\nUpdated existing issue:\n${data}`);
          // console.log("\nUpdated properties: ", newObj);
        }
        next(data, status, _id);
      }
    );
  }
}

function deleteIssue(id, next) {
  issueModel.findByIdAndRemove(id, (error, data) => {
    if (error) next("could not delete");
    else next("deleted");
  });
}

function listIssues(filter, next) {
  issueModel.find(filter, "-__v", (error, data) => {
    if (error) {
      // console.log("Error: ", error.message);
      next(null);
    } else next(data);
  });
}
