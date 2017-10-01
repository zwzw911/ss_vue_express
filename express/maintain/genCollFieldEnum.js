/**
 * Created by Ada on 2017/9/2.
 */
'use strict'

const fs=require('fs')
const genCollFieldEnum=require('../../server_common/maintain/runAllGen').genAllForNormal

let absoluteDestDirForInputRule=`h:/ss_vue_express/express/server/constant/inputRule/`
let absoluteDestDirForEnum=`h:/ss_vue_express/express/server/constant/genEnum/`
let absoluteDestDirForSettingObjectId=`h:/ss_vue_express/express/server/constant/genEnum/`
let modelCollRootDir='h:/ss_vue_express/server_common/model/mongo/structure/'
let inputRuleBaseDir='h:/ss_vue_express/server_common/constant/inputRule/'   //原始的rule定义
let mongoEnumDir='h:/ss_vue_express/server_common/constant/enum/' //原始的enum定义的目录

genCollFieldEnum(absoluteDestDirForInputRule,absoluteDestDirForEnum,absoluteDestDirForSettingObjectId,modelCollRootDir,inputRuleBaseDir,mongoEnumDir)

let getInitSettingIdFilePath='./preDeploy/getInitSettingId'
if(fs.existsSync(getInitSettingIdFilePath)){
    const getInitSettingObjectId=require(getInitSettingIdFilePath).writeInitSettingEnum_async
    getInitSettingObjectId(absoluteDestDirForEnum).then(
        (result)=>{console.log(`getInitSettingObjectId result is ${JSON.stringify(result)}`)},
        (err)=>{console.log(`getInitSettingObjectId err is ${JSON.stringify(err)}`)},
    )
}