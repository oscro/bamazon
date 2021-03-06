var mysql = require("mysql");
var inquirer = require("inquirer");
var { table } = require("table");


var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  start();
});

function start() {

    inquirer.prompt({
        name: "menu",
        type: "list",
        message: "What action would you like to access?",
        choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product", "Exit"]
    }).then(function(answer){

        switch (answer.menu) {
            case "View Products for Sale":
              viewProducts();
              setTimeout(start, 500);
              break;
      
            case "View Low Inventory":
              viewLowInventory();
              break;
      
            case "Add to Inventory":
              addToInventory();
              break;
      
            case "Add New Product":
              addNewProduct();
              break;
      
            case "Exit":
              console.log("Goodbye!");
              connection.end();
              break;
            };
    });
};

var viewProducts = function () {

  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    var info = [["ID", "Item Name", "Department", "Price", "Stock"]];
    res.forEach(function(pro) {
        info.push([pro.item_id, pro.product_name, pro.department_name, "$" + pro.price, pro.stock_quantity])
    });
    var display = table(info);
    console.log(display);
  });  
};

function viewLowInventory(){

  connection.query("SELECT item_id, product_name, price, stock_quantity FROM products WHERE stock_quantity <= 5", function(err, res) {
    if (err) throw err;
    var info = [["ID", "Item Name", "Department", "Price", "Stock"]];
    res.forEach(function(pro) {
        info.push([pro.item_id, pro.product_name, pro.department_name, "$" + pro.price, pro.stock_quantity])
    });
    var display = table(info);
    console.log(display);
  }); 

    setTimeout(start, 500);

};

function addToInventory(){

    viewProducts();

    setTimeout(function(){ 
    inquirer.prompt([
        {
        name: "itemId",
        type: "input",
        message: "Which item would you like to add inventory to? Type in the ID of the product.",
        validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
        },
        {
        name: "amountToAdd",
        type: "input",
        message: "How many units would you like to add?",
        validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
        }
    ]).then(function(answer){

        
        connection.query("UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id = ?;", [answer.amountToAdd, answer.itemId], function(err, res){
            if (err) throw err; 
            console.log("\nAmount Successfully Added!");
            viewProducts();
            setTimeout(start, 500);
        });
        
    });
  }, 500);
};

function addNewProduct(){

    inquirer.prompt([
        {
        name: "itemName",
        type: "input",
        message: "What is the name of the product you would like to add?"
        },
        {
        name: "departmentName",
        type: "input",
        message: "What department does the product belong to?",
        },
        {
        name: "price",
        type: "input",
        message: "What is the price of the product?",
        validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
        },
        {
        name: "stock",
        type: "input",
        message: "What is the current inventory level?",
        validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
        }
    ]).then(function(answer){
        connection.query("INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?, ?, ?, ?);", [answer.itemName, answer.departmentName, answer.price, answer.stock], function(err, res){
            if (err) throw err; 
            console.log("Product Successfully Added!");
            viewProducts();
            setTimeout(start, 1000);
        });
    });
};
