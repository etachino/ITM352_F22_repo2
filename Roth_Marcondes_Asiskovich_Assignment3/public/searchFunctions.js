/*Put the names of the values you want to search in the array */
let names = [
  "Red Crown Tail",
  "Blue Half Moon",
  "Black Crown Tail",
  "Galaxy Double Tail",
  "Opal Crown Tail",
  "Blue Spade Tail",
  "Anubias Plant",
  "Cryptcoryne Plant",
  "Sword Plant",
  "Pink Plant",
  "Rotala Plant",
  "Vallisneria Plant",
  "3.5g Gallon Mini",
  "25g North PR3",
  "10g Base IIPI",
  "Mega Home IX",
  "100g Desk Right",
  "2g Beginner I"
];
/*Sort the names in alphabetical order */
let sortedNames = names.sort();
/*Get the input of the value in the search box */
let input = document.getElementById("Search");
/*Add an on key up event listener */
input.addEventListener("keyup", function(){
  /* */
  removeElements();
  /*Loop through the names */
  for(let i of sortedNames)
  {
  /*Check to see if the input starts with any of the sorted name */
    if(i.toLowerCase().startsWith(input.value.toLowerCase()) && input.value != "")
    {
      /*Create a list */
      let listItem = document.createElement("li");
      /*Add to the list */
      listItem.classList.add("list-items");
      /*Make the style to pointer */
      listItem.style.cursor = "pointer";
      /*When the list is clicked put it on the search value */
      listItem.setAttribute("onclick", "displayNames('" + i + "')");
      /*Create the word add from current word up to the word listed in the search value */
      let word = "<b>" +  i.substring(0, input.value.length)  + "</b>";
      /*Add to the remaining word */
      word+= i.substring(input.value.length);
      /*Set the inner HTML of list item to be the word */
      listItem.innerHTML = word;
      /*Append to the list */
      document.querySelector(".list").appendChild(listItem);
    }
  }
})
/*Displa the input search and remove elements */
function displayNames(value)
{
  input.value = value;
  removeElements();
}
/*Remove from the input search */
function removeElements()
{
  /*Query select all the list */
  let items = document.querySelectorAll(".list-items");
  /*For each list remove it */
  items.forEach((item) =>
  {
    item.remove();
  })
}
