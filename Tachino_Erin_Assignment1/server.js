var express = require('express'); // importing the express file from node_modules
var app = express(); //putting imported express files into function named app
var products_array = require(__dirname + '/product_data.json');
// Routing 

// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));

app.get('/test', function (request, response, next) {
    console.log("Got a test path");
    next();
});

// monitor all requests
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});

var products_array = require(__dirname + '/product_data.json');
products_array.forEach( (prod,i) => {prod.total_sold = 0}); 

app.get('/product_data.js', function (request, response, next) {
   response.type('.js');
   var products_str = `var products = ${JSON.stringify(products)};`;
   response.send(products_str);
});

// process purchase request (validate quantities, check quantity available) taken from lab13 info server ex4
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

// start server
app.listen(8080, () => console.log(`listening on port 8080`));