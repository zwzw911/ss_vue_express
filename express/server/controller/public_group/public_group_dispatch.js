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
const controllerError=require('./public_group_setting/public_group_controllerError').controllerError
const controllerSetting=require('./public_group_setting/public_group_setting').setting


/*                          controller                          */
const createPublicGroup_async=require('./public_group_logic/create_public_group').createPublicGroup_async
const updatePublicGroup_async=require('./public_group_logic/update_public_group').updatePublicGroup_async
// const updateSubFieldOnly_async=require('./user_friend_group_logic/update_user_friend_group_sub_field_only').updatePublicGroup_async
const deletePublicGroup_async=require('./public_group_logic/delete_public_group').deletePublicGroup_async
// const uploadImage_async=require('./impeach_logic/upload_impeach_image').uploadImpeachCommentFile_async
const removeMember_async=require('./public_group_operation/removeMember').removeMember_async
const creatorAddRemoveAdmin_async=require('./public_group_operation/creatorAddRemoveAdmin').creatorAddRemoveAdmin_async
const requestExit_async=require('./public_group_operation/requestExit').requestExit_async

async function dispatcher_async({req}){
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
    let expectedBaseUrl='public_group'
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
            applyRange = e_applyRange.CREATE
            if (baseUrl === `/${expectedBaseUrl}` || baseUrl === `/${expectedBaseUrl}/`) {
                userLoginCheck = {
                    needCheck: true,
                    error: controllerError.dispatch.post.notLoginCantCreatePublicGroup
                }
                penalizeCheck = {
                    penalizeType: e_penalizeType.NO_PUBLIC_GROUP,
                    penalizeSubType: e_penalizeSubType.CREATE,
                    penalizeCheckError: controllerError.dispatch.post.userInPenalizeCantCreatePublicGroup
                }
                await controllerPreCheck.userStatusCheck_async({req: req,userLoginCheck: userLoginCheck,penalizeCheck: penalizeCheck})
                expectedPart = [e_part.RECORD_INFO] //impeachId
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req: req, expectedPart: expectedPart})
                // ap.inf('inputCommonCheck result',result)
                if (result.rc > 0) {return Promise.reject(result)}

                //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                // ap.inf('before check',req.body.values)
                await controllerChecker.ifObjectIdInPartEncrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[collName],applyRange:applyRange})
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
                return await createPublicGroup_async({req: req,applyRange:applyRange})
            }
            break;
        case 'put':

            if (baseUrl === `/${expectedBaseUrl}` || baseUrl === `/${expectedBaseUrl}/`) {
                if(originalUrl=== `/${expectedBaseUrl}` || originalUrl===  `/${expectedBaseUrl}/` ){
                    applyRange = e_applyRange.UPDATE_SCALAR
                    userLoginCheck = {
                        needCheck: true,
                        error: controllerError.dispatch.put.notLoginCantUpdatePublicGroup
                    }
                    penalizeCheck = {
                        penalizeType: e_penalizeType.NO_PUBLIC_GROUP,
                        penalizeSubType: e_penalizeSubType.UPDATE,
                        penalizeCheckError: controllerError.dispatch.put.userInPenalizeCantUpdatePublicGroup
                    }
                    await controllerPreCheck.userStatusCheck_async({req: req,userLoginCheck: userLoginCheck,penalizeCheck: penalizeCheck})
                    expectedPart = [e_part.RECORD_ID,e_part.RECORD_INFO] //impeachId
                    //是否为期望的part
                    result = controllerPreCheck.inputCommonCheck({req: req, expectedPart: expectedPart})
                    // ap.inf('inputCommonCheck result',result)
                    if (result.rc > 0) {return Promise.reject(result)}

                    //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                    // ap.inf('before check',req.body.values)
                    await controllerChecker.ifObjectIdInPartEncrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[collName],applyRange:applyRange})
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
                    return await updatePublicGroup_async({req: req,applyRange:applyRange})
                }
                if(originalUrl===`/${expectedBaseUrl}/removeMember` || originalUrl===`/${expectedBaseUrl}/removeMember/`){
                    applyRange = e_applyRange.UPDATE_ARRAY
                    userLoginCheck = {
                        needCheck: true,
                        error: controllerError.dispatch.put.notLoginCantRemoveMember
                    }
                    await controllerPreCheck.userStatusCheck_async({req: req,userLoginCheck: userLoginCheck,penalizeCheck: penalizeCheck})
                    expectedPart = [e_part.RECORD_ID,e_part.MANIPULATE_ARRAY] //impeachId
                    //是否为期望的part
                    result = controllerPreCheck.inputCommonCheck({req: req, expectedPart: expectedPart})
                    // ap.inf('inputCommonCheck result',result)
                    if (result.rc > 0) {return Promise.reject(result)}

                    //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                    // ap.inf('before check',req.body.values)
                    await controllerChecker.ifObjectIdInPartEncrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[collName],applyRange:applyRange})
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
                    return removeMember_async({req:req})
                }
                if(originalUrl===`/${expectedBaseUrl}/requestExit` || originalUrl===`/${expectedBaseUrl}/requestExit/`){
                    applyRange = e_applyRange.UPDATE_ARRAY
                    userLoginCheck = {
                        needCheck: true,
                        error: controllerError.dispatch.put.notLoginCantExitPublicGroup
                    }
                    await controllerPreCheck.userStatusCheck_async({req: req,userLoginCheck: userLoginCheck,penalizeCheck: penalizeCheck})
                    expectedPart = [e_part.RECORD_ID] //publicGroupId
                    //是否为期望的part
                    result = controllerPreCheck.inputCommonCheck({req: req, expectedPart: expectedPart})
                    // ap.inf('inputCommonCheck result',result)
                    if (result.rc > 0) {return Promise.reject(result)}

                    //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                    // ap.inf('before check',req.body.values)
                    await controllerChecker.ifObjectIdInPartEncrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[collName],applyRange:applyRange})
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
                    return requestExit_async({req:req})
                }
                if(originalUrl===`/${expectedBaseUrl}/manageAdminMember` || originalUrl===`/${expectedBaseUrl}/manageAdminMember/`){
                    // ap.wrn('manageAdminMember in')
                    applyRange = e_applyRange.UPDATE_ARRAY
                    userLoginCheck = {
                        needCheck: true,
                        error: controllerError.dispatch.put.notLoginCantManageAdminMember
                    }
                    await controllerPreCheck.userStatusCheck_async({req: req,userLoginCheck: userLoginCheck,penalizeCheck: penalizeCheck})
                    expectedPart = [e_part.RECORD_ID,e_part.MANIPULATE_ARRAY] //impeachId
                    //是否为期望的part
                    result = controllerPreCheck.inputCommonCheck({req: req, expectedPart: expectedPart})
                    // ap.wrn('inputCommonCheck result',result)
                    if (result.rc > 0) {return Promise.reject(result)}

                    //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                    // ap.inf('before check',req.body.values)
                    await controllerChecker.ifObjectIdInPartEncrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[collName],applyRange:applyRange})
                    // ap.wrn('after check',req.body.values)
                    //对req中的recordId和recordInfo中加密的objectId进行解密
                    let userInfo = await controllerHelper.getLoginUserInfo_async({req: req})
                    // ap.inf('userInfo',userInfo)
                    let tempSalt = userInfo.tempSalt
                    // ap.inf('userInfo。tempSalt',userInfo.tempSalt)
                    // ap.inf('before decrypt',req.body.values)
                    // ap.inf('salt',tempSalt)
                    controllerHelper.decryptInputValue({req: req,expectedPart: expectedPart,salt: tempSalt,browserCollRule: browserInputRule[collName]})
                    // ap.wrn('after decrypt',req.body.values)
                    //对输入值进行检测（此时objectId已经解密）
                    result = controllerPreCheck.inputPreCheck({req: req,expectedPart: expectedPart,collName: collName,applyRange: applyRange, arr_currentSearchRange: arr_currentSearchRange})
                    // ap.inf('create use inputPreCheck result',result)
                    if (result.rc > 0) {return Promise.reject(result)}
                    return await creatorAddRemoveAdmin_async({req:req})
                }
            }
            break;
        case 'delete':
            applyRange = e_applyRange.DELETE
            if (baseUrl === `/${expectedBaseUrl}` || baseUrl === `/${expectedBaseUrl}/`) {
                userLoginCheck = {
                    needCheck: true,
                    error: controllerError.dispatch.delete.notLoginCantDeletePublicGroup
                }
                penalizeCheck = {
                    penalizeType: e_penalizeType.NO_PUBLIC_GROUP,
                    penalizeSubType: e_penalizeSubType.DELETE,
                    penalizeCheckError: controllerError.dispatch.delete.userInPenalizeCantDeletePublicGroup
                }
                await controllerPreCheck.userStatusCheck_async({req: req,userLoginCheck: userLoginCheck,penalizeCheck: penalizeCheck})
                expectedPart = [e_part.RECORD_ID] //impeachId
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req: req, expectedPart: expectedPart})
                // ap.inf('inputCommonCheck result',result)
                if (result.rc > 0) {return Promise.reject(result)}

                //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                // ap.inf('before check',req.body.values)
                await controllerChecker.ifObjectIdInPartEncrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[collName],applyRange:applyRange})
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
                return await deletePublicGroup_async({req: req,applyRange:applyRange})
            }
            break;
    }

}

module.exports={
    dispatcher_async
}