const bodyParser = require("body-parser");
const { response } = require("express");
const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const ejs = require("ejs");
app.set('view engine', 'ejs');
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
require('dotenv').config();
var jwt = require('jsonwebtoken');
app.use(cookieParser());
//const uri =  "mongodb+srv://aky11052003:Engineering@cluster0.axglx.mongodb.net/DevCreate?retryWrites=true&w=majority";

try {
  mongoose.connect(
    process.env.URI,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log("Mongoose is connected")
  );
} catch (e) {
  console.log("could not connect");
}

//cookie auth
const authorization = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
    return res.sendStatus(403);
  }
  try {
    const data = jwt.verify(token, process.env.SECRET_KEY);
    req.userId = data.id;
    return next();
  } catch {
    return res.sendStatus(403);
  }
};

const nauthorization = (req, res, next) => {
  const ntoken = req.cookies.naccess_token;
  if (!ntoken) {
    return res.sendStatus(403);
  }
  try {
    const data = jwt.verify(ntoken, process.env.SECRET_KEY);
    req.userId = data.id;
    return next();
  } catch {
    return res.sendStatus(403);
  }
};


// normal user login
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/home.html");
});

app.get("/register", (req, res) => {
  res.sendFile(__dirname + "/register.html");
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/login.html");
});

app.post("/register", (req, res) => {
  const userName = req.body.username;
  const password = req.body.password;
  bcrypt.hash(password, saltRounds, function (err, hash) {
    const data = new User({
      email: userName,
      password: hash,
    });
    data.save();
  });
  res.send("successful");
});

app.post("/login", (req, res) => {
  let s = 1;
  const userName = req.body.username;
  const password = req.body.password;
  User.findOne({ email: userName }, (err, data) => {
    if (err) {
      console.log(err);
    } else {
      bcrypt.compare(password, data.password, function (err, result) {
        if (result == true) {
          s = 0;
          try{
          const token = jwt.sign({ id: data.email }, process.env.SECRET_KEY);
          return res
            .cookie("access_token", token, {
              httpOnly: true,
            })
            .status(200)
            .redirect('/stories')
          }catch(err){
            res.send(err);
          }
        } else {
          res.send("Email and Password does not match!");
        }
      });
    }
  });
});

app.get("/logout", authorization, (req, res) => {
  return res
    .clearCookie("access_token")
    .status(200)
    .json({ message: "Successfully logged out 😏 🍀" });
});




//NGO Login
const ngoSchema = new mongoose.Schema({
    email: String,
    password: String
  });
  const Ngo = new mongoose.model("Ngo", ngoSchema);
  
  app.get("/nregister", (req, res) => {
    res.sendFile(__dirname + "/nregister.html");
  });
  
  app.get("/nlogin", (req, res) => {
    res.sendFile(__dirname + "/nlogin.html");
  });
  
  app.post("/nregister", (req, res) => {
    const userName = req.body.username;
    const password = req.body.password;
    bcrypt.hash(password, saltRounds, function (err, hash) {
      const data = new Ngo({
        email: userName,
        password: hash,
      });
      data.save();
    });
    res.send("successful");
  });
  
  app.post("/nlogin", (req, res) => {
    let s = 1;
    const userName = req.body.username;
    const password = req.body.password;
    Ngo.findOne({ email: userName }, (err, data) => {
      if (err) {
        console.log(err);
      } else {
        bcrypt.compare(password, data.password, function (err, result) {
          if (result == true) {
            s = 0;
            try{
              const ntoken = jwt.sign({ id: data.email }, process.env.SECRET_KEY);
              return res
                .cookie("naccess_token", ntoken, {
                  httpOnly: true,
                })
                .status(200)
                .json({ message: "Logged in successfully" });
              }catch(err){
                res.send(err);
              }
          } else {
            res.send("Email and Password does not match!");
          }
        });
      }
    });
  });
app.get("/nlogout", authorization, (req, res) => {
    return res
      .clearCookie("naccess_token")
      .status(200)
      .json({ message: "Successfully logged out 😏 🍀" });
  });




// stories

const storySchema = new mongoose.Schema({
    title: String,
    story: String
  });
  const Story = new mongoose.model("Story", storySchema);

app.get('/compose',authorization,(req,res)=>{
    res.render('compose');
});

app.get('/stories',(req,res)=>{
    var post = [];
    Story.find((err,result)=>{
          post =result;
          res.render('home', {  inputData: post });
        });
});

app.post('/compose',(req,res)=>{
  const stitle = req.body.postTitle;
  const stext = req.body.postBody;
  const data = new Story({
    title: stitle,
    story: stext,
  });
  data.save();
  res.send("sucessful");
});

// complaints
const complaintSchema = new mongoose.Schema({
    name: String,
    phoneNumber: String,
    victimName: String,
    victimAddress: String,
    complaint: String
  });
  const Complaint = new mongoose.model("Complaint", complaintSchema);

app.get('/complaint',(req,res)=>{
    res.sendFile(__dirname + "/complaint.html");
});

app.post('/complaint',(req,res)=>{
 const name = req.body.name;
 const phoneNumber = req.body.phoneNumber;
 const victimName = req.body.victimName;
 const victimAddress = req.body.victimAddress;
 const complaint = req.body.complaint;

 const data = new Complaint({
    name: name,
    phoneNumber: phoneNumber,
    victimName: victimName,
    victimAddress: victimAddress,
    complaint: complaint
  });
  data.save();
  res.send("success");
});

//complaint display
app.get('/complaintdisplay',nauthorization,(req,res)=>{
    var post = [];
    Complaint.find((err,result)=>{
          post =result;
          res.render('complaintDisplay', { inputData: post });
        });
});

app.listen(3000, function () {
  console.log("i am a server");
});
