var express = require('express');
var app = express();
var myParser = require("body-parser");
var session = require('express-session');
var products = require('./product_data.json');
const qs=require('node:querystring');
var fs = require('fs');
const crypto = require('crypto');
var order_str = "";
let secretekey = 'secretekey';

// reference sites for crypto: I used w3schools for the structure to create the function that will encrypt users password. When running the code I noticed that it would output in my terminal that is depreciated. I used my second reference to find out whether or not createCipher nodejs works. It does so therefore I kept using createCipher. Lastly, found other examples of ways to create crypto in node.js. 
// https://www.w3schools.com/nodejs/ref_crypto.asp
// https://stackoverflow.com/questions/60369148/how-do-i-replace-deprecated-crypto-createcipher-in-node-js
// https://www.tabnine.com/code/javascript/functions/crypto/createCipher
// IR1 - must encrypt password that is input by client, do not decrypt 
function generateCipher(TextInputted) { // Created a function using crypto so that I can call the function when user inputs password. The parameter I wrote any text so that it would be "any".

    cipher = crypto.createCipher('aes192', secretekey) 
    /* We want it to be a global variable so that we can call it again later in the function. Since w3school used 
    createCipher as their example we decieded to go with that. We set the parameters within createCipher to be the 
    algorithm (aes192) this is more outdated algorithm but since createCipher is depreciated it works with the
     algorithm. And we called secretkey to get the string we put within it*/

    let ciphermade = cipher.update(TextInputted, 'utf8', 'hex') 
    /*We called the variable ciphermade and set it to equal to the another equation. Then used update so that the
     cipher will be updated with the data we put within the parameters. We put the "any text", utf-8 as the 
     variable length: 8 bits, and hex as 4 bits.*/
    ciphermade += cipher.final('hex') 
    /* We then set both of the variables += so that they will concatenate. This will encrpyt the string that is 
    inputted and then used .final because once this method is called the cipher no longer be used to encrypt data. */
    return ciphermade;
  }

  fname = __dirname + '/user_data.json'; // creating a variable to call the user_data.json file 
  if (fs.existsSync(fname)) { // reads entire file 
      var data = fs.readFileSync(fname, 'utf-8');
      var users = JSON.parse(data); // var users lets the file parse through the data within the user_data.json 
      console.log(users);
  } else {
      console.log("Sorry file " + fname + " does not exist.");
  }
  
app.use(myParser.urlencoded({ extended: true }));

app.use(session({secret: "ITM352 rocks!",resave: false, saveUninitialized: true}));


app.all('*', function (request, response, next) {
    // need to initialize an object to store the cart in the session. We do it when there is any request so that we don't have to check it exists
    // anytime it's used
    if(typeof request.session.cart == 'undefined') { request.session.cart = {}; } 
    next();
});

app.get("/get_products_data", function (request, response) {
    response.json(products);
});

app.get("/get_to_cart"), function(request, response) {
    var params = new URLSearchParams(request.query); 
    console.log(params);
    let str = `<head>
    <script src="./functions.js"></script>
    <link href="cart-style.css" rel="stylesheet">
    <script>
        var products;
        var subtotal = 0;
        loadJSON('get_products_data', function (response) {
            // Parsing JSON string into object
            products = JSON.parse(response);
        });
        loadJSON('get_cart', function (response) {
            // Parsing JSON string into object
            shopping_cart = JSON.parse(response);
        });
        nav_bar('', products);
    </script>
</head>
<center><h2>You have in your shopping cart:</h2></center>
<center><table border><th>Quantity</th><th>Item</th><th>price</th><th>extended price</th></center>

<script>
    <form action="/get_to_cart" method="POST" onsubmit="return setQuantityInSession();">
  for(product_key in products) {
    for(i=0; i<products[product_key].length; i++) {
        if(typeof shopping_cart[product_key] == 'undefined') continue;
        qty = shopping_cart[product_key][i];
        extended_price = qty * products[product_key][i].price;
        (subtotal += extended_price)
        if(qty > 0) {
          document.write('<center><tr><td><input type="text" id="quantity-box" value="${qty}" name="quantity"></td>
            <td>${products[product_key][i].name} <img src="./images/${products[product_key][i].image}" WIDTH = 60px</td>
                <td>\$${products[product_key][i].price.toFixed(2)}</td>
                <td>\$${extended_price}</td></tr></center>');

        }
    }
} 
// Computer Tax
var tax_rate = 0.0575;
    var tax = tax_rate*subtotal;

    // Computer Shipping 
    if(subtotal <= 50) (
      shipping =2
    )
    else if(subtotal <= 100)(
      shipping = 5
    )
    else (
      shipping = 0.05*subtotal
    )

    // Computer Grand total
    var total = subtotal + tax + shipping;
</form>
</script>

          <tr>
            <td colspan="4" width="100%">&nbsp;</td>
          </tr>
          <tr>
            <td style="text-align: center;" colspan="3" width="67%">Sub-total</td>
            <td width="54%">$<script>document.write(subtotal);</script></td>
          </tr>
          <tr>
            <td style="text-align: center;" colspan="3" width="67%"><span style="font-family: arial;">Tax @ <script>document.write(100*tax_rate);</script>%</span></td>
            <td width="54%">$<script>document.write(tax.toFixed(2));</script></td>
          </tr>
          <tr>
            <td style="text-align: center;" colspan="3" width="67%">Shipping<span style="font-family: arial;">
            <td width="54%">$<script>document.write(shipping.toFixed(2));</script></td>
          </tr>
          <tr>
            <td style="text-align: center;" colspan="3" width="67%"><strong>Total</strong></td>
            <td width="54%"><strong>$<script>document.write(total.toFixed(2));</script></strong></td>
          </tr>
        </tbody>
      </table> 
      <div style = "font-weight: bold;">
        OUR SHIPPING POLICY IS:A subtotal $0 - $49.99 will be $2 shipping
        <br>
      A subtotal $50 - $99.99 will be $5 shipping
      <br>
    Subtotals over $100 will be charged 5% of the subtotal amount
      </div>
</body>
</footer>
</table>`;
response.send(str);
}

app.post("/get_to_cart", function (request, response){
        // Get the input element
        var quantityBox = document.getElementById("quantity-box");
        // Get the value from the input element
        var quantity = quantityBox.value;
        // Set the value in the session storage
        sessionStorage.setItem("quantity", quantity);
        // Get the value from the session storage
        // var quantity = sessionStorage.getItem("quantity");
        var ValidCart = true;
        var ErrorCart = true; 
        for (i = 0; i < products.length; i++) {

            }
        })

app.get("/get_to_login", function(request,response) {
   
    var params = new URLSearchParams(request.query); // use search params to find the params within the document    
            console.log(params);

    let str=
    
    `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="login-style.css" rel="stylesheet">
        <title>Login Page</title>
       
    </head>
    <h1>Login Page for Cat Essentials</h1>
    <body>
        <form action="./get_to_login" method="POST"> 
           <h2><input type="text" name="email" id="email" value="" size="40" placeholder="Enter email" ><br /></h2>
               <h2><input type="password" name="password" size="40" placeholder="Enter password"><br /></h2>
                <h3><input class="submit" type="submit" value="Submit" id="error_button"></h3>
        </form>
        <script>
                if (params.has("errors")) { // if params has/find errors 
                    document.getElementById("error_button").value = "Invalid Login";}; // use the id to get the element to change the button to invalid login if there are any errors
                console.log(params.get("errors"));
            </script>
            <br>
            <form action="/register" method="GET">
                <h4><script>
                document.write('<p class="register"> Not a member? <a href="/register"> Click here to register</a></p>')
            </script></h4>
                </form>       
    </body>
    <script>
    
    </script>
    </html>`;
    response.send(str);
})

// taken from lab14 and Assignment 2 examples 
app.post("/get_to_login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    // User entered inputs are set to the variable POST
    let POST = request.body; 
    //User's entered email will be set to the variable entered_email. This value is set to all lowercase letters
     entered_email = POST["email"].toLowerCase(); 
     //IR1 we want to encrypt the password entered in the login page
    var user_pass = generateCipher(POST['password']);
    console.log("User email=" + entered_email + " password=" + user_pass);
    //Validates the user's email/password by matching information to the user_data.json file
    if (typeof users[entered_email] != 'undefined') { 
        if(users[entered_email].password == user_pass) { 
            // retrieves the parameters sent from the processing of the process_purchase form
            let params = new URLSearchParams(request.query); 
            // appends the user the username to the search parameters
            params.append('name', users[entered_email].name); 
           
            //For Assignment 2: IR4 (Daniel)
            //sets the json object's count of the times it was previously logged in to a string
            TimesLoggedIn_str = users[entered_email].num_loggedIn;
            console.log(users[entered_email].num_loggedIn);
            
            //sets the json string to a number
            TimesLoggedIn_num = Number(TimesLoggedIn_str);
            
            //adds 1 to the number of times the user has previously logged in and sets the json file's object's property to this value
            users[entered_email].num_loggedIn = 1 + TimesLoggedIn_num;
            console.log("num= " + TimesLoggedIn_num);
                       
            //syncs the new object property value for the times logged in to the user_data.json
            fs.writeFileSync(fname, JSON.stringify(users), 'utf-8'); 
            
            //redirects to the invoice page with the respective variables appended to the url string
            response.redirect('/invoice.html?' + '&' + order_str + '&' + `email=${entered_email}` + '&' + `name=${users[entered_email].name}` + '&' + `LogCount=${users[entered_email].num_loggedIn}` + '&' + `date=${users[entered_email].last_date_loggin}`); // these appended variables are entered into the query string to bring that user input data to the next page
            users[entered_email].last_date_loggin = Date();
        } else {
            // if the password is not valid, then will push the error to LoginError
            request.query.LoginError = 'Password not valid!' 
        }
    } else { 
        request.query.LoginError = 'Username not valid!';
    }
    params = new URLSearchParams(request.query);
    // if error was detected, then redirect back to login page with the respective search parameters
    response.redirect('./login.html?' + '&' + `errors=${request.query.LoginError}` + '&' + order_str + '&' + `email=${entered_email}`); 

    });

app.get("/register", function(request, response){
    let str = `<!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="register-style.css" rel="stylesheet">
        <title>Register page</title>
    </head>
    <h1>Register Here!</h1>
    <body>
        <form action="/register" method="POST">
           <h2><input type="text" name="name" size="40" placeholder="Enter full name" ><br />
                <input type="password" name="password" size="40" placeholder="Enter password"><br />
                    <input type="password" name="repeat_password" size="40" placeholder="Enter password again"><br />
                        <input type="email" name="email" size="40" placeholder="Enter email"><br /></h2>
                          <center><input class="submit" type="submit" value="Submit" id="submit"></center>
        </form>
    </body>
    </html>`
    response.send(str);
})


// A2 reference reading and writing user info to a JSON file 
app.post("/register", function (request, response) {
    // once users' information is entered into the register page, post then processes the register form
    let POST = request.body; // Sets all the users' inputted information from their request into the POST variable 
    console.log(POST); //Writes the user data into a variable
    //The following 4 variables are set to individual attributes of the users' entered information
    let encrpt_user_password = generateCipher(POST["password"]); // IR1 we want to encrypt the password the register user inputs
     let reg_error = {}; // made this an open string for errors within the registation page 
      user_name = POST["name"]; 
      user_pass = POST["password"];
      user_email = POST["email"];
      user_pass2 = POST["repeat_password"];

     let onlyletters = /^[A-Za-z]+$/; // only allows letters /* case insensitive - format must be ex. erin@gmail.com */
     let email_valid_input = /^[A-Za-z0-9_.]+@([A-Za-z0-9_.]*\.)+([a-zA-Z]{2}|[a-zA-Z]{3})$/; 
    /* case sensitive - format must have at least special character "!", one number "2", and upper and lower case letters */

  
     // using an if statement to validate what we call "name" from our user_data.json
    if(onlyletters.test(POST.name)) { // calling the variable that has the rule for only letters, the name cannot be anything but letters
    } else {
        reg_error['name'] = 'Must only use valid letters'; // if there are any nonletter within name then the query string will have this message
    }
    // validating that name is at least 2 characters long and under 30 characters
    if(POST.name > 30 || POST.name < 2) {
        reg_error['name'] = 'Full name must be at least 2 characters long, no more than 30 character allowed'
    } // if it is shorter than 2 or above 30 then this message will appear in the query string 

    // if statement to check if email added is valid to the requirements called by the variable email_valid_input
    if(email_valid_input.test(POST.email)) {
    } else {
        reg_error['email'] = 'Please enter valid email'; // if it does not meet the requirements for valid email then this message appears in query string 
    }
    if(typeof users[user_email] != 'undefined') { // if the email is already within the our user_data.json 
        reg_error['email'] = 'Email already exsist' // then send this message to the query string 
    }

    // if statement to valid password length - required by A2 to have at least 10 characters
    if((POST['password'].length) < 10) { // used .length so that it reads the length of password that is inputted
        reg_error['password'] = 'Password must be longer than 10 characters' // message appears in query string
    }
    if((POST['password']) != POST['repeat_password']) { // make sure both password match 
        reg_error['repeat_password']
    }
    // used object.keys for the array to check that errors equal to zero
    // ref for objectkeys: https://www.w3schools.com/jsref/jsref_object_keys.asp
    if (Object.keys(reg_error).length == 0) { 
        var email = POST['email'].toLowerCase();
        users[email] = {};
        users[email].name = POST['name'];
        users[email]["password"] = encrpt_user_password;
        users[email]["email"] = POST['email'];
        users[email].num_loggedIn = 0;
        users[email].last_date_loggin = Date();
        
        // this creates a string using are variable fname which is from users and then JSON will stringify the data "users"
        fs.writeFileSync(fname, JSON.stringify(users), "utf-8"); 
        // redirect to login page if all registered data is good, we want to keep the name enter so that when they go to the invoice page after logging in with their new user account
        response.redirect('/login?' + order_str + '&' + `name=${user_name}` + '&' + `date=${users[email].last_date_loggin}`); 
    } else {
        POST['reg_error'] = JSON.stringify(reg_error); // if there are errors we want to create a string 
        let params = new URLSearchParams(POST);
        response.redirect('register?' + order_str + params.toString()); // then we will redirect them to the register if they have errors
    }
 });

app.get("/add_to_cart", function (request, response) {
    var products_key = request.query['products_key']; // get the product key sent from the form post
    var quantities = request.query['quantities'].map(Number); // Get quantities from the form post and convert strings from form post to numbers
    request.session.cart[products_key] = quantities; // store the quantities array in the session cart object with the same products_key. 
    response.redirect('get_to_cart');
});

app.get("/get_cart", function (request, response) {
    response.json(request.session.cart);
});


app.use(express.static('./public'));
app.listen(8080, () => console.log('listening on port 8080'))