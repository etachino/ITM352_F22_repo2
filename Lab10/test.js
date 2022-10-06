var attributes = "Daniel;21;21.5;-20.5";

var pieces = attributes.split(";");

for (i=0; i<pieces.length; i++) {
    errorArray = isNonNegInt (pieces[i], true);
    console.log(`i: ${i} ${errorArray.join(",")}`);
}