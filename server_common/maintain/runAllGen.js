/**
 * Created by ada on 2017/9/1.
 */
'use strict'
const fs=require('fs')
const ap=require('awesomeprint')
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
            ap.inf(`${singleKey}:${dirToBeCheckInObject[singleKey]} not exist`)
            return false
        }
/*        else{
            ap.inf(`${singleKey}:${dirToBeCheckInObject[singleKey]} exist`)
        }*/
    }


    return true
}

/*
* skipGenMongoEnum:防止express/express_admin生成enumValue（enumValue只有server_common才需要）
* */
function _genForGeneral_part1(absoluteDestDirForInputRule,absoluteDestDirForEnum,absoluteDestDirForMongoEnumValue,modelCollRootDir,inputRuleBaseDir,mongoEnumDir,skipObject,skipGenMongoEnum=false){
    // const generateMongoInternalFieldToEnum=require('./generateFunction/generateMongoInternalFieldToEnum').writeFinalResult
    const genEnumValueToArray=require('./generateFunction/generateEnumValueToArray').genEnumValueToArray


    let {skipFilesArray,skipCollNameArray}=skipObject

    /*                  产生client用的配置                        */
    const generateClientEnum=require('./generateFunction/generateClientEnum').generateClientEnum
    generateClientEnum({resultFilePath:`${absoluteDestDirForEnum}clientEnum.js`})  //for client
/*    const generateMongoEnumKeyValueExchange=require('./generateFunction/generateMongoEnumKeyValueExchange').genMongoEnumKVExchange
    generateMongoEnumKeyValueExchange() //for client*/

    /*                  dbMetaData                      */
    ap.inf(`start generateMongoCollToEnum`)
    const generateMongoCollToEnum=require('./generateFunction/generateMongoCollToEnum').writeResult
    generateMongoCollToEnum(modelCollRootDir,`${absoluteDestDirForEnum}DB_Coll.js`,skipFilesArray)

    ap.inf(`start generateMongoDbModelToEnum`)
    const generateMongoDbModelToEnum=require('./generateFunction/generateMongoDbModelToEnum').writeModelResult
    const generateMongoDbModelToEnumInArray=require('./generateFunction/generateMongoDbModelToEnum').writeModelInArrayResult
    generateMongoDbModelToEnum(modelCollRootDir,`${absoluteDestDirForEnum}dbModel.js`,skipFilesArray)
    generateMongoDbModelToEnumInArray(modelCollRootDir,`${absoluteDestDirForEnum}dbModelInArray.js`,skipFilesArray)

    ap.inf(`start generateMongoFieldToEnum`)
    const generateMongoFieldToEnum=require('./generateFunction/generateMongoFieldToEnum').writeFinalResult
    generateMongoFieldToEnum(modelCollRootDir,`${absoluteDestDirForEnum}DB_field.js`,skipFilesArray)

    ap.inf(`start generateMongoUniqueFieldToEnum`)
    const generateMongoUniqueFieldToEnum=require('./generateFunction/generateMongoUniqueFieldToEnum').writeFinalResult
    generateMongoUniqueFieldToEnum(modelCollRootDir,`${absoluteDestDirForEnum}DB_uniqueField.js`,skipFilesArray)

    if(false===skipGenMongoEnum){
        ap.inf(`start generateMongoEnum`)
        // ap.inf(`mongoEnumDir: ${mongoEnumDir}`)
        // ap.inf(`absoluteDestDirForMongoEnumValue: ${absoluteDestDirForMongoEnumValue}`)
        const generateMongoEnum=require('./generateFunction/generateMongoEnum').writeResult
        generateMongoEnum(mongoEnumDir,`${absoluteDestDirForMongoEnumValue}enumValue.js`)
    }

    ap.inf(`start generateNodeEnum`)
    // ap.inf(`mongoEnumDir: ${mongoEnumDir}`)
    // ap.inf(`absoluteDestDirForMongoEnumValue: ${absoluteDestDirForMongoEnumValue}`)

    genEnumValueToArray({fileOrDirPath:`${mongoEnumDir}nodeEnum.js`,resultDirPath:`${absoluteDestDirForEnum}`})

    ap.inf(`start generate inputDataRuleType enum to array`)
    genEnumValueToArray({fileOrDirPath:`${mongoEnumDir}inputDataRuleType.js`,resultDirPath:`${absoluteDestDirForEnum}`})

    ap.inf(`start generate db_coll enum to array`)
    genEnumValueToArray({fileOrDirPath:`${absoluteDestDirForEnum}DB_Coll.js`,resultDirPath:`${absoluteDestDirForEnum}`})

    ap.inf(`part1 done`)
}

function _genForGeneral_part2(absoluteDestDirForInputRule,absoluteDestDirForEnum,absoluteDestDirForMongoEnumValue,modelCollRootDir,inputRuleBaseDir,mongoEnumDir,skipObject){
    if(false=== fs.existsSync(absoluteDestDirForInputRule)){
        // ap.inf(`${absoluteDestDirForInputRule} not exist`)
        return false
    }
    const e_ruleType=require('./generateFunction/generateAllRuleInOneFile').RuleType






    let {skipFilesArray,skipCollNameArray}=skipObject

    /*                  inputRule                      */
    //合并生成internal/browse/all inputRule
    //absoluteDestDirForInputRule:  server/inputRule

    const generateAllRuleInOneFile=require('./generateFunction/generateAllRuleInOneFile').combineRuleIntoOneFile

    ap.inf(`start generateAllRuleInOneFile for browser`)
    generateAllRuleInOneFile({inputRuleBaseDir:inputRuleBaseDir,resultAbsPath:`${absoluteDestDirForInputRule}browserInputRule.js`,ruleType:e_ruleType.BROWSER,skipFilesArray:skipFilesArray})
    ap.inf(`start generateAllRuleInOneFile for internal`)
    generateAllRuleInOneFile({inputRuleBaseDir:inputRuleBaseDir,resultAbsPath:`${absoluteDestDirForInputRule}internalInputRule.js`,ruleType:e_ruleType.INTERNAL,skipFilesArray:skipFilesArray})
    ap.inf(`start generateAllRuleInOneFile for both`)
    //generateAllRuleInOneFile(modelCollRootDir,`${absoluteDestDirForInputRule}inputRule.js`,e_ruleType.BOTH,skipFilesArray,inputRuleBaseDir)
    generateAllRuleInOneFile({inputRuleBaseDir:inputRuleBaseDir,resultAbsPath:`${absoluteDestDirForInputRule}inputRule.js`,ruleType:e_ruleType.BOTH,skipFilesArray:skipFilesArray})

    ap.inf(`start generateMongoInternalFieldToEnum`)
    const generateMongoInternalFieldToEnum=require('./generateFunction/generateMongoInternalFieldToEnum').writeFinalResult
    generateMongoInternalFieldToEnum(`${inputRuleBaseDir}internalInputRule.js`,`${absoluteDestDirForEnum}DB_internal_field.js`,skipCollNameArray)

    ap.inf(`start generateRuleFieldChineseName`)
    const generateRuleFieldChineseName=require('./generateFunction/generateRuleFieldChineseName').writeFinalResult
    generateRuleFieldChineseName(`${inputRuleBaseDir}inputRule.js`,`${absoluteDestDirForEnum}inputRule_field_chineseName.js`,skipCollNameArray)





    ap.inf(`part2 done`)
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


