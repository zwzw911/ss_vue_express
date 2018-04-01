/**
 * Created by Ada on 2016/11/9.
 * 非validate相关的函数
 */
'use strict'

const fs=require('fs')
const path=require('path')
const ap=require('awesomeprint')

const nodeMailer=require('nodemailer')
// const mailOption=require('../../constant/config/globalConfiguration').mailOption
const  redisOperation=require(`../../model/redis/operation/redis_common_operation`)

let miscError=require('../../constant/error/assistError').misc

// let gmError=require('../define/error/nodeError').nodeError.assistError.gmImage
let regex=require('../../constant/regex/regex').regex

let e_randomStringType=require('../../constant/enum/nodeEnum').RandomStringType
let e_timeUnit=require('../../constant/enum/nodeEnum').TimeUnit
// let intervalCheck=require('../../constant/config/globalConfiguration').intervalCheckConfiguration
// let LuaSHA=require('../../constant/genEnum/LuaSHA').luaScriptSHA

let e_userStateEnum=require('../../constant/enum/nodeEnum').UserState

// let redisError=require('../define/error/redisError').redisError
// let ioredisClient=require('../model/redis/connection/redis_connection').ioredisClient

// let intervalCheck=require('../config/global/globalSettingRule').defaultSetting.intervalCheck

// let mongooseErrorHandler=require('../define/error/mongoError').mongooseErrorHandler
// let execSHALua=require("../../model/redis/operation/redis_common_operation").execSHALua

let appSetting=require('../../constant/config/appSetting').currentAppSetting
const globalConfiguration=require('../../constant/config/globalConfiguration')

let currentEnv=require('../../constant/config/appSetting').currentEnv
let e_env=require('../../constant/enum/nodeEnum').Env

const e_sizeUnit=require('../../constant/enum/nodeRuntimeEnum').FileSizeUnit

/*const checkInterval_async=async function(req){
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
}*/

//len:产生字符串的长度
//type: basic(0-9A-Z)；normal(0-9A-Za-z); complicated(normal+特殊字符)
function generateRandomString(len=4,type=e_randomStringType.NORMAL){
    /*    if(undefined===len || false===dataTypeCheck.isInt(len)){
     len=4
     }*/
    /*    strict= strict ? true:false
     let validString='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
     let result=''
     if(true===strict){validString+=`${validString}!@#$%^&*()+={}[]|\?/><`}*/
    let validString
    let basicString='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    //console.log(`misc==>e_randomStringType is ${JSON.stringify(type)}`)
    switch (type){
        case e_randomStringType.BASIC:
            validString=basicString
            break;
        case e_randomStringType.NORMAL:
            validString=`${basicString}abcdefghijklmnopqrstuvwxyz`
            break;
        case e_randomStringType.COMPLICATED:
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
/*let getUserInfo=function(req){
    return req.session.userName
    /!*    let result
     if(req.session.state===e_userStateEnum.login){
     result=req.session.userName
     //result.userId=req.session.userId
     }
     //console.log(result)
     return result*!/
}*/





/*/!*          检查当前用户状态是否和期望的一致            *!/
const checkUserState=function(req, exceptState){
/!*
* 一旦在app中启用了express-session，则在server端，req.session就一直存在，其中内容为cookie的设置参数（但是没有写入redis）；
* 只有当通过诸如req.session.userId=objectId的语句，才会将cookies和userId写入到redis，如此，就可以根据client传入的sessionId，查找redis中对应的记录（cookie设置+程序存储的值）
* 1. 一旦用户运行过某些正常的页面（某些API是用户正常打开页面时会调用，例如，createUser/login），则在session中设置对应的 lastPage，
* 2. 而有些rest API是client 自动调用的（例如，uniqueCheck），此时需要检测是否有lastPage，且lastpage为调用此API的页面，没有或者不是，说明不是浏览器发出的操作，而可能是黑客的操作
* 3. 一旦用户登录，直接设置userId
* *!/
//console.log(`req.session ${JSON.stringify(req.session)}`)
    let currentUserState
    if(undefined===req.session.userId){
        currentUserState=e_userStateEnum.NOT_LOGIN
/!*    } else if(undefined===req.session.userId){
        //已经在get方法中获得sess
        currentUserState=e_userStateEnum.NOT_LOGIN*!/
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

}*/

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


/*const ifUserLogin=function(req){
    return undefined!==req.session.userId
}*/



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

/*/!*      开发的时候，打印的trace      *!/
//prompt: 提示文字
//info：需要打印的trace
//level：根据不同的trace level决定是否打印
function consoleDebug(prompt,info,level){
    console.log(`${prompt} ${JSON.stringify(info)}`)
}*/

//将server返回的rc格式化成client能接受的格式
//server可能是{rc:xxxx,msg:{client:'yyy',server:'zzz'}======>client  {rc:xxx,msg:yyy}
function genFinalReturnResult(rc){
    //如果是实际上线，且同时有client和server2中msg，那么根据clientFlag选择返回那种msg
    if(e_env.PROD===currentEnv){
        let result={}
        //普通rc
        if(rc.msg &&  rc.msg){
            if(rc.msg.server){
                result['rc']=rc['rc']
                result['msg']=rc.msg.client
                return result
            }else{
                return rc
            }
        }else {
            //检测inputValue的rc
            for(let singleField in rc){
                result[singleField]['rc']=rc[singleField]['rc']
                result[singleField]['msg']=rc[singleField].msg.client
            }
            return result
        }
    }
    return rc

}

function objectDeepCopy(sourceObj){
    if(undefined===sourceObj || null===sourceObj){
        return sourceObj
    }

    return JSON.parse(JSON.stringify(sourceObj))
}

/*  部分copy对象
* @expectedKey:需要copy的key
* */
function objectPartlyDeepCopy({sourceObj,expectedKey}){
    if(undefined===sourceObj || null===sourceObj){
        return sourceObj
    }

    let copyObject={}
    for(let singleKey of expectedKey){
        if(undefined!==sourceObj[singleKey]){
            copyObject[singleKey]=JSON.parse(JSON.stringify(sourceObj[singleKey]))
        }
    }
    return copyObject
}

function ifCaptchaValid(captchaValue,captchaValueType){
    let p
    switch (captchaValueType){
        case e_randomStringType.BASIC:
            p=regex.randomString.basic
            break;
        case e_randomStringType.NORMAL:
            p=regex.randomString.normal
            break;
        case e_randomStringType.COMPLICATED:
            p=regex.randomString.complicated
            break;
    }

    return p.test(captchaValue)
}

function sendVerificationCodeByEmail_async(message,mailOption){
    // console.log(`======in=============`)
    // console.log(`message ${JSON.stringify(message)}`)
    let transporter = nodeMailer.createTransport(mailOption.qq)
    //测试是否连接成功
    transporter.verify(function(error, success) {
        if (error) {
            console.log(error);
        } else {
            console.log('Server is ready to take our messages');
        }
    });


    return new Promise(function(resolve,reject){
        transporter.sendMail(message, function(error, info){
            if(error){
                console.log(error);
                return Promise.reject(miscError.sendMailError(error))

            }else{
                console.log('Message sent: ' + info.response);
                return Promise.resolve({rc:0,msg:'邮件已成功发送，请查收'})

            }
        });
    })

}
// sendVerificationCodeByEmail_async()
/*
 * @num: 原始文件的大小（数字部分）
 * @unit：原始文件的大小（单位，byte：空，KB：ki，MB：Mi，GB:Gi）
 * @newUnit；要转换成的单位
 * */
function convertFileSize({num,unit,newUnit}){
    if(0===num){
        return   {rc:0,msg:0}
    }
    // console.log(`unit ${unit}`)
    if(unit===newUnit){
        return   {rc:0,msg:num}
    }

    //首先转换成byte
    let originFileInByte
    if(undefined===unit){
        /*        if(undefined===newUnit){
         copnsole.log(`all byte in`)
         return   {rc:0,msg:num}
         }*/
        originFileInByte=num
    }else{
        switch(unit){
            case e_sizeUnit.KB:
                originFileInByte=Math.floor(num*1024)
                break;
            case e_sizeUnit.MB:
                originFileInByte=Math.floor(num*1024*1024)
                break;
            case e_sizeUnit.GB:
                originFileInByte=Math.floor(num*1024*1024*1024)
                break;
            default:
                return miscError.unknownUnit
        }
    }

    //从byte转换成指定的单位
    let convertedSize
    if(undefined===newUnit){
        return {rc:0,msg:originFileInByte}
    }else{
        switch(newUnit){
            case e_sizeUnit.KB:
                convertedSize=(originFileInByte/1024).toFixed(2)*1
                break;
            case e_sizeUnit.MB:
                convertedSize=(originFileInByte/1024/1024).toFixed(2)*1
                break;
            case e_sizeUnit.GB:
                convertedSize=(originFileInByte/1024/1024/1024).toFixed(2)*1
                break;
            default:
                return miscError.unknownUnit
        }
        return {rc:0,msg:convertedSize}
    }

}



/*
* 数组中的每个值作为key，值的类型作为value，赋给一个对象。如果已经存在，说明是重复
* */
function ifArrayHasDuplicate(array){
    let obj={} //key是array的元素，value是元素的类型
    for(let singleEle of array){
        //有key且类型一致，说明重复
        if(undefined!==obj[singleEle] && typeof singleEle===obj[singleEle]){
            return true
        }
        obj[singleEle]=typeof singleEle
    }
    return false
}

/*  childArray中的每个元素都包含在parentArray中
*
* */
function ifArrayContainArray({parentArray,childArray}){
    if(childArray.length===0 || parentArray.length===0){
        return false
    }
    for(let singleChildEle of childArray){
        if(-1===parentArray.indexOf(singleChildEle)){
            return false
        }
    }
    return true
}
// console.log(`${ifArrayHasDuplicate([1,'1'])}`)
// console.log(`${ifArrayHasDuplicate([1,1])}`)
// console.log(`${ifArrayContainArray({parentArray:['1','2'],childArray:['1']})}`)
// console.log(`${ifArrayContainArray({parentArray:['1','2'],childArray:['3']})}`)

/*   递归 读取指定目录下文件的 绝对路径
* @fileOrDirPath：要读取的文件或者目录的绝对路径
* @skipFilesArray： 需要排除的文件名（非绝对路径）
* @skipDirArray: 需要排除的目录名（非绝对路径）
* @absFilesPathResult：保存读取到文件路径的变量，数组
* */
function  recursiveReadFileAbsPath({fileOrDirPath,skipFilesArray,skipDirArray,absFilesPathResult}){
// ap.inf('recursiveReadFileAbsPath in')
//     ap.inf('fileOrDirPath',fileOrDirPath)
    let isRulePathDir=fs.lstatSync(fileOrDirPath).isDirectory()
    let isRulePathFile=fs.lstatSync(fileOrDirPath).isFile()
    // ap.inf('isRulePathDir',isRulePathDir)
    if(true===isRulePathDir){
        let dirContent=fs.readdirSync(fileOrDirPath)
        for(let singleFileDir of dirContent){
            let tmpFileDir=`${fileOrDirPath}${singleFileDir}`
            let isDir=fs.lstatSync(tmpFileDir).isDirectory()
            let isFile=fs.lstatSync(tmpFileDir).isFile()

            if(true===isDir){
                tmpFileDir+='/'
                // ap.inf('before no skip dir')
                if(undefined!==skipDirArray && skipDirArray.length>0 ){
                    if( -1!==skipDirArray.indexOf(path.basename(tmpFileDir))){
                        continue
                    }
                }
                // ap.inf('no skip dir')
                recursiveReadFileAbsPath({fileOrDirPath:tmpFileDir,skipFilesArray:skipFilesArray,skipDirArray:skipDirArray,absFilesPathResult:absFilesPathResult})
            }
            //读取到coll文件中module.exports中的内容（以便require）
            if(true===isFile){
                //定义了skipFilesArray，且文件在里面，继续
                // ap.inf('skipFilesArray',skipFilesArray)
                if(undefined!==skipFilesArray && skipFilesArray.length>0 ){
                    if( -1!==skipFilesArray.indexOf(path.basename(tmpFileDir))){
                        // ap.inf('skipFilesArra in',tmpFileDir)
                        continue
                    }
                }
                absFilesPathResult.push(tmpFileDir)
            }
        }
    }
    if(true===isRulePathFile){
        if(undefined!==skipFilesArray && skipFilesArray.length>0 ){
            if(-1!==skipFilesArray.indexOf(path.basename(fileOrDirPath))){
                absFilesPathResult.push(fileOrDirPath)
            }
        }else{
            //无需检测是否需要skip，所以直接push
            absFilesPathResult.push(fileOrDirPath)
        }
    }
}

/*  读取文件内容并返回export的内容
* @absFilePath：rule文件绝对路径
* @specificItem: 数组。指定文件中部分需要export的内容
* */
function readFileExportItem({absFilePath,specificItem}){
    let exportResult={}
    // ap.inf('absFilePath',absFilePath)

    // 读取文件中export的内容
    let pattern=regex.moduleExportsNew
    // ap.print('tmpFileDir',tmpFileDir)
    let fileContent=fs.readFileSync(`${absFilePath}`,'utf8')
    fileContent=deleteCommentSpaceReturn({string:fileContent})
    // ap.print('fileContent',fileContent)
    // ap.print('absFilePath',absFilePath)
    let matchResult=fileContent.match(pattern)
    // ap.print('matchResult',matchResult)
    if(null===matchResult){
        ap.err(`not find module.exports content`)
    }
    // ap.print('matchResult[1]',matchResult[1])
    let allExportsInFile=matchResult[1].split(',')
    // ap.print('specificItem',specificItem)

    for(let singleExportsItem of allExportsInFile){
        if(''!==singleExportsItem){
            let ruleDefineContent
            if(undefined!==specificItem){
                if(-1!==specificItem.indexOf(singleExportsItem)){
                    // ap.wrn('allow item',singleExportsItem)
                    ruleDefineContent=require(`${absFilePath}`)[singleExportsItem]
                    exportResult[singleExportsItem]=ruleDefineContent  //重复，防止未定义的item也被当作undefined加入到exportResult
                }
            }else{
                // ap.inf('singleExportsItem',singleExportsItem)
                ruleDefineContent=require(`${absFilePath}`)[singleExportsItem]
                exportResult[singleExportsItem]=ruleDefineContent
            }
        }
    }
    return exportResult
}

//字符中，如果包含了正则（iview是patter），需要进行格式化（去除双引号）
function sanityClientPatternInString({string}){
    return string.replace(regex.clientRemoveDoubleQuotes, '$1/$3/,"').replace(regex.removeDoubleSlash,'\\')
}

//删除字符中注释，空白和换行
function deleteCommentSpaceReturn({string}){
    //单行注释；空白；换行符；多行注释
    return string.replace(/\/\/.*\r?\n/g,'').replace(/\s+/g,'').replace(/(\r?\n)*/g,'').replace(/(\/\*+).*?(\*+\/)/g,'')
}

function recursiveRequireAllFileInDir(filesArray,absoluteDestFilePath) {
    /*    let filesArray=[]
        recursiveReadFileIntoArray(absoluteRequireDir,filesArray,skipFilesArray)*/

    let description=`/*    gene by ${__filename}     */ \r\n \r\n`
    let indent=`\ \ \ \ `
    let useStrict=`"use strict"\r\n`
    let convertedEnum=`${description}${useStrict}\r\n`
    let exp=`\r\nmodule.exports={\r\n`
    if(filesArray.length>0){
        for(let singleFilePath of filesArray){
            // console.log(   `singleFilePath:${singleFilePath}`)
            let baseName=path.basename(singleFilePath).split('.')[0] //不包含扩展名的文件名
            // console.log(   `baseName:${baseName}`)
            convertedEnum+=`const ${baseName}=require('${singleFilePath}')\r\n`
            exp+=`${indent}${baseName},\r\n`
        }
    }
    exp+=`}`
    let finalContent=`${convertedEnum}${exp}`
    fs.writeFileSync(absoluteDestFilePath,`${finalContent}`)

}



async function getSessionId_async({req}){
    let tmpSessionId
    // ap.inf('getSessionId_async start')
    if(undefined===req.session || undefined===req.session.id){
        return Promise.reject(miscError.sessionIdNotExist)
    }else{
        tmpSessionId=req.session.id
        if(false===regex.sessionId.test(tmpSessionId)){
            return Promise.reject(miscError.sessionIdFormatWrong)
        }
        return Promise.resolve(tmpSessionId)
    }
}

async function getIP_async({req}){
    let tmpIP
    if(true===appSetting.trust_proxy){
        if(undefined===req.ips || undefined===req.ips[0]){
            return Promise.reject(miscError.IPNotExist)
        }
        tmpIP=req.ips[0]

        // prefix=`${req.ips[0]}.${reqTypePrefix}`
    }
    if(false===appSetting.trust_proxy){
        if(undefined===req.connection.remoteAddress){
            return Promise.reject(miscError.IPNotExist)
        }
        tmpIP=req.connection.remoteAddress
        // prefix=`${req.connection.remoteAddress}.${reqTypePrefix}`
    }

    if (tmpIP && tmpIP.substr(0, 7) === "::ffff:") {
        tmpIP = tmpIP.substr(7)
        if(false===regex.ipv4.test(tmpIP)){
            return Promise.reject(miscError.IPFormatWrong)
        }
    }

    return Promise.resolve(tmpIP)
}

/*  根据server_common->constant->config->globalConfiguration中的配置，决定用session还是IP，或者2者皆是，作为identity
*   返回：数组。包含session/IP
* */
async function getIdentify_async({req}){
    let userIdentify=appSetting['userIdentify'] //基于sessionId，IP或者2者皆是进行interval的检测
    // ap.inf('userIdentify for getIdentify_async',userIdentify)
    let prefix=[]

    if(userIdentify==='session' || userIdentify==='bothAnd' || userIdentify==='bothOr'){
        let sessionId=await getSessionId_async({req:req})
        prefix.push(`${sessionId}`)
        //bothOr,则session优先，即如果检测到session，就可以了；没有session，才检查ip
        if(userIdentify==='bothOr'){
            return
        }
    }

    if(userIdentify==='ip' || userIdentify==='bothAnd' || userIdentify==='bothOr'){
        let ip=await getIP_async({req:req})
        prefix.push(`${ip}`)
    }

    return Promise.resolve(prefix)
}

//根据userIdentify产生设置redis中reject需要的key的名称： userIdentify.intervalCheck(key):rejectFlag  and userIdentify.intervalCheck(key):rejectTimes
//prefix: captcha/uploadUserPhoto等
//返回数组：对不同的userIdentify产生对应的key name，例如[{rejectFlag:session.captcha:rejectFlag,rejectTimes:session.captcha:rejectTimes}]
function genRejectKeyName({arr_userIdentify,prefix}){
    let rejectKeyName=[]
    for(let singleUserIdentify of arr_userIdentify){
        let tmpRejectKey={}
        tmpRejectKey['rejectFlag']=`${singleUserIdentify}.${prefix}:rejectFlag`
        tmpRejectKey['rejectTimes']=`${singleUserIdentify}.${prefix}:rejectTimes`
        rejectKeyName.push(tmpRejectKey)
    }
    return rejectKeyName
}


// async function regenSessionId_async({req,sessionCookieConfiguration}){
//
// }
/* 将dataUrl转换成文件
* */
function dataUrl2File_returnFileAbsPath_async({dataUrl,fileNameWithoutExtension,filePath}){
    return new Promise(function(resolve, reject){
        //1. 首先获得后缀（png/jpeg）
        let reg=/^data:image\/(png|jpg|jpeg);base64,/
        let result=dataUrl.match(reg)
        //["data:image/png;base64,","png"]
        if(undefined===result || undefined===result[1]){
            return reject(miscError.dataUrlNotValidImage)
        }
        let ext=result[1]
        //2 删除前缀，然后写入文件
        let base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
        let dataBuffer = new Buffer(base64Data, 'base64');
        fs.writeFile(`${filePath}${fileNameWithoutExtension}.${ext}`, dataBuffer, function(err) {
            if(err){
                return reject(err);
            }else{
                return resolve(`${filePath}${fileNameWithoutExtension}.${ext}`);
            }
        });
    })

    // ap.inf('result',result)
}
module.exports={
    // checkInterval_async,
    generateRandomString,
    restTimeInDay,


    // getUserInfo,
    // checkUserState,
    // ifUserLogin,

    encodeHtml,


    // formatRc,
    // consoleDebug,

    convertURLSearchString,
    escapeRegSpecialChar,
    genFinalReturnResult,

    objectDeepCopy,
    objectPartlyDeepCopy,
    sendVerificationCodeByEmail_async,

    convertFileSize,

    ifArrayHasDuplicate,
    ifArrayContainArray,

    /*              for maintain                */
    recursiveReadFileAbsPath,//递归读取一个目录下所有文件的路径
    readFileExportItem,
    sanityClientPatternInString,
    deleteCommentSpaceReturn,
    recursiveRequireAllFileInDir,//将数组中所有文件名require到指定文件中

    getSessionId_async,
    getIP_async,
    getIdentify_async,//调用getSessionId_async/getIP_async,获得sessionId或者ip
    genRejectKeyName, //产生redis设置reject是对应的keyname
    // regenSessionId_async,//当session的时间段
    /*              set/get cpatch              */
    // setCaptcha_async,

    dataUrl2File_returnFileAbsPath_async,
}

/*let s={k1:1,k2:2,k3:3}
ap.inf('k1,k2', objectPartlyDeepCopy({sourceObj:s,expectedKey:['k1','k100']}))*/
/*let dataUrl='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAYzUlEQVR4nO2bZ1RU1/73/2vlSpkZpiCCilQVpUqXDjYQFWvsvcUSQVBQURALKqgoaq5JjCWJJWosiXqTqInd2LtYooBKBymKdJjP8+KMRCOW+0RzSZyz1nfxYu/Z++zf5+z9K4fzf7rtVlDf1NBvKW38p/C6q7SijOTcNM6nJvFz0ik2ntzLmiM7mPntCiK/TaSiqvK1Y7zLa1joSvS85/9Xa/+//7XxXwVEqVSS/+QRyTlpnPztEgevn2Lt0Z2sOriFqB0rmbY1gTHrYxi4ehpByyfhFTsM17kDMZ0SgMkUf0oqytRA/mu1T0TPPx69wAXo95yFfu8ZNO4XTMvBg4jauYqwzYsZu34OfVaFEbR8Eq5zB2If/SEmU/xfKzWQN3n6Oy7FoPc0DPqF0njQRJoOHYvhyBEYjh5Ks/H9MJrQB6PgIEwmd34jo6…YbUKbTWPqJW/YS5Ww8QqgyOk5G5THvJCyq/ZSi8FqiMP1UY3DEUmWukENO7xyB3ixaqv0/bVJPWynWG6gXNYlXBbyFyt9nInCOEyWvb41WZ7iLk7rNVv322FC9kwXL3GGFRzyz2qYGfglB4x6n8YBxy9znIXKarAAQ/02fR7+2u05E6hvxuPJcIVcV50UthPHXqco+5yFxnIHWcXMc9PQskXFX8XCDM6zEPWdtIoaCqAvZsu/qd+gvGjhfqU64zkDlORuYYUoeCa4uZtVXmtzS/GkidQDazLuURj5VKlHXqDgmjl9BSDeSvAjIXhVskCudQFE6T61AIchf1DvkLgTz1Ly/3D+ojSw3kfVYiT99zvFRP+7zludVA6pnUQOqZ1EDqmdRA6pnUQOqZ1EDqmdRA6pnUQOqZ1EDqmdRA6pnUQOqZ1EDqmdRA6pnUQOqZ1EDqmdRA6pnUQOqZ1EDqmdRA6pnUQOqZ/h/t8TWgRy1HLAAAAABJRU5ErkJggg=='
dataUrl2File_async({dataUrl:dataUrl,fileNameWithoutExtension:`test`,filePath:'d:/'})*/
