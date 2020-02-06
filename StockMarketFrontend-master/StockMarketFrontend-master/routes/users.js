const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const request = require('request');
const util = require('util');
const rp = require('request-promise');
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  const { name, email, physical_address1, physical_address2, physical_address3, p_name, password, password2 } = req.body;
  // var queryObject = {
  //       name: req.body.name,
  //       email: req.body.email,
  //       password: req.body.password,
  //       password2: req.body.password2
  //   }
  request.post('http://localhost:8000/users/register1',
    { form: { name: name, password: password, password2: password2, email: email, physical_address1:physical_address1, physical_address2:physical_address2, physical_address3:physical_address3, p_name:p_name}, },
        function (e, r, body) {
          var body1 = JSON.parse(body);
          console.log(body1.user);
          var errors = body1.error;
          if(body1.user=="yes"){
              req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
          } else{
              res.render('register', {
                errors,
                name,
                email,
                password,
                password2,
                physical_address1,
                physical_address2,
                physical_address3
              });
          }
        console.log(body);
  });
});

// Login

router.post('/login', (req, res, next) => {
  const { email, password} = req.body;
  request.post('http://localhost:8000/users/login1',
    { form: { email:email, password:password}, },
        function (e, r, body) {
          var body1 = JSON.parse(body);
          console.log(body1.error);
          if(body1.login){
            login = true;
            sess = req.session;
            sess.user = body1.user;
            user = body1.user;
            passport.serializeUser(function(user, done) {
                done(null, user.id);
            });

            passport.deserializeUser(function(id, done) {
                User.findById(id, function(err, user) {
                  done(err, user);
                });
            });
            console.log(req.session.user);
            res.redirect('/dashboard');
              

            //console.log(req.user);
          } else{
            console.log(body1.err);
            req.flash(
                  'error_msg',
                  'Incorrect email or password'               
            );
            res.redirect('/users/login');
          }
  });
});

//Forgot Password
// Login

router.post('/forgot_password', (req, res, next) => {
  const { email, p_name} = req.body;
  request.post('http://localhost:8000/users/forgot_password',
    { form: { email:email, p_name:p_name}, },
        function (e, r, body) {
          if(e){
            req.flash('error_msg', e);
            res.render('forgot_password');
          } else{
          var body1 = JSON.parse(body);
          if(body1.model.p_name==p_name){
            req.flash('success_msg', 'Correct answer');
            res.redirect('/reset_password/'+email);
          }
          else{
            req.flash('error_msg','Wrong answer');
            res.redirect('/forgot_password');
          }
        }
          
  });
});

//Reset Password
router.post('/reset_password', (req, res, next) => {
  const { email, password, password2 } = req.body;
  if(password!=password2){
    req.flash('error_msg', 'Passwords do not match');
    res.render('forgot_password');
  }
  request.post('http://localhost:8000/users/reset_password',
    { form: { email:email, password:password}, },
        function (e, r, body) {
          if(e){
            req.flash('error_msg', e);
            res.render('reset_password');
          } else{
          var body1 = JSON.parse(body);
          if(body1.user){
            req.flash('success_msg', 'Password changed successfully');
            res.redirect('/users/login');
          } else{
            req.flash('error_msg',body1.err);
            res.render('forgot_password');
          }
        }
          
  });
});

// Logout
router.get('/logout', (req, res) => {
  login = false;
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

// Adding bank account for the user
router.post('/addbankaccount', (req, res) => {
  const { acc_num, routing_num } = req.body;
  const id = req.session.user._id;
  request.post('http://localhost:8000/users/addbankaccount',
    { form: { id: id, acc_num: acc_num, routing_num: routing_num}, },
        function (e, r, body) {
          var body1 = JSON.parse(body);
          if(body1.update){
              req.flash(
                  'success_msg',
                  'The bank account has been added'
                );
              console.log(req.session);
              req.session.user = body1.model;
                res.redirect('/mybankaccount');
          } else{
              res.render('mybankaccount', {
                acc_num,
                routing_num
              });
          }
  });
});

//user_profile_edit
router.post('/user_profile', (req, res, next) => {
  const {name,physical_address1,physical_address2,physical_address3} = req.body;
  const id = req.session.user._id;
  request.post('http://localhost:8000/users/user_profile',
    { form: { id: id, name:name, physical_address1:physical_address1, physical_address2:physical_address2,physical_address3:physical_address3}, },
        function (e, r, body) {
          var body1 = JSON.parse(body);
          if(body1.update){
              req.flash(
                  'success_msg',
                  'The Profile has been updated'
                );
              console.log(req.session);
              req.session.user = body1.model;
              res.redirect('/dashboard');
          } else{
              res.render('user_profile', {
                name,
                physical_address1,
                physical_address2,
                physical_address3
              });
          }
  });
});

//Adding credits
router.post('/addcredit', (req, res) => {
  var credit = parseInt(req.body.credit);
  credit = credit+req.session.user.credit;
  console.log(credit);
  const id = req.session.user._id;
  request.post('http://localhost:8000/users/addcredit',
    { form: { id: id, credit:credit}, },
        function (e, r, body) {
          var body1 = JSON.parse(body);
          if(body1.update){
              req.flash(
                  'success_msg',
                  'The amount has been added'
                );
              req.session.user = body1.model;
                res.redirect('/mybankaccount');
          } else{
              res.render('addcredit', {
                credit
              });
          }
  });
});

//Adding credits
router.post('/removecredit', (req, res) => {
  var credit = parseInt(req.body.credit);
  credit = req.session.user.credit - credit;
  console.log(credit);
  const id = req.session.user._id;
  request.post('http://localhost:8000/users/removecredit',
    { form: { id: id, credit:credit}, },
        function (e, r, body) {
          var body1 = JSON.parse(body);
          if(body1.update){
              req.flash(
                  'success_msg',
                  'The amount has been sent to the bank'
                );
              req.session.user = body1.model;
                res.redirect('/mybankaccount');
          } else{
              res.render('removecredit', {
                credit
              });
          }
  });
});

//Buying stocks
router.post('/buystock/:ticker', (req, res, next) => {
  var ticker_symbol = req.params.ticker;
  for(var i = 0; i< req.session.stocks.length;i++){
    if(req.session.stocks[i][0]==ticker_symbol){
        var stock_name = req.session.stocks[i][1];
  const {purchase_price} = req.body;
  const stock_qty = parseInt(req.body.stock_qty);
  var credit = req.session.user.credit - (purchase_price*stock_qty);
  if(credit>0){
  const id = req.session.user._id;
  request.post('http://localhost:8000/users/buystock1',
    { form: { id: id, ticker_symbol:ticker_symbol,stock_name:stock_name,stock_qty:stock_qty, purchase_price:purchase_price, credit:credit}, },
        function (e, r, body) {
          var body1 = JSON.parse(body);
          if(body1.update){
              req.flash(
                  'success_msg',
                  'The stock has been purchased'
                );
              console.log(body1.model);
              req.session.user = body1.model;
              res.redirect('/dashboard');
          } else{
              res.render('buystock');
          }
  });
  } else{
    req.flash('error_msg', 'Not enough credits');
    res.redirect('/dashboard');
  }
    }
  }
});

//Sell Stocks
router.post('/sellstock/:ticker', (req, res, next) => {
  var ticker_symbol = req.params.ticker;
   for(var i = 0; i< req.session.stocks.length;i++){
    if(req.session.stocks[i][0]==ticker_symbol){
        var stock_name = req.session.stocks[i][1];
        const {purchase_price} = req.body;
        console.log(req.session.user.credit);
        const stock_qty = parseInt(req.body.stock_qty);
        var credit = req.session.user.credit + (purchase_price*stock_qty);
        const id = req.session.user._id;
        console.log(credit);
      request.post('http://localhost:8000/users/sellstock2',
        { form: { id: id, ticker_symbol:ticker_symbol,stock_name:stock_name,stock_qty:stock_qty, purchase_price:purchase_price, credit:credit}, },
        function (e, r, body) {
          var body1 = JSON.parse(body);
          if(body1.update){
              req.flash(
                  'success_msg',
                  'The stock has been sold'
                );
              console.log(body1.model);
              req.session.user = body1.model;
              res.redirect('/dashboard');
          } else{
            var error = body1.err;
              req.flash(
                  'error_msg',
                  body1.err
                );
              res.redirect('/dashboard');
          }
  });
    }
  }
});

//Buying stocks
router.post('/reccbuystock/:ticker', async(req, res, next) => {
  var ticker_symbol = req.params.ticker;
  for(var i = 0; i< req.session.stocks.length;i++){
    if(req.session.stocks[i][0]==ticker_symbol){
        var stock_name = req.session.stocks[i][1];
        const {purchase_price,hour,minutes} = req.body;
        const stock_qty = parseInt(req.body.stock_qty);
        var credit = req.session.user.credit - (purchase_price*stock_qty);
        if(credit>0){
        const id = req.session.user._id;
        try{
        let model = await request.post('http://localhost:8000/users/buyreccstock1',
        { form: { id: id, ticker_symbol:ticker_symbol,stock_name:stock_name,stock_qty:stock_qty, purchase_price:purchase_price, credit:credit, hour:hour, minutes:minutes}});
        req.flash('success_msg','The schedule has been set');
        res.redirect('/dashboard');
        console.log(model.body);
      } catch(err){
        req.flash('error_msg','The schedule could not be set');
        res.redirect('/dashboard');

      }
        req.flash('success_msg', 'The stock has been bought');
    }
  }
}
});

module.exports = router;
