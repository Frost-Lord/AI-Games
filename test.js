const express = require("express");
const app = express();
const path = require("path");
const bodyParser = require("body-parser");

app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json({ limit: '500mb' }));
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));
app.use(express.static(path.join(__dirname, "/test/static")));
app.set("views", __dirname + "/test/views");
app.set("view engine", "ejs");

app.get('/', (req, res) => {
    res.render("index", {
        title: "Home",
    });
});

app.listen(3030, function () {
    console.log("Listening on port 3030");
});

