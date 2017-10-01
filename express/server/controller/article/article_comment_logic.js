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



// const mongoError=require('../../constant/error/mongo/mongoError').error
//
// const regex=require('../../constant/regex/regex').regex
//
// const maxNumber=require('../../constant/config/globalConfiguration').maxNumber
// const miscConfiguration=require('../../constant/config/globalConfiguration').miscConfiguration
//
// const mailAccount=require('../../constant/config/globalConfiguration').mailAccount

/*          create article              */
// const checkUserState=require('../')
/*         upload user photo         */
/*
const gmImage=require('../../function/assist/gmImage')
// const userPhotoConfiguration=require('../../constant/config/globalConfiguration').uploadFileDefine.user_thumb
const e_gmGetter=require('../../constant/enum/node_runtime').GmGetter
const e_gmCommand=require('../../constant/enum/node_runtime').GmCommand
const uploadFile=require('../../function/assist/upload')

/!*         generate captcha         *!/
const captchaIntervalConfiguration=require('../../constant/config/globalConfiguration').intervalCheckConfiguration.captcha
*/


const controllerError={
    /*          common              */
/*    fieldAlreadyExist(chineseFieldName,fieldInputValue){
        switch (fieldName){
            case e_field.article
        }
        return {rc:50200,msg:{client:`${fieldInputValue}已经存在`, server:`字段${chineseFieldName}中，值${fieldInputValue}已经存在`}}},*/



    /*          create new comment              */
    userNotLoginCantCreateComment:{rc:50300,msg:`用户尚未登录，无法发表评论`},
    userInPenalizeNoCommentCreate:{rc:50302,msg:`管理员禁止发表评论`},


    // userInPenalizeNoArticleUpdate:{rc:50232,msg:`管理员禁止更新文档`},
}





//对CRUD（输入参数带有method）操作调用对应的函数
async function comment_dispatcher_async(req){

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
                penalizeType:e_penalizeType.NO_ARTICLE,
                penalizeSubType:e_penalizeSubType.CREATE,
                penalizeCheckError:controllerError.userInPenalizeNoCommentCreate
            }
            expectedPart=[e_part.RECORD_INFO]
            await controllerHelper.preCheck_async({req:req,collName,method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
	    //await controllerHelper.preCheck_async({req:req,collName,method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})

            await createComment_async(req)

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

    return Promise.resolve(tmpResult)
}





async function createComment_async(req){
    // console.log(`create comment in =====>`)
    let tmpResult

    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let userId=userInfo.userId

    // let articleId=req.body.values[e_part.RECORD_ID]
    let collName=e_coll.ARTICLE_COMMENT
    // let originalArticle


    /*              client数据转换                  */
    let docValue=req.body.values[e_part.RECORD_INFO]
    dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])

    // let result=await common_operation_model.findById({dbModel:dbModel[e_coll.USER],id:objectId})
    // let userId=result.msg[e_field.USER.]


    /*              检查外键字段的值是否存在                */
    await controllerChecker.ifFkValueExist_async({docValue:docValue,collFkConfig:fkConfig[collName],collFieldChineseName:e_fieldChineseName[collName]})



    /*              获得internal field，并进行检查                  */
    let internalValue={}
    internalValue[e_field.ARTICLE_COMMENT.AUTHOR_ID]=userId
    if(e_env.DEV===currentEnv && Object.keys(internalValue).length>0){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[collName],collInternalRule:internalInputRule[collName]})
        // console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    //internal加入docValue
    Object.assign(docValue,internalValue)

// console.log(`combined docValue is ${JSON.stringify(docValue)}`)
    /*              如果有unique字段，需要预先检查unique(express级别，而不是mongoose级别)            */
    if(undefined!==e_uniqueField[collName] && e_uniqueField[collName].length>0) {
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue})
	//await controllerHelper.ifFiledInDocValueUnique_async({collName: collName, docValue: docValue,e_uniqueField:e_uniqueField,e_chineseName:e_chineseName})
    }


    /*              创建数据            */
    // let articleId=docValue[e_field.ARTICLE_COMMENT.ARTICLE_ID]
    await common_operation_model.create_returnRecord_async({dbModel:e_dbModel[collName],value:docValue})
    // tmpResult=await common_operation_model.update({dbModel:e_dbModel[collName],id:articleId,values:docValue})
    return Promise.resolve({rc:0})
}





module.exports={
    comment_dispatcher_async,
    controllerError
}