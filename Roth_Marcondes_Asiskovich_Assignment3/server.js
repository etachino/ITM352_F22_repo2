//Assignment #3: Adding Sessions to your e-Commerce Web-site by Bobby Roth, Eva Asiskovich, and Alexandre Marcondes
//We have added numerous features in addition to making the website more personalized and secure.
//Some features include a shopping cart so users can shop at their leisure, we added more products, and an invoice that is now emailed to the user for each transaction.
//In addition to the new products we have enabled navigation of multiple product pages.
//We also made sure to maintain a users state such as keeping track of the users login status, items saved in the shopping cart, and even the users identity.

//Additionally, since we are working as a team we have implemented an admin back-end.
//THis will authorize administrative users the capabilities to change various aspects of user and product data which includes account information and product inventories.

//use express
//This is a node function that uses the express module for the purpose of calling other files, aka returns a function reference.
var express = require('express');

//call session
var session = require('express-session');
var cookieParser = require('cookie-parser');
var nodemailer = require('nodemailer');
//use middleware
var app = express();


// Includes crypto module for encryption
const crypto = require('crypto');

// set global variables as booleans so that these can be used throughout the code.
user_error = false; //this variable is used in the login and registration forms as well as in if/else statements for validation using booleans. If they come back true, then an alert will be sent to the user.
password_error = false; //This variable has the same purpose as the variable above except it is explicitly used for validating passwords. For example making sure the password confirmation matches correctly.
email_exists = false; //This global boolean variable checks to make sure that when a user registers the does not already exist in our database.
//IF a user registers with an already existant email, then the user will receive an alert and will not be able to move forward with their registration until a proper email has been put in.
listOfUsers = []; //This global variable is used to show the list of how many users are currently logged in out website
//load in the products json 
products_array = require(__dirname + '/products.json');
//implement read file
var fs = require('fs');
var fname = 'user_data.json';
var pname = 'products.json';
var data = fs.readFileSync(fname, 'utf-8');
var data2 = fs.readFileSync(pname, 'utf-8');
var users = JSON.parse(data);
var products = JSON.parse(data2);


//get type of i in the for loop when generating the invoice or cart. Loops through the number of types of products
function get_type(number) {
  var type;
  if (number == 0) {
    type = "fish";
  }
  else if (number == 1) {
    type = "tank";
  }
  else {
    type = "plant";
  }
  return type
}
//function to calculate the extended price
function calculateExtendedPrice(price, index) {
  return price * index;
}

//function to calculate the total number of cart in session
//received help from ASSIGNMENT3 CODE EXAMPLES
var calculateTotalCartItems = function (req, res) {
  var total = 0;
  let shopping_cart = req.session.cart;
  for (product_key in shopping_cart) {
    total += shopping_cart[product_key].reduce((a, b) => a + b);
  }
  return total;
}
//function to generate the shipping
function generateShipping(subtotal) {
  var shipping;
  if (subtotal <= 50) {
    shipping = 2;
  }
  else if (subtotal <= 100) {
    shipping = 5;
  }
  else {
    shipping = subtotal * .05;
  }
  return shipping;
}


//function to check if valid integer
function checkNonNegInt(value, returnErrors = false) {
  errors = [];

  if (value < 0 || parseInt(value) != value || Number(value) != value) {
    errors.push("Please enter a valid number!\n");
  }
  if (errors.length == 0) {
    returnErrors = true;
  }
  else {
    return errors;
  }
  return returnErrors;
}

//function to call for the log in tab if logged in itll display logout + username otherwise display login/register
function checkIfLoggedIn(username) {
  let msg = "Logout " + username;
  if (typeof username == 'undefined') {
    msg = "Login/Register";
  }
  else if (users[username].isAdmin) {
    msg = "ADMIN";
  }
  return msg;
}
//function to display the name when going into the cart if not logged in just say hello otherwise say hello with thier name
function displayCartFullname(username) {
  let msg = "Hello ";
  if (typeof username != 'undefined') {
    msg = "Hello " + users[username].fullname + " ";
  }
  return msg;
}


//generate Hash received help from https://www.npmjs.com/package/crypto-js
function generateHash(password) {

  // Node.js program to demonstrate the    
  // crypto.createHash() method
  // Defining key
  const secret = password;

  // Calling createHash method
  const hash = crypto.createHash('sha256').update(secret).digest("hex")
  return hash;
}
//compare Hash passwords
function compareHash(password, hashed) {
  if (password == hashed) {
    return true;
  }
  else {
    return false;
  }
}
//function to check if email exists
function checkEmailExists(email) {
  let text = email;
  text = text.toLocaleLowerCase();
  for (i in users) {
    if (text.match(users[i].email.toLocaleLowerCase())) {
      return true
    }
  }
  return false
}

//received help from youtube video on creating regex at https://www.youtube.com/watch?v=QxjAOSUQjP0
//function to check if email is in proper format of X@Y.Z
function CheckEmailFormat(inputText) {
  var mailformat = /^([A-Za-z\d\.-_]+)@([A-Za-z\d\.]+)\.([A-Za-z]{2,3})$/;
  if (inputText.match(mailformat)) {
    return true;
  }
  else {
    return false;
  }
}



//call in middleware
var bodyParser = require("body-parser");
const { response, application } = require('express');
const e = require('express');
const { match } = require('assert');
const { resolveSoa } = require('dns');
const { off, getMaxListeners } = require('process');
const { type } = require('os');
const { request } = require('http');
const req = require('express/lib/request');
const res = require('express/lib/response');
const { param } = require('express/lib/request');
app.use(bodyParser.urlencoded({ extended: false }));

//monitor all requests
app.all('*', function (request, response, next) {
  console.log(request.method + ' to ' + request.path);

  next();
});

//route all other GET requests to files in public
app.use(express.static(__dirname + '/public'));
app.use(session({ secret: "MySecretKey", resave: true, saveUninitialized: true }));
app.use(cookieParser());
//use cookieParser


//get home page when localhost:8080 is typed
app.get("/", function (req, res) {
  res.redirect("/home");
});

//get cart from session for browser
//received help on code examples assignment3
app.post("/get_cart", function (request, response) {
  response.json(request.session.cart);
});

//upload products.js on the client side received code help from assignment2 lab
app.get("/products.js", function (request, response) {
  response.type('js');
  var products_str = `var products = ${JSON.stringify(products_array)};`;
  response.send(products_str);
})
app.post("/get_products_data", function (request, response) {
  response.json(products_array);
});

//post request to /purchase
app.post('/purchase', function (req, res) {
  let error = false;
  let obj = req.body;
  let arr = Object.values(obj);
  let arry = [];
  let username = req.cookies["username"];

  //push the object from params for quantities into an array called arry
  arr.forEach(function (value, key) {
    arry.push(value);

    // if not valid integer THEN throw an error message
    if (checkNonNegInt(value, true) != true && value != 0) {

      res.redirect('cart?error');
      error = true;
    }
  })

  if (error == false) {
    //CHECK TO SEE IF THEY ARE LOGGED IN
    if (typeof username == "undefined") {
      res.redirect("/login");
    }
    //IF ERROR IS FALSE AND THEY LOGGED IN THEN GO TO INVOICE
    else {
      res.redirect('./invoice');
    }
  }
})

//get request for login gives a login form with username and password
app.get("/login", function (request, response) {

  // Give a simple login form
  let params = new URLSearchParams(request.query);
  let identified_User = request.cookies['username'];
  //if cookies loggin exists then make it logout and destroy the cookie
  if (typeof identified_User != 'undefined') {
    //input the last time they logged in
    //date received help from lab 6
    var date = new Date();
    hours = date.getHours();
    time = (hours < 12) ? 'AM' : 'PM';
    hours = ((hours + 11) % 12 + 1);
    minutes = date.getMinutes();
    minutes = ((minutes < 10) ? `0${minutes}` : `${minutes}`);
    new_date = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear() + " " + hours + ":" + minutes + time;
    users[request.cookies["username"]].lastTime = new_date;
    data = JSON.stringify(users);
    fs.writeFileSync(fname, data, 'utf-8');
    users = JSON.parse(data);
    //reading params logout from admin page when logged out
    if (params.has("logout")) {
      //clear from list of users
      listOfUsers.splice(listOfUsers.indexOf(users[identified_User].fullname), 1);
      //clear the cookie
      response.clearCookie(["username"]);
      //go back to home 
      response.redirect('/home');
    }
    else if (users[identified_User].isAdmin) {
      response.redirect("adminpage");
    }
    else {
      if (typeof request.session.last_Page_Visited == "undefined") {
        users[identified_User].last_Page_Visited = "/home";
      }
      else {
        users[identified_User].last_Page_Visited = request.session.last_Page_Visited;
      }
      let data = JSON.stringify(users);
      fs.writeFileSync(fname, data, 'utf-8');
      //clear list of users 
      listOfUsers.splice(listOfUsers.indexOf(users[identified_User].fullname), 1);
      //clear the cookie
      response.clearCookie(["username"]);
      //go back to home 
      response.redirect('/home');
    }
  }
  // call in string for login form
  else {
    response.write(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Homemade+Apple" />
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
      <link rel="stylesheet" href="../new_style.css">
      <title>Login</title>
      
  </head>
  <header>
  <nav class="navbar navbar-inverse">
  <div class="navbar-header">
  <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
    <span class="icon-bar"></span>
    <span class="icon-bar"></span>
    <span class="icon-bar"></span>
  </button>
  <p class="navbar-brand" href="#">Betta</p>
</div>

<div class="collapse navbar-collapse" id="myNavbar">
  <ul class="nav navbar-nav">
    <li> <a href="home">Home</a> </li>
    <li> <a href="store?type=fish">Fish</a> </li>
    <li> <a href="store?type=tank">Tanks</a> </li>
    <li> <a href="store?type=plant">Plants</a> </li>
  </ul>
  <form class="navbar-form navbar-left" method="GET" action="/search">
    <div class="input-group">
      <input type="search" placeholder="Search" id="Search" name="searchValue" class="form-control"
        autocomplete="off" onsubmit "openPage()">
      <ul class="list"></ul>
      <div class="input-group-btn">

        <button class="btn btn-default" type="submit">
          <i class="glyphicon glyphicon-search"></i>
        </button>
        <script src="./searchFunctions.js" type="text/javascript"></script>

      </div>
    </div>
  </form>
  <ul class="nav navbar-nav navbar-right">
    <li><a href="/cart"><span class="glyphicon glyphicon-shopping-cart"></span><span>${calculateTotalCartItems(request, response)}</span></a></li>
    <li><a href="/login">Login/Register</a></li>

  </ul>
</div>
  </nav>
</header>

<body>
<script>
if(${user_error == true})
{
  alert("Invalid username or password");
  ${user_error = false}
}
</script>
<div class= "full-screen-container">
<div class="login-container">
<h1 class="login-title">Login</h1>
<form class="form" action="?${params.toString()}" name = "form2" method="POST">
<div class="input2-group">
<label for="username">Username</label>
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<label for="password">Password</label>
<input type="password" name="password" size="40" placeholder="enter password"><br />
</div>
<input type="submit"; value="Submit" id="submit" class="login-button"><br>
</form>
<script>
if(${params.has("username")})
{
  let user_name = "${params.get("username")}";
  document.form2.username.value = user_name;
}
</script>


<p><a href = "./register">Create account</a></p>
</body>
  `);
    response.end();
  }
});

//get request for reguest send a simple form for user, name, email, and password
app.get('/register', function (req, res) {

  //grab params from url
  let params = new URLSearchParams(req.query);
  //check if there is identitified user
  let identified_User = req.cookies['username'];
  //send a string for a form of register
  res.send(

    `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Homemade+Apple" />
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
        <link rel="stylesheet" href="../new_style.css">
        <title>Register</title>
     
    </head>
    <header>
    <nav class="navbar navbar-inverse">
    <div class="navbar-header">
    <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
      <span class="icon-bar"></span>
      <span class="icon-bar"></span>
      <span class="icon-bar"></span>
    </button>
    <p class="navbar-brand" href="#">Betta</p>
  </div>
  
  <div class="collapse navbar-collapse" id="myNavbar">
    <ul class="nav navbar-nav">
      <li> <a href="home">Home</a> </li>
      <li> <a href="store?type=fish">Fish</a> </li>
      <li> <a href="store?type=tank">Tanks</a> </li>
      <li> <a href="store?type=plant">Plants</a> </li>
    </ul>
    <form class="navbar-form navbar-left" method="GET" action="/search">
      <div class="input-group">
        <input type="search" placeholder="Search" id="Search" name="searchValue" class="form-control"
          autocomplete="off" onsubmit "openPage()">
        <ul class="list"></ul>
        <div class="input-group-btn">
  
          <button class="btn btn-default" type="submit">
            <i class="glyphicon glyphicon-search"></i>
          </button>
          <script src="./searchFunctions.js" type="text/javascript"></script>
  
        </div>
      </div>
    </form>
    <ul class="nav navbar-nav navbar-right">
      <li><a href="/cart"><span class="glyphicon glyphicon-shopping-cart"></span><span>${calculateTotalCartItems(req, res)}</span></a></li>
      <!-- <li><a href="#"><span class="glyphicon glyphicon-user"></span> Your Account</a></li>-->
      <li><a href="/register">Login/Register</a></li>
  
    </ul>
  </div>
    </nav>
  </header>
    <script>
    //function to check strong password help form https://www.w3resource.com/javascript/form/password-validation.php
function CheckPassword(inputtxt) {
  var paswd = /^(?=.*[0-9])(?=.*[!@#$%^&*,'\.])[a-zA-Z0-9!@#$%^&*,'\.]{10,16}$/;
  if (inputtxt.value.match(paswd)) {
      return true;
  }
  else {
      alert('Please put strong password. 1 special character and 1 number. Minimum 10 characters and maximum 16 characters.')
      return false;
       }
  }     
 
  //received help from youtube video on creating regex at https://www.youtube.com/watch?v=QxjAOSUQjP0
  function CheckEmail(inputText)
  {
  var mailformat = /^([A-Za-z\d\.-_]+)@([A-Za-z\d\.]+)\.([A-Za-z]{2,3})$/;
  if(inputText.value.match(mailformat))
  {
  return true;
  }
  else
  {
  alert("You have entered an invalid email address!");
  return false;
  }
  }
  //function to validate the email on return submit makes sure everythign is good
  function ValidateData(email, password, username, fullname)
  {
 
    let user_length = username.length;
    let fullname_length = fullname.length;
    if(CheckPassword(password)== true && CheckEmail(email) == true && user_length != 0 && fullname_length != 0)
    {
      return true;
    }
    else
    {
      document.form1.email.value = email.value;
      document.form1.fullname.value = fullname;
      document.form1.username.value = username;
      document.form1.password.value = "";
      document.form1.secondpassword.value = "";
      return false;
    }
   
  }
  //function to check for the password strength. Used in IR3
  
  function checkPasswordStrength(pass)
  {
    let strong_pass = /^(?=.*[0-9])(?=.*[!@#$%^&*,'\.])[a-zA-Z0-9!@#$%^&*,'\.]{10,16}$/;
    if(pass.match(strong_pass))
    {
      document.getElementById("passworderror").innerHTML = "Strong!";
      document.getElementById('passworderror').style.color='green';
 
    }
    else
    {
      document.getElementById("passworderror").innerHTML = "Weak";
      document.getElementById('passworderror').style.color='red';
    }
  }

 
    </script>
    <body>
    <div class= "full-screen-container2">
    <div class="login-container">
    <h1 class="login-title">Register</h1>
    <form name = "form1"; method = "post" action = "?${params.toString()}"; onsubmit="return ValidateData(document.form1.email, document.form1.password, document.form1.username.value, document.form1.fullname.value)" >
    <div class="input2-group">
    <label for="email">Email</label>
    <input type = "email" name = "email" size="40" placeholder="enter email";>
    <br>
    <label for="fullname">Fullname</label>
    <input type = "text" name = "fullname" size="40"; placeholder="enter full name" minlength = "2"; maxlength="30">
    <br>
    <label for="username">Username</label>
    <input type = "text" name = "username" size="40" placeholder="enter username" minlength = "2"; maxlength="30">
    <br>
    <label for="Password">Password</label>
    <input type = "password" name = "password" onkeyup = "checkPasswordStrength(this.value)") size="40" placeholder="enter password";  minlength = "10"; maxlength="16">
    <div id = "passworderror"><p></p></div>
    <br>
    <label for="ConfirmPassword">ConfirmPassword</label>
    <input type = "password" name = "secondpassword" size="40" placeholder="enter password again"  minlength = "10"; maxlength="16">
    <br>
    </div>
    <button type = "submit" class = "login-button" >Register</button>
    
    </form>
    
    <script>
    //check to see if params has email, if it does then make it sticky
    if(${params.has("email")})
    {
      let email = "${params.get("email")}";
      let user_name = "${params.get("username")}";
      let full_name = "${params.get("fullname")}";
      document.form1.email.value = email;
      document.form1.username.value = user_name;
      document.form1.fullname.value = full_name;
    } 
      //this code looks at the global variable booleans throws alerts if any are true
      if(${user_error == true})
      {
        alert("User name is taken");
        ${user_error = false};
      }
      else if(${password_error == true})
      {
        alert("Passwords do not match");
        ${password_error = false};
      }
      else if(${email_exists} == true)
      {
        alert("Email already exists!");
        ${email_exists = false};
      }
  
 
    </script>
    <br>
    <br>
    <p><a href = "./login">Back To Login</a></p>
    </body>
    `
  )

})

app.get("/add_cart", function (req, res) {

  let params = new URLSearchParams(req.query).toString();
  var type = req.query['type']; // get the product key sent from the form post
  //create an array called quantities
  let quantities = [];
  //set a boolean for error 
  //this is so that if there is an error then
  //make sure the user can redirect to the product page displaying the error message
  let error = false;
  //we want to loop through the products array length
  for (var i = 0; i < products_array[type].length; i++) {
    //we want to push our quantity into the array called quantities
    quantities.push(Number(req.query['betta' + i]));
    // if not valid integer THEN throw an error message
    if (checkNonNegInt(quantities[i], true) != true && quantities[i] != 0) {
      //if there is an error then we want to redirect back to the store page throwing the error message
      res.redirect('store?error=&' + params);
      //set the boolean of error to be true
      error = true;
      break;
    }
  }

  //if there are no errors that means that we can continue to add to our cart session
  if (error == false) {
    //create a variable called shopping_cart to be equal to the session cart
    shopping_cart = req.session.cart;
    //check to see if there exists a shopping cart
    if (typeof shopping_cart == 'undefined') {
      //if there exists no shopping cart then we want to create an empty object
      //then set the array with the name of type to be equal to the quantities array
      //recieved help from ASSIGNMENT 3 EXAMPLES
      req.session.cart = {};
      req.session.cart[type] = quantities;
    }
    //this is to check if there is a shopping cart
    //but the shopping cart of the array name does not exists
    //if it does not exist then we set a new array of the type name
    //to be equal to the quantities array
    else if (typeof shopping_cart[type] == 'undefined') {
      req.session.cart[type] = quantities;
    }
    //this is saying that there already exists an a cart
    //we want to continue to add to the cart but also check to see
    //for validations we want to check if the quantities added with the cart existed quantities
    //if it exceeds our quantity available then we dont want to add it 
    else {
      for (var i = 0; i < products_array[type].length; i++) {
        if ((quantities[i] + req.session.cart[type][i]) >= products_array[type][i].quantity_available) {
          req.session.cart[type][i] = products_array[type][i].quantity_available;
        }
        else {
          req.session.cart[type][i] += quantities[i];
        }
      }
    }
    res.redirect('./store?type=' + type);
  }

})
//get request to update the cart whenever new value in cart is inputed
app.get("/update_Cart_Session", function (req, res) {
  //get the params
  let params = new URLSearchParams(req.query);
  //loop through each param
  params.forEach(function (value, element) {
    //get param name
    element.toString();
    //split param name and get string index
    let string_Index = element.substring(element.indexOf('_') + 1);
    //conver string index to number
    let index = Number(string_Index);
    //get the type 
    let type = element.substring(0, element.indexOf('_'));
    //update the new cart 
    req.session.cart[type][index] = Number(value);
  })
  //redirect back to cart
  res.redirect("/cart");
})
app.post("/remove_Cart_Session", function (req, res) {
  //get body of form
  let body = req.body;
  if (Object.keys(body).length == 1) {
    req.session.destroy();
    res.redirect("/cart");
  }
  else {
    //get the string params
    let string_Params = new URLSearchParams(req.query).toString();
    //split param name and get string index
    let string_Index = string_Params.substring(string_Params.indexOf('_') + 1);
    //conver string index to number
    let index = Number(string_Index);
    //get the type 
    let type = string_Params.substring(string_Params.indexOf('=') + 1, string_Params.indexOf('_'));
    req.session.cart[type][index] = 0;
    res.redirect("/cart");
  }

})


//get request to generate the cart
app.get("/cart", function (req, res) {
  //get the session cart
  let shopping_cart = req.session.cart;
  //get the username return msg "login/register" or their username
  let username = checkIfLoggedIn(req.cookies["username"]);
  //check if the there is a session shopping cart if not generate a page that says nothing in your shopping cart
  if (typeof shopping_cart == 'undefined') {
    res.write(`<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Shopping Cart</title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
        <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"/>    
        <link rel="stylesheet" href="../new_style.css">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Karma">
        <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Homemade+Apple" />
      </head> 
      <header>
  <nav class="navbar navbar-inverse">
  <div class="navbar-header">
  <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
  <span class="icon-bar"></span>
  <span class="icon-bar"></span>
  <span class="icon-bar"></span>
</button>
<p class="navbar-brand" href="#">Betta</p>
</div>
<div class="collapse navbar-collapse" id="myNavbar">
      <ul class="nav navbar-nav">
          <li> <a href="home" >Home</a> </li>
          <li> <a href="store?type=fish" >Fish</a> </li>
          <li> <a href="store?type=tank">Tanks</a> </li>
          <li> <a href="store?type=plant">Plants</a> </li>
      </ul>
      <form class = "navbar-form navbar-left" method = "GET" action = "/search">
      <div class="input-group">
      <input type = "search" placeholder = "Search" id = "Search" name = "searchValue" class = "form-control" autocomplete = "off" onsubmit "openPage()">
      <ul class="list"></ul>
      <div class="input-group-btn">
      <button class="btn btn-default" type="submit">
      <i class="glyphicon glyphicon-search"></i>
      </button>
      <script src="./searchFunctions.js" type="text/javascript"></script>
      </div>
      </div>
     </form>
      `)
    //if user is not signed in then do not write the edit icon
    if (typeof req.cookies["username"] == "undefined") {
      res.write(`
    <ul class="nav navbar-nav navbar-right">
    <li><a href="/cart"><span class="glyphicon glyphicon-shopping-cart"></span><span>${calculateTotalCartItems(req, res)}</span></a></li>
    <!-- <li><a href="/cart" style = "margin-bottom: -5px;"><span class="glyphicon glyphicon-user"></span> Your Account</a></li>-->
    <li><a href="/login">${username}</a></li>

  </ul>
</div>
</nav>
</header>`)
    }
    //write the header with the edit icon since they are logged in 
    else {
      res.write(`
    <ul class="nav navbar-nav navbar-right">
    <ul class="nav navbar-nav navbar-right">
    <li><a href="/cart"style = "margin-top: -1px; margin-bottom:2px"><span class="glyphicon glyphicon-shopping-cart"></span><span>${calculateTotalCartItems(req, res)}</span></a></li>
    <li><a href="/edit" style = "margin-bottom: -5px;"><span class="glyphicon glyphicon-user"></span></a></li>
    <li><a href="/login" style = "margin-top: 2px; margin-bottom:-2px">${username}</a></li>

  </ul>
</div>
</nav>
</header>
`)
    }
    res.write(`
  <body>
  <h1 style = "text-align: center">Nothing is in your shopping cart!</h1>
  </body>
  </html>
  `);
    res.end()
  }
  else {

    res.write(`<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Shopping Cart</title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
        <link href="https://maxcdn.bootstrapcdn.com/font-awesome/5.0.0/css/font-awesome.min.css" rel="stylesheet"/>    
        <link rel="stylesheet" href="../new_style.css">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Karma">
        <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Homemade+Apple" />
        
        <script>
        // This function asks the server for a "service" and converts the response to text. Help from code example in assignment 3
        function loadJSON(service, callback) {   
            var xobj = new XMLHttpRequest();
            xobj.overrideMimeType("application/json");
            xobj.open('POST', service, false);
            xobj.onreadystatechange = function () {
                  if (xobj.readyState == 4 && xobj.status == "200") {
                    // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
                    callback(xobj.responseText);
                  }
            };
            xobj.send(null);  
         }
    
        var products;
        loadJSON('get_products_data', function (response) {
          // Parsing JSON string into object
          products = JSON.parse(response);
      });
      //check if it is a positive integer
      function checkNonNegInt(value, returnErrors = false) {
          errors = [];

          if (value < 0 || parseInt(value) != value || Number(value) != value) {
              errors.push("Please enter a valid number!");
          }
          if (errors.length == 0) {
              returnErrors = true;
          }
          else {
              return errors;
          }
          return returnErrors;
      }
        //function to update the extended price it makes it dynamic whenever new input is added
        function updateExtendedPrice(value, price, id, type, index)
        {
          //get the product
          let product = products[type];
          index = Number(index);
          //get id of extended_Price at position
          let element = 'extended_Price' + id;
          //get input id of quantity
          let input_Element = 'quantity_Input' + id;
          //get input id of row
          let row_Element = 'row' + id;
          //calculate new extended_price
          let new_Extended_Price = (value * price).toFixed(2);
          //change inner html of id to new extended price
          if (value > product[index]["quantity_available"]) {
            document.getElementById(input_Element).value = product[index]["quantity_available"];
            document.getElementById(element).innerHTML = '$' + new_Extended_Price;
          }
          else if(value == "")
          {
            document.getElementById(input_Element).value = "";
          }
          else if(value <= 0)
          {
            //change the action to remove from the cart
            document.getElementById("cartForm").action = '/remove_Cart_Session?removedElement=' + type + '_' + index ;
            //set the method to be post
            document.getElementById("cartForm").method = 'post';
            //submit the form
            document.getElementById("cartForm").submit();
            //remove the row
            document.getElementById(row_Element).remove();
           
          }
          else if(checkNonNegInt(value, true) != true)
          {
            alert("Please enter valid number");
            document.getElementById(input_Element).value = 1;
          }
          else
          {
            document.getElementById(element).innerHTML = '$' + new_Extended_Price;
            document.getElementById("cartForm").action = '/update_Cart_Session';
            document.getElementById("cartForm").method = 'get';
            document.getElementById("cartForm").submit();
            
          
          }
        }
        
        function add_To_Value(id, price, type, index)
        {
          //get id of extended_Price at position
          let element = 'quantity_Input' + id;
          //get the input value
          let input = document.getElementById(element).value;
          //change to number because it was a string
          let number = Number(input);
          //increment new number by adding 1
          let newNumber = number + 1;
          //set input value to new number
         document.getElementById(element).value = newNumber;
         //update extended price
         updateExtendedPrice(newNumber, price, id, type, index);
        }
        function subtract_To_Value(id, price, type, index)
        {
          //get id of extended_Price at position
          let element = 'quantity_Input' + id;
          //get the input value
          let input = document.getElementById(element).value;
          //change to number because it was a string
          let number = Number(input);
          //increment new number by subtracting 1
          let newNumber = number - 1;
         document.getElementById(element).value = newNumber;
         //update the extended price
         updateExtendedPrice(newNumber, price, id, type, index);
        }
        function goToInvoice()
        {  
          document.getElementById("cartForm").action = '/invoice';
          document.getElementById("cartForm").method = 'post';
        }
        </script>
        </head> 
        <header>
        <nav class="navbar navbar-inverse">
        <div class="navbar-header">
        <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <p class="navbar-brand" href="#">Betta</p>
      </div>
      <div class="collapse navbar-collapse" id="myNavbar">
            <ul class="nav navbar-nav">
                <li> <a href="home" >Home</a> </li>
                <li> <a href="store?type=fish" >Fish</a> </li>
                <li> <a href="store?type=tank">Tanks</a> </li>
                <li> <a href="store?type=plant">Plants</a> </li>
            </ul>
            <form class = "navbar-form navbar-left" method = "GET" action = "/search">
            <div class="input-group">
            <input type = "search" placeholder = "Search" id = "Search" name = "searchValue" class = "form-control" autocomplete = "off" onsubmit "openPage()">
            <ul class="list"></ul>
            <div class="input-group-btn">
            <button class="btn btn-default" type="submit">
            <i class="glyphicon glyphicon-search"></i>
            </button>
            <script src="./searchFunctions.js" type="text/javascript"></script>
            </div>
            </div>
           </form>
            `)
    //if there is no cookie do not add the edit icon
    if (typeof req.cookies["username"] == "undefined") {
      res.write(`
          <ul class="nav navbar-nav navbar-right">
          <li><a href="/cart"><span class="glyphicon glyphicon-shopping-cart"></span><span>${calculateTotalCartItems(req, res)}</span></a></li>
          <!-- <li><a href="/cart" style = "margin-bottom: -5px;"><span class="glyphicon glyphicon-user"></span> Your Account</a></li>-->
          <li><a href="/login">${username}</a></li>
      
        </ul>
      </div>
      </nav>
      </header>`)
    }
    //if there is a cookie add the edit icon
    else {
      res.write(`
          <ul class="nav navbar-nav navbar-right">
          <ul class="nav navbar-nav navbar-right">
          <li><a href="/cart"style = "margin-top: -1px; margin-bottom:2px"><span class="glyphicon glyphicon-shopping-cart"></span><span>${calculateTotalCartItems(req, res)}</span></a></li>
          <li><a href="/edit" style = "margin-bottom: -5px;"><span class="glyphicon glyphicon-user"></span></a></li>
          <li><a href="/login" style = "margin-top: 2px; margin-bottom:-2px">${username}</a></li>
      
        </ul>
      </div>
      </nav>
      </header>
      `)
    }
    res.write(`
  <body>
  <h1 style = "text-align: center">${displayCartFullname(req.cookies["username"])}here is what you have so far</h1>
  <table style = "margin-left: auto; margin-right: auto; margin-top: 100px; height: 400px; width: 30%; height: 250px">
  <tbody>
  <tr>
  <th style = "text-align: center; width: 43%">Item</th>
  <th style = "text-align: center; width: 16%">Quantity</th>
  <th style = "text-align: center; width: 13%">Price</th>
  <th style = "text-align: center; width: 54%">Extended Price</th>
  </tr>
  <form action = "/invoice" method = "post" id = "cartForm" onsubmit = "goToInvoice()">
   `)
    //define variable called subtotal
    var subtotal = 0;
    //define variable called extended_Price
    var extended_Price = 0;
    //define tax_rate variable and assign it 
    var tax_rate = .0575;
    //do "fish" first
    var type;
    for (var i = 0; i < Object.keys(products_array).length; i++) {
      //get the type based on i value
      //for i =0 type = "fish"
      //for i =1 type ="tank"
      ///for i =3 type = "plant"
      type = get_type(i);
      //if the shopping cart is undefined then continue through the loop
      if (typeof shopping_cart[type] == 'undefined') {
        continue;
      }
      //if there is a shopping cart 
      else {
        //loop through the array based on product type
        for (var j = 0; j < products_array[type].length; j++) {
          //check to see if the quantity is 0
          //if quantity is 0 then dont write
          if (shopping_cart[type][j] == 0) {
            continue;
          }
          //if there are valid quantitities then display the cart table
          else {

            res.write(`<tr id = "row${type + j}">
            <td style = "text-align: center; width: 43%">${products_array[type][j].name}</td>
            <td style = "text-align: center; width: 13%">
            <input type = "button" value = "-" onclick = "subtract_To_Value('${type + j}', ${products_array[type][j].price},'${type}', '${j}')">
            <input type = "text" name = ${type + '_' + j} id = "quantity_Input${type + j}" value = ${shopping_cart[type][j]} onkeyup = "updateExtendedPrice(this.value, ${products_array[type][j].price}, '${type + j}','${type}', '${j}')"  style = "width: 30%; text-align: center;">
            <input type = "button" value = "+" onclick = "add_To_Value('${type + j}', ${products_array[type][j].price},'${type}', '${j}')">
            </td>
            <td style = "text-align: center; width: 13%">\$${products_array[type][j].price}</td>
            <td style = "text-align: center; width: 54%" id = "extended_Price${type + j}">\$${(products_array[type][j].price * shopping_cart[type][j]).toFixed(2)}</td>
            <td><i class="fa-solid fa-trash-can"></i></td>
            </tr>`);
            subtotal += (products_array[type][j].price * shopping_cart[type][j])
          }
        }
      }
    }
    res.write(`
    <tr><td colspan = "4" width = "100%">&nbsp;</td><tr>
    <tr>
    <td style = "text-align: center;" colspan = "3"; width = "67%">Sub-total</td> 
    <td width = "54%;" style = "text-align: center;">$${subtotal.toFixed(2)}</td>
    </tr>
    <tr>
    <td style = "text-align: center;" colspan = "3"; width = "67%">Tax @ ${(tax_rate * 100).toFixed(2)}%</td> 
    <td width = "54%;" style = "text-align: center;">$${(subtotal * tax_rate).toFixed(2)}</td>
    </tr>
    <tr>
    <td style = "text-align: center;" colspan = "3"; width = "67%">Shipping</td> 
    <td width = "54%;" style = "text-align: center;">$${generateShipping(subtotal).toFixed(2)}</td>
    </tr>
    <tr>
    <td style = "text-align: center;" colspan = "3"; width = "67%"><strong>Total</strong></td> 
    <td width = "54%;" style = "text-align: center;"><strong>$${(subtotal + (subtotal * tax_rate) + generateShipping(subtotal)).toFixed(2)}</strong></td>
    </tr>
    </tbody>
    </table>
    <button type = "submit" class = "button2" style = "display: block; margin-left: auto; margin-right: auto; margin-top: 40px">Purchase</button>
    </form>
    </body>
    </html>`)
    res.end()
  }
});

//get request for home page
app.get("/home", function (req, res) {
  //set the display name
  let display_name = checkIfLoggedIn(req.cookies["username"]);
  res.write(`
  <!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Betta Fish Store</title>
   <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
                <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>
                <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
                <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet" />
                <link rel="stylesheet" href="../new_style.css">
                  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Karma">
                    <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Homemade+Apple" />
</head>
<header>
<nav class="navbar navbar-inverse">
<div class="navbar-header">
<button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
<span class="icon-bar"></span>
<span class="icon-bar"></span>
<span class="icon-bar"></span>
</button>
<p class="navbar-brand" href="#">Betta</p>
</div>
<div class="collapse navbar-collapse" id="myNavbar">
    <ul class="nav navbar-nav">
        <li> <a href="home" >Home</a> </li>
        <li> <a href="store?type=fish" >Fish</a> </li>
        <li> <a href="store?type=tank">Tanks</a> </li>
        <li> <a href="store?type=plant">Plants</a> </li>
    </ul>
    <form class = "navbar-form navbar-left" method = "GET" action = "/search">
    <div class="input-group">
    <input type = "search" placeholder = "Search" id = "Search" name = "searchValue" class = "form-control" autocomplete = "off" onsubmit "openPage()">
    <ul class="list"></ul>
    <div class="input-group-btn">
    <button class="btn btn-default" type="submit">
    <i class="glyphicon glyphicon-search"></i>
    </button>
    <script src="./searchFunctions.js" type="text/javascript"></script>
    </div>
    </div>
   </form>
    `)
  if (typeof req.cookies["username"] == "undefined") {
    res.write(`
  <ul class="nav navbar-nav navbar-right">
  <li><a href="/cart"><span class="glyphicon glyphicon-shopping-cart"></span><span>${calculateTotalCartItems(req, res)}</span></a></li>
  <!-- <li><a href="/cart" style = "margin-bottom: -5px;"><span class="glyphicon glyphicon-user"></span> Your Account</a></li>-->
  <li><a href="/login">${display_name}</a></li>

</ul>
</div>
</nav>
</header>`)
  }

  else {
    res.write(`
  <ul class="nav navbar-nav navbar-right">
  <ul class="nav navbar-nav navbar-right">
  <li><a href="/cart"style = "margin-top: -1px; margin-bottom:2px"><span class="glyphicon glyphicon-shopping-cart"></span><span>${calculateTotalCartItems(req, res)}</span></a></li>
  <li><a href="/edit" style = "margin-bottom: -5px;"><span class="glyphicon glyphicon-user"></span></a></li>
  <li><a href="/login" style = "margin-top: 2px; margin-bottom:-2px">${display_name}</a></li>

</ul>
</div>
</nav>
</header>
`)
  }

  res.write(`
<body>


    <!--Make an image with shop now button and display some text. Transparentbackground copied from coder-coder.com -->
    <div class="content">
        <h1 style="font-size: 50px; text-align: center;"> Welcome To Betta Shop</h1>
        <div id="center">

            <h3 style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 25px;">The best place to
                buy your betta fish!</h3>

        </div>
    </div>

    <!--Display text of title of my products-->
    <h1 id="store" style="text-align: center; margin-top: 50px;"> Check Out Our Products!</h1>

    <!--Display all services-->

    <main>
        <ul id="first_page">
            <a href="store?type=tank">
                <li class="photo2">

                    <div class="product">

                        <h1>Tanks</h1>

                    </div>
                </li>
            </a>
            <a href="store?type=fish">
                <li class="photo1">
                    <div class="product">

                        <h1>Fish</h1>

                    </div>
                </li>
            </a>
            <a href="store?type=plant">
                <li class="photo3">
                    <div class="product">

                        <h1>Plants</h1>

                    </div>

                </li>
            </a>
        </ul>
    </main>
</body>


</html>
`)
  res.end();
})

//get the product store page and display it
app.get("/store", function (req, res) {
  let params = new URLSearchParams(req.query);
  let type = params.get("type");
  //call in variable that will be a string to display the title
  var product_Display_Title;
  let product = products[type];
  let name = checkIfLoggedIn(req.cookies["username"]);
  //switch the Display title based on the type that is passed in params
  switch (type) {
    case "fish":
      req.session.last_Page_Visited = "store?type=fish";
      product_Display_Title = "Siameze Fighting Fish"
      break;
    case "tank":
      req.session.last_Page_Visited = "store?type=tank";
      product_Display_Title = "Fish Tanks";
      break;
    case "plant":
      req.session.last_Page_Visited = "store?type=plant";
      product_Display_Title = "Plant Decorations"
      break;

  }



  res.write(` <!DOCTYPE html>
  <html lang="en">
  
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${product_Display_Title}</title>
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
      <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"/>    
      <link href="https://use.fontawesome.com/releases/v5.0.1/css/all.css" rel="stylesheet">
      <link rel="stylesheet" href="../new_style.css">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Karma">
      <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Homemade+Apple" />
      <script src="./products.js"></script>
      <script src="./starsFunctions.js" type="text/javascript"></script>
      <script>
  
      var products;

    // This function asks the server for a "service" and converts the response to text. Help from code example in assignment 3
    function loadJSON(service, callback) {   
       var xobj = new XMLHttpRequest();
       xobj.overrideMimeType("application/json");
       xobj.open('POST', service, false);
       xobj.onreadystatechange = function () {
             if (xobj.readyState == 4 && xobj.status == "200") {
               // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
               callback(xobj.responseText);
             }
       };
       xobj.send(null);  
    }
    products = products["${type}"];
    

          //check if on submit if there is no input added
          function checkIfNoQuantity() {
              var val;
              for (val = 0; val < products.length; val++) {
                  if (document.getElementById("quantities" + val).value != 0) {
                      return true;
                  }
              }
              alert("No quantities added");
              return false;
          }

          //check if it is a positive integer
          function checkNonNegInt(value, returnErrors = false) {
              errors = [];
  
              if (value < 0 || parseInt(value) != value || Number(value) != value) {
                  errors.push("Please enter a valid number!");
              }
              if (errors.length == 0) {
                  returnErrors = true;
              }
              else {
                  return errors;
              }
              return returnErrors;
          }
  
          //collect the input value 
          function getInputValue(val) {
              // Selecting the input element and get its value 
              var inputVal = document.getElementById("quantities" + val).value;
              if (inputVal == "") {
                  document.getElementById("error_box" + val).innerHTML = " ";
              }
              else if (inputVal > products[val]["quantity_available"]) {
                  document.getElementById("error_box" + val).innerHTML = "Quantity exceeeded";
                  document.getElementById("quantities" + val).value = products[val]["quantity_available"];
              }
              else if (checkNonNegInt(inputVal, true) != true) {
                  document.getElementById("error_box" + val).innerHTML = checkNonNegInt(inputVal);
                  return false;
              }
              else {
                  document.getElementById("error_box" + val).innerHTML = " ";
  
              }
              return true;
          }
          </script>
  </head>
  <header>
  <nav class="navbar navbar-inverse">
  <div class="navbar-header">
  <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
  <span class="icon-bar"></span>
  <span class="icon-bar"></span>
  <span class="icon-bar"></span>
</button>
<p class="navbar-brand" href="#">Betta</p>
</div>
<div class="collapse navbar-collapse" id="myNavbar">
      <ul class="nav navbar-nav">
          <li> <a href="home" >Home</a> </li>
          <li> <a href="store?type=fish" >Fish</a> </li>
          <li> <a href="store?type=tank">Tanks</a> </li>
          <li> <a href="store?type=plant">Plants</a> </li>
      </ul>
      <form class = "navbar-form navbar-left" method = "GET" action = "/search">
      <div class="input-group">
      <input type = "search" placeholder = "Search" id = "Search" name = "searchValue" class = "form-control" autocomplete = "off" onsubmit "openPage()">
      <ul class="list"></ul>
      <div class="input-group-btn">
      <button class="btn btn-default" type="submit">
      <i class="glyphicon glyphicon-search"></i>
      </button>
      <script src="./searchFunctions.js" type="text/javascript"></script>
      </div>
      </div>
     </form>
      `)
  //check if there is no cookie
  if (typeof req.cookies["username"] == "undefined") {
    res.write(`
    <ul class="nav navbar-nav navbar-right">
    <li><a href="/cart"><span class="glyphicon glyphicon-shopping-cart"></span><span>${calculateTotalCartItems(req, res)}</span></a></li>
    <li><a href="/login">${name}</a></li>

  </ul>
</div>
</nav>
</header>
  
  <body>
      <!--Display text of title of my products-->
      <h1 id="store" style="text-align: center; margin-top: 50px;"> ${product_Display_Title}</h1>
      <!--Display the products-->
      <form action="/add_cart" method="get" onsubmit="return checkIfNoQuantity()">
      <input type="hidden" name="type" value="${type}">
          <main>
       `)
  }

  else {
    res.write(`
    <ul class="nav navbar-nav navbar-right">
    <ul class="nav navbar-nav navbar-right">
    <li><a href="/cart"style = "margin-top: -1px; margin-bottom:2px"><span class="glyphicon glyphicon-shopping-cart"></span><span>${calculateTotalCartItems(req, res)}</span></a></li>
    <li><a href="/edit" style = "margin-bottom: -5px;"><span class="glyphicon glyphicon-user"></span></a></li>
    <li><a href="/login" style = "margin-top: 2px; margin-bottom:-2px">${name}</a></li>

  </ul>
</div>
</nav>
</header>

<body>
    <!--Display text of title of my products-->
    <h1 id="store" style="text-align: center; margin-top: 50px;"> ${product_Display_Title}</h1>
    <!--Display the products-->
    <form action="/add_cart" method="get" onsubmit="return checkIfNoQuantity() name = "productForm">
    <input type="hidden" name="type" value="${type}">
        <main>
     `)
  }

  for (var i = 0; i < product.length; i++) {
    res.write(`
          <section class="item">
          <h1>${product[i].name} </h1>
          <img src="../images/${product[i].image}">
          <p>\$${product[i].price} </p>
          <div class="${type}product${i}">

          <div class="stars-outer">
              <div class="stars-inner">
  
              </div>
          </div>
          (${product[i].numberOfRatings})
         </div>
          <div id = "label">
          <p> <em>*${product[i].quantity_available} in stock</em></p>
          <label>Quantity</label>
          <input type = "text"; class = "box" id = "quantities${i}"; name = "betta${i}" style = "width: 15%"; onkeyup = "getInputValue(${i})" value = "">                
          </div> 
          <div id = "error_box${i}"; style = "color: red; position: absolute; top: 333px; right: 70px"></div>                     
          </section>
          <script>
          //Run getRatings when DOM loads
          document.addEventListener('DOMContentLoaded', getRatings);
          </script>
                          `)
  }


  res.write(` 
  <script>
  if (${params.has('error')}) {
              
    let error_msg = "Please enter valid quantity";
    //call in params from client side
    let params = (new URL(document.location)).searchParams;
    for(var i = 0; i < products.length; i++)
    {
      document.getElementById("quantities" + i).value = params.get("betta" + i);
      getInputValue(i);
    }
    alert(error_msg);
}
  </script>    
      </main>
  <button class = "button2">Add To Cart</button>
  </form>
  </body>
  <footer>
  <!--Display last Login if user logged in -->
  <p style = "margin-top: 40px">
  `)
  //check to see if cookies of user is undefined
  //if not, then display the last time the user has logged in
  if (typeof req.cookies["username"] != 'undefined') {
    res.write(`Last logged in: ${users[req.cookies["username"]].lastTime}
                <br>
                You have logged in: ${users[req.cookies["username"]].loginCount} times
                
                </p>`);
  }
  res.write(`
  <div>
  <!--Set styling of icon size *received help on styling https://stackoverflow.com/questions/42126565/i-info-icon-click-it-to-reveal-text-can-this-be-done-with-css-and-how-->
  <div style="font-size: 2.5rem;">
  <!--Set input for icon-->
  <input id="userInfo" type="checkbox">Display Users
  <label for="userInfo"><i class="fa fa-users"style = "cursor: pointer;"></i></label>
  <!--Set the text inside when icon is clicked to show users present of login-->
  <div class="text">Users Present:
  <br>
`)
  //this part of the code grabs from the array of list of users
  //we will be writing the users full name in this box
  for (var i = 0; i < listOfUsers.length; i++) {
    res.write(`${listOfUsers[i]}<br>`);
  }
  res.write(`
  </div>
</div>
  </p>
  </footer>
  </html>`)
  res.end();
})

//get products rating page
app.get("/products_rating", function (req, res) {
  //get the params
  let params = new URLSearchParams(req.query);
  //get the type
  let type = params.get("type");
  let index = params.get("index");
  //if user is not logged in redirect to login/register page
  if (typeof req.cookies["username"] == 'undefined') {
    res.redirect("/login");
  }
  //have a form to fill out to rate the product
  else {
    res.write(`
    <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Homemade+Apple" />
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
      <link rel="stylesheet" href="../new_style.css">
      <title>Login</title>
      
  </head>
  <header>
  <nav class="navbar navbar-inverse">
  <div class="navbar-header">
  <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
    <span class="icon-bar"></span>
    <span class="icon-bar"></span>
    <span class="icon-bar"></span>
  </button>
  <p class="navbar-brand" href="#">Betta</p>
</div>

<div class="collapse navbar-collapse" id="myNavbar">
  <ul class="nav navbar-nav">
    <li> <a href="home">Home</a> </li>
    <li> <a href="store?type=fish">Fish</a> </li>
    <li> <a href="store?type=tank">Tanks</a> </li>
    <li> <a href="store?type=plant">Plants</a> </li>
  </ul>
  <form class="navbar-form navbar-left" method="GET" action="/search">
    <div class="input-group">
      <input type="search" placeholder="Search" id="Search" name="searchValue" class="form-control"
        autocomplete="off" onsubmit "openPage()">
      <ul class="list"></ul>
      <div class="input-group-btn">

        <button class="btn btn-default" type="submit">
          <i class="glyphicon glyphicon-search"></i>
        </button>
        <script src="./searchFunctions.js" type="text/javascript"></script>
rating
      </div>
    </div>
  </form>
  <ul class="nav navbar-nav navbar-right">
    <li><a href="/cart"><span class="glyphicon glyphicon-shopping-cart"></span><span>${calculateTotalCartItems(req, res)}</span></a></li>
    <li><a href="/login">${checkIfLoggedIn(users[req.cookies["username"]].name)}</a></li>

  </ul>
</div>
  </nav>
</header>
<body>
<main>
<form method = "get" action ="/successRatingPage">
<table>
<tr><th style ="text-align: center">Product</th></tr>`)
    params.forEach(function (value, element) {
      //get param name
      element.toString();
      //split param name and get string index
      let string_Index = element.substring(element.indexOf('_') + 1);
      //conver string index to number
      let index = Number(string_Index);
      //get the type 
      let type = element.substring(0, element.indexOf('_'));
      res.write(`
  <tr>
  <td>
  <section class = "item">
  <h1>${products[type][index].name} </h1>
  <img src="../images/${products[type][index].image}">
  <div id="rating">

  <input type="radio" name="rating${type + "_" + index}" value="5" id="5${type + index}"><label for="5${type + index}">☆</label>
  <input type="radio" name="rating${type + "_" + index}" value="4" id="4${type + index}"><label for="4${type + index}">☆</label>
  <input type="radio" name="rating${type + "_" + index}" value="3" id="3${type + index}"><label for="3${type + index}">☆</label>
  <input type="radio" name="rating${type + "_" + index}" value="2" id="2${type + index}"><label for="2${type + index}">☆</label>
  <input type="radio" name="rating${type + "_" + index}" value="1" id="1${type + index}"><label for="1"${type + index}">☆</label>
</div>
  </section>
  </td>
  </tr>
  `)
    })

    res.write(`
</table>
</main>
</body>
<button type = "submit" class = "button2">Rate Our Products</button>
</form>
</html>`)
    res.end();
  }
})

//get a success rating page
app.get("/successRatingPage", function (req, res) {
  let params = new URLSearchParams(req.query);
  params.forEach(function (value, element) {
    //get param name
    element.toString();
    //split param name and get string index
    let string_Index = element.substring(element.indexOf('_') + 1);
    //conver string index to number
    let index = Number(string_Index);
    //get the type 
    let type = element.substring(element.indexOf('g') + 1, element.indexOf('_'));
    let rating = value;
    //increment the ratings of the new inputed star by1 
    products[type][index][rating + "rating"] += 1;
    //increment total number of ratings for the product
    products[type][index].numberOfRatings += 1;
    //define a variable called total_rating and initialize it to 0
    var total_rating = 0;
    //loop through all the previous ratings in the user
    for (var i = 0; i <= 5; i++) {
      total_rating = total_rating + (products[type][index][i + "rating"] * i);

    }
    products[type][index].rating = total_rating / products[type][index].numberOfRatings;
  })

  data2 = JSON.stringify(products);
  fs.writeFileSync(pname, data2, 'utf-8');
  products = JSON.parse(data2);
  products_array = products;
  res.redirect("/home");

})
//get request for search bar
app.get("/search", function (req, res) {
  //get the params from the querysearc
  let params = new URLSearchParams(req.query);
  //get the username return msg "login/register" or their username
  let username = checkIfLoggedIn(req.cookies["username"]);
  //get the search name value
  let searchName = params.get("searchValue");
  //loop through the type of products
  //boolean to have search found
  var searchFound = false;
  for (var i = 0; i < Object.keys(products_array).length; i++) {
    var type;
    //code to get the type base off of i
    if (i == 0) {
      type = "fish";
    }
    else if (i == 1) {
      type = "tank";
    }
    else {
      type = "plant";
    }
    //loop through each object within the array
    for (var j = 0; j < products_array[type].length; j++) {
      if (products_array[type][j].name == searchName) {
        res.redirect("/store?type=" + type)
        searchFound = true;
      }
    }
  }
  //if there is no search value related then display this page
  //this page will display that there are no search results
  if (searchFound == false) {
    res.write(`<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Shopping Cart</title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
        <link href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" rel="stylesheet"/>    
        <link rel="stylesheet" href="../new_style.css">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Karma">
        <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Homemade+Apple" />
      </head> 
      <header>
  <nav class="navbar navbar-inverse">
  <div class="navbar-header">
  <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
  <span class="icon-bar"></span>
  <span class="icon-bar"></span>
  <span class="icon-bar"></span>
</button>
<p class="navbar-brand" href="#">Betta</p>
</div>
<div class="collapse navbar-collapse" id="myNavbar">
      <ul class="nav navbar-nav">
          <li> <a href="home" >Home</a> </li>
          <li> <a href="store?type=fish" >Fish</a> </li>
          <li> <a href="store?type=tank">Tanks</a> </li>
          <li> <a href="store?type=plant">Plants</a> </li>
      </ul>
      <form class = "navbar-form navbar-left" method = "GET" action = "/search">
      <div class="input-group">
      <input type = "search" placeholder = "Search" id = "Search" name = "searchValue" class = "form-control" autocomplete = "off" onsubmit "openPage()">
      <ul class="list"></ul>
      <div class="input-group-btn">
      <button class="btn btn-default" type="submit">
      <i class="glyphicon glyphicon-search"></i>
      </button>
      <script src="./searchFunctions.js" type="text/javascript"></script>
      </div>
      </div>
     </form>
      `)
    if (typeof req.cookies["username"] == "undefined") {
      res.write(`
    <ul class="nav navbar-nav navbar-right">
    <li><a href="/cart"><span class="glyphicon glyphicon-shopping-cart"></span><span>${calculateTotalCartItems(req, res)}</span></a></li>
    <!-- <li><a href="/cart" style = "margin-bottom: -5px;"><span class="glyphicon glyphicon-user"></span> Your Account</a></li>-->
    <li><a href="/login">${username}</a></li>

  </ul>
</div>
</nav>
</header>`)
    }

    else {
      res.write(`
    <ul class="nav navbar-nav navbar-right">
    <ul class="nav navbar-nav navbar-right">
    <li><a href="/cart"style = "margin-top: -1px; margin-bottom:2px"><span class="glyphicon glyphicon-shopping-cart"></span><span>${calculateTotalCartItems(req, res)}</span></a></li>
    <li><a href="/edit" style = "margin-bottom: -5px;"><span class="glyphicon glyphicon-user"></span></a></li>
    <li><a href="/login" style = "margin-top: 2px; margin-bottom:-2px">${username}</a></li>

  </ul>
</div>
</nav>
</header>
`)
    }
    res.write(`
  <body>
  <h1 style = "text-align: center">No Search Results</h1>
  </body>
  </html>
  `);
    res.end()
  }


})
//post request for register
app.post("/register", function (req, res) {
  let params = new URLSearchParams(req.query);
  let POST = req.body;
  let email = POST.email;
  let full_name = POST.fullname
  let user_name = POST.username;
  let password = POST.password;
  //save encrypt_pass called from generateHash function
  let encrypt_pass = generateHash(password);
  let secondpassword = POST.secondpassword;
  let encrypt_pass2 = generateHash(secondpassword);

  //check if statement to see if second password matches first and if there is no user of that username in the database and if the email does not exist
  if ((compareHash(encrypt_pass, encrypt_pass2) == true) && users[user_name] == undefined && checkEmailExists(email) != true) {
    if (users[user_name] != user_name) {
      //create a new object for the new username
      users[user_name] = {};
      users[user_name].name = user_name;
      users[user_name].fullname = full_name;
      users[user_name].password = encrypt_pass;
      users[user_name].email = email;
      users[user_name].loginCount = 1;
      users[user_name].lastTime = "First Login";
      let data = JSON.stringify(users);
      fs.writeFileSync(fname, data, 'utf-8');
      //if there is a param of username then set the params of the new req.body and redirect it and send it to success_register  
      res.cookie('username', user_name);
      if (typeof req.session.last_Page_Visited == "undefined") {
        res.redirect('./home');
      }
      else {
        res.redirect(req.session.last_Page_Visited);
      }


    }
  }
  else {
    //check to see if the params already has email in it
    if (params.has("email")) {
      params.set("email", email);
      params.set("username", user_name);
      params.set("fullname", full_name);
      res.redirect('./register?' + params.toString());
      //check to see if the username is taken
      if (users[user_name] != undefined) {
        user_error = true;
      }
      //check to see if the password and confirm password match
      else if (compareHash(encrypt_pass, encrypt_pass2) != true) {
        password_error = true;
      }
      //check to see if the email exists in our database
      else if (checkEmailExists(email) == true) {
        email_exists = true;
      }
    }
    //if params does not have email then send a query string with the information
    else {
      res.redirect('./register?' + params.toString() + "&email=" + email + "&fullname=" + full_name + "&username=" + user_name);
      //checks if username is taken
      if (users[user_name] != undefined) {
        user_error = true;
      }
      //checks if passwords match with confirm password
      else if (compareHash(encrypt_pass, encrypt_pass2) != true) {
        password_error = true;
      }
      //checks if email exists in database
      else if (checkEmailExists(email) == true) {
        email_exists = true;
      }
    }
  }

});

//function req and res to edit account
app.get("/edit", function (req, res) {
  let params = new URLSearchParams(req.query);
  let user_name = req.cookies["username"];
  let userDisplay = checkIfLoggedIn(req.cookies["username"]);
  res.write(`<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Homemade+Apple" />
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
      <link rel="stylesheet" href="../new_style.css">
      <title>Edit</title>
   
  </head>
  <header>
  <nav class="navbar navbar-inverse">
  <div class="navbar-header">
  <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
    <span class="icon-bar"></span>
    <span class="icon-bar"></span>
    <span class="icon-bar"></span>
  </button>
  <p class="navbar-brand" href="#">Betta</p>
</div>

<div class="collapse navbar-collapse" id="myNavbar">
  <ul class="nav navbar-nav">
    <li> <a href="home">Home</a> </li>
    <li> <a href="store?type=fish">Fish</a> </li>
    <li> <a href="store?type=tank">Tanks</a> </li>
    <li> <a href="store?type=plant">Plants</a> </li>
  </ul>
  <form class="navbar-form navbar-left" method="GET" action="/search">
    <div class="input-group">
      <input type="search" placeholder="Search" id="Search" name="searchValue" class="form-control"
        autocomplete="off" onsubmit "openPage()">
      <ul class="list"></ul>
      <div class="input-group-btn">

        <button class="btn btn-default" type="submit">
          <i class="glyphicon glyphicon-search"></i>
        </button>
        <script src="./searchFunctions.js" type="text/javascript"></script>

      </div>
    </div>
  </form>
  <ul class="nav navbar-nav navbar-right">
    <li><a href="/cart"><span class="glyphicon glyphicon-shopping-cart"></span><span>${calculateTotalCartItems(req, res)}</span></a></li>
    <li><a href="/edit"><span class="glyphicon glyphicon-user"></span></a></li>
    <li><a href="/login">${userDisplay}</a></li>

  </ul>
</div>
  </nav>
</header>
<body>
    <script>
    //if error is true for any of the global variables then throw an alert
    if(${email_exists == true})
    {
      alert("Email is already taken or improper email format.");
      ${email_exists = false}
    }
    else if(${password_error == true})
    {
      alert("Incorrect user password")
      ${password_error = false}
    }
    </script>
    <div class= "full-screen-container2">
    <div class="login-container">
    <h1 class="login-title">Edit your account below</h1>
    <form name = "form1"; method = "post" action = "?${params.toString()}";>
    <div class="input2-group">
    <label for="email">Email</label>
    <input type = "email" name = "email" size="40" value = "${users[user_name].email}";>
    <br>
    <label for="fullname">Fullname</label>
    <input type = "text" name = "fullname" size="40"; value = "${users[user_name].fullname}" minlength = "2"; maxlength="30">
    <br>
    <label for="Password">Password</label>
    <input type = "password" name = "password" size="40" placeholder="enter your old password to make changes";>
    <br>
    <label for="Password">Confirm Password</label>
    <input type = "password" name = "confirmpassword" size="40" placeholder="confirm your password";>
    <button type = "submit" class = "login-button" >Save</button>
    
    </form>`);
  res.end();
})

//post to edit this checks if email exists and if it has proper email format.
// If it does then continue. 
//Also checks if your password matches
app.post("/edit", function (req, res) {
  let params = new URLSearchParams(req.query);
  //get username from query
  let user_name = req.cookies["username"];
  let POST = req.body;
  let new_email = POST.email;
  let new_full_name = POST.fullname
  let password = POST.password;
  let confirm_password = POST.confirmpassword;
  let encrypt_pass = generateHash(password);
  let encrypt_pass2 = generateHash(confirm_password);;

  users[user_name].fullname = new_full_name;
  //if email already exists or the format is wrong then throw an error
  //also if no changes are made then let it continue
  if ((checkEmailExists(new_email) != false || CheckEmailFormat(new_email) == false) && new_email != users[user_name].email) {
    email_exists = true;
    res.redirect('./edit?' + params.toString())
  }
  else {
    //compare both password and confirm password as well as password and password in database
    if (compareHash(encrypt_pass, users[user_name].password) != true || compareHash(encrypt_pass, encrypt_pass2) != true) {
      password_error = true;
      res.redirect('./edit?' + params.toString());
    }
    else {
      //if there is no error then set the new email and write it
      users[user_name].email = new_email;
      let data = JSON.stringify(users);
      //write the new file
      fs.writeFileSync(fname, data, 'utf-8');
      res.redirect('./home');
    }
  }

});

/*=======================================================================================
ADMIN START
=============================================================*/

//get request for admin page
app.get("/adminpage", function (request, response) {

  let identified_User = request.cookies['username'];
  //check if user is Admin and allowed to see this information
  if (typeof identified_User != 'undefined' && users[identified_User].isAdmin) {
    let display_name = checkIfLoggedIn(request.cookies["username"]);
    response.send((`
    <!DOCTYPE html>
  <html lang="en">
  
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Betta Fish Store</title>
      <link rel="stylesheet" href="../style2.css">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Karma">
      <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Homemade+Apple" />
    </head>
  <header>
      <!--Make a purple top left box with name and logo -->
      <span id="purple">
          <p>
              Betta
          </p>   
      </span>
      <!--Make a shopping cart image on top right header
      <span id = "cart">
             <a href="invoice.html"><img src="./images/cart.png"></a>
      </span>-->
      <ul>
          <li> <a href="home">Admin shopping</a> </li>
          <li> <a href="ad_functions">Admin Functions</a> </li>
      </ul>
      <span id="login">
          <p><a href="./login">${display_name}</a></p>
          <a href="/cart"><img src="./images/cart.png"></a>
      </span>
  </header>
  
  
  <body>
  
  
      <!--Make an image with shop now button and display some text. Transparentbackground copied from coder-coder.com -->
      <div class="content">
          <h1 style="padding-top: 20px;
          font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
          font-size: 25px;
          color:rgb(43, 37, 37);
          height: 40px;
          width: auto; text-align: center;"> Welcome To Admin Page ${users[identified_User].fullname}</h1>
      </div>
  
      <!--Display text of title of my products-->
      <h1 id="store" style="padding-top: 20px;
      font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
      font-size: 25px;
      color:rgb(43, 37, 37);
      height: 40px;
      width: auto;
      text-align:center"> What Do You Want To Do Next?</h1>
  
      <!--Display all services-->
  
      <main>
          <ul id="first_page">
              <a href="store?type=tank">
                  <li class="photo2">
  
                      <div class="product">
  
                          <h1>Admin Shopper</h1>
  
                      </div>
                  </li>
              </a>
              <a href="ad_functions">
                  <li class="photo1">
                      <div class="product">
  
                          <h1>Admin Functions</h1>
  
                      </div>
                  </li>
              </a>
          </ul>
  
  
      </main>
    
  
  </body>
  <div id = "adminbutton">
  <a href ="/login?logout"> <button class ="button2">Logout</button></a>
  </div>
  </html>
    `))
    response.end();

  } else {
    response.redirect('/login');
  }

});



// home screen of all the administrator functions. 
app.get("/ad_functions", function (request, response) {
  // Identify the cookie with the user
  let identified_User = request.cookies['username'];
  //check if user is Admin and allowed to see this information
  if (typeof identified_User != 'undefined' && users[identified_User].isAdmin) {
    display_name = checkIfLoggedIn(request.cookies["username"]);
    let params = new URLSearchParams(request.query);

    response.send(`<!DOCTYPE html>
  <html lang="en">
  
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Betta Fish Store</title>
      <link rel="stylesheet" href="../style3.css">
      <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Karma">
      <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Homemade+Apple" />
    </head>
  <header>
      <!--Make a purple top left box with name and logo -->
      <span id="purple">
          <p>
              Betta
          </p>   
      </span>
      <!--Make a shopping cart image on top right header
      <span id = "cart">
             <a href="invoice.html"><img src="./images/cart.png"></a>
      </span>-->
      <ul>
          <li> <a href="home">Admin shopping</a> </li>
          <li> <a href="ad_functions">Admin Functions</a> </li>
      </ul>
      <span id="login">
          <p><a href="./login">${identified_User}</a></p>
          <a href="/cart"><img src="./images/cart.png"></a>
      </span>
  </header>
  <main>
          <ul>
          <li>
            <div class="product">
              <h1>Inventory</h1>
              <p>
              <a href="/addInventory">
              | Modify Inventory | </a>
              </p>
              </div>
            </li>
            <li>
            <div class="product">
              <h1>User </h1>
              <p>
              <a href="/edit_user">
              Edit |</a>
              <a href="/add_user">
              Add | </a>
              <a href="/delete_user">
              Delete</a>
              </p>
              </div>
            </li>

            <li>
            <div class="product">
              <h1>Make User Admin </h1><br>
              <p>
              <a href='/adminAdmin'>
             | Make Admin |</a>
              </p>
              </div>
            </li>

          </ul>
  
  
      </main>
    
  
  </body>
  <div id = "adminbutton">
  <a href ="/login?logout"> <button class ="button2">Logout</button></a>
  </div>
  </html>
  
  `)
    response.end();
  } else {
    response.redirect('/login');
  }
});

//get request to edit the user
app.get('/edit_user', function (request, response) {
  // Identify the cookie with the user
  let identified_User = request.cookies['username'];
  //check if user is Admin and allowed to see this information
  if (typeof identified_User != 'undefined' && users[identified_User].isAdmin) {
    let display_name = checkIfLoggedIn(request.cookies["username"]);
    //read users database.
    data = fs.readFileSync(fname, 'utf-8');
    //parse to user
    users = JSON.parse(data);

    //create table with user and edit button 

    response.write(`<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Betta Fish Store</title>
        
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Karma">
        <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Homemade+Apple" />
        <link rel="stylesheet" href="../style3.css">
      </head>
    <header>
        <!--Make a purple top left box with name and logo -->
        <span id="purple">
            <p>
                Betta
            </p>   
        </span>
        <!--Make a shopping cart image on top right header
        <span id = "cart">
               <a href="invoice.html"><img src="./images/cart.png"></a>
        </span>-->
        <ul>
            <li> <a href="home">Admin shopping</a> </li>
            <li> <a href="ad_functions">Admin Functions</a> </li>
        </ul>
        <span id="login">
            <p><a href="./login">${identified_User}</a></p>
            <a href="/cart"><img src="./images/cart.png"></a>
        </span>
    </header>
    <main>
    <h1>Data Base of Users </h1>
    <p> Click on the User to edit profile</p>
    `)

    response.write(`
    <table>
      <tr>
        <th>User Name</th>
        <th>Full Name</th>
        <th>Password</th>
        <th>Email</th>
        <th>Times Visited</th>
        <th>Admin </th>
        <th>Edit User</th>
      </tr>
      
    `)


    for (key in users) {
      response.write(`<tr>
    <form action="adminEdits" method="GET">
    <td>
    <input readonly type="text" id="user" name="user" value="${(users[key].name)}">
    </input>
    </td>
    <td>
    <input readonly type="text" id="full" name="fullname" value="${(users[key].fullname)}">
    </input>
    </td>
    <td>
    <input readonly type="text" id="pass" name="password" value="${(users[key].password)}">
    </input>
    </td>
    <td>
    <input readonly type="text" id="email" name="email" value="${(users[key].email)}">
    </input>
    </td>
    <td>
    <input readonly type="text" id="visit" name="visit" value="${(users[key].loginCount)}">
    </input>
    </td>
    <td>
    <input readonly type="text" id="isAd" name="isAdmin" value="${(users[key].isAdmin)}">
    </input>
    </td>
    <td>
    <input type="submit" value="edit">
    </td></form>
      </tr>`);

    }

    response.write(`
    </table>
  
    

    </main>

    </body>
    <div id = "adminbutton">
    <a href ="/login?logout"> <button class ="button2">Logout</button></a>
    </div>
    </html>
    `)
    response.end();
  }

  else {

    response.redirect('/login');
  }

});



app.get("/adminEdits", function (request, response) {

  // Identify the cookie with the user
  let identified_User = request.cookies['username'];
  //check if user is Admin and allowed to see this information
  if (typeof identified_User != 'undefined' && users[identified_User].isAdmin) {
    let display_name = checkIfLoggedIn(request.cookies["username"]);
    let params = new URLSearchParams(request.query);

    user_name = request.query.user;
    full_name = request.query.fullname;
    password = request.query.password;
    email = request.query.email;
    loginCount = Number(request.query.visit);
    isAdmin = request.query.isAdmin;
    if (typeof isAdmin != "undefined" && isAdmin == "true") {
      isAdmin = true;
    } else {
      isAdmin = false;
    }


    response.write(`<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Betta Fish Store</title>
        
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Karma">
        <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Homemade+Apple" />
        <link rel="stylesheet" href="../style3.css">
      </head>
    <header>
        <!--Make a purple top left box with name and logo -->
        <span id="purple">
            <p>
                Betta
            </p>   
        </span>
        <!--Make a shopping cart image on top right header
        <span id = "cart">
               <a href="invoice.html"><img src="./images/cart.png"></a>
        </span>-->
        <ul>
            <li> <a href="home">Admin shopping</a> </li>
            <li> <a href="ad_functions">Admin Functions</a> </li>
        </ul>
        <span id="login">
            <p><a href="./login">${identified_User}</a></p>
            <a href="/cart"><img src="./images/cart.png"></a>
        </span>
    </header>
    <main>
    <div class="title">
    <h1> User Edit Page </h1>
    <p> Click final edit to make changes </p>
    </div>
    
    `)


    response.write(`
  <table>
  <tr>
  <th>Edit User </th>
  <th>Edit Full Name </th>
  <th>Edit Password </th>
  <th>Edit Email </th>
  <th>Edit Login Count </th>
  <th>Edit isAdmin </th>
  </tr>
  <tr>
    <form action="successEdit" method="GET">
    <td>
    <input  type="text" id="user" name="user" value="${user_name}">
    </input>
    </td>
    <td>
    <input type="text" id="full" name="fullname" value="${full_name}">
    </input>
    </td>
    <td>
    <input readonly type="text" id="pass" name="password" value="${password}">
    </input>
    </td>
    <td>
    <input type="text" id="email" name="email" value="${email}">
    </input>
    </td>
    <td>
    <input type="text" id="visit" name="visit" value="${loginCount}">
    </input>
    </td>
    <td>
    <input type="text" id="isAd" name="isAdmin" value="${isAdmin}">
    </input>
    </td>
    <td>
    <input type="submit" value="Final Edit">
    </td></form>
      </tr>
      </table>`)
    response.end();
  } else {
    response.redirect('/login');
  }
});


app.get("/add_user", function (request, response) {
  // Identify the cookie with the user
  let identified_User = request.cookies['username'];
  //check if user is Admin and allowed to see this information
  if (typeof identified_User != 'undefined' && users[identified_User].isAdmin) {
    let display_name = checkIfLoggedIn(request.cookies["username"]);


    response.write(`<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Betta Fish Store</title>
        
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Karma">
        <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Homemade+Apple" />
        <link rel="stylesheet" href="../style3.css">
      </head>
    <header>
        <!--Make a purple top left box with name and logo -->
        <span id="purple">
            <p>
                Betta
            </p>   
        </span>
        <!--Make a shopping cart image on top right header
        <span id = "cart">
               <a href="invoice.html"><img src="./images/cart.png"></a>
        </span>-->
        <ul>
            <li> <a href="home">Admin shopping</a> </li>
            <li> <a href="ad_functions">Admin Functions</a> </li>
        </ul>
        <span id="login">
            <p><a href="./login">${identified_User}</a></p>
            <a href="/cart"><img src="./images/cart.png"></a>
        </span>
    </header>
    <main>
    <div class="title">
    <h1> Add User Page </h1>
    <p> Click Add User to add to database </p>
    </div>
    
    `)


    response.write(`
  <table>
  <tr>
  <th>Edit User </th>
  <th>Edit Full Name </th>
  <th>Edit Password </th>
  <th>Edit Email </th>
  <th>Edit Login Count </th>
  <th>Edit isAdmin </th>
  </tr>
  <tr>
    <form action="successAdd" method="GET">
    <td>
    <input  type="text" id="user" name="user" placeholder="User Name">
    </input>
    </td>
    <td>
    <input type="text" id="full" name="fullname" placeholder="Full Name">
    </input>
    </td>
    <td>
    <input type="text" id="pass" name="password" placeholder="Password">
    </input>
    </td>
    <td>
    <input type="text" id="email" name="email" placeholder="Email">
    </input>
    </td>
    <td>
    <input type="text" id="visit" name="visit" value="0">
    </input>
    </td>
    <td>
    <input type="text" id="isAd" name="isAdmin" placeholder="true/false">
    </input>
    </td>
    <td>
    <input type="submit" value="Add User">
    </td></form>
      </tr>
      </table>`)
    response.end();
  } else {
    response.redirect('/login');
  }
});

app.get('/delete_user', function (request, response) {
  identified_User = request.cookies['username'];

  if (typeof identified_User != 'undefined' && users[identified_User].isAdmin) {
    let display_name = checkIfLoggedIn(request.cookies["username"]);
    //create table with user and edit button 
    response.write(`<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Betta Fish Store</title>
        
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Karma">
        <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Homemade+Apple" />
        <link rel="stylesheet" href="../style3.css">
      </head>
    <header>
        <!--Make a purple top left box with name and logo -->
        <span id="purple">
            <p>
                BEttA
            </p>   
        </span>
        <!--Make a shopping cart image on top right header
        <span id = "cart">
               <a href="invoice.html"><img src="./images/cart.png"></a>
        </span>-->
        <ul>
            <li> <a href="home">Admin shopping</a> </li>
            <li> <a href="ad_functions">Admin Functions</a> </li>
        </ul>
        <span id="login">
            <p><a href="./login">${identified_User}</a></p>
            <a href="/cart"><img src="./images/cart.png"></a>
        </span>
    </header>
    <main>
    <h1>Data Base of Users </h1>
    <p> *** User will be delete from Database ***</p>
   

    `)

    response.write(`
    <table>
      <tr>
        <th>User Name</th>
        <th>Full Name</th>
        <th>Password</th>
        <th>Email</th>
        <th>Times Visited</th>
        <th>Admin </th>
        <th>Edit User</th>
      </tr>
      
    `)


    for (key in users) {
      response.write(`<tr>
    <form action="/adminRemove" method="GET">
    <td>
    <input readonly type="text" id="user" name="user" value="${(users[key].name)}">
    </input>
    </td>
    <td>
    <input readonly type="text" id="full" name="fullname" value="${(users[key].fullname)}">
    </input>
    </td>
    <td>
    <input readonly type="text" id="pass" name="password" value="${(users[key].password)}">
    </input>
    </td>
    <td>
    <input readonly type="text" id="email" name="email" value="${(users[key].email)}">
    </input>
    </td>
    <td>
    <input readonly type="text" id="visit" name="visit" value="${(users[key].loginCount)}">
    </input>
    </td>
    <td>
    <input readonly type="text" id="isAd" name="isAdmin" value="${(users[key].isAdmin)}">
    </input>
    </td>
    <td>
    <input type="submit" value="Delete">
    </td></form>
      </tr>`);

    }

    response.write(`
    </table>
  
    

    </main>

    </body>
    <div id = "adminbutton">
    <a href ="/login?logout"> <button class ="button2">Logout</button></a>
    </div>
    </html>
    `)
    response.end();
  } else {
    response.redirect('/home');
  }



});

app.get('/adminAdmin', function (request, response) {
  // Identify the cookie with the user
  let identified_User = request.cookies['username'];
  //check if user is Admin and allowed to see this information
  if (typeof identified_User != 'undefined' && users[identified_User].isAdmin) {
    let display_name = checkIfLoggedIn(request.cookies["username"]);

    //parse to user
    users = JSON.parse(data);


    response.write(`<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Betta Fish Store</title>
        
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Karma">
        <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Homemade+Apple" />
        <link rel="stylesheet" href="../style3.css">
      </head>
    <header>
        <!--Make a purple top left box with name and logo -->
        <span id="purple">
            <p>
                Betta
            </p>   
        </span>
        <!--Make a shopping cart image on top right header
        <span id = "cart">
               <a href="invoice.html"><img src="./images/cart.png"></a>
        </span>-->
        <ul>
            <li> <a href="home">Admin shopping</a> </li>
            <li> <a href="ad_functions">Admin Functions</a> </li>
        </ul>
        <span id="login">
            <p><a href="./login">${identified_User}</a></p>
            <a href="/cart"><img src="./images/cart.png"></a>
        </span>
    </header>
    <main>
    <h1>Data Base of Users </h1>
    <p> Click on the User to edit profile</p>
    `)

    response.write(`
    <table>
      <tr>
        <th>User Name</th>
        <th>Full Name</th>
        <th>Admin </th>
        <th>Make Admin</th>
      </tr>
      
    `)


    for (key in users) {
      response.write(`<tr>
    <form action="/make_admin" method="GET">
    <td>
    <input readonly type="text" id="user" name="user" value="${(users[key].name)}">
    </input>
    </td>
    <td>
    <input readonly type="text" id="full" name="fullname" value="${(users[key].fullname)}">
    </input>
    </td>
    <td>
    <input readonly type="text" id="isAd" name="isAdmin" value="${(users[key].isAdmin)}">
    </input>
    </td>
    <td>
    <input type="submit" value="Make Admin">
    </td></form>
      </tr>`);

    }

    response.write(`
    </table>
  
    

    </main>

    </body>
    <div id = "adminbutton">
    <a href ="/login?logout"> <button class ="button2">Logout</button></a>
    </div>
    </html>
    `)
    response.end();

  } else { response.redirect('/login'); }

});



app.get('/make_admin', function (request, response) {
  // Identify the cookie with the user
  let identified_User = request.cookies['username'];
  //check if user is Admin and allowed to see this information
  if (typeof identified_User != 'undefined' && users[identified_User].isAdmin) {
    let display_name = checkIfLoggedIn(request.cookies["username"]);

    user_name = request.query.user;
    full_name = request.query.fullname;
    isAdmin = request.query.isAdmin;
    if (typeof isAdmin != "undefined" && isAdmin == "true") {
      isAdmin = true;
    } else {
      isAdmin = false;
    }


    response.write(`<!DOCTYPE html>
      <html lang="en">
      
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Betta Fish Store</title>
          
          <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Karma">
          <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Homemade+Apple" />
          <link rel="stylesheet" href="../style3.css">
        </head>
      <header>
          <!--Make a purple top left box with name and logo -->
          <span id="purple">
              <p>
                  Betta
              </p>   
          </span>
          <!--Make a shopping cart image on top right header
          <span id = "cart">
                 <a href="invoice.html"><img src="./images/cart.png"></a>
          </span>-->
          <ul>
              <li> <a href="home">Admin shopping</a> </li>
              <li> <a href="ad_functions">Admin Functions</a> </li>
          </ul>
          <span id="login">
              <p><a href="./login">${identified_User}</a></p>
              <a href="/cart"><img src="./images/cart.png"></a>
          </span>
      </header>
      <main>
      <div class="title">
      <h1> Make a User a Admin Page </h1>
      <p> Click Make Admin to make changes </p>
      </div>
      
      `)

    response.write(`
    <table>
    <tr>
    <th>Edit User </th>
    <th>Edit Full Name </th>
    <th>Edit isAdmin </th>
    </tr>
    <tr>
      <form action="successAdmin" method="GET">
      <td>
      <input  type="text" id="user" name="user" value="${user_name}">
      </input>
      </td>
      <td>
      <input type="text" id="full" name="fullname" value="${full_name}">
      </input>
      </td>
      <td>
      <input type="text" id="isAd" name="isAdmin" value="${isAdmin}">
      </input>
      </td>
      <td>
      <input type="submit" value="Make Admin">
      </td></form>
        </tr>
        </table>`)
    response.end();

  } else { response.redirect('/login'); }
});





app.get('/successEdit', function (request, response) {
  let params = new URLSearchParams(request.query);
  identified_User = request.cookies['username'];
  user_name = request.query.user;
  full_name = request.query.fullname;
  password = request.query.password;
  email = request.query.email;
  loginCount = Number(request.query.visit);
  isAdmin = request.query.isAdmin;
  if (typeof isAdmin != "undefined" && isAdmin == "true") {
    isAdmin = true;
  } else {
    isAdmin = false;
  }

  //create a new object for the new username
  users[user_name] = {};
  users[user_name].name = user_name;
  users[user_name].fullname = full_name;
  users[user_name].password = password;
  users[user_name].email = email;
  users[user_name].loginCount = Number(loginCount);
  users[user_name].isAdmin = isAdmin;

  let data = JSON.stringify(users);
  fs.writeFileSync(fname, data, 'utf-8');

  response.redirect("./ad_functions");
});



app.get('/successAdd', function (request, response) {
  let params = new URLSearchParams(request.query);
  identified_User = request.cookies['username'];
  user_name = request.query.user;
  full_name = request.query.fullname;
  password = request.query.password;
  hashpassword = generateHash(password);
  email = request.query.email;
  loginCount = Number(request.query.visit);
  isAdmin = request.query.isAdmin;
  if (typeof isAdmin != "undefined" && isAdmin == "true") {
    isAdmin = true;
  } else {
    isAdmin = false;
  }

  //create a new object for the new username
  users[user_name] = {};
  users[user_name].name = user_name;
  users[user_name].fullname = full_name;
  users[user_name].password = hashpassword;
  users[user_name].email = email;
  users[user_name].loginCount = Number(loginCount);
  users[user_name].isAdmin = isAdmin;

  let data = JSON.stringify(users);
  fs.writeFileSync(fname, data, 'utf-8');

  response.redirect("./edit_user");
});


app.get('/adminRemove', function (request, response) {
  let found_match = false;
  identified_User = request.cookies['username'];
  let params = new URLSearchParams(request.query);
  user_to_delete = request.query.user;

  for (user in users) {
    if (user_to_delete == user) {
      delete users[user];
    }
    data = JSON.stringify(users);
    fs.writeFileSync(fname, data, 'utf-8');
  }

  response.redirect('/delete_user');

});

app.get('/successAdmin', function (request, response) {
  let params = new URLSearchParams(request.query);
  data = fs.readFileSync(fname, 'utf-8');
  users = JSON.parse(data);

  identified_User = request.cookies['username'];

  user_name = request.query.user;
  full_name = request.query.fullname;
  old_pass = users[user_name].password;
  old_email = users[user_name].email;
  old_count = users[user_name].loginCount;
  isAdmin = request.query.isAdmin;
  if (typeof isAdmin != "undefined" && isAdmin == "true") {
    isAdmin = true;
  } else {
    isAdmin = false;
  }


  //create a new object for the new username
  users[user_name] = {};
  users[user_name].name = user_name;
  users[user_name].fullname = full_name;
  users[user_name].password = old_pass;
  users[user_name].email = old_email;
  users[user_name].loginCount = old_count;
  users[user_name].isAdmin = isAdmin;

  data = JSON.stringify(users);
  fs.writeFileSync(fname, data, 'utf-8');

  response.redirect("./edit_user");
});



/****************************************************************************
 * PRODUCTS EDIT
 * *************************************/

app.get('/addInventory', function (request, response) {
  // Identify the cookie with the user
  let identified_User = request.cookies['username'];
  //check if user is Admin and allowed to see this information
  if (typeof identified_User != 'undefined' && users[identified_User].isAdmin) {
    let display_name = checkIfLoggedIn(request.cookies["username"]);

    data2 = fs.readFileSync(pname, 'utf-8');
    products = JSON.parse(data2);
    //Header
    response.write(`<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Betta Fish Store</title>
        
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Karma">
        <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Homemade+Apple" />
        <link rel="stylesheet" href="../style3.css">
      </head>
    <header>
        <!--Make a purple top left box with name and logo -->
        <span id="purple">
            <p>
                Betta
            </p>   
        </span>
        <!--Make a shopping cart image on top right header
        <span id = "cart">
               <a href="invoice.html"><img src="./images/cart.png"></a>
        </span>-->
        <ul>
            <li> <a href="home">Admin shopping</a> </li>
            <li> <a href="ad_functions">Admin Functions</a> </li>
        </ul>
        <span id="login">
            <p><a href="./login">${identified_User}</a></p>
            <a href="/cart"><img src="./images/cart.png"></a>
        </span>
    </header>
    <main>
    <h1>Products Database </h1>
    <p> Inventory Totals </p>
    `)

    response.write(`
      <table>    
      `)
    // (products[product][i].quantity_available)
    for (product in products) {
      response.write(`<tr>
          <th>Product Type </th>
          <th>Products</th>
          <th>Total Inventory</th>
        </tr>
   `)
      for (i = 0; i < products[product].length; i++) {
        response.write(`
      <tr>
      <form action="/inventoryChange" method="GET">
      <td>
      <input readonly type="text" id="product" name="type" value="${product}">
      </input>
      </td>

      <td>
      <input readonly type="text" id="product" name="product" value="${products[product][i].name}">
      </input>
      </td>
      <td>
      <input readonly type="text" id="qty" name="quantity" value="${products[product][i].quantity_available}">
      </input>
      </td>
      <td>
      <input readonly type="hidden" id="index" name="index" value ="${i}"></input>
      </td>
      <td>
      <input type="submit" value="Change Quantity">
      </td></form>
        </tr>
      `)
      }
    }
    response.end();

  } else {
    response.redirect('/login');
  }
});

app.get('/inventoryChange', function (request, response) {
  params = new URLSearchParams(request.query);
  if (params.has("type")) {
    prod_type = request.query.type;
    product_name = request.query.product;
    quantity_available = request.query.quantity;
    index = request.query.index;
  }
  // Identify the cookie with the user
  let identified_User = request.cookies['username'];
  //check if user is Admin and allowed to see this information
  if (typeof identified_User != 'undefined' && users[identified_User].isAdmin) {
    let display_name = checkIfLoggedIn(request.cookies["username"]);
    //Header
    response.write(`<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Betta Fish Store</title>
        
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Karma">
        <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Homemade+Apple" />
        <link rel="stylesheet" href="../style3.css">
      </head>
    <header>
        <!--Make a purple top left box with name and logo -->
        <span id="purple">
            <p>
                Betta
            </p>   
        </span>
        <!--Make a shopping cart image on top right header
        <span id = "cart">
               <a href="invoice.html"><img src="./images/cart.png"></a>
        </span>-->
        <ul>
            <li> <a href="home">Admin shopping</a> </li>
            <li> <a href="ad_functions">Admin Functions</a> </li>
        </ul>
        <span id="login">
            <p><a href="./login">${identified_User}</a></p>
            <a href="/cart"><img src="./images/cart.png"></a>
        </span>
    </header>
    <main>
    <h1> Would you like to change the qunatity in iventory in the product below </h1>
    `)
    response.write(`
    <table>
      <tr>
          <th>Product Type </th>
          <th>Products</th>
          <th>Change Inventory</th>
        </tr>
        <tr>
        <form action="/successInventory" method="GET">
        <td>
        <input readonly type="text" id="product" name="type" value="${prod_type}">
      </input>
        </td>
        <td>
        <input readonly type="text" id="product" name="product" value="${product_name}">
        </td>
        <td>
        <input type="text" id="product" name="quantity" value="${quantity_available}">
        </td>
        <td>
        <input readonly type="hidden" id="index" name="index" value ="${index}"></input>
        </td>
        <td>
        <input type="submit" value="Change Inventory">
        </td></form>
    </table>`)

    response.end();
  } else {
    response.redirect('/addInventory');
  }


});

app.get('/successInventory', function (request, response) {

  // Identify the cookie with the user
  let identified_User = request.cookies['username'];
  //check if user is Admin and allowed to see this information
  if (typeof identified_User != 'undefined' && users[identified_User].isAdmin) {
    let display_name = checkIfLoggedIn(request.cookies["username"]);
    params = new URLSearchParams(request.query);
    if (params.has("type")) {
      prod_type = request.query.type;
      product_name = request.query.product;
      new_quantity_available = Number(request.query.quantity);
      index = request.query.index;
      products[prod_type][index].quantity_available = new_quantity_available;

      data2 = JSON.stringify(products);
      fs.writeFileSync(pname, data2, 'utf-8');
      products = JSON.parse(data2);
      products_array = products;

      response.redirect('/addInventory');
    } else {
      response.redirect('/addInventory');
    }

  }

});

/**********FINISH PRODUCT EDIT
 **************************************** */

/*------------------------------------------------------------------------
END ADMIN
This code is property of Alex
----------------------------------------------------------*/

//post to login chhecks to see if credentials match if not then redirect back to login with error message
app.post("/login", function (request, response) {
  let params = new URLSearchParams(request.query);
  let POST = request.body;
  let user_name = POST["username"];

  let password = POST["password"];
  let hash_pass = generateHash(password);


  //if the username is not contained in our database then
  if (typeof users[user_name] != "undefined") {
    //compare the username and passwords
    if (user_name == users[user_name].name && compareHash(hash_pass, users[user_name].password) == true) {

      // Process login form POST and redirect to logged in page if ok, back to same page if not
      users[user_name].loginCount += 1;
      //if params has user then redirect them and set the user to the post username
      if (params.has("username")) {

        //THIS NEXT IF IS NOT DOING ANYTHING
        if (users[user_name].isAdmin) {
          listOfUsers.push(users[user_name].fullname);
          response.redirect('adminpage?' + params.toString() + "&username=" + user_name);

        }


        /********************* 
         * REMEMBER TO SET A MAX AGE BEFORE TURNING HOMEWORK TO SERVER
         * 
         * 
         * ***********
         * 
         * 
         * 
         * 
         * **************
         * 
         * 
         * THIS IS A REMINDER AND THAN SHOULD BE REMOVED AS A COMMENT
        *****************************/
        //otherwise do this
        else {
          params.set('username', user_name);
          response.cookie('username', user_name);
          //add to the list of users for displaying how many users are currently logged in
          listOfUsers.push(users[user_name].fullname);
          if (typeof users[user_name].last_Page_Visited == "undefined") {
            response.redirect("/home");
          }
          else {
            response.redirect(request.session.last_Page_Visited);
          }
        }

      }
      //if no params then append the username to the query
      else {
        //if it is administrator then do this
        //otherwise do this
        //response.redirect('./success_login?' + params.toString() + "&username=" + user_name);
        if (users[user_name].isAdmin) {
          params.set('username', user_name);
          listOfUsers.push(users[user_name].fullname);
          response.cookie('username', user_name);
          response.redirect('/adminpage');
        }

        else {
          response.cookie('username', user_name);
          //add to the list of users for displaying how many users are currently logged in
          listOfUsers.push(users[user_name].fullname);
          if (typeof users[user_name].last_Page_Visited == "undefined") {
            response.redirect("/home");
          }
          else {
            response.redirect(users[user_name].last_Page_Visited);
          }
        }
      }


    }
    //if username matches but passwords and user does not then redirect back to login
    else {
      //make sticky check to see if it query contains username
      if (params.has("username")) {
        params.set('username', user_name);
        response.redirect('./login?' + params.toString());
      }
      //make sticky if params does not contain username then append it to the url
      else {
        response.redirect('./login?' + params.toString() + "&username=" + user_name);
      }
      user_error = true;
    }
  }
  //if username and password does not match then redirect back to login
  else {
    //make sticky if params has user then set the new user and redirect with the params
    if (params.has("username")) {
      params.set('username', user_name);
      response.redirect('./login?' + params.toString());
    }
    //if params does not contain username then append it to the URL
    else {
      response.redirect('./login?' + params.toString() + "&username=" + user_name);
    }
    //global variable to make user_error true
    user_error = true;
  }

});


app.post("/invoice", function (req, res, next) {

  //Make last page visited home for IR1
  req.session.last_Page_Visited = "/home";
  //get the query string
  let params = new URLSearchParams(req.query);
  //call in username variable and is used to check wheather they are logged in
  let cookiesName = req.cookies["username"];

  let invoice_str = " ";

  //cannot go to invoice if not logged in
  if (typeof cookiesName == 'undefined') {
    res.redirect("/login");
  }
  //there is a shopping cart in the session generate it in the invoice
  else {
    let shopping_cart = req.session.cart;
    //get the fullname of the user from the cookies username
    let fullNameDisplay = users[cookiesName].fullname;
    res.write(`<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" type="text/css" href="//fonts.googleapis.com/css?family=Homemade+Apple" />
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/css/bootstrap.min.css">
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.1/jquery.min.js"></script>
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"></script>
      <link rel="stylesheet" href="../new_style.css">
      <title>Invoice</title>
      
  </head>
  
  <header>
  <nav class="navbar navbar-inverse">
  <div class="navbar-header">
  <button type="button" class="navbar-toggle" data-toggle="collapse" data-target="#myNavbar">
    <span class="icon-bar"></span>
    <span class="icon-bar"></span>
    <span class="icon-bar"></span>
  </button>
  <p class="navbar-brand" href="#">Betta</p>
</div>

<div class="collapse navbar-collapse" id="myNavbar">
  <ul class="nav navbar-nav">
    <li> <a href="home">Home</a> </li>
    <li> <a href="store?type=fish">Fish</a> </li>
    <li> <a href="store?type=tank">Tanks</a> </li>
    <li> <a href="store?type=plant">Plants</a> </li>
  </ul>
  <form class="navbar-form navbar-left" method="GET" action="/search">
    <div class="input-group">
      <input type="search" placeholder="Search" id="Search" name="searchValue" class="form-control"
        autocomplete="off" onsubmit "openPage()">
      <ul class="list"></ul>
      <div class="input-group-btn">

        <button class="btn btn-default" type="submit">
          <i class="glyphicon glyphicon-search"></i>
        </button>
        <script src="./searchFunctions.js" type="text/javascript"></script>

      </div>
    </div>
  </form>
  <ul class="nav navbar-nav navbar-right">
    <li><a href="/cart"><span class="glyphicon glyphicon-shopping-cart"></span><span>${calculateTotalCartItems(req, res)}</span></a></li>
    <li><a href="/login">${checkIfLoggedIn(req.cookies["username"])}</a></li>

  </ul>
</div>
  </nav>
</header>
  <form action = "/products_rating" method = "get">
  <body style = "position: relative;">
  <h1 style = "text-align: center;">Thank you ${fullNameDisplay} for your purchase!</h1>
  <h3 style = "text-align: center;">An email has been sent to you with your invoice ${users[cookiesName].email}</h3>
  `)
    invoice_str += (`
  <table style = "margin-left: auto; margin-right: auto; margin-top: 100px;width: 30%; height: 20%">
  <tr>
  <th style = "text-align: center; width: 43%">Item</th>
  <th style = "text-align: center; width: 13%">Quantity</th>
  <th style = "text-align: center; width: 13%">Price</th>
  <th style = "text-align: center; width: 54%">Extended Price</th>
  </tr>
  `);

    //define variable called subtotal
    var subtotal = 0;
    //define variable called extended_Price
    var extended_Price = 0;
    //define tax_rate variable and assign it 
    var tax_rate = .0575;
    //do "fish" first
    var type;
    for (var i = 0; i < Object.keys(products_array).length; i++) {
      type = get_type(i);
      if (typeof shopping_cart[type] == 'undefined') {
        continue;
      }
      else {
        for (var j = 0; j < products_array[type].length; j++) {
          if (shopping_cart[type][j] == 0) {
            continue;
          }
          else {
            extended_Price = calculateExtendedPrice(products_array[type][j].price, shopping_cart[type][j]);

            invoice_str += (`
            <!--get pass in the params for type and index to generate for the products rating-->
            <tr>
            <td style = "text-align: center; width: 43%">${products_array[type][j].name}</td>
            <td style = "text-align: center; width: 13%">${shopping_cart[type][j]}</td>
            <td style = "text-align: center; width: 13%">\$${products_array[type][j].price}</td>
            <td style = "text-align: center; width: 54%">\$${(extended_Price).toFixed(2)}</td>
            <input type = "hidden" name = "${type + "_" + j}">
            </tr>`);

            //add to the subtotal
            subtotal += extended_Price;
            //update the quantity_available
            products[type][j].quantity_available -= shopping_cart[type][j];
          }
        }
      }
    }

    //writing all the subtotal, ,tax , shipping, and total
    invoice_str += (`   
  <tr><td colspan = "4" width = "100%">&nbsp;</td><tr>
  <tr>
  <td style = "text-align: center;" colspan = "3"; width = "67%">Sub-total</td> 
  <td width = "54%;" style = "text-align: center;">$${subtotal.toFixed(2)}</td>
  </tr>
  <tr>
  <td style = "text-align: center;" colspan = "3"; width = "67%">Tax @ ${(tax_rate * 100).toFixed(2)}%</td> 
  <td width = "54%;" style = "text-align: center;">$${(subtotal * tax_rate).toFixed(2)}</td>
  </tr>
  <tr>
  <td style = "text-align: center;" colspan = "3"; width = "67%">Shipping</td> 
  <td width = "54%;" style = "text-align: center;">$${generateShipping(subtotal).toFixed(2)}</td>
  </tr>
  <tr>
  <td style = "text-align: center;" colspan = "3"; width = "67%">Total</td> 
  <td width = "54%;" style = "text-align: center;">$${(subtotal + (subtotal * tax_rate) + generateShipping(subtotal)).toFixed(2)}</td>
  </tr>
  </table>  
  <br>
  <br>
  <b><p style = "text-align: center">
  OUR SHIPPING POLICY IS:A subtotal $0 - $49.99 will be $2 shipping
  A subtotal $50 - $99.99 will be $5 shipping
  Subtotals over $100 will be charged 5% of the subtotal amount
</p>
<br>

</p></b>
 
  </body>
  `)
    res.write(invoice_str);
    res.write(`
  <button type = "submit" class = "button2";>Rate Our Products</button>
  </form>
  <br>
  <br>
  <button onclick = "window.location = 'home'" class = "button2";>Back To Home</button>
  </html>
  `);

    invoice_str = (`<h1 style = "text-align: center;"> Thank you ${fullNameDisplay} for your purchase!</h1>` + invoice_str);

    /************************************************************************
       * This code was learned from watching a video in YOUTUBE 
       * as well as code from Kazman
       * youtube video https://www.youtube.com/watch?v=Va9UKGs1bwI
       * 
       * ********************MAILER CODE************************************************/

    // Set up mail server. Only will work on UH Network due to security restrictions
    var transporter = nodemailer.createTransport({
     
     host:"mail.hawaii.edu",
     port: 25,
    secure: false, // use TLS
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false
    }
    });

    var user_email = users[cookiesName].email;
    var mailOptions = {
      from: 'phoney_store@bogus.com',
      to: user_email,
      subject: 'Invoice From Betta Fish',
      html: invoice_str
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        invoice_str += '<br>There was an error and your invoice could not be emailed :(' + error;
      } else {
        invoice_str += `<br>Your invoice was mailed to ${user_email}`;
      }


      response.write(invoice_str);

    });
    /**********************END MAILER*********************** *********************************************/

    res.end();
    data2 = JSON.stringify(products);
    //write to the file for products.json for updating the quantities
    fs.writeFileSync(pname, data2, 'utf-8');
    products = JSON.parse(data2);
    products_array = products;
    req.session.destroy();
    next();
  }

});

//listen on 8080
app.listen(8080, () => console.log("listening  on port 8080"));