var fs = require('fs');

 var fname = "user_data.json";

 if (fs.existsSync(fname)) {
    var data = fs.readFileSync(fname, 'utf-8') 
     // can read any data

     var status= fs.statSync(fname);
     console.log("status");

var users =JSON.parse(data);
console.log(users);
 } else {
    console.log("sorry file" + fname + "does not exsit")
 };

 // guad to put on code 

