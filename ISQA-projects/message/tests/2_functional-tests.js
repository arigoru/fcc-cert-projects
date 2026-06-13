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

var testThread;
const DELETE_PASSWORD = "test_rem_pass";
var replyThreadId;
var testReply;

suite("Functional Tests", function() {

    suite("API ROUTING FOR /api/threads/:board", function() {

        suite("POST", function() {
            test("POST thread with correct info", function(done) {
                let sentThread = {
                    text: "This is cool test thread",
                    delete_password: DELETE_PASSWORD
                };
                chai.request(server)
                .post('/api/threads/test')
                .send(sentThread)
                .end(function(error,response){
                    assert.equal(response.status, 200);
                    done();
                });                
            });
        });

        suite("POST", function() {
            test("POST thread with correct info second time", function(done) {
                let sentThread = {
                    text: "This is second cool test thread",
                    delete_password: DELETE_PASSWORD
                };
                chai.request(server)
                .post('/api/threads/test')
                .send(sentThread)
                .end(function(error,response){
                    assert.equal(response.status, 200);
                    done();
                });                
            });
        });

        suite("GET", function() {
            test("GET board page", function(done) {
                chai.request(server)
                .get("/api/threads/test")
                .end(function(error,response){
                    assert.equal(response.status, 200);
                    assert.isArray(response.body, 'response should be an array');
                    assert.notProperty(response.body[0], 'reported', 'should not show reported property');
                    assert.notProperty(response.body[0], 'delete_password', 'should not show delete password');
                    testThread = response.body[0];
                    replyThreadId = response.body[1]._id;
                    testThread.delete_password = DELETE_PASSWORD;
                    done();    
                })
            });
        });

        suite("PUT", function() {
            test("report thread", function(done) {
                data = {
                    thread_id: testThread._id
                };
                chai.request(server)
                .put("/api/threads/test")
                .send(data)
                .end(function(error,response){
                    assert.equal(response.status, 200);
                    assert.equal(response.text,'success');
                    done();    
                });
            });
        });

        suite("DELETE", function() {
            test("try delete thread with wrong password", function(done) {
                data = {
                    thread_id: testThread._id,
                    delete_password : ""
                };
                chai.request(server)
                .delete("/api/threads/test")
                .send(data)
                .end(function(error,response){
                    assert.equal(response.status, 200);
                    assert.equal(response.text,'incorrect password');
                    done();    
                });
            });
            test("delete thread", function(done) {
                data = {
                    thread_id: testThread._id,
                    delete_password : testThread.delete_password,
                };
                chai.request(server)
                .delete("/api/threads/test")
                .send(data)
                .end(function(error,response){
                    assert.equal(response.status, 200);
                    assert.equal(response.text,'success');
                    done();    
                });
            });
        });

        
    });

    suite("API ROUTING FOR /api/replies/:board", function() {
        suite("POST", function() {
            test("create reply to thread", function(done) {
                let sentReply = {
                    text: "This is test reply",
                    delete_password: DELETE_PASSWORD,
                    thread_id: replyThreadId
                };
                chai.request(server)
                .post('/api/replies/test')
                .send(sentReply)
                .end(function(error,response){
                    assert.equal(response.status, 200);
                    done();
                });
            });
        });

        suite("GET", function() {
            test("get all replies for thread", function(done) {
                chai.request(server)
                .get("/api/replies/test")
                .query({thread_id:replyThreadId})
                .end(function(error,response){
                    assert.equal(response.status, 200);
                    assert.isObject(response.body, 'response should be an object');
                    assert.isArray(response.body.replies, 'response should contain array with all thread replies');
                    assert.notProperty(response.body, 'reported', 'should not show reported property');
                    assert.notProperty(response.body, 'delete_password', 'should not show delete password');
                    testReply = response.body.replies.reverse()[0];
                    testReply.delete_password = DELETE_PASSWORD;
                    done();    
                })
            });
        });

        suite("PUT", function() {
            test("report reply message", function(done) {
                data = {
                    thread_id: replyThreadId,
                    reply_id: testReply._id
                };
                chai.request(server)
                .put("/api/replies/test")
                .send(data)
                .end(function(error,response){
                    assert.equal(response.status, 200);
                    assert.equal(response.text,'success');
                    done();    
                });
            });
        });

        suite("DELETE", function() {
            test("try removing reply with wrong password", function(done) {
                data = {
                    thread_id: replyThreadId,
                    reply_id: testReply._id,
                    delete_password : ""
                };
                chai.request(server)
                .delete("/api/replies/test")
                .send(data)
                .end(function(error,response){
                    assert.equal(response.status, 200);
                    assert.equal(response.text,'incorrect password');
                    done();    
                });
            });
            test("remove reply", function(done) {
                data = {
                    thread_id: replyThreadId,
                    reply_id: testReply._id,
                    delete_password : testReply.delete_password
                };
                chai.request(server)
                .delete("/api/replies/test")
                .send(data)
                .end(function(error,response){
                    assert.equal(response.status, 200);
                    assert.equal(response.text,'success');
                    done();    
                });
            });
        });
    });
});
