var express = require('express');
var app = express();

app.use(express.static(__dirname + '/public'));

app.get('/test', function (request, response, next) {
    console.log("Got a test path");
    next();
});

app.all('*', function (request, response, next) {
    response.send(request.method + ' to path ' + request.path);
});

app.listen(8080, () => console.log(`listening on port 8080`)); 