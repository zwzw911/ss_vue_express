/**
 * Created by Ada on 2017/9/2.
 */
'use strict'
const ap=require('awesomeprint')

const fs=require('fs')
const absolutePath=require('../server_common_file_require').appSetting.absolutePath

const genCollFieldEnum=require('../../server_common/maintain/runAllGen').genAllForNormal

let localAbsolutePath=absolutePath.express//`f:/U_backup/ss_vue_express/express/`
let serverCommonAbsolutePath=absolutePath.server_common//`f:/U_backup/ss_vue_express/server_common/`

let absoluteDestDirForInputRule=`${localAbsolutePath}server/constant/inputRule/`
let absoluteDestDirForEnum=`${localAbsolutePath}server/constant/genEnum/`
let absoluteDestDirForMongoEnumValue=`${localAbsolutePath}server/constant/genEnum/`

let modelCollRootDir=`${serverCommonAbsolutePath}model/mongo/structure/`
let inputRuleBaseDir=`${serverCommonAbsolutePath}constant/inputRule/`   //原始的rule定义
let mongoEnumDir=`${serverCommonAbsolutePath}constant/enum/` //原始的enum定义的目录

// ap.inf('start')
genCollFieldEnum(absoluteDestDirForInputRule,absoluteDestDirForEnum,absoluteDestDirForMongoEnumValue,modelCollRootDir,inputRuleBaseDir,mongoEnumDir)
// ap.inf('end')
let getInitSettingIdFilePath=`${serverCommonAbsolutePath}maintain/preDeploy/getInitSettingId.js`
if(fs.existsSync(getInitSettingIdFilePath)){
    const getInitSettingObjectId=require(getInitSettingIdFilePath).writeInitSettingEnum_async
    getInitSettingObjectId(absoluteDestDirForEnum).then(
        (result)=>{console.log(`getInitSettingObjectId result is ${JSON.stringify(result)}`)},
        (err)=>{console.log(`getInitSettingObjectId err is ${JSON.stringify(err)}`)},
    )
}
