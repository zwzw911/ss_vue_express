/**
 * Created by Ada on 2017/9/2.
 */
'use strict'
// const fs=require(`fs`)
// const runAllGenForCommon=require('./runAllGen').genAllForCommon

const absolutePath=require('../constant/config/appSetting').absolutePath
let serverCommonAbsolutePath=absolutePath.server_common//`f:/U_backup/ss_vue_express/server_common/`
const genSha_async=require('./preDeploy/shaLuaScript').genSha_async
let absoluteDirOrFilePath=`${absolutePath.server_common}model/redis/lua_script/`
let resultFilePath=`${absolutePath.server_common}constant/genEnum/LuaSHA.js`

async function genSha(){

    let result=await genSha_async({absoluteDirOrFilePath:absoluteDirOrFilePath,skipFilesArray:[],resultFilePath:resultFilePath})
    return Promise.resolve(result)
}

module.exports={
    genSha,
}

genSha().then(function(res){
    // return res
    // return
    // process.exit()
},function (err) {
    // return
    // process.exit()
})