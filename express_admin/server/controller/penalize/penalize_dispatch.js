/**
 * Created by ada on 2017/9/30.
 */
'use strict'
const ap=require('awesomeprint')
/**********  dispatch相关常量  ***********/
const controllerError=require('./penalize_setting/penalize_controllerError').controllerError
const controllerSetting=require('./penalize_setting/penalize_setting').setting

const server_common_file_require=require('../../../server_common_file_require')
/************   公共常量 ***************/
const nodeEnum=server_common_file_require.nodeEnum
const e_part=nodeEnum.ValidatePart
// const e_applyRange=nodeEnum.ApplyRange//require('../../constant/enum/node').Method
const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange
/*************   公共函数 ************/
const controllerHelper=server_common_file_require.controllerHelper
const controllerPreCheck=server_common_file_require.controllerPreCheck
const controllerChecker=server_common_file_require.controllerChecker
/*************   其他常量   ************/
const e_searchRange=server_common_file_require.inputDataRuleType.SearchRange
const dispatchError=server_common_file_require.helperError.dispatch
/**************  rule  ****************/
const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule


const create_async=require('./penalize_logic/create_penalize').createPenalize_async
// const update_async=require('./admin_logic/update_admin_user').updateUser_async
const delete_async=require('./penalize_logic/delete_penalize').deletePenalize_async





//对CRUD（输入参数带有method）操作调用对应的函数
async function dispatcher_async(req){
    let userLoginCheck={
        //needCheck:false,
        // error:controllerError.userNotLoginCantCreateComment
    }
    let penalizeCheck={
        /*                penalizeType:e_penalizeType.NO_ARTICLE,
                        penalizeSubType:e_penalizeSubType.CREATE,
                        penalizeCheckError:controllerError.userInPenalizeNoCommentCreate*/
    }
    let arr_currentSearchRange=[e_searchRange.ALL]
    let originalUrl=req.originalUrl
    // ap.inf('originalUrl',originalUrl)
    let collName=controllerSetting.MAIN_HANDLED_COLL_NAME
    let expectedPart
    let result=dispatchError.common.unknownRequestUrl
    let applyRange
    ap.inf('req.body.values',req.body.values)
    // let tmpResult
    //dispatcher只检测req的结构，以及req中method的格式和值，以便后续可以直接根据method进行调用
    //interval和robot检测
    await controllerPreCheck.commonPreCheck_async({req:req,collName:collName})
    switch (req.route.stack[0].method){
        case 'post':
            if(originalUrl==='/admin_penalize/' || originalUrl==='/admin_penalize/'){
                applyRange=e_applyRange.CREATE
                userLoginCheck={
                    needCheck:true,
                    error:controllerError.dispatch.notLoginCantCreatePenalize
                }
                await controllerPreCheck.userStatusCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})

                expectedPart=[e_part.RECORD_INFO]
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                // ap.inf('admin_penalize inputCommonCheck result ',result)
                if (result.rc > 0) {return Promise.reject(result)}

                //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                await controllerChecker.ifObjectIdInPartEncrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[collName],applyRange:applyRange})
                // ap.inf('penalize: before decrypt',req.body.values)
                //对req中的recordId和recordInfo中加密的objectId进行解密
                let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
                let tempSalt=userInfo.tempSalt
                controllerHelper.decryptInputValue({req:req,expectedPart:expectedPart,salt:tempSalt,browserCollRule:browserInputRule[collName]})

                // ap.inf('penalize: after decrypt',req.body.values)
                /*/!**********************************************!/
                /!****** 传入的敏感数据（objectId）解密  ******!/
                /!****** 在inputPreCheck前完成，保证解密后的objectId可以使用rule进行判别  ******!/
                /!*********************************************!/
                let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})

                let tempSalt=userInfo.tempSalt
                ap.inf('tempSalt',tempSalt)
                ap.inf('req.body.values[e_part.RECORD_INFO]',req.body.values[e_part.RECORD_INFO])
                if(undefined!==req.body.values[e_part.RECORD_INFO]){
                    result=controllerHelper.decryptRecordValue({record:req.body.values[e_part.RECORD_INFO],salt:tempSalt,collName:collName})
                    ap.inf('result',result)
                    if(result.rc>0){
                        return Promise.reject(result)
                    }
                }*/

                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:collName,applyRange:e_applyRange.CREATE.CREATE,arr_currentSearchRange:arr_currentSearchRange})
                // ap.inf('admin_penalize inputPreCheck result ',result)
                if(result.rc>0){return Promise.reject(result)}
                result = await create_async({req: req})
                return Promise.resolve(result)
            }
            break
        case 'put':
            return Promise.reject(controllerError.dispatch.methodNotSupport);
        case 'get':
        case 'delete':
            if(originalUrl==='/admin_penalize/' || originalUrl==='/admin_penalize/'){
                applyRange=e_applyRange.DELETE
                userLoginCheck={
                    needCheck:true,
                    error:controllerError.dispatch.notLoginCantDeletePenalize
                }

                expectedPart=[e_part.RECORD_ID,e_part.RECORD_INFO] //RECORD_INFO用来记录delete(revoke)的原因
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                if (result.rc > 0) {return Promise.reject(result)}

                //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                await controllerChecker.ifObjectIdInPartEncrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[collName],applyRange:applyRange})//

                //对req中的recordId和recordInfo中加密的objectId进行解密
                let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
                let tempSalt=userInfo.tempSalt
                controllerHelper.decryptInputValue({req:req,expectedPart:expectedPart,salt:tempSalt,browserCollRule:browserInputRule[collName]})
                // ap.wrn('decryoted result',req.body.values)
                /*/!**********************************************!/
                /!****** 传入的敏感数据（objectId）解密  ******!/
                /!****** 在inputPreCheck前完成，保证解密后的objectId可以使用rule进行判别  ******!/
                /!*********************************************!/
                let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
                let tempSalt=userInfo.tempSalt
                if(undefined!==req.body.values[e_part.RECORD_INFO]){
                    result=controllerHelper.decryptRecordValue({record:req.body.values[e_part.RECORD_INFO],salt:tempSalt,collName:collName})
                    if(result.rc>0){
                        return Promise.reject(result)
                    }
                }*/

                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:collName,applyRange:e_applyRange.DELETE,arr_currentSearchRange:arr_currentSearchRange})
                if(result.rc>0){return Promise.reject(result)}
                result =await delete_async({req})
                return Promise.resolve(result)
            }
            break
    }
    return Promise.resolve({rc:0})
    // console.log(`dispatch in`)
    // return Promise.resolve({rc:0})
    // let collName=controllerSetting.MAIN_HANDLED_COLL_NAME,tmpResult

    /*//dispatcher只检测req的结构，以及req中method的格式和值，以便后续可以直接根据method进行调用
    tmpResult=controllerHelper.checkMethod({req:req})
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }

    //因为method已经检测过，所有要从req.body.values中删除，防止重复检查
    let method=req.body.values[e_part.METHOD]
    delete req.body.values[e_part.METHOD]

    let userLoginCheck,penalizeCheck,expectedPart*/
    /*switch (method){
        case e_method.CREATE: //create
            // console.log(`create in`)
            userLoginCheck={
                needCheck:true,
                error:controllerError.notLoginCantCreatePenalize
            }
            penalizeCheck={
                /!*                penalizeType:e_penalizeType.NO_ARTICLE,
                 penalizeSubType:e_penalizeSubType.CREATE,
                 penalizeCheckError:controllerError.userInPenalizeNoCommentCreate*!/
            }
            expectedPart=[e_part.RECORD_INFO]
            // console.log(`before create precheck done=====.`)
            await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
            //await helper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
// console.log(`after create precheck done=====.`)
            tmpResult=await create_async(req)
            // console.log(`create  tmpResult ${JSON.stringify(tmpResult)}`)
            break;
        case e_method.SEARCH:// search
            break;
        case e_method.UPDATE:
            return Promise.reject(controllerError.methodNotSupport)

            // break;
        case e_method.DELETE: //delete
            userLoginCheck={
                needCheck:true,
                error:controllerError.notLoginCantDeletePenalize
            }
            penalizeCheck={
                /!*                penalizeType:e_penalizeType.NO_ARTICLE,
                 penalizeSubType:e_penalizeSubType.CREATE,
                 penalizeCheckError:controllerError.userInPenalizeNoCommentCreate*!/
            }
            expectedPart=[e_part.RECORD_ID,e_part.RECORD_INFO] //RECORD_INFO用来记录delete(revoke)的原因
            // console.log(`before precheck done=====.`)
            await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
            //await helper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
            // console.log(`after precheck done=====.`)
            tmpResult=await delete_async(req)

            break;
        case e_method.MATCH: //match(login_async)
            return Promise.reject(controllerError.methodNotSupport)
            break;
        default:
            //已经在checkMethod中定义，如果未定义直接报错，此处只是为了代码的完整性
            return Promise.reject(controllerError.methodUnknown)
        // console.log(`match tmpResult ${JSON.stringify(tmpResult)}`)
    }

    return Promise.resolve(tmpResult)*/
}


module.exports={
    dispatcher_async,
}