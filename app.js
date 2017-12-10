var express = require("express");
var app = express();
var indexRoutes = require("./routes/index");


app.set("view engine", "ejs");

app.use(indexRoutes);
app.use(express.static(__dirname + "/public"));

app.listen(3000, () => console.log("Listening on port 3000"));