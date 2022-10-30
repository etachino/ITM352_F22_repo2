var products_array = require(__dirname + '/master_product_data.json');
var express = require('express');
var app = express();

// Routing 

// monitor all requests
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});

var products = require(__dirname + '/master_product_data.json');
products.forEach( (prod,i) => {prod.total_sold = 0}); 

app.get('/master_product_data.json', function (request, response, next) {
   response.type('.js');
   var products_str = `var products = ${JSON.stringify(products)};`;
   response.send(products_str);
});

// process purchase request (validate quantities, check quantity available)
app.use(myParser.urlencoded({ extended: true }));

app.post('/process_purchase', function (req, res, next) {
    console.log(Date.now() + ': Purchase made from ip ' + req.ip + ' data: ' + JSON.stringify(req.body));
    invoice_data = invoice(req.body);
    res.json(invoice_data);
    next();
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

// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));