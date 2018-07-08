/**
 * Created by Ada on 2017/7/9.
 * url：
 *  1. /user，根据method的不同，调用不同的函数进行对应的处理
 *  2. /user/unique: 用户注册的时候，对应用户名/账号进行唯一性检查
 */
'use strict'




/****************   内置lib和第三方lib   ******************/
const ap=require('awesomeprint')


const server_common_file_require=require('../../../server_common_file_require')
/****************   公共函数   ******************/
const controllerPreCheck=server_common_file_require.controllerPreCheck
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const crypt=server_common_file_require.crypt
/****************   公共常量   ******************/
//error
const dispatchError=server_common_file_require.helperError.dispatch

//enum
const nodeEnum=server_common_file_require.nodeEnum
const e_part=nodeEnum.ValidatePart
const e_intervalCheckPrefix=nodeEnum.IntervalCheckPrefix

const mongoEnum=server_common_file_require.mongoEnum
const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB


const e_searchRange=server_common_file_require.inputDataRuleType.SearchRange
const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange
// const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange

const e_coll=require('../../constant/genEnum/DB_Coll').Coll

const regex=server_common_file_require.regex.regex
/**************  rule  ****************/
const internalInputRule=require('../../constant/inputRule/internalInputRule').internalInputRule
const inputRule=require('../../constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule

/**************  controller相关常量  ****************/
const controllerError=require('./articleLikeDislike_setting/likeDislike_controllerError').controllerError
const controllerSetting=require('./articleLikeDislike_setting/likeDislike_setting').setting


const like_async=require('./articleLikeDisLike_logic/create_likeDisLike').like_async
const dislike_async=require('./articleLikeDisLike_logic/create_likeDisLike').dislike_async
// const update_async=require('./impeach_logic/update_impeach').updateImpeach_async
// const delete_async=require('./impeach_logic/delete_impeach').deleteImpeach_async






//对CRUD（输入参数带有method）操作调用对应的函数
async function article_likeDislike_dispatcher_async({req}){
    /***   初始化参数   ***/
    let userLoginCheck={
        //needCheck:true,
        // error:controllerError.userNotLoginCantCreateComment
    }
    let penalizeCheck={
        /*        penalizeType:e_penalizeType.NO_ARTICLE,
                penalizeSubType:e_penalizeSubType.CREATE,
                penalizeCheckError:controllerError.userInPenalizeNoCommentCreate*/
    }
    let arr_currentSearchRange=[e_searchRange.ALL]
    let originalUrl=req.originalUrl
    let baseUrl=req.baseUrl
    let collName=controllerSetting.MAIN_HANDLED_COLL_NAME
    let expectedPart
    let result=dispatchError.common.unknownRequestUrl
    let tmpResult
    let applyRange
    // ap.inf('originalUrl',originalUrl)
    // ap.inf('req.route.stack[0].method',req.route.stack[0].method)
    ap.inf('req.body',req.body)
    // ap.inf('req.params',req.params)
    /***   1. interval和robot检测   ***/
    await controllerPreCheck.commonPreCheck_async({req:req,collName:collName})
    /***   2. 根据method，以及url，进行对应的检查，最后调用处理函数   ***/
    /**    检查包括：用户是否登录/用户是否被处罚/输入值的格式和范围是否正确（POST/PUT） **/
    switch (req.route.stack[0].method) {
        case 'post':
            if (baseUrl === '/article_like_dislike' || baseUrl === '/article_like_dislike/') {
                applyRange=e_applyRange.CREATE
                userLoginCheck={
                    needCheck:true,
                    error:controllerError.dispatch.post.notLoginCantLikeDisLikeArticle
                }
                penalizeCheck={
                    penalizeType:e_penalizeType.NO_LIKE_DISLIKE,
                    penalizeSubType:e_penalizeSubType.CREATE,
                    penalizeCheckError:controllerError.dispatch.post.userInPenalizeCantCreateLikeDisLike
                }
                await controllerPreCheck.userStateCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})
                // ap.inf('create use userStateCheck_async done')
                expectedPart=[e_part.SINGLE_FIELD] //{RECEIVER:objectId}
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                // ap.inf('inputCommonCheck result',result)
                if (result.rc > 0) {return Promise.reject(result)}

                //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                // ap.inf('before check',req.body.values)
                await controllerChecker.ifObjectIdInPartCrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[collName],applyRange:applyRange})
                // ap.inf('after check',req.body.values)
                //对req中的recordId和recordInfo中加密的objectId进行解密
                let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
                // ap.inf('userInfo',userInfo)
                let tempSalt=userInfo.tempSalt
                // ap.inf('userInfo。tempSalt',userInfo.tempSalt)
                // ap.inf('before decrypt',req.body.values)
                // ap.inf('salt',tempSalt)
                controllerHelper.decryptInputValue({req:req,expectedPart:expectedPart,salt:tempSalt,browserCollRule:browserInputRule[collName]})
                // ap.inf('after decrypt',req.body.values)
                //对输入值进行检测（此时objectId已经解密）
                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:collName,applyRange:applyRange,arr_currentSearchRange:arr_currentSearchRange})
                // ap.inf('inputPreCheck result',result)
                if(result.rc>0){return Promise.reject(result)}

                if(originalUrl==='/article_like_dislike/like' || originalUrl==='/article_like_dislike/like/'){
                    result = await like_async({req: req,applyRange:applyRange})
                }
                if(originalUrl==='/article_like_dislike/dislike' || originalUrl==='/article_like_dislike/dislike/'){
                    result = await dislike_async({req: req,applyRange:applyRange})
                }

                return Promise.resolve(result)
            }
            break;
        default:
    }
}




/*              记录likeDislike                */
/*async  function createLikeDislike_async(req) {
    let tmpResult, docValue,collName,collNameStatic

    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let userId=userInfo.userId

    collName=e_Coll.ARTICLE_LIKE_DISLIKE
    collNameStatic=e_Coll.ARTICLE_LIKE_DISLIKE_STATIC
    // userId='598dae560706320f40c0cab1'
// console.log(`userId ====>${userId}`)
    /!*              client数据转换                  *!/
    docValue=req.body.values[e_part.RECORD_INFO]
    //dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])

// console.log(`after data convert docvalue==========>${JSON.stringify(docValue)}`)

    /!*                  添加内部产生的client值                  *!/
    let internalValue = {}
    internalValue[e_field.ARTICLE_LIKE_DISLIKE.AUTHOR_ID] = userId
    /!*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           *!/
    if (e_env.DEV === currentEnv && Object.keys(internalValue).length > 0) {
        // console.log(`before newDocValue====>${JSON.stringify(internalValue)}`)
        // let newDocValue=dataConvert.addSubFieldKeyValue(internalValue)
        // console.log(`newDocValue====>${JSON.stringify(newDocValue)}`)
        let tmpResult = controllerHelper.checkInternalValue({
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
    /!*              外键（article/authorId）是否存在                 *!/
    await controllerChecker.ifFkValueExist_async({docValue:docValue,collFkConfig:fkConfig[collName],collFieldChineseName:e_fieldChineseName[collName]})

    /!*                  复合unique index检查(用户是否对此文档进行过踩赞)                    *!/
    let condition={}
    condition[e_field.ARTICLE_LIKE_DISLIKE.AUTHOR_ID]=docValue[e_field.ARTICLE_LIKE_DISLIKE.AUTHOR_ID]
    condition[e_field.ARTICLE_LIKE_DISLIKE.ARTICLE_ID]=docValue[e_field.ARTICLE_LIKE_DISLIKE.ARTICLE_ID]
    tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel[collName],condition:condition})
    if(tmpResult.length>0){
        return Promise.reject(controllerError.alreadyLikeDislike)
    }

    /!*              插入db          *!/
    await common_operation_model.create_returnRecord_async({dbModel: e_dbModel[collName], value: docValue})
    // console.log(`create result is ====>${JSON.stringify(tmpResult)}`)
    /!*          对关联db进行操作               *!/
    let fieldToBePlus1
    if(docValue[e_field.ARTICLE_LIKE_DISLIKE.LIKE]){
        fieldToBePlus1=e_field.LIKE_DISLIKE_STATIC.LIKE_TOTAL_NUM
    }else{
        fieldToBePlus1=e_field.LIKE_DISLIKE_STATIC.DISLIKE_TOTAL_NUM
    }
    let articleId=docValue[e_field.ARTICLE_LIKE_DISLIKE.ARTICLE_ID]
    tmpResult= await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel[collNameStatic],id:articleId,updateFieldsValue:{$inc:{[fieldToBePlus1]:1}}})

    return Promise.resolve({rc: 0, msg: tmpResult})
}*/

module.exports={
    article_likeDislike_dispatcher_async,
    // controllerError
}