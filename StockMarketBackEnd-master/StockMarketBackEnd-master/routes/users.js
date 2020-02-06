const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
var CronJob = require('cron').CronJob;
// Load User model
const User = require('../models/User');
const { forwardAuthenticated } = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register1', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register1', (req, res) => {
  const { name, email, password, password2,physical_address1,physical_address2,physical_address3,p_name } = req.body;
  console.log(name);
  let errors = [];

  if (!name || !email || !password || !password2 || !physical_address1 || !physical_address2 || !physical_address3 || !p_name) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length >= 1) {
    res.send({ user: 'no', error: errors});
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.send({ user: 'no', error: errors });
      } else {
        const newUser = new User({
          name,
          email,
          password,
          physical_address1,
          physical_address2,
          physical_address3,
          p_name
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                res.send({ user: 'yes' });
              })
              .catch(err => res.send(err));
          });
        });
      }
    });
  }
});

// Login

router.post('/login1', (req, res, next) => {
  passport.authenticate('local', function(err, user, info) {
    if (err) { 
      return res.send({login:false, error:err}); 
    }
    if (!user) { 
      return res.send({login:false}); 
    }
    req.logIn(user, function(err) {
      if (err) { 
        return res.send({login:false, error:err});
      }
      console.log(user);
      return res.send({login:true,user:user});
    });
  })(req, res, next);
  //   successRedirect: '/dashboard',
  //   failureRedirect: '/users/login',
  //   failureFlash: true
  // })(req, res, next);
});

router.post('/forgot_password', (req, res, next) => {
  const { email,p_name} = req.body;
  User.findOne(
    {email: email},
    function(err,model){
      if(err){
        res.send({user:false,err:err});
      } else{
        console.log(model);
        res.send({user:true, model:model});
      }
    });
});
router.post('/reset_password', (req, res, next) => {
  var { email,password} = req.body;

bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) throw err;
            password = hash;
            User.findOneAndUpdate(
              {email: email},{$set:{password:hash}},
              function(err,model){
                if(err){
                res.send({user:false,err:err});
                } else{
                res.send({user:true, model:model});
                }
              });
          });
        });

});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

router.post('/addbankaccount', (req, res, next) => {
  const { id,acc_num, routing_num} = req.body;
  User.findOneAndUpdate(
    {_id: id},
    {$push:{"bank_acc":{acc_num: acc_num, routing_num:routing_num}}},
    {new:true},
    function(err,model){
      if(err){
        res.send({update:false});
      } else{
        console.log(model);
        res.send({update:true, model:model});
      }
    });
});

router.post('/user_profile', (req, res, next) => {
  const { id,name, physical_address1, physical_address2, physical_address3} = req.body;
  console.log(physical_address1);
    User.findOneAndUpdate(
    {_id: id},
    {$set:{name:name, physical_address1:physical_address1, physical_address2:physical_address2, physical_address3:physical_address3}},
    {new:true},
    function(err,model){
      if(err){
        console.log(err);
        res.send({update:false});
      } else{
        console.log(model);
        res.send({update:true, model:model});
      }
    });
});


router.post('/addcredit', (req, res, next) => {
  const { id,credit} = req.body;
  User.findOneAndUpdate(
    {_id: id},
    {$set:{"credit": credit }},
    {new:true},
    function(err,model){
      if(err){
        res.send({update:false});
      } else{
        console.log(model);
        res.send({update:true, model:model});
      }
    });
});

router.post('/removecredit', (req, res, next) => {
  const { id,credit} = req.body;
  User.findOneAndUpdate(
    {_id: id},
    {$set:{"credit": credit }},
    {new:true},
    function(err,model){
      if(err){
        res.send({update:false});
      } else{
        console.log(model);
        res.send({update:true, model:model});
      }
    });
});

router.post('/buystock', (req, res, next) => {
  const { id,ticker_symbol, stock_name, stock_qty, purchase_price, credit} = req.body;
  var purchase_date= new Date(Date.now());
  User.findOneAndUpdate(
    {_id: id},
    {$push:{"stock":{ticker_symbol: ticker_symbol, stock_name:stock_name, stock_qty: stock_qty, purchase_price:purchase_price, purchase_date:purchase_date}},$set:{'credit':credit}},
    {upsert:true,new:true},
    function(err,model){
      if(err){
        console.log(err);
        res.send({update:false, err:err});
      } else{
        console.log(model);
        //res.send({update:true, model:model});
        // User.findOneAndUpdate(
        //   {_id: id},
        //   {$set:{"credit": credit }},
        //   {new:true},
        //   function(err,model){
        //       if(err){
        //         res.send({update:false});
        //       } else{
        //         console.log(model);
        //         res.send({update:true, model:model});
        //       }
        //  });
        res.send({update:true,model:model});
      }
    });
});

router.post('/buystock1', (req, res, next) => {
  const { id,ticker_symbol, stock_name, stock_qty, purchase_price, credit} = req.body;
  var purchase_date= new Date(Date.now());
  console.log(ticker_symbol);
      User.findOneAndUpdate(
        {_id:id, 'stock.ticker_symbol': ticker_symbol},
        {$inc: {'stock.$.stock_qty': stock_qty},$set: {'credit':credit}},
        {new:true}, function(err,model){
          if(!model){
            console.log("HERE IN UPDATE");
             User.findOneAndUpdate(
              {_id: id},
              {$push:{"stock":{ticker_symbol: ticker_symbol, stock_name:stock_name, stock_qty: stock_qty, purchase_price:purchase_price, purchase_date:purchase_date}},$set:{credit:credit}},
              {upsert:true,new:true},
              function(err,model){
                if(err){
                  console.log(err);
                  res.send({update:false, err:err});
                } else{
                    console.log(model);
                    res.send({update:true, model:model});
                }
                }); 
          } else{
            console.log("here in else of first update");
              res.send({update:true, model:model});
          }
        });
});

router.post('/sellstock1', (req, res, next) => {
  const { id,ticker_symbol, stock_name, stock_qty, purchase_price, credit} = req.body;
  console.log(credit);
  var purchase_date= new Date(Date.now());
  User.findOne({_id:id}, function(err,model){
      User.findOneAndUpdate(
        {_id:id, 'stock.ticker_symbol': ticker_symbol},
        {"$inc": {'stock.$.stock_qty': -stock_qty},"$set":{'stock.$.selling_price': purchase_price,'credit':credit}},
        {new:true}, function(err,model){
          if(err){
             res.send({update:false,err:err});
          } else{
              res.send({update:true, model:model});
            }
        });
  });
});

router.post('/sellstock2', async (req, res, next) => {
  const { id,ticker_symbol, stock_name, stock_qty, purchase_price, credit} = req.body;
  console.log(credit);
  var purchase_date= new Date(Date.now());
  try{
     let model = await User.findOneAndUpdate(
        {_id:id, 'stock.ticker_symbol': ticker_symbol},
        {"$inc": {'stock.$.stock_qty': -stock_qty},"$set":{'stock.$.selling_price': purchase_price,'credit':credit}},
        {new:true});
     console.log("Processing");
     if(!model){
      res.send({update:false, err:"Stock Not found"});
     } else{

      console.log("Processed");
      for(var i=0;i<model.stock.length;i++){
        // if(model.stock[i].stock_qty<0){
        //   res.send({update:false, err:"Not enough stocks to sell"});
        // }
        // else 
          if(model.stock[i].stock_qty==0){
          User.findOneAndUpdate( {'stock._id' : model.stock[i]._id} ,
          {$pull: { stock: { _id: model.stock[i]._id }}},
          {new: true},
          function(err, model){
            if(err){
              res.send({update:false, err:"Stock Not found"});
            } else{
              console.log(model);
              res.send({update: true, model:model});
            }
          });
        }
      }
      console.log(model);
      res.send({update:true, model:model});
     }
   } catch(err){
    res.send({update: false, err:err});
   }
});

//Recurring sell
router.post('/reccsellstock1', (req, res, next) => {
  // const { id,ticker_symbol, stock_name, stock_qty, purchase_price, credit, hour,minute} = req.body;
  const{hour,minute} = req.body;
  console.log(hour);
  var selling_date= new Date(Date.now());
  const job = new CronJob('*/'+minute+'*/'+hour+'* * *', function(){
    User.findOneAndUpdate(
        {_id:id, 'stock.ticker_symbol': ticker_symbol},
        {"$inc": {'stock.$.stock_qty': -stock_qty},"$set":{'stock.$.selling_price': purchase_price,'credit':credit}},
        {new:true}, function(err,model){
          if(err){
             res.send({update:false,err:err});
          } else{
              console.log("Recurring sell completed");
              res.send({update:true, model:model});
            }
        });
  });
  job.start();
      
});

router.post('/buyreccstock1', (req, res, next) => {
  const { id,ticker_symbol, stock_name, stock_qty, purchase_price, credit,hour,minutes} = req.body;
  var purchase_date= new Date(Date.now());
  var schedule_time = hour+minutes;
  const job = new CronJob(minutes+' '+hour+' * * *', function(){
      User.findOneAndUpdate(
        {_id:id, 'stock.ticker_symbol': ticker_symbol},
        {$inc: {'stock.$.stock_qty': stock_qty},
        $set: {'credit':credit},
        $push:{'schedule':{stock_name:stock_name,stock_qty:stock_qty,purchase_price:purchase_price,schedule_time:schedule_time}}},
        {new:true}, function(err,model){
          if(!model){
             User.findOneAndUpdate(
              {_id: id},
              {$push:{"stock":{ticker_symbol: ticker_symbol, stock_name:stock_name, stock_qty: stock_qty, purchase_price:purchase_price, purchase_date:purchase_date},'schedule':{stock_name:stock_name,stock_qty:stock_qty,purchase_price:purchase_price,schedule_time:schedule_time}},
              $set:{credit:credit}},
              {upsert:true,new:true},
              function(err,model){
                if(err){
                  console.log(err);
                  res.send({update:false});
                } else{
                    console.log(model);
                    res.send({model:model});
                }
                }); 
          } else{
            console.log("here in else of first update");
              res.send({model:model});
          }
        });
    });
    job.start();
});

router.post('/find', (req, res, next) => {
  const { email} = req.body;
    User.findOne(
    {email: email},
    function(err,model){
      if(err){
        res.send({update:false});
      } else{
        console.log(model);
        res.send({update:true, model:model});
      }
    });
});


module.exports = router;
