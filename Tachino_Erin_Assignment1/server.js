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
    function generate_item_rows(product_quantities_array){
        for(i=0; i<product_quantities_array.length; i++){
          if(quantities[i]==0){
            continue;
          }  
          errorArray = isNonNegInt(quantities[i], true);
            if(errors.length==0){
              extended_price = product_quantities_array[i] * products[i].price;
              (subtotal += extended_price)
            } else {extended_price=0}
    // Process the form by redirecting to the receipt page
    var products = request.body[`quantities${i}`];
    if (typeof products != 'undefined') {
        if (isNonNegativeInteger($quantities[i])) {  // We have a valid quantity
            response.redirect('invoice.html?quantity=' + products);
        } else {
            response.redirect('products_display.html?error=Invalid%20Quantity&quantity_textbox=' + products); // Lab13 Ex5
        }
    }
});

// start server
app.listen(8080, () => console.log(`listening on port 8080`));