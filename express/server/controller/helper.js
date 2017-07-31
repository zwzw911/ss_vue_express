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
const dataConvert=require('./dataConvert')

const e_part=require('../constant/enum/node').ValidatePart
const e_userState=require('../constant/enum/node').UserState
const e_method=require('../constant/enum/node').Method
const e_coll=require('../constant/enum/DB_Coll').Coll
const e_field=require('../constant/enum/DB_field').Field

const e_inputFieldCheckType=require('../constant/enum/node').InputFieldCheckType
// var miscFunc=require('../../assist/misc')
// var validate=validateFunc.validate
// var checkInterval=require('../../assist/misc').checkInterval
const paginationSetting=require('../constant/config/globalConfiguration').paginationSetting
/*                      error               */
const helperError=require('../constant/error/controller/helperError').helper

const e_dbModel=require('../model/mongo/dbModel')
const common_operation_model=require('../model/mongo/operation/common_operation_model')

const checkUserState=require('../function/assist/misc').checkUserState

const browserInputRule=require('../constant/inputRule/browserInputRule').browserInputRule
const internalInputRule=require('../constant/inputRule/internalInputRule').internalInputRule
const inputRule=require('../constant/inputRule/inputRule').inputRule

const fkConfig=require('../model/mongo/fkConfig').fkConfig

const e_storePathUsage=require('../constant/enum/mongo').StorePathUsage.DB
const e_storePathStatus=require('../constant/enum/mongo').StorePathStatus.DB

const handleSystemError=require('../function/assist/system').handleSystemError
const systemError=require('../constant/error/systemError').systemError




//1. 对输入（inputValue）进行整体检查；对expectedPart进行检查（part是否正确，part值类型是否正确）
function commonCheck(req,expectedPart){
    let result=validateFormat.validateReqBody(req.body)
    if(result.rc>0){return result}

    //检查expectedPart中设定的部分是否valid，且其值格式是否正确
    result=validateFormat.validatePartFormat(req.body.values,expectedPart)
    return result
}




function validatePartValueFormat({req,expectedPart,collName,fkConfig,inputRule}){

    let checkPartFormatResult
    for(let singlePart of expectedPart){
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
            case e_part.METHOD://直接在validatePartFormat完成了format和value的check
                    break
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
* @expectedPart:需要检查的part
* @inputRule:如果需要检查的part中有RECORD_INFO/FILTER_VALUE/SEARCH_PARAMS，需要inputRule，可能只有一个coll，也有可能多个个coll（如果有外键，需要把外键对应的Rule加入）
* @recordInfoBaseRule：如果需要对part RECORD_INFO的value进行检查，是以rule为base进行检查（创建新纪录），还是以inputValue为base（modify）
* */
function validatePartValue({req,expectedPart,collName,inputRule,recordInfoBaseRule,fkConfig}){
    let checkPartValueResult
    for(let singlePart of expectedPart){
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
                // console.log(`methos is ${JSON.stringify(recordInfoBaseRule)}`)
                switch (recordInfoBaseRule){
                    case e_inputFieldCheckType.BASE_INPUT_RULE://create
                        checkPartValueResult=validateValue.validateCreateRecorderValue(req.body.values[e_part.RECORD_INFO],inputRule[collName])
                        break;
                    // case 1://search
                    //     break;
                    case e_inputFieldCheckType.BASE_INPUT://update
                        checkPartValueResult=validateValue.validateUpdateRecorderValue(req.body.values[e_part.RECORD_INFO],inputRule[collName])
                        break;
                    // case 3://delete
                    //     break;
                    default:
                        return helperError.undefinedBaseRuleType
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
                let fieldInputValue=req.body.values[e_part.SINGLE_FIELD][singleFieldName]['value']
                let fieldInputRule=inputRule[collName][singleFieldName]
                // console.log(`fieldInputValue ${JSON.stringify(fieldInputValue)}`)
                // console.log(`fieldInputRule ${JSON.stringify(fieldInputRule)}`)
                checkPartValueResult=validateValue.validateSingleRecorderFieldValue(fieldInputValue,fieldInputRule)
                // console.log(   `checkFilterFieldValueResult check result is  ${JSON.stringify(checkFilterFieldValueResult)}`)
                if(checkPartValueResult.rc>0){
                    return checkPartValueResult
                }
                break;
            case e_part.EDIT_SUB_FIELD:
                break;
            case e_part.METHOD://直接在validatePartFormat完成了format和value的check
                break
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
        let result=await common_operation_model.findById({dbModel:dbModel,id:value_objectId})
        if(result.rc>0){
            return Promise.reject(result)
        }
        if(result.rc===0 && result.msg===null){
            return Promise.reject(helperError.fkFileNotExist(collName,singleFkField,value_objectId,relatedColl))
        }
    }
    return Promise.resolve({rc:0})
}


/*          预检method是否正确，以便后续能使用正确的method调用不同的CRUD方法            */
function dispatcherPreCheck({req}){
    // console.log(`CRUDPreCheckFormat in`)
    let result=validateFormat.validateReqBody(req.body)
    if(result.rc>0){return result}
    // console.log(`validateReqBody result ${JSON.stringify(result)}`)
    // let validateAllExpectedPart=true  //只对expectedPart中定义的part进行检查
    let expectedPart=[e_part.METHOD]
    // console.log(`ready to validatePartFormat`)
    //为了能够调用validatePartFormat来检测method only，需要自己构造一个只包含了method的对象
    let methodPart
    if(undefined===req.body.values[e_part.METHOD]){
        return helperError.methodPartMustExistInDispatcher
    }else{
        methodPart={method:req.body.values[e_part.METHOD]}
    }

    // 此处只检查method
    result=validateFormat.validatePartFormat(methodPart,expectedPart)
    if(result.rc>0){return result}

    result=validateValue.validateMethodValue(methodPart[e_part.METHOD])
    return result
}


/*
* 必须和dispatcherPreCheck配合使用，后者用来预先检测Method，剩下的part交由本函数处理
* */
//validatePartValueFormat+validatePartValue
function CRUDPreCheck({req,expectedPart,collName,method}){
    // console.log(`recordInfoBaseRule ${JSON.stringify(recordInfoBaseRule)}`)
    let result
    //检查参数
/*    if(-1===Object.values(e_userState).indexOf(expectUserState)){
        return helperError.undefinedUserState
    }*/
    if(-1===Object.values(e_coll).indexOf(collName)){
        return helperError.undefinedColl
    }

/*    //检查用户状态
    result = checkUserState(req, expectUserState)
    if (result.rc > 0) {
        // return Promise.reject(result)
        return result
    }*/
// console.log(`CRUDPreCheck： checkUserState  ${JSON.stringify(result)}`)
    //检查输入参数中part的值（格式预先检查好，某些part的值简单。例如method/currentPage，同时检测了value）

    // 此处检查除了method之外的part（method已经在dispatcherPreCheck中预检）
    delete req.body.values[e_part.METHOD]
    // console.log(`req.body.values ====>${JSON.stringify(req.body.values)}`)
    // console.log(`expectedPart ====>${JSON.stringify(expectedPart)}`)
    result=validateFormat.validatePartFormat(req.body.values,expectedPart)
    if(result.rc>0){return result}

    let recordInfoBaseRule
    //validateReqBody+validatePartFormat检查完，就可以使用method（如果有）
    // if(-1!==expectedPart.indexOf(e_part.METHOD)){
    //CRUDM必须有method，所以无需进行判断，直接取值
    //     let method=req.body.values[e_part.METHOD]
        switch (method){
            case e_method.CREATE:
                recordInfoBaseRule=e_inputFieldCheckType.BASE_INPUT_RULE
                break;
            case e_method.DELETE:
                break;
            case e_method.SEARCH:
                break;
            case e_method.UPDATE:
                recordInfoBaseRule=e_inputFieldCheckType.BASE_INPUT
                break;
            case e_method.MATCH:
                recordInfoBaseRule=e_inputFieldCheckType.BASE_INPUT
                break;
                //没有default，因为在commonCheck->validatePartFormat中，已经过滤了非预定义的method
        }
    // }
//检查输入参数格式是否正确
    result = validatePartValueFormat({
        req: req,
        expectedPart: expectedPart,
        collName: collName,
        inputRule: inputRule,
        fkConfig: fkConfig
    })
    // console.log(`format check result is ${JSON.stringify(result)}`)
    if (result.rc > 0) {
        // return Promise.reject(result)
        return result
    }

// console.log(`validatePartValueFormat ${JSON.stringify(result)}`)
//检查输入参数是否正确
    //part是recordInfo
    // if(undefined!==recordInfoBaseRule){
        result = validatePartValue({
            req: req,
            expectedPart: expectedPart,
            collName: collName,
            inputRule: browserInputRule,
            recordInfoBaseRule:recordInfoBaseRule,
            fkConfig: fkConfig
        })
   /* }else{
        //part非recordInfo
        result = validatePartValue({
            req: req,
            expectedPart: expectPart,
            collName: collName,
            inputRule: browserInputRule,
            // recordInfoBaseRule:recordInfoBaseRule,
            fkConfig: fkConfig
        })
    }*/

    // console.log(`value check result is ${JSON.stringify(result)}`)
    // if (result.rc > 0) {
        // return Promise.reject(result)
        return result
    // }
}


//没有method
function nonCRUDreCheck({req,expectUserState,expectPart,collName}){
    let result
    // console.log(`recordInfoBaseRule ${JSON.stringify(recordInfoBaseRule)}`)
    //检查参数
/*    if(-1===Object.values(e_userState).indexOf(expectUserState)){
        return helperError.undefinedUserState
    }*/
    if(-1===Object.values(e_coll).indexOf(collName)){
        return helperError.undefinedColl
    }

/*    //检查用户状态
    let result = checkUserState(req, expectUserState)
    if (result.rc > 0) {
        // return Promise.reject(result)
        return result
    }*/

    //检查输入参数中part的格式和值

    result = commonCheck(req, expectPart)
    // console.log(`common check result is ${JSON.stringify(result)}`)
    if (result.rc > 0) {
        // return Promise.reject(result)
        return result
    }


//检查输入参数格式是否正确
    result = validatePartValueFormat({
        req: req,
        expectedPart: expectPart,
        collName: collName,
        inputRule: inputRule,
        fkConfig: fkConfig
    })
    // console.log(`format check result is ${JSON.stringify(result)}`)
    if (result.rc > 0) {
        // return Promise.reject(result)
        return result
    }


    result = validatePartValue({
        req: req,
        expectedPart: expectPart,
        collName: collName,
        inputRule: browserInputRule,
        // recordInfoBaseRule:recordInfoBaseRule,
        fkConfig: fkConfig
    })

    return result
    // }
}

/*              字段值是否已经存在               */
async function ifFieldValueExistInColl_async({dbModel,fieldName,fieldValue}){
    let condition = {}
    condition[fieldName]=fieldValue
    // console.log(`condition ${JSON.stringify(condition)}`)
    // {account: docValue[e_field.USER.ACCOUNT]['value']} //,dDate:{$exists:0}   重复性检查包含已经删除的用户
    // console.log(`fieldName:${fieldName}----fieldValue ${fieldValue}`)
    let uniqueCheckResult = await common_operation_model.find({dbModel: dbModel, condition: condition})

    if (uniqueCheckResult.rc > 0) {
        return Promise.reject(uniqueCheckResult)
    }
    // console.log(`uniqueCheckResult ${JSON.stringify(uniqueCheckResult)}`)
    // if(uniqueCheckResult.msg.length>0){
    // console.log(`uniqueCheckResult.msg.length>0 ${JSON.stringify(uniqueCheckResult.msg.length>0)}`)
    // let ifExist=(uniqueCheckResult.msg.length>0)
    return Promise.resolve({rc:0,msg:uniqueCheckResult.msg.length>0})
    // }
}

/*
* @ usage: storePath的用途
* */
async function chooseStorePath_async({usage}){
    let choosenStorePathRecord,tmpResult,condition={}
    //根据usage，查询status是read_write的记录，且以usedSize排序
    condition[e_field.STORE_PATH.USAGE]=usage
    condition[e_field.STORE_PATH.STATUS]=e_storePathStatus.READ_WRITE
    tmpResult=await common_operation_model.find({dbModel:e_dbModel.store_path,condition:condition,options:{sort:{usedSize:1}}})
    if(0===tmpResult.msg.length){
        handleSystemError({error:systemError.noDefinedStorePath})
        return Promise.reject(systemError.noDefinedStorePath)
    }
    // console.log(`all store path===>${JSON.stringify(tmpResult)}`)

    //选择存储路径，并判断是否达到上限
    for(let singleRec of tmpResult.msg){
        if(singleRec['percentage']<singleRec[e_field.STORE_PATH.HIGH_THRESHOLD]){
            choosenStorePathRecord=singleRec
            break;
        }
    }
    // console.log(`choosenStorePathRecord===>${JSON.stringify(choosenStorePathRecord)}`)
    if(undefined===choosenStorePathRecord){
        handleSystemError({error:systemError.noAvailableStorePathForUerPhoto})
        return Promise.reject(systemError.noAvailableStorePathForUerPhoto)
    }

    return Promise.resolve({rc:0,msg:choosenStorePathRecord})
}

/*
* @originalStorePathRecord: 原始的storePath记录
* @updateValue:将要更新到originalStorePath对应记录的数据，一般为{usedSize:xxxxxx}
*
* result: 如果usedSize/size超过highThreshold，updateValue设为read only
* */
function setStorePathStatus({originalStorePathRecord, updateValue}){
    // console.log(`originalStorePathRecord===>${JSON.stringify(originalStorePathRecord)}`)
    // console.log(`updateValue===>${JSON.stringify(updateValue)}`)
    if((updateValue[e_field.STORE_PATH.USED_SIZE]/originalStorePathRecord[e_field.STORE_PATH.SIZE])*100>originalStorePathRecord[e_field.STORE_PATH.HIGH_THRESHOLD]){
        updateValue[e_field.STORE_PATH.STATUS]=e_storePathStatus.READ_ONLY
    }
}


/*  对内部产生的值进行format和value的检测
*
* */
function checkInternalValue({internalValue,collInputRule,collInternalRule}){
    // if(e_env.DEV===currentEnv){
        let tmpResult
        // let collInputRule=Object.assign({},user_browserInputRule,user_internalInputRule)
        // console.log(`internal check value=============> ${JSON.stringify(docValue)}`)
        // console.log(`internal check rule=============> ${JSON.stringify(internalInputRule[e_coll.USER])}`)
        let newDocValue=dataConvert.addSubFieldKeyValue(internalValue)
        // console.log(`newDocValue =============> ${JSON.stringify(newDocValue)}`)
        tmpResult=validateFormat.validateCURecordInfoFormat(newDocValue,collInputRule)
        if(tmpResult.rc>0){
            // console.log(`internal check format=============> ${JSON.stringify(tmpResult)}`)
            return tmpResult
        }

        tmpResult=validateValue.validateCreateRecorderValue(newDocValue,collInternalRule)
        for(let singleFieldName in tmpResult){
            if(tmpResult[singleFieldName]['rc']>0){
                tmpResult['rc']=99999
                return tmpResult
            }
        }
        // console.log(`internal check value=============> ${JSON.stringify(tmpResult)}`)
        // tmpResult=helper.validatePartValue({req:req,exceptedPart:exceptedPart,coll:e_coll.USER,inputRule:user_internalInputRule,method:e_method.CREATE})
        // console.log(`docValue   ${JSON.stringify(docValue)}`)
        // return console.log(`internal check  ${JSON.stringify(tmpResult)}`)
        tmpResult['rc']=0
        return tmpResult
    // }
}


module.exports= {
    commonCheck,//每个请求进来是，都要进行的操作（时间间隔检查等）
    validatePartValueFormat,
    validatePartValue,//对每个part的值进行检查

    dispatcherPreCheck,
    CRUDPreCheck,
    nonCRUDreCheck,//commonCheck+validatePartValueFormat+validatePartValue

    // covertToServerFormat,//将req中诸如RECORD_INFO/SINGLE_FIELD的值转换成server的格式，并去除不合格字段值（create：控制

    checkIfFkExist_async,//检测doc中外键值是否在对应的coll中存在
    ifFieldValueExistInColl_async,// 检测字段值是否已经在db中存在

    chooseStorePath_async,//根据某种算法（平均法），选择合适的storePath来存储文件
    setStorePathStatus,//根据原始storePath和新的usedSize，判断是否需要设置status为read only

    checkInternalValue,//
}


