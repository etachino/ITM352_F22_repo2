var express = require('express');
var app = express();

app.get('/test', function (request, response, next) {
    console.log("Got a test path");
    next();
});

app.all('*', function (request, response, next) {
    response.send(request.method + ' to path ' + request.path);
});
app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here to do a callback
// app.all - will respond to wither get or post 
// * - every path 
// rule action with set of pairs - can put any as many rules 
// server can respond to request 