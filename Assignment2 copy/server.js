var express = require('express'); // importing the express file from node_modules
var app = express(); //putting imported express files into function named app
// Routing 

// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));

//gives server access to the request packet
app.use(express.urlencoded({ extended: true }));

// create response to all requests
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});

//set the product_data.json array to variable products
products = require('./public/product_data.json');

//Taken from Lab13, Ex5 
//Runs through each element in the product array and initiailly set the total_sold 0
products.forEach( (prod,i) => {prod.total_sold = 0}); 

//Taken from 
//stringify the products array on product_data.json to the variable products_str
app.get('/product_data.js', function (request, response, next) { 
   response.type('.js');
   var products_str = `var products = ${JSON.stringify(products)};`; //Stringifies the product array in the product_display.json and sets the string to = products_str variable
   response.send(products_str); 
});

//Taken from the Stor1 WOD
//check if there are any invalid quantity inputs
function isNonNegInt(quantityString, returnErrors = false) {
    errors = []; // assume no errors at first
    if (Number(quantityString) != quantityString) {
        errors.push('Not a number!'); // Check if string is a number value
} else {
    if (quantityString < 0) errors.push('Negative value!'); // Check if it is non-negative
    if (parseInt(quantityString) != quantityString) errors.push('Not an integer!'); // Check that it is an integer
}
    if (returnErrors) {
        return errors;
    } else if (errors.length == 0) {
        return true;
    } else {
        return false;
    }
};

// process POST request which will validate the quantities and check the qty_available. 
//Code source: Worked with Erin Tachino and Professor Kazman, Lab13-Ex5. 
app.post("/invoice.html", function (request, response) {
    // Process the invoice.html form for all quantities and then redirect if quantities are valid
    let valid = true;  //going to use the boolean to verify if the quantity entered is less than the qty_available 
    let ordered = ""; //ordered variable creates a string that will be used in URL on the invoice page
    let valid_num= true; 
    for (i = 0; i < products.length; i++) { // Runs loop for all products and their respective entered quantities
        let qty_name = 'quantity' + i; //going to be used to set the url string for the different quantities entered in the textbox for each product 
        let qty = request.body['quantity' + i]; //pulls product quantities for i and sets it to qty. to be used
        if (qty == "") continue; //if no inputs are entered into a product quantity textbox, then continue to the next product in the qty array.
            if (isNonNegInt(qty) && qty > 0 && Number(qty) <= products[i].qty_available) {
            //if the qty meets the above criteria, then update the product's qty sold and available with the respective product quantities entered
                products[i].qty_available -= Number(qty);//subtracts quantities from qty_available
                products[i].total_sold += Number(qty); //increments quantities to quantities sold
                ordered += qty_name + "=" + qty + "&"; //writes the URL string combining the valid quantities entered by the user
            } else if(isNonNegInt(qty) != true) {                 

                valid_num = false;
            } else if(Number(qty) >= products[i].qty_available) {
                // If the quantities enter are greater then the qty_available, then valid = false (returns)
                valid = false;
             }
            }
    //from Lab 13 info_server.new.js, errors will redirect to products display page
    //if the number entered is not a valid number as identified through the isNonNegInt(qty) or did not meet the other conditions set in the if statement, then redirect to error msg.
    if(!valid_num){ 
        response.redirect('products_display.html?error=Please Enter Valid Quantity');
    }
    //if quantity available is less then the amount of quantity ordered, then redirect to error page
    if (!valid) {
        response.redirect('products_display.html?error=Not Enough Left In Stock');
    } else {
        // If no errors are found, then redirect to the invoice page.
        response.redirect('invoice.html?' + ordered);
    }
});

// start server and if started correctly, display message on the console. 
app.listen(8080, () => console.log(`listening on port 8080`));