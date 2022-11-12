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
   console.log(products);
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
    ordered = ""; //ordered variable creates a string that will be used in URL on the invoice page
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
        response.redirect('login?' + ordered);
    }
});

var fs = require('fs');
var fname = "user_data.json";

if (fs.existsSync(fname)) {
    var data = fs.readFileSync(fname, 'utf-8');
    var users = JSON.parse(data);
    console.log(users);
} else {
    console.log("Sorry file " + fname + " does not exist.");
}

app.get("/login", function (request, response) {
    // Give a login form
    str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="submit" value="Submit" id="submit">
<br>
Don't have an account? Register here: <input type="button" onclick="location.href='/register';" value="Register" />
</form>
</body>
    `;

//Product display -> Login + ordered -> invoice + ordered
//Product display -> Login + ordered -> Register + ordered -> login + ordered -> Invoice + ordered
    response.send(str);
 });

app.post("/login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    let POST = request.body;
    let user_name = POST["username"];
    let user_pass = POST["password"];

    console.log("User name=" + user_name + " password=" + user_pass);
    
    if (users[user_name] != undefined) {
        if (users[user_name].password == user_pass) {
            //if the user has a valid username and password and was successfully logged in, then redirect to invoice with the product quantities ordered
            response.redirect('invoice.html?' + ordered); 
        } else {
            response.redirect("/login?error='Bad password'");
        }
    } else {
        response.redirect("/login?error='Please enter username and password'");
    }
});

app.get("/register", function (request, response) {
    // Give a register form
    //Sets the following string into a variable
    str = ` 
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="password" name="repeat_password" size="40" placeholder="enter password again"><br />
<input type="email" name="email" size="40" placeholder="enter email"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    //sends a response to the users' html request that has been sent to the server. The response is then displayed showing the register page
    response.send(str); 
 });

 app.post("/register", function (request, response) {
    // once users' information is entered into the register page, post then processes the register form
    let POST = request.body; //Sets all the users' inputted information from their request into the POST variable 
    console.log(POST); //Writes the user data into a variable

    //The following 4 variables are set to individual attributes of the users' entered information
    let user_name = POST["username"]; 
    let user_pass = POST["password"];
    let user_email = POST["email"];
    let user_pass2 = POST["repeat_password"];

   //runs an if statement 
    if (users[user_name] == undefined && user_pass == user_pass2) {
        users[user_name] = {};
        users[user_name].name = user_name;
        users[user_name].password = user_pass;
        users[user_name].email = user_email;
        users[user_name].repeat_password = user_pass2;
        
        //if the users information is 
        let data = JSON.stringify(users);
        fs.writeFileSync(fname, data, 'utf-8'); 

        response.redirect('login?' + ordered);
    } else if (users[user_name] != undefined && user_pass == user_pass2) {
        response.send("User " + user_name + " already exists!");
    } else if (users[user_name] == undefined && user_pass != user_pass2) {
        response.send("Passwords do not match!");
    }


 });

// start server and if started correctly, display message on the console. 
app.listen(8080, () => console.log(`listening on port 8080`));