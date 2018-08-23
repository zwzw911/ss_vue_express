/**
 * Created by 张伟 on 2018/04/23.
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
const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule

/**************  controller相关常量  ****************/
const controllerError=require(`./folder_setting/folder_controllerError`).controllerError
const controllerSetting=require('./folder_setting/folder_setting').setting

/**************  controller处理函数  ****************/
const createFolder_async=require('./folder_logic/create_folder').createFolder_async
const getRootFolder_async=require('./folder_logic/get_folder').getRootFolder_async
const getNonRootFolder_async=require('./folder_logic/get_folder').getNonRootFolder_async
const updateFolder_async=require('./folder_logic/update_folder').updateFolder_async
const deleteFolder_async=require('./folder_logic/delete_folder').deleteFolder_async



/*******************************************************************************/
/***********    对CRUD（输入参数带有method）操作调用对应的函数  ****************/
/*******************************************************************************/
async function dispatcher_async(req){

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
    let collName=controllerSetting.MAIN_HANDLED_COLL_NAME
    let expectedPart
    let result=dispatchError.common.unknownRequestUrl
    let tmpResult
    let applyRange
    // ap.inf('originalUrl',originalUrl)
    // ap.inf('req.route.stack[0].method',req.route.stack[0].method)
    ap.inf('req.body.values',req.body.values)
    // ap.inf('req.params',req.params)
    /***   1. interval和robot检测   ***/
    await controllerPreCheck.commonPreCheck_async({req:req,collName:collName})
    // ap.inf('commonPreCheck_async done')
    /***   2. 根据method，以及url，进行对应的检查，最后调用处理函数   ***/
    /**    检查包括：用户是否登录/用户是否被处罚/输入值的格式和范围是否正确（POST/PUT） **/
    switch (req.route.stack[0].method) {
        case 'get':
            //get只能在url中包含参数，所以无inputPreCheck

            // ap.inf('req.params',req.params)
            // if(originalUrl==='/folder' || originalUrl==='/folder/') {
            userLoginCheck={
                needCheck:true,
                error:controllerError.dispatch.get.notLoginCantGetFolder
            }

            await controllerPreCheck.userStateCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})

            //获得顶级目录
            if(undefined===req.params.folderId){
                result = await getRootFolder_async({req: req})

            }else{
                //获得非顶层目录的内容
                /*********  url（get）中的objectId的检查，不使用单一函数，因为需要具体的错误信息  *********/
                await controllerPreCheck.checkObjectIdInReqParams_async({req:req,parameterName:'folderId',cryptedError:controllerError.dispatch.get.cryptedFolderIdFormatInvalid,decryptedError:controllerError.dispatch.get.decryptedFolderIdFormatInvalid})
                /*let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
                let tempSalt=userInfo.tempSalt
                //判断加密的objectId格式
                let cryptedObjectId=req.params.folderId
                if(false===controllerChecker.ifObjectIdCrypted({objectId:cryptedObjectId})){
                    return Promise.reject(controllerError.dispatch.get.cryptedFolderIdFormatInvalid)
                }
                //解密
                tmpResult=crypt.decryptSingleFieldValue({fieldValue:cryptedObjectId,salt:tempSalt})
                if(tmpResult.rc>0){
                    return Promise.reject(tmpResult)
                }
                req.params.folderId=tmpResult.msg
                // ap.inf('decryptedObjectId',req.params.folderId)
                //判断解密的objectId
                if(false===regex.objectId.test(req.params.folderId)){
                    return Promise.reject(controllerError.dispatch.get.decryptedFolderIdFormatInvalid)
                }*/
                //逻辑
                result = await getNonRootFolder_async({req: req})
            }
            return Promise.resolve(result)
            // if(result.rc>0){return Promise.reject(result)}

            // }
            // break;
        case 'post':
            if(originalUrl==='/folder' || originalUrl==='/folder/') {
                applyRange=e_applyRange.CREATE
                userLoginCheck={
                    needCheck:true,
                    error:controllerError.dispatch.post.notLoginCantCreateFolder
                }
                penalizeCheck={
                    penalizeType:e_penalizeType.NO_FOLDER,
                    penalizeSubType:e_penalizeSubType.UPDATE,
                    penalizeCheckError:controllerError.dispatch.post.userInPenalizeCantCreateComment
                }
                await controllerPreCheck.userStateCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})
                // ap.inf('create use userStateCheck_async done')
                expectedPart=[e_part.RECORD_INFO]
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                if (result.rc > 0) {return Promise.reject(result)}

                //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                // ap.inf('before check decrypt',req.body.values[e_part.RECORD_INFO])
                await controllerChecker.ifObjectIdInPartCrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[collName],applyRange:applyRange})
                // ap.inf('after check decrypt',req.body.values[e_part.RECORD_INFO])
                //对req中的recordId和recordInfo中加密的objectId进行解密
                let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
                // ap.inf('userInfo',userInfo)
                let tempSalt=userInfo.tempSalt
                // ap.inf('before decrypt',req.body.values)
                // ap.inf('salt',tempSalt)
                controllerHelper.decryptInputValue({req:req,expectedPart:expectedPart,salt:tempSalt,browserCollRule:browserInputRule[collName]})
// ap.inf('after decrypt',req.body.values[e_part.RECORD_INFO])
                //recordInfo的检查
                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:collName,applyRange:applyRange,arr_currentSearchRange:arr_currentSearchRange})
                // ap.inf('create use inputPreCheck result',result)
                if(result.rc>0){return Promise.reject(result)}
                result = await createFolder_async({req: req,applyRange:applyRange})
                return Promise.resolve(result)
            }
            break
        case 'delete':
            //delete可以如POST/PUT一样，传入参数
            if(originalUrl==='/folder' || originalUrl==='/folder/') {
                applyRange=e_applyRange.DELETE
                userLoginCheck={
                    needCheck:true,
                    error:controllerError.dispatch.delete.notLoginCantDeleteFolder
                }
                // ap.inf('before userStateCheck_async ')
                await controllerPreCheck.userStateCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})
// ap.inf('userStateCheck_async done')
                expectedPart=[e_part.RECORD_ID]
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                // ap.inf('inputCommonCheck result',result)
                if (result.rc > 0) {return Promise.reject(result)}

                //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                // ap.inf('before check decrypt',req.body.values[e_part.RECORD_ID])
                await controllerChecker.ifObjectIdInPartCrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[collName],applyRange:applyRange})
                // ap.inf('after check decrypt',req.body.values[e_part.RECORD_ID])
                //对req中的recordId和recordInfo中加密的objectId进行解密
                let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
                let tempSalt=userInfo.tempSalt
                controllerHelper.decryptInputValue({req:req,expectedPart:expectedPart,salt:tempSalt,browserCollRule:browserInputRule[collName]})
                // ap.inf('after decrypt',req.body.values[e_part.RECORD_ID])
                result = await deleteFolder_async({req: req})
                return Promise.resolve(result)
            }
            break;
        case 'put':
            if(originalUrl==='/folder' || originalUrl==='/folder/') {
                // ap.inf('put in')
                applyRange=e_applyRange.UPDATE_SCALAR
                userLoginCheck={
                    needCheck:true,
                    error:controllerError.dispatch.put.notLoginCantUpdateFolder
                }
                penalizeCheck={
                    penalizeType:e_penalizeType.NO_FOLDER,
                    penalizeSubType:e_penalizeSubType.UPDATE,
                    penalizeCheckError:controllerError.dispatch.put.userInPenalizeCantUpdateComment
                }
                await controllerPreCheck.userStateCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})
                // ap.inf('create use userStateCheck_async done')
                expectedPart=[e_part.RECORD_INFO,e_part.RECORD_ID]
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
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
                // ap.inf('create use inputPreCheck result',result)
                if(result.rc>0){return Promise.reject(result)}
                result = await updateFolder_async({req: req,applyRange:applyRange})
                return Promise.resolve(result)
            }
            break;
        default:
            // return Promise.reject()

    }



}


module.exports={
    dispatcher_async,
}