/**
 * Created by Ada on 2016/11/9.
 * 非validate相关的函数
 */
'use strict'
/*require("babel-polyfill");
require("babel-core/register")*/

let miscError=require('../../constant/error/assistError').misc

// let gmError=require('../define/error/nodeError').nodeError.assistError.gmImage
let regex=require('../../constant/regex/regex').regex

let e_randomStringType=require('../../constant/enum/node').RandomStringType
let e_timeUnit=require('../../constant/enum/node').TimeUnit
let intervalCheck=require('../../constant/config/globalConfiguration').intervalCheck
let LuaSHA=require('../../constant/define/LuaSHA').LuaSHA

let e_userStateEnum=require('../../constant/enum/node').UserState

// let redisError=require('../define/error/redisError').redisError
// let ioredisClient=require('../model/redis/connection/redis_connection').ioredisClient

// let intervalCheck=require('../config/global/globalSettingRule').defaultSetting.intervalCheck

// let mongooseErrorHandler=require('../define/error/mongoError').mongooseErrorHandler
let execSHALua=require("../../model/redis/operation/redis_common_operation").execSHALua

let appSetting=require('../../constant/config/appSetting').currentAppSetting
let currentEnv=require('../../constant/config/appSetting').currentEnv
let e_env=require('../../constant/enum/node').Env

const checkInterval_async=async function(req){
    //return new Promise(function(resolve,reject){

    let identify


    if(req.session && req.session.id){
        if(!regex.sessionId.test(req.session.id)){
            return Promise.reject(miscError.sessionIdWrong)
        }
        identify=req.session.id
    }else{
        if(true===appSetting['trust_proxy']){
            //req.ip和req.ips，只有在设置了trust proxy之后才能生效，否则一直是undefined
            if(req.ips && req.ips[0]){
                identify= req.ips[0]
            }
        }else{
            identify=req.connection.remoteAddress
        }

        if (identify && identify.substr(0, 7) === "::ffff:") {
            identify = identify.substr(7)
            if(!regex.ip.test(identify)){
                return Promise.reject(miscError.IPWrong)
            }
        }

    }


    if(undefined===identify){
        return Promise.reject(miscError.unknownRequestIdentify)
        //return cb(null,)
    }


    //console.log(`trust proxy false ${identify}`)


    let params={}
    params.setting=intervalCheck
    params.currentTime=new Date().getTime()
    params.id=identify

    let result=await execSHALua(LuaSHA.Lua_check_interval,params)
    //console.log(result.rc)
    //result=JSON.parse(result)
    switch (result['rc']) {
        case 0:
            return Promise.resolve(result)
        case 10:
            let rc = {}
            rc['rc'] = miscError.tooMuchReq.rc
            rc['msg'] = `${miscError.forbiddenReq.msg.client}，请在${result['msg']}秒后重试`
            //console.log(rc)
            return  Promise.reject(rc)
        case 11:
            //console.log(intervalCheckBaseIPNodeError.between2ReqCheckFail)
            return  Promise.reject(miscError.between2ReqCheckFail)
            break;
        case 12:
            //console.log(intervalCheckBaseIPNodeError.exceedMaxTimesInDuration)
            return Promise.reject(miscError.exceedMaxTimesInDuration)
            break;
        default:

    }
    return Promise.resolve({rc:0})
}

//len:产生字符串的长度
//type: basic(0-9A-Z)；normal(0-9A-Za-z); complicated(normal+特殊字符)
function generateRandomString(len=4,type=e_randomStringType.normal){
    /*    if(undefined===len || false===dataTypeCheck.isInt(len)){
     len=4
     }*/
    /*    strict= strict ? true:false
     let validString='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
     let result=''
     if(true===strict){validString+=`${validString}!@#$%^&*()+={}[]|\?/><`}*/
    let validString
    let basicString='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    switch (type){
        case e_randomStringType.basic:
            validString=basicString
            break;
        case e_randomStringType.normal:
            validString=`${basicString}abcdefghijklmnopqrstuvwxyz`
            break;
        case e_randomStringType.complicated:
            validString=basicString+'abcdefghijklmnopqrstuvwxyz'+"`"+`!@#%&)(_=}{:"><,;'[]\^$*+|?.-`
            break;
        default:
            return miscError.unknownRandomStringType
    }
    //console.log(validString)
    let validStringLen=validString.length
    let result='';
    for(let i=0;i<len;i++){
        result+=validString.substr(parseInt(Math.random()*validStringLen,10),1);
    }

    return result
}

//计算当天剩下的时间
let restTimeInDay=function(timeUnit=e_timeUnit.SEC){
    let day=new Date().toLocaleDateString()
    let endTime='23:59:59'
    //毫秒
    //let ttlTime=parseInt(new Date(`${day} ${endTime}`).getTime())-parseInt(new Date().getTime())
    let ttlTime=new Date(`${day} ${endTime}`).getTime()-new Date().getTime()

    switch (timeUnit){
        case e_timeUnit.MS:
            return ttlTime
        case e_timeUnit.SEC:
            return Math.round(ttlTime/1000)
        case e_timeUnit.MIN:
            return Math.round(ttlTime/60000)
        case e_timeUnit.HOUR:
            return Math.round(ttlTime/3600000)
        default:
            return miscError.unknownTimeUnit
    }
    // return ttlTime
}


//获得当前用户的信息，以便在toolbar上显示对应的信息
let getUserInfo=function(req){
    return req.session.userName
    /*    let result
     if(req.session.state===e_userStateEnum.login){
     result=req.session.userName
     //result.userId=req.session.userId
     }
     //console.log(result)
     return result*/
}





/*          检查当前用户状态是否和期望的一致            */
const checkUserState=function(req, exceptState){
/*
* 一旦在app中启用了express-session，则在server端，req.session就一直存在，其中内容为cookie的设置参数（但是没有写入redis）；
* 只有当通过诸如req.session.userId=objectId的语句，才会将cookies和userId写入到redis，如此，就可以根据client传入的sessionId，查找redis中对应的记录（cookie设置+程序存储的值）
* 1. 一旦用户运行过某些正常的页面（某些API是用户正常打开页面时会调用，例如，createUser/login），则在session中设置对应的 lastPage，
* 2. 而有些rest API是client 自动调用的（例如，uniqueCheck），此时需要检测是否有lastPage，且lastpage为调用此API的页面，没有或者不是，说明不是浏览器发出的操作，而可能是黑客的操作
* 3. 一旦用户登录，直接设置userId
* */
//console.log(`req.session ${JSON.stringify(req.session)}`)
    let currentUserState
    if(undefined===req.session.userId){
        currentUserState=e_userStateEnum.NOT_LOGIN
/*    } else if(undefined===req.session.userId){
        //已经在get方法中获得sess
        currentUserState=e_userStateEnum.NOT_LOGIN*/
    }else{
        currentUserState=e_userStateEnum.LOGIN
    }
// console.log(`exceptState ${JSON.stringify(exceptState)}`)
//     console.log(`currentUserState ${JSON.stringify(currentUserState)}`)
    //和期望的相等，直接返回
    if(exceptState===currentUserState){
        return {rc:0}
    }
    //如果不等，则当前userState要比希望的更高（才能执行操作）
    //NO_LESS无需检测（最低级，不等于直接报错）；LOGIN（最高级，必须等于，否则报错；NOT_LOGIN才需要检测，是否当前state为LOGIN
    switch (exceptState){
        case e_userStateEnum.NOT_LOGIN:
            if(e_userStateEnum.LOGIN===currentUserState){
                return {rc:0}
            }
            break;
        case e_userStateEnum.LOGIN:
            if(exceptState!==currentUserState){
                return {rc:0}
            }
            break;
    }

    return miscError.notExpectedUserState

}

let encodeHtml = function(s){
    if(undefined===s){return "";}
    if('string'!== typeof s){s= s.toString();};
    if(0=== s.length){return "";};
    let returnHtml='';

    return s.replace(regex.encodeHtmlChar,function(char){
        let c=char.charCodeAt(0),r='&#';
        c=(32===c) ? 160 : c;
        return r+c+';';
    })

};


const ifUserLogin=function(req){
    return undefined!==req.session.userId
}



//1. 搜索字符串中的+转换成空格
//2. 截取规定的字符数量
let convertURLSearchString=function(searchString,cb){
    let tmpStr=searchString.split('+');
    //console.log(tmpStr)
    CRUDGlobalSetting.getSingleSetting('search','totalKeyLen',function(err,totalLen){
        if(0<totalLen.rc){
            return cb(null,totalLen)
        }
        let strNum=tmpStr.length
        let curStrLen=0;//计算当前处理的字符长度
        let curStr='';//转换后的搜索字符串（使用空格分隔）
        for(let i=0;i<strNum;i++){
            //第一个key就超长，直接截取20个字符
            if(0===i && tmpStr[0].length>totalLen){
                curStr=tmpStr[0].substring(0,totalLen)
                return cb(null,{rc:0,msg:curStr.trim()})
            }
            //如果当前已经处理的字符串+下一个要处理的字符串的长度超出，返回当前已经处理的字符串，舍弃之后的字符串
            //-i:忽略空格的长度
            if(curStr.length+tmpStr[i].length-i>totalLen){
                return cb(null,{rc:0,msg:curStr.trim()})
            }
            curStr+=tmpStr[i]
            curStr+=' ';

        }
        return cb(null,{rc:0,msg:curStr.trim()})
    })
}

//如果字符中有正则中用到的特殊字符，跳脱（防止此字符被用在正则中时，其中的特殊字符被reg处理）
function escapeRegSpecialChar(str){
    let reg=regex.regSpecialChar
    //设置\\，实际打印为\，使用时会自动转义
    return str.replace(reg,'\\$1')
}

/*      开发的时候，打印的trace      */
//prompt: 提示文字
//info：需要打印的trace
//level：根据不同的trace level决定是否打印
function consoleDebug(prompt,info,level){
    console.log(`${prompt} ${JSON.stringify(info)}`)
}

//将server返回的rc格式化成client能接受的格式
//server可能是{rc:xxxx,msg:{client:'yyy',server:'zzz'}======>client  {rc:xxx,msg:yyy}
function genFinalReturnResult(rc){
    //如果是实际上线，且同时有client和server2中msg，那么根据clientFlag选择返回那种msg
    if(e_env.PROD===currentEnv){
        if(rc.msg &&  rc.msg.server){
            let result={}
            result['rc']=rc['rc']
            result['msg']=rc.msg.client
            return result
        }
    }
    return rc

}

function objectDeepCopy(sourceObj){
    return JSON.parse(JSON.stringify(sourceObj))
}
module.exports={
    checkInterval_async,
    generateRandomString,
    restTimeInDay,


    getUserInfo,
    checkUserState,
    ifUserLogin,

    encodeHtml,


    // formatRc,
    consoleDebug,

    convertURLSearchString,
    escapeRegSpecialChar,
    genFinalReturnResult,

    objectDeepCopy,
}
