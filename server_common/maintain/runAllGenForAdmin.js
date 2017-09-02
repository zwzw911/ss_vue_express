/**
 * Created by ada on 2017/9/1.
 */
'use strict'
const fs=require('fs')
const e_ruleType=require('./generateAllRuleInOneFile').RuleType

const generateAllRuleInOneFile=require('./generateAllRuleInOneFile').writeResult
const generateClientConfiguration=require('./generateClientConfiguration').genClientEnum
const generateMongoCollToEnum=require('./generateMongoCollToEnum').writeResult
const generateMongoDbModelToEnum=require('./generateMongoDbModelToEnum').writeModelResult
const generateMongoDbModelToEnumInArray=require('./generateMongoDbModelToEnum').writeModelInArrayResult
const generateMongoEnum=require('./generateMongoEnum').writeResult
const generateMongoEnumKeyValueExchange=require('./generateMongoEnumKeyValueExchange').genMongoEnumKVExchange
const generateMongoInternalFieldToEnum=require('./generateMongoInternalFieldToEnum').writeFinalResult
const generateRuleFieldChineseName=require('./generateRuleFieldChineseName').writeFinalResult

const generateMongoFieldToEnum=require('./generateMongoFieldToEnum').writeFinalResult
const generateMongoUniqueFieldToEnum=require('./generateMongoUniqueFieldToEnum').writeFinalResult

/*              admin需要访问非admin数据库（读取），但是用户信息除外                 */
let skipFilesArray=['readme.txt','enumValue.js','sugar.js','user.js']
let skipCollNameArray=['sugar','user']



/*
* @absoluteDestDirForInputRule: 合并后的rule存放的目录
* @absoluteDestDirForEnum: 根据model产生的enum存放的目录  ../constant/enum/
* @modelCollRootDir: model所在的绝对路径
* */
function genFroNormal(absoluteDestDirForInputRule,absoluteDestDirForEnum,modelCollRootDir,inputRuleBaseDir){
    if(false=== fs.existsSync(absoluteDestDirForInputRule)){
        // console.log(`${absoluteDestDirForInputRule} not exist`)
        return false
    }


    //合并生成internal/browse/all inputRule
    //absoluteDestDirForInputRule:  server/inputRule
    generateAllRuleInOneFile(modelCollRootDir,`${absoluteDestDirForInputRule}inputRule.js`,e_ruleType.BOTH,skipFilesArray,inputRuleBaseDir)
    generateAllRuleInOneFile(modelCollRootDir,`${absoluteDestDirForInputRule}browserInputRule.js`,e_ruleType.BROWSER,skipFilesArray,inputRuleBaseDir)
    generateAllRuleInOneFile(modelCollRootDir,`${absoluteDestDirForInputRule}internalInputRule.js`,e_ruleType.INTERNAL,skipFilesArray,inputRuleBaseDir)

    // generateClientConfiguration()  //for client
    console.log(`start generateMongoCollToEnum`)
    generateMongoCollToEnum(modelCollRootDir,`${absoluteDestDirForEnum}DB_Coll.js`,skipFilesArray)

    console.log(`start generateMongoDbModelToEnum`)
    generateMongoDbModelToEnum(modelCollRootDir,`${absoluteDestDirForEnum}dbModel.js`,skipFilesArray)
    generateMongoDbModelToEnumInArray(modelCollRootDir,`${absoluteDestDirForEnum}dbModelInArray.js`,skipFilesArray)

    console.log(`start generateMongoEnum`)
    generateMongoEnum(`${absoluteDestDirForEnum}enumValue.js`)

    // generateMongoEnumKeyValueExchange() //for client

    console.log(`start generateMongoInternalFieldToEnum`)
    generateMongoInternalFieldToEnum(`${absoluteDestDirForEnum}DB_internal_field.js`,skipCollNameArray)

    console.log(`start generateRuleFieldChineseName`)
    generateRuleFieldChineseName(`${absoluteDestDirForEnum}inputRule_field_chineseName.js`,skipCollNameArray)

    console.log(`start generateMongoFieldToEnum`)
    generateMongoFieldToEnum(modelCollRootDir,`${absoluteDestDirForEnum}DB_field.js`,skipFilesArray)

    console.log(`start generateMongoUniqueFieldToEnum`)
    generateMongoUniqueFieldToEnum(modelCollRootDir,`${absoluteDestDirForEnum}DB_uniqueField.js`,skipFilesArray)

    console.log(`for admin done`)
}

/*let absoluteDestDirForInputRule=`h:/ss_vue_express/express_admin/server/constant/inputRule/`
let absoluteDestDirForEnum=`h:/ss_vue_express/express_admin/server/constant/collFieldEnum/`
let modelCollRootDir='h:/ss_vue_express/server_common/model/mongo/structure'

genFroNormal(absoluteDestDirForInputRule,absoluteDestDirForEnum,modelCollRootDir)*/

module.exports={
    genFroNormal,
}


