var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/stocks',(req,res,next) =>{
    console.log("----------here------------")
    // const {current_date} = req.body;
    var current_date = new Date();
    const fs = require('fs');
    let rawdata_today = fs.readFileSync('static/stockdata_today.json');
    let stockObj_today = JSON.parse(rawdata_today);
    // console.log(stockObj_today);
    console.log(current_date);
    output = [];
    for(var x in stockObj_today)
    {
        stock = [];
        
        stock.push(x);
        stock.push(stockObj_today[x]["stock_name"]);
        var hours = current_date.getHours();
        var min = current_date.getMinutes();
        var min1 = parseInt(min);
        var hours1 = parseInt(hours);
        if(min1<=9){
                min = "0"+min;
            }
            if(hours1 <= 9){
                hours = "0"+hours;
            }
        for(var y in stockObj_today[x]["stock_price"]){
            
            var time = hours+":"+min;
            if(y == time)
            {
                stock.push(stockObj_today[x]["stock_price"][y]);
            }
        }

        output.push(stock);
    }
    console.log(output);
    res.send({output: output});
});
router.post('/stockhistory', (req, res, next) => {
  const { ticker_symbol, time_period} = req.body;
  var data = [];
  var labels = [];

  const fs = require('fs');
  console.log(ticker_symbol);
  console.log(time_period);
let rawdata = fs.readFileSync('static/stockdata.json');
let stockObj = JSON.parse(rawdata);
// console.log(stockObj);

let rawdata_today = fs.readFileSync('static/stockdata_today.json');
let stockObj_today = JSON.parse(rawdata_today);
console.log(stockObj_today);
  var currentDate = new Date();
            console.log(currentDate);
            if(time_period == "Today"){
                for(var key in stockObj_today)
                {
                    if (stockObj.hasOwnProperty(key) && ticker_symbol == key)
                    {
                        var curr_h = currentDate.getHours() 
                        var curr_m = currentDate.getMinutes();
                        for(var x in stockObj_today[key]["stock_price"])
                        {
                            var h = x.split(":")[0];
                            var m = x.split(":")[1];
                            if(h == curr_h && m == curr_m)
                            {

                            }
                            else
                            {
                                labels.push(x+" "+currentDate);
                                data.push(stockObj[key]["stock_price"][x]);
                            }
                        }
                    }
                }
            }
            else
            {
                for (var key in stockObj)
            {
                if (stockObj.hasOwnProperty(key) && ticker_symbol == key){
                    if(time_period == "Past 5 Years")
                    {
                        for (var x in stockObj[key])
                        {
                            for (var y in stockObj[key][x])
                            {
                                labels.push(x+" "+y);
                                data.push(stockObj[key][x][y]);
                            }
                        }
                    }
                   
                    else if(time_period == "This Year")
                    {
                        var year = currentDate.getFullYear();
                        for (var x in stockObj[key])
                        {
                            var x_year = x.split("/")[2];
                            console.log(x_year);
                            if (year == x_year)
                            {
                                for (var y in stockObj[key][x])
                                {
                                    labels.push(x+" "+y);
                                    data.push(stockObj[key][x][y]);
                                }
                            }
                        }
                    }
                    
                    else if(time_period == "This Month")
                    {
                        var year = currentDate.getFullYear();
                        var month = currentDate.getMonth() + 1;
                        console.log(month);
                        for (var x in stockObj[key])
                        {
                            var x_year = x.split("/")[2];
                            var x_month = x.split("/")[0];
                            
                            if (year == x_year && month == x_month)
                            {
                                console.log(x_year);
                                console.log(x_month);
                                for (var y in stockObj[key][x])
                                {
                                    labels.push(x+" "+y);
                                    data.push(stockObj[key][x][y]);
                                }
                            }
                        }
                    }
                   
                    else if(time_period == "Last Week")
                    {
                        console.log("last week");
                        week_before = new Date();
                        week_before.setDate(currentDate.getDate()-7);
                        console.log(week_before);
                        start_week_before = new Date();
                        var day = week_before.getDay();
                        if(day == 0){day = 7;}
                        start_week_before.setDate(week_before.getDate()- day + 1);
                        console.log(start_week_before);
                        for (var i=0; i<5; i++)
                        {
                            var m = start_week_before.getMonth();
                            var y = start_week_before.getFullYear();
                            var d = start_week_before.getDate();
                            var formattedDate = m+"/"+d+"/"+y;
                            console.log(formattedDate);
                            for (var y in stockObj[key][formattedDate])
                            {
                                    labels.push(formattedDate+" "+y);
                                    data.push(stockObj[key][formattedDate][y]);
                            }
                            start_week_before.setDate(start_week_before.getDate() + 1);
                        }

                    }
                    
                    else if(time_period == "This Week")
                    {
                        this_week = new Date();
                        console.log(this_week);
                        start_this_week = new Date();
                        var day = this_week.getDay();
                        if(day == 0){day = 7;}
                        start_this_week.setDate(this_week.getDate()- day + 1);
                        var iter = start_this_week.getDay() - this_week.getDay() + 1;
                        console.log(start_this_week.getDay() - this_week.getDay());
                        for (var i=0; i<iter; i++)
                        {
                            var m = start_this_week.getMonth();
                            var y = start_this_week.getFullYear();
                            var d = start_this_week.getDate();
                            var formattedDate = m+"/"+d+"/"+y;
                            console.log(formattedDate);
                            for (var y in stockObj[key][formattedDate])
                            {
                                    labels.push(formattedDate+" "+y);
                                    data.push(stockObj[key][formattedDate][y]);
                            }
                            start_this_week.setDate(start_this_week.getDate() + 1);
                        }
                    }               
                    
                }
            }
            }
            
            console.log(data);
            console.log(labels);

  res.send({data: data, labels: labels});
});

module.exports = router;