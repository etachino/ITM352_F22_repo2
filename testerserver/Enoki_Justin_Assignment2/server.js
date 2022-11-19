// Author: Justin Enoki
// Use: this .js file creates and runs the server for the website, validating all user inputs

var express = require('express'); // referenced from lab14 server lab
var app = express();
var store_data={}; // able to store the users inputted quantity data
ordered = ""; // keeps what the user input and used to append to the query string to bring to the next page

////// IR1 encryption of the passwords //////
const crypto = require('crypto'); // used to encrypt password IR1
const algorithm = 'aes-256-cbc'; // defines the encryption algorithm
const key = 'asdfasdfasdfasdfasdfasdfasdfasdf'; // defines the key used in the algorithm, it is set so that each unique password has a specified encryption attached to it
const iv = 'asdfasdfasdfasdf'; // defines the initializing variable at its initial state, this is set instead of a randomByte method so that everytime you enter the same password, it will encyrpt as the same encrytion data. Used to match passwords when logging in

function encrypt(text) { // this function encrypts text such as passwords
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv); // defines the variable cipher to the encryption algorithm using the key and iv
    let encrypted = cipher.update(text); // updates the text with the encryption, basically encrypting the password
    encrypted = Buffer.concat([encrypted, cipher.final()]); // uses concatenation to link the series of text so that it may be output
    return encrypted.toString('hex'); // returns the encrypted password as a string so that it can be compared to the user input password
}



// routes all other GET requests to files in the public folder
app.use(express.static(__dirname + '/public'));

// gives the server access to the request packet
app.use(express.urlencoded({ extended: true }));

// creates the response for all requests
app.all('*', function (req, res, next) {
    console.log(req.method + ' to path ' + req.path);
    next();
});

// enables the products.json array to be called
products = require('./public/products.json');

// keeps track of quantity sold
products.forEach((products,i) => {products.total_sold = 0});

// referenced from Lab 13 info_server
// monitors requests
app.get("/products.js", function(req, res) {
    res.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`; // creates a string of the products found in the products file, and we can later use that string when we call it when we need the info of requested products
    //Send string of data as response to requests
    res.send(products_str);
});

// referenced from Store1 WOD
// validates the quantities
function isNonNegInt(queryString, return_errors = false) {
    errors = []; //assume there are no errors to start
    if (queryString == '') q = 0; // this handles the blank inputs as if they are 0
    if (Number(queryString) != queryString) errors.push('<font color="red"><b>Not a number!</b></font>'); // if the user input is not a number, for example like a letter, push the error and say it is not a number
    else if(queryString < 0) errors.push('<font color="red"><b>Negative value!</b></font>'); // if the input value is negative, push the error that it is a negative number
    else if (parseInt(queryString) != queryString) errors.push('<font color="red"><b>Not an integer!</b></font>'); // if the input value is not a valid integer, push the error that it is not an integer
    return return_errors ? errors : (errors.length == 0);
};

app.post("/process_form", function (req, res){ // validates user inputs from the product store page and helps transfer info to the  login page, then to the invoice page
    let valid = true; // initializes the beginning number ordered to be valid
    let valid_qty = true; // initializes the beginning number ordered to be valid, same as 'valid' but when false, pushes a different error
    

    for (i = 0; i < products.length; i++){ // computes the user input of quantity and changes the number of inventory and products sold
        let qty_name = 'quantity' + i;
        let qty = req.body['quantity' + i];
        if (qty == "") continue; // if the quantity is 0 for that product, continue to the next product
            if (isNonNegInt(qty) && qty > 0 && Number(qty) <= products[i].quantity_available) {
                products[i].quantity_available -= Number(qty); // decreases the inventory by how much the user bought
                products[i].total_sold += Number(qty); // increases by how much the user bought
                ordered += qty_name + "=" + qty + "&"; // helps append the user input to keep that info to the next pages
            } else if (isNonNegInt(qty) != true) {
                valid_qty = false; // if the quantity entered is not an integer, like a negative number, doesn't let the user proceed
            } else if (Number(qty) >= products[i].quantity_available) {
                valid = false; // if the number ordered is more than what we have available, push an error and not let the user proceed
            }
            if (qty > 0) { // means that they selected a quantity
                var no_qty = true;
            }
    }

    // create query string of all the quantities
   let qty_obj = {"quantity": JSON.stringify(req.body.quantity)};

    if(!valid_qty) {
        res.redirect('products_store.html?error=Enter a valid quantity.');
        }
        if(typeof no_qty == 'undefined') { // if all of the quantities were 0, meaning the user did not input anything, direct back to the products store page and push the error to enter in atleast one product to purchase
            res.redirect('products_store.html?error=Enter some quantity.');
            }
        //if quantity available is less then the amount of quantity ordered, then redirect to error page
        if (!valid) {
            res.redirect('products_store.html?error=Not enough products in stock.');
        } else {
            // If no errors are found, then redirect to the login page.
            store_data = qty_obj; // saves the data in store and stores it for later use
            
            let params = new URLSearchParams(req.body);
            res.redirect('./login.html?' + params.toString());
        }

});

const fs = require('fs');
// referenced from the FileIO example 1
// gets the user info data file as an array of lines
var fileName = "user_data.json";
if (fs.existsSync(fileName)) {
    data = fs.readFileSync(fileName, 'utf-8'); // creates a variable 'data' that reads the requested data from the .json file with the user info
    users = JSON.parse(data); // parses the requested data to that it can be printed/logged correctly
    console.log(users);
} else {
    console.log('Sorry, the file "' + fileName + '" does not exist.')
}

app.post("/process_login", function (request, response) { // runs the login page and validates data entered
    // this code below also grabs the email in lower case, making the email INcase sensitive, meaning to matter if it's entered in upper or lower case, it will still go through
    var user_email = request.body.email.toLowerCase(); //grabs email to be appended to the query string after login is successful and the next page can use the new info in the query string, such as the username
    var encryptpass = encrypt(request.body.password); // IR1 encrypts password they entered
    console.log(encryptpass);
    

    if (typeof users[user_email] != 'undefined') { // makes sure that if the entered email matches one of the email's in the user_data.json
        if(users[user_email].password == encryptpass) { // validates if the input password matches the password in the server data base (user_data.json)
            let params = new URLSearchParams(request.query); // searches for the store data from previous page and puts it in the params
            params.append('username', users[user_email].name); // append the username to the params ref: https://developer.mozilla.org/en-US/docs/Web/API/Element/append
            response.redirect('/invoice.html?' + ordered + params.toString()); // these appended variables are entered into the query string to bring that user input data to the next page
            return;
        } else {
            request.query.email = user_email; // keeps form sticky
            request.query.LoginError = 'Invalid password!' // if the password is incorrect, push an error and not let the user proceed
        }
    } else { 
        request.query.LoginError = 'Invalid email!'; // if the email entered is not in the data base, push an error saying the email is invalid and not let the user proceed
    }
    params = new URLSearchParams(request.query);
    response.redirect('./login.html?' + params.toString()); // if there is an error during login, redirect back to login
    
    });

app.post("/process_register", function (request, response) { // this runs the register page to ensure all data is valid
    var encryptedPass = encrypt(request.body.password); //IR1: encrypts password
    console.log(encryptedPass);
    registerError = {}; // created to store the errors so they can be printed at its precise location of where the error occurs
    register_username = request.body.username.toLowerCase(); // grabs the username info to validate it in the rules set below
    register_email = request.body.email.toLowerCase(); // grabs the email info to validate it in the rules set below
    
    // validate register form codes
    // use .test to match the pattern with the result, or more specifically match the rules to the requested data
    // ref: https://www.w3schools.com/jsref/jsref_regexp_test.asp
    // code such as /^[A-Za-z]+$/ were used from that reference as well, along with formatting, comments on how they are used are below
    
    // validate full name
    if (/^[A-Za-z\s]*$/.test(request.body.name)) { // use request.body.xxx to request the data from the inputted data in the registration form
    } else {
        registerError['name'] = 'Only letters allowed.'; // pushes an error that only allows letters and spaces in the full name
    }
    
    if (request.body.name.length > 30 || request.body.name.length < 2) { // validates that their name is of sufficient length
        registerError['name'] = 'Your name must be at least 2 characters and less than 30.'; // if the length of their full name is less than 2 or more than 30 letters, push an error
    }
    
    // validate username
    if (/^[0-9a-zA-Z]+$/.test(request.body.username)) { // validates if their username only has letters and numbers. ref: https://www.w3resource.com/javascript/form/javascript-sample-registration-form-validation.php
    } else {
        registerError['username'] = 'Username can only contain numbers and letters.'
    }
    
    if (request.body.username.length > 20 || request.body.username.length < 2){ // validates if the username if of sufficient length
        registerError['username'] = 'Username must be at least 2 characters and less than 30.'; // validates the username is long enough but not too long
    }
    
    if (typeof users[register_username] != 'undefined') {
        registerError['username'] = 'Username taken!'; // validates if there already is a user registered with that username
    }
    
    if (typeof users[register_username] == "") {
        registerError['username'] = 'Please enter a username.'; // makes sure they enter a username if they left it blank
    }
    
    // validate email
    // if statement below is used to ensure the email is formatted correctly by only allowing certain letters and symbols, such as the @ symbol
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(request.body.email)) { // ref: https://www.w3resource.com/javascript/form/email-validation.php ; used their validation expression
    } else {
        registerError['email'] = 'Enter valid email.'; // pushes error if they entered an invalid email
    }

    if (typeof users[register_email] != 'undefined') {
        registerError['email'] = 'Email already in use!'; // validates if there already is a user registered with that email
    }
    
    // validate password
    if (request.body.password.length < 10) {
        registerError['password'] = 'Password must be longer than 10 characters'; // can't have a password less than 10 letters
    }

    // IR2 & 3
    // strong password filter refrenced from: https://stackoverflow.com/questions/12090077/javascript-regular-expression-password-validation-having-special-characters
    if (/^(?=.*[\d])(?=.*[!@#$%^&*])[\w!@#$%^&*]{6,16}$/.test(request.body.password)) {
    } else {
        registerError['password'] = "Password must include at least one number and one special character"; //Error message pops upp if password does not contain at least one number or special character
    }
    
    if (request.body.password.length > 16) {
        registerError['password'] = 'Password can not be longer than 16 characters.'; // validates that the password isn't longer than 16 letters
    }
    
    if (request.body.password != request.body.password2) {
        registerError['password2'] = 'Passwords do not match.'; // makes sure the password and repeated password match
    }
    
    // object.keys() will return an array of strings for the parameter, which is our errors for our register
    // if the length of that array is more than 0, that means there is an error
    // ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
    if (Object.keys(registerError).length == 0) { // validates that the array that is being returned, which is the errors, is 0. If it is, redirect to invoice
        var email = request.body['email'].toLowerCase();
        users[email] = {};
        users[email]["name"] = request.body['name'];
        users[email]["password"] = encrypt(request.body['password']);
        
        
        fs.writeFileSync(fileName, JSON.stringify(users), "utf-8"); // creates a string from the user information on the server data base using stringify
        response.redirect('/invoice.html?' + ordered + `username=${register_username}`); // direct to the invoice page if all data is valid
    
    } else {
        request.body['registerError'] = JSON.stringify(registerError);
        let params = new URLSearchParams(request.body);
        response.redirect('./register.html?' + ordered + params.toString()); // redirects back to login page if data is invalid
    }
    
    });

    // handles the redirect to the edit page from the login page
    app.post("/redirect_edit", function (request, response){
        let user_email = request.body.email; //grabs username in lowercase
        let encryptpass = encrypt(request.body.password); //IR1: encrypts password
        console.log(encryptpass);

        if (typeof users[user_email] != 'undefined'){
            if (users[user_email].password == encryptpass) {
                store_data['email'] = users[user_email.name]; // stores the email in the store_data array
                let params = new URLSearchParams(store_data); 
                response.redirect('/edit.html?' + ordered + params.toString()); // if user login info is valid, direct to the edit page
                return;
            } else {
                request.query.email = user_email;
                request.query.LoginError = 'Invalid password' // if the password is wrong, do not proceed to edit page
            }
        } else {
            request.query.LoginError = 'Invalid email' 
        }

        params = new URLSearchParams(request.query);
        response.redirect('./login.html?' + ordered + params.toString()); // if email is wrong, do not proceed to edit page
    });

    app.post("/process_edit", function (request, response){ // runs the code for the edit info page, similar to process_register, as it will varify the same emails, passwords, etc.
        var registerError = {}; // creates a storage for register edit errors
        console.log(request.body);
        register_username = request.body.username.toLowerCase(); // grabs username from previous page in lowercase
        register_email = request.body.email.toLowerCase();


            // validate name
    if (/^[A-Za-z\s]*$/.test(request.body.name)) { // use request.body.xxx to request the data from the inputted data in the registration form
    } else {
        registerError['name'] = 'Only letters allowed.'; // pushes an error that only allows letters in the full name
    }
    
    if (request.body.name.length > 30 || request.body.name.length < 2) {
        registerError['name'] = 'Your name must be at least 2 characters and less than 30.'; // if the length of their full name is less than 2 or more than 30 letters, push an error
    }
    
    // validate username
    if (/^[0-9a-zA-Z]+$/.test(request.body.username)) { // validates if their username only has letters and numbers. ref: https://www.w3resource.com/javascript/form/javascript-sample-registration-form-validation.php
    } else {
        registerError['username'] = 'Username can only contain numbers and letters.'
    }
    
    if (request.body.username.length > 20 || request.body.username.length < 2){
        registerError['username'] = 'Username must be at least 2 characters and less than 30.'; // validates the username is long enough but not too long
    }
    
    if (typeof users[register_username] != 'undefined') {
        registerError['username'] = 'Username taken!'; // validates if there already is a user registered with that username
    }
    
    if (typeof users[register_username] == "") {
        registerError['username'] = 'Please enter a username.'; // makes sure they enter a username if they left it blank
    }
    
    // validate email
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(request.body.email)) { // ref: https://www.w3resource.com/javascript/form/email-validation.php ; used their validation expression
    } else {
        registerError['email'] = 'Enter valid email.'; // pushes error if they entered an invalid email
    }

    if (typeof users[register_email] != 'undefined') {
        registerError['email'] = 'Email already in use!'; // validates if there already is a user registered with that email
    }
    
    // validate password
    // IR2 & 3
    // strong password filter refrenced from: https://stackoverflow.com/questions/12090077/javascript-regular-expression-password-validation-having-special-characters
    if (/^(?=.*[\d])(?=.*[!@#$%^&*])[\w!@#$%^&*]{6,16}$/.test(request.body.password)) {
    } else {
        registerError['password'] = "Password must include at least one number and one special character"; //Error message pops upp if password does not contain at least one number or special character
    }

    if (request.body.password.length < 10) {
        registerError['password'] = 'Password must be longer than 10 characters'; // can't have a password less than 10 letters
    }
    
    if (request.body.password.length > 16) {
        registerError['password'] = 'Password can not be longer than 16 characters.'; // validates that the password isn't longer than 16 letters
    }
    
    if (request.body.password != request.body.password2) {
        registerError['password2'] = 'Passwords do not match.'; // makes sure the password and repeated password match
    }
    
    // object.keys() will return an array of strings for the parameter, which is our errors for our register
    // if the length of that array is more than 0, that means there is an error
    // ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
    if (Object.keys(registerError).length == 0) { // validates that the array that is being returned, which is the errors, is 0. If it is, redirect to invoice

        // delete users[store_data['username']]
        var email = request.body['email'].toLowerCase();
        users[email] = {};
        users[email]["name"] = request.body['name'];
        users[email]["password"] = encrypt(request.body['password']);
        
    
        fs.writeFileSync(fileName, JSON.stringify(users), "utf-8");

        // directs to invoice page, appending the amount ordered and their username
        response.redirect('/invoice.html?' + ordered + `username=${register_username}`); // variables that are appended to the query string are used in the invoice page to welcome the unique user and use their input quantity desired
    
    } else {
        request.body['registerError'] = JSON.stringify(registerError);
        let params = new URLSearchParams(request.body);
        response.redirect('register.html?' + ordered + params.toString()); // if an error occurs, send the user back to fix errors in register page
    }
        
    });

    app.post('/process_logout', function (request, response) {
        ordered = ""; // sets the ordered variable back to 0 so it doesn't keep ordering what was previously ordered

        response.redirect('/products_store.html?'); // directs the user back to the products store and logs them out
    
    })



// start server
var listener = app.listen(8080, () => { console.log('server listening on port ' + listener.address().port); });