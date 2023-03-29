const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const User = require('../models/User1');
const flash=require('connect-flash')






//Signup
router.post('/signup', async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      // Check if user already exists
      const user = await User.findOne({ email });
      if (user) {
        req.flash("message", "User Not Found");
        return res.render('signup');
      }
  
      // Hash password
      const salt =await bcrypt.genSalt(10);
      const hashedPassword= await bcrypt.hash(req.body.password,salt)
      
      // Create user in database
      await User.create({ name, email, password });
      req.flash("message", "User created Successfully");
      res.render('index', {Fname:name, error: '',success: 'User Successfully Registered'});
    } catch (err) {
      console.error(err);
      req.flash("message", "Something went wrong");
      res.render('signup', { error: 'Something went wrong', success:'' });
    }
  });

  
  // SIGNIN

  
  router.post('/signin', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        console.log('user dont exists');
        req.flash("message", "Invalid email or password");
        return res.render('index', { error: 'Invalid email or password', success: '' });
      }

      /* 
      !validPassword && res.status(400).json("Wrong Password")

      bcrypt.compare(password, user.password, function(err, result) {
        if (err) {
          // Handle error
          console.log('err occured');
          res.render('index', { error: 'Something went wrong' });
        } else if (result) {
          // Passwords match
          req.session.user = user;
          res.redirect('/dashboard');
        } else {
          // Passwords don't match
          console.log('password dont match');
          return res.render('index', { error: 'Invalid email or password' });
        }
      });
      
    }
   */
       // Compare passwords
      const isMatch =await bcrypt.compare(req.body.password, user.password);
      if (!isMatch) {
        console.log('password dont match');
        req.flash("message", "Invalid email or password");
        return res.render('index', { error: 'Invalid email or password',success: '' });
      }
  
      req.session.user = user;
      req.flash("message", "User Successfully LogedIn");
      const Fname=user.name || 'Robot';
      return res.render('dashboard', {Fname:"", error: '',success: 'User Successfully LogedIn'});
    } 
    catch (err) {
      console.error(err);
      console.log('err occured');
      req.flash("message", "Something went wrong");
      res.render('index', { error: 'Something went wrong', success:"" });
    }
  });





  router.post('/update', async (req, res) => {
    try {
      const { email, newP } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        req.flash("message", "User with this email does not exist");
        return res.render('index', { error: 'User dont exists with this email ',success: '' });
      }
  
      
      
  
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newP, salt);
  
      // Update user's password in database
      user.password = newP;
      await user.save();
      req.flash("message", "Updated with New Password");
      return res.render('dashboard', { error: '',success: 'Updated with New password' });
    } catch (error) {
      console.log(error);
      req.flash("message", "Something went wrong");
      res.redirect('back', { error: 'Something went Wrong',success: '' });
    }
  });

  




  
 // Logout route
router.get('/logout', (req, res) => {
  try{
    res.clearCookie('userToken')
    res.render('index',{ error: '',success: 'User Loged out successfully' })
  }
  catch(error){
    res.status(501).send(error)
    res.render('dashboard',{ error: '',success: 'Something went wrong' })
  }
});


  
// POST route for handling forgot password form submission
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      req.flash("message", "User with this email does not exist");
      return res.render('forgot-password', { error: 'User with this email does not exist',success: '' });
    }

    // Generate a new password
    const newPassword = Math.random().toString(36).slice(-8);

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user's password in database
    user.password = newPassword;
    await user.save();

    // Send email with the new password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: 'Password Reset',
      text: `Your new password is: ${newPassword}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log(`Email sent: ${info.response}`);
      }
    });
    req.flash("message", "New password has been sent to your email");
    return res.render('signup', { error: '',success: 'New password has been sent to your email' });
  } catch (error) {
    console.log(error);
    req.flash("message", "Something went wrong");
    res.render('index', { error: '',success: 'Something went wrong' });
  }
});

module.exports = router;
