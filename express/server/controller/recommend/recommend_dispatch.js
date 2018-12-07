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
// const e_uploadFileType=nodeEnum.UploadFileType
const e_part=nodeEnum.ValidatePart

const mongoEnum=server_common_file_require.mongoEnum
const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB

const e_field=require(`../../constant/genEnum/DB_field`).Field
const e_coll=require(`../../constant/genEnum/DB_Coll`).Coll

const e_searchRange=server_common_file_require.inputDataRuleType.SearchRange
const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange

const e_fieldChineseName=require('../../constant/genEnum/inputRule_field_chineseName').ChineseName

const regex=server_common_file_require.regex.regex
/**************  rule  ****************/
const internalInputRule=require('../../constant/inputRule/internalInputRule').internalInputRule
const inputRule=require('../../constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule

/**************  controller相关常量  ****************/
const controllerError=require('./recommend_setting/recommend_controllerError').controllerError
const controllerSetting=require('./recommend_setting/recommend_setting').setting




/**************  逻辑处理  ****************/
const createRecommend_async=require('./recommend_logic/create_recommend').createRecommend_async
const getUnreadReceiveRecommend_async=require('./recommend_logic/get_receive_recommend').getUnreadReceiveRecommend_async
const getReadReceiveRecommend_async=require('./recommend_logic/get_receive_recommend').getReadReceiveRecommend_async
const getAllSendRecommend_async=require('./recommend_logic/get_send_recommend').getAllSendRecommend_async
const updateReceiveRecommendAsRead_async=require('./recommend_logic/update_received_recommend').updateReceiveRecommendAsRead_async


async function recommend_dispatcher_async({req}) {
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
    ap.inf('req.baseUrl', req.baseUrl)
    ap.inf('originalUrl',originalUrl)
    // ap.inf('req.route.stack[0].method',req.route.stack[0].method)
    ap.inf('req.body', req.body)
    ap.inf('req.path', req.path)
    // ap.inf('req.params',req.params)
    /***   1. interval和robot检测   ***/
    await controllerPreCheck.commonPreCheck_async({req: req, collName: collName})
    /***   2. 根据method，以及url，进行对应的检查，最后调用处理函数   ***/
    /**    检查包括：用户是否登录/用户是否被处罚/输入值的格式和范围是否正确（POST/PUT） **/
    switch (req.route.stack[0].method) {
        case 'get':
            //获得所有接受到的 未读的 分享
            if (originalUrl === '/recommend/getUnreadRecommend' || originalUrl === '/recommend/getUnreadRecommend/') {
                // applyRange = e_applyRange.CREATE
                userLoginCheck = {
                    needCheck: true,
                    error: controllerError.dispatch.get.notLoginCantGetUnreadRecommend
                }
                penalizeCheck = {
                    penalizeType: e_penalizeType.NO_RECOMMEND,
                    penalizeSubType: e_penalizeSubType.READ,
                    penalizeCheckError: controllerError.dispatch.get.userInPenalizeCantGetUnreadRecommend
                }
                await controllerPreCheck.userStateCheck_async({
                    req: req,
                    userLoginCheck: userLoginCheck,
                    penalizeCheck: penalizeCheck
                })
/*                expectedPart=[]
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                if (result.rc > 0) {return Promise.reject(result)}*/

                result = await getUnreadReceiveRecommend_async({req: req})
                return Promise.resolve(result)
            }
            //获得所有接受到的 未读的 分享
            if (originalUrl === '/recommend/getReadRecommend' || originalUrl === '/recommend/getReadRecommend/') {
                // applyRange = e_applyRange.CREATE
                userLoginCheck = {
                    needCheck: true,
                    error: controllerError.dispatch.get.notLoginCantGetReadRecommend
                }
                penalizeCheck = {
                    penalizeType: e_penalizeType.NO_RECOMMEND,
                    penalizeSubType: e_penalizeSubType.READ,
                    penalizeCheckError: controllerError.dispatch.get.userInPenalizeCantGetReadRecommend
                }
                await controllerPreCheck.userStateCheck_async({
                    req: req,
                    userLoginCheck: userLoginCheck,
                    penalizeCheck: penalizeCheck
                })
                /*                expectedPart=[]
                                //是否为期望的part
                                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                                if (result.rc > 0) {return Promise.reject(result)}*/

                result = await getReadReceiveRecommend_async({req: req})
                return Promise.resolve(result)
            }
            //获得所有发送出去的分享
            if (originalUrl === '/recommend/getSendRecommend' || originalUrl === '/recommend/getSendRecommend/') {
                userLoginCheck = {
                    needCheck: true,
                    error: controllerError.dispatch.get.notLoginCantGetSendRecommend
                }
                penalizeCheck = {
                    penalizeType: e_penalizeType.NO_RECOMMEND,
                    penalizeSubType: e_penalizeSubType.READ,
                    penalizeCheckError: controllerError.dispatch.get.userInPenalizeCantGetSendRecommend
                }
                await controllerPreCheck.userStateCheck_async({
                    req: req,
                    userLoginCheck: userLoginCheck,
                    penalizeCheck: penalizeCheck
                })
                /*                expectedPart=[]
                                //是否为期望的part
                                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                                if (result.rc > 0) {return Promise.reject(result)}*/

                result = await getAllSendRecommend_async({req: req})
                return Promise.resolve(result)
            }
            break;
        case 'post':
            /**     创建分享        **/
            if (originalUrl === '/recommend' || originalUrl === '/recommend/') {
                // ap.inf('create recommend in')
                applyRange = e_applyRange.CREATE
                userLoginCheck = {
                    needCheck: true,
                    error: controllerError.dispatch.post.notLoginCantCreateRecommend
                }
                penalizeCheck = {
                    penalizeType: e_penalizeType.NO_RECOMMEND,
                    penalizeSubType: e_penalizeSubType.CREATE,
                    penalizeCheckError: controllerError.dispatch.post.userInPenalizeCantCreateRecommend
                }
                await controllerPreCheck.userStateCheck_async({
                    req: req,
                    userLoginCheck: userLoginCheck,
                    penalizeCheck: penalizeCheck
                })
                expectedPart=[e_part.RECORD_INFO]
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                if (result.rc > 0) {return Promise.reject(result)}

                //对req中的recordId和recordInfo中（加密过的）objectId进行格式判断
                // ap.inf('before check decrypt',req.body.values[e_part.RECORD_INFO])
                await controllerChecker.ifObjectIdInPartCrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[e_coll.SEND_RECOMMEND],applyRange:applyRange})
                // ap.inf('after check decrypt',req.body.values[e_part.RECORD_INFO])
                //对req中的recordId和recordInfo中加密的objectId进行解密
                let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
                // ap.inf('userInfo',userInfo)
                let tempSalt=userInfo.tempSalt
                // ap.inf('before decrypt',req.body.values)
                // ap.inf('salt',tempSalt)
                controllerHelper.decryptInputValue({req:req,expectedPart:expectedPart,salt:tempSalt,browserCollRule:browserInputRule[e_coll.SEND_RECOMMEND]})
// ap.inf('after decrypt',req.body.values[e_part.RECORD_INFO])
                //recordInfo的检查
                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:e_coll.SEND_RECOMMEND,applyRange:applyRange,arr_currentSearchRange:arr_currentSearchRange})
                // ap.inf('create use inputPreCheck result',result)
                if(result.rc>0){return Promise.reject(result)}
                result = await createRecommend_async({req: req,applyRange:applyRange})
                return Promise.resolve(result)
            }
            break;
        case 'put':
            /**     读取接收到的 未读 分享，变成 已读**/
            if (originalUrl === '/recommend/readUnreadRecommend' || originalUrl === '/recommend/readUnreadRecommend/') {
                // ap.inf('create recommend in')
                // applyRange = e_applyRange.CREATE
                userLoginCheck = {
                    needCheck: true,
                    error: controllerError.dispatch.put.notLoginCantUpdateReceivedRecommend
                }
               /* penalizeCheck = {
                    penalizeType: e_penalizeType.NO_RECOMMEND,
                    penalizeSubType: e_penalizeSubType.CREATE,
                    penalizeCheckError: controllerError.dispatch.post.userInPenalizeCantCreateRecommend
                }*/
                await controllerPreCheck.userStateCheck_async({
                    req: req,
                    userLoginCheck: userLoginCheck,
                    penalizeCheck: penalizeCheck
                })
                expectedPart = [e_part.RECORD_ID]
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req: req, expectedPart: expectedPart})
                if (result.rc > 0) {
                    return Promise.reject(result)
                }

                await controllerChecker.ifObjectIdInPartCrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[e_coll.SEND_RECOMMEND],applyRange:applyRange})
                // ap.inf('after check decrypt',req.body.values[e_part.RECORD_INFO])
                //对req中的recordId和recordInfo中加密的objectId进行解密
                let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
                // ap.inf('userInfo',userInfo)
                let tempSalt=userInfo.tempSalt
                // ap.inf('before decrypt',req.body.values)
                // ap.inf('salt',tempSalt)
                controllerHelper.decryptInputValue({req:req,expectedPart:expectedPart,salt:tempSalt,browserCollRule:browserInputRule[e_coll.SEND_RECOMMEND]})
// ap.inf('after decrypt',req.body.values[e_part.RECORD_INFO])
                //recordInfo的检查
                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:e_coll.SEND_RECOMMEND,applyRange:applyRange,arr_currentSearchRange:arr_currentSearchRange})
                // ap.inf('create use inputPreCheck result',result)
                if(result.rc>0){return Promise.reject(result)}

                result = await updateReceiveRecommendAsRead_async({req: req})
                return Promise.resolve(result)
            }
            break;
        case 'delete':

            break;
        default:
    }
}

module.exports={
    recommend_dispatcher_async,
    // controllerError,
}