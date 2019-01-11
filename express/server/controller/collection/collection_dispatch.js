/**
 * Created by Ada on 2017/7/9.
 * url：
 *  1. /user，根据method的不同，调用不同的函数进行对应的处理
 *  2. /user/unique: 用户注册的时候，对应用户名/账号进行唯一性检查
 */
'use strict'

/****************   内置lib和第三方lib   ******************/
const ap=require('awesomeprint')
/**************  controller相关常量  ****************/
const controllerError=require('./collection_setting/collection_controllerError').controllerError
const controllerSetting=require('./collection_setting/collection_setting').setting
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






/**************  逻辑处理  ****************/
const createCollection_async=require('./collection_logic/create_collection').createCollection_async
const deleteCollection_async=require('./collection_logic/delete_collection').deleteCollection_async
const getTopLevelCollection_async=require('./collection_logic/get_collection').getTopLevelCollection_async
const get2ndLevelCollection_async=require('./collection_logic/get_collection').get2ndLevelCollection_async
const getAllCollection_async=require('./collection_logic/get_collection').getAllCollection_async
const getCollectionContent_async=require('./collection_logic/get_collection_content').getCollectionContent_async
const updateCollection_async=require('./collection_logic/update_collection').updateCollection_async
const updateCollectionArticleTopic_async=require('./collection_logic/update_collection_article_topic').updateCollectionArticleTopic_async
// const getAllSendRecommend_async=require('./collection_logic/get_send_recommend').getAllSendRecommend_async
// const updateReceiveRecommendAsRead_async=require('./collection_logic/update_received_recommend').updateReceiveRecommendAsRead_async


async function collection_dispatcher_async({req}) {
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
            //获得当前用户所有 collection(list)
            if (originalUrl === '/collection/top' || originalUrl === '/collection/top/'
            || originalUrl === '/collection/nonTop' || originalUrl === '/collection/nonTop/'
                || originalUrl === '/collection/all' || originalUrl === '/collection/all/') {
                // applyRange = e_applyRange.CREATE
                userLoginCheck = {
                    needCheck: true,
                    error: controllerError.dispatch.get.notLoginCantGetCollectionList
                }
                penalizeCheck = {
                    penalizeType: e_penalizeType.NO_COLLECTION,
                    penalizeSubType: e_penalizeSubType.READ,
                    penalizeCheckError: controllerError.dispatch.get.userInPenalizeCantGetCollectionList
                }
                await controllerPreCheck.userStatusCheck_async({
                    req: req,
                    userLoginCheck: userLoginCheck,
                    penalizeCheck: penalizeCheck
                })
/*                expectedPart=[]
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                if (result.rc > 0) {return Promise.reject(result)}*/
                if (originalUrl === '/collection/top' || originalUrl === '/collection/top/'){
                    result = await getTopLevelCollection_async({req: req})
                }else if(originalUrl === '/collection/nonTop' || originalUrl === '/collection/nonTop/'){
                    result = await get2ndLevelCollection_async({req: req})
                }else if(originalUrl === '/collection/all' || originalUrl === '/collection/all/'){
                    result = await getAllCollection_async({req: req})
                }
                else{

                    return Promise.reject(controllerError.dispatch.get.unknownTypeInUrl)
                }

                return Promise.resolve(result)
            }
            //获得 单个collection的内容
            let singleCollection=new RegExp(`/collection/[0-9a-fA-F]{64}/?`)
            if (true===singleCollection.test(originalUrl)) {
                ap.wrn('get content in')
                // applyRange = e_applyRange.CREATE
                userLoginCheck = {
                    needCheck: true,
                    error: controllerError.dispatch.get.notLoginCantGetCollectionContent
                }
                penalizeCheck = {
                    penalizeType: e_penalizeType.NO_COLLECTION,
                    penalizeSubType: e_penalizeSubType.READ,
                    penalizeCheckError: controllerError.dispatch.get.userInPenalizeCantGetCollectionContent
                }
                await controllerPreCheck.userStatusCheck_async({
                    req: req,
                    userLoginCheck: userLoginCheck,
                    penalizeCheck: penalizeCheck
                })

                await controllerPreCheck.checkObjectIdInReqParams_async({req:req,parameterName:'collectionId',encryptedError:controllerError.dispatch.get.encryptedObjectIdFormatInvalid,decryptedError:controllerError.dispatch.get.decryptedObjectIdFormatInvalid})

                result = await getCollectionContent_async({req: req})
                return Promise.resolve(result)
            }

            break;
        case 'post':
            /**     创建分享        **/
            if (originalUrl === '/collection' || originalUrl === '/collection/') {
                // ap.inf('create collection in')
                applyRange = e_applyRange.CREATE
                userLoginCheck = {
                    needCheck: true,
                    error: controllerError.dispatch.post.notLoginCantCreateCollection
                }
                penalizeCheck = {
                    penalizeType: e_penalizeType.NO_COLLECTION,
                    penalizeSubType: e_penalizeSubType.CREATE,
                    penalizeCheckError: controllerError.dispatch.post.userInPenalizeCantCreateCollection
                }
                await controllerPreCheck.userStatusCheck_async({
                    req: req,
                    userLoginCheck: userLoginCheck,
                    penalizeCheck: penalizeCheck
                })
                expectedPart=[e_part.RECORD_INFO] //name和parentId
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                // ap.inf('inputCommonCheck check result',result)
                if (result.rc > 0) {return Promise.reject(result)}

                //对req中的recordId和recordInfo中（加密过的）objectId进行格式判断
                // ap.inf('before check decrypt',req.body.values)
                await controllerChecker.ifObjectIdInPartEncrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[e_coll.COLLECTION],applyRange:applyRange})
                // ap.inf('after check decrypt',req.body.values)
                //对req中的recordId和recordInfo中加密的objectId进行解密
                let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
                // ap.inf('userInfo',userInfo)
                let tempSalt=userInfo.tempSalt
                // ap.inf('before decrypt',req.body.values)
                // ap.inf('salt',tempSalt)
                controllerHelper.decryptInputValue({req:req,expectedPart:expectedPart,salt:tempSalt,browserCollRule:browserInputRule[e_coll.COLLECTION]})
// ap.inf('after decrypt',req.body.values)
                //recordInfo的检查
                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:e_coll.COLLECTION,applyRange:applyRange,arr_currentSearchRange:arr_currentSearchRange})
                // ap.inf('create use inputPreCheck result',result)
                if(result.rc>0){return Promise.reject(result)}
                result = await createCollection_async({req: req,applyRange:applyRange})
                return Promise.resolve(result)
            }
            break;
        case 'put':
            /**     更新collection的名称     **/
            if (originalUrl === '/collection/name' || originalUrl === '/collection/name/') {
                // ap.inf('create recommend in')
                applyRange = e_applyRange.UPDATE_SCALAR
                userLoginCheck = {
                    needCheck: true,
                    error: controllerError.dispatch.put.notLoginCantUpdateCollectionName
                }
                penalizeCheck = {
                    penalizeType: e_penalizeType.NO_COLLECTION,
                    penalizeSubType: e_penalizeSubType.UPDATE,
                    penalizeCheckError: controllerError.dispatch.put.userInPenalizeCantUpdateCollectionName
                }
                await controllerPreCheck.userStatusCheck_async({
                    req: req,
                    userLoginCheck: userLoginCheck,
                    penalizeCheck: penalizeCheck
                })
                expectedPart = [e_part.RECORD_ID,e_part.RECORD_INFO]
                //是否为期望的part，且每个part的整体格式是否正确
                result = controllerPreCheck.inputCommonCheck({req: req, expectedPart: expectedPart})
                if (result.rc > 0) {
                    return Promise.reject(result)
                }

                await controllerChecker.ifObjectIdInPartEncrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[e_coll.COLLECTION],applyRange:applyRange})
                // ap.inf('after check decrypt',req.body.values[e_part.RECORD_INFO])
                //对req中的recordId和recordInfo中加密的objectId进行解密
                let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
                // ap.inf('userInfo',userInfo)
                let tempSalt=userInfo.tempSalt
                // ap.inf('before decrypt',req.body.values)
                // ap.inf('salt',tempSalt)
                controllerHelper.decryptInputValue({req:req,expectedPart:expectedPart,salt:tempSalt,browserCollRule:browserInputRule[e_coll.COLLECTION]})
// ap.inf('after decrypt',req.body.values[e_part.RECORD_INFO])
                //recordInfo的检查
                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:e_coll.COLLECTION,applyRange:applyRange,arr_currentSearchRange:arr_currentSearchRange})
                // ap.inf('create use inputPreCheck result',result)
                if(result.rc>0){return Promise.reject(result)}

                result = await updateCollection_async({req: req})
                return Promise.resolve(result)
            }
            /**     更新collection的名称     **/
            if (originalUrl === '/collection/content' || originalUrl === '/collection/content/') {
                applyRange = e_applyRange.UPDATE_ARRAY
                userLoginCheck = {
                    needCheck: true,
                    error: controllerError.dispatch.put.notLoginCantUpdateCollectionContent
                }
                penalizeCheck = {
                    penalizeType: e_penalizeType.NO_COLLECTION,
                    penalizeSubType: e_penalizeSubType.UPDATE,
                    penalizeCheckError: controllerError.dispatch.put.userInPenalizeCantUpdateCollectionContent
                }
                await controllerPreCheck.userStatusCheck_async({
                    req: req,
                    userLoginCheck: userLoginCheck,
                    penalizeCheck: penalizeCheck
                })
                expectedPart = [e_part.EDIT_SUB_FIELD]
                //是否为期望的part，且每个part的整体格式是否正确
                result = controllerPreCheck.inputCommonCheck({req: req, expectedPart: expectedPart})
                if (result.rc > 0) {
                    return Promise.reject(result)
                }

                await controllerChecker.ifObjectIdInPartEncrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[e_coll.COLLECTION],applyRange:applyRange})
                // ap.inf('after check decrypt',req.body.values[e_part.RECORD_INFO])
                //对req中的recordId和recordInfo中加密的objectId进行解密
                let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
                // ap.inf('userInfo',userInfo)
                let tempSalt=userInfo.tempSalt
                // ap.inf('before decrypt',req.body.values)
                // ap.inf('salt',tempSalt)
                controllerHelper.decryptInputValue({req:req,expectedPart:expectedPart,salt:tempSalt,browserCollRule:browserInputRule[e_coll.COLLECTION]})
// ap.inf('after decrypt',req.body.values[e_part.RECORD_INFO])
                //recordInfo的检查
                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:e_coll.COLLECTION,applyRange:applyRange,arr_currentSearchRange:arr_currentSearchRange})
                // ap.inf('create use inputPreCheck result',result)
                if(result.rc>0){return Promise.reject(result)}
                result = await updateCollectionArticleTopic_async({req: req})
                return Promise.resolve(result)
            }
            break;
        case 'delete':
            if (originalUrl === '/collection' || originalUrl === '/collection/'){
                userLoginCheck = {
                    needCheck: true,
                    error: controllerError.dispatch.delete.notLoginCantDeleteCollection
                }
                penalizeCheck = {
                    penalizeType: e_penalizeType.NO_COLLECTION,
                    penalizeSubType: e_penalizeSubType.DELETE,
                    penalizeCheckError: controllerError.dispatch.delete.userInPenalizeCantDeleteCollection
                }
                await controllerPreCheck.userStatusCheck_async({
                    req: req,
                    userLoginCheck: userLoginCheck,
                    penalizeCheck: penalizeCheck
                })


                expectedPart = [e_part.RECORD_ID] //此处RECORD_ID为attachment的id
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


                result = await deleteCollection_async({req: req})
                return Promise.resolve(result)
            }
            break;
        default:
    }
}

module.exports={
    collection_dispatcher_async,
    // controllerError,
}