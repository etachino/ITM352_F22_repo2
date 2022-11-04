var express = require('express');
var app = express();


app.use(express.urlencoded({ extended: true }));

var fs = require('fs');
 var fname = "user_data.json";

 if (fs.existsSync(fname)) {
    var data = fs.readFileSync(fname, 'utf-8') 
     // can read any data

var users =JSON.parse(data);
console.log(users);
 } else {
    console.log("sorry file" + fname + "does not exsit")
 };

app.get("/login", function (request, response) {
    // Give a simple login form
    str = `
<body>
<form action="" method="POST">
<input type="text" name="username" size="40" placeholder="enter username" ><br />
<input type="password" name="password" size="40" placeholder="enter password"><br />
<input type="submit" value="Submit" id="submit">
</form>
</body>
    `;
    response.send(str);
 });

app.post("/login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not
   let POST = request.body;
   let user_name = POST["username"];
   let user_pass = POST["password"];

   console.log("User name" + user_name + "password" + user_pass);

   if (users[user_name] != undefined) {
     if(users[user_name].password == user_pass) {
        response.send ("Good login for user" + user_name);
    } else {
        response.redirect("/.login");
    }

   } else {
    response.redirect("/.login?error=No Such errors");
   }});

app.listen(8080, () => console.log(`listening on port 8080`));
