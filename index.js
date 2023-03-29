const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('./models/User');
const dotenv=require('dotenv').config();
const flash = require('connect-flash');
const noty=require('noty')
const{MONGO_URL, SESSION_SECRET,PASSWORD,EMAIL}=process.env;
require('./auth')

// Connect to MongoDB
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,  
});


// Create Express app
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(flash());

app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge:60000 }
}))

app.use(passport.initialize());
app.use(passport.session());



app.set('view engine', 'ejs');
app.set("views", "./views");
app.use(express.static('public'));



app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});



const usersRouter = require('./routes/user');
app.use('/', usersRouter);




app.get("/", (req, res)=>{
  
  res.render('index')
  })
  
  app.get("/login", (req, res)=>{
    
    res.render('index')
  })
  
  
  app.get('/signin', (req, res) => {
    
    res.render('index');
  }); 
  
  app.get('/signup', (req, res)=>{
    res.render('signup')
  })
  
  app.get('/logout', (req, res)=>{
    res.render('index')
  })

  app.get('/update', (req, res)=>{
    res.render('password update')
  })
  
  app.get('/google',
  passport.authenticate('google', { scope:
      [ 'email', 'profile' ] }
  ));
  
  app.get( '/google/callback',
    passport.authenticate( 'google', {
        successRedirect: '/dashboard',
        failureRedirect: '/'
  }));

  app.get('/dashboard', (req, res)=>{
    res.render('dashboard')
  })


  app.get('/forgot-password', (req, res)=>{
    res.render('forget password')
  })

  

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL,
      pass: PASSWORD
    }
  });
  
  
  
  app.listen(5000, console.log("Server is running"));