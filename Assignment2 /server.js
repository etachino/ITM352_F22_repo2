var express = require('express'); // importing the express file from node_modules
var app = express(); //putting imported express files into function named app 
const qs=require('node:querystring');
var fs = require('fs');
const crypto = require('crypto');
var string= {};
var ordered = "";
var algorithm = 'aes-192-cbc';

// reference sites for crypto: I used w3schools for the structure to create the function that will encrypt users password. When running the code I noticed that it would output in my terminal that is depreciated. I used my second reference to find out whether or not createCipher nodejs works. It does so therefore I kept using createCipher. 
// https://www.w3schools.com/nodejs/ref_crypto.asp
// https://stackoverflow.com/questions/60369148/how-do-i-replace-deprecated-crypto-createcipher-in-node-js
function generateCipher(TextInputted) { // Created a function using crypto so that I can call the function when user inputs password. The parameter I wrote any text so that it would be "any".
    const cipher = crypto.createCipher(algorithm, 'password') // We used const so that variable we called it cannot be redeclare, we don't want the variable to possibly get redeclared later down in the code. Since w3school used createCipher as their example we decieded to go with that. We set the parameters within createCipher to be the algorithm we want the hash and password since we want the password since we want the password to come from the user_data. 
    const ciphermade = cipher.update(TextInputted, 'utf-8', 'hex') // we called the variable cipher so that the crypto package would come down to this variable "ciphermade". Then used update so that the cipher will be updated with the data we put within the parameters. We put the "any text", utf-8 as the variable length: 8 bits, and hex as 4 bits. 
    const encrypted= ciphermade + cipher.final('hex')
    return encrypted;
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

fname = __dirname + '/user_data.json';
if (fs.existsSync(fname)) {
    var data = fs.readFileSync(fname, 'utf-8');
    var users = JSON.parse(data);
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
app.post("/process_purchase", function (request, response) {
    // Process the invoice.html form for all quantities and then redirect if quantities are valid
    let valid = true;  //going to use the boolean to verify if the quantity entered is less than the qty_available 
    let valid_num= true;
    ordered = qs.stringify(request.body);
    for (i = 0; i < products.length; i++) { // Runs loop for all products and their respective entered quantities
        let qty_name = 'quantity' + i; //going to be used to set the url string for the different quantities entered in the textbox for each product 
        let qty = request.body[qty_name]; //pulls product quantities for i and sets it to qty. to be used
        if(qty == 0) continue; //if no inputs are entered into a product quantity textbox, then continue to the next product in the qty array.
            if (isNonNegInt(qty) && Number(qty) <= products[i].qty_available) {
            //if the qty meets the above criteria, then update the product's qty sold and available with the respective product quantities entered
                products[i].qty_available -= Number(qty);//subtracts quantities from qty_available
                products[i].total_sold += Number(qty); //increments quantities to quantities sold
            } else if(isNonNegInt(qty) != true) {
                valid_num = false;
            } else if(Number(qty) >= products[i].qty_available) {
                // If the quantities enter are greater then the qty_available, then valid = false (returns)
                valid = false;
             }
            }
    //from Lab 13 info_server.new.js. For Individual Requirement 4.
    /*if the number entered is not a valid number as identified through the isNonNegInt(qty) or did not meet the other conditions set in the if statement,
    then redirect user back to the products_display page and set the submit_button parameter to the respective error message*/
    if(valid_num == false){ 
        response.redirect('products_display.html?submit_button=Please Enter Valid Quantity!');
    }
    /*if quantity available is less then the amount of quantity ordered, then redirect user back to the products_display page
    and set the submit_button parameter to the respective error message*/
    if (valid == false) {
        response.redirect('products_display.html?submit_button=Not Enough Left In Stock!');
    } else {
        // If no errors are found, then redirect to the invoice page.
        ordered = qs.stringify(request.body);
        qty_ordered = ordered;
        response.redirect(`login.html?${ordered}`);
    }
});

 // valid if the infor that user input is valid or not with IR1 encryption // Took function IsNonNegInt to build function 
 function ValidUsersInfo (entered_email, user_pass) {
    let errors = []; // let errors be open so that whatever is inputted will run through this function and valid if there is an error 
    let LoginError = false; // usererror equal false, we want to use a boolean for this so we can claim if the statement is true or false then output error 
    if (!users[entered_email]) { // if user name underfined
        LoginError = true; // there is an error than user error equal true 
        errors.push(`Please register, user name does not exsist`); // error push this message so that the user knows to register and that their user data doesn't exsist yet 
    } else { // if the username is in the user_data.json then encrypt the password 
        const user_email_data = users[entered_email].email// this allows the user_data.json file to link with the user name that client inputs, we used const so that this variable cannot be change if named again  
        const  user_pass_data = users[entered_email].password // this allows the user_data.json file to link the password that was inputted 
        const encrpt_user_password = generateCipher(user_pass) // creating a encrypt variable so that I can all the encrption function later on 
      // if the user name and user password are not correct to the data in the .json file then LoginError equals true
        if (!(user_email_data == entered_email)) { // if user name data does not equal to user name 
            console.log(entered_email);
            console.log(user_email_data);
            LoginError = true;
            errors.push(`Entered email is incorrect, please try again`)
        } if (!(user_pass_data == encrpt_user_password)) { // if user password input does not equal to user pass encrpted, we encrpted the user password so therefore we need to call the variable that we set the user password encryption to
            console.log(user_pass_data);
            console.log(encrpt_user_password);
            errors.push(`Incorrect Password, please try again`)
            LoginError = true;
        // returns errors if errors were found, and also if returns if LoginError is false  
        } }
        return {LoginError, errors};
    }
// taken from lab14 and Assignment 2 examples 
app.post("/login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    const POST = request.body; // whatever the user has enter we will call it the request.body 
    const entered_email = POST["email"].toLowerCase(); // username will equal what the client enter and we want to convert it to all lowercase 
    const user_pass = POST["password"]; // user password will equal to what the client has entered 
   
    console.log("User email=" + entered_email + " password=" + user_pass);
 // checking the users info is valid by calling the function ValidUserInfo
    const {LoginError, errors} = ValidUsersInfo(entered_email, user_pass);
    if(LoginError) {
        let err_msg = {'errors': JSON.stringify(errors)};
        errors_string = qs.stringify(err_msg);
        let email_msg = {'email': JSON.stringify(entered_email)};
        email_string = qs.stringify(email_msg);
        response.redirect('login.html?' + errors_string + '&' + ordered + '&' + email_string);

    } else {
        qty_ordered["email"] = entered_email;
        response.redirect("invoice.html?" + ordered); 
    }
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

    const encrpt_user_password = generateCipher(user_pass)
    const encrpt_user_password2 = generateCipher(user_pass2)
   //runs an if statement 
    if (users[user_email] == undefined && user_pass == user_pass2) {
        users[user_email] = {};
        users[user_email].name = user_name;
        users[user_email].password = encrpt_user_password;
        users[user_email].email = user_email;
        users[user_email].repeat_password = encrpt_user_password2;
        
        //if the users information is 
        let data = JSON.stringify(users);
        fs.writeFileSync(fname, data, 'utf-8'); 
        response.redirect(`login.html?${ordered}`);
    } else if (users[user_email] != undefined && user_pass == user_pass2) {
        response.send("User " + user_email + " already exists!");
    } else if (users[entered_email] == undefined && user_pass != user_pass2) {
        response.send("Passwords do not match!");
    }
 });

// start server and if started correctly, display message on the console. 
app.listen(8080, () => console.log(`listening on port 8080`));