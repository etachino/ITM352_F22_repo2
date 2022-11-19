/* Assignment 2
Partners: Erin Tachino and Daniel Lott
IR1 -Encryption of passwords and IR4 - must output when user last logged in and how many times they have logged in */

var express = require('express'); // importing the express file from node_modules
var app = express(); //putting imported express files into function named app 
const qs=require('node:querystring');
var fs = require('fs');
const crypto = require('crypto');
var string= {};
var order_str = "";
let secretekey = 'secretekey'

// reference sites for crypto: I used w3schools for the structure to create the function that will encrypt users password. When running the code I noticed that it would output in my terminal that is depreciated. I used my second reference to find out whether or not createCipher nodejs works. It does so therefore I kept using createCipher. Lastly, found other examples of ways to create crypto in node.js. 
// https://www.w3schools.com/nodejs/ref_crypto.asp
// https://stackoverflow.com/questions/60369148/how-do-i-replace-deprecated-crypto-createcipher-in-node-js
// https://www.tabnine.com/code/javascript/functions/crypto/createCipher
// IR1 - must encrypt password that is input by client, do not decrypt 
function generateCipher(TextInputted) { // Created a function using crypto so that I can call the function when user inputs password. The parameter I wrote any text so that it would be "any".

    cipher = crypto.createCipher('aes192', secretekey) 
    /* We used const so that variable we called it cannot be redeclared, we don't want the variable to possibly get redeclared 
    later down in the code. Since w3school used createCipher as their example we decieded to go with that. We set the parameters 
    within createCipher to be the algorithm we want the hash and password since we want the password since we want the password to 
    come from the user_data.json*/

    let ciphermade = cipher.update(TextInputted, 'utf8', 'hex') 
    /*We called the variable cipher so that the crypto package 
    would come down to this variable "ciphermade". Then used update so that the cipher will be updated with the data we put within 
    the parameters. We put the "any text", utf-8 as the variable length: 8 bits, and hex as 4 bits.*/
    ciphermade += cipher.final('hex') 
    /* We created another variable so that we can add the string to the crypto packpage. This will encrpyt the string that is 
    inputted and then used .final because once this method is called the cipher no longer be used to encrypt data. */
    return ciphermade;
  }

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

// from lab 14 ex4.js 
fname = __dirname + '/user_data.json'; // creating a variable to call the user_data.json file 
if (fs.existsSync(fname)) { // reads entire file 
    var data = fs.readFileSync(fname, 'utf-8');
    var users = JSON.parse(data); // var users lets the file parse through the data within the user_data.json 
    console.log(users);
} else {
    console.log("Sorry file " + fname + " does not exist.");
}

//Taken from Lab13, Ex5 
//Runs through each element in the product array and initiailly set the total_sold 0
products.forEach( (prod,i) => {prod.total_sold = 0}); 

//Taken from 
//stringify the products array on product_data.json to the variable products_str
app.get('/product_data.js', function (request, response, next) { 
   response.type('.js');
   var products_str = `var products = ${JSON.stringify(products)};`; 
   //Stringifies the product array in the product_display.json and sets the string to = products_str variable
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
app.post("/process_purchase", function (request, response) {
    // Process the invoice.html form for all quantities and then redirect if quantities are valid
    let valid = true;  //going to use the boolean to verify if the quantity entered is less than the qty_available 
    let valid_num= true;
    order_str = qs.stringify(request.body); // creates a string given the object we put within the parameters 
    for (i = 0; i < products.length; i++) { // Runs loop for all products and their respective entered quantities
        let qty_name = 'quantity' + i; //going to be used to set the url string for the different quantities entered in the textbox for each product 
        let qty = request.body[qty_name]; //pulls product quantities for i and sets it to qty. to be used
        if(qty == 0) continue; //if no inputs are entered into a product quantity textbox, then continue to the next product in the qty array.
            if (isNonNegInt(qty) && Number(qty) <= products[i].qty_available) {
            //if the qty meets the above criteria, then update the product's qty sold and available with the respective product quantities entered
                products[i].qty_available -= Number(qty);//subtracts quantities from qty_available
                products[i].total_sold += Number(qty); //increments quantities to quantities sold
                order_str = qs.stringify(request.body); // creates a string using the request.body
            } else if(isNonNegInt(qty) != true) { // if quantities is not equal to a valid number than it is false 
                valid_num = false;
            } else if(Number(qty) >= products[i].qty_available) { // If the quantities enter are greater then the qty_available, then valid = false (returns)
                valid = false;
             }
            }
    //from Lab 13 info_server.new.js. For Individual Requirement 4.
    /*if the number entered is not a valid number as identified through the isNonNegInt(qty) or did not meet the other conditions set in the if statement,
    then redirect user back to the products_display page and set the submit_button parameter to the respective error message*/
    if(valid_num == false){ 
        response.redirect('products_display.html?submit_button=Please Enter Valid Quantity!' + '&' + order_str);
    /*if quantity available is less then the amount of quantity ordered, then redirect user back to the products_display page
    and set the submit_button parameter to the respective error message*/
    } else if (valid == false) {
        response.redirect('products_display.html?submit_button=Not Enough Left In Stock!' + '&' + order_str);
    } else {
        // If no errors are found, then redirect to the invoice page.
        qty_ordered = order_str;
        response.redirect(`login.html?${order_str}`);
    }
});

// taken from lab14 and Assignment 2 examples 
app.post("/login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    let POST = request.body; // whatever the user has enter we will call it the request.body 
     entered_email = POST["email"].toLowerCase(); // username will equal what the client enter and we want to convert it to all lowercase  
    var user_pass = generateCipher(POST['password']);
    console.log("User email=" + entered_email + " password=" + user_pass);
    if (typeof users[entered_email] != 'undefined') { // makes sure that if the entered email matches one of the email's in the user_data.json
        if(users[entered_email].password == user_pass) { // validates if the input password matches the password in the server data base (user_data.json)
            let params = new URLSearchParams(request.query); // searches for the store data from previous page and puts it in the params
            params.append('username', users[entered_email].name); // append the username to the params ref: https://developer.mozilla.org/en-US/docs/Web/API/Element/append
            
            response.redirect('/invoice.html?' + '&' + order_str + '&' + `email=${entered_email}` + '&' + `name=${users[entered_email].name}`); // these appended variables are entered into the query string to bring that user input data to the next page
            return;
        } else {
            request.query.email = entered_email; // keeps form sticky
            request.query.LoginError = 'Invalid password!' // if the password is incorrect, push an error and not let the user proceed
        }
    } else { 
        request.query.LoginError = 'Invalid username!';
    }
    params = new URLSearchParams(request.query);
    response.redirect('./login.html?' + '&' +  order_str + '&' + `errors=${request.query.LoginError}`); // if there is an error during login, redirect back to login
    
    });

app.post("/register", function (request, response) {
    // once users' information is entered into the register page, post then processes the register form
    let POST = request.body; //Sets all the users' inputted information from their request into the POST variable 
    console.log(POST); //Writes the user data into a variable
    //The following 4 variables are set to individual attributes of the users' entered information

    let encrpt_user_password = generateCipher(POST["password"]);
     let reg_error = {};
      user_name = POST["name"]; 
      user_pass = POST["password"];
      user_email = POST["email"];
      user_pass2 = POST["repeat_password"];

     let onlyletters = /^[A-Za-z]+$/; // only allows letters 
    /* case insensitive - format must be ex. erin@gmail.com */
     let email_valid_input = /^[A-Za-z0-9_.]+@([A-Za-z0-9_.]*\.)+([a-zA-Z]{2}|[a-zA-Z]{3})$/; 
    /* case sensitive - format must have at least special character "!", one number "2", and upper and lower case letters */
     // let password_valid_input = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!#\$%&@;:])/;  ?????


     
     // validate name
    if(onlyletters.test(POST.name)) {
    } else {
        reg_error['name'] = 'Must only use valid letters';
    }

    if(POST.name > 30 || POST.name < 2) {
        reg_error['name'] = 'Full name must be at least 2 characters long, no more than 30 character allowed'
    } 

    // validate email
    if(email_valid_input.test(POST.email)) {
    } else {
        reg_error['email'] = 'Please enter valid email';
    }
    if(typeof users[user_email] != 'undefined') {
        reg_error['email'] = 'Email already exsist'
    }

    // validate password 
    if((POST['password'].length) < 10) {
        reg_error['password'] = 'Password must be longer than 10 characters'
    }
    if((POST['password']) != POST['repeat_password']) {
        reg_error['repeat_password']
    }

    if (Object.keys(reg_error).length == 0) { // validates that the array that is being returned, which is the errors, is 0. If it is, redirect to invoice
        var email = POST['email'].toLowerCase();
        users[email] = {};
        users[email]["name"] = POST['name'];
        users[email]["password"] = encrpt_user_password;
        users[email]["email"] = POST['email'];

        
        
        fs.writeFileSync(fname, JSON.stringify(users), "utf-8"); // creates a string from the user information on the server data base using stringify
        response.redirect('/login.html?' + order_str + `name=${user_name}`); // direct to the invoice page if all data is valid
    } else {
        POST['reg_error'] = JSON.stringify(reg_error);
        let params = new URLSearchParams(POST);
        response.redirect('register.html?' + order_str + params.toString()); // redirects back to login page if data is invalid
    }
 });

 app.post("/redirect_tologin", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    let POST = request.body; // whatever the user has enter we will call it the request.body 
     entered_email = POST["email"].toLowerCase(); // username will equal what the client enter and we want to convert it to all lowercase  
    var user_pass = generateCipher(POST['password']);
    console.log("User email=" + entered_email + " password=" + user_pass);
    if (typeof users[entered_email] != 'undefined') { // makes sure that if the entered email matches one of the email's in the user_data.json
        if(users[entered_email].password == user_pass) { // validates if the input password matches the password in the server data base (user_data.json)
           qty_ordered['email'] = users[entered_email.name];
           let params = new URLSearchParams(qty_ordered); // searches for the store data from previous page and puts it in the params
           response.redirect('/user_update.html?' + '&' + order_str + params.toString());
           return;
        } else {
            request.query.email = entered_email; // keeps form sticky
            request.query.LoginError = 'Invalid password!' // if the password is incorrect, push an error and not let the user proceed
        }
    } else { 
        request.query.LoginError = 'Invalid username!';
    }
    params = new URLSearchParams(request.query);
    response.redirect('./login.html?' + order_str + params.toString()); // if there is an error during login, redirect back to login
    });

 app.post("/user_update", function (request, response) {
    // once users' information is entered into the register page, post then processes the register form
    let POST = request.body; //Sets all the users' inputted information from their request into the POST variable 
    console.log(POST); //Writes the user data into a variable
    //The following 4 variables are set to individual attributes of the users' entered information
    let encrpt_user_password = generateCipher(POST["password"]);
     let reg_error = {};
      user_name = POST["name"]; 
      user_pass = POST["password"];
      user_email = POST["email"];
      user_pass2 = POST["repeat_password"];

     let onlyletters = /^[A-Za-z]+$/; // only allows letters 
    /* case insensitive - format must be ex. erin@gmail.com */
     let email_valid_input = /^[A-Za-z0-9_.]+@([A-Za-z0-9_.]*\.)+([a-zA-Z]{2}|[a-zA-Z]{3})$/; 
    /* case sensitive - format must have at least special character "!", one number "2", and upper and lower case letters */
     // let password_valid_input = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!#\$%&@;:])/;  ?????


     
     // validate name
    if(onlyletters.test(POST.name)) {
    } else {
        reg_error['name'] = 'Must only use valid letters';
    }

    if(POST.name > 30 || POST.name < 2) {
        reg_error['name'] = 'Full name must be at least 2 characters long, no more than 30 character allowed'
    } 

    // validate email
    if(email_valid_input.test(POST.email)) {
    } else {
        reg_error['email'] = 'Please enter valid email';
    }
    if(typeof users[user_email] != 'undefined') {
        reg_error['email'] = 'Email already exsist'
    }

    // validate password 
    if((POST['password'].length) < 10) {
        reg_error['password'] = 'Password must be longer than 10 characters'
    }
    if((POST['password']) != POST['repeat_password']) {
        reg_error['repeat_password']
    }

    if (Object.keys(reg_error).length == 0) { // validates that the array that is being returned, which is the errors, is 0. If it is, redirect to invoice
        var email = POST['email'].toLowerCase();
        users[email] = {};
        users[email]["name"] = POST['name'];
        users[email]["password"] = encrpt_user_password;
        users[email]["email"] = POST['email'];

        fs.writeFileSync(fname, JSON.stringify(users), "utf-8"); // creates a string from the user information on the server data base using stringify
        response.redirect('/invoice.html?' + '&' + order_str + '&' + `email=${entered_email}` + '&' + `name=${users[entered_email].name}`); // direct to the invoice page if all data is valid
    } else {
        POST['reg_error'] = JSON.stringify(reg_error);
        let params = new URLSearchParams(POST);
        response.redirect('register.html?' + order_str + params.toString()); // redirects back to login page if data is invalid
    }
 });
 

// start server and if started correctly, display message on the console. 
app.listen(8080, () => console.log(`listening on port 8080`));