/**
 * Created by Ada on 2017/7/9.
 * url：
 *  1. /user，根据method的不同，调用不同的函数进行对应的处理
 *  2. /user/unique: 用户注册的时候，对应用户名/账号进行唯一性检查
 */
'use strict'




const fs=require('fs')


const server_common_file_require=require('../../../server_common_file_require')

const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum


const e_coll=require('../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../constant/genEnum/DB_field').Field
const e_internal_field=require('../../constant/genEnum/DB_internal_field').Field
const e_uniqueField=require('../../constant/genEnum/DB_uniqueField').UniqueField
// const e_chineseName=require('../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_fieldChineseName=require('../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_dbModel=require('../../constant/genEnum/dbModel')

const fkConfig=server_common_file_require.fkConfig.fkConfig
// const dbMetaInfo={e_coll:e_coll,e_field:e_field,e_internal_field:e_internal_field}

//const maxSearchKeyNum=require('../../constant/config/globalConfiguration').searchSetting.maxKeyNum
//const maxSearchPageNum=require('../../constant/config/globalConfiguration').searchMaxPage.readName
//const searchSetting={maxSearchKeyNum:maxSearchKeyNum}
const e_userState=nodeEnum.UserState
const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_env=nodeEnum.Env
// const e_randomStringType=require('../../constant/enum/node').RandomStringType
// const e_uploadFileType=require('../../constant/enum/node').UploadFileType
// const e_method=require('../../constant/enum/node').Method

// const e_hashType=nodeRuntimeEnum.HashType
// const e_fileSizeUnit=nodeRuntimeEnum.FileSizeUnit

// const e_docStatus=mongoEnum.DocStatus.DB
const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB

// const e_articleStatus=mongoEnum.ArticleStatus.DB
// const e_resourceRange=require('../../constant/enum/mongo').ResourceRange.DB
// const e_resourceType=require('../../constant/enum/mongo').ResourceType.DB
// const e_storePathUsage=mongoEnum.StorePathUsage.DB

// const e_iniSettingObject=require('../../constant/enum/initSettingObject').iniSettingObject

const currentEnv=server_common_file_require.appSetting.currentEnv
// const uploadFileDefine=require('../../constant/config/globalConfiguration').uploadFileDefine




// const e_inputFieldCheckType=require('../../constant/enum/node').InputFieldCheckType

const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model//require('../../model/mongo/operation/common_operation_model')
// const hash=require('../../function/assist/crypt').hash

// const misc=server_common_file_require.misc//require('../../function/assist/misc')
// const checkRobot_async=require('../../function/assist/checkRobot').checkRobot_async


//const sanityHtml=server_common_file_require.sanityHtml//require('../../function/assist/sanityHtml').sanityHtml
/*const generateRandomString=require('../../function/assist/misc').generateRandomString
const sendVerificationCodeByEmail_async=require('../../function/assist/misc').sendVerificationCodeByEmail_async
const ifUserLogin=require('../../function/assist/misc').ifUserLogin*/

const dataConvert=server_common_file_require.dataConvert
// const validateCreateRecorderValue=require('../../function/validateInput/validateValue').validateCreateRecorderValue
// const validateUpdateRecorderValue=require('../../function/validateInput/validateValue').validateUpdateRecorderValue
// const validateCURecordInfoFormat=require('../../function/validateInput/validateFormat').validateCURecordInfoFormat
// const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule
const internalInputRule=require('../../constant/inputRule/internalInputRule').internalInputRule
const inputRule=require('../../constant/inputRule/inputRule').inputRule



/*                          controller                          */
const controllerError=require('./article_comment_setting/article_comment_controllerError').controllerError
const create_async=require('./article_comment_logic/create_article_comment').createArticleComment_async
// const update_async=require('./article_logic/update_article').updateArticle_async
// const delete_async=require('./article_logic/delete_impeach').deleteImpeach_async
const controllerSetting=require('./article_setting/article_setting').setting








//对CRUD（输入参数带有method）操作调用对应的函数
async function comment_dispatcher_async({req}){

    //检查格式
    // console.log(`req is ${JSON.stringify(req.cookies)}`)
    // console.log(`dispatcher in`)
    // console.log(`req.body.values ${JSON.stringify(req.body.values)}`)
    let collName=e_coll.ARTICLE_COMMENT,tmpResult

    //dispatcher只检测req的结构，以及req中method的格式和值，以便后续可以直接根据method进行调用
    tmpResult=controllerHelper.checkMethod({req:req})
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }

    //因为method已经检测过，所有要从req.body.values中删除，防止重复检查
    let method=req.body.values[e_part.METHOD]
    delete req.body.values[e_part.METHOD]

    let userLoginCheck,penalizeCheck,expectedPart
    switch (method){
        case e_method.CREATE: //create
            userLoginCheck={
                needCheck:true,
                error:controllerError.userNotLoginCantCreateComment
            }
            penalizeCheck={
                penalizeType:e_penalizeType.NO_COMMENT,
                penalizeSubType:e_penalizeSubType.CREATE,
                penalizeCheckError:controllerError.userInPenalizeNoCommentCreate
            }
            expectedPart=[e_part.RECORD_INFO]
            await controllerHelper.preCheck_async({req:req,collName,method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
	    //await controllerHelper.preCheck_async({req:req,collName,method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})

            await create_async({req:req})

            break;
        case e_method.SEARCH:// search
            break;
        case e_method.UPDATE: //update
            break;
        case e_method.DELETE: //delete
            break;
        case e_method.MATCH: //match(login_async)
            break;
        default:
            console.log(`======>ERR:Wont in cause method check before`)

    }

    return Promise.resolve({rc:0})
}










module.exports={
    comment_dispatcher_async,
    // controllerError
}