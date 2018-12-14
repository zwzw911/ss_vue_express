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
const decryptSingleValue=require('../../function/assist/crypt').decryptSingleValue
const rightResult={rc:0}



function decryptEditSubField({req,browserCollRule,salt}){
    let tmpResult
    //part value空，直接结束
    if(false===dataTypeCheck.isSetValue(req.body.values[e_part.EDIT_SUB_FIELD])){
        return rightResult
    }
    let partValue=req.body.values[e_part.EDIT_SUB_FIELD]
// ap.wrn('')
    for(let singleFieldName in partValue){
        if(false===dataTypeCheck.isSetValue(partValue[singleFieldName])){
            continue
        }
        //检查from/to recordId格式是否存在
        if(undefined!==partValue[singleFieldName][e_subField.FROM]){
            partValue[singleFieldName][e_subField.FROM]=decryptSingleValue({fieldValue:partValue[singleFieldName][e_subField.FROM],salt:salt}).msg
        }
        // ap.wrn('after from decrypt',partValue[singleFieldName][e_subField.FROM])
        if(undefined!==partValue[singleFieldName][e_subField.TO]){
            partValue[singleFieldName][e_subField.TO]=decryptSingleValue({fieldValue:partValue[singleFieldName][e_subField.TO],salt:salt}).msg
        }
        // ap.wrn('after to decrypt',partValue[singleFieldName][e_subField.TO])
        if(undefined!==partValue[singleFieldName][e_subField.ELE_ARRAY] && true===dataTypeCheck.isArray(partValue[singleFieldName][e_subField.ELE_ARRAY]) ){
            //获得数据类型
/*            let singleFieldDataTypeInRule
            let dataTypeArrayFlag
            let dataType*/
            let ifArray=false,ifObjectId=false
            //获得field的数据类型
            if(undefined!==browserCollRule[singleFieldName] ){
                tmpResult=ifFieldDataTypeObjectId({fieldRule:browserCollRule[singleFieldName]})
                ifArray=tmpResult['msg']['ifArray']
                ifObjectId=tmpResult['msg']['ifObjectId']
/*                if(true===dataTypeCheck.isSetValue(partValue[singleFieldName])) {
                    singleFieldDataTypeInRule = browserCollRule[singleFieldName][e_otherRuleFiledName.DATA_TYPE]
                    dataTypeArrayFlag = dataTypeCheck.isArray(singleFieldDataTypeInRule)
                    dataType = dataTypeArrayFlag ? singleFieldDataTypeInRule[0] : singleFieldDataTypeInRule
                }*/
            }

            //如果数据类型是objectId
            if(true===ifObjectId){
                //必定是数组，数组可以为空
                let eleArrayValue=partValue[singleFieldName][e_subField.ELE_ARRAY]
                if( eleArrayValue.length>0){
                    for(let idx in eleArrayValue){
                        // let singleEle=eleArrayValue[idx]
                        partValue[singleFieldName][e_subField.ELE_ARRAY][idx]=decryptSingleValue({fieldValue:partValue[singleFieldName][e_subField.ELE_ARRAY][idx],salt:salt}).msg
                    }
                }
            }
        }
    }
    // return rightResult
}

function decryptManipulateArray({req,browserCollRule,salt}){
    let tmpResult
    if(false===dataTypeCheck.isSetValue(req.body.values[e_part.MANIPULATE_ARRAY])){
        return rightResult
    }
    let partValue=req.body.values[e_part.MANIPULATE_ARRAY]

    for(let singleFieldName in partValue){
        // ap.inf('singleFieldName',singleFieldName)
        //空值则不解密
        if(false===dataTypeCheck.isSetValue(partValue[singleFieldName])){
            continue
        }
        let ifArray=false,ifObjectId=false
        if(undefined!==browserCollRule[singleFieldName]){
            tmpResult=ifFieldDataTypeObjectId({fieldRule:browserCollRule[singleFieldName]})
            ifArray=tmpResult['msg']['ifArray']
            ifObjectId=tmpResult['msg']['ifObjectId']
            // ap.inf('dataType',dataType)
            if(true===ifObjectId){
                //必定是数组，对每个元素进行解密
                // if(true===dataTypeArrayFlag){
                let fieldValue=partValue[singleFieldName]
                //对每个部分进行检测
                let fieldSubPartValue
                if(undefined!==fieldValue['add'] && true===dataTypeCheck.isSetValue(fieldValue['add'])){
                    fieldSubPartValue=fieldValue['add']
                    for(let  idx in fieldSubPartValue){
                        partValue[singleFieldName]['add'][idx]=decryptSingleValue({fieldValue:fieldSubPartValue[idx],salt:salt}).msg
                    }
                }
                if(undefined!==fieldValue['remove'] && true===dataTypeCheck.isSetValue(fieldValue['remove'])){
                    fieldSubPartValue=fieldValue['remove']
                    for(let  idx in fieldSubPartValue){
                        partValue[singleFieldName]['remove'][idx]=decryptSingleValue({fieldValue:fieldSubPartValue[idx],salt:salt}).msg
                    }
                }
            }
        }

    }
}
function decryptRecordId({req,salt}){
    // let tmpResult
    if(false===dataTypeCheck.isSetValue(req.body.values[e_part.RECORD_ID])){
        return rightResult
    }
    let partValue=req.body.values[e_part.RECORD_ID]
    //recordId非object，所以是非引用，需要赋值
    req.body.values[e_part.RECORD_ID]=decryptSingleValue({fieldValue:partValue,salt:salt}).msg

}

function decryptSingleField({req,browserCollRule,salt}){
    let tmpResult
    if(false===dataTypeCheck.isSetValue(req.body.values[e_part.SINGLE_FIELD])){
        return rightResult
    }
    let partValue=req.body.values[e_part.SINGLE_FIELD]


    //获得field的名称
    let fieldName=Object.keys(partValue)[0]
    //fieldName是有效的（在rule中有定义）
    if(true===dataTypeCheck.isSetValue(partValue[fieldName]) && undefined!==browserCollRule[fieldName]){
        // let singleFieldValue=req.body.values[singlePart]
        //获得field的类型
/*        let fieldDataTypeInRule=browserCollRule[fieldName][e_otherRuleFiledName.DATA_TYPE]
        let dataTypeArrayFlag=dataTypeCheck.isArray(fieldDataTypeInRule)
        let dataType= dataTypeArrayFlag ? fieldDataTypeInRule[0]:fieldDataTypeInRule*/
        let ifArray,ifObjectId
        tmpResult=ifFieldDataTypeObjectId({fieldRule:browserCollRule[fieldName]})
        ifArray=tmpResult['msg']['ifArray']
        ifObjectId=tmpResult['msg']['ifObjectId']
        //字段类型是objectId
        if(true===ifObjectId){
            //数组，对每个元素进行判别
            if(true===ifArray){
                if(partValue[fieldName].length>0){
                    for(let idx in partValue[fieldName]){
                        partValue[fieldName][idx]=decryptSingleValue({fieldValue:partValue[fieldName][idx],salt:salt}).msg
                    }
                }
            }else{
                partValue[fieldName]=decryptSingleValue({fieldValue:partValue[fieldName],salt:salt}).msg
            }
            // req.body.values[singlePart]=
        }
    }
}

function decryptRecordInfo({req,browserCollRule,salt}) {
    let tmpResult
    if (false === dataTypeCheck.isSetValue(req.body.values[e_part.RECORD_INFO])) {
        return rightResult
    }
    let partValue = req.body.values[e_part.RECORD_INFO]
// ap.wrn('validateRecordInfo part value',partValue)
    // ap.wrn('validateRecordInfo browserCollRule',browserCollRule)
    // ap.wrn('validateRecordInfo applyRange',applyRange)
    for(let singleFieldName in partValue){
        // ap.wrn('singleFieldName',singleFieldName)
        if(false===dataTypeCheck.isSetValue(partValue[singleFieldName])){
            continue
        }
        if(undefined!==browserCollRule[singleFieldName]){
            let ifArray,ifObjectId
            tmpResult=ifFieldDataTypeObjectId({fieldRule:browserCollRule[singleFieldName]})
            // ap.wrn('tmpResult',tmpResult)
            ifArray=tmpResult['msg']['ifArray']
            ifObjectId=tmpResult['msg']['ifObjectId']
            // ap.wrn('ifArray',ifArray)
            // ap.wrn('ifObjectId',ifObjectId)
            if(true===ifObjectId){
                //数组，对每个元素进行解密
                if(true===ifArray){
                    for(let idx in partValue[singleFieldName]){
                        //非空值才进行解密
                        if(true===dataTypeCheck.isSetValue(partValue[singleFieldName][idx])){
                            partValue[singleFieldName][idx]=decryptSingleValue({fieldValue:partValue[singleFieldName][idx],salt:salt}).msg
                        }

                    }
                }else{
                    // ap.inf('before decryptSingleValue  partValue[singleFieldName]',partValue[singleFieldName])
                    // ap.inf('before decryptSingleValue  salt',salt)
                    // ap.inf('decryptSingleValue({fieldValue:partValue[singleFieldName],salt:salt})',decryptSingleValue({fieldValue:partValue[singleFieldName],salt:salt}))
                    //非空值才进行解密
                    if(true===dataTypeCheck.isSetValue(partValue[singleFieldName])){
                        partValue[singleFieldName]=decryptSingleValue({fieldValue:partValue[singleFieldName],salt:salt}).msg
                    }
                }
            }
        }
    }
}

/**     验证chooseFriend中，如果friendsGroup或者friends存在，其中每个元素都是合格的加密objectId **/
//格式已经在controllerPreCheck.inputCommonCheck中检测过了（
// 因为CHOOSE_FRIEND没有对应的rule，所以格式检测需要在inputCommonCheck中线完成，然后进行encryptedObject的验证，最后再次对value进行objectId格式验证）
//普通的part，例如recordInfo，是inputCommonCheck(只完成大体格式验证)===>验证加密objectId并解密===>每个字段的值的类型验证====>
function decryptChooseFriend({req,salt}){
    let tmpResult
    if (false === dataTypeCheck.isSetValue(req.body.values[e_part.CHOOSE_FRIEND])) {
        return rightResult
    }
    let partValue = req.body.values[e_part.CHOOSE_FRIEND]
    let expectedField=[e_chooseFriendInfoFieldName.FRIENDS,e_chooseFriendInfoFieldName.FRIEND_GROUPS]
    for(let singleExpectedFieldName of expectedField){
        if(undefined!==partValue[singleExpectedFieldName]){
            for(let idx in partValue[singleExpectedFieldName]){
                partValue[singleExpectedFieldName][idx]=decryptSingleValue({fieldValue:partValue[singleExpectedFieldName][idx],salt:salt}).msg
            }
        }
    }
    return rightResult
}
module.exports={
    decryptEditSubField,
    decryptManipulateArray,
    decryptRecordId,
    decryptSingleField,
    decryptRecordInfo,
    decryptChooseFriend,
}