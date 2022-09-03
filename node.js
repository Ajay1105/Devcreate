const bodyParser = require("body-parser");
const { response } = require("express");
const express = require("express");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
const ejs = require("ejs");
app.set('view engine', 'ejs');
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const uri =
  "mongodb+srv://aky11052003:Engineering@cluster0.axglx.mongodb.net/DevCreate?retryWrites=true&w=majority";
try {
  mongoose.connect(
    uri,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log("Mongoose is connected")
  );
} catch (e) {
  console.log("could not connect");
}

// normal user login
const userSchema = new mongoose.Schema({
  email: String,
  password: String
});
const User = new mongoose.model("User", userSchema);

app.get("/", (req, res) => {
  res.send("home");
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
          res.send("/secrets");
        } else {
          res.send("Email and Password does not match!");
        }
      });
    }
  });
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
            res.send("/secrets");
          } else {
            res.send("Email and Password does not match!");
          }
        });
      }
    });
  });

// stories

const storySchema = new mongoose.Schema({
    title: String,
    story: String
  });
  const Story = new mongoose.model("Story", storySchema);

app.get('/compose',(req,res)=>{
    res.render('compose');
});

app.get('/stories',(req,res)=>{
    var post = [];
    Story.find((err,result)=>{
          post =result;
          console.log(post);
          res.render('home', { homeText: "homeStartingContent", inputData: post });
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




app.listen(3000, function () {
  console.log("i am a server");
});
