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
const controllerError=require('./user_friend_group_setting/user_friend_group_controllerError').controllerError
const controllerSetting=require('./user_friend_group_setting/user_friend_group_setting').setting


/*                          controller                          */
const getUserFriendGroup_async=require('./user_friend_group_logic/get_user_friend_group').getUserFriendGroup_async
const getUserFriendGroupAndItsMember_async=require('./user_friend_group_logic/get_user_friend_group').getUserFriendGroupAndItsMember_async
const getUserFriendGroupMember_async=require('./user_friend_group_logic/get_user_friend_group').getUserFriendGroupMember_async

const searchFriendInGroup_async=require('./user_friend_group_logic/search_friend_in_group').searchFriendInGroup_async

const create_async=require('./user_friend_group_logic/create_user_friend_group').createUserFriendGroup_async
const update_async=require('./user_friend_group_logic/update_user_friend_group').updateUserFriendGroup_async
// const updateSubFieldOnly_async=require('./user_friend_group_logic/update_user_friend_group_sub_field_only').updateUserFriendGroup_async
const delete_async=require('./user_friend_group_logic/delete_user_friend_group').deleteUserFriendGroup_async
// const uploadImage_async=require('./impeach_logic/upload_impeach_image').uploadImpeachCommentFile_async
const moveFriend_async=require('./user_friend_group_operation/move_friend').moveFriends_async

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
    let expectedBaseUrl='user_friend_group'
    ap.inf('originalUrl', originalUrl)
    // ap.inf('req.route.stack[0].method',req.route.stack[0].method)
    ap.inf('req.body', req.body)
    // ap.inf('req.params',req.params)
    /***   1. interval和robot检测   ***/
    await controllerPreCheck.commonPreCheck_async({req: req, collName: collName})
    /***   2. 根据method，以及url，进行对应的检查，最后调用处理函数   ***/
    /**    检查包括：用户是否登录/用户是否被处罚/输入值的格式和范围是否正确（POST/PUT） **/
    switch (req.route.stack[0].method) {
        case 'get':
            if(originalUrl===baseUrl){
                userLoginCheck = {
                    needCheck: true,
                    error: controllerError.dispatch.get.notLoginCantGetUserFriendGroup
                }
                await controllerPreCheck.userStateCheck_async({req: req,userLoginCheck: userLoginCheck,penalizeCheck: penalizeCheck})
                return await getUserFriendGroup_async({req: req})
            }
            if(originalUrl==='/user_friend_group/friends/' || originalUrl==='/user_friend_group/friends'){
                userLoginCheck = {
                    needCheck: true,
                    error: controllerError.dispatch.get.notLoginCantGetUserFriendGroupAndItsMember
                }
                await controllerPreCheck.userStateCheck_async({req: req,userLoginCheck: userLoginCheck,penalizeCheck: penalizeCheck})
                //只返回group，减轻数据流量
                return await getUserFriendGroup_async({req: req})
            }

            let friendsInGroup=new RegExp(`/user_friend_group/friendGroup/[0-9a-fA-F]{64}/?`)
            if (true===friendsInGroup.test(originalUrl)) {
                // ap.wrn('friendGroup/[0-9a-fA-F]{64} in')
                userLoginCheck = {
                    needCheck: true,
                    error: controllerError.dispatch.get.notLoginCantGetUserFriendGroupMember
                }
                await controllerPreCheck.userStateCheck_async({req: req,userLoginCheck: userLoginCheck,penalizeCheck: penalizeCheck})
                //检测url中objectId并解密
                await controllerPreCheck.checkObjectIdInReqParams_async({
                    req:req,
                    parameterName:'friendGroupId',
                    cryptedError:controllerError.dispatch.get.encryptedFriendGroupIdFormatInvalid,
                    decryptedError:controllerError.dispatch.get.decryptedFriendGroupIdFormatInvalid
                })
                // ap.wrn('check done')
                //只返回group，减轻数据流量
                return await getUserFriendGroupMember_async({req: req})
            }

            /**     搜索朋友    **/
            if ( -1!==originalUrl.search( '/user_friend_group/friend')) {
                userLoginCheck = {
                    needCheck: true,
                    error: controllerError.dispatch.get.notLoginCantSearchFriend
                }
                await controllerPreCheck.userStateCheck_async({req: req,userLoginCheck: userLoginCheck,penalizeCheck: penalizeCheck})

                let searchParamName=[{"paramName":"name","fieldName":e_field.USER.NAME,collName:e_coll.USER}]
                let result=controllerChecker.ifQueryStringAllParamValid({req:req,arr_queryParams:searchParamName})
                if(false===result){
                    return Promise.resolve({rc:0,msg:[]})
                }

                return await searchFriendInGroup_async({req: req,arr_queryParams:searchParamName})
            }
            break;
        case 'post':
            applyRange = e_applyRange.CREATE
            if (baseUrl === `/${expectedBaseUrl}` || baseUrl === `/${expectedBaseUrl}/`) {
                userLoginCheck = {
                    needCheck: true,
                    error: controllerError.dispatch.post.notLoginCantCreateUserFriendGroup
                }
                penalizeCheck = {
                    penalizeType: e_penalizeType.NO_USER_FRIEND_GROUP,
                    penalizeSubType: e_penalizeSubType.CREATE,
                    penalizeCheckError: controllerError.dispatch.post.userInPenalizeCantCreateUserFriendGroup
                }
                await controllerPreCheck.userStateCheck_async({req: req,userLoginCheck: userLoginCheck,penalizeCheck: penalizeCheck})
                expectedPart = [e_part.RECORD_INFO] //impeachId
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req: req, expectedPart: expectedPart})
                // ap.inf('inputCommonCheck result',result)
                if (result.rc > 0) {return Promise.reject(result)}

                //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                // ap.inf('before check',req.body.values)
                await controllerChecker.ifObjectIdInPartCrypted_async({req: req,expectedPart: expectedPart,browserCollRule: browserInputRule[collName],applyRange:applyRange})
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
                return await create_async({req: req,applyRange:applyRange})
            }
            break;
        case 'put':
            if (baseUrl === `/${expectedBaseUrl}` || baseUrl === `/${expectedBaseUrl}/`) {
                if(originalUrl=== `/${expectedBaseUrl}` || originalUrl===  `/${expectedBaseUrl}/` ){
                    applyRange = e_applyRange.UPDATE_SCALAR
                    userLoginCheck = {
                        needCheck: true,
                        error: controllerError.dispatch.put.notLoginCantUpdateUserFriendGroup
                    }
                    penalizeCheck = {
                        penalizeType: e_penalizeType.NO_USER_FRIEND_GROUP,
                        penalizeSubType: e_penalizeSubType.UPDATE,
                        penalizeCheckError: controllerError.dispatch.put.userInPenalizeCantUpdateUserFriendGroup
                    }
                    await controllerPreCheck.userStateCheck_async({req: req,userLoginCheck: userLoginCheck,penalizeCheck: penalizeCheck})
                    expectedPart = [e_part.RECORD_ID,e_part.RECORD_INFO] //impeachId
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
                    return await update_async({req: req,applyRange:applyRange})
                }
                //在不同的朋友组中移动朋友
                if(originalUrl=== `/${expectedBaseUrl}/move_friend` || originalUrl===  `/${expectedBaseUrl}/move_friend/` ){
                    applyRange = e_applyRange.UPDATE_ARRAY
                    userLoginCheck = {
                        needCheck: true,
                        error: controllerError.dispatch.put.notLoginCantMoveFriend
                    }
                    penalizeCheck = {
                        penalizeType: e_penalizeType.NO_USER_FRIEND_GROUP,
                        penalizeSubType: e_penalizeSubType.UPDATE,
                        penalizeCheckError: controllerError.dispatch.put.userInPenalizeCantMoveFriend
                    }
                    await controllerPreCheck.userStateCheck_async({req: req,userLoginCheck: userLoginCheck,penalizeCheck: penalizeCheck})
                    expectedPart = [e_part.EDIT_SUB_FIELD] //在2个不同的group中移动用户
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
                    return await moveFriend_async({req: req,applyRange:applyRange})
                }
            }

            break;
        case 'delete':
            applyRange = e_applyRange.DELETE
            if (baseUrl === `/${expectedBaseUrl}` || baseUrl === `/${expectedBaseUrl}/`) {
                userLoginCheck = {
                    needCheck: true,
                    error: controllerError.dispatch.delete.notLoginCantDeleteUserFriendGroup
                }
                penalizeCheck = {
                    penalizeType: e_penalizeType.NO_USER_FRIEND_GROUP,
                    penalizeSubType: e_penalizeSubType.DELETE,
                    penalizeCheckError: controllerError.dispatch.delete.userInPenalizeCantDeleteUserFriendGroup
                }
                await controllerPreCheck.userStateCheck_async({req: req,userLoginCheck: userLoginCheck,penalizeCheck: penalizeCheck})
                expectedPart = [e_part.RECORD_ID] //impeachId
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
                return await delete_async({req: req,applyRange:applyRange})
            }
            break;
    }
}

module.exports={
    dispatcher_async
}