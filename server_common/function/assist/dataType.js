/**
 * Created by 张伟 on 2018/12/11.
 */
'use strict'
/*************  3rd   **************/
const ap=require('awesomeprint')
/**************  错误常量  **************/
const dataTypeError=require('../../constant/error/assistError').dataTypeError

const e_otherRuleFiledName=require('../../constant/enum/inputDataRuleType').OtherRuleFiledName
const e_serverDataType=require('../../constant/enum/inputDataRuleType').ServerDataType
/****************  常量 ********************/
const regex=require('../../constant/regex/regex').regex
/**************  常用函数  **************/
const dataTypeCheck=require('../../function/validateInput/validateHelper').dataTypeCheck

/**     根据rule判断当前字段是否为objectId，是否为array**/
function ifFieldDataTypeObjectId({fieldRule}){
    // ap.wrn('ifFieldDataTypeObjectId -1')
    let fieldRuleDataTypeDefinition,ifArray=false
    // ap.wrn('ifFieldDataTypeObjectId 0')
    if(undefined===fieldRule[e_otherRuleFiledName.DATA_TYPE]){
        return dataTypeError.ifFieldDataTypeObjectId.ruleTypeNotDefine
    }
// ap.wrn('ifFieldDataTypeObjectId 1')
    //如果是array
    if(true===dataTypeCheck.isArray(fieldRule[e_otherRuleFiledName.DATA_TYPE])){
        ifArray=true
        fieldRuleDataTypeDefinition=fieldRule[e_otherRuleFiledName.DATA_TYPE][0]
    }else{
        fieldRuleDataTypeDefinition=fieldRule[e_otherRuleFiledName.DATA_TYPE]
    }
    // ap.wrn('ifFieldDataTypeObjectId 2')
    return {rc:0,msg:{ifArray:ifArray,ifObjectId:fieldRuleDataTypeDefinition===e_serverDataType.OBJECT_ID}}
    /*fieldDataTypeIsArray=dataTypeCheck.isArray(fieldRuleDefinition)
    let fieldDataType=fieldDataTypeIsArray ? fieldRuleDefinition[0]:fieldRuleDefinition
    // ap.inf('fieldDataType',fieldDataType)
    if(e_serverDataType.OBJECT_ID===fieldDataType){
        // ap.inf('fieldDataType is objId')
        fieldDataTypeIsObjectId=true
    }*/
}


/**     判断某个值是否是加密过的objectId    **/
function ifObjectIdEncrypted({objectId}){
    return regex.encryptedObjectId.test(objectId)
}

/**     判断某个值是否是objectId    **/
function ifObjectId({objectId}){
    // ap.wrn('typeof objectId',typeof objectId)
    return typeof objectId === 'string' && regex.objectId.test(objectId)
}

module.exports={
    ifFieldDataTypeObjectId,
    ifObjectIdEncrypted,
    ifObjectId,

}