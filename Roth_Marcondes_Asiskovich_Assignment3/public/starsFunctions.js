let params = (new URL(document.location)).searchParams;
let type = params.get("type");
//Initial Ratings
var ratings = {

    fishproduct0: products["fish"][0].rating,
    fishproduct1: products["fish"][1].rating,
    fishproduct2: products["fish"][2].rating,
    fishproduct3: products["fish"][3].rating,
    fishproduct4: products["fish"][4].rating,
    fishproduct5: products["fish"][5].rating
  
}
var ratings2 = {

    tankproduct0: products["tank"][0].rating,
    tankproduct1: products["tank"][1].rating,
    tankproduct2: products["tank"][2].rating,
    tankproduct3: products["tank"][3].rating,
    tankproduct4: products["tank"][4].rating,
    tankproduct5: products["tank"][5].rating
  
}
var ratings3 = {

    plantproduct0: products["plant"][0].rating,
    plantproduct1: products["plant"][1].rating,
    plantproduct2: products["plant"][2].rating,
    plantproduct3: products["plant"][3].rating,
    plantproduct4: products["plant"][4].rating,
    plantproduct5: products["plant"][5].rating
  
}

//Total Stars
const starsTotal = 5;

//get the rating
function getRatings() {
    var loopRatings;
    switch(type){
        case "fish":
            loopRatings = ratings;
            break;
        case "tank":
            loopRatings = ratings2;
            break;
        case "plant":
            loopRatings = ratings3;
            break;

    }
    console.log(loopRatings);
    for (let rating in loopRatings) {
        //get the percentage
        const starPercentage = (loopRatings[rating] / starsTotal) * 100;
        //round to nearest 10
        const starPercentageRounded = `${Math.round(starPercentage / 10) * 10}%`;

        //set width of stars-inner to percentage
        document.querySelector(`.${rating} .stars-inner`).style.width = starPercentageRounded;
    }
}
