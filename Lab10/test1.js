var attributes = "Daniel;21;21.5;-20.5";

var pieces = attributes.split(";");

function checkIt(item, index) {
   console.log(`part ${index} is ${(isNonNegInt(item)?'a':'not a')} quantity`);
}
 
function checkIt() {
   forEach(`i=${i} value=${pieces[i]} type=${typeof pieces[i]}`)
}
