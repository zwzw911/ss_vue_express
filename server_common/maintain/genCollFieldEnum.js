/**
 * Created by Ada on 2017/9/2.
 */
'use strict'
const fs=require(`fs`)
const runAllGenForCommon=require('./runAllGen').genAllForCommon

const absolutePath=require('../constant/config/appSetting').absolutePath
let serverCommonAbsolutePath=absolutePath.server_common//`f:/U_backup/ss_vue_express/server_common/`


let absoluteDestDirForInputRule=`${serverCommonAbsolutePath}constant/inputRule/`
let absoluteDestDirForEnum=`${serverCommonAbsolutePath}constant/genEnum/`
let absoluteDestDirForMongoEnumValue=`${serverCommonAbsolutePath}constant/genEnum/`
// let absoluteDestDirForMongoEnumValue=`${serverCommonAbsolutePath}model/mongo/structure/`

let modelCollRootDir=`${serverCommonAbsolutePath}model/mongo/structure/` //原始的mongoose的schema定义
let inputRuleBaseDir=`${serverCommonAbsolutePath}constant/inputRule/`   //原始的rule定义
let mongoEnumDir=`${serverCommonAbsolutePath}constant/enum/`  //原始的enum定义的目录

runAllGenForCommon(absoluteDestDirForInputRule,absoluteDestDirForEnum,absoluteDestDirForMongoEnumValue,modelCollRootDir,inputRuleBaseDir,mongoEnumDir)

/*  此文件只是为了运行时通过（template放在server_common，而template引用了此文件）*/
let getInitSettingIdFilePath=`${serverCommonAbsolutePath}maintain/preDeploy/getInitSettingId.js`
if(fs.existsSync(getInitSettingIdFilePath)){
    const getInitSettingObjectId=require(getInitSettingIdFilePath).writeInitSettingEnum_async
    // console.log(`absoluteDestDirForEnum======>${absoluteDestDirForEnum}`)
    getInitSettingObjectId(absoluteDestDirForEnum).then(
        (result)=>{console.log(`getInitSettingObjectId result is ${JSON.stringify(result)}`)},
        (err)=>{console.log(`getInitSettingObjectId err is ${JSON.stringify(err)}`)},
    )
}