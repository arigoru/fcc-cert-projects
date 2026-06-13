/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *       (if additional are added, keep them at the very end!)
 */

var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");

chai.use(chaiHttp);

var issId;

suite("Functional Tests", function() {
  suite("POST /api/issues/{project} => object with issue data", function() {
    test("Every field filled in", function(done) {
      let sentIssue = {
        issue_title: "Title",
        issue_text: "text",
        created_by: "Functional Test - Every field filled in",
        assigned_to: "Chai and Mocha",
        status_text: "In QA"
      };
      chai
        .request(server)
        .post("/api/issues/test")
        .send(sentIssue)
        .end(function(err, res) {
          console.log(res.text);
          assert.equal(res.status, 200);
          assert.deepInclude(res.body, sentIssue);
          issId = res.body._id;
          done();
        });
    });

    test("Required fields filled in", function(done) {
      let sentIssue = {
        issue_title: "Title",
        issue_text: "text",
        created_by: "Functional Test - Every field filled in"
      };
      chai
        .request(server)
        .post("/api/issues/test")
        .send(sentIssue)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.deepInclude(res.body, sentIssue);
          done();
        });
    });

    test("Missing required fields", function(done) {
      let sentIssue = {
        issue_title: "Title",
        issue_text: "text",
      };
      chai
        .request(server)
        .post("/api/issues/test")
        .send(sentIssue)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isDefined(res.body.error);
          done();
        });
    });
  });

  suite("PUT /api/issues/{project} => text", function() {
    test("No body", function(done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send()
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.status,"no updated field sent");
          done();
        });
    });

    test("One field to update", function(done) {
      let sentIssue = {
        _id: issId,
        issue_title: "Title updated"
      };
      
      chai
        .request(server)
        .put("/api/issues/test")
        .send(sentIssue)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.deepInclude(res.body.updatedIssue, sentIssue);
          done();
        });
    });

    test("Multiple fields to update", function(done) {
      let sentIssue = {
        _id: issId,
        issue_title: "Title updated",
        issue_text: "text updated"
      };
      chai
        .request(server)
        .put("/api/issues/test")
        .send(sentIssue)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.deepInclude(res.body.updatedIssue, sentIssue);
          done();
        });
    });
  });

  suite(
    "GET /api/issues/{project} => Array of objects with issue data",
    function() {
      test("No filter", function(done) {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body.list);
            assert.property(res.body.list[0], "issue_title");
            assert.property(res.body.list[0], "issue_text");
            assert.property(res.body.list[0], "created_on");
            assert.property(res.body.list[0], "updated_on");
            assert.property(res.body.list[0], "created_by");
            assert.property(res.body.list[0], "assigned_to");
            assert.property(res.body.list[0], "open");
            assert.property(res.body.list[0], "status_text");
            assert.property(res.body.list[0], "_id");
            done();
          });
      });

      test("One filter", function(done) {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({open: true})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body.list);
            assert.property(res.body.list[0], "issue_title");
            assert.property(res.body.list[0], "issue_text");
            assert.property(res.body.list[0], "created_on");
            assert.property(res.body.list[0], "updated_on");
            assert.property(res.body.list[0], "created_by");
            assert.property(res.body.list[0], "assigned_to");
            assert.property(res.body.list[0], "open");
            assert.property(res.body.list[0], "status_text");
            assert.property(res.body.list[0], "_id");
            done();
          });
      });

      test("Multiple filters (test for multiple fields you know will be in the db for a return)", function(done) {
        chai
          .request(server)
          .get("/api/issues/test")
          .query({open: true,status_text: "In QA"})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body.list);
            assert.property(res.body.list[0], "issue_title");
            assert.property(res.body.list[0], "issue_text");
            assert.property(res.body.list[0], "created_on");
            assert.property(res.body.list[0], "updated_on");
            assert.property(res.body.list[0], "created_by");
            assert.property(res.body.list[0], "assigned_to");
            assert.property(res.body.list[0], "open");
            assert.property(res.body.list[0], "status_text");
            assert.property(res.body.list[0], "_id");
            done();
          });
      });
    }
  );

  suite("DELETE /api/issues/{project} => text", function() {
    test("No _id", function(done) {
      chai
        .request(server)
        .delete("/api/issues/test")
        .send()
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.status,"_id error");
          done();
        });
    });

    test("Valid _id", function(done) {
      let sentIssue = {
        _id: issId
      };
      
      chai
        .request(server)
        .delete("/api/issues/test")
        .send(sentIssue)
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.status,"deleted");
          done();
        });
    });
  });
});
