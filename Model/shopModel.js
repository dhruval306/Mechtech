const Mongoose = require("mongoose");


const shopSchema = new Mongoose.Schema({
  shop_name: String,
  shop_logo: String,
  owner: String,
  email: String,
  address: String,
  basic: String,
  standard: String,
  comprehensive: String,
});

module.exports = Mongoose.model("shops", shopSchema);