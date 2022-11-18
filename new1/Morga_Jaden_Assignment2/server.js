/*
Jaden Morga
Assignment 2 
This is the server.js file that runs the server for my store and contains instructions for specific requests
*/

//Encryption and Decryption 
//Code Referenced from https://stackoverflow.com/questions/51280576/trying-to-add-data-in-unsupported-state-at-cipher-update

//This allows you to put anything in here, you have to choose a string to server as the "key" to encrypt and decrypt
let secrateKey = "secrateKey";
//Requires crypto library
const crypto = require('crypto');

//Function to encrypt the text
function encrypt(text) {
    encryptalgo = crypto.createCipher('aes192', secrateKey);
    let encrypted = encryptalgo.update(text, 'utf8', 'hex');
    encrypted += encryptalgo.final('hex');
    return encrypted;
}
//Function to dercypt text
function decrypt(encrypted) {
    decryptalgo = crypto.createDecipher('aes192', secrateKey);
    let decrypted = decryptalgo.update(encrypted, 'hex', 'utf8');
    decrypted += decryptalgo.final('utf8');
    return decrypted;
}

//Checks to see encrypted version of password in the terminal
console.log(encrypt('grader'));

//Define variables used 
//Taken from Lab 13 Exercise 3a
var express = require('express');
var app = express();
var qs = require('querystring');

// requires user_data.json file for user information, taken from examples given by Port 
var fs = require('fs');
var filename = './user_data.json';

//used to store quantity data from products disiplay page
//assume empty at first
var temp_info = {};


//IR5:  Keep track of # of users logged in 
// Create an object to keep count of how many users are logged in
var status = {};

//POST data can be decoded from the browser body
app.use(express.urlencoded({ extended: true }));

//respond to any req for any path
app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});
//products data from json file and stores it
var products = require(__dirname + '/products.json');

//to track quantity sold
products.forEach((prod, i) => { prod.total_sold = 0 });

//monitor requests
app.get("/products.js", function (request, response, next) {
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    //Send string of data as response to requests
    response.send(products_str);
});
app.post('/process_form', function (request, response) {
    var POST = request.body;

    // Assume no quantities
    var Valid_Purchase = false;
    // Create an errorsObject to store error messages
    var errorsObject = {};

    //For Loop that checks if their is a valid quantity inputted
    for (let i = 0; i < products.length; i++) {
        // Retrieve the quantity input from the POST method
        qtys = POST[`quantity` + i];


        // Code demonstrated by Professor in class for Assignment 1 Workshop
        //Checks if it is a valid purchase
        //If there's no quantities selected push an error & create flag to see if there are quantities in the input boxes
        Valid_Purchase = Valid_Purchase || (qtys > 0);

        // Code demonstrated by Professor in class for Assignment 1 Workshop on 11/1
        if (isNonNegInt(qtys, false) == false) {
            // If there is an error, make the error message the values for key q_error${i}        
            errorsObject[`q_error${i}`] = isNonNegInt(qtys, true);
        }
    }
    // Statements are OUTSIDE of the loop, because you can only response ONCE 
    // If there are no empty input boxes AND the purchase is valid, then it will assign quantity inputted as total sold
    if ((Valid_Purchase == true) && (Object.keys(errorsObject).length == 0)) {
        // Calculate the quantity sold by adding the user input
        for (let i in products) {
            // Re-define the response here 
            qtys = POST[`quantity` + i];
            // Calculate total sold by adding the user input after each form submission
            products[i].total_sold += Number(qtys);
            // Next, take the quantity available and calculate "Remaining-number of quantities" to output how many more products are availble for sale
            products[i].quantity_available = products[i].quantity_available - Number(qtys);
            // Store the quantities in the temp_data object so that it can be passed to the invoice
            temp_info[`quantity${[i]}`] = POST[`quantity${[i]}`];

        }
        // Line is OUTSIDE of the loop because you don't want to have more than one response
        response.redirect("./login.html?" + qs.stringify(request.body));
    }
    // If all input boxes are empty AND if the purchase input is invalid
    // Redirect to index.html with appended key: noQuantities and value: "Please enter a quantity"
    else if ((Valid_Purchase == false) && (Object.keys(errorsObject).length == 0)) {
        response.redirect("./index.html?" + qs.stringify(request.body) + `&noQuantities=Please enter a quantity`);
    }
    // If there is an input error, meaning the errorsObject has something in it
    // Redirect to index.html with appended key: inputError and value: "Please correct all errors"
    // AND append the errorsObject as a string
    else if ((Object.keys(errorsObject).length > 0)) {
        response.redirect("./index.html?" + qs.stringify(request.body) + `&inputError=Please correct all errors` + `&` + qs.stringify(errorsObject));
        console.log(errorsObject);
    }


});

// Adopted from Assignment 2 code examples given by Port
app.use(express.urlencoded({ extended: true }));
// Checks for the existence of the file
//Referenced from Lab 13 Exercise 2B
if (fs.existsSync(filename)) {
    // if it exists, read the file user_data.json stored in filename
    var data = fs.readFileSync(filename, 'utf-8');
    // parse user data
    var user_data = JSON.parse(data);
}
// POST request from login.html
//Adopted from Assignment 2 code examples on ITM 352 website
app.post("/process_login", function (req, res) {
    // process a simple register form
    // Get the username inputted from the request body
    //Inspired by Lab 13 Ex 3 a
    var the_email = req.body.email.toLowerCase();
    //IR 1  Encrypt users passwords 
    var encryptedPassword = encrypt(req.body.password);

    //Error message if username is taken
    if (typeof user_data[the_email] != 'undefined') {
        // Check if password matches username
        if (user_data[the_email].password == encryptedPassword) {
            // if there are no errors, store user info in temp_info and send to invoice.  
            temp_info['email'] = the_email;
            status[the_email] = true;
            temp_info['name'] = user_data[the_email].name;

            // This will store the number of loggedin users to temp_data
            // The number of users in the system will be appended to the URL and can be found using params.get('users')
            //Counts how many users are logged in
            temp_info['users'] = Object.keys(status).length

            let params = new URLSearchParams(temp_info);
            // Send to invoice page if login successful
            res.redirect('/invoice.html?' + params.toString());
            // ends process
            return;
            // if the password does not match the password entered then error message for wrong password
        } else {
            req.query.email = the_email;
            req.query.LoginError = 'Invalid password!';
        }
    } else { // if the username is undefined there's an error
        // Error message for user that doesn't exist
        req.query.LoginError = 'Invalid username!';
    }
    // if not back to login with errors.    
    params = new URLSearchParams(req.query);
    //redirect to login if there are errors
    res.redirect("./login.html?" + params.toString());
});

// POST request form register for account
//Inspired by Lab 13 Ex 3 a
// Registration validation adpoted & modified from https://www.w3resource.com/javascript/form/javascript-sample-registration-form-validation.php
app.post("/process_register", function (req, res) {
    // assume no errors at start
    var reg_errors = {};
    // Import email from submitted page
    var reg_email = req.body.email.toLowerCase();


    // Email validation: makes sure correct email format is being inputted into user textbox
    //Check if the fullname is valid (charcters in parathenthesis taken from stack overflow)
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})*$/.test(req.body.email)) {
    } else {
        // error message for email that doesn't match the standard email format
        reg_errors['email'] = "Invalid email.";
    }
    // error message for email if it's already taken
    if (user_data[reg_email] != undefined) {
        reg_errors['email'] = 'Email taken.'
    }
    //Name Validation: Makes sure only letters with a length of 1-30 are entered corrrectly
    //Name must be ALL in letters (charcters in parathenthesis taken from stack overflow)
    if (/^[A-Za-z\s]+$/.test(req.body.fullname)) {
    }
    else {
        //Error message pops up if it contains invalid characters
        reg_errors['fullname'] = 'Enter name with letter characters only';
    }
    //If nothing is entered 
    if (req.body.fullname == "") {
        //Error message will pop up to enter name
        reg_errors['fullname'] = 'Enter name';
    }
    //Length of name must be greater than 2 and no bigger than 30 characters long 
    if (req.body.fullname.length > 30 && req.body.fullname.length < 2) {
        reg_errors['fullname'] = 'Name exceeds 30 characters';
    }

    // Password must have more tham 10 chracters
    //Charcters in parathenthesis is taken from https://stackoverflow.com/questions/12090077/javascript-regular-expression-password-validation-having-special-characters
    //IR2 Require that passwords have at least one number and one special character (charcters in parathenthesis taken from stack overflow)
    if (/^(?=.*[\d])(?=.*[!@#$%^&*])[\w!@#$%^&*]{6,16}$/.test(req.body.password)) {
    } else {
        //Error message pops upp if password does not contain at least one number or special character
        reg_errors['password'] = "Password must have at least one number and one special character";
    }
    if (req.body.password.length < 10) {
        // Error message pops up if password doesn't exceed 10 characters
        reg_errors['password'] = "Password must be more than 10 characters.";
    }

    // Password Confirmation to make sure two passwords entered match
    if (/^(?=.*[\d])(?=.*[!@#$%^&*])[\w!@#$%^&*]{6,16}$/.test(req.body.password)) {
    } else {
        //Error message pops upp if password does not contain at least one number or special character
        reg_errors['password'] = "Password must have at least one number and one special character";
    }
    if (req.body.password !== req.body.confirmpassword) {
        //Error message will pop up if two passwords entered are not the same
        reg_errors['confirmpassword'] = "Passwords are not the same."
    }

    // Save registration data to json file and send to invoice page if registration successful. 
    // Assignment 2 Example Code : Reading and writing user info to a JSON file
    if (Object.keys(reg_errors).length == 0) {
        var email = req.body['email'].toLowerCase();
        user_data[email] = {};
        // information entered is added to user_data
        //Inspired by Lab 13 Ex 4
        user_data[email]['name'] = req.body['fullname'];
        user_data[email]['password'] = encrypt(req.body['password']);
        // Set the user's status to loggedin
        user_data[email]['status'] = "loggedin"

        // Send the user's email to the array status
      status[email]=true;
        // Finds how many users are active
        temp_info['users'] = Object.keys(status).length;
        // username and email from temp_info  variable added into file as username and email
        temp_info['email'] = email;
        temp_info['name'] = user_data[email]["name"];
        let params = new URLSearchParams(temp_info);
        // If registered send to invoice with product quantity data
        res.redirect('./invoice.html?' + params.toString());
    }
    // If errors exist, redirect to registration page with errors 
    else {
        req.body['reg_errors'] = JSON.stringify(reg_errors);
        let params = new URLSearchParams(req.body);
        // redirect to signup page after errors popup
        res.redirect('register.html?' + params.toString());
    }
});
//IF LOGIN IS CORRECT, USER CAN EDIT REGISTRATION DATA
// POST request from login.html
//Adopted from Assignment 2 code examples on ITM 352 website
app.post("/redirect_edit", function (req, res) {
    // process a simple register form
    // Get the username inputted from the request body
    //Inspired by Lab 13 Ex 3 a
    var encryptedPassword = encrypt(req.body.password);
    var the_email = req.body.email.toLowerCase();
    //If email is found in user_data...
    if (typeof user_data[the_email] != 'undefined') {
        // If password matches username
        if (user_data[the_email].password == encryptedPassword) {
            // if there are no errors, store user info in temp_info and send to invoice.  
            temp_info['email'] = the_email;
            let params = new URLSearchParams(temp_info);
            // Send to invoice page if login successful
            res.redirect('/edit.html?' + params.toString());
            // ends process
            return;
            // i the password does not match the password entered then......
        } else {
            req.query.email = the_email;
            // Error message for wrong password
            req.query.LoginError = 'Invalid password!';
        }
    } else { // if the username is undefined there's an error
        // Error message for user that doesn't exist
        req.query.LoginError = 'Invalid username!';
    }
    // if not back to login with errors.    
    params = new URLSearchParams(req.query);
    //redirect to login if there are errors
    res.redirect("./login.html?" + params.toString());
});
//EDIT USER REGISTRATION 
// Registration validation adpoted & modified from https://www.w3resource.com/javascript/form/javascript-sample-registration-form-validation.php
app.post("/process_edit", function (req, res) {
    // assume no errors at start
    var reg_errors = {};

    // Email validation: makes sure correct email format is being inputted into user textbox
    //Check if the fullname is valid (charcters in parathenthesis taken from stack overflow)
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})*$/.test(req.body.email)) {
    } else {
        // error message for email that doesn't match the standard email format
        reg_errors['email'] = "Invalid email.";
    }
    //Name Validation: Makes sure only letters with a length of 1-30 are entered corrrectly
    //Name must be ALL in letters (charcters in parathenthesis taken from stack overflow)
    if (/^[A-Za-z\s]+$/.test(req.body.fullname)) {
    }
    else {
        //Error message pops up if it contains invalid characters
        reg_errors['fullname'] = 'Enter name with letter characters only';
    }
    //If nothing is entered 
    if (req.body.fullname == "") {
        //Error message will pop up to enter name
        reg_errors['fullname'] = 'Enter name';
    }
    //Length of name must be greater than 2 and no bigger than 30 characters long 
    if (req.body.fullname.length > 30 && req.body.fullname.length < 2) {
        reg_errors['fullname'] = 'Name exceeds 30 characters';
    }

    // Password must have more tham 10 chracters
    //Charcters in parathenthesis is taken from https://stackoverflow.com/questions/12090077/javascript-regular-expression-password-validation-having-special-characters
    //IR2 Require that passwords have at least one number and one special character (charcters in parathenthesis taken from stack overflow)
    if (/^(?=.*[\d])(?=.*[!@#$%^&*])[\w!@#$%^&*]{6,16}$/.test(req.body.password)) {
    } else {
        //Error message pops upp if password does not contain at least one number or special character
        reg_errors['password'] = "Password must have at least one number and one special character";
    }
    if (req.body.password.length < 10) {
        // Error message pops up if password doesn't exceed 10 characters
        reg_errors['password'] = "Password must be more than 10 characters.";
    }

    // Password Confirmation to make sure two passwords entered match
    if (/^(?=.*[\d])(?=.*[!@#$%^&*])[\w!@#$%^&*]{6,16}$/.test(req.body.password)) {
    } else {
        //Error message pops upp if password does not contain at least one number or special character
        reg_errors['password'] = "Password must have at least one number and one special character";
    }
    if (req.body.password !== req.body.confirmpassword) {
        //Error message will pop up if two passwords entered are not the same
        reg_errors['confirmpassword'] = "Passwords are not the same."
    }

    // Save registration data to json file and send to invoice page if registration successful. 
    // Assignment 2 Example Code : Reading and writing user info to a JSON file
    if (Object.keys(reg_errors).length == 0) {
        console.log(user_data);
        //Delete email once logged out
        delete user_data[temp_info['email']];
        var email = req.body['email'].toLowerCase();
        user_data[email] = {};
        // information entered is added to user_data
        //Inspired by Lab 13 Ex 4
        user_data[email]['name'] = req.body['fullname'];
        user_data[email]['password'] = encrypt(req.body['password']);

        user_data[email].status = 'loggedin';
        
        // Send the user's email to the array status
      status[email]=true;
      // Finds how many users are active
      temp_info['users'] = Object.keys(status).length;

        // username and email from temp_info  variable added into file as username and email
        temp_info['email'] = email;
        temp_info['name'] = user_data[email]["name"];
        let params = new URLSearchParams(temp_info);
        // If registered send to invoice with product quantity data
        res.redirect('./invoice.html?' + params.toString());
        console.log(user_data);
    }
    // If errors exist, redirect to registration page with errors 
    else {
        req.body['reg_errors'] = JSON.stringify(reg_errors);
        let params = new URLSearchParams(req.body);
        // redirect to signup page after errors popup
        res.redirect('edit.html?' + params.toString());
    }
});
//Trashing login in email
app.post('/process_logout', function (request, response) {
    // Get the user's email from the hidden textbox
    var email = request.body.email.toLowerCase();
//Deletes users information stored in temp_info
    delete temp_info['email'];
    delete temp_info['name'];
    delete temp_info['users'];
    //Delete email in the object
    delete status.email
    // Log Out Status
    user_data[email].status = "loggedout";
    // redirect the user to index if they choose to log out
    response.redirect('/index.html?');

})

// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));
// starts server
app.listen(8080, () => console.log(`listening on port 8080`));

//Everytime this is ran it clears out my errors
function isNonNegInt(arrayElement, returnErrors = false) {

    // Prioritizing the errorsObject to display errors rather than this array
    errors = [];

    // Checks if arrayElement is a non-neg integer. If returnErrors is true, the array of errors is returned.
    // Otherwise returns true if arrayElement is non-neg int.
    //If input is nothing than assigns it to zero
    //Referenced from Store 1 WOD & modified 
    if (arrayElement == '') arrayElement = 0;
    if (Number(arrayElement) != arrayElement) errors.push('Not a number!'); // Check if string is a number value
    else {
        if (arrayElement < 0) errors.push('Negative value!'); // Check if it is non-negative
        if ((parseInt(arrayElement) != arrayElement) && (arrayElement != 0)) errors.push('Not an integer!'); // Check that it is an integer
    }

    return returnErrors ? errors : (errors.length == 0);
}