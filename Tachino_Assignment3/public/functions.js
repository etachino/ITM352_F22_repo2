// Cited: Got from Multi Nav Page
// This function asks the server for a "service" and converts the response to text. 
function loadJSON(service, callback) {   // loadjson file 
    var xobj = new XMLHttpRequest(); // exchanges data with server
        xobj.overrideMimeType("application/json"); /* set the MIME type of the request. 
        MIME type specifies the format of the data being sent to or received from the server */
    xobj.open('GET', service, false); // initiates a HTTP GET request to a server
    xobj.onreadystatechange = function () { /* object that is triggered whenever the value of the readystate property changes,
        readystate property of the XMLHttpRequest object reflects the current state of the request. */
          if (xobj.readyState == 4 && xobj.status == "200") { /* checks the values of the readystate and status properties of the 
          XMLHttpRequest object to determine whether the request has completed successfully*/
            callback(xobj.responseText); // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
          }
    };
    xobj.send(null);  
 }

 function nav_bar(this_product_key, products) { // creates a function for the nav bar
    // This makes a navigation bar to other product pages
    for (let products_key in products) {
        if (products_key == this_product_key) continue;
        document.write(`<a href='./products_display.html?products_key=${products_key}'>${products_key}<a>&nbsp&nbsp&nbsp;`);
    }
}
