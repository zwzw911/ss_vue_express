/**
 * Created by Ada on 2017/7/9.
 * url：
 *  1. /user，根据method的不同，调用不同的函数进行对应的处理
 *  2. /user/unique: 用户注册的时候，对应用户名/账号进行唯一性检查
 */
'use strict'

/****************   内置lib和第三方lib   ******************/
const ap=require('awesomeprint')
/*                          server common                       */
const server_common_file_require=require('../../../server_common_file_require')
/****************   公共函数   ******************/
const controllerPreCheck=server_common_file_require.controllerPreCheck
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const crypt=server_common_file_require.crypt
/****************   公共常量   ******************/
const dispatchError=server_common_file_require.helperError.dispatch

const nodeEnum=server_common_file_require.nodeEnum
const e_uploadFileType=nodeEnum.UploadFileType
const e_part=nodeEnum.ValidatePart

const mongoEnum=server_common_file_require.mongoEnum
const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB

const e_field=require(`../../constant/genEnum/DB_field`).Field
const e_coll=require(`../../constant/genEnum/DB_Coll`).Coll

const e_searchRange=server_common_file_require.inputDataRuleType.SearchRange
const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange

/**************  rule  ****************/
const internalInputRule=require('../../constant/inputRule/internalInputRule').internalInputRule
const inputRule=require('../../constant/inputRule/inputRule').inputRule
const e_fieldChineseName=require('../../constant/genEnum/inputRule_field_chineseName').ChineseName

/**************  controller相关常量  ****************/
const controllerError=require('./article_setting/article_controllerError').controllerError
const controllerSetting=require('./article_setting/article_setting').setting




/**************  逻辑处理  ****************/
const createArticle_async=require('./article_logic/create_article').createArticle_async
const updateArticle_async=require('./article_logic/update_article').updateArticle_async

const uploadArticleImage_async=require('./article_upload_file_logic/upload_article_image').uploadArticleImage_async
const uploadArticleAttachment_async=require('./article_upload_file_logic/upload_article_attachment').uploadArticleAttachment_async
const deleteArticleAttachment_async=require('./article_upload_file_logic/delete_article_attachment').deleteArticleAttachment_async
// const delete_async=require('./article_logic/delete_impeach').deleteImpeach_async

async function article_dispatcher_async({req}) {
    /***   初始化参数   ***/
    let userLoginCheck = {
        //needCheck:true,
        // error:controllerError.userNotLoginCantCreateComment
    }
    let penalizeCheck = {
        /*        penalizeType:e_penalizeType.NO_ARTICLE,
                penalizeSubType:e_penalizeSubType.CREATE,
                penalizeCheckError:controllerError.userInPenalizeNoCommentCreate*/
    }
    let arr_currentSearchRange = [e_searchRange.ALL]
    let originalUrl = req.originalUrl
    let baseUrl = req.baseUrl
    let collName = controllerSetting.MAIN_HANDLED_COLL_NAME
    let expectedPart
    let result = dispatchError.common.unknownRequestUrl
    let tmpResult
    let applyRange
    // ap.inf('originalUrl',originalUrl)
    // ap.inf('req.route.stack[0].method',req.route.stack[0].method)
    ap.inf('req.body', req.body)
    // ap.inf('req.params',req.params)
    /***   1. interval和robot检测   ***/
    await controllerPreCheck.commonPreCheck_async({req: req, collName: collName})
    /***   2. 根据method，以及url，进行对应的检查，最后调用处理函数   ***/
    /**    检查包括：用户是否登录/用户是否被处罚/输入值的格式和范围是否正确（POST/PUT） **/
    switch (req.route.stack[0].method) {
        case 'post':
            if (baseUrl === '/article' || baseUrl === '/article/') {
                /**     创建文档        **/
                if (originalUrl === '/article' || originalUrl === '/article/') {
                    applyRange = e_applyRange.CREATE
                    userLoginCheck = {
                        needCheck: true,
                        error: controllerError.dispatch.post.notLoginCantCreateArticle
                    }
                    penalizeCheck = {
                        penalizeType: e_penalizeType.NO_ARTICLE,
                        penalizeSubType: e_penalizeSubType.CREATE,
                        penalizeCheckError: controllerError.dispatch.post.userInPenalizeCantCreateArticle
                    }
                    await controllerPreCheck.userStateCheck_async({
                        req: req,
                        userLoginCheck: userLoginCheck,
                        penalizeCheck: penalizeCheck
                    })
                    /***        create article 无需任何输入参数     ***/
                    // ap.inf('create use userStateCheck_async done')
                    /*expectedPart=[e_part.SINGLE_FIELD] //{RECEIVER:objectId}
                    //是否为期望的part
                    result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                    // ap.inf('inputCommonCheck result',result)
                    if (result.rc > 0) {return Promise.reject(result)}

                    //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                    // ap.inf('before check',req.body.values)
                    await controllerChecker.ifObjectIdInPartCrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[collName]})
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
                    // ap.inf('create use inputPreCheck result',result)
                    if(result.rc>0){return Promise.reject(result)}*/

                    result = await createArticle_async({req: req, expectedPart: undefined, applyRange: applyRange})
                    return Promise.resolve(result)
                }
                if (originalUrl === '/article/articleImage' || originalUrl === '/article/articleImage/') {
                    userLoginCheck = {
                        needCheck: true,
                        error: controllerError.dispatch.post.notLoginCantCreateArticleImage
                    }
                    await controllerPreCheck.userStateCheck_async({
                        req: req,
                        userLoginCheck: userLoginCheck,
                        penalizeCheck: penalizeCheck
                    })
                    expectedPart = [e_part.RECORD_ID] //{RECEIVER:objectId}
                    //是否为期望的part
                    result = controllerPreCheck.inputCommonCheck({req: req, expectedPart: expectedPart})
                    // ap.inf('inputCommonCheck result',result)
                    if (result.rc > 0) {
                        return Promise.reject(result)
                    }

                    //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                    // ap.inf('before check',req.body.values)
                    await controllerChecker.ifObjectIdInPartCrypted_async({
                        req: req,
                        expectedPart: expectedPart,
                        browserCollRule: browserInputRule[collName]
                    })
                    // ap.inf('after check',req.body.values)
                    //对req中的recordId和recordInfo中加密的objectId进行解密
                    let userInfo = await controllerHelper.getLoginUserInfo_async({req: req})
                    // ap.inf('userInfo',userInfo)
                    let tempSalt = userInfo.tempSalt
                    // ap.inf('userInfo。tempSalt',userInfo.tempSalt)
                    // ap.inf('before decrypt',req.body.values)
                    // ap.inf('salt',tempSalt)
                    controllerHelper.decryptInputValue({
                        req: req,
                        expectedPart: expectedPart,
                        salt: tempSalt,
                        browserCollRule: browserInputRule[collName]
                    })
                    // ap.inf('after decrypt',req.body.values)
                    //对输入值进行检测（此时objectId已经解密）
                    result = controllerPreCheck.inputPreCheck({
                        req: req,
                        expectedPart: expectedPart,
                        collName: collName,
                        applyRange: applyRange,
                        arr_currentSearchRange: arr_currentSearchRange
                    })
                    // ap.inf('create use inputPreCheck result',result)
                    if (result.rc > 0) {
                        return Promise.reject(result)
                    }

                    return await uploadArticleImage_async({req: req})

                }
                if (originalUrl === '/article/articleAttachment' || originalUrl === '/article/articleAttachment/') {
                    userLoginCheck = {
                        needCheck: true,
                        error: controllerError.dispatch.post.notLoginCantCreateArticleAttachment
                    }
                    await controllerPreCheck.userStateCheck_async({
                        req: req,
                        userLoginCheck: userLoginCheck,
                        penalizeCheck: penalizeCheck
                    })

                    await controllerPreCheck.userStateCheck_async({
                        req: req,
                        userLoginCheck: userLoginCheck,
                        penalizeCheck: penalizeCheck
                    })
                    expectedPart = [e_part.RECORD_ID] //此处RECORD_ID为article的id
                    //是否为期望的part
                    result = controllerPreCheck.inputCommonCheck({req: req, expectedPart: expectedPart})
                    // ap.inf('inputCommonCheck result',result)
                    if (result.rc > 0) {
                        return Promise.reject(result)
                    }

                    //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                    // ap.inf('before check',req.body.values)
                    await controllerChecker.ifObjectIdInPartCrypted_async({
                        req: req,
                        expectedPart: expectedPart,
                        browserCollRule: browserInputRule[collName]
                    })
                    // ap.inf('after check',req.body.values)
                    //对req中的recordId和recordInfo中加密的objectId进行解密
                    let userInfo = await controllerHelper.getLoginUserInfo_async({req: req})
                    // ap.inf('userInfo',userInfo)
                    let tempSalt = userInfo.tempSalt
                    // ap.inf('userInfo。tempSalt',userInfo.tempSalt)
                    // ap.inf('before decrypt',req.body.values)
                    // ap.inf('salt',tempSalt)
                    controllerHelper.decryptInputValue({
                        req: req,
                        expectedPart: expectedPart,
                        salt: tempSalt,
                        browserCollRule: browserInputRule[collName]
                    })
                    // ap.inf('after decrypt',req.body.values)
                    //对输入值进行检测（此时objectId已经解密）
                    result = controllerPreCheck.inputPreCheck({
                        req: req,
                        expectedPart: expectedPart,
                        collName: collName,
                        applyRange: applyRange,
                        arr_currentSearchRange: arr_currentSearchRange
                    })
                    // ap.inf('create use inputPreCheck result',result)
                    if (result.rc > 0) {
                        return Promise.reject(result)
                    }

                    return await uploadArticleAttachment_async({req: req})
                }
            }
            break;
        case 'put':
            if (baseUrl === '/article' || baseUrl === '/article/') {
                applyRange = e_applyRange.UPDATE_SCALAR
                userLoginCheck = {
                    needCheck: true,
                    error: controllerError.dispatch.put.notLoginCantUpdateArticle
                }
                penalizeCheck = {
                    penalizeType: e_penalizeType.NO_ARTICLE,
                    penalizeSubType: e_penalizeSubType.UPDATE,
                    penalizeCheckError: controllerError.dispatch.put.userInPenalizeCantUpdateArticle
                }
                await controllerPreCheck.userStateCheck_async({
                    req: req,
                    userLoginCheck: userLoginCheck,
                    penalizeCheck: penalizeCheck
                })
                // ap.inf('create use userStateCheck_async done')
                expectedPart = [e_part.RECORD_INFO, e_part.RECORD_ID]
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req: req, expectedPart: expectedPart})
                if (result.rc > 0) {
                    return Promise.reject(result)
                }

                //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                // ap.inf('before check',req.body.values)
                await controllerChecker.ifObjectIdInPartCrypted_async({
                    req: req,
                    expectedPart: expectedPart,
                    browserCollRule: browserInputRule[collName]
                })
                // ap.inf('after check',req.body.values)
                //对req中的recordId和recordInfo中加密的objectId进行解密
                let userInfo = await controllerHelper.getLoginUserInfo_async({req: req})
                // ap.inf('userInfo',userInfo)
                let tempSalt = userInfo.tempSalt
                // ap.inf('userInfo。tempSalt',userInfo.tempSalt)
                // ap.inf('before decrypt',req.body.values)
                // ap.inf('salt',tempSalt)
                controllerHelper.decryptInputValue({
                    req: req,
                    expectedPart: expectedPart,
                    salt: tempSalt,
                    browserCollRule: browserInputRule[collName]
                })
                // ap.inf('after decrypt',req.body.values)
                //对输入值进行检测（此时objectId已经解密）
                result = controllerPreCheck.inputPreCheck({
                    req: req,
                    expectedPart: expectedPart,
                    collName: collName,
                    applyRange: applyRange,
                    arr_currentSearchRange: arr_currentSearchRange
                })
                // ap.inf('create use inputPreCheck result',result)
                if (result.rc > 0) {
                    return Promise.reject(result)
                }

                result = await updateArticle_async({req: req, applyRange: applyRange})
                return Promise.resolve(result)
            }
            break;
        case 'delete':
            if (baseUrl === '/article' || baseUrl === '/article/') {
                if (originalUrl === '/article/articleAttachment' || originalUrl === '/article/articleAttachment/') {
                    userLoginCheck = {
                        needCheck: true,
                        error: controllerError.dispatch.delete.notLoginCantDeleteAttachment
                    }
                    await controllerPreCheck.userStateCheck_async({
                        req: req,
                        userLoginCheck: userLoginCheck,
                        penalizeCheck: penalizeCheck
                    })


                    expectedPart = [e_part.RECORD_ID] //此处RECORD_ID为attachment的id
                    //是否为期望的part
                    result = controllerPreCheck.inputCommonCheck({req: req, expectedPart: expectedPart})
                    // ap.inf('inputCommonCheck result',result)
                    if (result.rc > 0) {
                        return Promise.reject(result)
                    }

                    //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                    // ap.inf('before check',req.body.values)
                    await controllerChecker.ifObjectIdInPartCrypted_async({
                        req: req,
                        expectedPart: expectedPart,
                        browserCollRule: browserInputRule[collName]
                    })
                    // ap.inf('after check',req.body.values)
                    //对req中的recordId和recordInfo中加密的objectId进行解密
                    let userInfo = await controllerHelper.getLoginUserInfo_async({req: req})
                    // ap.inf('userInfo',userInfo)
                    let tempSalt = userInfo.tempSalt
                    // ap.inf('userInfo。tempSalt',userInfo.tempSalt)
                    // ap.inf('before decrypt',req.body.values)
                    // ap.inf('salt',tempSalt)
                    controllerHelper.decryptInputValue({
                        req: req,
                        expectedPart: expectedPart,
                        salt: tempSalt,
                        browserCollRule: browserInputRule[collName]
                    })
                    // ap.inf('after decrypt',req.body.values)
                    //对输入值进行检测（此时objectId已经解密）
                    result = controllerPreCheck.inputPreCheck({
                        req: req,
                        expectedPart: expectedPart,
                        collName: collName,
                        applyRange: applyRange,
                        arr_currentSearchRange: arr_currentSearchRange
                    })
                    // ap.inf('create use inputPreCheck result',result)
                    if (result.rc > 0) {
                        return Promise.reject(result)
                    }

                    return await deleteArticleAttachment_async({req: req})
                }
            }
            break;
        default:
    }
}

module.exports={
    article_dispatcher_async,
    // controllerError,
}