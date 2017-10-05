/**
 * Created by Ada on 2017/9/2.
 */
'use strict'

const fs=require('fs')
const genCollFieldEnum=require('../../server_common/maintain/runAllGen').genAllForNormal
let localAbsolutePath=`h:/ss_vue_express/express/`
let serverCommonAbsolutePath=`h:/ss_vue_express/server_common/`

let absoluteDestDirForInputRule=`${localAbsolutePath}server/constant/inputRule/`
let absoluteDestDirForEnum=`${localAbsolutePath}server/constant/genEnum/`
let absoluteDestDirForSettingObjectId=`${localAbsolutePath}server/constant/genEnum/`

let modelCollRootDir=`${serverCommonAbsolutePath}model/mongo/structure/`
let inputRuleBaseDir=`${serverCommonAbsolutePath}constant/inputRule/`   //原始的rule定义
let mongoEnumDir=`${serverCommonAbsolutePath}constant/enum/` //原始的enum定义的目录

genCollFieldEnum(absoluteDestDirForInputRule,absoluteDestDirForEnum,absoluteDestDirForSettingObjectId,modelCollRootDir,inputRuleBaseDir,mongoEnumDir)

let getInitSettingIdFilePath=`${serverCommonAbsolutePath}maintain/preDeploy/getInitSettingId`
if(fs.existsSync(getInitSettingIdFilePath)){
    const getInitSettingObjectId=require(getInitSettingIdFilePath).writeInitSettingEnum_async
    getInitSettingObjectId(absoluteDestDirForEnum).then(
        (result)=>{console.log(`getInitSettingObjectId result is ${JSON.stringify(result)}`)},
        (err)=>{console.log(`getInitSettingObjectId err is ${JSON.stringify(err)}`)},
    )
}