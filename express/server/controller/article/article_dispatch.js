/**
 * Created by Ada on 2017/7/9.
 * url：
 *  1. /user，根据method的不同，调用不同的函数进行对应的处理
 *  2. /user/unique: 用户注册的时候，对应用户名/账号进行唯一性检查
 */
'use strict'

const fs=require('fs')




const server_common_file_require=require('../../../server_common_file_require')
// const maxSearchKeyNum=server_common_file_require.globalConfiguration.searchSetting.maxKeyNum
// const maxSearchPageNum=server_common_file_require.globalConfiguration.searchMaxPage.readName
const controllerHelper=server_common_file_require.controllerHelper

const e_userState=server_common_file_require.nodeEnum.UserState
const e_part=server_common_file_require.nodeEnum.ValidatePart
const e_method=server_common_file_require.nodeEnum.Method
const e_randomStringType=server_common_file_require.nodeEnum.RandomStringType
const e_uploadFileType=server_common_file_require.nodeEnum.UploadFileType
// const e_method=server_common_file_require.nodeEnum.Method

const e_hashType=server_common_file_require.nodeRuntimeEnum.HashType

const e_env=server_common_file_require.nodeEnum.Env
const e_docStatus=server_common_file_require.mongoEnum.DocStatus.DB
const e_penalizeType=server_common_file_require.mongoEnum.PenalizeType.DB
const e_penalizeSubType=server_common_file_require.mongoEnum.PenalizeSubType.DB
const e_iniSettingObject=require('../../constant/genEnum/initSettingObject').iniSettingObject
const e_articleStatus=server_common_file_require.mongoEnum.ArticleStatus.DB
const e_resourceRange=server_common_file_require.mongoEnum.ResourceRange.DB
const e_resourceType=server_common_file_require.mongoEnum.ResourceType.DB
const e_storePathUsage=server_common_file_require.mongoEnum.StorePathUsage.DB

const e_fileSizeUnit=server_common_file_require.nodeRuntimeEnum.FileSizeUnit

const dataConvert=server_common_file_require.dataConvert
const gmImage=server_common_file_require.gmImage//require('../../function/assist/gmImage')

const currentEnv=server_common_file_require.appSetting.currentEnv
// const uploadFileDefine=require('../../constant/config/globalConfiguration').uploadFileDefine


const fkConfig=server_common_file_require.fkConfig.fkConfig

const e_dbModel=require('../../constant/genEnum/dbModel')
const e_coll=require('../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../constant/genEnum/DB_field').Field
const e_internal_field=require('../../constant/genEnum/DB_internal_field').Field
const e_uniqueField=require('../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../constant/genEnum/inputRule_field_chineseName').ChineseName
// const e_inputFieldCheckType=server_common_file_require.nodeEnum.InputFieldCheckType


// const hash=require('../../function/assist/crypt').hash

const misc=server_common_file_require.misc
// const checkRobot_async=require('../../function/assist/checkRobot').checkRobot_async


// const sanityHtml=server_common_file_require.sanityHtml.sanityHtml
/*const generateRandomString=require('../../function/assist/misc').generateRandomString
const sendVerificationCodeByEmail_async=require('../../function/assist/misc').sendVerificationCodeByEmail_async
const ifUserLogin=require('../../function/assist/misc').ifUserLogin*/


// const validateCreateRecorderValue=require('../../function/validateInput/validateValue').validateCreateRecorderValue
// const validateUpdateRecorderValue=require('../../function/validateInput/validateValue').validateUpdateRecorderValue
// const validateCURecordInfoFormat=require('../../function/validateInput/validateFormat').validateCURecordInfoFormat
// const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule
const internalInputRule=require('../../constant/inputRule/internalInputRule').internalInputRule
const inputRule=require('../../constant/inputRule/inputRule').inputRule
const e_fieldChineseName=require('../../constant/genEnum/inputRule_field_chineseName').ChineseName



/*                          controller                          */
const controllerError=require('./article_setting/article_controllerError').controllerError
const create_async=require('./article_logic/create_article').createArticle_async
const update_async=require('./article_logic/update_article').updateArticle_async
// const delete_async=require('./article_logic/delete_impeach').deleteImpeach_async
const controllerSetting=require('./article_setting/article_setting').setting



//对CRUD（输入参数带有method）操作调用对应的函数
async function article_dispatcher_async(req){

    //检查格式
    // console.log(`req is ${JSON.stringify(req.cookies)}`)
    // console.log(`dispatcher in`)
    // console.log(`req.body.values ${JSON.stringify(req.body.values)}`)
    let collName=controllerSetting.MAIN_HANDLED_COLL_NAME,tmpResult

    //checkMethod只检测req的结构，以及req中method的格式和值，以便后续可以直接根据method进行调用
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
                error:controllerError.userNotLoginCantCreate
            }
            penalizeCheck={
                penalizeType:e_penalizeType.NO_ARTICLE,
                penalizeSubType:e_penalizeSubType.CREATE,
                penalizeCheckError:controllerError.userInPenalizeNoArticleCreate
            }
            expectedPart=[]
            /*          新建文档无需任何输入参数，需要内部自动产生            */
            // console.log(`userLoginCheck===========>${JSON.stringify(userLoginCheck)}`)
            // console.log(`penalizeCheck===========>${JSON.stringify(penalizeCheck)}`)
            // console.log(`create preCheck before`)
            tmpResult=await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,}) //e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum
            // console.log(`create preCheck after`)
            tmpResult=await create_async({req:req})

            break;
        case e_method.SEARCH:// search
            break;
        case e_method.UPDATE: //update
            userLoginCheck={
                needCheck:true,
                error:controllerError.userNotLoginCantUpdate
            }
            penalizeCheck={
                penalizeType:e_penalizeType.NO_ARTICLE,
                penalizeSubType:e_penalizeSubType.UPDATE,
                penalizeCheckError:controllerError.userInPenalizeNoArticleUpdate
            }
            expectedPart=[e_part.RECORD_INFO,e_part.RECORD_ID]
            // console.log(`update article=========>${JSON.stringify(req.body.values)}`)
            tmpResult=await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})//,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
// console.log(`article update precheck result======>${JSON.stringify(tmpResult)}`)

            /*      执行逻辑                */
            tmpResult=await update_async({req:req})
            break;
        case e_method.DELETE: //delete
            break;
        case e_method.MATCH: //match(login_async)

    }
    
    return Promise.resolve(tmpResult)
}

module.exports={
    article_dispatcher_async,
    // controllerError,
}