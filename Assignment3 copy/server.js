var express = require('express');
var app = express();
var myParser = require("body-parser");
var session = require('express-session');
var products = require(__dirname + "/public" + "/product_data.json");
var nodemailer = require('nodemailer');


// sets how the session will run 
const sessionConfig = {
    name: "Locked", // name I gave my cookie 
    secret: "Coding", // secret puts hash on session ID and starts the cookies 
    cookie: { 
        maxAge: 50000, // how long I want the cookies to last while the client is on the page 
        secure: false, // this allows it to work on local host
        httpOnly: true, // cannot access cookies from javascript 
    },
    resave: false, // I set this to false since resave will reset the cookies every time a request is sent to the server 
    saveUnititialized: true, // this saves the session without any mods that were put add by the client 
}

app.use(myParser.urlencoded({ extended: true }));
// starts session with what I set in sessionConfig
app.use(session(sessionConfig));


app.all('*', function (request, response, next) {
  // need to initialize an object to store the cart in the session. We do it when there is any request so that we don't have to check it exists
  // anytime it's used
  if (typeof request.session.cart == 'undefined') { request.session.cart = {}; }
  request.session.save();
  next();
});

app.get("/get_products", function (request, response) {
  response.json(products);
});

app.get("/add_to_cart", function (request, response) {
  var products_key = request.query['products_key']; // get the product key sent from the form post
  var quantities = request.query['quantities'].map(Number); // Get quantities from the form post and convert strings from form post to numbers
  request.session.cart[products_key] = quantities; // store the quantities array in the session cart object with the same products_key. 
  response.redirect('./cart.html');
});

app.get("/get_cart", function (request, response) {
  response.json(request.session.cart);
});

app.get("/checkout", function (request, response) {
  var user_email = request.query.email; // email address in querystring
// Generate HTML invoice string
  var invoice_str = `Thank you for your order ${user_email}!<table border><th>Quantity</th><th>Item</th>`;
  var shopping_cart = request.session.cart;
  for(product_key in products) {
    for(i=0; i<products[product_key].length; i++) {
        if(typeof shopping_cart[product_key] == 'undefined') continue;
        qty = shopping_cart[product_key][i];
        if(qty > 0) {
          invoice_str += `<tr><td>${qty}</td><td>${products[product_key][i].name}</td><tr>`;
        }
    }
}
  invoice_str += '</table>';
// Set up mail server. Only will work on UH Network due to security restrictions
  var transporter = nodemailer.createTransport({
    host: "mail.hawaii.edu",
    port: 25,
    secure: false, // use TLS
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false
    }
  });

  var mailOptions = {
    from: 'phoney_store@bogus.com',
    to: user_email,
    subject: 'Your phoney invoice',
    html: invoice_str
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      invoice_str += '<br>There was an error and your invoice could not be emailed :(';
    } else {
      invoice_str += `<br>Your invoice was mailed to ${user_email}`;
    }
    response.send(invoice_str);
  });
 
});

app.use(express.static('./public'));
app.listen(8080, () => console.log(`listening on port 8080`));