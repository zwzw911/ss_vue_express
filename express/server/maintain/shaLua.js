/**
 * Created by wzhan039 on 2017-07-07.
 */
/*
*  把redis的Lua脚本sha化，存入内存
*  单独一个文件，容易调试
* */
'use strict'
//require("babel-polyfill");
//require("babel-core/register")
// var asyncFs=require('../wrapAsync/node/wrapAsyncNode').asyncFs
const fs=require('fs')
// const os=require('os')
const path=require('path')

const shaLuaError=require('../constant/error/assistError').shaLua
// var LuaError=require('../../define/error/redisError').redisError.LuaError
const ioredisClient=require('../model/redis/common/redis_connections').ioredisClient
// var regex=require('../../define/regex/regex').regex

//将文件的 内容 sha化
function shaFileContent(scriptContent){
    return new Promise(function(resolve,reject){

    })
}

//sha单个Lua脚本
async function cacheSingleFile_async(file){
    // let fileExist=await asyncFs.asyncIsDir(file)
    // console.log(fileExist)
    // fileExist.then((v)=>console.log(v),(e)=>console.log(e))
/*    return new Promise(function(resolve,reject){
        fs.readFile(file,function(err,scriptContent){
            if(err){
                return reject(shaLuaError.readLuaFileFail(file))
            }else{
                //load完成后，返回的是sha
                ioredisClient.script('load',scriptContent,(err,sha)=>{
                    if(err){
                        return reject(shaLuaError.cacheScriptContentFail(file))
                    }else{
                        return resolve({rc:0,msg:sha})
                    }

                })
            }
        }) 
    })*/

    let fileContent=fs.readFileSync(file,'utf8')
    // console.log(`conte is ${JSON.stringify(fileContent)}`)
    return new Promise(function(resolve,reject){
        ioredisClient.script('load',fileContent,(err,sha)=>{
            if(err){
                // console.log(`err is ${JSON.stringify(err)}`)
                return reject(shaLuaError.cacheScriptContentFail(file))
            }else{
                // console.log(`sha is ${JSON.stringify(sha)}`)
                return resolve({rc:0,msg:sha})
            }

        })
    })
}

//递归缓存目录下的lua脚本
async function cacheDirFile_async(dirPath){
    let allShaResult={}
    let singleFileResult=''
    let isDir,isFile

    isDir=fs.lstatSync(dirPath).isDirectory()
    //传入的路径是合法的目录
    if(isDir){
        let dirContent=fs.readdirSync(dirPath)
        for(let singleFileDir of dirContent){
            //需要提供路径（目录+文件名）
            let tmpFileDir=`${dirPath}/${singleFileDir}`
            isFile=fs.lstatSync(tmpFileDir).isFile()

            if(isFile){

                let tmpFilePart=singleFileDir.split('.')
                if('lua'===tmpFilePart.pop().toLowerCase()){
                    singleFileResult=await cacheSingleFile_async(tmpFileDir)
                    // console.log(`singleFileResult is ${JSON.stringify(singleFileResult)}`)
                    if(singleFileResult.rc>0){
                        // console.log(`load script ${tmpFileDir} fail`)
                        return Promise.reject(singleFileResult)
                    }else{
                        allShaResult[tmpFileDir]=singleFileResult.msg
                    }
                }

            }
            // isDir=await asyncFs.asyncIsDir(tmpFileDir)
            if(fs.lstatSync(tmpFileDir).isDirectory()){
                let dirResult=await cacheDirFile_async(tmpFileDir)
                for(let key in dirResult){
                    allShaResult[key]=dirResult[key]
                }
            }


        }
    }

    //即使在win上，通过fs读取的路径使用的也是/ H:/ss_vue_express/express/server/model/redis/lua_script/Lua_check_interval.lua
    let pathForDiffOS=path.posix
    // console.log(`os.platform() ${os.platform()}`)
/*    if('win32'===os.platform()){
        pathForDiffOS=path.win32
    }
    if('linux'===os.platform()){
        pathForDiffOS=path.posix
    }*/

// console.log(`allShaResult ${JSON.stringify(allShaResult)}`)
    let indent=`\ \ \ \ `

    let description=`/*    gene by server/maintain/shaLua     */ \r\n \r\n`
    let useStrict=`"use strict"\r\n`

    let exp='module.exports={\r\n'
    let content=`${description}${useStrict}const LuaSHA={\r\n`

    for(let singleFile in allShaResult){
        console.log(`singleFile ${singleFile}`)
        let fileName=path.basename(singleFile)
        let fileNameNoSuffix=fileName.split('.')[0]
        content+=`${indent}'${fileNameNoSuffix}':'${allShaResult[singleFile]}',\r\n`
        // exp+=`${fileNameNoSuffix},\r\n`
    }

    content+=`}\r\n\r\n`
    exp+=`${indent}LuaSHA,\r\n}`

    fs.writeFileSync('../constant/define/LuaSHA.js',`${content}${exp}`)

    return Promise.resolve(allShaResult)
}

// console.log(cacheSingleFile_async('H:/ss_vue_express/express/server/model/redis/lua_script/Lua_check_interval.lua'))

console.log(cacheDirFile_async('H:/ss_vue_express/express/server/model/redis/lua_script'))
/*//执行指定的Lua脚本(用于测试)
async function execLua(fileOrDir,fileTobeExec,params){
     //console.log(params)
    let shaResult=await cacheDirFile_async(fileOrDir)
    for(let filePath in shaResult){
        // console.log(filePath)
        if(-1!==filePath.indexOf(fileTobeExec)){

            return new Promise(function(reslove,reject){
                if(params){
                    //为了能使Lua将字符串（对象转换）转换成table，key不能由括号（无论单还是双）括起
                    params=params.replace(regex.lua.paramsConvert,'$1$2')
                }
                ioredisClient.evalsha(shaResult[filePath],0,params,function(err,result){
                    if(err){console.log(`sha err is ${err}`);reject(LuaError.LueExecFail(fileTobeExec))}
                    console.log(`sha result is ${result}`);reslove(result)
                })
            })

        }
    }
    // return shaResult
}*/



module.exports={
    cacheSingleFile_async,
    cacheDirFile_async,
    // execLua,

}
