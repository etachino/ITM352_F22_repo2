const { count } = require("console");

require("./product_data.js");


for (counter = 1; eval("typeof name"+counter) != 'undefined'; counter++){

    console.log(counter + ". " + eval('name' + counter))
    }


console.log("That's all we have!");