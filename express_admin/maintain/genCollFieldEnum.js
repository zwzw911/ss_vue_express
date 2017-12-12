/**
 * Created by Ada on 2017/9/2.
 */
'use strict'
const fs=require('fs')
const absolutePath=require('../server_common_file_require').appSetting.absolutePath

let localAbsolutePath=absolutePath.express_admin//`f:/U_backup/ss_vue_express/express_admin/`
let serverCommonAbsolutePath=absolutePath.server_common//`f:/U_backup/ss_vue_express/server_common/`

const runAllGenForCommon=require(`${serverCommonAbsolutePath}maintain/runAllGen`).genAllForAdmin

let absoluteDestDirForInputRule=`${localAbsolutePath}server/constant/inputRule/`
let absoluteDestDirForEnum=`${localAbsolutePath}server/constant/genEnum/`
let absoluteDestDirForMongoEnumValue=`${localAbsolutePath}server/constant/genEnum/`

let modelCollRootDir=`${serverCommonAbsolutePath}model/mongo/structure/` //原始的mongoose的schema定义
let inputRuleBaseDir=`${serverCommonAbsolutePath}constant/inputRule/`   //原始的rule定义
let mongoEnumDir=`${serverCommonAbsolutePath}constant/enum/`  //原始的enum定义的目录

runAllGenForCommon(absoluteDestDirForInputRule,absoluteDestDirForEnum,absoluteDestDirForMongoEnumValue,modelCollRootDir,inputRuleBaseDir,mongoEnumDir)


let getInitSettingIdFilePath=`${serverCommonAbsolutePath}maintain/preDeploy/getInitSettingId.js`
if(fs.existsSync(getInitSettingIdFilePath)){
    const getInitSettingObjectId=require(getInitSettingIdFilePath).writeInitSettingEnum_async
    getInitSettingObjectId(absoluteDestDirForEnum).then(
        (result)=>{console.log(`getInitSettingObjectId result is ${JSON.stringify(result)}`)},
        (err)=>{console.log(`getInitSettingObjectId err is ${JSON.stringify(err)}`)},
    )
}
