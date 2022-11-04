//var users = require("./user_data.json")
//console.log(users)
var fs = require('fs'); // require knows its JSON, and Javascrip
 // can read any data 

 var fname = "user_data.json";

var data = fs.readFileSync(fname, 'utf-8')  // can read any data
var users =JSON.parse(data);
console.log(data);
console.log(users);