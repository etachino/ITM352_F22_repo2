// Function that takes a string as input and depending on the value of returnErrors
// returns an array of errors or a boolean indicating; true if that string is a non-negative
// integer and false otherwise 

function isNonNegInt (q, returnErrors = false) {
    errors = []; // assume no errors at first
    if(Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
    if(q < 0) errors.push('Negative value!'); // Check if it is non-negative
    if(parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer
  
    if (returnErrors) {
        return errors;
    } else if(errors.length == 0) {
        return true;
    } else {
        return false;
    }
}

var attributes = "Daniel;21;21.5;-20.5";

var pieces = attributes.split(";");

for (i=0; i<pieces.length; i++) {
    errorArray = isNonNegInt (pieces[i], true);
    console.log(`i: ${i} ${errorArray.join(",")}`);
}
function checkIt(item, index) {
    console.log(`part ${index} is ${(isNonNegInt(item)?'a':'not a')} quantity`);
}

function checkIt() {
    forEach(`i=${i} value=${pieces[i]} type=${typeof pieces[i]}`)
}