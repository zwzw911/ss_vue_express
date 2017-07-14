'use strict'
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// const index = require('./routes/index');
// var users = require('./routes/users');

const app = express();

// view engine setup
/*app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');*/

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


const e_env=require('./server/constant/enum/node').Env
const currentEnv=require('./server/constant/config/appSetting').currentEnv

/*const session=require('./server/function/assist/cookieSession')
session.setSessionDuration(28800) //session duration is 8hours
app.use(session.getSession())*/


/*const checkInterval_async=require('./server/function/assist/misc').checkInterval_async
/!*                      预处理                 *!/
app.use(function(req,res,next){
    /!*    console.log(req.ips)
     console.log(req.ip)*!/
    console.log('router use')
    if(e_env.DEV===currentEnv){
        console.log('dev, not check interval')
        next()
    }

    if(e_env.PROD===currentEnv) {
        console.log('production, check interval')
        next()
        /!*    console.log('production, check interval')


         //判断请求的是页面还是静态资源（css/js），还没有想好如何处理
         if (req.path) {
         console.log(`req.path is ${JSON.stringify(req.path)}`)
         let tmp = req.path.split('.')
         let suffix = tmp[tmp.length - 1]
         //console.log(suffix)
         switch (suffix) {
         case 'css':
         //不对静态资源的请求进行检测
         next()
         break;
         case 'js':
         //不对静态资源的请求进行检测
         next()
         break;
         case 'map':
         //不对静态资源的请求进行检测
         next()
         break;
         default:
         let result=await checkInterval(req)
         if(result.rc>0){
         return res.render('helper/reqReject', {
         title: '拒绝请求',
         content: result['msg'],
         year: new Date().getFullYear()
         });
         }
         }
         }*!/
    }

})*/


/*              require file                */
const register=require('./server/controller/user/register')


app.use('/register', register);
// app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;