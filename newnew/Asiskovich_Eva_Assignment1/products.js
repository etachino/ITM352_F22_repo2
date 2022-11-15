var products = [
    //product1
    {  
      "name":"White",  
      "price": 20,  
      "image": 'White.jpg',
      "quantity_available": 12
    },
    //product2
    {  
      "name":"Silver",  
      "price": 23,  
      "image": 'silver.jpg',
      "quantity_available": 8
      },
    //product3
    {  
      "name": "Black",  
      "price": 26,  
      "image": 'Black.jpg',
      "quantity_available": 10
      },
    
    //product4
    {  
      "name":"Gold",  
      "price": 28,  
      "image": 'gold.jpg',
      "quantity_available": 7
  },
    //product5
    {  
      "name":"Tropical",  
      "price": 30,  
      "image": 'NavyTropical.jpg',
      "quantity_available": 5
      }   
  ]
//product array
/*products = [product1, product2, product3, product4, product5];*/
  
  //Check it is a positive integer
  function checkNonNegInt(q)
  {
    errors = [];
   
    if(q < 0 || parseInt(q) != q ||Number(q) != q)
    {
      errors.push("Please enter a valid number!");
    }
    if(errors.length == 0)
    {
      return true;
    }
    else
    {
      let message = errors.join("");
      return message;
    }
  }

  //Get the input value 
  function getInputValue(quant)
  {
    // Selecting the input element and get its value 
    var inputQuant = document.getElementById("quantities" + quant).value;
     if(checkNonNegInt(inputQuant) != true)
     {
        document.getElementById("error_box" + quant).innerHTML = checkNonNegInt(inputQuant);
        return false;
     }
     else
     {
        document.getElementById("error_box" + quant).innerHTML = " ";
     }
     return true;
  }