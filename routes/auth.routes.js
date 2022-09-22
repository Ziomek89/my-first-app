const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const User = require('../models/User.models');
const bcryptjs = require('bcryptjs');


const { isAuthenticated, isNotAuthenticated } = require('../middleware/auth.middleware');

router.get('/', isAuthenticated, (req, res, next) => {
  res.render('index.hbs');
});

router.get('/signup', isNotAuthenticated, (req, res, next) => {
  res.render('signup.hbs');
});

router.post('/signup', (req, res, next) => {
  console.log(req.body);

  const myEmail = req.body.email;
  const myUsername = req.body.username;
  const myPassword = req.body.password;

  if (!myEmail || !myUsername || !myPassword) {
    res.render('signup.hbs', { errorMessage: 'All fields are mandatory. Please provide your email, username and password.' });
    return;
  }

  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(myPassword)) {
    res
      .status(500)
      .render('signup.hbs', { errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.' });
    return;
  }

  //USE BCRYPT HERE
  const myHashedPassword = bcryptjs.hashSync(myPassword);


  User.create({
    email: myEmail,
    username: myUsername,
    password: myHashedPassword
  })
    .then(savedUser => {
      console.log(savedUser);
      res.render('login.hbs');
    })
    .catch(error => {
      if (error instanceof mongoose.Error.ValidationError) {
        res.status(500).render('signup.hbs', { errorMessage: error.message });
      } else if (error.code === 11000) {
        res.status(500).render('signup.hbs', {
           errorMessage: 'Username and email need to be unique. Either username or email is already used.'
        });
      } else {
        next(error);
      }
    })
});

router.get('/login', isNotAuthenticated, (req, res, next) => {
  res.render('login.hbs');
})

router.post('/login', (req, res, next) => {
  console.log(req.body);

  const myUsername = req.body.username;
  const myPassword = req.body.password;

  User.findOne({
    username: myUsername
  })
    .then(foundUser => {

      console.log(foundUser);

      if(!foundUser){
        res.status(500).render('login.hbs' , {
          errorMessage: 'No user matching this username'});
        return;
      }

      //
      const isValidPassword = bcryptjs.compareSync(myPassword, foundUser.password)

      if(!isValidPassword){
        res.status(500).render('login.hbs' , {
          errorMessage: 'Incorrect password'});
        return;
      }

      req.session.user = foundUser;

      res.redirect('/profile')
      
    })
    .catch(err => {
        res.send(err);
    })
});

router.get('/profile', (req, res, next) => {
  console.log('yoooooo')
  if(req.session.user){
    res.render('profile.hbs', { username: req.session.user.username})
  } else {
    res.render('profile.hbs', { username: req.session.user.username });
  }
  
});

router.get('/protected', isAuthenticated, (req, res, next) => {
  res.send('this route is protected')
});

router.post('/logout', (req, res, next) => {
  req.session.destroy(err => {
    if (err) next(err);
    res.redirect('/');
  });
});


module.exports = router;