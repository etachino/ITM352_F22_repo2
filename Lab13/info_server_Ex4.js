var express = require('express');
var app = express();

function isNonNegativeInteger(queryString, returnErrors = false) {
    errors = []; // assume no errors at first
    if (Number(queryString) != queryString) {
        errors.push('Not a number!'); // Check if string is a number value
    } else {
        if (queryString < 0) errors.push('Negative value!'); // Check if it is non-negative
        if (parseInt(queryString) != queryString) errors.push('Not an integer!'); // Check that it is an integer
    }
    if (returnErrors) {
        return errors;
    } else if (errors.length == 0) {
        return true;
    } else {
        return false;
    }
}

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));

app.get('/test', function (request, response, next) {
    console.log("Got a test path");
    next();
});

app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});

var products = require(__dirname + '/product_data.json');
products.forEach( (prod,i) => {prod.total_sold = 0}); 

app.get("/product_data.js", function (request, response, next) {
   response.type('.js');
   var products_str = `var products = ${JSON.stringify(products)};`;
   response.send(products_str);
});

app.post("/process_form", function (request, response) {
    //response.send(request.body)
    var q = request.body['text1'];
    if (typeof q != 'undefined') {
        if (isNonNegativeInteger(q)) {  // We have a valid quantity
            
            let brand = products[0]['name'];
            let brand_price = products[0]['price'];
            products[0].total_sold += Number(q);

            response.send(`<H1>Invoice</H1><BR>Thank you for purchasing <B>${q}</B> ${brand} at ${brand_price} each for a total of ${brand_price * q}`);
        } else {
            response.send(`${q} is not a valid quantity -- hit the back button`);
        }
    } else {
        response.send("Enter some quantities!");
    }
});

app.listen(8080, () => console.log(`listening on port 8080`));