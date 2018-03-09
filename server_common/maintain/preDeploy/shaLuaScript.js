/**
 * Created by Ada on 2018/2/25.
 * 开始运行之前，先要将Lua脚本sha，并载入redis，以便通过sha值直接调用
 *
 */
'use strict'

'use strict'

const redisClient=require('../../model/redis/common/redis_connections').redisClient  //只是用来进行sha，不care db
const fs=require('fs')
const path=require('path')
const misc=require('../../function/assist/misc')
const ap=require('awesomeprint')
// var LuaSHA=require('./../../routes/assist/globalConstantDefine').constantDefine.LuaSHA
// var CRUDGlobalSetting=require('./../../routes/model/redis/CRUDGlobalSetting').globalSetting
//var intervalCheckBaseIPError=require('../../error_define/runtime_redis_error').runtime_redis_error.intervalCheckBaseIP
//var intervalCheckBaseIPNodeError=require('../../error_define/runtime_node_error').runtime_node_error.intervalCheckBaseIP


/*读取目录下所有lua文件的路径；或者如果只是指定一个lua，进行sha，载入redis；写入一个：lua名称：sha
* @absoluteDirOrFilePath:目录或者文件
* @skipFilesArray：需要排除的文件名
 */

async function SHAFileInFolder_async({absoluteDirOrFilePath,skipFilesArray}){
    let finalResult={}

    let filesPath=[]
    misc.recursiveReadFileAbsPath({fileOrDirPath:absoluteDirOrFilePath,skipFilesArray:skipFilesArray,absFilesPathResult:filesPath})
    // ap.inf('shaResult',filesPath)
    for(let singleFilePath of filesPath){
        let fileName=path.basename(singleFilePath).split('.')[0] //取无扩展的文件名
        let fileContent=fs.readFileSync(singleFilePath,'utf8')
        let shaResult=await redisClient.script('load',fileContent)//,function(err,sha){
        // ap.inf('shaResult',shaResult)
        finalResult[fileName]=shaResult
    }
    // ap.inf('finalResult',finalResult)
    return Promise.resolve(finalResult)
}

/* 将sha的结果写入文件，以便调用
* @content：SHAFileInFolder_async的结果。对象，key为不带后缀的lua文件名，value为sha
* @resultFilePath：将要写入的文件绝对路径
* */
function writeResult({content,resultFilePath}){
    let description=`/*    gene by server/maintain/preDeploy/shaLuaScript     */ \r\n \r\n`
    let indent=`\ \ \ \ `
    let useStrict=`"use strict"\r\n`
    let convertedContent=``
    convertedContent+=`const luaScriptSHA={\r\n`
    for (let k in content){
        convertedContent+=`${indent}'${k}':'${content[k]}',\r\n`
    }
    convertedContent+=`}\r\n`
    
    let exp=`\r\nmodule.exports={\r\n${indent}luaScriptSHA,\r\n}`


    fs.writeFileSync(resultFilePath,`${description}${useStrict}${convertedContent}${exp}`)
}


/*  综合文件，调用SHAFileInFolder_async和writeResult
* */
async function genSha_async({absoluteDirOrFilePath,skipFilesArray,resultFilePath}){
    let content=await SHAFileInFolder_async({absoluteDirOrFilePath:absoluteDirOrFilePath,skipFilesArray:skipFilesArray})
    writeResult({content:content,resultFilePath:resultFilePath})
}


module.exports={
    genSha_async,
}
// writeResult({absoluteDirOrFilePath:'D:/ss_vue_express/server_common/model/redis/lua_script/',skipFilesArray:['adminLogin.lua']})