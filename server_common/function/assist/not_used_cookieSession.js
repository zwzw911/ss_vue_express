/**
 * Created by ada on 2017/07/06.
 *
 * 主要目的是:
 * 1. 输出scookieOption（除了作为session的cookie，还可以作为其他cookie的option）
 * 2. 输出session（其中包括sessionOption和实例化的store），供expressjs用作中间件
 * 3. 输出实例化的store，以便可以在redis中对相关的session做操作（创建/读取/删除等）
 *
 */


/*
* "{\"cookie\":{\"originalMaxAge\":1728000000,\"expires\":\"2017-08-09T07:01:45.856Z\",\"secure\":false,\"httpOnly\":true,\"domain\":\"127.0.0.1\",\"path\":\"/\",\"sameSite\":\"lax\"},
* \"userId\":\"597042d2996fe61464da1d5c\"}"
* */
'use strict'
// var mongooseConnect=require('../model/dbConnection').mongoose;
const expressSession=require('express-session');
const sessionStore=require('connect-redis')(expressSession);

let cookieOption={
    path:'/', //域名下所有URL都可以使用session
    domain:'127.0.0.1', //可以使用session的域名（可以是IP)
    maxAge:900000, // 整数，ms。默认15分钟
    secure:false, //只用https
    httpOnly:true, //通过http传递cookie
    sameSite:'lax', // strict/lax。 strict：在a.com中点击b.com的URL时，不会发送b.com的网页；lax：如果是GET操作，可以发送。
}

/*
 * session相关设置，包含cookie和session 2部分
 * 直接读取文件，而不用存入redis
 * */
let sessionOption={
    cookie:cookieOption,//ms, 900second

    secret:'suibian', //进行加密的字符
    resave:false, //即使session内容没有更改，都强制保存session内容到server。设为true，可能会导致竞争（用户开了2个窗口的话）
    rolling:false,//每次请求，都重置session的cookie选项（主要是expiration重设为maxAge）
    saveUninitialized:false, //强制保存新生成，但是尚未做过修改（即没有任何内容）的session保存到session store。设为false，可以减少对session store的占用。

}

/*          store option        */
let storeOption={
    redis:{
        ttl:900,// second,和cookie时间一致
        db:0,//redis的db index
        // prefix:'sess',//默认记录前缀，默认是'sess:'

    },
}


//只是设置cookie的duration
function setCookieDuration(timeInMinute){
    sessionOption.cookie.maxAge=timeInMinute*60*1000 //转换成second
}
function getCookieOption(){
    return cookieOption
}
//同时设置cookie和session（Redis）的duration
function setSessionDurationInMinute(timeInMinute){
    setCookieDuration(timeInMinute)
    storeOption.redis.ttl=timeInMinute*60 //转换成second
    // console.log(`storeOption ${JSON.stringify(storeOption)}`)
}
function getSessionOption(){
    // setCookieDuration(timeInMinute)
    // console.log(`storeOption ${JSON.stringify(storeOption)}`)
    return sessionOption
}

function getStore(){
    // console.log(`tore option is ${JSON.stringify(storeOption.redis)}`)
    //设置storeOption的副本，防止连续在2个以上app调用时，第一个app的connect-redis中，会执行delete options.prefix，造成第一个app中是prefix+sid,第二个变成sess：+sid（sess:是当prefix空的时候采用的默认值）
    let copyStoreOption=JSON.parse(JSON.stringify(storeOption))
    return new sessionStore(copyStoreOption.redis)
}


/*app.use(session({
    store: new RedisStore(options),
    secret: 'keyboard cat'
}));*/
function getSession(){
    // console.log(`======>in`)
    let finalOption
    let store=getStore()
    finalOption=Object.assign({},sessionOption)
    // console.log(`finalOption ${JSON.stringify(finalOption)}`)
    finalOption.store=store

    return expressSession(finalOption)
}

module.exports={
    setCookieDuration,
    getCookieOption,
    setSessionDurationInMinute,
    getSessionOption,
    getStore,
    getSession,

}
// const sessionOption=require('../../config/global/globalSettingRule').session

/*//maxAge:ms;  负数（-1）：临时cookie，关闭网页就删除cookie；0：立刻删除；正整数：多少毫秒后失效
// secure:false, cookie是否只能在https上传输。false，可在http上传
//path: URL必须符合才能使用cookie。例如，如果设置path为/test/,则URL必须为/test才能使用。设为/，所有URL均可使用。
//domain：域名，必须以.作为开头（或者直接就是IP？？），则所有以此设置为结尾的URL都可使用cookie。domian_path限定了访问cookie的路径
/!*为了简单起见，所有cookie的配置都放在文件中（require命令会把内容存入内存）*!/
var cookieOptions={path:'/',domain:sessionOption.domain,maxAge:sessionOption.maxAge,secure:false,httpOnly:true};
//secret:digest session id
// resave/rolling: when false, only when sesssion expire or session content changed, will save session to store/send cookie to cilent
//saveUninitialized: when false, if session id created but no any content, will not save session to store
var sessionOptions={secret:'suibian',resave:false,rolling:false,saveUninitialized:false};
var sessionStoreInst=new sessionStore({mongooseConnection:mongooseConnect.connection});*/

/*var sessionOptions=sessionOption.session    //session中除了cookie和store的其他option
var store=new sessionStore(sessionOption.storeOptions.redis)    //单独赋值，以便可以export。因为store可以在server侧做些操作
sessionOptions.cookie=sessionOption.cookie  //设置session中cookie相关属性（主要对client起作用）
sessionOptions.store=store   //设置session中store的相关属性（主要是server端）*/
/*var store=
sessionOptions.cookie=cookieOptions;
sessionOptions.store=sessionStoreInst;*/


/*var cookieSetDefault=function(){
    cookieOptions={path:'/',domain:'localhost',maxAge:900000,secure:false,httpOnly:true}
}

var setCookieMaxAge=function(duration){
    cookieOptions.maxAge=duration*1000;
}*/

/*exports.session=expressSession(sessionOptions);     //app.js中用作中间件
exports.store=store     //提供接口，以便执行store.touch等操作*/
// exports.cookieOptions=cookieOptions;
//exports.setCookie={cookieSetDefault:cookieSetDefault,setCookieMaxAge:setCookieMaxAge}