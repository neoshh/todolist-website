const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// connect to mongodb
mongoose.connect("mongodb://localhost:27017/todoListDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// mongoose item schema
const itemsSchema = {
    name: String
};

// mongoose item model
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "This is the first thing to do"
});

const item2 = new Item({
    name: "This is the second thing to do"
});

const item3 = new Item({
    name: "This is the third thing to do"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {
    Item.find(function(error, items) {
        if (items.length === 0) {
            Item.insertMany(defaultItems, function(error) {
                if (error) {
                    console.log(error);
                } else {
                    console.log("Items successully saved to database.")
                }
            });
            res.redirect("/");
        } else {
            res.render("list", {
                title: "Today",
                items: items
            });
        }
    });
});

app.get("/:listName", function(req, res) {
    const listName = _.capitalize(req.params.listName);

    List.findOne({name: listName}, function(error, foundList) {
        if (!error) {
            if (foundList) {
                res.render("list", {
                    title: foundList.name,
                    items: foundList.items
                })
            } else {
                const list = new List({
                    name: listName,
                    items: defaultItems
                });
            
                list.save();
                res.redirect("/" + listName);
            }
        }
    })
});

app.get("/about", function(req, res) {
    res.render("about");
});

app.post("/", function(req, res) {
    const itemName = req.body.item;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today") {
        item.save();
        res.redirect("/");
    } else {
        List.findOne({name: listName}, function(error, foundList) {
            if (foundList) {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + listName);
            }
        })
    }
});

app.post("/delete", function(req, res) {
    const checkedItemId = req.body.checkedItem;
    const listName = req.body.listName;

    if (listName === "Today") {
        Item.findByIdAndRemove(checkedItemId, function(error) {
            if (!error) {
                console.log("Item deleted successfully.")
            }
        });
        res.redirect("/");
    } else {
        List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(error, foundlist) {
            if (!error) {
                res.redirect("/" + listName);
            }
        });
    }
});

app.listen(process.env.PORT || 3000, function() {
    console.log("Server is up and running");
});
