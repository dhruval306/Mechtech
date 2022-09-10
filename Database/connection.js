const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({path:"./config.env"});

const db_url = process.env.DATABASELINK;
mongoose.connect(db_url).then(() => {
    console.log("connection done");
}).catch((err)=> {
    console.log(err);
})
 