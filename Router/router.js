const express = require('express')
const router = express.Router();
const userModel = require("../Model/userModel.js");
const session = require('express-session');
const shopModel = require('../Model/shopModel.js');
const bookigModel = require('../Model/bookigModel.js');

router.use(session({
    secret : "mechtech",
    resave : false,
    saveUninitialized : true
}))

router.get("/home", async (req, res) => {
    const rootUser = req.session.rootUser;
    const status = req.session.userLogIn;
    if(status){
        const shop = await shopModel.findOne({email : rootUser.User.email})
        if(shop){
        const bookings = await bookigModel.find({user : rootUser.User._id})
        const requests = await bookigModel.find({company : shop.shop_name})
        res.status(200).send({rootUser,status,shop,bookings,requests});
        }else{
            res.status(200).send({rootUser,status,shop});
        }
    }
    else{
        res.status(200).send({rootUser,status})
    }
});

router.post("/register", async (req, res) => {
    const {name, username, password, number, email, role} = req.body;
    if (
        !name ||
        !username ||
        !password ||
        !number ||
        !email ||
        !role
    ) {
        res.status(400).json({ error: "Invalid Information" });
    }
    try {
        const user = await userModel.findOne({ email: email });
        if (user) {
        res.status(500).json({ error: "User already existed" });
        } else {
        const NewUser = new userModel({
            name,
            username,
            password,
            number,
            email,
            role,
        });
        //securing password
        await NewUser.save();
        res.status(201).json({ message: "registration completed successfully" });
        
        }
    } catch (error) {
        res.status(500).json({ error: "Something went wrong!!" });
        console.log(error);
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(email,password);
    if (!email || !password) {
        res.status(500).json({error : "Invalid Information"});
    }
    try{
        const User = await userModel.findOne({ email: email });
        if(User){
            const passwordVerifaction = (User.password  == password);
            if(passwordVerifaction){
                const token = await User.generateAuthToken();
                console.log(token);
                res.cookie("token", token, {
                    expires: new Date(Date.now() + 258020000),
                    httpOnly: true,
                });
                req.session.rootUser = {User};
                req.session.userLogIn = true;
                res.status(200).json({message : "user login successfull", RootUser:{User}});
            }else{
                res.status(201).json({error : "Invalid credentials"});
            }
        }else{
            res.status(201).json({error : "Invalid credentials"});
        }
    }catch{
         res.status(500).json({error : "Something Went Wrong"});
    }
});

router.post('/shops', async (req, res) => {
    const {shop_name, shop_logo, email, owner, address, basic, standard, comprehensive} = req.body;
    if(shop_name == "" || shop_logo == "" || email == "" 
        || owner == ""|| address == ""|| basic == "" 
        || standard == ""|| comprehensive == "")
        {
            res.status(200).json({error : "Invalid Information"});
        }
        else{
            try{
                const verification = await shopModel.findOne({shop_name: shop_name});
                if(verification){
                    res.status(200).json({error : "Shop already registered"});
                }
                else{
                    const newShop = new shopModel({shop_name, shop_logo, email, owner, address, basic, standard, comprehensive});
                    await newShop.save();
                    res.status(201).json({ message: "Congratulation, your shop registered" });
                }
            }catch{
                 res.status(500).json({error : "Something Went Wrong"});
            }
        }
})

router.get("/shopdetails", async (req,res)=> {
    if(req.session.userLogIn){
        const rootUser = req.session.rootUser;
        const shops = await shopModel.find();
        res.status(201).json({shops,rootUser});
    }
})

router.post("/booking", async (req,res) => {
    if(req.session.userLogIn){
        const {company,model,typeOfService,description, address, paymentOption,user,cardNumber, cardCVV, cardExpiry} = req.body;
        if(user){
            const requestedCompany = await shopModel.findOne({shop_name: company});
            if(requestedCompany){    
            try {
                let cost = "0";
                if(typeOfService === "basic"){
                    cost = requestedCompany.basic;
                }else if(typeOfService === "standard"){
                    cost = requestedCompany.standard;
                }else if(typeOfService === "comprehensive"){
                    cost = requestedCompany.comprehensive;
                }

               const booking = new bookigModel({
                company,model,typeOfService,description, address, 
                paymentOption,user,cardNumber, cardCVV, cardExpiry,
                status:"pending",cost:cost
               })
               await booking.save();
               res.status(200).json({message : "Booking Successfull, Wait for the conformation"});
            } catch (err) {
                console.log(err);
            }
            }else{
                res.status(500).json({error : "shop is unauthorized"});
            }   
        }
    }else{
        res.status(500).json({error : ""});
    }
})

router.post("/confirmbookingdata", async (req, res) => {
    const {booking_id, user_id, company} = req.body;
    const userdetail = await userModel.findOne({_id : user_id});
    const bookingDetail = await bookigModel.findOne({_id : booking_id});
    res.status(200).json({userdetail, bookingDetail});
})

router.post("/confirmbooking", async (req, res) => {
    const {carOwnerId, bookingId, finalCost, pickUpDate} = req.body;
    await bookigModel.findOneAndUpdate({_id : bookingId},{
        status : "confirmed",
        cost : finalCost,
        pickUpDate : pickUpDate});
         res.status(200).json({message : "Booking Confirmed"});   
})

router.post("/pricechange", async (req,res) =>{
    const { id, basic, standard, comprehensive } = req.body;
    await shopModel.findOneAndUpdate({_id: id}, {
        basic : basic,
        standard : standard,
        comprehensive : comprehensive
    });
    res.status(200).json({message : "Price Changed Successfully"});
})

router.get("/logout", (req, res) => {
    req.session.userLogIn = false;
    res.status(201).json({message : "user logout"});
})

module.exports = router;