## FCC-Stock-Checker
##### Stock Price Checker project for [freeCodeCamp](https://freecodecamp.org/)
##### Check it out [here](https://fcc-stock-check.glitch.me/)

<br/>
<br/>

##### Objective: Build a full stack JavaScript app that is functionally similar to this: https://giant-chronometer.glitch.me/
###### User stories:
- Set the content security policies to only allow loading of scripts and css from your server.
- I can GET /api/stock-prices with form data containing a Nasdaq stock ticker and recieve back an object stockData.
- In stockData, I can see the stock(string, the ticker), price(decimal in string format), and likes(int).
- I can also pass along field like as true(boolean) to have my like added to the stock(s). Only 1 like per ip should be accepted.
- If I pass along 2 stocks, the return object will be an array with both stock's info but instead of likes, it will display rel_likes(the difference between the likes on both) on both.
- All 5 functional tests are complete and passing.

<br/>
<br/>

##### Technologies used to complete this project
- JavaScript
- Node
- Express
- Helmet
- Mocha
- Chai
- [Alpha Vantage](https://www.alphavantage.co/) API
