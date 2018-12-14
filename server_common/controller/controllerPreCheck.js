/**
 * Created by zhang wei on 2018/3/30.
 * 对req进行安全检测。例如interval检测等，POST参数格式/值检测，以及URL中参数检测
 */
'use strict'
const ap=require('awesomeprint')
const interval=require('../function/security/interval')
const checkRobot_async=require('../function/assist/checkRobot').checkRobot_async
const ifPenalizeOngoing_async=require(`./controllerChecker`).ifPenalizeOngoing_async
const dataTypeCheck=require('../function/validateInput/validateHelper').dataTypeCheck
const dataType=require('../function/assist/dataType')
const controllerHelper=require('./controllerHelper')
const controllerChecker=require('./controllerChecker')
const crypt=require('../function/assist/crypt')

const preCheckError=require('../constant/error/controller/helperError').preCheck
const validateFormatError=require('../constant/error/validateError').validateFormat
const validateFormat=require('../function/validateInput/validateFormat')
const validateSearchFormat=require('../function/validateInput/validateSearchFormat')
const validateValue=require('../function/validateInput/validateValue')

const inputRule=require('../constant/inputRule/inputRule').inputRule
const browserInputRule=require('../constant/inputRule/browserInputRule').browserInputRule
const collValue=require('../constant/genEnum/DB_CollValue').Coll
const fkConfig=require('../model/mongo/fkConfig').fkConfig

const e_part=require('../constant/enum/nodeEnum').ValidatePart
// const e_method=require('../constant/enum/nodeEnum').Method
const e_applyRange=require('../constant/enum/inputDataRuleType').ApplyRange

const currentEnv=require('../constant/config/appSetting').currentEnv
const e_env=require('../constant/enum/nodeEnum').Env
const e_userInfoField=require('../constant/enum/nodeRuntimeEnum').UserInfoField

const regex=require('../constant/regex/regex').regex

async function commonPreCheck_async({req,collName}){
    if(currentEnv===e_env.PROD){
        //1. interval检测
        //1.1 获得prefix
        let prefix=interval.getIntervalPrefix({req:req})
        // ap.inf('get prefix',prefix)
        //1.2 检查prefix对应的interval
        await interval.checkInterval_async({req:req,reqTypePrefix:prefix})
// ap.inf('checkInterval_async done')
        /*    //2 请求是否为robot
            if(undefined!==checkRobot_async[collName] && undefined!==checkRobot_async[collName][method]){
                await checkRobot_async[collName][method]({userId:req.session.userInfo.userId})
                // console.log(`====robot check done====`)
            }*/
        return Promise.resolve()
    }

}


/*  检查用户是否登录，或者是否处于处罚，因为无法操作
* */
async function userStatusCheck_async({req,userLoginCheck={needCheck:false},penalizeCheck}){
    // ap.inf('userStatusCheck_async in ')
    let tmpResult

    /*              检查用户是否登录            */
    let {needCheck,error}=userLoginCheck
    if(true===needCheck){
        if(undefined===error){
            return Promise.reject(preCheckError.userStateCheck.demandUserLoginCheckButWithoutRelatedError)
            // ap.err(`need to check **user login**, but not supply related error`)
        }
        if(undefined===req.session.userInfo || undefined===req.session.userInfo[e_userInfoField.USER_ID]){
            return Promise.reject(error)
        }
    }
// ap.inf('userStatusCheck_async->userLogin done')
    /*        检查用户是否被处罚                                 */
    let {penalizeType,penalizeSubType,penalizeCheckError}=penalizeCheck
    //参数检测
    if(undefined!==penalizeType && undefined!==penalizeSubType) {
        // console.log(`penalize check in 1 ==========================================>`)
        if (undefined === penalizeCheckError) {
            return Promise.reject(preCheckError.userStateCheck.penalizeCheckParamMissError)
            // ap.err(`need to check **penalize**, but not supply related error`)
        }
    }
    if(undefined!==penalizeType || undefined!==penalizeSubType || undefined!==penalizeCheckError){
        //用户是否登录
        if(undefined===req.session.userInfo || undefined===req.session.userInfo.userId){
            return Promise.reject(preCheckError.userStateCheck.demandPenalizeCheckButUserNotLogin)
        }

        tmpResult=await ifPenalizeOngoing_async({userId:req.session.userInfo.userId, penalizeType:penalizeType,penalizeSubType:penalizeSubType})

        if(true===tmpResult){
            return Promise.reject(penalizeCheckError)
        }

    }
    // ap.inf('userStatusCheck_async penalize done')
    return Promise.resolve()
}

/********************************************************************/
/********************************************************************/
/********************************************************************/
/*  对输入的数据进行format和value的检测（防止XSS或者数据不合格）.只对POST/PUT有效（browser只能在POST/PUT中携带额外参数，所以expressjs只检查POST/PUT携带的参数，其他的method可能无法检测到参数）
*
* */
//validatePartValueFormat+validatePartValue
function inputPreCheck({req,expectedPart,collName,arr_currentSearchRange,applyRange}){
    // ap.inf('inputPreCheck in')
    // wrn.inf('collName',collName)
    let result

    if(expectedPart.length>0){

        //检查参数，要操作的coll是否为预定义
        if(-1===collValue.indexOf(collName)){
            return preCheckError.inputPreCheck.undefinedColl
        }

        result = validatePartValueFormat({
            req: req,
            expectedPart: expectedPart,
            collName: collName,
            fkConfig: fkConfig,
            arr_currentSearchRange:arr_currentSearchRange,
        })

        if (result.rc > 0) {
            return result
        }
        // ap.wrn('validatePartValueFormat done')

        //检查输入参数是否正确
        //part是recordInfo

        result = validatePartValue({req: req,expectedPart:expectedPart,collName: collName,applyRange:applyRange,fkConfig: fkConfig})
        // ap.inf('validatePartValue result ',result)


        return result
    }


}

//1. 对输入（inputValue）进行整体检查；对expectedPart进行检查（part是否正确，part值类型是否正确）
// 只用于nonCRUDCheck。CRUDCHeck中，验证步骤被拆散
function inputCommonCheck({req,expectedPart}){
    let result=validateFormat.validateReqBody(req.body)
    if(result.rc>0){return result}

    //检查expectedPart中设定的部分是否valid，且其值格式是否正确
    // ap.wrn('req.body.values',req.body.values)
    result=validateFormat.validatePartFormat(req.body.values,expectedPart)
    return result
}

/*      对partValue进行细致的格式检查（objectId解密后,chooseFriend例外，因为没有rule，所以放在inputCommonCheck中执行）
* */
function validatePartValueFormat({req,expectedPart,collName,fkConfig,arr_currentSearchRange}){
    // ap.inf('expectedPart in',expectedPart)
    // ap.wrn('validatePartValueFormat in')
    let checkPartFormatResult
    for(let singlePart of expectedPart){
        // ap.inf('current singlePart',singlePart)
        let partValue=req.body.values[singlePart]
        switch (singlePart){

            case e_part.EVENT:
                checkPartFormatResult=validateFormat.validateEventFormat(req.body.values[e_part.EVENT])
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
                //searchParams的格式检查定义在validateSearchFormat文件中，自成一体
                checkPartFormatResult=validateSearchFormat.searchParamsNonIdCheck({arr_allowCollNameForSearch:[collName],obj_searchParams:req.body.values[e_part.SEARCH_PARAMS],arr_currentSearchRange:arr_currentSearchRange})
                // ap.inf(   `search params value result `, checkPartFormatResult)
                // for(let singleFieldName in checkPartFormatResult){
                if(checkPartFormatResult['rc']>0){
                    return checkPartFormatResult
                }
                // }
                break;
            case e_part.RECORD_ID:

                break;
            case e_part.RECORD_INFO:
                // ap.inf('recordInfo in')
                // console.log('=====>recordInfo in')
                checkPartFormatResult=validateFormat.validateCURecordInfoFormat(req.body.values[e_part.RECORD_INFO],browserInputRule[collName])
// console.log(`RECORD_INFO ====> ${JSON.stringify(checkPartFormatResult)}`)
                if(checkPartFormatResult.rc>0){
                    /*            returnResult(checkResult[singleField])
                     return res.json(checkResult[singleField])*/
                    //return checkResult[singleField]
                    return checkPartFormatResult//返回全部检查结果，为了统一格式，设置一个非0的rc
                }

                break;
            case e_part.MANIPULATE_ARRAY:
                // ap.inf('collName',collName)
                // ap.inf('browserInputRule[collName]',browserInputRule[collName])
                checkPartFormatResult=validateFormat.validateManipulateArrayFormat({inputValue:req.body.values[e_part.MANIPULATE_ARRAY],browseInputRule:browserInputRule[collName]})
                if(checkPartFormatResult.rc>0){
                    return checkPartFormatResult//返回全部检查结果，为了统一格式，设置一个非0的rc
                }

                break;
            case e_part.SINGLE_FIELD:
                // console.log('=====>in')
                checkPartFormatResult=validateFormat.validateSingleFieldFormat(req.body.values[e_part.SINGLE_FIELD],browserInputRule[collName])
// console.log(`RECORD_INFO ====> ${JSON.stringify(checkPartFormatResult)}`)
                if(checkPartFormatResult.rc>0){
                    /*            returnResult(checkResult[singleField])
                     return res.json(checkResult[singleField])*/
                    //return checkResult[singleField]
                    return checkPartFormatResult//返回全部检查结果，为了统一格式，设置一个非0的rc
                }

                break;
            // case e_part.METHOD://直接在validatePartFormat完成了format和value的check
            //     break
            case e_part.EDIT_SUB_FIELD:
                // ap.print('EDIT_SUB_FIELD in')
                // ap.print('req.body.values[e_part.EDIT_SUB_FIELD] in',req.body.values[e_part.EDIT_SUB_FIELD]),
                checkPartFormatResult=validateFormat.validateEditSubFieldFormat({inputValue:req.body.values[e_part.EDIT_SUB_FIELD],browseInputRule:browserInputRule[collName]})
                // console.log(   `checkFilterFieldValueResult check result is  ${JSON.stringify(checkPartFormatResult)}`)
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
            case e_part.CAPTCHA:
                // ap.inf('captcha in')
                //格式简单，无需检查format，直接在value中检查
                break;
            case e_part.CHOOSE_FRIEND:
                /** 因为没有对应的rule，所以format的检测要提前放到inputCommonCheck/validatePartFormat下，
                 * 赶在encryptedObject检测前完成，以便 encryptedObject无需care格式问题  **/

/*                checkPartFormatResult=validateFormat.validateChooseFriendFormat({inputValue:req.body.values[e_part.CHOOSE_FRIEND]})
                // console.log(   `checkFilterFieldValueResult check result is  ${JSON.stringify(checkPartFormatResult)}`)
                if(checkPartFormatResult.rc>0){
                    return checkPartFormatResult
                }*/
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
* @inputRule:如果需要检查的part中有RECORD_INFO/FILTER_VALUE/SEARCH_PARAMS，需要inputRule，可能只有一个coll，也有可能多个coll（如果有外键，需要把外键对应的Rule加入）
* @method：和part结合，产生对应的applyRange
* */
function validatePartValue({req,expectedPart,collName,applyRange,fkConfig}){
    // ap.inf(`validatePartValue in`)
    // ap.inf('expectedPart',expectedPart)
    // ap.inf(`req.bady.values`,req.body.values)
    let checkPartValueResult

    for(let singlePart of expectedPart){
        // ap.inf(`singlePart`,singlePart)
        let partValue=req.body.values[singlePart]
        switch (singlePart){
            case e_part.EVENT:
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
                //searchValue无需检测值，在convertToNoSql的时候，会将invalid的值自动去掉

/*                checkPartValueResult=validateValue.validateSearchParamsValue(req.body.values[e_part.SEARCH_PARAMS],fkConfig,collName,inputRule)
                // console.log(   `search params value result is ${JSON.stringify(validateValueResult)}`)
                for(let singleFieldName in checkPartValueResult){
                    if(checkPartValueResult[singleFieldName]['rc']>0){
                        return {rc:9999,msg:checkPartValueResult}
                    }
                }*/
                break;
            case e_part.RECORD_ID:
                //两次检查，第一次是validateFormat中，进行partValue（validatePartValueFormat）检查的时候，直接进行了加密objectId的检测
                //第二次，在此进行解密后objectId的检测
                // ap.inf('RECORD_ID in')
                // ap.inf('partValue',partValue)
                // ap.inf('regex.objectId.test(partValue)',regex.objectId.test(partValue))
                if(false===dataTypeCheck.isString(partValue) || false===regex.objectId.test(partValue)) {
                    return validateFormatError.inputValuePartRecordIdDecryptedValueFormatWrong
                }
                // 无需检测，直接在validateFormat中检测
                // checkPartValueResult=validateValue.validateRecorderId(req.body.values[e_part.RECORD_ID])
                // if(checkPartValueResult.rc>0){
                //     return checkPartValueResult
                // }
                break;
            case e_part.RECORD_INFO:
                // ap.inf('applyRange',applyRange)
                if(undefined!==applyRange && undefined!==req.body.values[e_part.RECORD_INFO]){
                    checkPartValueResult=validateValue.validateScalarInputValue({inputValue:req.body.values[e_part.RECORD_INFO],collRule:browserInputRule[collName],p_applyRange:applyRange})
                    for(let singleField in checkPartValueResult){
                        if(checkPartValueResult[singleField].rc>0){
                            /*            returnResult(checkResult[singleField])
                             return res.json(checkResult[singleField])*/
                            //return checkResult[singleField]
                            return {rc:99999,msg:checkPartValueResult}//返回全部检查结果，为了统一格式，设置一个非0的rc
                        }
                    }
                }



                break;
            case e_part.SINGLE_FIELD:
                //获取单个字段的字段名
                let singleFieldName=Object.keys(req.body.values[e_part.SINGLE_FIELD])[0]
                let fieldInputValue=req.body.values[e_part.SINGLE_FIELD][singleFieldName]
                let fieldInputRule=browserInputRule[collName][singleFieldName]
                // ap.inf('collName',collName)
                // ap.inf('singleFieldName',singleFieldName)
                // ap.inf('fieldInputValue',fieldInputValue)
                // ap.inf('fieldInputRule',fieldInputRule)
                // ap.inf('applyRange',applyRange)
                checkPartValueResult=validateValue.validateSingleRecorderFieldValue({fieldValue:fieldInputValue,fieldRule:fieldInputRule,applyRange:applyRange})
                // console.log(   `checkFilterFieldValueResult check result is  ${JSON.stringify(checkFilterFieldValueResult)}`)
                if(checkPartValueResult.rc>0){
                    return checkPartValueResult
                }
                break;
            case e_part.MANIPULATE_ARRAY:
                checkPartValueResult=validateValue.validateManipulateArrayValue({inputValue:req.body.values[e_part.MANIPULATE_ARRAY],browseInputRule:browserInputRule[collName]})
                // ap.print('checkPartValueResult',checkPartValueResult)
                if(checkPartValueResult.rc>0){
                    return checkPartValueResult
                }
                break;
            case e_part.EDIT_SUB_FIELD:
                checkPartValueResult=validateValue.validateEditSubFieldValue({inputValue:req.body.values[e_part.EDIT_SUB_FIELD],browseInputRule:browserInputRule[collName]})
                // ap.print('checkPartValueResult',checkPartValueResult)
                if(checkPartValueResult.rc>0){
                    return checkPartValueResult
                }
                break;
            // case e_part.METHOD://直接在validatePartFormat完成了format和value的check
            //     break
            case e_part.FILTER_FIELD_VALUE:
                //3.2 检查filterFieldValue的和value
                checkPartValueResult=validateValue.validateFilterFieldValue(req.body.values[e_part.FILTER_FIELD_VALUE],fkConfig[collName],collName,inputRule)
                // console.log(   `checkFilterFieldValueResult check result is  ${JSON.stringify(checkFilterFieldValueResult)}`)
                if(checkPartValueResult.rc>0){
                    return checkPartValueResult
                }
                break;
            case e_part.CAPTCHA:
                checkPartValueResult=validateValue.validateCaptcha(req.body.values[e_part.CAPTCHA])
                // console.log(   `checkFilterFieldValueResult check result is  ${JSON.stringify(checkFilterFieldValueResult)}`)
                if(checkPartValueResult.rc>0){
                    return checkPartValueResult
                }
                break;
            case e_part.SMS:
                checkPartValueResult=validateValue.validateSMS(req.body.values[e_part.SMS])
                // console.log(   `checkFilterFieldValueResult check result is  ${JSON.stringify(checkFilterFieldValueResult)}`)
                if(checkPartValueResult.rc>0){
                    return checkPartValueResult
                }
                break;
            case e_part.CHOOSE_FRIEND:
                checkPartValueResult=validateValue.validateChooseFriendValue({inputValue:req.body.values[e_part.CHOOSE_FRIEND]})
                // console.log(   `checkFilterFieldValueResult check result is  ${JSON.stringify(checkFilterFieldValueResult)}`)
                if(checkPartValueResult.rc>0){
                    return checkPartValueResult
                }
                break;
        }
    }
    return {rc:0}
}

/**    在get中，如果填入的参数是objectId，那么通过这个函数检测    **/
//req+parameterName: 组成cryptedObjectId http://127.0.0.1/article/encryptedObjectId
//cryptedError: cryptedObjectId格式错误，返回的error
//decryptedError：解密后objectId的格式错误，返回的error
async function checkObjectIdInReqParams_async({req,parameterName,cryptedError,decryptedError}){
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let tempSalt=userInfo.tempSalt
    //判断加密的objectId格式
    let encryptedObjectId=req.params[parameterName]
    // ap.wrn('encryptedObjectId',encryptedObjectId)
    if(false===dataType.ifObjectIdEncrypted({objectId:encryptedObjectId})){
        return Promise.reject(cryptedError)
    }
    //解密
    let tmpResult=crypt.decryptSingleValue({fieldValue:encryptedObjectId,salt:tempSalt})
    // ap.wrn('tmpResult',tmpResult)
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }
    //解密后的object替换加密值，以后后续直接使用
    req.params[parameterName]=tmpResult.msg
    // ap.inf('decryptedObjectId',req.params[parameterName])
    //判断解密的objectId
    if(false===regex.objectId.test(req.params[parameterName])){
        return Promise.reject(decryptedError)
    }
}


/********************************************************************/
/********************************************************************/
/********************************************************************/
module.exports={
    inputCommonCheck,
    commonPreCheck_async,
    userStatusCheck_async,
    inputPreCheck,
    checkObjectIdInReqParams_async,
    // queryStringPreCheck,
}