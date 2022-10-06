const { forEach } = require("lodash");

function checkIt(item, index) {
    console.log(`part ${index} is ${(isNonNegInt(item)?'a':'not a')} quantity`);
}

function checkIt() {
    forEach(`i=${i} value=${pieces[i]} type=${typeof pieces[i]}`)
}

function checkIt() {
    pieces.forEeach((item,index) => {} )
}

function download(url) {
    setTimeout(() => {
        // script to download the picture here
        console.log(`Downloading ${url} ...`);
        picture_data = "image data:XOXOXO";
    }, 3* 1000);
    return picture_data;
}

function process(picture) {
    console.log(`Processing ${picture}`);
}

let url = 'https://www.example.comt/big_pic.jpg';
process( download(url) );