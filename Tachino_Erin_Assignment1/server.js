var express = require('express'); // importing the express file from node_modules
var app = express(); //putting imported express files into function named app
var products = require(__dirname + '/public/product_data.json');
// Routing 

// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));

// monitor all requests
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});

var products = require(__dirname + '/public/product_data.json');
products.forEach( (prod,i) => {prod.total_sold = 0}); 

app.get('/product_data.js', function (request, response, next) {
   response.type('.js');
   var products_str = `var products = ${JSON.stringify(products)};`;
   response.send(products_str);
});

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
};

// process purchase request (validate quantities, check quantity available) taken from lab13 info server ex4
app.post("/invoice.html", function (request, response) {
    //response.send(request.body)
    var q = request.body['text1'];
    if (typeof q != 'undefined') {
        if (isNonNegativeInteger(q)) {  // We have a valid quantity
            
            let brand = products[0]['name'];
            let brand_price = products[0]['price'];
            products[0].total_sold += Number(q);

            response.redirect("/invoice.html");
        } else {
            response.send(`${q} is not a valid quantity -- hit the back button`);
        }
    } else {
        response.redirect("/invoice.html");
    }
});

// start server
app.listen(8080, () => console.log(`listening on port 8080`));