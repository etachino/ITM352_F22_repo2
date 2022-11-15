products_array = require(__dirname +'/public/products.json'); //set array for products

const bodyParser = require('body-parser');
var express = require('express');
var app = express();
//use bodyparser
app.use(bodyParser.urlencoded({extended: true}));

// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));



// monitor all requests
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});

//validate quantities, check quantity available is crucial
 //Check it is a positive integer
 function checkNonNegInt(q)
 {
   errors = [];
  
   if(q < 0 || parseInt(q) != q ||Number(q) != q)
   {
     errors.push("Please enter a valid number!");
   }
   if(errors.length == 0)
   {
     return true;
   }
   else
   {
     let message = errors.join("");
     return message;
   }
   return false;
 }

 //Get the input value for quantities and use checkNonNegInt to show error string
 function getInputValue(quant)
 {
   // Selecting the input element and get its value 
   var inputQuant = document.getElementById("quantities" + quant).value;
    if(checkNonNegInt(inputQuant) != true)
    {
       document.getElementById("error_box" + quant).innerHTML = checkNonNegInt(inputQuant);
       return false;
    }
    else
    {
       document.getElementById("error_box" + quant).innerHTML = " ";
    }
    return true;
 }
 //Use a get request to get JSON data 
 //Important for inventory checking
 //From lab 13
 app.get("/products.js", function (request, response, next) {
  response.type('.js');
  var products_str = `var products = ${JSON.stringify(products_array)};`;
  response.send(products_str);
});
 
// process purchase request 
app.post('/purchase', function(request,response){
   //set error and quantity_error variable to false to use boolean for checking
   let error = false;
   let quantity_error = false;
   //loop for product checking
   for (var i= 0; i<products_array.length; i++){
       //saving request body to inputValue 
       var inputValue = request.body["slippers" + i];
       console.log(typeof (inputValue));

       //checking inputs
       //add call to checkNegInt 
       if (checkNonNegInt(inputValue)!= true && inputValue != 0){
         error = true;
       }else if (inputValue > products_array[i].quantity_available){
         quantity_error = true;
       }
   } //if returns false then response.redirect to index.html (client) and change purchase button text (IR4)!!!
   if (error == true){
      response.redirect('index.html?PurchaseButton=invalid quantity please select valid quantities!'); //if quantity is invalid such as negative or non-integer
   } else if (quantity_error == true){
    response.redirect('index.html?PurchaseButton=quantity exceeded!'); //if put in too many quantities 
   }

   else{
      
  //Write the invoice table in the server
    //Table style template from W3 schools https://www.w3schools.com/css/tryit.asp?filename=trycss_table_fancy
   response.write(`<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invoice</title>
          <style>
          #product_table {
            font-family: Arial, Helvetica, sans-serif;
            border-collapse: collapse;
            width: 100%;
          }
          
          #product_table td, #product_table th {
            border: 1px solid #ddd;
            padding: 8px;
            color: black;
          }
          
          #product_table tr:nth-child(even){background-color: white;}
          
          #product_table tr:hover {background-color: pink;}
          
          #product_table th {
            padding-top: 12px;
            padding-bottom: 12px;
            text-align: left;
            background-color: rgba(87, 122, 208, 0.5);
            color: white;
          }
          </style>
       
      </head>
      <body style = "position: relative; background-color: white">
  
      <h1 style = "text-align: center;">Thank you!</h1> 
      <table id="product_table" border= "1px"; style = "margin-left: auto; margin-right: auto; background-color: rgba(255, 202, 87, 0.5);">
      <tr>
      <th style = "text-align: center; width: 43%">Item</th>
      <th style = "text-align: center; width: 11%">Quantity</th>
      <th style = "text-align: center; width: 13%">Price</th>
      <th style = "text-align: center; width: 54%">Extended Price</th>
      </tr> 
      <tr>
      
      </tr>
      
      `);
      //adapted from lab 13 
      //loop for products data for pruchase 
      //subtotal
      var sub_total = 0;
      for (var i = 0; i<products_array.length; i++){
      
         //saving slippers to q 
         var q = request.body["slippers" + i];
         
         
         //using q to compute extended price back to index.html with a paramater that indicaters 

         var extended_price = q *products_array[i].price;
         
         //make an if statement in case products are not selected so that they do not show blank in the invoice
         if (q == 0){
            continue;
         }
         else {
            response.write(`<tr> <td> ${products_array[i].name} </td>
         <td>${q} </td>
          <td>${products_array[i].price} </td>
         <td>${extended_price} </td></tr>`)
         sub_total += extended_price;
         }
         
      } 

      
      //tax calculations
      //As of 2022 Hawaii GE tax is about 4.75%. This store is based in Hawaii therefore everyone will be charged GE tax regardless
      //adapted from invoice labs (changed conditions in addition to values)
      var sales_tax = .0475;
      var taxAmount = sub_total * sales_tax;
      //shipping conditions
      if(sub_total <=30){
        shipping = 2.99;
      }
      else if (sub_total <=100){
        shipping = 3.99;
      }
      else {
        shipping = 0.05*sub_total;
      }
      //compute the grand total 
      var grandTotal = sub_total + taxAmount + shipping;
      //Write the total, tax, and shipping in the invoice once the purchase request goes through
      //adapted from invoice 3 
      //added 30 day return policy
      response.write(`
      <tr><td colspan = "4" width = "100%">&nbsp;</td><tr>
      <tr>
      <td style = "text-align: center;" colspan = "3"; width = "67%">Sub-total</td> 
      <td width = "54%;">$${sub_total.toFixed(2)}</td>
      </tr>
      <tr>
      <td style = "text-align: center;" colspan = "3"; width = "67%">Tax @ 4.75%</td> 
      <td width = "54%;">$${(taxAmount).toFixed(2)}</td>
      </tr>
      <tr>
      <td style = "text-align: center;" colspan = "3"; width = "67%">Shipping</td> 
      <td width = "54%;">$${shipping.toFixed(2)}</td>
      </tr>
      <tr>
      <td style = "text-align: center;" colspan = "3"; width = "67%"><strong>Total</strong></td> 
      <td width = "54%;">$${grandTotal.toFixed(2)}</td>
      </tr>
      </table>
      <button onclick="window.location='index.html'">Continue shopping</button>
      </body>
      <footer>
      <BR>
      <b>OUR SHIPPING & RETURN POLICY:<br>
        A subtotal $0 - $29.99 will be $2.99 shipping<br>
        A subtotal $30 - $99.99 will be $3.99 shipping <br>
        Subtotals over $100 will be charged 5% of the subtotal amount <br></b>
        <b style="color:red;">30 DAY RETURNS</b>
        </footer>
      
      </html>
      `); 
      //End point for the purchase request using loop (page kept loading)
      response.end();
      for (var i=0; i< products_array.length; i++){
        products_array[i].quantity_available -= request.body["slippers" + i];
      }

} }
)




// start server on 8080
app.listen(8080, () => console.log(`listening on port 8080`));