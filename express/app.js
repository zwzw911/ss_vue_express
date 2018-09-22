'use strict'
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const ap=require('awesomeprint')
const appSetting=require('./server_common_file_require').appSetting
const e_env=require('./server_common_file_require').nodeEnum.Env
// const index = require('./routes/index');
// var users = require('./routes/users');
// ap.inf('app in ')
const app = express();

const e_intervalCheckPrefix=require('./server_common_file_require').nodeEnum.IntervalCheckPrefix
// view engine setup
/*app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');*/

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

app.use(logger('dev'));
app.use(bodyParser.json());
// ap.inf('bodyParser.json() done')
app.use(bodyParser.urlencoded({ extended: false }));
// ap.inf('bodyParser.urlencoded done')
app.use(cookieParser());
app.set('trust proxy',appSetting['trust_proxy'])
// app.use(express.static(path.join(__dirname, 'public')));

// app.set('views', path.join(__dirname, 'server/views'));
// app.set('view engine', 'ejs');

const server_common_file_require=require('./server_common_file_require')
// const e_env=server_common_file_require.mongoEnum.Env
// const currentEnv=server_common_file_require.appSetting.currentEnv

// console.log(`=============app in=======`)
const session=server_common_file_require.session
// session.setSessionDurationInMinute(480) //session duration is 8hours
// let op=
app.use(session.generateSessionStore({durationInMinute:480}))

//只有在生产环境，才需要强制设置session，然后进行interval check
// if(appSetting.currentEnv===e_env.PROD){
    app.use(function(req, res, next) {
        server_common_file_require.controllerHelper.setSessionByServer_async({req}).then(function(result){
            // ap.inf('method',req.route)
            //ap.inf('ap.use result',result)
            next();
        },function(err){
            ap.inf('ap.use err',err)
            return res.json(err)
        })
    });
// }


/*app.use(function(req, res, next) {
    // ap.inf('req.session',req.session)
    server_common_file_require.interval.getIntervalPrefix_async({req:req}).then(function(result){
        ap.inf('ap.use result',result)
        next();
    },function(err){
        ap.inf('ap.use err',err)
        return res.json(err)
    })

});*/
// await controllerHelper.checkInterval_async({req:req,reqTypePrefix:e_intervalCheckPrefix.CPATCHA})
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
const user=require('./server/controller/user/user_router').router
const article=require('./server/controller/article/article_router').router
const articleComment=require('./server/controller/article_comment/article_comment_router').router
const articleLikeDislike=require('./server/controller/articleLikeDislike/articleLikeDislike_router').router
const impeach=require('./server/controller/impeach/impeach_router').router
const impeach_action=require('./server/controller/impeach_action/impeach_action_router').router
const impeach_comment=require('./server/controller/impeach_comment/impeach_comment_router').router
const add_friend=require('./server/controller/add_friend_request/add_friend_router').router
const user_friend_group=require('./server/controller/user_friend_group/user_friend_group_router').router
const public_group=require('./server/controller/public_group/public_group_router').router
const join_public_group_request=require('./server/controller/join_public_group_request/join_public_group_request_router').router
const folder=require('./server/controller/folder/folder_router').router

app.use('/user', user);
app.use('/article', article);
app.use('/article_comment', articleComment);
app.use('/article_attachment', article);
app.use('/article_like_dislike', articleLikeDislike);
app.use('/impeach', impeach);
app.use('/impeach_action', impeach_action);
app.use('/impeach_comment', impeach_comment);
app.use('/add_friend_request', add_friend);
app.use('/user_friend_group', user_friend_group);
app.use('/public_group', public_group);
app.use('/join_public_group_request', join_public_group_request);
app.use('/folder',folder)

// app.use('/register/uniqueCheck', register);
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
