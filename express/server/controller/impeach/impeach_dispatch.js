/**
 * Created by wzhan039 on 2017/10/24.
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
// const e_uploadFileType=nodeEnum.UploadFileType
const e_part=nodeEnum.ValidatePart

const mongoEnum=server_common_file_require.mongoEnum
const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB
const e_impeachType=mongoEnum.ImpeachType.DB

const e_field=require(`../../constant/genEnum/DB_field`).Field
const e_coll=require(`../../constant/genEnum/DB_Coll`).Coll

const e_searchRange=server_common_file_require.inputDataRuleType.SearchRange
const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange

const e_fieldChineseName=require('../../constant/genEnum/inputRule_field_chineseName').ChineseName

/**************  rule  ****************/
const internalInputRule=require('../../constant/inputRule/internalInputRule').internalInputRule
const inputRule=require('../../constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule

/**************  controller相关常量  ****************/
const controllerError=require('./impeach_setting/impeach_controllerError').controllerError
const controllerSetting=require('./impeach_setting/impeach_setting').setting


/*                          controller                          */
const createImpeachForArticle_async=require('./impeach_logic/create_impeach').createImpeachForArticle_async
const createImpeachForComment_async=require('./impeach_logic/create_impeach').createImpeachForComment_async
const updateImpeach_async=require('./impeach_logic/update_impeach').updateImpeach_async
const deleteImpeach_async=require('./impeach_logic/delete_impeach').deleteImpeach_async
const uploadImage_async=require('./impeach_logic/upload_impeach_image').uploadImpeachCommentFile_async


async function impeach_dispatcher_async({req}) {

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
    ap.inf('originalUrl', originalUrl)
    // ap.inf('req.route.stack[0].method',req.route.stack[0].method)
    ap.inf('req.body', req.body)
    // ap.inf('req.params',req.params)
    /***   1. interval和robot检测   ***/
    await controllerPreCheck.commonPreCheck_async({req: req, collName: collName})
    /***   2. 根据method，以及url，进行对应的检查，最后调用处理函数   ***/
    /**    检查包括：用户是否登录/用户是否被处罚/输入值的格式和范围是否正确（POST/PUT） **/
    switch (req.route.stack[0].method) {
        case 'post':
            if (baseUrl === '/impeach' || baseUrl === '/impeach/') {
                applyRange = e_applyRange.CREATE
                if(originalUrl === '/impeach/article' || originalUrl === '/impeach/article/' || originalUrl === '/impeach/comment' || originalUrl === '/impeach/comment/'){
                    userLoginCheck = {
                        needCheck: true,
                        error: controllerError.dispatch.post.notLoginCantCreateImpeach
                    }
                    penalizeCheck = {
                        penalizeType: e_penalizeType.NO_IMPEACH,
                        penalizeSubType: e_penalizeSubType.CREATE,
                        penalizeCheckError: controllerError.dispatch.post.userInPenalizeCantCreateImpeach
                    }
                    await controllerPreCheck.userStateCheck_async({req: req,userLoginCheck: userLoginCheck,penalizeCheck: penalizeCheck})
                    expectedPart = [e_part.RECORD_INFO] //articleId
                    //是否为期望的part
                    result = controllerPreCheck.inputCommonCheck({req: req, expectedPart: expectedPart})
                    // ap.inf('inputCommonCheck result',result)
                    if (result.rc > 0) {return Promise.reject(result)}

                    //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                    // ap.inf('before check',req.body.values)
                    await controllerChecker.ifObjectIdInPartCrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[collName],applyRange:applyRange})
                    // ap.inf('after check',req.body.values)
                    //对req中的recordId和recordInfo中加密的objectId进行解密
                    let userInfo = await controllerHelper.getLoginUserInfo_async({req: req})
                    // ap.inf('userInfo',userInfo)
                    let tempSalt = userInfo.tempSalt
                    // ap.inf('userInfo。tempSalt',userInfo.tempSalt)
                    // ap.inf('before decrypt',req.body.values)
                    // ap.inf('salt',tempSalt)
                    controllerHelper.decryptInputValue({req: req,expectedPart: expectedPart,salt: tempSalt,browserCollRule: browserInputRule[collName]})
                    // ap.inf('after decrypt',req.body.values)
                    //对输入值进行检测（此时objectId已经解密）
                    result = controllerPreCheck.inputPreCheck({req: req,expectedPart: expectedPart,collName: collName,applyRange: applyRange, arr_currentSearchRange: arr_currentSearchRange})
                    // ap.inf('create use inputPreCheck result',result)
                    if (result.rc > 0) {return Promise.reject(result)}
                    if(originalUrl === '/impeach/article' || originalUrl === '/impeach/article/'){
                        return await createImpeachForArticle_async({req: req,applyRange:applyRange})
                    }
                    if(originalUrl === '/impeach/comment' || originalUrl === '/impeach/comment/'){
                        return await createImpeachForComment_async({req: req,applyRange:applyRange})
                    }
                }

                //为了获得articleId，将articleId放在URL，简化处理（否则需要formParse_async后处理fields）
                // if(originalUrl === '/impeach/uploadImage' || originalUrl === '/impeach/uploadImage/'){
                if(-1!==originalUrl.search('/impeach/uploadImage')){
                    userLoginCheck = {
                        needCheck: true,
                        error: controllerError.dispatch.post.notLoginCantCreateArticleImage
                    }
                    await controllerPreCheck.userStateCheck_async({req: req,userLoginCheck: userLoginCheck,penalizeCheck: penalizeCheck})
                    // expectedPart = [e_part.RECORD_ID] //articleId
                    // //是否为期望的part
                    // result = controllerPreCheck.inputCommonCheck({req: req, expectedPart: expectedPart})
                    // // ap.inf('inputCommonCheck result',result)
                    // if (result.rc > 0) {return Promise.reject(result)}

                    //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                    // ap.inf('before check',req.body.values)
                    await controllerChecker.ifObjectIdInPartCrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[collName],applyRange:applyRange})
                    // ap.inf('after check',req.body.values)
                    //对req中的recordId和recordInfo中加密的objectId进行解密
                    let userInfo = await controllerHelper.getLoginUserInfo_async({req: req})
                    // ap.inf('userInfo',userInfo)
                    let tempSalt = userInfo.tempSalt
                    // ap.inf('userInfo。tempSalt',userInfo.tempSalt)
                    // ap.inf('before decrypt',req.body.values)
                    // ap.inf('salt',tempSalt)
                    controllerHelper.decryptInputValue({req: req,expectedPart: expectedPart,salt: tempSalt,browserCollRule: browserInputRule[collName]})
                    // ap.inf('after decrypt',req.body.values)
                    //对输入值进行检测（此时objectId已经解密）
                    result = controllerPreCheck.inputPreCheck({req: req,expectedPart: expectedPart,collName: collName,applyRange: applyRange, arr_currentSearchRange: arr_currentSearchRange})
                    // ap.inf('create use inputPreCheck result',result)
                    if (result.rc > 0) {return Promise.reject(result)}
//检测url中objectId并解密objectId
                    await controllerPreCheck.checkObjectIdInReqParams_async({req:req,parameterName:'articleId',cryptedError:controllerError.dispatch.get.cryptedArticleIdFormatInvalid,decryptedError:controllerError.dispatch.get.decryptedArticleIdFormatInvalid})
                    return await uploadImage_async({req: req,applyRange:applyRange})
                }
            }
            break;
        case "put":
            if(originalUrl === '/impeach' || originalUrl === '/impeach/'){
                applyRange = e_applyRange.UPDATE_SCALAR
                userLoginCheck = {
                    needCheck: true,
                    error: controllerError.dispatch.put.notLoginCantUpdateImpeach
                }
                penalizeCheck = {
                    penalizeType: e_penalizeType.NO_IMPEACH,
                    penalizeSubType: e_penalizeSubType.UPDATE,
                    penalizeCheckError: controllerError.dispatch.put.userInPenalizeCantUpdateImpeach
                }
                await controllerPreCheck.userStateCheck_async({req: req,userLoginCheck: userLoginCheck,penalizeCheck: penalizeCheck})
                expectedPart = [e_part.RECORD_ID,e_part.RECORD_INFO] //articleId
                //是否为期望的part
                // ap.wrn('req.body.values',req.body.values)
                result = controllerPreCheck.inputCommonCheck({req: req, expectedPart: expectedPart})
                // ap.inf('inputCommonCheck result',result)
                if (result.rc > 0) {return Promise.reject(result)}

                //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                // ap.inf('before check',req.body.values)
                await controllerChecker.ifObjectIdInPartCrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[collName],applyRange:applyRange})
                // ap.inf('after check',req.body.values)
                //对req中的recordId和recordInfo中加密的objectId进行解密
                let userInfo = await controllerHelper.getLoginUserInfo_async({req: req})
                // ap.inf('userInfo',userInfo)
                let tempSalt = userInfo.tempSalt
                // ap.inf('userInfo。tempSalt',userInfo.tempSalt)
                // ap.inf('before decrypt',req.body.values)
                // ap.inf('salt',tempSalt)
                controllerHelper.decryptInputValue({req: req,expectedPart: expectedPart,salt: tempSalt,browserCollRule: browserInputRule[collName]})
                // ap.inf('after decrypt',req.body.values)
                //对输入值进行检测（此时objectId已经解密）
                result = controllerPreCheck.inputPreCheck({req: req,expectedPart: expectedPart,collName: collName,applyRange: applyRange, arr_currentSearchRange: arr_currentSearchRange})
                // ap.inf('create use inputPreCheck result',result)
                if (result.rc > 0) {return Promise.reject(result)}

                return await updateImpeach_async({req: req,applyRange:applyRange})
            }
            break;
        case "delete":
            if(originalUrl === '/impeach' || originalUrl === '/impeach/'){
                applyRange = e_applyRange.DELETE
                userLoginCheck = {
                    needCheck: true,
                    error: controllerError.dispatch.delete.notLoginCantDeleteImpeach
                }
/*                penalizeCheck = {
                    penalizeType: e_penalizeType.NO_IMPEACH,
                    penalizeSubType: e_penalizeSubType.UPDATE,
                    penalizeCheckError: controllerError.dispatch.put.userInPenalizeCantUpdateImpeach
                }*/
                await controllerPreCheck.userStateCheck_async({req: req,userLoginCheck: userLoginCheck,penalizeCheck: penalizeCheck})
                expectedPart = [e_part.RECORD_ID] //articleId
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req: req, expectedPart: expectedPart})
                // ap.inf('inputCommonCheck result',result)
                if (result.rc > 0) {return Promise.reject(result)}

                //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                // ap.inf('before check',req.body.values)
                await controllerChecker.ifObjectIdInPartCrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[collName],applyRange:applyRange})
                // ap.inf('after check',req.body.values)
                //对req中的recordId和recordInfo中加密的objectId进行解密
                let userInfo = await controllerHelper.getLoginUserInfo_async({req: req})
                // ap.inf('userInfo',userInfo)
                let tempSalt = userInfo.tempSalt
                // ap.inf('userInfo。tempSalt',userInfo.tempSalt)
                // ap.inf('before decrypt',req.body.values)
                // ap.inf('salt',tempSalt)
                controllerHelper.decryptInputValue({req: req,expectedPart: expectedPart,salt: tempSalt,browserCollRule: browserInputRule[collName]})
                // ap.inf('after decrypt',req.body.values)
                //对输入值进行检测（此时objectId已经解密）
                result = controllerPreCheck.inputPreCheck({req: req,expectedPart: expectedPart,collName: collName,applyRange: applyRange, arr_currentSearchRange: arr_currentSearchRange})
                // ap.inf('create use inputPreCheck result',result)
                if (result.rc > 0) {return Promise.reject(result)}

                return await deleteImpeach_async({req: req})
            }
            break;
    }



    // return Promise.resolve(tmpResult)
}

module.exports={
    impeach_dispatcher_async,
}