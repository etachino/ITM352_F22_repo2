/* 
Server for Assignment2
Author: Deborah Yuan & Evon Diep
Date: 11/16/22
Desc: This server, server.js, provides validation for the data submitted by the form on products display, responding with the appropriate response depending on whether the quantities inputted are valid or invalid. In case of valid quantities, the user will be sent to the login. With invalid quantities, the user will be sent an error.
*/

var express = require("express");
var app = express();
var path = require("path");

app.use(express.static(__dirname + "/public")); // route all other GET/POST requests to files in public
app.use("/css", express.static(__dirname + "/public")); // ?
app.use(express.urlencoded({ extended: true }));

// read files
var fs = require("fs");
const e = require("express");
var fname = "user_registration_info.json";
var prodname = __dirname + "/products.json";
var actname = __dirname + "/active_users.json";
var tempname = __dirname + "/tempfile.json";

if (fs.existsSync(fname)) {
	var stats = fs.statSync(fname);
	data = fs.readFileSync(fname, "utf-8");
	users = JSON.parse(data);
	console.log(users);
} else {
	console.log("Sorry file " + fname + " does not exist.");
	users = {};
}

if (fs.existsSync(prodname)) {
	var stats = fs.statSync(prodname);
	proddata = fs.readFileSync(prodname, "utf-8");
	products = JSON.parse(proddata);
	console.log(products);
	console.log("LENGTH" + products.length);
} else {
	console.log("Sorry file " + prodname + " does not exist.");
	products = {};
}

if (fs.existsSync(actname)) {
	var stats = fs.statSync(actname);
	actdata = fs.readFileSync(actname, "utf-8");
	actusers = JSON.parse(actdata);
	console.log(actusers);
} else {
	console.log("Sorry file " + actname + " does not exist.");
	actusers = {};
}

if (fs.existsSync(tempname)) {
	var stats = fs.statSync(tempname);
	tempdata = fs.readFileSync(tempname, "utf-8");
	tfiles = JSON.parse(tempdata);
	console.log(tfiles);
} else {
	console.log("Sorry file " + fname + " does not exist.");
	users = {};
}

var regErrors = {}; // empty error array

/* FUNCTIONS */

// date function
function getCurrentDate() {
	// PART OF IR4: OBTAINING TIME OF USER LOGIN
	var date = new Date(); // pulls new (current) date
	hours = date.getHours(); // variable for hours
	time = hours < 12 ? "AM" : "PM"; // variable for time, which sets AM or PM according to whether or not hours is less than 12
	hours = ((hours + 11) % 12) + 1; // uses % to check remainder for hours to convert from 24 hr clock to 12 hr clock
	minutes = date.getMinutes(); // variable for minutes
	minutes = minutes < 10 ? `0${minutes}` : `${minutes}`; // adds 0 in front of the minutes value if it is less than 10
	new_date =
		date.getMonth() +
		1 +
		"/" +
		date.getDate() +
		"/" +
		date.getFullYear() +
		" " +
		hours +
		":" +
		minutes +
		time; // creates a variable called new_date, which combines month, day, year, hours, minutes, then AM/PM
	return new_date; // calling on the function returns the current date + time
}

// isNonNegativeInteger tests the input for errors, then returns error messages if any, REUSED FROM ASSIGNMENT 1
function isNonNegativeInteger(queryString, returnErrors = false) {
	errors = []; // assume no errors at first
	if (Number(queryString) != queryString) {
		errors.push("Not a number!"); // Check if string is a number value
	} else {
		if (queryString < 0) errors.push("a Negative value!"); // Check if it is non-negative
		if (parseInt(queryString) != queryString) errors.push("Not an integer!"); // Check that it is an integer
	}

	if (returnErrors) {
		// if there are errors, return errors
		return errors;
	} else if (errors.length == 0) {
		return true;
	} else {
		return false;
	}
}

app.get("/products.json", function (request, response, next) {
	// if /products.json is being requested, then send back products as a string
	response.type(".json");
	var products_str = `var products = ${JSON.stringify(products)};`;
	response.send(products_str);
});

// monitor all requests
app.all("*", function (request, response, next) {
	console.log(request.method + " to " + request.path);
	next();
});

// THIS IS FOR LOGIN AND REGISTER

ordered = ""; // have a variable called ordered with no value, purchased quantities will initially be in here

app.post("/purchase", function (request, response) {
	// CODE PARTIALLY REUSED FROM ASSIGNMENT 1
	// process purchase request (validate quantities, check quantity available)
	let validinput = true; // assume that all terms are valid
	let allblank = false; // assume that it ISN'T all blank
	let instock = true; // if it is in stock
	let othererrors = false; //assume that there aren't other errors
	// process form by redirecting to the receipt page
	customerquantities = request.body[`quantitytextbox`];
	console.log("QUANTITIES=" + customerquantities);
	for (let i in customerquantities) {
		// Iterate over all text boxes in the form.
		qtys = customerquantities[i];

		let model = products[i]["name"];
		if (qtys == 0) {
			// assigning no value to certain models to avoid errors in invoice

			ordered += model + "=" + qtys + "&";
		} else if (
			isNonNegativeInteger(qtys) &&
			Number(qtys) <= products[i].quantity_available
		) {
			// if qtys is true, added to ordered string
			ordered += model + "=" + qtys + "&"; // appears in invoice's URL
		} else if (isNonNegativeInteger(qtys) != true) {
			// quantity is "Not a Number, Negative Value, or not an Integer"
			validinput = false;
		} else if (Number(qtys) >= products[i].quantity_available) {
			// Existing stock is less than desired quantity
			instock = false;
		} else {
			// textbox has gone missing? or some other error
			othererrors = true;
		}
	}

	if (customerquantities.join("") == 0) {
		// if the array customerquantities adds up to 0, that means there are no quantities typed in
		allblank = true;
	}

	// If we found an error, redirect back to the order page, if not, proceed to login

	if (allblank) {
		// if all boxes are blank, there is an error, pops up alert
		console.log(allblank);
		ordered = "";
		response.redirect(
			"products_display.html?error=Invalid%20Quantity:%20No%20Quantities%20Selected!%20Please%20type%20in%20values!"
		);
	} else if (!validinput) {
		// quantity is "Not a Number, Negative Value, or not an Integer", pops up alert
		ordered = "";
		response.redirect(
			"products_display.html?error=Invalid%20Quantity:%20Please%20Fix%20the%20Errors%20in%20Red%20on%20the%20Order%20Page!"
		);
	} else if (!instock) {
		// Existing stock is less than desired quantity, pops up alert
		ordered = "";
		response.redirect(
			"products_display.html?error=Invalid%20Quantity:%20Requested%20Quantity%20Exceeds%20Stock"
		);
	} else if (othererrors) {
		// textbox has gone missing? or some other error, pops up alert
		ordered = "";
		response.redirect(
			"products_display.html?error=Invalid%20Quantity:%20Unknown%20Error%20has%20occured"
		);
	} else {
		// If everything is good, redirect to the invoice page.
		response.redirect("login?" + ordered);
	}
});

// login
app.get("/login", function (request, response) {
	let params = new URLSearchParams(request.query);
	console.log(params);
	console.log(params.toString());
	ordered = "";
	response.send(`
	<script>
	let params = (new URL(document.location)).searchParams; // pull params from search URL

	/* allows for us to create an error alert based off of the results of the server's validataion*/
		
	  var quantities = []; // declaring empty array 'quantities'
	  params.forEach ( // for each iterates through all the keys
		function(value,key)
		{
		  quantities.push(value); // pushes the value to quantities array
		}
	  )
	

	console.log("Params=" + params); // shows what the params are in the console
	// Check for an error and if so, pop up an alert to the user
	if (params.has("error")) {
	  let err_msg = params.get("error");
	  alert(err_msg);
	}
	</script>
	<body>
		<form name='login' action="?${
			params.toString().split("error")[0]
		}" method="POST"> <!-- make sure to remove the error message -->
		
			<span id="usernamelabel" name="usernamelabel">Enter a username</span><BR><BR>
			<input type="text" id ="username" class="username" name="username" placeholder="Username"</input><BR><BR>
			<span id="passwordlabel" name="passwordlabel">Enter a password</span><BR><BR>
			<input type="text" id ="password" class="userpasswordname" name="password" placeholder="Password"</input><BR><BR>
		
	</body>
	<footer class="container-fluid text-center">
		<!-- footer -->
		<input type="submit" value='Login' id="button"></input>
	</form>
	<form name='login' action='/startregister?${
		params.toString().split("error")[0]
	}' method="POST">
	<input type="submit" value='New User? Click Here' id="button"></input>
	</form>`);
});

app.post("/login", function (request, response) {
	let params = new URLSearchParams(request.query);
	console.log(params);
	// Process login form POST and redirect to logged in page if ok, back to login page if not
	let inputusername = request.body[`username`].toLowerCase();
	console.log(inputusername);
	let inputpassword = request.body[`password`];
	let currentuser = inputusername;
	if (typeof users[inputusername] != "undefined") {
		//
		if (users[inputusername].password == inputpassword) {
			// NEED TO IMPLEMENT STICKY FORMS FOR USERNAME
			users[inputusername].amtlogin += Number(1);
			actusers[inputusername] = {};
			users[inputusername].loginstatus = true;
			users[inputusername].lasttimelog = users[inputusername].currtimelog;
			users[inputusername].currtimelog = getCurrentDate();
			actusers[inputusername] = users[inputusername];
			userstatus = "currentuser=" + currentuser + "&";
			let data = JSON.stringify(users);
			let actdata = JSON.stringify(actusers);
			fs.writeFileSync(fname, data, "utf-8");
			fs.writeFileSync(actname, actdata, "utf-8");
			console.log("hi");
			response.redirect("loginsuccess?" + params.toString() + "&" + userstatus);
		} else {
			response.redirect(
				"login?" + params.toString() + "&error=Password%20is%20incorrect!"
			);
		}
		return;
	}
	response.redirect(
		"login?" + params.toString() + "&error=Username%20Does%20Not%20Exist" // MAKE ERRORS APPEAR UNDER TEXTBOX LIKE /REGISTER
	);
});

// page if Login is successful
app.get("/loginsuccess", function (request, response) {
	let params = new URLSearchParams(request.query);
	console.log(params.toString());
	if (params.has("currentuser")) {
		currentuser = params.get("currentuser");
	}

	console.log("CHECK THIS" + params.toString());

	tfiles["loginsuccesstemp"] = {}; // writing temp files to solve issue of restarting server
	tfiles["loginsuccesstemp"].currentuser = currentuser;
	tfiles["loginsuccesstemp"].stringparams = params.toString();

	let tempdata = JSON.stringify(tfiles);
	fs.writeFileSync(tempname, tempdata, "utf-8");

	if (Object.keys(actusers).length == 2) {
		// grammar fixer
		str =
			"There is currently " +
			Number(Object.keys(actusers).length - 1) +
			" person logged in.";
	} else {
		str =
			"There are currently " +
			Number(Object.keys(actusers).length - 1) +
			" people logged in.";
	}

	if (actusers[tfiles["loginsuccesstemp"].currentuser].amtlogin == 1) {
		// grammar fixer
		str2 =
			"You've logged in a total of " +
			actusers[tfiles["loginsuccesstemp"].currentuser].amtlogin +
			" time.";
	} else {
		str2 =
			"You've logged in a total of " +
			actusers[tfiles["loginsuccesstemp"].currentuser].amtlogin +
			" times.";
	}

	if (
		actusers[tfiles["loginsuccesstemp"].currentuser].lasttimelog == 0 ||
		actusers[tfiles["loginsuccesstemp"].currentuser].lasttimelog == undefined
	) {
		str3 = "This is the first time you've logged in.";
	} else {
		str3 =
			"You were last logged in on " +
			actusers[tfiles["loginsuccesstemp"].currentuser].lasttimelog +
			". Welcome back!";
	}
	response.send(
		`
	<p> ${tfiles["loginsuccesstemp"].currentuser}, you have logged in successfully. ${str}
	<p> ${str2} ${str3}<p>
	<form name='editaccount' action='?${tfiles["loginsuccesstemp"].stringparams}' method="POST">
	<input type="submit" value='Edit Account Information' id="button"></input>
	</form>
	<form name='gotoinvoice' action='invoice?${tfiles["loginsuccesstemp"].stringparams}' method="POST">
	<input type="submit" value='Go To Invoice' id="button"></input>
	</form>`
	);
});

app.post("/loginsuccess", function (request, response) {
	response.redirect("editaccount?" + tfiles["loginsuccesstemp"].stringparams);
});

// page to Edit Account

app.get("/editaccount", function (request, response) {
	let params = new URLSearchParams(request.query);
	console.log("EDITACCPARAM" + params);
	if (params.has("currentuser")) {
		currentuser = params.get("currentuser");
	}
	console.log("CURR USER PARAM" + currentuser);
	console.log("EDITACCPARAM" + params);
	response.send(`
	<body>
		<form name='editaccount' action="?${params.toString()}" method="POST">
			<span id="accountpageinstruction" name="accountpageinstruction">Hi ${currentuser}, edit your account information here:</span>
			<p>Only enter information into the following textboxes if you want to change these pieces of information. Otherwise, leave the box blank.<p>
			<span id="editfullnamelabel" name="editfullnamelabel">Enter your current full name in the first textbox, then your new full name in the second textbox</span><BR><BR>
			<input type="text" id ="currentfullname" class="currentfullname" name="currentfullname" placeholder="Enter Current Full Name"</input><BR><BR>
			<input type="text" id ="newfullname" class="newfullname" name="newfullname" placeholder="Enter New Full Name"</input><BR><BR>
			<span id="editusernamelabel" name="editusernamelabel">Enter your current email in the first textbox, then your new email in the second textbox</span><BR><BR>
			<input type="text" id ="currentusername" class="currentusername" name="currentusername" placeholder="Enter Current Email"</input><BR><BR>
			<input type="text" id ="newusername" class="newusername" name="newusername" placeholder="Enter New Email"</input><BR><BR>
			<span id="editpasswordlabel" name="editpasswordlabel">Enter your current password in the first textbox, then your new password in the second textbox</span><BR><BR>
			<input type="text" id ="currentpassword" class="currentpassword" name="currentpassword" placeholder="Enter Current Password"</input><BR><BR>
			<input type="text" id ="newpassword" class="newpassword" name="newpassword" placeholder="Enter New Password"</input><BR><BR>
			<span id="passwordconfirmlabel" name="passwordconfirmlabel">Confirm your new password by typing it again</span><BR><BR>
			<input type="text" id ="newpasswordconfirm" class="newpasswordconfirm" name="newpasswordconfirm" placeholder="Enter New Password Again"</input><BR><BR>
	</body>
	<footer class="container-fluid text-center">
		<!-- footer -->
		<input type="submit" value='Submit Changes' id="button"></input>
	</form>`);
});

app.post("/editaccount", function (request, response) {
	// POST for editing the account information
	let params = new URLSearchParams(request.query); // grab params from url
	if (params.has("currentuser")) {
		// identify current user get get it
		currentuser = params.get("currentuser");
	}

	console.log("EDITACCPARAM" + params);

	POST = request.body;
	curr_full_name = POST["currentfullname"];
	new_full_name = POST["newfullname"];
	curr_user_name = POST["currentusername"]; // USERNAME IS THE EMAIL
	new_user_name = POST["newusername"];
	curr_pass = POST["currentpassword"];
	new_pass = POST["newpassword"];
	new_pass_2 = POST["newpasswordconfirm"];

	actusers["usernamechange"] = {}; // stores some information if the user decides to change their username/email

	// if the current username/email exists
	if (new_full_name == "") {
		console.log("New Full Name is blank"); // status
	} else if (actusers[currentuser].name != curr_full_name) {
		console.log("Current Full Name is incorrect"); // status
	} else {
		// if new full name box isn't empty
		actusers[currentuser].name = new_full_name; // set new full name to current full name
	}

	// if the new password isn't blank and matches
	if (new_pass == "") {
		console.log("New Password is blank"); // status
		// if password isn't blank
	} else if (actusers[currentuser].password != curr_pass) {
		console.log("Current Password is incorrect"); // status
	} else if (new_pass != new_pass_2) {
		console.log("New Password Doesn't match"); // status
	} else {
		actusers[currentuser].password = new_pass; // set current password to new password
	}

	if (new_user_name == "") {
		//pulls email/username value from params if the customer doesn't plan on changing their email/username
		// if new username box is empty
		console.log("New Email is blank");
		users[currentuser] = actusers[currentuser];
		actusers["usernamechange"].newparams = params;

		let data = JSON.stringify(users);
		let actdata = JSON.stringify(actusers);

		fs.writeFileSync(fname, data, "utf-8");
		fs.writeFileSync(actname, actdata, "utf-8");
	} else {
		// if the new email/username box has a value in it, meaning the customer wants to change their username/email
		if (currentuser != curr_user_name) {
			console.log("Username error: Current Email is incorrect"); // HERE
			actusers["usernamechange"].newparams = params;
			users[currentuser] = actusers[currentuser];

			let data = JSON.stringify(users);
			let actdata = JSON.stringify(actusers);

			fs.writeFileSync(fname, data, "utf-8");
			fs.writeFileSync(actname, actdata, "utf-8");
		} else if (users[new_user_name] != undefined) {
			// if other accounts are using the desired email
			console.log("Username error: the Email is already taken!"); // HERE status if email is in use
			actusers["usernamechange"].newparams = params;
			users[currentuser] = actusers[currentuser];
			let data = JSON.stringify(users);
			let actdata = JSON.stringify(actusers);

			fs.writeFileSync(fname, data, "utf-8");
			fs.writeFileSync(actname, actdata, "utf-8");
		} else {
			actusers[new_user_name] = {}; // makes empty object for the user's new account
			actusers[new_user_name].name = actusers[currentuser].name; // copies over current name
			actusers[new_user_name].password = actusers[currentuser].password; // copies over current password
			actusers[new_user_name].loginstatus = actusers[currentuser].loginstatus; // copies over current login status
			actusers[new_user_name].amtlogin = actusers[currentuser].amtlogin; // copies over the amount of times logged in

			actusers["usernamechange"].formerusername = currentuser; // stores info on the now OLD username
			actusers["usernamechange"].currentusername = new_user_name; // stores info on what the NEW username is
			paramsstring = params.toString(); // turns the current params into a string
			paramcutqty = Number("currentuser=".length + currentuser.length + 2); // calculates how long the OLD username is (in the query string)
			console.log("CUTQUTY" + paramcutqty); // console.log to check length
			removedcurruserfromparams = paramsstring.slice(0, -paramcutqty); // sets the remaining params left to a new variable
			console.log(removedcurruserfromparams);
			actusers["usernamechange"].newparams =
				removedcurruserfromparams.toString() + "&currentuser=" + new_user_name;
			console.log(removedcurruserfromparams);
			delete actusers[currentuser];

			users[new_user_name] = {};
			users[new_user_name].name = actusers[new_user_name].name;
			users[new_user_name].password = actusers[new_user_name].password;
			users[new_user_name].loginstatus = actusers[new_user_name].loginstatus;
			users[new_user_name].amtlogin = actusers[new_user_name].amtlogin;

			delete users[currentuser];

			let data = JSON.stringify(users);
			let actdata = JSON.stringify(actusers);

			fs.writeFileSync(fname, data, "utf-8");
			fs.writeFileSync(actname, actdata, "utf-8");
		}
	}
	newparams = actusers["usernamechange"].newparams;
	response.redirect("loginsuccess?" + newparams);
});
// Code inspired by Assignment 2 Code Examples
app.get("/register", function (request, response) {
	let params = new URLSearchParams(request.query);
	console.log(params);
	console.log(params.toString());

	response.send(
		`
		<script>
		window.onload = function() {
		let params = (new URL(document.location)).searchParams;

		if (params.has('fullname')) {
			var fullname = params.get('fullname');
			document.getElementById('fullname').value = fullname;
			document.getElementById("submitbutton").outerHTML = '<input type="submit" value="Continue" id="button" name="button"></input>'
		}

		if (params.has('email')) {
				var email = params.get('email');
				document.getElementById('username').value = email;
		}
	};
		</script>
    <form method ="POST" action ="?${params.toString().split("fullname")[0]}">
	<b>${
		typeof regErrors["empty_boxes"] != "undefined"
			? regErrors["empty_boxes"]
			: ""
	}</b><BR>
    <span id="fullnamelabel" name="fullnamelabel">Enter your full name</span><BR>
    <input type="text" id ="fullname" class="fullname" name="fullname" placeholder="First Name Last Name"</input><BR>
	<b>${
		typeof regErrors["bad_userlength"] != "undefined"
			? regErrors["bad_userlength"]
			: ""
	}<BR>
	${
		typeof regErrors["bad_user"] != "undefined" ? regErrors["bad_user"] : ""
	}</b><BR>

    <span id="usernamelabel" name="usernamelabel">Enter an email</span><BR>
    <input type="text" id ="username" class="username" name="username" placeholder="bob@example.com"</input><BR>
	<b>${
		typeof regErrors["bad_email"] != "undefined" ? regErrors["bad_email"] : ""
	}<BR>
	${
		typeof regErrors["username_taken"] != "undefined"
			? regErrors["username_taken"]
			: ""
	}</b><BR>

    <span id="passwordlabel" name="passwordlabel">Enter a password</span><BR>
    <input type="text" id ="password" class="password" name="password" placeholder="Password"</input><BR>
	<b>${
		typeof regErrors["bad_passlength"] != "undefined"
			? regErrors["bad_passlength"]
			: ""
	}<BR>
	${
		typeof regErrors["contains_space"] != "undefined"
			? regErrors["contains_space"]
			: ""
	}</b><BR>

    <span id="passwordlabelconfirm" name="passwordlabelconfirm">Repeat password</span><BR>
    <input type="text" id ="passwordconfirm" class="passwordconfirm" name="passwordconfirm" placeholder="Password"</input><BR>
	<b>${
		typeof regErrors["password_mismatch"] != "undefined"
			? regErrors["password_mismatch"]
			: ""
	}</b><BR>
    <input type="submit" value='Register' id="submitbutton" name="submitbutton" onclick="changeValue();"></input>
    </form>
    `
	);
	// errors = false;
});

app.post("/register", function (request, response) {
	let params = new URLSearchParams(request.query);
	console.log(params);
	// let POST = request.body;
	// let user_name = POST["username"];

	regErrors = {}; // sets regErrors to empty

	fullname = request.body.fullname;
	user_name = request.body.username.toLowerCase();
	password = request.body.password;
	currentuser = user_name;
	pass_repeat = request.body.passwordconfirm;

	username = request.body.username.toLowerCase();

	// check for empty textboxes
	if (
		request.body.fullname == "" ||
		request.body.username == "" ||
		request.body.password == "" ||
		request.body.passwordconfirm == ""
	) {
		regErrors["empty_boxes"] = `All textboxes must be filled.`;
	}

	// FULL NAME VALIDATION
	// checks to see if full name entered is between 2 and 30 characters
	if (request.body.fullname.length < 2 || request.body.fullname.length > 30) {
		regErrors["bad_userlength"] = `Name must be between 2 and 30 characters.`;
	}

	// check to see if full name only contains letters
	if (/^[A-Za-z_ -]+$/.test(request.body.fullname) == false) {
		regErrors["bad_user"] = `Name must only contain letters.`;
	}

	// EMAIL VALIDATION
	// check if email is taken
	if (typeof users[user_name] != "undefined") {
		regErrors["username_taken"] = `Sorry, ${username} is already registered!`;
	}
	// checks if email follows X@Y.Z format
	if (
		/^[a-zA-Z0-9._]+@[a-zA-Z0-9.]+(?:\.[a-zA-Z0-9-]+)*$/.test(
			request.body.username
		) == false
	) {
		regErrors["bad_email"] = `Please enter a valid email.`;
	}

	// PASSWORD VALIDATION
	// if password is not in between 10 and 16 characters
	if (request.body.password.length < 10 || request.body.password.length > 16) {
		regErrors[
			"bad_passlength"
		] = `Password must be between 10 and 16 characters.`;
	}

	// checks if password box is empty; NOT implemented in app.get rn
	if (request.body.password == "") {
		regErrors["pass_space"] = `Please enter a valid password.`;
	}

	// checks if password contains spaces; allows all characters but not
	if (
		/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]*$/.test(request.body.password) == false
	) {
		regErrors["contains_space"] = `Passwords should not contain spaces.`;
	}

	// checks if the two passwords match
	if (request.body.password != request.body.passwordconfirm) {
		regErrors["password_mismatch"] = `Passwords must match!`;
	}

	if (Object.keys(regErrors).length == 0) {
		users[user_name] = {};
		users[user_name].username = request.body.username;
		users[user_name].fullname = request.body.fullname;
		users[user_name].password = request.body.password;
		users[user_name].loginstatus = true;
		users[user_name].lasttimelog = 0;
		users[user_name].currtimelog = getCurrentDate();
		users[user_name].amtlogin = 1;
		actusers[user_name] = {};
		actusers[user_name] = users[user_name];

		let data = JSON.stringify(users);
		let actdata = JSON.stringify(actusers);

		fs.writeFileSync(fname, data, "utf-8");
		fs.writeFileSync(actname, actdata, "utf-8");

		response.redirect(
			"./loginsuccess?" + params.toString() + "&currentuser=" + currentuser
		);
	} else {
		response.redirect(
			"./register?" +
				params.toString() +
				"&fullname=" +
				request.body.fullname +
				"&email=" +
				request.body.username
		); // keeps name and email input in URL to make form sticky
		console.log("errors=" + regErrors);
	}
});

app.post("/startregister", function (request, response) {
	let params = new URLSearchParams(request.query);
	response.redirect("register?" + params.toString());
});

app.post("/invoice", function (request, response) {
	let params = new URLSearchParams(request.query);
	console.log(params);
	console.log(params.toString());
	/*if (params.has("currentuser")) {
		currentuser = params.get("currentuser");
	}
	console.log(currentuser);
	actusers[currentuser].loginstatus*/
	if (params.has("currentuser")) {
		currentuser = params.get("currentuser");
	}
	var quantities = []; // declaring empty array 'quantities'
	params.forEach(
		// for each iterates through all the keys
		function (value, key) {
			quantities.push(value); // pushes the value to quantities array
		}
	);
	console.log("quantities=" + quantities);
	if (actusers[currentuser].loginstatus == true) {
		// modified from stack overflow (https://stackoverflow.com/questions/34909706/how-to-prevent-user-from-accessing-webpage-directly-in-node-js)
		for (i in quantities) {
			values = quantities[i];
			if (values != 0 && isNonNegativeInteger(values)) {
				console.log("values= " + values);
				products[i].quantity_available -= Number(values); // Stock, or quantity_available is subtracted by the order quantity
				products[i].quantity_sold =
					Number(products[i].quantity_sold) + Number(values); // EC IR1: Total amount sold, or quantity_sold increases by the order quantity
				let proddata = JSON.stringify(products);
				fs.writeFileSync(prodname, proddata, "utf-8");
			}
		}
		response.redirect("invoice.html?" + params.toString());
	} else {
		response.redirect("products_display.html");
	}
});

app.post("/goodbye", function (request, response) {
	let params = new URLSearchParams(request.query); // grab params from url
	if (params.has("currentuser")) {
		// identify current user get get it
		currentuser = params.get("currentuser");
	}
	response.send(`
	<p>Thank you ${currentuser} for your purchase<p>
	<p>Click the button below to log out</p>

<footer class="container-fluid text-center">
<!-- footer -->
<form action="logout?${params.toString()}" method="GET">
<input type="submit" value='Log Out' id="button"></input>
</form>`);
});

app.get("/logout", function (request, response) {
	let params = new URLSearchParams(request.query); // grab params from url
	if (params.has("currentuser")) {
		// identify current user get get it
		currentuser = params.get("currentuser");
	}
	ordered = "";
	actusers[currentuser].loginstatus = false;
	users[currentuser] = actusers[currentuser];
	delete actusers[currentuser];

	tfiles["loginsuccesstemp"] = {}; // delete tfiles

	let data = JSON.stringify(users);
	let actdata = JSON.stringify(actusers);
	let tempdata = JSON.stringify(tfiles);
	fs.writeFileSync(fname, data, "utf-8");
	fs.writeFileSync(actname, actdata, "utf-8");
	fs.writeFileSync(tempname, tempdata, "utf-8");
	response.redirect("index.html");
});

// start server
app.listen(8080, () => console.log(`listening on port 8080`));
