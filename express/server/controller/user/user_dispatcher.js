/**
 * Created by Ada on 2017/7/9.
 * url：
 *  1. /user，根据method的不同，调用不同的函数进行对应的处理
 *  2. /user/unique: 用户注册的时候，对应用户名/账号进行唯一性检查
 */
'use strict'




// const fs=require('fs')
//const maxSearchKeyNum=require('../../constant/config/globalConfiguration').searchSetting.maxKeyNum
//const maxSearchPageNum=require('../../constant/config/globalConfiguration').searchMaxPage.readName

// const e_dbModel=require('../../constant/genEnum/dbModel')


const server_common_file_include=require('../../../server_common_file_require')

const nodeEnum=server_common_file_include.nodeEnum
const controllerHelper=server_common_file_include.controllerHelper
// const e_userState=require('../../constant/enum/node').UserState
const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method//require('../../constant/enum/node').Method
// const e_randomStringType=require('../../constant/enum/node').RandomStringType
// const e_method=require('../../constant/enum/node').Method

/*const e_iniSettingObject=require('../../constant/enum/initSettingObject').iniSettingObject

const e_hashType=require('../../constant/enum/node_runtime').HashType

const e_env=require('../../constant/enum/node').Env
const e_docStatus=require('../../constant/enum/mongo').DocStatus.DB
const e_accountType=require('../../constant/enum/mongo').AccountType.DB
const e_storePathUsage=require('../../constant/enum/mongo').StorePathUsage.DB
const e_resourceType=require('../../constant/enum/mongo').ResourceRange
const currentEnv=require('../../constant/config/appSetting').currentEnv*/


// const fkConfig=require('../../model/mongo/fkConfig').fkConfig
const e_coll=require('../../constant/genEnum/DB_Coll').Coll
/*const e_coll=require('../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../constant/genEnum/DB_field').Field
const e_internal_field=require('../../constant/genEnum/DB_internal_field').Field
const e_uniqueField=require('../../constant/enum/DB_uniqueField').UniqueField
const e_fileSizeUnit=require('../../constant/enum/node_runtime').FileSizeUnit*/
// const e_inputFieldCheckType=require('../../constant/enum/node').InputFieldCheckType


// const e_storePatUsage=require('../../constant/enum/mongo').StorePathUsage.DB

// const controllerHelper=server_common_file_include.controllerHelper
/*const common_operation_model=require('../../model/mongo/operation/common_operation_model')
const common_operation_document=require('../../model/mongo/operation/common_operation_document')
const hash=require('../../function/assist/crypt').hash
const generateRandomString=require('../../function/assist/misc').generateRandomString
const convertFileSize=require('../../function/assist/misc').convertFileSize
const objectDeepCopy=require('../../function/assist/misc').objectDeepCopy
const sendVerificationCodeByEmail_async=require('../../function/assist/misc').sendVerificationCodeByEmail_async

const populateSingleDoc_async=require('../../model/mongo/operation/helper').populateSingleDoc_async

// const ifUserLogin=require('../../function/assist/misc').ifUserLogin
const dataConvert=require('../dataConvert')
const validateCreateRecorderValue=require('../../function/validateInput/validateValue').validateCreateRecorderValue
const validateUpdateRecorderValue=require('../../function/validateInput/validateValue').validateUpdateRecorderValue
const validateCURecordInfoFormat=require('../../function/validateInput/validateFormat').validateCURecordInfoFormat
// const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule
const internalInputRule=require('../../constant/inputRule/internalInputRule').internalInputRule
const inputRule=require('../../constant/inputRule/inputRule').inputRule  //用于dev模式下对inputValue进行格式检查

const mongoError=require('../../constant/error/mongo/mongoError').error

const regex=require('../../constant/regex/regex').regex

const maxNumber=require('../../constant/config/globalConfiguration').maxNumber
const miscConfiguration=require('../../constant/config/globalConfiguration').miscConfiguration

const mailAccount=require('../../constant/config/globalConfiguration').mailAccount


const mongoConfiguration=require('../../model/mongo/common/configuration')
/!*         upload user photo         *!/
const gmImage=require('../../function/assist/gmImage')
const userPhotoConfiguration=require('../../constant/config/globalConfiguration').uploadFileDefine.user_thumb
const e_gmGetter=require('../../constant/enum/node_runtime').GmGetter
const e_gmCommand=require('../../constant/enum/node_runtime').GmCommand
const uploadFile=require('../../function/assist/upload')

/!*         generate captcha         *!/
const captchaIntervalConfiguration=require('../../constant/config/globalConfiguration').intervalCheckConfiguration.captcha


const handleSystemError=require('../../function/assist/system').handleSystemError*/
// const systemError=require('../../constant/error/systemError').systemError

const createUser_async=require('./user_logic/create_user').createUser_async
const updateUser_async=require('./user_logic/update_user').updateUser_async
const userLogin_async=require('./user_logic/user_login').login_async
//对CRUD（输入参数带有method）操作调用对应的函数
async function dispatcher_async(req){
    //检查格式
    // console.log(`req is ${JSON.stringify(req.body)}`)
    // console.log(`dispatcher in`)
    // console.log(`req.body.values ${JSON.stringify(req.body.values)}`)
    let collName=e_coll.USER,tmpResult

    //dispatcher只检测req的结构，以及req中method的格式和值，以便后续可以直接根据method进行调用
    tmpResult=controllerHelper.checkMethod({req:req})
    // console.log(   `tmpResult===========>${JSON.stringify(tmpResult)}`)
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }


    //因为method已经检测过，所有要从req.body.values中删除，防止重复检查
    let method=req.body.values[e_part.METHOD]
    delete req.body.values[e_part.METHOD]

    let userLoginCheck,penalizeCheck,expectedPart
    switch (method){
        case e_method.CREATE: //create
            // console.log(`create in`)

            userLoginCheck={
                needCheck:false,
                // error:controllerError.userNotLoginCantCreateComment
            }
            penalizeCheck={
/*                penalizeType:e_penalizeType.NO_ARTICLE,
                penalizeSubType:e_penalizeSubType.CREATE,
                penalizeCheckError:controllerError.userInPenalizeNoCommentCreate*/
            }
            expectedPart=[e_part.RECORD_INFO]
            // console.log(`before precheck done=====.`)
            await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
	    //await helper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
// console.log(`precheck done=====.`)

            tmpResult=await createUser_async(req)
            // console.log(`create  tmpResult ${JSON.stringify(tmpResult)}`)
            break;
        case e_method.SEARCH:// search
            break;
        case e_method.UPDATE: //update
            userLoginCheck={
                needCheck:false,
                // error:controllerError.userNotLoginCantCreateComment
            }
            penalizeCheck={
                /*                penalizeType:e_penalizeType.NO_ARTICLE,
                                penalizeSubType:e_penalizeSubType.CREATE,
                                penalizeCheckError:controllerError.userInPenalizeNoCommentCreate*/
            }
            expectedPart=[e_part.RECORD_INFO]
            // console.log(`before precheck done=====.`)
            await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
	    //await helper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
         //    console.log(`req.session indisp ${JSON.stringify(req.session)}`)
            tmpResult=await updateUser_async(req)
            break;
        case e_method.DELETE: //delete
            break;
        case e_method.MATCH: //match(login_async)
            userLoginCheck={
                needCheck:false,
                // error:controllerError.userNotLoginCantCreateComment
            }
            penalizeCheck={
                /*                penalizeType:e_penalizeType.NO_ARTICLE,
                                penalizeSubType:e_penalizeSubType.CREATE,
                                penalizeCheckError:controllerError.userInPenalizeNoCommentCreate*/
            }
            expectedPart=[e_part.RECORD_INFO]
            // console.log(`before precheck done=====.`)
            await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
	    //await helper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
            tmpResult=await userLogin_async(req)
            break;
        default:
            console.log(`======>ERR:Wont in cause method check before`)
            // console.log(`match tmpResult ${JSON.stringify(tmpResult)}`)
    }
    
    return Promise.resolve(tmpResult)
}


module.exports={
    dispatcher_async,
    // login_async,
    // uniqueCheck_async,
    // retrievePassword_async,
    // uploadPhoto_async,
    // generateCaptcha_async,
    // controllerError
}