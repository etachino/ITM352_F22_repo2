var express = require('express'); // importing the express file from node_modules
var app = express(); //putting imported express files into function named app
var products = require('./product_data.json');
// Routing 

// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));

// monitor all requests
app.all('*', function (request, response, next) {
    console.log(request.method + ' to ' + request.path);
    next();
});
products.forEach((prod, i) => { products[i].total_sold = 0 });
// server is getting products data from the product_data.json and outputting it as a js file to the html page
app.get('/product_data.js', function (request, response, next) {
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
});
// need to move into /invoice to create messages
function isNonNegInt(queryString, returnErrors = false) {
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
    let valid = true; // if the quantity is a true number then it is valid 
    let ordered = ""; // creating a string 
    let goodnum = true; // if the number is valid then it is good
    for (i = 0; i < products.length; i++) {
        let quantity_name = 'quantity' + i;
        let qty = request.body['quantity' + i];
        if (qty == "") continue; 
        if (isNonNegInt(qty) && qty > 0 && Number(qty) <= products[i].quantity_available) {
            products[i].total_sold += Number(qty);
            ordered += quantity_name + "=" + qty + "&";
      // We have a valid quantity and is <= quantity available 
        } else if(isNonNegInt(qty) != true) {
            goodnum = false;
        } else if (Number(qty) >= products[i].quantity_available) {
            valid = false;     
        }
    }
     // Errors response redirect 
        if (!goodnum) { // if not a valid number redirect 
        response.redirect(`products_display.html?error=Invalid%20Quantity,%20Please%20Enter%20Valid%20Number!`);
     } else if (!valid) { // if quantity is greater than quanitity available redirect 
        response.redirect(`products_display.html?error=Invalid%20Quantity,%20Please%20Enter%20Value%20Number%20Equal%20Or$20Less%20Than%20Quantity%20Avaiable!`);
     } else { // if there are none of these errors redirect to invoice page 
        response.redirect('invoice.html?' + ordered);
     }  
   
    }
    
);


// start server
app.listen(8080, () => console.log(`listening on port 8080`));

// why do i get kicked back when one text box is not filled in
// why is two of my products loading null
// why is it show "not a number" in all textboxes even though they have a number 
// why is my shipping and tax not getting processed, also my extended value 