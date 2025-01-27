// user/login
// user/signup
// After LOgin and SIgnup ging to / page
const express = require("express");
const mongoose = require("mongoose")
const path = require("path")
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser")

// Connect
mongoose
    .connect("mongodb://127.0.0.1:27017/Users_Authentication")
    .then(() => console.log("MongoDB Connected!"));

// Schema
const userSchema = new mongoose.Schema({
    Username: {
        type: String,
        required: true,
        unique: true
    },
    Password: {
        type: String,
        required: true
    }
})  
// Model  
const UserModel = mongoose.model("user", userSchema)

// App
const app = express();

// View Engine and Views
app.set('views', path.join(__dirname, 'views'))
app.set("view engine", "ejs")


// Middlewares
app.use(express.json()) // To Support JSON Data
app.use(express.urlencoded({ extended: false })) // To Support FORM Data
app.use(cookieParser())


// Secret Key
const secretKey = "Nitish@1234"


// Routes
app.get("/", async (req, res) => {
    if(!req.cookies.uid){
        return res.redirect("/login")
    }

    try{
        jwt.verify(req.cookies.uid, secretKey)
        res.render("home", {allUsers: await UserModel.find()})
    }
    catch(err){
        return res.redirect("/login")
    }
    
})

app.get("/signup", (req, res) => {
    res.render("signup")
})

app.get("/login", (req, res) => {
    res.render("login")
})

app.post("/signup", async (req, res) => {
    const body = req.body
    await UserModel.create({
        Username: body.username,
        Password: body.password
    })

    const token = jwt.sign({"name": body.username}, secretKey)
    res.cookie("uid", token)

    res.redirect("/")
})

app.post("/login", async (req, res) => { //  Payload not working :- (await UserModel.find())[0].Username})//
    const user = await UserModel.findOne({"Username": req.body.username, "Password": req.body.password})

    if(user){
        const token = jwt.sign({"name": user.Username}, secretKey)
        res.cookie("uid", token)

        return res.redirect("/")
    }
    return res.render("login", {"error": "Login Failed"})
    
})

// Server Start
app.listen(8080, () => console.log("Server Started!"))