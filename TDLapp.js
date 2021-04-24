//jshint esversion:6

const express = require("express");

const mongoose = require("mongoose");

const date = require(__dirname + "/date.js");

const _ = require("lodash");


const app = express();

// const items=[];
// const workItems = [];

app.set("view engine", "ejs");

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-shovna:Gudli2001@cluster0.byffi.mongodb.net/todolistDB", {useNewUrlParser: true});
mongoose.createConnection("mongodb+srv://admin-shovna:Gudli2001@cluster0.byffi.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your ToDo List!"
});

const item2 = new Item({
    name: "Hit the + button to add a new item"
});

const item3 = new Item({
    name: "<-- Hit this checkbox to mark the completion of your task"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema] //array of item documents associated with it
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req,res){

    const day = date.getDate();

    Item.find({}, function(err, foundItems){
        // console.log(foundItems);
        if(foundItems.length===0){
                Item.insertMany(defaultItems, function(err){
                    if(err){
                        console.log(err);
                    }
                    else{
                         console.log("Successfully saved default items to database");
                    }
                });
            res.redirect("/");
        }
        else{
            res.render("list", {
                listTitle: day,
                newListItems: foundItems
            });
        }
        
    });

    
});


app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName}, function(err, foundList){
        if(err){
            console.log(err);
        }
        else{
            if(!foundList){
                // console.log("Doesn't exist!");
                // create a new list
                const list = new List({
                        name: customListName,
                        items: defaultItems
                    });

                list.save();

                res.redirect("/" + customListName);

            }
            else{
                // console.log("Exists");
                // show the existing list

                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items
                });
            }
        }
    });

    
});



app.post("/", function(req,res){

    const itemName = req.body.newItem;

    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName == date.getDate()){
        item.save();

        res.redirect("/");
    }

    else{
        List.findOne({
            name: listName
        },
        function(err, foundList){
            if(err){
                console.log(err);
            }
            else{
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            }
            
        });
    }

    // if(req.body.list==="Work"){
        
    //     res.redirect("/work");workItems.push(item);
    // }
    // else{
    //     items.push(item);
    //     res.redirect("/");
    // }
    
    
});

app.post("/delete", function(req,res){
    const checkedItemId = req.body.checkbox;
    
    const listName = req.body.listName;

    if(listName == date.getDate()){
        Item.findByIdAndRemove(checkedItemId, function(err){
            if(err){
                console.log(err);
            }
            else{
                console.log("Successfully deleted the checked item");
                res.redirect("/");
            }
        });
    }

    else{
        List.findOneAndUpdate({name: listName}, {
            $pull: {items : {_id: checkedItemId}}
        }, 
        function(err, foundList){
            if(err){
                console.log(err);
            }
            else{
                res.redirect("/" + listName);
            }
        });
    }

    
});



// app.get("/work", function(req,res){
//     res.render("list", {
//         listTitle: "Work List",
//         newListItems: workItems
//     });
// });

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(){
    console.log("Server is running successfully");
});