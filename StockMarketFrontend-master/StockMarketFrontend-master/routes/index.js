const express = require('express');
const router = express.Router();
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');
var request = require('request');

// Welcome Page
router.get('/', forwardAuthenticated, (req, res) => res.render('welcome'));

// Dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
  var stocks ={};
  request.post('http://localhost:3000/users/stocks',
        function (e, r, body) {
          var body1 = JSON.parse(body);
          if(e){
             console.log(e);
              
          } else{
            stocks = body1.output;
            req.session.stocks = stocks;
            res.render('dashboard', {
              user: req.session.user,
              stocks: stocks
            });
          }
  });
});


router.get('/mystock', ensureAuthenticated, (req, res) =>
  res.render('mystock', {
    user: req.session.user,
    stock1: req.session.user.stock
  })
);

router.get('/mybankaccount', ensureAuthenticated, (req, res) => {
    res.render('mybankaccount', {
    user: req.session.user,
    bank: req.session.user.bank_acc
  	});

});
router.get('/user_profile', ensureAuthenticated, (req, res) =>{
  res.render('user_profile', {
    user: req.session.user
  });
});

router.get('/addcredit', ensureAuthenticated, (req, res) =>{
  res.render('addcredit', {
    user: req.session.user
  });
});

router.get('/removecredit', ensureAuthenticated, (req, res) =>{
  res.render('removecredit', {
    user: req.session.user
  });
});

router.get('/stockhist', ensureAuthenticated, (req, res) =>{
  res.render('stockhist', {
    user: req.session.user
  });
});

router.get('/wallet', ensureAuthenticated, (req, res) =>{
  res.render('wallet', {
    user: req.session.user
  });
});


router.get('/buystock/:i', ensureAuthenticated, (req, res) =>{
  var i = req.params.i;
  res.render('buystock', {
    user: req.session.user,
    stock: req.session.stocks[i],
    stocks: req.session.stocks,
    i : i
  });
});

router.get('/sellstock/:ticker_symbol', ensureAuthenticated, (req, res) =>{
  for(var i =0;i<req.session.stocks.length;i++){
    if(req.params.ticker_symbol == req.session.stocks[i][0]){
      res.render('sellstock', {
      user: req.session.user,
      stock: req.session.stocks[i],
      stocks: req.session.stocks,
  });
    }
  }
  
});

router.get('/recurrentbuying/:ticker_symbol', ensureAuthenticated, (req, res) =>{
  for(var i =0;i<req.session.stocks.length;i++){
    if(req.params.ticker_symbol == req.session.stocks[i][0]){
      res.render('recurrentbuying', {
      user: req.session.user,
      stock: req.session.stocks[i],
      stocks: req.session.stocks,
  });
    }
  }
  
});

router.get('/forgot_password', (req, res) =>{
  res.render('forgot_password');
});

router.get('/reset_password/:email', (req, res) =>{
  var email = req.params.email;
  res.render('reset_password', {
    email:email
  });
});
module.exports = router;
