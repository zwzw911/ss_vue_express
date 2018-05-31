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
const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule

/**************  controller相关常量  ****************/
const controllerError=require('./add_friend_setting/add_friend_controllerError').controllerError
const controllerSetting=require('./add_friend_setting/add_friend_setting').setting

const createAddFriend_async=require('./add_friend_logic/create_add_friend').createAddFriend_async
const acceptAddFriend_async=require('./add_friend_logic/update_add_friend').acceptAddFriend_async
const declineAddFriend_async=require('./add_friend_logic/update_add_friend').declineAddFriend_async
// const delete_async=require('./impeach_logic/delete_impeach').deleteImpeach_async
// const uploadImage_async=require('./impeach_logic/upload_impeach_image').uploadImpeachCommentFile_async


async function dispatcher_async({req}){
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
            if(baseUrl==='/add_friend' || baseUrl==='/add_friend/') {
                applyRange=e_applyRange.CREATE
                userLoginCheck={
                    needCheck:true,
                    error:controllerError.dispatch.post.notLoginCantCreateAddFriend
                }
                penalizeCheck={
                    penalizeType:e_penalizeType.NO_ADD_FRIEND,
                    penalizeSubType:e_penalizeSubType.CREATE,
                    penalizeCheckError:controllerError.dispatch.post.userInPenalizeCantCreateAddFriend
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
                if(result.rc>0){return Promise.reject(result)}

                result = await createAddFriend_async({req: req,expectedPart:expectedPart,applyRange:applyRange})
                return Promise.resolve(result)
            }
            break;
        case 'put':
            if(baseUrl==='/add_friend' || baseUrl==='/add_friend/') {
                applyRange=e_applyRange.UPDATE_SCALAR
                userLoginCheck={
                    needCheck:true,
                    error:controllerError.dispatch.put.notLoginCantUpdateAddFriend
                }
/*                penalizeCheck={
                    penalizeType:e_penalizeType.NO_FOLDER,
                    penalizeSubType:e_penalizeSubType.UPDATE,
                    penalizeCheckError:controllerError.dispatch.put.userInPenalizeCantUpdateComment
                }*/
                await controllerPreCheck.userStateCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})
                // ap.inf('create use userStateCheck_async done')
                expectedPart=[e_part.RECORD_ID]
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
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
                if(result.rc>0){return Promise.reject(result)}

                if(originalUrl==='/add_friend/accept' || originalUrl==='/add_friend/accept/'){
                    result = await acceptAddFriend_async({req: req,expectedPart:expectedPart,applyRange:applyRange})
                }
                if(originalUrl==='/add_friend/decline' || originalUrl==='/add_friend/decline/'){
                    result = await declineAddFriend_async({req: req,expectedPart:expectedPart,applyRange:applyRange})
                }
                return Promise.resolve(result)
            }
            break;
        default:
    }
    /*switch (method){
        case e_method.CREATE: //create:only for originator

            /!*          create 必须有impeachType（impeach_route中，根据URL设置）           *!/
            userLoginCheck={
                needCheck:true,
                error:controllerError.notLoginCantCreateAddFriend
            }

            penalizeCheck={
                penalizeType:e_penalizeType.NO_ADD_FRIEND,
                penalizeSubType:e_penalizeSubType.CREATE,
                penalizeCheckError:controllerError.currentUserForbidToCreateAddFriend
            }
            //此处RECORD_INFO只包含了一个字段：impeachArticle或者(comment)Id。
            // impeachType是由URL决定（是internal的field），需要和其他默认之合并之后，才能进行preCheck_async（否则validate value会fail）
            expectedPart=[e_part.RECORD_INFO]
            //recordInfo存在的情况下，才试图从中获得impeachArticle/CommentId，组成新纪录;否则，直接在preCheck中报错
            /!*if(undefined!==req.body.values[e_part.RECORD_INFO]){
                //默认值模拟client端格式，以便直接进行validate value的测试
                let defaultDocValue={}
                defaultDocValue[e_field.IMPEACH.TITLE]='新举报'
                defaultDocValue[e_field.IMPEACH.CONTENT]='对文档/评论的内容进行举报'
                //被举报的只能是article或者comment之一
                let articleOrCommentField=[e_field.IMPEACH.IMPEACHED_ARTICLE_ID,e_field.IMPEACH.IMPEACHED_COMMENT_ID]
                for(let singleFieldName of articleOrCommentField){
                    if(undefined!==req.body.values[e_part.RECORD_INFO][singleFieldName]){
                        defaultDocValue[singleFieldName]=req.body.values[e_part.RECORD_INFO][singleFieldName]
                        break;
                    }
                }
                //用内部产生的default取代client的输入
                req.body.values[e_part.RECORD_INFO]=defaultDocValue
            }*!/
            // console.log(`before preCheck_async===============>`)
            tmpResult=await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
            // console.log(`after preCheck_async===============>`)
            //tmpResult=await controllerHelper.preCheck_async({req:req,collName:collConfig.collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
            // tmpResult=await createContent_async({req:req,collConfig:collConfig,collImageConfig:collImageConfig})
            tmpResult=await create_async({req:req})
            break;
        case e_method.SEARCH:// search
            break;
        case e_method.UPDATE: //update
            userLoginCheck={
                needCheck:true,
                error:controllerError.notLoginCantUpdateAddFriend
            }
            penalizeCheck={
                penalizeType:e_penalizeType.NO_ADD_FRIEND,
                penalizeSubType:e_penalizeSubType.UPDATE,
                penalizeCheckError:controllerError.currentUserForbidToUpdateAddFriend
            }

            expectedPart=[e_part.RECORD_INFO,e_part.RECORD_ID]
            // console.log(`update preCheck start============>`)
            tmpResult=await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
            //tmpResult=await controllerHelper.preCheck_async({req:req,collName:collConfig.collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
            // ap.print('update preCheck result',tmpResult)

            /!*      执行逻辑                *!/
            tmpResult=await update_async({req:req,expectedPart:expectedPart})
            break;
        case e_method.DELETE: //delete
            /!*userLoginCheck={
                needCheck:true,
                error:controllerError.userNotLoginCantDelete
            }
            penalizeCheck={
                penalizeType:e_penalizeType.NO_IMPEACH,
                penalizeSubType:e_penalizeSubType.DELETE,
                penalizeCheckError:controllerError.userInPenalizeNoImpeachDelete
            }
            expectedPart=[e_part.RECORD_ID]
            tmpResult=await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
            tmpResult=await delete_async({req:req})*!/
            break;
        case e_method.MATCH: //match(login_async)
            break;
        case e_method.UPLOAD:
            /!*userLoginCheck={
                needCheck:true,
                error:controllerError.notLoginCantUploadFileForImpeachComment
            }
            penalizeCheck={
                // penalizeType:e_penalizeType.NO_IMPEACH_COMMENT,
                // penalizeSubType:e_penalizeSubType.CREATE,
                // penalizeCheckError:controllerError.currentUserForbidToCreateImpeachComment
            }

            expectedPart=[e_part.RECORD_ID]
            tmpResult=await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
            if(type===e_uploadFileType.IMAGE){
                tmpResult=await uploadImage_async({req:req})
            }*!/

            break;
    }*/

    // return Promise.resolve(tmpResult)
}

module.exports={
    dispatcher_async
}