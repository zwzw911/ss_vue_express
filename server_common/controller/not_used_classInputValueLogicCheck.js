/**
 * Created by 张伟 on 2018/11/23.
 * class不方便对docValue进行遍历，所以不使用
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')
const mime=require(`mime`)

const createDOMPurify = require('dompurify')
const {JSDOM} = require('jsdom')
/*const dom=new JSDOM('')
const window = dom.window*/
const window = (new JSDOM('')).window
const DOMPurify = createDOMPurify(window)

/**************  本文件相关常量  ****************/
const helperError=require('../constant/error/controller/helperError').helper
const checkerError=require('../constant/error/controller/helperError').checker
const inputValueLogicCheckError=require('../constant/error/controller/helperError').inputValueLogicCheck
/***************  数据库相关常量以及函数   ****************/
const e_dbModel=require('../constant/genEnum/dbModel')
const common_operation_model=require('../model/mongo/operation/common_operation_model')
// const common_operation_helper=require('../model/mongo/operation/common_operation_helper')

// const redisClient=require('../model/redis/common/redis_connections').redisClient


/****************  公共常量 ********************/
const e_chineseName=require('../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_serverRuleType=require('../constant/enum/inputDataRuleType').ServerRuleType
const e_otherRuleFiledName=require('../constant/enum/inputDataRuleType').OtherRuleFiledName
const e_ruleFiledName=require('../constant/enum/inputDataRuleType').RuleFiledName
const e_serverDataType=require('../constant/enum/inputDataRuleType').ServerDataType
// const e_field=require('../constant/genEnum/DB_field').Field
// const e_adminPriorityType=require('../constant/enum/mongoEnum').AdminPriorityType.DB
// const e_allUserType=require('../constant/enum/mongoEnum').AllUserType.DB
//
// const e_userInfoField=require(`../constant/enum/nodeRuntimeEnum`).UserInfoField
const e_dataTypeInfoFieldName=require(`../constant/enum/nodeRuntimeEnum`).DataTypeInfoFieldName
const e_inputValueLogicCheckStep=require(`../constant/enum/nodeRuntimeEnum`).InputValueLogicCheckStep
// const allAdminPriorityType=require('../constant/genEnum/enumValue').AdminPriorityType

const e_uniqueField=require('../constant/genEnum/DB_uniqueField').UniqueField
const enumValue=require('../constant/genEnum/enumValue')

const compound_unique_field_config=require(`../model/mongo/compound_unique_field_config`).compound_unique_field_config
const fkConfig=require('../model/mongo/fkConfig').fkConfig



/****************  公共函数  ********************/
// const misc=require('../function/assist/misc')
const arr=require('../function/assist/array')
const dataTypeCheck=require('../function/validateInput/validateHelper').dataTypeCheck

const ifEnoughResource_async=require(`./resourceCheck`).ifEnoughResource_async
/*************** 配置信息 *********************/
// const appSetting=require('../constant/config/appSetting').currentAppSetting


/****************  其他  ********************/
const inputRule=require('../constant/inputRule/inputRule').inputRule
const browserInputRule=require('../constant/inputRule/browserInputRule').browserInputRule

class InputValueLogicCheck{
    constructor({fieldName,fieldValue,userId,collName}){
        this.fieldName=fieldName
        this.fieldValue=fieldValue
        this.userId=userId
        this.collName=collName

        this.fieldRule=require('../constant/inputRule/inputRule').inputRule[collName][fieldName]
        this.fkConfig=require('../model/mongo/fkConfig').fkConfig[collName]

        this.isArray=dataTypeCheck.isArray(this.fieldRule[e_otherRuleFiledName.DATA_TYPE])
        this.isEnum=(undefined!==this.fieldRule[e_ruleFiledName.ENUM])
        //再获得数据类型
        if(true===this.isArray){
            this.dataType=this.fieldRule[e_otherRuleFiledName.DATA_TYPE][0]
        }else if(false===this.isArray){
            this.dataType=this.fieldRule[e_otherRuleFiledName.DATA_TYPE]
        }else{
            this.dataType=inputValueLogicCheckError.getFieldDataTypeInfo.dataTypeUndefined({collName,fieldName})
        }
    }

    /**      检测外键是否存在    **/
    static async ifFkValueExist_async({fieldName,fieldValue,collName}){
        //fkConfig中有fk字段，且当前字段为fk
        if(undefined!==fkConfig[collName] && undefined!==fkConfig[collName][fieldName]){
            //外键值不空，才进行 是否存在/权限 的检测
            if(false===dataTypeCheck.isEmpty(fieldValue)){
                let collFkConfig=fkConfig[collName]
                let collFieldChineseName=e_chineseName[collName]
                let fkFieldRelatedColl=collFkConfig[fieldName]['relatedColl']
                let fkCollOwnerFields=collFkConfig[fieldName]['fkCollOwnerFields']
                let chineseName=collFieldChineseName[fieldName]

                let condition //查询外键记录的条件
                let fkRecordNum //外键记录的数量

                //主表中field类型是否为array
                if(true===dataTypeCheck.isArray(inputRule[collName][fieldName][e_otherRuleFiledName.DATA_TYPE]){
                    condition={
                        '_id':{'$in':fieldValue}
                    }
                    //如果有额外判定条件，需要加入
                    if(undefined!==collFkConfig[fieldName][`validCriteria`]){
                        condition=Object.assign(condition,collFkConfig[fieldName][`validCriteria`])
                    }
                    fkRecordNum=await  common_operation_model.count_async({dbModel:e_dbModel[fkFieldRelatedColl],condition:condition})
                    if(fkRecordNum!==fieldValue.length){
                        return Promise.reject(inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.fkValueNotExist(chineseName,fieldValue))
                    }
                }
                //非array
                else{
                    condition={
                        '_id':fieldValue

                    }
                    //如果有额外判定条件，需要加入
                    if(undefined!==collFkConfig[fieldName][`validCriteria`]){
                        condition=Object.assign(condition,collFkConfig[fieldName][`validCriteria`])
                    }
                    fkRecordNum=await  common_operation_model.count_async({dbModel:e_dbModel[fkFieldRelatedColl],condition:condition})
                    if(fkRecordNum!==1){
                        return Promise.reject(inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.fkValueNotExist(chineseName,fieldValue))
                    }
                }
            }
        }
        //不是fk或者fk检测存在，直接返回true
        return Promise.resolve(true)
    }
}
/********************************************/
/******    获得字段的数据类型信息     *******/
/********************************************/
//@fieldDataTypeDefinition；单个字段的(整个)定义
//@collName,fieldName: 为错误提供信息
function getFieldDataTypeInfo({fieldRule,collName,fieldName}) {
    let dataTypeInfo={
        [e_dataTypeInfoFieldName.DATA_TYPE]:undefined,
        [e_dataTypeInfoFieldName.IS_ARRAY]:false,
        [e_dataTypeInfoFieldName.IS_ENUM]:false,
    }
    //首先判断是否为array
    dataTypeInfo[e_dataTypeInfoFieldName.IS_ARRAY]=dataTypeCheck.isArray(fieldRule[e_otherRuleFiledName.DATA_TYPE])
    //再获得数据类型
    if(true===dataTypeInfo[e_dataTypeInfoFieldName.IS_ARRAY]){
        dataTypeInfo[e_dataTypeInfoFieldName.DATA_TYPE]=fieldRule[e_otherRuleFiledName.DATA_TYPE][0]
    }else if(false===dataTypeInfo[e_dataTypeInfoFieldName.IS_ARRAY]){
        dataTypeInfo[e_dataTypeInfoFieldName.DATA_TYPE]=fieldRule[e_otherRuleFiledName.DATA_TYPE]
    }else{
        return inputValueLogicCheckError.getFieldDataTypeInfo.dataTypeUndefined({collName,fieldName})
    }
    //获得isEnum
    dataTypeInfo[e_dataTypeInfoFieldName.IS_ENUM]  =  (undefined!==fieldRule[e_ruleFiledName.ENUM])

    return {rc:0,msg:dataTypeInfo}
}

//根据fkConfig中fkCollOwnerFields的设置，判断外键记录的owner，是否为userId（当前用户），以便决定是否有权限进行操作
async function ifFkHasPriority_async({fieldName,fieldValue,userId,collName}){
    //需要在fkConfig中有定义，才能进行权限检查
    if(undefined!==fkConfig[collName] && undefined!==fkConfig[collName][fieldName]){
        let collFkConfig=fkConfig[collName]
        let collFieldChineseName=e_chineseName[collName]

        // for(let singleFkFieldName in collFkConfig){
        let chineseName=collFieldChineseName[fieldName]

        let fkFieldRelatedColl=collFkConfig[fieldName]['relatedColl']
        let fkCollOwnerFields=collFkConfig[fieldName]['fkCollOwnerFields']


        //fkConfig中fkCollOwnerFields设置了，才需要权限检查
        if(undefined!==fkCollOwnerFields && 0<fkCollOwnerFields.length && undefined!==userId){
            let condition //查找外键记录的条件

            //主表中field类型是否为array
            if(true===dataTypeCheck.isArray(inputRule[collName][fieldName][e_otherRuleFiledName.DATA_TYPE]){
                condition={
                    '_id':{'$in':fieldValue}
                }
            }else{
                condition={
                    '_id':fieldValue
                }
            }
            //如果有额外判定条件，需要加入
            if(undefined!==collFkConfig[fieldName][`validCriteria`]){
                condition=Object.assign(condition,collFkConfig[fieldName][`validCriteria`])
            }

            //根据条件查找外键记录，返回数组（以便后续处理）
            let fkRecord=await common_operation_model.find_returnRecords_async({dbModel:e_coll[fkFieldRelatedColl],condition:condition})

            for(let singleFkRecord of fkRecord){
                //对每个owner字段都要检查
                for(let singleFkOwnerFieldName of fkCollOwnerFields){
                    //外键记录中，owner字段的类型
                    let fkCollFieldDataType=inputRule[fkFieldRelatedColl][singleFkOwnerFieldName][e_otherRuleFiledName.DATA_TYPE]
                    //如果外键记录中，owner字段的类型是数组
                    if(true===dataTypeCheck.isArray(fkCollFieldDataType)){
                        //数组中不包括当前用户
                        if(-1===singleFkRecord[singleFkOwnerFieldName].indexOf(userId)){
                            return Promise.reject(inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.notHasPriorityForFkField(chineseName,fieldValue))
                        }
                    }
                    //不是数组
                    else{
                        if(userId!==singleFkRecord[singleFkOwnerFieldName].toString()){
                            return Promise.reject(inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.notHasPriorityForFkField(chineseName,fieldValue))
                        }
                    }
                }
            }

        }
    }
}
/*      检测外键是否存在,且用户是否在外键对应记录的owner中（有权操作）
 * @fieldName；待检测的记录的字段名称
 * @fieldValue；待检测的记录的字段值
 * @userId; 当前请求的用户的id，用来判断相应外键对应的记录，是否允许此用户操作
 * @collName: 用来提取fkConfig和chineseName
 * return：存在: {rc:0}   不存在：helperError.fkValueNotExist
 * */
async function ifFkValueExist_And_FkHasPriority_async({fieldName,fieldValue,userId,collName}){
    //coll中有fk字段，且当前字段为fk
    if(undefined!==fkConfig[collName] && undefined!==fkConfig[collName][fieldName]){
        let collFkConfig=fkConfig[collName]
        let collFieldChineseName=e_chineseName[collName]

        // for(let singleFkFieldName in collFkConfig){
        let chineseName=collFieldChineseName[fieldName]
        // let fieldInputValue=docValue[fieldName]

        //外键值不空，才进行 是否存在/权限 的检测
        if(false===dataTypeCheck.isEmpty(fieldValue)){
            // let fieldValue=docValue[singleFkFieldName]
            let fkFieldRelatedColl=collFkConfig[fieldName]['relatedColl']
            let fkCollOwnerFields=collFkConfig[fieldName]['fkCollOwnerFields']

            let tmpResult
            //如果查询外键是否存在，需要额外的条件，需要使用find
            if(undefined===collFkConfig[fieldName][`validCriteria`]){
                tmpResult=await  common_operation_model.findById_returnRecord_async({dbModel:e_dbModel[fkFieldRelatedColl],id:fieldValue})
            }else{
                //validCriteria中加上id的查询条件
                collFkConfig[fieldName][`validCriteria`]['_id']=fieldValue
                tmpResult=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel[fkFieldRelatedColl],condition:collFkConfig[fieldName][`validCriteria`]})
            }
            // ap.wrn('collFkConfig',collFkConfig)
            // ap.wrn('fieldName',fieldName)
            // ap.wrn('collFkConfig[fieldName]',collFkConfig[fieldName])
            // console.log(`collFkConfig =========>${JSON.stringify(collFkConfig)}`)
            // console.log(`collFkConfig[singleFkFieldName]['validCriteria'] =========>${JSON.stringify(collFkConfig[singleFkFieldName]['validCriteria'])}`)
            // console.log(`fk value exit check =========>${JSON.stringify(tmpResult)}`)
            if(null===tmpResult || tmpResult.length===0){

                return Promise.reject(inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.fkValueNotExist(chineseName,fieldValue))
                // return Promise.resolve({rc:0,msg:false})
            }

            /*************   外键对应的记录，当前用户是否有权使用（例如，用户创建文集，使用的文档的作者是否为自己） *****************/
            //根据是否设置了validCriteria，可能调用findById或者find，所以需要判断采用什么方式调用查询到的外键记录
            let fkRecord= dataTypeCheck.isArray(tmpResult) ? tmpResult[0]:tmpResult
            //fk有对应记录，且userId不为空，则进行权限（owner）检查
            if(undefined!==fkCollOwnerFields && 0<fkCollOwnerFields.length && undefined!==userId){
                //对每个字段都要检查
                for(let singleFkOwnerFieldName of fkCollOwnerFields){
                    let fkCollFieldDataType=inputRule[fkFieldRelatedColl][singleFkOwnerFieldName][e_otherRuleFiledName.DATA_TYPE]
                    //如果外键字段的类型是数组
                    if(true===dataTypeCheck.isArray(fkCollFieldDataType)){
                        //数组中不包括当前用户
                        if(-1===fkRecord[singleFkOwnerFieldName].indexOf(userId)){
                            return Promise.reject(inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.notHasPriorityForFkField(chineseName,fieldValue))
                        }
                    }
                    //不是数组
                    else{
                        if(userId!==fkRecord[singleFkOwnerFieldName].toString()){
                            return Promise.reject(inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.notHasPriorityForFkField(chineseName,fieldValue))
                        }
                    }
                }
            }

        }
    }

    // }
    // }

    return Promise.resolve(true)
}

/*      如果某个字段是enum，且type为数组（单纯为数组可以重复），那么检查字段值是否有重复（例如，分配给admin_user的priority，其中权限就不能重复）
*
* @fieldName,fieldValue：待检查字段的名称和值
* @fieldDataTypeInfo: 字段数据类型信息（dataType,isArray,isEnum）
*
* @fieldRule：待检查字段的整个rule定义
* @collName: 为了保持格式整齐，且父函数inputValueLogicValidCheck_async尽可能少的参数，使用collName，而不是
*
* return: {rc:0}: 任意一个enum+array的字段有重复；{rc!==0}：所有enum+array的字段值皆无重复
*
* */
function ifEnumHasDuplicateValue({fieldName,fieldValue,fieldDataTypeInfo}){
    // console.log(`in`)
/*    let collRule=inputRule[collName]
    if(undefined===collRule){
        return checkerError.ifEnumHasDuplicateValue.collRuleNotDefinedCantCheckEnumArray
    }
    //无记录，直接返回正确结果（无需检查）
    if(undefined===collValue){
        return {rc:0}
    }*/
    // console.log(`1`)
    // for(let singleFieldName in collValue){
        //字段有type和enum定义，且type值为数组
        // let singleFieldRule=collRule[singleFieldName]
        // if(undefined===fieldRule){
        //     return checkerError.ifEnumHasDuplicateValue.fieldInValueNoMatchedRule({fieldName:singleFieldName})
        // }
    if(true===fieldDataTypeInfo[e_dataTypeInfoFieldName.IS_ENUM] && true===fieldDataTypeInfo[e_dataTypeInfoFieldName.IS_ARRAY]){
        return arr.ifArrayHasDuplicate(fieldValue)
        // if(true===fieldResult){
        //     return
        // }
    }
        // if(undefined!==fieldRule[e_serverRuleType.ENUM] && undefined!==fieldRule[e_otherRuleFiledName.DATA_TYPE] && fieldRule[e_otherRuleFiledName.DATA_TYPE] instanceof Array){
        //     //字段rule满足条件的情况下，字段值存在，则进行检查
        //     // if(undefined!==collValue[singleFieldName]){
        //
        //     // }
        // }
    // }
    // console.log(`2`)
    // return {rc:0}
}

/*/!*      enum字段的值，是否为预订的值
* *!/
function ifEnumValueValid({fieldName,fieldValue,fieldDataTypeInfo}){

    if(true===fieldDataTypeInfo[e_dataTypeInfoFieldName.IS_ENUM]){
        let fieldEnumValue=enumValue[fieldName]
        if(true===fieldDataTypeInfo[e_dataTypeInfoFieldName.IS_ARRAY]){

        }else{
            if(-1===fieldEnumValue.indexOf(fieldValue)){
                return Promise.reject()
            }
        }
    }
}*/
//singleValueUniqueCheckAdditionalCondition: 对整个docValue进行检查时，额外需要的检测条件  {field: value1,field2:value2}
//对传入的docValue中的每个字段进行unique的检测
async function ifSingleFieldValueUnique_async({fieldName,fieldValue,collName,singleValueUniqueCheckAdditionalCondition}){
    // ap.inf('[collName]',collName)
    // ap.inf('[e_uniqueField]',e_uniqueField)
    // ap.inf('fieldName',fieldName)
    // ap.inf('e_uniqueField[collName]',e_uniqueField[collName])
    if(undefined!==e_uniqueField[collName] && -1!==e_uniqueField[collName].indexOf(fieldName)){
        // for(let singleFieldName of e_uniqueField[collName]){

            // if(-1!==e_uniqueField[collName].indexOf(singleFieldName)){

            let condition = {}
            //field value不能为空（undefined/null/""/{}），才能作为查询条件
            if(false===dataTypeCheck.isEmpty(fieldValue)){
                condition[fieldName]=fieldValue
            }
        // ap.inf('single field unique check condition',condition)
            //对应的字段有额外的检测条件
            if(undefined!==singleValueUniqueCheckAdditionalCondition ){
                for(let singleFieldName in singleValueUniqueCheckAdditionalCondition){
                    condition[singleFieldName]=singleValueUniqueCheckAdditionalCondition[singleFieldName]
                }

            }
// ap.inf('single field unique check condition',condition)
            //查询条件不为空，才进行find
            if(false===dataTypeCheck.isEmpty(condition)){
                let uniqueCheckResult = await common_operation_model.find_returnRecords_async({dbModel: e_dbModel[collName], condition: condition})
                // ap.inf('single field unique match result',uniqueCheckResult)
                if(uniqueCheckResult.length>0){
                    let chineseName=e_chineseName[collName][fieldName]


                    //fieldValue:只供user/account使用，用来区分是phone还是email
                    // ap.wrn('chineseName',chineseName)
                    // ap.wrn('fieldValue',fieldValue)
                    return Promise.reject(inputValueLogicCheckError.ifSingleFieldValueUnique_async.fieldValueNotUnique({collName:collName,fieldName:fieldName,fieldChineseName:chineseName,fieldValue:fieldValue}))
                }
            }

            // }
        // }
    }

    // }
    return Promise.resolve(true)
}

/*
* @expectedXSSFields: 数组。默认会对所有数据类型为string的字段进行check，如果设置了expectedFields，字段还的必须位于expectedFields中
* */
function ifValueXSS({fieldDataTypeInfo,fieldName,fieldValue,expectedXSSFields}){
    // ap.inf('ifValueXSS in')
    // ap.inf('fieldName in',fieldName)
    // ap.inf('fieldValue',fieldValue)
    // ap.inf('expectedXSSFields',expectedXSSFields)
    // fieldName
    //如果不是string，无需XSS
    if(fieldDataTypeInfo[e_dataTypeInfoFieldName.DATA_TYPE]!==e_serverDataType.STRING){
        return {rc:0}
    }
    //如果设定了特定需要XSS的字段
    if(undefined!==expectedXSSFields && expectedXSSFields.length>0){
        if(-1===expectedXSSFields.indexOf(fieldName)){
            return {rc:0}
        }
    }
    // ap.inf('1')
    //字段值不能为空
    if(true===dataTypeCheck.isEmpty(fieldValue)){
        return {rc:0}
    }
    // ap.inf('2')
    //如果字段是数组，遍历数组
    if(true===fieldDataTypeInfo[e_dataTypeInfoFieldName.IS_ARRAY]){
        // ap.wrn('field is array')
        for(let singleEle of fieldValue){
            // ap.wrn('singleEle',singleEle)
            // ap.wrn('DOMPurify.sanitize(singleEle)',DOMPurify.sanitize(singleEle))
            // ap.wrn('typeof DOMPurify.sanitize(singleEle)',typeof DOMPurify.sanitize(singleEle))
            // ap.wrn('DOMPurify.sanitize(singleEle)!==singleEle',DOMPurify.sanitize(singleEle)!==singleEle)
            if(DOMPurify.sanitize(singleEle)!==singleEle){
                return true
            }
        }
        return false
    }else{
        // ap.inf('3')
        // ap.inf('DOMPurify.sanitize(fieldValue)',DOMPurify.sanitize(fieldValue))
        return DOMPurify.sanitize(fieldValue)!==fieldValue
    }

    // return true
}


/*          复合字段是否为unique
//因为可能需要返回存在的记录做进一步的处理，所以不能简单的返回true/false，而是{rc,msg}的格式，且全部为resolve，防止reject直接跳出
* @collName:对那个coll进行复合字段的unique检测
* @docValue：待检测的数据
*
* return：如果已经存在重复记录：如果重复记录数>1，报错；如果=1,返回存在的记录（以便后续操作）；没有重复记录，返回false
* */
async function ifCompoundFiledValueUnique_returnExistRecord_async({collName,docValue,compoundFiledValueUniqueCheckAdditionalCheckCondition}){
    //coll有对应的复合字段配置，才进行unique的检测

    if(undefined!==compound_unique_field_config[collName]){
        let collConfig=compound_unique_field_config[collName]
        // console.log(`collConfig===========>${JSON.stringify(collConfig)}`)
        for(let singleCompoundFieldName in collConfig){
            let singleCompound=collConfig[singleCompoundFieldName]
            // console.log(`singleCompound===========>${JSON.stringify(singleCompound)}`)
            // ap.inf('singleCompound',singleCompound)
            let condition={},allCompoundFiledAvailable=true
            //检测复合字段的每个字段都有值
            // let singleCompoundFields=Object.keys(singleCompound)
            for(let singleField of singleCompound['fields']){
                //复合字段中，如果某个字段，在docValue没有设置值，直接忽略
                //因为在mongo中，某个字段不需要值，直接unset，而不是设成null等，所以如果传入的带检测值有空字段，直接忽略unqique检测
                // console.log(`docValue[${singleField}] ===========>${JSON.stringify(docValue[singleField] )}`)
                // console.log(`typeof docValue[${singleField}] ===========>${JSON.stringify(typeof docValue[singleField] )}`)
                // ap.wrn('docValue',docValue)
                // ap.wrn('singleField',singleField)
                // ap.wrn('docValue[singleField]',docValue[singleField])
                if(true===dataTypeCheck.isEmpty(docValue[singleField])){
                    allCompoundFiledAvailable=false
                    break
                }
                //只需要获得docValue中复合字段的值
                condition[singleField]=docValue[singleField]
            }
            //检查单个compound field是否unique
            // ap.wrn('allCompoundFiledAvailable',allCompoundFiledAvailable)
            if(true===allCompoundFiledAvailable){
                //检查是否需要额外的查询条件(除了docValue中字段作为查询值，是否还需要其他  {字段:值}  作为查询值)
                if(undefined!==compoundFiledValueUniqueCheckAdditionalCheckCondition){
                    for(let singleFieldName in compoundFiledValueUniqueCheckAdditionalCheckCondition){
                        if(undefined!==compoundFiledValueUniqueCheckAdditionalCheckCondition[singleFieldName]){
                            Object.assign(condition,compoundFiledValueUniqueCheckAdditionalCheckCondition[singleFieldName])
                        }
                    }
                }

                // ap.wrn('Compound condition',condition)
                if(false===dataTypeCheck.isEmpty((condition))){
                    let results=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel[collName],condition:condition})
                    // console.log(`compound result=============>${JSON.stringify(results)}`)
                    // ap.wrn('compound result',results)
                    if(results.length>0){
                        return Promise.reject( checkerError.compoundFieldHasMultipleDuplicateRecord({collName:collName,singleCompoundFieldName:singleCompoundFieldName}))
                    }
                    if(results.length===1){
                        return Promise.resolve(results)
                    }
                }
            }
        }
        return Promise.resolve(true)
    }

}


/*******************************************************************************************/
/**************************              主函数              ******************************/
/*******************************************************************************************/
/*@commonParam: {docValue,userId,collName}
* @stepParam:{stepName:{flag:true/false, optionalParam:{}}}
* */
/* 对输入的值进行逻辑（而不是格式）检查：只能用于create和update
* 1. 如果有外键（通过model->mongo->fkConfig中判断，必须和rule中定义的一致），外键是否对应有效的记录
* 2. 如果是enum+array，数组不能有重复值
* 3. 如果field value是单个值，且是unique（constant->genEnum->DB_uniqueField，从model定义中自动生成），检查unique
* 4. 如果有多个字段组成的unique（model->mongo->compound_unique_field_config，手工生成，无法自动），检查unique
* */
/*async function  inputValueLogicValidCheck_async({
                                                    docValue,userId,collName,skipStep,
                                                    singleValueUniqueCheckAdditionalCondition,compoundFiledValueUniqueCheckAdditionalCheckCondition,
                                                    expectedXSSFields,resourceUsageOption}){*/
// docValue,userId,collName,skipStep,singleValueUniqueCheckAdditionalCondition,compoundFiledValueUniqueCheckAdditionalCheckCondition,expectedXSSFields,resourceUsageOption
async function  inputValueLogicValidCheck_async({commonParam,stepParam}){
    // ap.inf('commonParam',commonParam)
    let {docValue,userId,collName}=commonParam
    let tmpResult
    let collRule=browserInputRule[collName]

    //保护代码，如果docValue为空，则无需测试。后面的某些函数，例如compound unique检查，并未对docValue是否为空进行检查
    if(false===dataTypeCheck.isSetValue(docValue) || true===dataTypeCheck.isEmpty(docValue)){
        return Promise.resolve()
    }
    // ap.inf('docValue not empty')
    //创建显式flag，默认true，即都要执行
    let runStepFlag={
        [e_inputValueLogicCheckStep.FK_EXIST_AND_PRIORITY]:true,
        [e_inputValueLogicCheckStep.ENUM_DUPLICATE]:true,
        [e_inputValueLogicCheckStep.SINGLE_FIELD_VALUE_UNIQUE]:true,
        [e_inputValueLogicCheckStep.XSS]:true,

        // [e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]:true,//在internal之后执行
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:true,
    }
    if(undefined!==stepParam){
        for(let singleStepName in stepParam){
            if(undefined!==stepParam[singleStepName] && undefined!==stepParam[singleStepName]['flag'])
                runStepFlag[singleStepName]=stepParam[singleStepName]['flag']
        }
    }
// ap.inf('after check runStep',runStepFlag)
//     ap.inf('docValue',docValue)
    // ap.inf('single field loop check start')
    //将循环放在最外层，避免每个函数执行循环
    for(let singleFieldName in docValue){
        // ap.inf('single check in')
        let singleFieldValue=docValue[singleFieldName]
        let fieldDataTypeInfo
        //字段在collRule中不存在，直接跳过。（可能是因为field值为null，导致被放入key=>$unset之中）
        if(undefined===collRule[singleFieldName]){
            continue
        }
        /*******************************************************************************************/
        /**************************       获得dataTypeInfo            ******************************/
        /*******************************************************************************************/
        let fieldDataTypeResult=getFieldDataTypeInfo({fieldName:singleFieldName,fieldRule:collRule[singleFieldName]})
        if(fieldDataTypeResult.rc>0){
            return Promise.reject(fieldDataTypeResult)
        }
        fieldDataTypeInfo=fieldDataTypeResult.msg
// ap.inf('getFieldDataTypeInfo result',fieldDataTypeInfo)
        /*******************************************************************************************/
        /******************          fk value exists and owner check                    ************/
        /*******************************************************************************************/
        if(true===runStepFlag[e_inputValueLogicCheckStep.FK_EXIST_AND_PRIORITY]){
            await ifFkValueExist_And_FkHasPriority_async({fieldName:singleFieldName,fieldValue:singleFieldValue,userId:commonParam.userId,collName:commonParam.collName})
        }
        // ap.inf('ifFkValueExist_And_FkHasPriority_async done')
        /*******************************************************************************************/
        /******************              enum(array) unique check                       ************/
        /*******************************************************************************************/
        if(true===runStepFlag[e_inputValueLogicCheckStep.ENUM_DUPLICATE]) {
            tmpResult = ifEnumHasDuplicateValue({
                fieldName:singleFieldName,
                fieldValue:singleFieldValue,
                fieldDataTypeInfo:fieldDataTypeInfo,
            })
            // console.log(`duplicate check result ==========> ${JSON.stringify(tmpResult)}`)
            if (tmpResult===true) {
                return Promise.reject(inputValueLogicCheckError.ifEnumHasDuplicateValue.containDuplicateValue({fieldName:singleFieldName}))
            }
        }
        // ap.inf('ifEnumHasDuplicateValue done')
        /*******************************************************************************************/
        /******************          single field value unique check                    ************/
        /*******************************************************************************************/
        if(true===runStepFlag[e_inputValueLogicCheckStep.SINGLE_FIELD_VALUE_UNIQUE]) {
// ap.inf('SINGLE_FIELD_VALUE_UNIQUE in')

            await ifSingleFieldValueUnique_async({
                fieldName:singleFieldName,
                fieldValue:singleFieldValue,
                collName:collName,
                singleValueUniqueCheckAdditionalCondition:stepParam[e_inputValueLogicCheckStep.SINGLE_FIELD_VALUE_UNIQUE]['optionalParam']['singleValueUniqueCheckAdditionalCondition'],
            })
        }
        // ap.inf('ifSingleFieldValueUnique_async done')

        /*******************************************************************************************/
        /******************                      XSS check                              ************/
        /*******************************************************************************************/
        if(true===runStepFlag[e_inputValueLogicCheckStep.XSS]) {
            tmpResult=ifValueXSS({
                fieldDataTypeInfo:fieldDataTypeInfo,
                fieldName:singleFieldName,
                fieldValue:singleFieldValue,
                expectedXSSFields:stepParam[e_inputValueLogicCheckStep.XSS]['optionalParam']['expectedXSSFields'],
            })
            if(true===tmpResult){
                return Promise.reject(inputValueLogicCheckError.ifValueXSS.fieldValueXSS({fieldName:singleFieldName}))
            }
        }
        // ap.inf('ifValueXSS done')
    }
    // ap.inf('single field loop check end')

    /****        在internal之后执行       ***/
/*    /!*******************************************************************************************!/
    /!******************          compound field value unique check                  ************!/
    /!*******************************************************************************************!/
    if(true===runStepFlag[e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]) {
        await ifCompoundFiledValueUnique_returnExistRecord_async({
            collName:collName,
            docValue:docValue,
            additionalCheckCondition:stepParam[e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]['optionalParam']['compoundFiledValueUniqueCheckAdditionalCheckCondition'],
        })
    }*/
    // ap.inf('CompoundFiledValueUnique end')
    /*******************************************************************************************/
    /******************                   resource usage check                         ************/
    /*******************************************************************************************/
    if(true===runStepFlag[e_inputValueLogicCheckStep.RESOURCE_USAGE]) {
        //user尚未登录，无需（法）检测resourceUsage
        if(undefined!==commonParam.userId){
            if(undefined!==stepParam[e_inputValueLogicCheckStep.RESOURCE_USAGE]['optionalParam']){
                let resourceUsageOption=stepParam[e_inputValueLogicCheckStep.RESOURCE_USAGE]['optionalParam']['resourceUsageOption']
                // ap.wrn('stepParam[e_inputValueLogicCheckStep.RESOURCE_USAGE][\'optionalParam\'][\'resourceUsageOption\']',stepParam[e_inputValueLogicCheckStep.RESOURCE_USAGE]['optionalParam']['resourceUsageOption'])
                await ifEnoughResource_async({
                    requiredResource:resourceUsageOption.requiredResource,//{num:xx,sizeInMb;yy,filesAbsPath:[]}
                    resourceProfileRange:resourceUsageOption.resourceProfileRange,
                    userId:commonParam.userId,
                    containerId:resourceUsageOption.containerId,
                    // filesAbsPath:resourceUsageOption.filesAbsPath,
                })
            }

        }

    }
    // ap.inf('EnoughResource end')
}

module.exports={
    // ifFkValueExist_And_FkHasPriority_async,//ifFkValueExist_async升级版，同时检查fk是否存在，fk对应的记录是否有权操作（同时操作，节省db操作）
    // ifEnumHasDuplicateValue,//数组是否可以包含重复值
    // ifSingleFieldValueUnique_async,//未使用ifFieldValueExistInColl_async，直接使用find方法对整个输入的字段进行unique检测
    // ifCompoundFiledValueUnique_returnExistRecord_async,
    ifCompoundFiledValueUnique_returnExistRecord_async,//需要检查internal+browser之后的docValue
    inputValueLogicValidCheck_async,
}