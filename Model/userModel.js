const Mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userdataSchema = new Mongoose.Schema({
  name: String,
  username: String,
  password: String,
  email: String,
  phone: String,
  role: String,
  Tokens: [
    {
      token: String,
    },
  ],
});

userdataSchema.methods.generateAuthToken = async function () {
  try {
    let token = jwt.sign({ _id: this._id }, process.env.KEY);
    this.Tokens = this.Tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (err) {
    console.log(err);
  }
};


module.exports = Mongoose.model("users", userdataSchema);