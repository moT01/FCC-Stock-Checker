'use strict';

const expect = require('chai').expect;
const fetch = require('node-fetch');
const Stock = require('./stockModel');
require("dotenv").config({ path: "../.env" });

const urlStart = 'https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=';
const urlEnd = '&apikey=process.env.APIKEY';

function fetchStockData(stockSymbol, like, ip, res) {
  console.log(`fetch { ${stockSymbol}, ${like}, ${ip} }`);
  return new Promise((resolve, reject) => {
 
    fetch(urlStart+stockSymbol+urlEnd)
    .then(resp => resp.json())
    .then(json => {

      const stockData = json['Global Quote'] || null;

      //could not find stock data from api
      if (stockData === null || stockData === undefined || Object.keys(stockData).length === 0) {
        console.log('could not find stock symbol');
        reject('could not find stock symbol');

      } else {
        //did find data from api
        addToDB(stockData, like, ip, res).then(result => {
          resolve(result);
        }).catch(err => {
          reject(err);
        });
      }
    });
  });
}


function addToDB(stockData, like, ip, res) {
  const tempReturnObj = {
    stock: stockData['01. symbol'],
    likes: 0,
    price: stockData['05. price']
  }

  return new Promise((resolve, reject) => { 
    //check if stock is in db
    Stock.findOne({ stock: stockData['01. symbol'] }, (err, stockObj) => {
      if(err) { 
        reject('error checking database') }

      //not found in db => create new entry
      if(stockObj === null) {
        console.log('stock not found in db');
        let tempDbObj = {
          stock: stockData['01. symbol'],
          likes: 0,
          likeIPs: []
        }

        if(like === 'true') {
          console.log('like added1');
          tempDbObj.likes++;
          tempReturnObj.likes++;
          tempDbObj.likeIPs.push(ip);
        }

        new Stock(tempDbObj).save((err, savedStock) => {
          if(err) { 
            reject('error saving stock') }

          resolve(tempReturnObj);
        });

      } else {

        //is found in db => update db
        console.log('stock found in db');
        if(like === 'true' && stockObj.likeIPs.indexOf(ip) < 0) {
          console.log('like added2');
          tempReturnObj.likes = stockObj.likes + 1;
          stockObj.likes++;
          stockObj.likeIPs.push(ip);
        }
        tempReturnObj.likes = stockObj.likes;
        console.log('stockObj')
        console.log(stockObj);
        resolve(tempReturnObj);
      }
    });
  });
}


module.exports = function (app) {
  app.route('/api/stock-prices')
  .get(function (req, res){
    const stockSymbol = req.query.stock;
    const like = req.query.like;
    const ip = (req.headers['x-forwarded-for'] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      req.connection.socket.remoteAddress).split(",")[0];

    console.log(`query = { stock: ${stockSymbol}, like: ${like}, ip: ${ip} }`);

    //no stock in query => return all stocks in db
    if(!stockSymbol) {
      console.log('no stock in query');
      Stock.find({}, (err, allStocks) => {
        if(err) { 
          return res.redirect('/') }
        
        return res.json({ stockData: allStocks });
      });
    }

    //more than two stocks in query
    if(typeof(stockSymbol) === 'object' && stockSymbol.length > 2) {
      console.log('more than 2 stocks in query');
      return res.send('Please request no more than two stocks at a time');
    }

    //if a single stock was entered
    if(typeof(stockSymbol) === 'string') {
      console.log('one stock in query');
      fetchStockData(stockSymbol, like, ip, res)
      .then(result => {
        return res.json({stockData: result});
      }).catch(err => {
        return res.send(err);
      });
    }

    //if 2 stocks
    if(typeof(stockSymbol) === 'object' && stockSymbol.length === 2) {
      console.log('2 stocks in query');
      let returnData = { stockData:[] };
      let tempStock, likesA, likesB;

      fetchStockData(stockSymbol[0], like, ip, res).then(resultA => {
        console.log('resultA=')
        console.log(resultA);

        likesA = resultA.likes;
        tempStock = {
          stock: resultA.stock,
          price: resultA.price,
          rel_likes: likesA
        }
        returnData.stockData.push(tempStock);

        fetchStockData(stockSymbol[1], like, ip, res).then(resultB => {
          console.log('resultB=');
          console.log(resultB);
          const likesB = resultB.likes;
  
          tempStock = {
            stock: resultB.stock,
            price: resultB.price,
            rel_likes: likesB - likesA
          }
  
          returnData.stockData[0].rel_likes = likesA - likesB;
          returnData.stockData.push(tempStock);

          return res.json(returnData);
        }).catch(err => {
          console.log('err1');
          console.log(err);
          return res.send(err);  
        });
      }).catch(err => {
        console.log('err2');
        console.log(err);
        return res.send(err);
      });
    }
  });
};
