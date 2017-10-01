/**
 * Created by ada on 2017/9/1.
 */
'use strict'
const fs=require('fs')

// const recursiveRequireAllFileInDir=require('../function/assist/misc').recursiveRequireAllFileInDir


/*
* @absoluteDestDirForInputRule: 合并后的rule存放的目录
* @absoluteDestDirForEnum: 根据model产生的enum存放的目录  ../constant/enum/
* @absoluteDestDirForMongoEnumValue: 将admin设置的一些objectId直接写入文件，省得每次使用都要查询mongoose
* @modelCollRootDir: model所在的绝对路径
* @inputRuleBaseDir: 所有inputRule所在的目录
* @mongoEnumDir: express（mongoose）中将要使用的enum value所在的目录
* @skipObject:{skipFilesArray,skipCollNameArray}
* */

/*              检查传入的目录是否存在             */
function _ifParamsDirExist(dirToBeCheckInObject){
    for(let singleKey in dirToBeCheckInObject){
        if(false=== fs.existsSync(dirToBeCheckInObject[singleKey])){
            console.log(`${singleKey}:${dirToBeCheckInObject[singleKey]} not exist`)
            return false
        }
/*        else{
            console.log(`${singleKey}:${dirToBeCheckInObject[singleKey]} exist`)
        }*/
    }


    return true
}

/*
* skipGenMongoEnum:防止express/express_admin生成enumValue（enumValue只有server_common才需要）
* */
function _genForGeneral_part1(absoluteDestDirForInputRule,absoluteDestDirForEnum,absoluteDestDirForMongoEnumValue,modelCollRootDir,inputRuleBaseDir,mongoEnumDir,skipObject,skipGenMongoEnum=false){
    // const generateMongoInternalFieldToEnum=require('./generateFunction/generateMongoInternalFieldToEnum').writeFinalResult

    let {skipFilesArray,skipCollNameArray}=skipObject

    /*                  产生client用的配置                        */
/*    const generateClientConfiguration=require('./generateFunction/generateClientConfiguration').genClientEnum
    generateClientConfiguration()  //for client
    const generateMongoEnumKeyValueExchange=require('./generateFunction/generateMongoEnumKeyValueExchange').genMongoEnumKVExchange
    generateMongoEnumKeyValueExchange() //for client*/

    /*                  dbMetaData                      */
    console.log(`start generateMongoCollToEnum`)
    const generateMongoCollToEnum=require('./generateFunction/generateMongoCollToEnum').writeResult
    generateMongoCollToEnum(modelCollRootDir,`${absoluteDestDirForEnum}DB_Coll.js`,skipFilesArray)

    console.log(`start generateMongoDbModelToEnum`)
    const generateMongoDbModelToEnum=require('./generateFunction/generateMongoDbModelToEnum').writeModelResult
    const generateMongoDbModelToEnumInArray=require('./generateFunction/generateMongoDbModelToEnum').writeModelInArrayResult
    generateMongoDbModelToEnum(modelCollRootDir,`${absoluteDestDirForEnum}dbModel.js`,skipFilesArray)
    generateMongoDbModelToEnumInArray(modelCollRootDir,`${absoluteDestDirForEnum}dbModelInArray.js`,skipFilesArray)

    console.log(`start generateMongoFieldToEnum`)
    const generateMongoFieldToEnum=require('./generateFunction/generateMongoFieldToEnum').writeFinalResult
    generateMongoFieldToEnum(modelCollRootDir,`${absoluteDestDirForEnum}DB_field.js`,skipFilesArray)

    console.log(`start generateMongoUniqueFieldToEnum`)
    const generateMongoUniqueFieldToEnum=require('./generateFunction/generateMongoUniqueFieldToEnum').writeFinalResult
    generateMongoUniqueFieldToEnum(modelCollRootDir,`${absoluteDestDirForEnum}DB_uniqueField.js`,skipFilesArray)

    if(false===skipGenMongoEnum){
        console.log(`start generateMongoEnum`)
        // console.log(`mongoEnumDir: ${mongoEnumDir}`)
        // console.log(`absoluteDestDirForMongoEnumValue: ${absoluteDestDirForMongoEnumValue}`)
        const generateMongoEnum=require('./generateFunction/generateMongoEnum').writeResult
        generateMongoEnum(mongoEnumDir,`${absoluteDestDirForMongoEnumValue}enumValue.js`)
    }


    console.log(`part1 done`)
}

function _genForGeneral_part2(absoluteDestDirForInputRule,absoluteDestDirForEnum,absoluteDestDirForMongoEnumValue,modelCollRootDir,inputRuleBaseDir,mongoEnumDir,skipObject){
    if(false=== fs.existsSync(absoluteDestDirForInputRule)){
        // console.log(`${absoluteDestDirForInputRule} not exist`)
        return false
    }
    const e_ruleType=require('./generateFunction/generateAllRuleInOneFile').RuleType






    let {skipFilesArray,skipCollNameArray}=skipObject

    /*                  inputRule                      */
    //合并生成internal/browse/all inputRule
    //absoluteDestDirForInputRule:  server/inputRule
    console.log(`start generateAllRuleInOneFile`)
    const generateAllRuleInOneFile=require('./generateFunction/generateAllRuleInOneFile').writeResult
    generateAllRuleInOneFile(modelCollRootDir,`${absoluteDestDirForInputRule}inputRule.js`,e_ruleType.BOTH,skipFilesArray,inputRuleBaseDir)
    generateAllRuleInOneFile(modelCollRootDir,`${absoluteDestDirForInputRule}browserInputRule.js`,e_ruleType.BROWSER,skipFilesArray,inputRuleBaseDir)
    generateAllRuleInOneFile(modelCollRootDir,`${absoluteDestDirForInputRule}internalInputRule.js`,e_ruleType.INTERNAL,skipFilesArray,inputRuleBaseDir)


    console.log(`start generateMongoInternalFieldToEnum`)
    const generateMongoInternalFieldToEnum=require('./generateFunction/generateMongoInternalFieldToEnum').writeFinalResult
    generateMongoInternalFieldToEnum(`${inputRuleBaseDir}internalInputRule.js`,`${absoluteDestDirForEnum}DB_internal_field.js`,skipCollNameArray)

    console.log(`start generateRuleFieldChineseName`)
    const generateRuleFieldChineseName=require('./generateFunction/generateRuleFieldChineseName').writeFinalResult
    generateRuleFieldChineseName(`${inputRuleBaseDir}inputRule.js`,`${absoluteDestDirForEnum}inputRule_field_chineseName.js`,skipCollNameArray)





    console.log(`part2 done`)
}
/*let absoluteDestDirForInputRule=`h:/ss_vue_express/express_admin/server/constant/inputRule/`
let absoluteDestDirForEnum=`h:/ss_vue_express/express_admin/server/constant/collFieldEnum/`
let modelCollRootDir='h:/ss_vue_express/server_common/model/mongo/structure'

genFroNormal(absoluteDestDirForInputRule,absoluteDestDirForEnum,modelCollRootDir)*/





/*
 * skipGenMongoEnum:防止express/express_admin生成enumValue（enumValue只有server_common才需要）
 * */
function genAllForCommon(absoluteDestDirForInputRule,absoluteDestDirForEnum,absoluteDestDirForMongoEnumValue,modelCollRootDir,inputRuleBaseDir,mongoEnumDir){
    let result=_ifParamsDirExist({
        absoluteDestDirForInputRule:absoluteDestDirForInputRule,
        absoluteDestDirForEnum:absoluteDestDirForEnum,
        absoluteDestDirForMongoEnumValue:absoluteDestDirForMongoEnumValue,
        modelCollRootDir:modelCollRootDir,
        inputRuleBaseDir:inputRuleBaseDir,
        mongoEnumDir:mongoEnumDir,
    })
    if(false===result){return false}

    /*              common 可以访问所有数据                 */
    let skipObject={
        skipFilesArray:['readme.txt','enumValue.js'],
        skipCollNameArray:[],
    }

    let skipGenMongoEnum=false
    _genForGeneral_part1(absoluteDestDirForInputRule,absoluteDestDirForEnum,absoluteDestDirForMongoEnumValue,modelCollRootDir,inputRuleBaseDir,mongoEnumDir,skipObject,skipGenMongoEnum)
    _genForGeneral_part2(absoluteDestDirForInputRule,absoluteDestDirForEnum,absoluteDestDirForMongoEnumValue,modelCollRootDir,inputRuleBaseDir,mongoEnumDir,skipObject)


    // recursiveRequireAllFileInDir(absoluteDestDirForEnum,`${absoluteDestDirForEnum}`)
}

function genAllForAdmin(absoluteDestDirForInputRule,absoluteDestDirForEnum,absoluteDestDirForMongoEnumValue,modelCollRootDir,inputRuleBaseDir,mongoEnumDir){
    let result=_ifParamsDirExist({
        absoluteDestDirForInputRule:absoluteDestDirForInputRule,
        absoluteDestDirForEnum:absoluteDestDirForEnum,
        absoluteDestDirForMongoEnumValue:absoluteDestDirForMongoEnumValue,
        modelCollRootDir:modelCollRootDir,
        inputRuleBaseDir:inputRuleBaseDir,
        mongoEnumDir:mongoEnumDir,
    })
    if(false===result){return false}

    /*              common 可以访问所有数据                 */
    let skipObject={
        skipFilesArray:['readme.txt','enumValue.js','sugar.js','user.js'],
        skipCollNameArray:['sugar','user'],
    }

    let skipGenMongoEnum=false
    _genForGeneral_part1(absoluteDestDirForInputRule,absoluteDestDirForEnum,absoluteDestDirForMongoEnumValue,modelCollRootDir,inputRuleBaseDir,mongoEnumDir,skipObject,skipGenMongoEnum)
    _genForGeneral_part2(absoluteDestDirForInputRule,absoluteDestDirForEnum,absoluteDestDirForMongoEnumValue,modelCollRootDir,inputRuleBaseDir,mongoEnumDir,skipObject)
}

function genAllForNormal(absoluteDestDirForInputRule,absoluteDestDirForEnum,absoluteDestDirForMongoEnumValue,modelCollRootDir,inputRuleBaseDir,mongoEnumDir){
    let result=_ifParamsDirExist({
        absoluteDestDirForInputRule:absoluteDestDirForInputRule,
        absoluteDestDirForEnum:absoluteDestDirForEnum,
        absoluteDestDirForMongoEnumValue:absoluteDestDirForMongoEnumValue,
        modelCollRootDir:modelCollRootDir,
        inputRuleBaseDir:inputRuleBaseDir,
        mongoEnumDir:mongoEnumDir,
    })
    if(false===result){return false}

    /*              common 可以访问所有数据                 */
    let skipObject={
        skipFilesArray:['readme.txt','enumValue.js','admin_sugar.js','admin_user.js'],
        skipCollNameArray:['admin_sugar','admin_user'],
    }

    let skipGenMongoEnum=false
    _genForGeneral_part1(absoluteDestDirForInputRule,absoluteDestDirForEnum,absoluteDestDirForMongoEnumValue,modelCollRootDir,inputRuleBaseDir,mongoEnumDir,skipObject)
    _genForGeneral_part2(absoluteDestDirForInputRule,absoluteDestDirForEnum,absoluteDestDirForMongoEnumValue,modelCollRootDir,inputRuleBaseDir,mongoEnumDir,skipObject)
}

module.exports={
    genAllForCommon,
    genAllForAdmin,
    genAllForNormal,

}


