var express = require('express'); // importing the express file from node_modules
var app = express(); //putting imported express files into function named app
var products = require('./product_data.json'); // gets product data from json to send out on client side as a js file 
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
app.get('/product_data.js', function (request, response, next) { // taken from lab 13 ex4 
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str); // sends the product string from the js file 
});
// taken from lab 13 ex5, if the number is not a interger then output this and is linked to the invoice page, because the error number is redirected on the products_display.html page we don't see the 'Not a number!', 'Negative value!', and 'Not an integer!' on the invoice but this code is needed to make the invoice run with the server. 
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
// Lab 13 order_page.html // using this code so that I can call it in order to create a button when there is an error and an invalid number is enter into the text box
function checkQuantityTextbox(the_object) {
    let input_string = the_object.value;
    let error_array = isNonNegInt(input_string, true);
    if (error_array.length == 0) {
        qty_textbox_message.innerHTML = input_string;
    } else {
        qty_textbox_message.innerHTML = error_array.join("; ");
    }
};

// process purchase request (validate quantities, check quantity available) taken from lab13 info server ex4, and info_server_new, this was also from help from Professor Kazman  
app.post("/invoice.html", function (request, response) {
    let valid = true; // if the quantity is a true number then it is valid 
    let ordered = ""; // creating a string 
    let goodnum = true; // if the number is valid then it is good
    let error = "";
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
        } else if (checkQuantityTextbox(qty) == true) {
            error = "";
        }
    }
     // Errors response redirect // from Lab 13 info_server_new.js
    if (!goodnum) { // if not a valid number redirect, then redirect to products_display.html
        response.redirect(`products_display.html?error=Please enter valid number`);
     } else if (!valid) { // if quantity is greater than quanitity available redirect, then redirect to products_display.html
        response.redirect(`products_display.html?error=Please enter number equal to or less than the quantities stated available`);
     } else if (error = "") {
        response.redirect(`products_display.html?error=Please enter valid number`);
     } else { // if there are none of these errors redirect to invoice page 
        response.redirect('invoice.html?' + ordered);
     }
    });


// start server
app.listen(8080, () => console.log(`listening on port 8080`));
