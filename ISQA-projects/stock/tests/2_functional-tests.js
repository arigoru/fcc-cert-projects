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

var currentLikes = 0;

chai.use(chaiHttp);

suite("Functional Tests", function() {
  suite("GET /api/stock-prices => stockData object", function() {
    test("1 stock", function(done) {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "goog" })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body, "response should be an object");
          assert.property(
            res.body,
            "stockData",
            "should have stockData property"
          );
          assert.isObject(res.body.stockData, "stockData should be an object");
          assert.property(
            res.body.stockData,
            "stock",
            "should have stock property"
          );
          assert.property(
            res.body.stockData,
            "price",
            "should have price property"
          );
          assert.property(
            res.body.stockData,
            "likes",
            "should have likes property"
          );
          currentLikes = res.body.stockData.likes;
          done();
        });
    });

    test("1 stock with like", function(done) {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "goog", liked: true })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body, "response should be an object");
          assert.property(
            res.body,
            "stockData",
            "should have stockData property"
          );
          assert.isObject(res.body.stockData, "stockData should be an object");
          assert.property(
            res.body.stockData,
            "stock",
            "should have stock property"
          );
          assert.property(
            res.body.stockData,
            "price",
            "should have price property"
          );
          assert.property(
            res.body.stockData,
            "likes",
            "should have likes property"
          );
          assert.equal(
            res.body.stockData.likes,
            currentLikes + 1,
            "should increase likes by one"
          );
          done();
        });
    });

    test("1 stock with like again (ensure likes arent double counted)", function(done) {
      chai
        .request(server)
        .get("/api/stock-prices")
        .query({ stock: "goog", liked: true })
        .end(function(err, res) {
          assert.equal(res.status, 200);
          assert.isObject(res.body, "response should be an object");
          assert.property(
            res.body,
            "stockData",
            "should have stockData property"
          );
          assert.isObject(res.body.stockData, "stockData should be an object");
          assert.property(
            res.body.stockData,
            "stock",
            "should have stock property"
          );
          assert.property(
            res.body.stockData,
            "price",
            "should have price property"
          );
          assert.property(
            res.body.stockData,
            "likes",
            "should have likes property"
          );
          assert.equal(
            res.body.stockData.likes,
            currentLikes + 1,
            "should stay increased by one, since we repeating from same IP"
          );
          done();
        });
    });

    test("2 stocks", function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog','msft']})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'response should be an object');
          assert.property(res.body, 'stockData', 'should have stockData property');
          assert.isArray(res.body.stockData, 'stockData should be an array');
          assert.property(res.body.stockData[0], 'stock', 'should have stock property');
          assert.property(res.body.stockData[1], 'stock', 'should have stock property');
          assert.property(res.body.stockData[0], 'price', 'should have price property');
          assert.property(res.body.stockData[1], 'price', 'should have price property');
          assert.property(res.body.stockData[0], 'rel_likes', 'should have rel_likes property');
          assert.property(res.body.stockData[1], 'rel_likes', 'should have rel_likes property');
          currentLikes = Math.abs(res.body.stockData[0].rel_likes);
          done();
        });
    });

    test("2 stocks with like", function(done) {
      
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog','msft'],liked:true})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'response should be an object');
          assert.property(res.body, 'stockData', 'should have stockData property');
          assert.isArray(res.body.stockData, 'stockData should be an array');
          assert.property(res.body.stockData[0], 'stock', 'should have stock property');
          assert.property(res.body.stockData[1], 'stock', 'should have stock property');
          assert.property(res.body.stockData[0], 'price', 'should have price property');
          assert.property(res.body.stockData[1], 'price', 'should have price property');
          assert.property(res.body.stockData[0], 'rel_likes', 'should have rel_likes property');
          assert.property(res.body.stockData[1], 'rel_likes', 'should have rel_likes property');
          assert.equal(Math.abs(res.body.stockData[1].rel_likes),Math.abs(currentLikes-1),"relative likes should change by one");
          done();
        });
    
    });
  });
});
