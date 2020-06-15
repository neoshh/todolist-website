const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();

let items = [];
let workItems = [];

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res) {
    res.render("list", {
        title: date.getDate(),
        items: items
    });
});

app.get("/work", function(req, res) {
    res.render("list", {
        title: "Work",
        items: workItems
    });
});

app.get("/about", function(req, res) {
    res.render("about");
});

app.post("/", function(req, res) {
    let item = req.body.item;

    if (req.body.list === "Work") {
        workItems.push(item);
        res.redirect("/work");
    } else {
        items.push(item);
        res.redirect("/");
    }
});

app.listen(process.env.PORT || 3000, function() {
    console.log("Server is up and running");
});
