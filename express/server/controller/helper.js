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

const e_method=require('../constant/enum/node').Method
const e_coll=require('../constant/enum/DB_Coll').Coll
const e_field=require('../constant/enum/DB_field').Field
const e_internal_field=require('../constant/enum/DB_internal_field').Field
const e_uniqueField=require('../constant/enum/DB_uniqueField').UniqueField
const e_chineseName=require('../constant/enum/inputRule_field_chineseName').ChineseName
const e_inputFieldCheckType=require('../constant/enum/node').InputFieldCheckType

const e_fileSizeUnit=require('../constant/enum/node_runtime').FileSizeUnit

const e_penalizeSubType=require('../constant/enum/mongo').PenalizeSubType.DB
const e_docStatus=require('../constant/enum/mongo').DocStatus.DB
const e_resourceRange=require('../constant/enum/mongo').ResourceRange
// var miscFunc=require('../../assist/misc')
// var validate=validateFunc.validate
// var checkInterval=require('../../assist/misc').checkInterval
const paginationSetting=require('../constant/config/globalConfiguration').paginationSetting
/*                      error               */
const helperError=require('../constant/error/controller/helperError').helper

const e_dbModel=require('../model/mongo/dbModel')
const common_operation_model=require('../model/mongo/operation/common_operation_model')

const checkUserState=require('../function/assist/misc').checkUserState
const checkRobot_async=require('../function/assist/checkRobot').checkRobot_async

const browserInputRule=require('../constant/inputRule/browserInputRule').browserInputRule
const internalInputRule=require('../constant/inputRule/internalInputRule').internalInputRule
const inputRule=require('../constant/inputRule/inputRule').inputRule

const fkConfig=require('../model/mongo/fkConfig').fkConfig

const e_storePathUsage=require('../constant/enum/mongo').StorePathUsage.DB
const e_storePathStatus=require('../constant/enum/mongo').StorePathStatus.DB

const handleSystemError=require('../function/assist/system').handleSystemError
const systemError=require('../constant/error/systemError').systemError

const e_iniSettingObject=require('../constant/enum/initSettingObject').iniSettingObject
const uploadFile=require('../function/assist/upload')
const convertFileSize=require('../function/assist/misc').convertFileSize
const sanityHtml=require('../function/assist/sanityHtml').sanityHtml

const regex=require('../constant/regex/regex').regex
const currentAppSetting=require('../constant/config/appSetting').currentAppSetting

//1. 对输入（inputValue）进行整体检查；对expectedPart进行检查（part是否正确，part值类型是否正确）
// 只用于nonCRUDCheck。CRUDCHeck中，验证步骤被拆散
function inputCommonCheck(req,expectedPart){
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


/*  在inputCommonCheck后执行，确保所有part都存在，且值的数据类型正确
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


/*/!* 检测doc中的外键字段（objectId）是否存在
 * @doc：要保存（sreate/update）到db中的doc
 * @collFkConfig: doc对应的fkConfig，用来确定doc中那些字段是外键，且对应的配置是什么
 *
 * return：字段对应的外键不存在
 * *!/
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
}*/


/*          预检method是否正确，以便后续能使用正确的method调用不同的CRUD方法            */
function checkMethod({req}){
    // console.log(`CRUDPreCheckFormat in=========>`)
    // console.log(`req.body in=========>${JSON.stringify(req.body)}`)
    let result=validateFormat.validateReqBody(req.body)
    // console.log(`req.body result=========>${JSON.stringify(result)}`)
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
* 必须和checkMethod配合使用，后者用来预先检测Method，剩下的part交由本函数处理
* */
//validatePartValueFormat+validatePartValue
function CRUDPreCheck({req,expectedPart,collName,method}){
    // console.log(`expectedPart in====>${JSON.stringify(expectedPart)}`)
    // console.log(`recordInfoBaseRule ${JSON.stringify(recordInfoBaseRule)}`)
    let result
    //检查参数
/*    if(-1===Object.values(e_userState).indexOf(expectUserState)){
        return helperError.undefinedUserState
    }*/
    if(-1===Object.values(e_coll).indexOf(collName)){
        return helperError.undefinedColl
    }

// console.log(`CRUDPreCheck： checkUserState  ${JSON.stringify(result)}`)
    //检查输入参数中part的值（格式预先检查好，某些part的值简单。例如method/currentPage，同时检测了value）

    // 此处检查除了method之外的part（method已经在checkMethod中预检）
    delete req.body.values[e_part.METHOD]
    // console.log(`req.body.values ====>${JSON.stringify(req.body.values)}`)
    // console.log(`expectedPart ====>${JSON.stringify(expectedPart)}`)
    result=validateFormat.validatePartFormat(req.body.values,expectedPart)
    // console.log(`validatePartFormat result ====>${JSON.stringify(result)}`)
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
                //没有default，因为在inputCommonCheck->validatePartFormat中，已经过滤了非预定义的method
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
    // console.log(`format check result =======》 ${JSON.stringify(result)}`)
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
    // console.log(`req.body.values====>${JSON.stringify(req.body.values[e_part.RECORD_INFO])}`)
    // console.log(`collName====>${JSON.stringify(collName)}`)
    // console.log(`browserInputRule====>${JSON.stringify(browserInputRule[collName])}`)
    // console.log(`validatePartValue result =======》 ${JSON.stringify(result)}`)
        return result
    // }
}


//没有method
function nonCRUDPreCheck({req,expectPart,collName}){
    let result
    // console.log(`recordInfoBaseRule ${JSON.stringify(recordInfoBaseRule)}`)
    //检查参数
/*    if(-1===Object.values(e_userState).indexOf(expectUserState)){
        return helperError.undefinedUserState
    }*/
    if(-1===Object.values(e_coll).indexOf(collName)){
        return helperError.undefinedColl
    }



    //检查输入参数中part的格式和值

    result = inputCommonCheck(req, expectPart)
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

    return Promise.resolve({rc:0,msg:uniqueCheckResult.msg.length>0})
    // }
}

async function ifFiledInDocValueUnique_async({collName,docValue}){
    // if(undefined!==e_uniqueField[collName] &&  e_uniqueField[collName].length>0){
        // console.log(`ifFiledInDocValueUnique_async in=========>}`)
        // console.log(`ifFiledInDocValueUnique_async docValue=========>${JSON.stringify(docValue)}`)
        for(let singleFieldName in docValue){
            // console.log(`singleFieldName=========>${JSON.stringify(singleFieldName)}`)
            if(-1!==e_uniqueField[collName].indexOf(singleFieldName)){
                // console.log(`singleFieldName is uhnqieu=========>${JSON.stringify(singleFieldName)}`)
                let condition = {}
                condition[singleFieldName]=docValue[singleFieldName]
                //patch(user中，还有额外的字段docStatus用来判断是否unique)
                if(collName===e_coll.USER){
                    condition[e_field.USER.DOC_STATUS]=e_docStatus.DONE
                }
                let uniqueCheckResult = await common_operation_model.find({dbModel: e_dbModel[collName], condition: condition})
// console.log(`ifFiledInDocValueUnique_asyn uniqueCheckResultc=========>: ${JSON.stringify(uniqueCheckResult)}`)
                if(uniqueCheckResult.msg.length>0){
                    let chineseName=e_chineseName[collName][singleFieldName]
                    // let fieldInputValue=docValue[singleFieldName]
                    return Promise.reject(helperError.fieldValueUniqueCheckError({collName:collName,fieldName:singleFieldName,chineseName:chineseName}))
                }
            }
        }
    // }
    return Promise.resolve({rc:0})
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
 * @ resourceRange: perArticle/perPerson
 *
 * return: 返回合适的记录
 * */
async function chooseLastValidResourceProfile_async({resourceRange,userId}){
    // console.log(`chooseLastValidResourceProfile_async in ===========>`)
    let resourceProfileIdInUse,tmpResult,condition={},options={}
    //根据resourceRange，查找对应的resource_profile的objectID
    condition[e_field.RESOURCE_PROFILE.RANGE]=resourceRange
    tmpResult=await common_operation_model.find({dbModel:e_dbModel.resource_profile,condition:condition})
    console.log(`resourceRange result ===========>${JSON.stringify(tmpResult)}`)
    if(0===tmpResult.msg.length){
        handleSystemError({error:systemError.noDefinedResourceProfile})
        return Promise.reject(systemError.noDefinedResourceProfile)
    }
let resourceProfileIfMatchRange=[]
    for(let singleRecord of tmpResult.msg){
        // console.log(`singleRecord result ===========>${JSON.stringify(singleRecord)}`)
        resourceProfileIfMatchRange.push(singleRecord[e_field.RESOURCE_PROFILE.ID])
    }
    // console.log(`resourceProfileIfMatchRange result ===========>${JSON.stringify(resourceProfileIfMatchRange)}`)
    //根据resource_profile_id和userId，在user_resource_profile中查找
    //1. duration>0的最近一条记录（是否active）
    condition={}
    condition[e_field.USER_RESOURCE_PROFILE.DURATION]={$gt:0}
    condition[e_field.USER_RESOURCE_PROFILE.USER_ID]=userId
    condition[e_field.USER_RESOURCE_PROFILE.RESOURCE_PROFILE_ID]={$in:resourceProfileIfMatchRange}
    options['sort']={'cDate':-1}
    options['limit']=1
    // console.log(`condition result ===========>${JSON.stringify(condition)}`)
    // console.log(`options result ===========>${JSON.stringify(options)}`)
    //selectedFields必须包含cDate，否则无法执行virtual方法
    let selectedFields=`${e_field.USER_RESOURCE_PROFILE.RESOURCE_PROFILE_ID} ${e_field.USER_RESOURCE_PROFILE.DURATION} cDate`
    tmpResult=await common_operation_model.find({dbModel:e_dbModel.user_resource_profile,condition:condition,options:options,selectedFields:selectedFields})
// console.log(`duration>0 result ===========>${JSON.stringify(tmpResult)}`)
    if(tmpResult.msg.length>0){
        if(true===tmpResult.msg[0]['isActive']){
            resourceProfileIdInUse=tmpResult.msg[0][e_field.USER_RESOURCE_PROFILE.RESOURCE_PROFILE_ID]
        }
    }
    //如果duration》0的记录没有找到，或者找到但是已经超期
    if(undefined===resourceProfileIdInUse){
        //如果duration>0的resource_profile没有找到，那么查找duration=0（无时间限制）的记录
        condition[e_field.USER_RESOURCE_PROFILE.DURATION]={$eq:0}
        tmpResult=await common_operation_model.find({dbModel:e_dbModel.user_resource_profile,condition:condition,selectedFields:selectedFields})
        // console.log(`duration===0 result ===========>${JSON.stringify(tmpResult)}`)
        if(tmpResult.msg.length===0){
            handleSystemError({error:systemError.userNoDefaultResourceProfile})
            return Promise.reject(systemError.userNoDefaultResourceProfile)
        }

        resourceProfileIdInUse=tmpResult.msg[0][e_field.USER_RESOURCE_PROFILE.RESOURCE_PROFILE_ID]
    }

    // console.log(`choose resourceProfileIdInUse===========>${JSON.stringify(resourceProfileIdInUse)}`)
    // 将resource_profile_id转换成resource_profile
    tmpResult=await common_operation_model.findById({dbModel:e_dbModel.resource_profile,id:resourceProfileIdInUse})
    // console.log(`active resource_profile===========>${JSON.stringify(tmpResult.msg)}`)
    return Promise.resolve({rc:0,msg:tmpResult.msg})
}

/*  不用virtual method，因为如果使用virtual，需要引用mongo enum文件
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

        let tmpResult

        let newDocValue=dataConvert.addSubFieldKeyValue(internalValue)
        // console.log(`newDocValue =============> ${JSON.stringify(newDocValue)}`)
        tmpResult=validateFormat.validateCURecordInfoFormat(newDocValue,collInputRule)
    // console.log(`internal check format=============> ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){

            return tmpResult
        }

        tmpResult=validateValue.validateUpdateRecorderValue(newDocValue,collInternalRule)
    // console.log(`internal check format=============> ${JSON.stringify(tmpResult)}`)
        for(let singleFieldName in tmpResult){
            if(tmpResult[singleFieldName]['rc']>0){
                tmpResult['rc']=99999
                return tmpResult
            }
        }
        tmpResult['rc']=0
        return tmpResult
    // }
}

/*//检查一个外键的值是否存在
async function ifFkValueExist_async_old({dbModel,fkObjectId}){
    let tmpResult=await  common_operation_model.findById({dbModel:dbModel,id:fkObjectId})
    if(null===tmpResult.msg){
        return Promise.resolve({rc:0,msg:false})
    }else{
        return Promise.resolve({rc:0,msg:true})
    }


}*/


/*
* @docValue；待检测的记录
* @collFkConfig:当前coll对应的fk配置，用来查找field的fk关系（对应到哪个coll）
* @collFieldChineseName:如果外键不存在，报错是需要指明的字段的chineseName
*
* return：存在: {rc:0}   不存在：helperError.fkValueNotExist
* */
async function ifFkValueExist_async({docValue,collFkConfig,collFieldChineseName}){
    // let fkFieldValueToBeCheckExists=[e_field.ARTICLE.CATEGORY_ID,e_field.ARTICLE.FOLDER_ID]
// console.log(`collFkConfig fields========>${JSON.stringify(Object.keys(collFkConfig))}`)
//     console.log(`docValue ========>${JSON.stringify(docValue)}`)
    for(let singleFkFieldName in collFkConfig){
    // console.log(`singleFkFieldName=======>${singleFkFieldName}`)
    // console.log(`docValue[singleFkFieldName]===============>${JSON.stringify(docValue[singleFkFieldName])}`)
        if(undefined!==docValue[singleFkFieldName]){
            let fkFieldValueInObjectId=docValue[singleFkFieldName]
            let fkFieldRelatedColl=collFkConfig[singleFkFieldName]['relatedColl']
// console.log(`ifFkValueExist_async===>fkFieldRelatedColl===>${fkFieldRelatedColl}, id=====>${fkFieldValueInObjectId}`)
            let tmpResult=await  common_operation_model.findById({dbModel:e_dbModel[fkFieldRelatedColl],id:fkFieldValueInObjectId})
            if(null===tmpResult.msg){
                let chineseName=collFieldChineseName[singleFkFieldName]
                let fieldInputValue=docValue[singleFkFieldName]
                return Promise.reject(helperError.fkValueNotExist(chineseName,fieldInputValue))
                // return Promise.resolve({rc:0,msg:false})
            }
/*            else{
                return Promise.resolve({rc:0,msg:true})
            }*/

        }
    }
    return Promise.resolve({rc:0,msg:true})
}


/*用户(userId)是否被禁止做某事（penalizeType）
* 查找admin_penalize中最后一条penalize记录，体重的ifExpire是否为true
*
* */
async function ifPenalizeOngoing_async({userId, penalizeType,penalizeSubType}){
    let condition={}
    /*                  首先检查 penalizeSubType=all的记录，因为all具有最高优先级             */
    condition[e_field.ADMIN_PENALIZE.PUNISHED_ID]=userId
    condition[e_field.ADMIN_PENALIZE.PENALIZE_TYPE]=penalizeType
    condition[e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE]=e_penalizeSubType.ALL
    let option={}
    option['limit']=1
    option['sort']={cDate:-1} //选取最近一个penalize记录
    // condition['ifExpire']=true //这是virtual 方法
    // console.log(`penalize condition====>${JSON.stringify(condition)}`)
    let tmpResult=await common_operation_model.find({dbModel:e_dbModel.admin_penalize,condition:condition,options:option,selectedFields:'-uDate'})
    // console.log(`penalize sub type all's result====>${JSON.stringify(tmpResult)}`)
    //all的处罚记录有效
    if(tmpResult.msg.length>0 && false===tmpResult.msg[0]['isExpire']){
        return Promise.resolve(true)
    }

    /*         继续检查penalizeSubType!==ALL的记录              */
    if(penalizeSubType!==e_penalizeSubType.ALL){
        condition[e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE]=penalizeSubType
        // console.log(`penalize condition for not ALL====>${JSON.stringify(condition)}`)
        let tmpResult=await common_operation_model.find({dbModel:e_dbModel.admin_penalize,condition:condition,options:option,selectedFields:'-uDate'})
        // console.log(`penalize sub type not ALL result====>${JSON.stringify(tmpResult)}`)
        //CRUD（非ALL）的处罚记录有效
        if(tmpResult.msg.length>0 && false===tmpResult.msg[0]['isExpire']){
            return Promise.resolve(true)
        }
    }


    return Promise.resolve(false)
}

/*
* @docValue: client的输入（recordInfo）
* @collInternalFieldEnum: array. coll中那些字段是内部字段
* @collBrowserInputRule: 判断字段是否也位于client（某些字段，例如user的password，即可以位于client输入，也位于internal，所以不能删除）
* */
function deleteInternalField({docValue,collInternalFieldEnum,collBrowserInputRule}){
    if(collInternalFieldEnum.length>0){
        for(let singleFieldName of collInternalFieldEnum){
            if(false===singleFieldName in collBrowserInputRule){
                if(undefined!==docValue[singleFieldName]){
                    delete docValue[singleFieldName]
                }
            }

        }
    }
}


/*
* 0. check user login(optional)
* 1. check robot(mandatory but not archive)
* 2. penalize(mandatory)
* 3. delete internal field(mandatory)
* 4. CRUDPreCheck
* @userLoginCheck: 对象。包含2个字段：needCheck，是否检测用户登录；error：检测到未登录时返回的错误
* @penalizeCheck:对象，默认是需要检查的。包含3个字段： penalizeType,penalizeSubType,penalizeCheckError
* @expectedPart: 期望的part
* */
async function preCheck_async({req,collName,method,userLoginCheck={needCheck:false},penalizeCheck, expectedPart}){
    let tmpResult
// console.log(`preCheck in====>`)
    /*              检查用户是否登录            */
    let {needCheck,error}=userLoginCheck
    if(true===needCheck){
        if(undefined===error){
            console.log(`error============================>need to check **user login**, but not supply related error`)
        }
        if(undefined===req.session.userId){
            return Promise.reject(error)
        }
        // console.log(`====user login check done====`)
    }
// console.log(`userLoginCheck done====>`)
    /*      检测用户是否为robot，是robot，直接Promise.reject        */
    // console.log(`checkRobot_async======>${JSON.stringify(checkRobot_async)}`)
    // console.log(`type ======>${JSON.stringify(typeof checkRobot_async[e_coll.ARTICLE][method]({userId:req.session.userId}))}`)
    if(undefined!==checkRobot_async[collName] && undefined!==checkRobot_async[collName][method]){
        await checkRobot_async[collName][method]({userId:req.session.userId})
        // console.log(`====robot check done====`)
    }
// console.log(`robot done====>`)
    /*        检查用户是否被处罚                                 */
    // console.log(`create in with robot check result =======> ${result}`)
    let {penalizeType,penalizeSubType,penalizeCheckError}=penalizeCheck
    if(undefined!==req.session.userId){
        if(undefined!==penalizeType && undefined!==penalizeSubType){
            if(undefined===penalizeCheckError){
                console.log(`error============================>need to check **penalize**, but not supply related error`)
            }
            tmpResult=await ifPenalizeOngoing_async({userId:req.session.userId, penalizeType:penalizeType,penalizeSubType:penalizeSubType})
            // console.log(`preCheck_async penalize ongoing check result====>${JSON.stringify(tmpResult)}`)
            // return false
            if(true===tmpResult){
                return Promise.reject(penalizeCheckError)
            }
            // console.log(`====penalize check done====`)
        }
    }
// console.log(`penalize done====>`)
    // if(expectedPart.length>0){
    /*              如果带method，根据method的不同，选择不同的inputRule（Create还是update）
                    不带，直接检查expectPart
     */
    //因为dispatch而已经检查过req的总体结构(method必定存在)，所以无需再次检查，而直接检查partValueFormat+partValueCheck
    console.log(`pmethod====>${method}`)
    console.log(`expectedPart====>${JSON.stringify(expectedPart)}`)
    console.log(`req.body.values====>${JSON.stringify(req.body.values)}`)
    if(undefined!==method){
        tmpResult=CRUDPreCheck({req:req,expectedPart:expectedPart,collName:collName,method:method})
    }
    else
    {
        tmpResult=nonCRUDPreCheck({req:req,expectPart:expectedPart,collName:collName})
        // return Promise.reject(`method not define in preCheck_async`)
        // tmpResult=nonCRUDPreCheck({req:req,expectedPart:expectedPart,collName:collName})
    }
    
console.log(`CRUDPreCheck result ====》${JSON.stringify(tmpResult)}`)
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }

    /*              删除内部字段值                     */
    // 删除内部字段（RECORD_INFO）
    if(expectedPart.length>0 && -1!==expectedPart.indexOf(e_part.RECORD_INFO)){
        let docValue=req.body.values[e_part.RECORD_INFO]
        // console.log(`before delete internal field for RECORD_INFO=========>${JSON.stringify(docValue)}`)
        deleteInternalField({docValue:docValue,collInternalFieldEnum:e_internal_field[collName],collBrowserInputRule:browserInputRule[collName]})
        // console.log(`after delete internal field for RECORD_INFO=========>${JSON.stringify(docValue)}`)
    }

    return Promise.resolve({rc:0})
}


/*      使用multiPart获得并保存上传的文件
* return： 返回文件原始名称和size
* */
async function uploadFileToTmpDir_async({req,uploadTmpDir,maxFileSizeInByte,fileSizeUnit=e_fileSizeUnit.MB}){
    let tmpResult,uploadedFileSizeInKb
    /*              设置multiPart参数           */
    // tmpResult=await common_operation_model.find({dbModel:dbModel.store_path,condition:{usage:e_storePathUsage.UPLOAD_TMP}})
    let uploadOption={
        // maxFilesSize:2097152,
        maxFilesSize:maxFileSizeInByte,//300k   头像文件大小100k
        maxFileNumPerTrans:1,//每次只能上传一个头像文件
        // maxFields:1,
        name:'file',
        uploadDir:uploadTmpDir
    }
    // console.log(`uploadOption============> ${JSON.stringify(uploadOption)}`)
    //检查上传参数设置的是否正确
    tmpResult=uploadFile.checkOption(uploadOption)
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }
    //读取上传的文件，获得文件信息
    tmpResult=await uploadFile.formParse_async(req,uploadOption)
    // console.log(`formParse===${JSON.stringify(tmpResult)}`)

    let {originalFilename,path,size}=tmpResult.msg[0]
    // console.log(`originalFilename===${originalFilename}`)  //原始文件名
    // console.log(`path===${path}`)  //包括路径已经upload之后的文件名
    // console.log(`size===${size}`) //byte

    //检测原始文件名
    if(sanityHtml(originalFilename)!==originalFilename){
        return Promise.reject(helperError.uploadFileNameSanityFail)
    }
    //转换size
    tmpResult=convertFileSize({num:size,newUnit:fileSizeUnit})
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }
    console.log(`convert size===${tmpResult}`) //byte
    return Promise.resolve({rc:0,msg:{originalFilename:originalFilename,path:path,size:tmpResult.msg}})
    // uploadedFileSizeInKb=tmpResult.msg
}


/*如果client输入的字段包含用户输入，需要进行XSS检查
* @content;要进行检查的content
* @error；如果检查失败，要返回的错误
* */
async function contentXSSCheck_async({content,error}){
    if(sanityHtml(content)!==content){
        return Promise.reject(error)
    }
}

/*/!* content中不能有dataUrl，防止用户传入外部图片*!/
function removeImageDataUrl({content}){
    return content.replace(regex.imageDataUrl,'')
}*/


/*如果用户在client删除了图片，不会直接通知server，而是要在server端，通过比较content中image和db（自己和关联，例如article和article_image）中，决定是否要删除（磁盘文件）和db内容
*@content：输入的内容
* @recordId：要更新的记录，例如articleId
* @collConfig: 对象，content所在的coll。{name:article, fkField:e_field.ARTICLE.innerAttachmentId}
* @collImageName：对象content中，image存储在那个coll，格式同collConfig。 {name:e_coll.INNER_IMAGE, fkField:e_field.INNER_IMAGE.articleId}
* @fkFieldName: collImageName中，对应到collName的外键字段，例如articleId/impeachId
* */
async function contentDbDeleteNotExistImage_async({content,collConfig,collImageConfig,fkFieldName,error}){
    let tmpResult,validMd5ImageNameInContent={}
    //获得所有<img/>DOM
    let innerImageInContent=content.match(regex.imageDOM)



    //IMG DOM中，scr的domain必须是本站地址，且文件名为md5
    //转换成正则格式（.=====>\.）
    let convertedHostDomain=currentAppSetting['hostDomain'].replace('.',`\.`)
    let srcReg=new RegExp(`src="https*://${convertedHostDomain}.*?/([0-9a-f]{32}\.(jpg|jpeg|png))"`)
    for(let singleImageDOM of innerImageInContent){
        //如果DOM中，src不是本站地址，且文件图片不是md5，删除
        let tmpMatchResult=singleImageDOM.match(srcReg)
        if(null===tmpMatchResult){
            content.replace(singleImageDOM,'')
            continue
        }

        //获得md5图片名称：对象   md5：DOM   方便直接删除content
        validMd5ImageNameInContent[tmpMatchResult[1]]=singleImageDOM

    }

    /*          检查md5是否在collImage中存在            */
    //获得当前article/impeach的所有image记录
    let imageSearchCondition={}
    imageSearchCondition[fkFieldName]=collImageConfig.fkField
    tmpResult=await common_operation_model.find({dbModel:e_dbModel[collConfig.name],condition:imageSearchCondition})

    //对比db和content中的image
    //db中没有任何image信息，则把content中所有image DOM删除
    if(tmpResult.length===0){
        content.replace(regex.imageDOM,'')
        return Promise.resolve(content)
    }
    //以db为基准,db中有image，进行比较。如果db中的记录，在content中不存在，说明image已经被删除，那么清理db
    let deletedImageId=[],deletedImageMd5Name=[],notDeletedMd5Name=[]
    for(let singleRecord of tmpResult){
        let md5Name=singleRecord['hashName']

        if(-1===Object.keys(validMd5ImageNameInContent).indexOf(md5Name)){
            deletedImageId.push(singleRecord['_id'])
            deletedImageMd5Name.push(md5Name)
            continue
        }

        notDeletedMd5Name.push(md5Name)
    }
    let condition={'_id':{$in:deletedImageId}}
    await  common_operation_model.deleteMany({dbModel:e_dbModel[collImageConfig.name],condition:condition})
    await  common_operation_model.deleteArrayFieldValue({dbModel:e_dbModel[collConfig.name],condition:condition,arrayFieldName:collConfig.fkField})
    //以content的image为基准，如果db中没有，直接从content中删除
    for(let singleMd5InContent in validMd5ImageNameInContent){
        if(-1===notDeletedMd5Name.indexOf(singleMd5InContent)){
            content.replace(validMd5ImageNameInContent[singleMd5InContent],'')
        }
    }

    return Promise.resolve(content)
}

module.exports= {
    inputCommonCheck,//每个请求进来是，都要进行的操作（时间间隔检查等）
    validatePartValueFormat,
    validatePartValue,//对每个part的值进行检查

    checkMethod,
    CRUDPreCheck,
    nonCRUDPreCheck,//inputCommonCheck+validatePartValueFormat+validatePartValue

    // covertToServerFormat,//将req中诸如RECORD_INFO/SINGLE_FIELD的值转换成server的格式，并去除不合格字段值（create：控制

    // checkIfFkExist_async,//检测doc中外键值是否在对应的coll中存在
    ifFieldValueExistInColl_async,// 检测字段值是否已经在db中存在
    ifFiledInDocValueUnique_async,//未使用ifFieldValueExistInColl_async，直接使用find方法对整个输入的字段进行unique检测

    chooseStorePath_async,//根据某种算法（平均法），选择合适的storePath来存储文件
    chooseLastValidResourceProfile_async,//查找最近可用的resourceProfile
    setStorePathStatus,//根据原始storePath和新的usedSize，判断是否需要设置status为read only

    checkInternalValue,//

    // ifFkValueExist_async_old,
    ifFkValueExist_async,
    ifPenalizeOngoing_async,

    deleteInternalField,//检查client端输入的值（recordInfo），如果其中包含了internalField，直接删除
    preCheck_async,//user login+robot+penalize+delete internal+ CRUD

    uploadFileToTmpDir_async,

    contentXSSCheck_async,//如果输入的html，要进行XSS检查
    // removeImageDataUrl,//删除content中的dataUrl图片，防止未经授权的图片
    contentDbDeleteNotExistImage_async,
}


// chooseLastValidResourceProfile_async({resourceRange:e_resourceRange.DB.PER_ARTICLE, userId:'598a60bcdf548d0b3c2a7cd6'})