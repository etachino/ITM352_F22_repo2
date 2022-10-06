const { split } = require("lodash");

// var attributes  =  "<name>;<age>;<major>";
var attributes = "Daniel;21+0.5;21-0.5";

var pieces = attributes.split(";");

for (i=0; i<pieces.length; i++) {
    console.log(`i=${i} value=${pieces[i]} type=${typeof pieces[i]}`);
}