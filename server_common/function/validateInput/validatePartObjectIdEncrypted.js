/**
 * Created by 张伟 on 2018/12/11.
 * 验证part中，如果数据类型是objectId，那么是否加密过
 * 从 controller/controllerChecker/ifObjectIdInPartEncrypted_async中抽取出来，变成单独函数，供ifObjectIdInPartEncrypted_async调用
 */
'use strict'
/****************  3rc ********************/
const ap=require('awesomeprint')
/****************  枚举常量 ********************/
const nodeEnum=require(`../../constant/enum/nodeEnum`)
const e_subField=nodeEnum.SubField
const e_part=nodeEnum.ValidatePart
const e_chooseFriendInfoFieldName=nodeEnum.ChooseFriendInfoFieldName

const e_otherRuleFiledName=require('../../constant/enum/inputDataRuleType').OtherRuleFiledName
const e_ruleFiledName=require('../../constant/enum/inputDataRuleType').RuleFiledName


/****************  错误定义 ********************/
const validatePartObjectIdEncryptedError=require('../../constant/error/validateError').validatePartObjectIdEncrypted

/****************  rule ********************/
const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule
/****************  公共函数  ********************/
// const misc=require('../function/assist/misc')
// const arr=require('../function/assist/array')
const dataTypeCheck=require('../validateInput/validateHelper').dataTypeCheck
const ifFieldDataTypeObjectId=require('../../function/assist/dataType').ifFieldDataTypeObjectId
const ifObjectIdEncrypted=require('../../function/assist/dataType').ifObjectIdEncrypted
const rightResult={rc:0}



function validateEditSubField({req,browserCollRule,applyRange}){
    let tmpResult
    //part value空，直接结束
    if(false===dataTypeCheck.isSetValue(req.body.values[e_part.EDIT_SUB_FIELD])){
        return rightResult
    }
    let partValue=req.body.values[e_part.EDIT_SUB_FIELD]

    for(let singleFieldName in partValue){
        //part中单个字段的value为空，跳过
        if(false===dataTypeCheck.isSetValue(partValue[singleFieldName])){
            continue
        }
        //检查from/to recordId格式是否正确
        if(undefined!==partValue[singleFieldName][e_subField.FROM]){
            if(false===ifObjectIdEncrypted({objectId:partValue[singleFieldName][e_subField.FROM]})){
                return validatePartObjectIdEncryptedError.validateEditSubField.editSubFromIsInvalidEncryptedObjectId
            }
        }
        if(undefined!==partValue[singleFieldName][e_subField.TO]){
            if(false===ifObjectIdEncrypted({objectId:partValue[singleFieldName][e_subField.TO]})){
                return validatePartObjectIdEncryptedError.validateEditSubField.editSubToIsInvalidEncryptedObjectId
            }
        }
        if(undefined!==partValue[singleFieldName][e_subField.ELE_ARRAY] && true===dataTypeCheck.isArray(partValue[singleFieldName][e_subField.ELE_ARRAY]) ){

            //设置为false
            let ifArray=false,ifObjectId=false
            //获得field的数据类型，前提是field rule存在且field value存在（没有fieldValue就无需进行检测）
            if(undefined!==browserCollRule[singleFieldName]){
                if(true===dataTypeCheck.isSetValue(partValue[singleFieldName])) {
                    tmpResult=ifFieldDataTypeObjectId({fieldRule:browserCollRule[singleFieldName]})
                    ifArray=tmpResult['msg']['ifArray']
                    ifObjectId=tmpResult['msg']['ifObjectId']
                }
            }

            //如果数据类型是objectId
            if(true===ifObjectId){
                //2018-07-04：传入的applyRange是否是rule中applyRange中
                if(-1===browserCollRule[singleFieldName][e_otherRuleFiledName.APPLY_RANGE].indexOf(applyRange)){
                    return validatePartObjectIdEncryptedError.common.fieldNotMatchApplyRange
                }
                //数组，对每个元素进行判别
                // if(true===dataTypeArrayFlag){
                //必定是数组，数组可以为空
                let eleArrayValue=partValue[singleFieldName][e_subField.ELE_ARRAY]
                if( eleArrayValue.length>0){
                    //2018-07-04: 如果有ARRAY_MAX_LENGTH，要检查长度
                    if(undefined!==browserCollRule[singleFieldName][e_ruleFiledName.ARRAY_MAX_LENGTH]){
                        //复用validateValue中的error
                        let fieldRule=browserCollRule[singleFieldName]//,fieldValue=partValue[singleFieldName]
                        let maxLengthDefine=fieldRule[e_ruleFiledName.ARRAY_MAX_LENGTH]['define']
                        if(eleArrayValue.length>maxLengthDefine){
                            return validatePartObjectIdEncryptedError.validateEditSubField.editSubEleArrayLengthExceed
                        }
                    }
                    //检查objectId的format
                    for(let singleEle of eleArrayValue){
                        // let singleEle=eleArrayValue[idx]
                        if(false===ifObjectIdEncrypted({objectId:singleEle})){
                            return validatePartObjectIdEncryptedError.validateEditSubField.editSubEleArrayIsInvalidEncryptedObjectId
                        }
                    }
                }
                // }else{
                //     if(false===ifObjectIdEncrypted({objectId:partValue[singleFieldName]})){
                //         return checkerError.ifObjectIdEncrypted.recordInfoContainInvalidObjectId
                //     }
                // }
            }
        }
    }
    return rightResult
}

function validateManipulateArray({req,browserCollRule,applyRange}){
    let tmpResult
    if(false===dataTypeCheck.isSetValue(req.body.values[e_part.MANIPULATE_ARRAY])){
        return rightResult
    }
    let partValue=req.body.values[e_part.MANIPULATE_ARRAY]

    for(let singleFieldName in partValue){
        //空值无需检测是否加密objectId
        if(false===dataTypeCheck.isSetValue(partValue[singleFieldName])){
            continue
        }

        //字段有对应的rule，且字段值设置
        let ifArray=false,ifObjectId=false
        if(undefined!==browserCollRule[singleFieldName] ){
            //字段值不为空（空值交给后续代码处理，而不在解密代码中处理）
            if(true===dataTypeCheck.isSetValue(partValue[singleFieldName])){
                tmpResult=ifFieldDataTypeObjectId({fieldRule:browserCollRule[singleFieldName]})
                ifArray=tmpResult['msg']['ifArray']
                ifObjectId=tmpResult['msg']['ifObjectId']
                // ap.inf('dataType',dataType)
                //字段类型是objectId
                if(true===ifObjectId){
                    //2018-07-04：传入的applyRange是否是rule中applyRange中
                    // ap.wrn('before applyrange')
                    if(-1===browserCollRule[singleFieldName][e_otherRuleFiledName.APPLY_RANGE].indexOf(applyRange)){
                        return validatePartObjectIdEncryptedError.common.fieldNotMatchApplyRange
                    }
                    // ap.wrn('after applyrange')
                    //数据类型必定是数组

                    let fieldValue=partValue[singleFieldName]
                    let subKeyName=['add','remove']
                    //对每个部分进行检测
                    let fieldSubPartValue
                    for(let singleSubKeyName of subKeyName){
                        //add/remove 的值必须是数组，否则不做任何处理（而交给validateFormat处理）
                        if(undefined!==fieldValue[singleSubKeyName] && true===dataTypeCheck.isSetValue(fieldValue[singleSubKeyName]) && true===dataTypeCheck.isArray(fieldValue[singleSubKeyName])){
                            fieldSubPartValue=fieldValue[singleSubKeyName]
                            // 2018-07-04：add/remove数组需要检测长度
                            if(undefined!==browserCollRule[singleFieldName][e_ruleFiledName.ARRAY_MAX_LENGTH]){
                                //复用validateValue中的error
                                let fieldRule=browserCollRule[singleFieldName]//,fieldValue=partValue[singleFieldName]
                                let maxLengthDefine=fieldRule[e_ruleFiledName.ARRAY_MAX_LENGTH]['define']
                                // ap.wrn('maxLengthDefine',maxLengthDefine)
                                // ap.wrn('fieldSubPartValue',fieldSubPartValue)
                                if(fieldSubPartValue.length>maxLengthDefine){
                                    return validatePartObjectIdEncryptedError.validateManipulateArray.manipulateArraySubKeyLengthExceed(subPartKeyName)
                                }
/*                                if(false===valueMatchRuleDefineCheck({ruleType:e_serverRuleType.ARRAY_MAX_LENGTH,fieldValue:fieldSubPartValue,ruleDefine:maxLengthDefine})){
                                    return genInputError(fieldRule,e_serverRuleType.ARRAY_MAX_LENGTH)
                                }*/
                            }
                            if(fieldSubPartValue.length>0){
                                for(let singleEle of fieldSubPartValue){
                                    // ap.wrn('singleEle',singleEle)
                                    if(false===ifObjectIdEncrypted({objectId:singleEle})){
                                        return validatePartObjectIdEncryptedError.validateManipulateArray.manipulateArraySubKeyContainInvalidEncryptedObjectId(subKeyName)
                                    }
                                }
                            }
                        }
                    }

                    /*//add 的值必须是数组，否则不做任何处理（而交给validateFormat处理）
                    if(undefined!==fieldValue['add'] && true===dataTypeCheck.isSetValue(fieldValue['add']) && true===dataTypeCheck.isArray(fieldValue['add'])){
                        fieldSubPartValue=fieldValue['add']
                        // 2018-07-04：add/remove数组需要检测长度
                        if(undefined!==browserCollRule[singleFieldName][e_ruleFiledName.ARRAY_MAX_LENGTH]){
                            //复用validateValue中的error
                            let fieldRule=browserCollRule[singleFieldName]//,fieldValue=partValue[singleFieldName]
                            let maxLengthDefine=fieldRule[e_ruleFiledName.ARRAY_MAX_LENGTH]['define']
                            // ap.wrn('maxLengthDefine',maxLengthDefine)
                            // ap.wrn('fieldSubPartValue',fieldSubPartValue)
                            if(fieldSubPartValue.length>maxLengthDefine){

                            }
                            if(false===valueMatchRuleDefineCheck({ruleType:e_serverRuleType.ARRAY_MAX_LENGTH,fieldValue:fieldSubPartValue,ruleDefine:maxLengthDefine})){
                                return genInputError(fieldRule,e_serverRuleType.ARRAY_MAX_LENGTH)
                            }
                        }

                        if(fieldSubPartValue.length>0){
                            for(let singleEle of fieldSubPartValue){
                                // ap.wrn('singleEle',singleEle)
                                if(false===ifObjectIdCrypted({objectId:singleEle})){
                                    return checkerError.ifObjectIdCrypted.manipulateArraySubPartAddContainInvalidObjectId
                                }
                            }
                        }

                    }
                    //remove 的值必须是数组，否则不做任何处理（而交给validateFormat处理）
                    if(undefined!==fieldValue['remove'] && true===dataTypeCheck.isSetValue(fieldValue['remove']) &&  true===dataTypeCheck.isArray(fieldValue['remove'])){
                        fieldSubPartValue=fieldValue['remove']

                        // 2018-07-04：add/remove数组需要检测长度
                        if(undefined!==browserCollRule[singleFieldName][e_ruleFiledName.ARRAY_MAX_LENGTH]){
                            //复用validateValue中的error
                            let fieldRule=browserCollRule[singleFieldName]//,fieldValue=partValue[singleFieldName]
                            let maxLengthDefine=fieldRule[e_ruleFiledName.ARRAY_MAX_LENGTH]['define']
                            // ap.wrn('maxLengthDefine',maxLengthDefine)
                            if(false===valueMatchRuleDefineCheck({ruleType:e_serverRuleType.ARRAY_MAX_LENGTH,fieldValue:fieldSubPartValue,ruleDefine:maxLengthDefine})){
                                return genInputError(fieldRule,e_serverRuleType.ARRAY_MAX_LENGTH)
                            }
                        }

                        if(fieldSubPartValue.length>0){
                            for(let singleEle of fieldSubPartValue){
                                if(false===ifObjectIdCrypted({objectId:singleEle})){
                                    return checkerError.ifObjectIdCrypted.manipulateArraySubPartAddContainInvalidObjectId
                                }
                            }
                        }
                    }*/
                }
            }
        }
    }
    return rightResult
}
function validateRecordId({req}){
    // let tmpResult
    if(false===dataTypeCheck.isSetValue(req.body.values[e_part.RECORD_ID])){
        return rightResult
    }
    let partValue=req.body.values[e_part.RECORD_ID]
    // ap.wrn('partValue',partValue)
    if(false===ifObjectIdEncrypted({objectId:partValue})){
        // ap.wrn('false')
        return validatePartObjectIdEncryptedError.validateRecordId.recordIdIsInvalidEncryptedObjectId
    }
    return rightResult
}

function validateSingleField({req,browserCollRule,applyRange}){
    let tmpResult
    if(false===dataTypeCheck.isSetValue(req.body.values[e_part.SINGLE_FIELD])){
        return rightResult
    }
    let partValue=req.body.values[e_part.SINGLE_FIELD]


    let fieldName=Object.keys(partValue)[0]
    // ap.inf('fieldName',fieldName)
    // ap.wrn('browserCollRule',browserCollRule)
    // ap.wrn('browserCollRule[fieldName]',browserCollRule[fieldName])
    // ap.inf('dataTypeCheck.isSetValue(fieldName)',dataTypeCheck.isSetValue(fieldName))

    //fieldName是有效的（在rule中有定义，且字段值不为空）
    if(true===dataTypeCheck.isSetValue(partValue[fieldName]) && undefined!==browserCollRule[fieldName]){
        // let singleFieldValue=req.body.values[singlePart]
        //获得field的类型
        let ifArray=false,ifObjectId=false
        tmpResult=ifFieldDataTypeObjectId({fieldRule:browserCollRule[fieldName]})
        ifArray=tmpResult['msg']['ifArray']
        ifObjectId=tmpResult['msg']['ifObjectId']
        // ap.wrn('dataType',dataType)
        //字段类型是objectId
        if(true===ifObjectId){
            // ap.wrn('fieldName',fieldName)
            // ap.wrn('browserCollRule[fieldName]',browserCollRule[fieldName])
            // ap.wrn('browserCollRule[fieldName][e_otherRuleFiledName.APPLY_RANGE]',browserCollRule[fieldName][e_otherRuleFiledName.APPLY_RANGE])
            //2018-07-04：传入的applyRange是否是rule中applyRange中
            if(-1===browserCollRule[fieldName][e_otherRuleFiledName.APPLY_RANGE].indexOf(applyRange)){
                return validatePartObjectIdEncryptedError.common.fieldNotMatchApplyRange
            }
            //数据类型是数组，且传入的值也是数组
            if(true===ifArray && true===dataTypeCheck.isArray(partValue[fieldName])){
                //2018-07-04: 如果有ARRAY_MAX_LENGTH，要检查长度
                if(undefined!==browserCollRule[fieldName][e_ruleFiledName.ARRAY_MAX_LENGTH]){
                    //判断长度是否超出rule中定义的最大长度
                    let fieldRule=browserCollRule[fieldName]
                    let fieldValue=partValue[fieldName]
                    let maxLengthDefine=fieldRule[e_ruleFiledName.ARRAY_MAX_LENGTH]['define']
                    if(fieldValue.length>maxLengthDefine){
                        return validatePartObjectIdEncryptedError.validateSingleField.singleFieldLengthExceed
                    }
/*                    if(false===valueMatchRuleDefineCheck({ruleType:e_serverRuleType.ARRAY_MAX_LENGTH,fieldValue:fieldValue,ruleDefine:maxLengthDefine})){
                        return genInputError(fieldRule,e_serverRuleType.ARRAY_MAX_LENGTH)
                    }*/

                }
                if( partValue[fieldName].length>0){
                    for(let singleEle of partValue[fieldName]){
                        if(false===ifObjectIdEncrypted({objectId:singleEle})){
                            return validatePartObjectIdEncryptedError.validateSingleField.singleFieldArrayValueIsInvalidEncryptedObjectId
                        }
                    }
                }
            }
            //数据类型不是array
            if(false===ifArray){
                if(false===ifObjectIdEncrypted({objectId:partValue[fieldName]})){
                    return validatePartObjectIdEncryptedError.validateSingleField.singleFieldIsInvalidEncryptedObjectId
                }
            }

        }
    }
    return rightResult
}

function validateRecordInfo({req,browserCollRule,applyRange}) {
    let tmpResult
    if (false === dataTypeCheck.isSetValue(req.body.values[e_part.RECORD_INFO])) {
        return rightResult
    }
    let partValue = req.body.values[e_part.RECORD_INFO]
// ap.wrn('validateRecordInfo part value',partValue)
    // ap.wrn('validateRecordInfo browserCollRule',browserCollRule)
    // ap.wrn('validateRecordInfo applyRange',applyRange)
    for(let singleFieldName in partValue){
        //字段值为空，则跳过不做检查
        if(false===dataTypeCheck.isSetValue(partValue[singleFieldName])){
            continue
        }
        // ap.wrn('singleFieldName',singleFieldName)
        // ap.inf('partValue',partValue)
        // ap.inf('partValue[singleFieldName]',partValue[singleFieldName])
        // ap.wrn('browserCollRule[singleFieldName]',browserCollRule[singleFieldName])
        //字段有对应的rule
        if(undefined!==browserCollRule[singleFieldName] ){
            //字段值不为空（空值交给后续代码处理，而不在解密代码中处理）
            // ap.wrn('in')
            // if(true===dataTypeCheck.isSetValue(partValue[singleFieldName])){
                // ap.inf('partValue[singleFieldName]',partValue[singleFieldName])
            //获得field的数据类型
            let ifArray=false,ifObjectId=false
            // ap.wrn('validateRecordInfo browserCollRule[singleFieldName]',browserCollRule[singleFieldName])
            tmpResult=ifFieldDataTypeObjectId({fieldRule:browserCollRule[singleFieldName]})
            // ap.wrn('validateRecordInfo result',tmpResult)
            ifArray=tmpResult['msg']['ifArray']
            ifObjectId=tmpResult['msg']['ifObjectId']
            // ap.inf('dataType',dataType)
            //字段类型是objectId
            if(true===ifObjectId){
                //2018-07-04：传入的applyRange是否是rule中applyRange中
                if(-1===browserCollRule[singleFieldName][e_otherRuleFiledName.APPLY_RANGE].indexOf(applyRange)){
                    return validatePartObjectIdEncryptedError.common.fieldNotMatchApplyRange
                }
                //数组，对每个元素进行判别
                if(true===ifArray){
                    if(true===dataTypeCheck.isArray(partValue[singleFieldName]) &&  partValue[singleFieldName].length>0){
                        //2018-07-04: 如果有ARRAY_MAX_LENGTH，要检查长度
                        if(undefined!==browserCollRule[singleFieldName][e_ruleFiledName.ARRAY_MAX_LENGTH]){
                            //复用validateValue中的error
                            let fieldRule=browserCollRule[singleFieldName]
                            let fieldValue=partValue[singleFieldName]
                            let maxLengthDefine=fieldRule[e_ruleFiledName.ARRAY_MAX_LENGTH]['define']
                            if(fieldValue.length>maxLengthDefine){
                                return validatePartObjectIdEncryptedError.validateRecordInfo.recordInfoFieldValueLengthExceed(singleFieldName)
                            }
/*                            if(false===valueMatchRuleDefineCheck({ruleType:e_serverRuleType.ARRAY_MAX_LENGTH,fieldValue:fieldValue,ruleDefine:maxLengthDefine})){
                                return genInputError(fieldRule,e_serverRuleType.ARRAY_MAX_LENGTH)
                            }*/

                        }
                        //检查objectId的format
                        for(let singleEle of partValue[singleFieldName]){
                            if(false===ifObjectIdEncrypted({objectId:singleEle})){
                                return validatePartObjectIdEncryptedError.validateRecordInfo.recordInfoFieldValueArrayEleInvalidEncryptedObjectId(singleFieldName)
                            }
                        }
                    }
                }else{
                    if(false===ifObjectIdEncrypted({objectId:partValue[singleFieldName]})){
                        return validatePartObjectIdEncryptedError.validateRecordInfo.recordInfoFieldValueInvalidEncryptedObjectId(singleFieldName)
                    }
                }
            }
            // }

        }

    }
    return rightResult
}

/**     验证chooseFriend中，如果friendsGroup或者friends存在，其中每个元素都是合格的加密objectId **/
//格式已经在controllerPreCheck.inputCommonCheck中检测过了（
// 因为CHOOSE_FRIEND没有对应的rule，所以格式检测需要在inputCommonCheck中线完成，然后进行encryptedObject的验证，最后再次对value进行objectId格式验证）
//普通的part，例如recordInfo，是inputCommonCheck(只完成大体格式验证)===>验证加密objectId并解密===>每个字段的值的类型验证====>
function validateChooseFriend({req}){
    let tmpResult
    if (false === dataTypeCheck.isSetValue(req.body.values[e_part.CHOOSE_FRIEND])) {
        return rightResult
    }
    let partValue = req.body.values[e_part.CHOOSE_FRIEND]
    let expectedField=[e_chooseFriendInfoFieldName.FRIENDS,e_chooseFriendInfoFieldName.FRIEND_GROUPS]
    for(let singleExpectedFieldName of expectedField){
        if(undefined!==partValue[singleExpectedFieldName]){
            for(let singleEle of partValue[singleExpectedFieldName]){
                if(false===ifObjectIdEncrypted({objectId:singleEle})){
                    return validatePartObjectIdEncryptedError.validateChooseFriend.chooseFriendFieldValueArrayEleInvalidEncryptedObjectId(singleExpectedFieldName)
                }
            }
        }
    }
    return rightResult
}
module.exports={
    validateEditSubField,
    validateManipulateArray,
    validateRecordId,
    validateSingleField,
    validateRecordInfo,
    validateChooseFriend,
}