/**
 * Created by Ada on 2017/9/2.
 */
'use strict'
// const fs=require(`fs`)
// const runAllGenForCommon=require('./runAllGen').genAllForCommon

const absolutePath=require('../constant/config/appSetting').absolutePath
let serverCommonAbsolutePath=absolutePath.server_common//`f:/U_backup/ss_vue_express/server_common/`


const genSha=require('./preDeploy/shaLuaScript').genSha

let absoluteDirOrFilePath=`${absolutePath.server_common}model/redis/lua_script/`

let resultFilePath=`${absolutePath.server_common}constant/genEnum/LuaSHA.js`
genSha({absoluteDirOrFilePath:absoluteDirOrFilePath,skipFilesArray:[],resultFilePath:resultFilePath})