/**
 * Created by Ada on 2017/7/9.
 * url：
 *  1. /user，根据method的不同，调用不同的函数进行对应的处理
 *  2. /user/unique: 用户注册的时候，对应用户名/账号进行唯一性检查
 */
'use strict'




const fs=require('fs')

const e_userState=require('../../constant/enum/node').UserState
const e_part=require('../../constant/enum/node').ValidatePart
const e_method=require('../../constant/enum/node').Method
const e_randomStringType=require('../../constant/enum/node').RandomStringType
const e_uploadFileType=require('../../constant/enum/node').UploadFileType
// const e_method=require('../../constant/enum/node').Method

const e_hashType=require('../../constant/enum/node_runtime').HashType

const e_env=require('../../constant/enum/node').Env
const e_docStatus=require('../../constant/enum/mongo').DocStatus.DB
const e_penalizeType=require('../../constant/enum/mongo').PenalizeType.DB
const e_penalizeSubType=require('../../constant/enum/mongo').PenalizeSubType.DB
const e_iniSettingObject=require('../../constant/enum/initSettingObject').iniSettingObject
const e_articleStatus=require('../../constant/enum/mongo').ArticleStatus.DB
const e_resourceRange=require('../../constant/enum/mongo').ResourceRange.DB
const e_resourceType=require('../../constant/enum/mongo').ResourceType.DB
const e_storePathUsage=require('../../constant/enum/mongo').StorePathUsage.DB

const e_fileSizeUnit=require('../../constant/enum/node_runtime').FileSizeUnit

const currentEnv=require('../../constant/config/appSetting').currentEnv
const uploadFileDefine=require('../../constant/config/globalConfiguration').uploadFileDefine

const e_dbModel=require('../../model/mongo/dbModel')
const fkConfig=require('../../model/mongo/fkConfig').fkConfig

const e_coll=require('../../constant/enum/DB_Coll').Coll
const e_field=require('../../constant/enum/DB_field').Field
const e_internal_field=require('../../constant/enum/DB_internal_field').Field
const e_uniqueField=require('../../constant/enum/DB_uniqueField').UniqueField
// const e_inputFieldCheckType=require('../../constant/enum/node').InputFieldCheckType

const helper=require('../helper')
const common_operation_model=require('../../model/mongo/operation/common_operation_model')
const hash=require('../../function/assist/crypt').hash

const misc=require('../../function/assist/misc')
// const checkRobot_async=require('../../function/assist/checkRobot').checkRobot_async


const sanityHtml=require('../../function/assist/sanityHtml').sanityHtml
/*const generateRandomString=require('../../function/assist/misc').generateRandomString
const sendVerificationCodeByEmail_async=require('../../function/assist/misc').sendVerificationCodeByEmail_async
const ifUserLogin=require('../../function/assist/misc').ifUserLogin*/

const dataConvert=require('../dataConvert')
const validateCreateRecorderValue=require('../../function/validateInput/validateValue').validateCreateRecorderValue
const validateUpdateRecorderValue=require('../../function/validateInput/validateValue').validateUpdateRecorderValue
const validateCURecordInfoFormat=require('../../function/validateInput/validateFormat').validateCURecordInfoFormat
// const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule
const internalInputRule=require('../../constant/inputRule/internalInputRule').internalInputRule
const inputRule=require('../../constant/inputRule/inputRule').inputRule
const e_fieldChineseName=require('../../constant/enum/inputRule_field_chineseName').ChineseName


const mongoError=require('../../constant/error/mongo/mongoError').error

const regex=require('../../constant/regex/regex').regex

const maxNumber=require('../../constant/config/globalConfiguration').maxNumber
const miscConfiguration=require('../../constant/config/globalConfiguration').miscConfiguration

const mailAccount=require('../../constant/config/globalConfiguration').mailAccount

/*          create article              */
// const checkUserState=require('../')
/*         upload user photo         */
const gmImage=require('../../function/assist/gmImage')
// const userPhotoConfiguration=require('../../constant/config/globalConfiguration').uploadFileDefine.user_thumb
const e_gmGetter=require('../../constant/enum/node_runtime').GmGetter
const e_gmCommand=require('../../constant/enum/node_runtime').GmCommand
const uploadFile=require('../../function/assist/upload')

/*         generate captcha         */
// const captchaIntervalConfiguration=require('../../constant/config/globalConfiguration').intervalCheckConfiguration.captcha


const controllerError={
    /*          common              */
/*    fieldAlreadyExist(chineseFieldName,fieldInputValue){
        switch (fieldName){
            case e_field.article
        }
        return {rc:50200,msg:{client:`${fieldInputValue}已经存在`, server:`字段${chineseFieldName}中，值${fieldInputValue}已经存在`}}},*/

    /*          create new article              */
    userNotLoginCantCreate:{rc:50500,msg:{client:`尚未登录，无法执行此操作`,server:`尚未登录，无法对文档执行踩赞操作`}},
    userInPenalizeNoLikeDisLikeCreate:{rc:50502,msg:{client:`管理员禁止踩赞文档`,server:`管理员禁止踩赞文档`}},

    alreadyLikeDislike:{rc:50504,msg:{client:`已经执行过操作`,server:`已经执行过操作`}},
    // userNotLoginCantCreate:{rc:50500,msg:{}},
    // userInPenalizeNoArticleUpdate:{rc:50232,msg:`管理员禁止更新文档`},
}


//对CRUD（输入参数带有method）操作调用对应的函数
async function article_likeDislike_dispatcher_async({req}){

    //检查格式
    // console.log(`req is ${JSON.stringify(req.cookies)}`)
    // console.log(`dispatcher in`)
    console.log(`req.body.values in likedislike========> ${JSON.stringify(req.body.values)}`)
    let collName=e_coll.LIKE_DISLIKE,tmpResult

    //checkMethod只检测req的结构，以及req中method的格式和值，以便后续可以直接根据method进行调用
    tmpResult=helper.checkMethod({req:req})
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
                penalizeType:e_penalizeType.NO_LIKE_DISLIKE,
                penalizeSubType:e_penalizeSubType.CREATE,
                penalizeCheckError:controllerError.userInPenalizeNoLikeDisLikeCreate
            }
            expectedPart=[e_part.RECORD_INFO]
            tmpResult=await helper.preCheck_async({req:req,collName,method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})

            tmpResult=await createLikeDislike_async(req)



            break;
        case e_method.SEARCH:// search
            break;
        case e_method.UPDATE: //update
            /*userLoginCheck={
                needCheck:true,
                error:controllerError.userNotLoginCantUpdate
            }
            penalizeCheck={
                penalizeType:e_penalizeType.NO_ARTICLE,
                penalizeSubType:e_penalizeSubType.UPDATE,
                penalizeCheckError:controllerError.userInPenalizeNoArticleUpdate
            }
            expectedPart=[e_part.RECORD_INFO,e_part.RECORD_ID]
            tmpResult=await helper.preCheck_async({req:req,collName,method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
// console.log(`article update precheck result======>${JSON.stringify(tmpResult)}`)

            /!*      执行逻辑                *!/
            tmpResult=await updateArticle_async(req)*/
            break;
        case e_method.DELETE: //delete
            break;
        case e_method.MATCH: //match(login_async)

    }
    
    return Promise.resolve(tmpResult)
}




/*              记录likeDislike                */
async  function createLikeDislike_async(req) {
    let tmpResult, userId, docValue,collName,collNameStatic
    userId = req.session.userId
    collName=e_coll.LIKE_DISLIKE
    collNameStatic=e_coll.LIKE_DISLIKE_STATIC
    // userId='598dae560706320f40c0cab1'
// console.log(`userId ====>${userId}`)
    /*              client数据转换                  */
    docValue=req.body.values[e_part.RECORD_INFO]
    dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])

// console.log(`after data convert docvalue==========>${JSON.stringify(docValue)}`)

    /*                  添加内部产生的client值                  */
    let internalValue = {}
    internalValue[e_field.LIKE_DISLIKE.AUTHOR_ID] = userId
    /*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           */
    if (e_env.DEV === currentEnv && Object.keys(internalValue).length > 0) {
        // console.log(`before newDocValue====>${JSON.stringify(internalValue)}`)
        // let newDocValue=dataConvert.addSubFieldKeyValue(internalValue)
        // console.log(`newDocValue====>${JSON.stringify(newDocValue)}`)
        let tmpResult = helper.checkInternalValue({
            internalValue: internalValue,
            collInputRule: inputRule[collName],
            collInternalRule: internalInputRule[collName]
        })
// console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if (tmpResult.rc > 0) {
            return Promise.reject(tmpResult)
        }
    }
    Object.assign(docValue, internalValue)
// console.log(`docValue after internal=========>${JSON.stringify(docValue)}`)
    /*              外键（article/authorId）是否存在                 */
    await helper.ifFkValueExist_async({docValue:docValue,collFkConfig:fkConfig[collName],collFieldChineseName:e_fieldChineseName[collName]})

    /*                  复合unique index检查(用户是否对此文档进行过踩赞)                    */
    let condition={}
    condition[e_field.LIKE_DISLIKE.AUTHOR_ID]=docValue[e_field.LIKE_DISLIKE.AUTHOR_ID]
    condition[e_field.LIKE_DISLIKE.ARTICLE_ID]=docValue[e_field.LIKE_DISLIKE.ARTICLE_ID]
    tmpResult=await common_operation_model.find({dbModel:e_dbModel[collName],condition:condition})
    if(tmpResult.msg.length>0){
        return Promise.reject(controllerError.alreadyLikeDislike)
    }

    /*              插入db          */
    tmpResult = await common_operation_model.create({dbModel: e_dbModel[collName], value: docValue})
    console.log(`create result is ====>${JSON.stringify(tmpResult)}`)
    /*          对关联db进行操作               */
    let fieldToBePlus1
    if(docValue[e_field.LIKE_DISLIKE.LIKE]){
        fieldToBePlus1=e_field.LIKE_DISLIKE_STATIC.LIKE_TOTAL_NUM
    }else{
        fieldToBePlus1=e_field.LIKE_DISLIKE_STATIC.DISLIKE_TOTAL_NUM
    }
    let articleId=docValue[e_field.LIKE_DISLIKE.ARTICLE_ID]
    tmpResult= await common_operation_model.findByIdAndUpdate({dbModel:e_dbModel[collNameStatic],id:articleId,updateFieldsValue:{$inc:{[fieldToBePlus1]:1}}})

    return Promise.resolve({rc: 0, msg: tmpResult.msg})
}

module.exports={
    article_likeDislike_dispatcher_async,
    controllerError
}