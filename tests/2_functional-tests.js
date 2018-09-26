const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
require("dotenv").config({ path: "../.env" });
let likesGOOG, likesAAPL;

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite('GET /api/stock-prices => stockData object', function() {
    test('1 stock', function(done) {
      chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'goog' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isAtLeast(parseFloat(res.body.stockData.price), 0);
        assert.isAtLeast(res.body.stockData.likes, 0);
        likesGOOG = res.body.stockData.likes;
        done();
      });
    });
      
    test('1 stock with like', function(done) {
      chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'goog', like: 'true' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isAtLeast(parseFloat(res.body.stockData.price), 0);
        assert.equal(res.body.stockData.likes, likesGOOG+1);
        done();
      });
    });
    
    test('1 stock with like again (ensure likes arent double counted)', function(done) {
      chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: 'goog', like: 'true' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isAtLeast(parseFloat(res.body.stockData.price), 0);
        assert.equal(res.body.stockData.likes, likesGOOG+1);
        done();
      });
    });
    
    test('2 stocks', function(done) {
      chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['msft', 'aapl'] })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body.stockData[0], 'stock');
        assert.isAtLeast(parseFloat(res.body.stockData[0].price), 0);
        assert.property(res.body.stockData[0], 'rel_likes');
        done();
      });
    });
    
    test('2 stocks with like', function(done) {
      chai.request(server)
      .get('/api/stock-prices')
      .query({ stock: ['mmm', 'm'], like: 'true' })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body.stockData[0], 'stock');
        assert.isAtLeast(parseFloat(res.body.stockData[0].price), 0);
        assert.property(res.body.stockData[0], 'rel_likes');
        done();
      });
    });
  });
});
