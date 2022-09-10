const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require('path');
app.use(cookieParser());
const dotenv= require("dotenv");


app.use(express.json())
const router = require("./Router/router.js");
app.use(router);

dotenv.config({ path: "./config.env" });
require("./Database/connection.js");

//deployment
if (process.env.NODE_ENV === "production"){
     app.use(express.static('front-end/build'));
     app.get("*", (req, res) => {
          res.sendFile(path.resolve(__dirname, 'front-end', 'build', 'index.html'))
     })
}


const Port = process.env.PORT;
app.listen(Port, () => console.log(`running on port number : ${Port}`));
