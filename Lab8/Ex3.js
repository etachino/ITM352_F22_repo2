const { count } = require("console");

require("./product_data.js");
var num_products = 5;


for (counter = 1; counter <= num_products; counter++){

    if (counter > num_products/4 && counter < num_products*3/4) {
        console.log(eval('name' + counter)+ " is sold out!"); 
    } else {
    console.log(counter + ". " + eval('name' + counter))
    }
}

console.log("That's all we have!");