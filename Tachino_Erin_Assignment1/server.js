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
products.forEach((products, i) => { products.total_sold = 0 }); // IR1 OPTIONAL (From Lab 13; info_server_new.js)
// server is getting products data from the product_data.json and outputting it as a js file to the html page
// server is getting products data from the product_data.json and outputting it as a js file to the html page
app.get('/product_data.js', function (request, response, next) {
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
});
// need to move into /invoice to create messages
function isNonNegInt(qty, returnErrors = false) {
    error_msg = []; // assume no errors at first
    if (qty == "") {
        qty = 0}
    else if (Number(qty) != qty) {
        error_msg.push('Not a number!'); // Check if string is a number value
    } else if (qty < 0) {
      error_msg.push('Negative value!'); // Check if it is non-negative
    } else if (parseInt(qty) != qty) {
        error_msg.push('Not an integer!'); // Check that it is an integer 
    } 
    return (returnErrors ? error_msg : (error_msg.length == 0))
};
function checkQuantityTextbox(qty, i, returnErrors = false) {
    error_msg = [];
    if (Number(qty) > products[i].quantity_available) {
        error_msg.push('<input type="submit" value=${error_msg}>');
    }
    return returnErrors ? error_msg : (error_msg.length == 0)
};

/// process purchase request (validate quantities, check quantity available) taken from lab13 info server ex4, and info_server_new, this was also from help from Professor Kazman  
app.post("/invoice.html", function (request, response) {
    let valid = true; // if the quantity is a true number then it is valid 
    let ordered = ""; // creating a string 
    let goodnum = true; // if the number is valid then it is good
    let error_msg = "";
    for (i = 0; i < products.length; i++) {
        let quantity_name = 'quantity' + i;
        let qty = request.body['quantity' + i];
        if (qty == "") continue; 
        if (isNonNegInt(qty) && qty > 0 && Number(qty) <= products[i].quantity_available) { // if the number is a interger and the quantity is greater than zero and the number is less than or equal to the quantity available for product 
            products[i].quantity_available -= Number(qty); // when page is refreshed quantites available updates 
            products[i].total_sold += Number(qty);
            ordered += quantity_name + "=" + qty + "&";
        } else if(isNonNegInt(qty) != true) { // if the interger is not one than this is false 
            goodnum = false;
        } else if (Number(qty) >= products[i].quantity_available) { // if it is number enter is more than quantity available than this is false 
            valid = false;     
        } else if (checkQuantityTextbox(qty) != true) {
            error_msg = "";
        }
    }
     // Errors response redirect // from Lab 13 info_server_new.js
    if (!goodnum) { // if not a valid number redirect, then redirect to products_display.html
        response.redirect(`products_display.html?error=Please enter valid number?`);
     } else if (!valid) { // if quantity is greater than quanitity available redirect, then redirect to products_display.html
        response.redirect(`products_display.html?error=Please enter number equal to or less than the quantities stated available`);
     } else if (error_msg = "") {
        response.redirect(`products_display.html?<input type="submit" value="Please Select Some Items to Purchase!">`);
     } else { // if there are none of these errors redirect to invoice page 
        response.redirect('invoice.html?' + ordered);
     }
    });

// start server
app.listen(8080, () => console.log(`listening on port 8080`));