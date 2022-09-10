const Mongoose = require("mongoose");


const bookingSchema = new Mongoose.Schema({
    user: String,
    company: String,
    model: String,
    typeOfService: String,
    description: String,
    address: String,
    standard: String,
    paymentOption: String,
    cardNumber : String, 
    cardCVV: String, 
    cardExpiry: String,
    status: String,
    cost : String,
    pickUpDate: String
    });

module.exports = Mongoose.model("bookings", bookingSchema);