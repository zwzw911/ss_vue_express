/**
 * Created by wzhan039 on 2016-09-30.
 * 因为expressjs的router只能支持callback，所有将所有的router处理都单独通过一个async函数处理，然后直接返回promise给router调用，
 *
 * 拆分辅助函数，合并路由函数（几个coll的路由过程都是类似的）
 */
'use strict'
//require("babel-polyfill");
//require("babel-core/register")


// var inputRule=require('../../define/validateRule/inputRule').inputRule
//var validateFunc=require('../../assist/not_used_validateFunc').func
const validateHelper=require('../function/validateInput/validateHelper')
const validateFormat=require('../function/validateInput/validateFormat')
const validateValue=require('../function/validateInput/validateValue')

const e_part=require('../constant/enum/node').ValidatePart

// var miscFunc=require('../../assist/misc')
// var validate=validateFunc.validate
// var checkInterval=require('../../assist/misc').checkInterval
const paginationSetting=require('../constant/config/globalConfiguration').paginationSetting
/*                      error               */
const helperError=require('../constant/error/controller/helperError').helper

const e_dbModel=require('../model/mongo/dbModel')
const common_operation=require('../model/mongo/operation/common_operation')

/*var pageError=require('../../define/error/pageError')
var unifiedModel=require('../../model/mongo/unifiedModel')*/
/*                      model               */
/*var departmentdbModel=require('../../model/mongo/departmentModel')
var employeedbModel=require('../../model/mongo/employeeModel')
var billTypedbModel=require('../../model/mongo/billTypeModel')
var billdbModel=require('../../model/mongo/billModel')*/
//var fkAdditionalFields=require('../../model/mongo/not_used_fkAdditionalFieldsModel')

/*                      func                   */
// var populateSingleDoc=require('../../assist/misc').populateSingleDoc
/*/!*                      regex               *!/
var coll=require('../../define/enum/node').coll
/!*                      enum                *!/
var nodeEnum=require('../../define/enum/node')
var envEnum=nodeEnum.env
// var validatePart=require('../../define/enum/validEnum').validatePart

var dbModel=require('../../model/mongo/common/structure').model

var const_define=require('../../define/const/const')*/


//1. 对输入（inputValue）进行整体检查；对exceptedPart进行检查（part是否正确，part值类型是否正确）
function commonCheck(req,exceptedpart){
    let result=validateFormat.validateReqBody(req.body)
    if(result.rc>0){return result}

    //检查exceptedPart中设定的部分是否valid，且其值格式是否正确
    result=validateFormat.validatePartFormat(req.body.values,exceptedpart)
    return result
}


function validatePartFormat({req,exceptedPart,collName,fkConfig,inputRule}){

    let checkPartFormatResult
    for(let singlePart of exceptedPart){
        switch (singlePart){
            case e_part.EVENT_FIELD:
                checkPartFormatResult=validateFormat.validateEventFormat(req.body.values[e_part.EVENT_FIELD])
                if(checkPartFormatResult.rc>0){
                    return checkPartFormatResult//返回全部检查结果，为了统一格式，设置一个非0的rc
                }
                break;
            case e_part.CURRENT_PAGE:
                break;
            case e_part.RECORD_ID_ARRAY:
/*                checkPartValueResult=validateValue.validateRecIdArr(req.body.values[e_part.RECORD_ID_ARRAY])
                if(checkPartValueResult.rc>0){
                    return checkPartValueResult
                }*/
                break;
            case e_part.SEARCH_PARAMS:
                checkPartFormatResult=validateFormat.validateSearchParamsFormat(req.body.values[e_part.SEARCH_PARAMS],fkConfig[collName],collName,inputRule)
                // console.log(   `search params value result is ${JSON.stringify(validateValueResult)}`)
                // for(let singleFieldName in checkPartFormatResult){
                    if(checkPartFormatResult['rc']>0){
                        return checkPartFormatResult
                    }
                // }
                break;
            case e_part.RECORD_ID:
                break;
            case e_part.RECORD_INFO:
                // console.log('=====>in')
                checkPartFormatResult=validateFormat.validateCURecordInfoFormat(req.body.values[e_part.RECORD_INFO],inputRule[collName])
// console.log(`RECORD_INFO ====> ${JSON.stringify(checkPartFormatResult)}`)
                if(checkPartFormatResult.rc>0){
                    /*            returnResult(checkResult[singleField])
                     return res.json(checkResult[singleField])*/
                    //return checkResult[singleField]
                    return checkPartFormatResult//返回全部检查结果，为了统一格式，设置一个非0的rc
                }

                break;
            case e_part.SINGLE_FIELD:
                // console.log('=====>in')
                checkPartFormatResult=validateFormat.validateSingleFieldFormat(req.body.values[e_part.SINGLE_FIELD],inputRule[collName])
// console.log(`RECORD_INFO ====> ${JSON.stringify(checkPartFormatResult)}`)
                if(checkPartFormatResult.rc>0){
                    /*            returnResult(checkResult[singleField])
                     return res.json(checkResult[singleField])*/
                    //return checkResult[singleField]
                    return checkPartFormatResult//返回全部检查结果，为了统一格式，设置一个非0的rc
                }

                break;
            case e_part.EDIT_SUB_FIELD:
                checkPartFormatResult=validateFormat.validateEditSubFieldFormat(req.body.values[e_part.FILTER_FIELD_VALUE])
                // console.log(   `checkFilterFieldValueResult check result is  ${JSON.stringify(checkFilterFieldValueResult)}`)
                if(checkPartFormatResult.rc>0){
                    return checkPartFormatResult
                }
                break;
            case e_part.FILTER_FIELD_VALUE:
                //3.2 检查filterFieldValue的和value
                checkPartFormatResult=validateFormat.validateFilterFieldValueFormat(req.body.values[e_part.FILTER_FIELD_VALUE],fkConfig[collName],collName,inputRule)
                // console.log(   `checkFilterFieldValueResult check result is  ${JSON.stringify(checkFilterFieldValueResult)}`)
                if(checkPartFormatResult.rc>0){
                    return checkPartFormatResult
                }
                break;
            default:
                return helperError.unknownPartInFormatCheck
        }
    }

    return {rc:0}
}


/*  在commonCheck后执行，确保所有part都存在，且值的数据类型正确
* @req:需要检查的part的值
* @exceptedPart:需要检查的part
* @inputRule:如果需要检查的part中有RECORD_INFO/FILTER_VALUE/SEARCH_PARAMS，需要inputRule，可能只有一个coll，也有可能多个个coll（如果有外键，需要把外键对应的Rule加入）
* */
function validatePartValue({req,exceptedPart,collName,inputRule,method,fkConfig}){
    let checkPartValueResult
    for(let singlePart of exceptedPart){
        switch (singlePart){
            case e_part.EVENT_FIELD:
                break;
            case e_part.CURRENT_PAGE:
                checkPartValueResult=validateValue.validateCurrentPageValue(req.body.values[e_part.CURRENT_PAGE])
                if(checkPartValueResult.rc>0){
                    return checkPartValueResult
                }
                break;
            case e_part.RECORD_ID_ARRAY:
                checkPartValueResult=validateValue.validateRecIdArr(req.body.values[e_part.RECORD_ID_ARRAY])
                if(checkPartValueResult.rc>0){
                    return checkPartValueResult
                }
                break;
            case e_part.SEARCH_PARAMS:
                checkPartValueResult=validateValue.validateSearchParamsValue(req.body.values[e_part.SEARCH_PARAMS],fkConfig,collName,inputRule)
                // console.log(   `search params value result is ${JSON.stringify(validateValueResult)}`)
                for(let singleFieldName in checkPartValueResult){
                    if(checkPartValueResult[singleFieldName]['rc']>0){
                        return {rc:9999,msg:checkPartValueResult}
                    }
                }
                break;
            case e_part.RECORD_ID:
                checkPartValueResult=validateValue.validateRecorderId(req.body.values[e_part.RECORD_ID])
                if(checkPartValueResult.rc>0){
                    return checkPartValueResult
                }
                break;
            case e_part.RECORD_INFO:
                // console.log(`methos is ${JSON.stringify(method)}`)
                switch (method){
                    case 0://create
                        checkPartValueResult=validateValue.validateCreateRecorderValue(req.body.values[e_part.RECORD_INFO],inputRule[collName])
                        break;
                    // case 1://search
                    //     break;
                    case 2://update
                        checkPartValueResult=validateValue.validateUpdateRecorderValue(req.body.values[e_part.RECORD_INFO],inputRule[collName])
                        break;
                    // case 3://delete
                    //     break;
                    default:
                        return helperError.wrongMethodTypeForRecordInfo
                        break;
                }
                for(let singleField in checkPartValueResult){
                    if(checkPartValueResult[singleField].rc>0){
                        /*            returnResult(checkResult[singleField])
                         return res.json(checkResult[singleField])*/
                        //return checkResult[singleField]
                        return {rc:99999,msg:checkPartValueResult}//返回全部检查结果，为了统一格式，设置一个非0的rc
                    }
                }
                break;
            case e_part.SINGLE_FIELD:
                //获取单个字段的字段名
                let singleFieldName=Object.keys(req.body.values[e_part.SINGLE_FIELD])[0]
                let fieldInputValue=req.body.values[e_part.SINGLE_FIELD][singleFieldName]
                let fieldInputRule=inputRule[collName][singleFieldName]
                checkPartValueResult=validateValue.validateSingleRecorderFieldValue(fieldInputValue,fieldInputRule)
                // console.log(   `checkFilterFieldValueResult check result is  ${JSON.stringify(checkFilterFieldValueResult)}`)
                if(checkPartValueResult.rc>0){
                    return checkPartValueResult
                }
                break;
            case e_part.EDIT_SUB_FIELD:
                break;
            case e_part.FILTER_FIELD_VALUE:
                //3.2 检查filterFieldValue的和value
                checkPartValueResult=validateValue.validateFilterFieldValue(req.body.values[e_part.FILTER_FIELD_VALUE],fkConfig[collName],collName,inputRule)
                // console.log(   `checkFilterFieldValueResult check result is  ${JSON.stringify(checkFilterFieldValueResult)}`)
                if(checkPartValueResult.rc>0){
                    return checkPartValueResult
                }
                break;
        }
    }

    return {rc:0}
}


/* 检测doc中的外键字段（objectId）是否存在
 * @doc：要保存（sreate/update）到db中的doc
 * @collFkConfig: doc对应的fkConfig，用来确定doc中那些字段是外键，且对应的配置是什么
 *
 * return：字段对应的外键不存在
 * */
async function checkIfFkExist_async(value,collFkConfig,collName){
    for(let singleFkField in collFkConfig){
        let relatedColl=collFkConfig[singleFkField]['relatedColl']
        let dbModel=e_dbModel[relatedColl]

        let value_objectId=value[singleFkField]
        let result=await common_operation.findById({dbModel:dbModel,id:value_objectId})
        if(result.rc>0){
            return Promise.reject(result)
        }
        if(result.rc===0 && result.msg===null){
            return Promise.reject(helperError.fkFileNotExist(collName,singleFkField,value_objectId,relatedColl))
        }
    }
    return Promise.resolve({rc:0})
}


module.exports= {
    commonCheck,//每个请求进来是，都要进行的操作（时间间隔检查等）
    validatePartFormat,
    validatePartValue,//对每个part的值进行检查

    checkIfFkExist_async,//检测doc中外键值是否在对应的coll中存在
}


