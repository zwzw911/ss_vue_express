/**
 * Created by Ada on 2017/7/9.
 * url：
 *  1. /user，根据method的不同，调用不同的函数进行对应的处理
 *  2. /user/unique: 用户注册的时候，对应用户名/账号进行唯一性检查
 */
'use strict'
const ap=require('awesomeprint')
/**********  dispatch相关常量  ***********/
const controllerError=require(`./user_setting/user_controllerError`).controllerError
const controllerSetting=require('./user_setting/user_setting').setting

const server_common_file_require=require('../../../server_common_file_require')

/************   公共函数 ***************/
const controllerPreCheck=server_common_file_require.controllerPreCheck
const dispatchError=server_common_file_require.helperError.dispatch
const controllerChecker=server_common_file_require.controllerChecker
const controllerHelper=server_common_file_require.controllerHelper
/************   公共常量 ***************/
const nodeEnum=server_common_file_require.nodeEnum
const mongoEnum=server_common_file_require.mongoEnum

// const e_userState=require('../../constant/enum/node').UserState
const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method//require('../../constant/enum/node').Method
const e_coll=require('../../constant/genEnum/DB_Coll').Coll

const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB

const e_intervalCheckPrefix=server_common_file_require.nodeEnum.IntervalCheckPrefix
const e_searchRange=server_common_file_require.inputDataRuleType.SearchRange

const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange
/**************  rule  ****************/
const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule



const getUser_async=require('./user_logic/get_user').getUser_async
// const getOtherUser_async=require('./user_logic/get_user').getOtherUser_async
const createUser_async=require('./user_logic/create_user').createUser_async
const updateUser_async=require('./user_logic/update_user').updateUser_async
const userLogin_async=require('./user_logic/user_login').login_async
const userLogout_async=require('./user_logic/user_logout').logout_async
const userMisc=require('./user_logic/user_misc_func')
const uploadUserPhoto_async=userMisc.uploadDataUrlPhoto_async
const uniqueCheck_async=userMisc.uniqueCheck_async
const retrievePassword_async=userMisc.retrievePassword_async
const changePassword_async=userMisc.changePassword_async
const generateCaptcha_async=userMisc.generateCaptcha_async

//对CRUD（输入参数带有method）操作调用对应的函数
async function dispatcher_async(req){

    //检查格式
// ap.inf('req.route',req.route)
//     ap.inf('req.originalUrl',req.originalUrl)
//     ap.inf('req.baseUrl',req.baseUrl)
//     ap.inf('req.path',req.path)
//     ap.inf('req.route.stack[0].method',req.route.stack[0].method)

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
    let collName=controllerSetting.MAIN_HANDLED_COLL_NAME
    let expectedPart
    let result=dispatchError.common.unknownRequestUrl
    let tmpResult
    let applyRange
    //interval和robot检测
    await controllerPreCheck.commonPreCheck_async({req:req,collName:collName})
    ap.inf('commonPreCheck_async done')
    switch (req.route.stack[0].method) {
        case 'get':
            if(originalUrl==='/user' || originalUrl==='/user/') {
                userLoginCheck={
                    needCheck:true,
                    error:controllerError.dispatch.get.notLoginCantGetUserInfo
                }
                await controllerPreCheck.userStateCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})

                //验证URL中的userId并重新赋值
                if(undefined!==req.params.userId){



                    //获得他人的userId
                    /*********  url（get）中的objectId的检查，不使用单一函数，因为需要具体的错误信息  *********/
                    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
                    let tempSalt=userInfo.tempSalt
                    //判断加密的objectId格式
                    let cryptedObjectId=req.params.userId
                    // ap.inf('cryptedObjectId',cryptedObjectId)
                    // ap.inf('tempSalt',tempSalt)
                    if(false===controllerChecker.ifObjectIdCrypted({objectId:cryptedObjectId})){
                        return Promise.reject(controllerError.dispatch.get.cryptedUserIdFormatInvalid)
                    }
                    //解密
                    tmpResult=crypt.decryptSingleFieldValue({fieldValue:cryptedObjectId,salt:tempSalt})
                    if(tmpResult.rc>0){
                        return Promise.reject(tmpResult)
                    }
                    req.params.userId=tmpResult.msg
                    // ap.inf('decryptedObjectId',req.params.folderId)
                    //判断解密的objectId
                    if(false===regex.objectId.test(req.params.userId)){
                        return Promise.reject(controllerError.dispatch.get.decryptedUserIdFormatInvalid)
                    }
// ap.inf('req.params',req.params)
                }

                result= await getUser_async({req: req})
                return Promise.resolve(result)
            }
            if(originalUrl==='/user/captcha' || originalUrl==='/user/captcha/') {
                //captcha一般在注册或者登录时候使用，此时用户尚未登录
                await controllerPreCheck.userStateCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})
                // ap.inf('userStateCheck_async done')
                result = await generateCaptcha_async({req: req})
                return Promise.resolve(result)
            }
            break;
        case 'post':
            if(originalUrl==='/user' || originalUrl==='/user/') {
                await controllerPreCheck.userStateCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})
                // ap.inf('create use userStateCheck_async done')
                expectedPart=[e_part.RECORD_INFO,e_part.CAPTCHA]
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                if (result.rc > 0) {return Promise.reject(result)}



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
                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:collName,applyRange:e_applyRange.CREATE,arr_currentSearchRange:arr_currentSearchRange})
                // ap.inf('create use inputPreCheck result',result)
                if(result.rc>0){return Promise.reject(result)}
                result = await createUser_async({req: req})
                return Promise.resolve(result)
            }
            if(originalUrl==='/user/login' || originalUrl==='/user/login/') {
                await controllerPreCheck.userStateCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})
                // ap.inf('login userStateCheck_async done')
                expectedPart=[e_part.RECORD_INFO,e_part.CAPTCHA]
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                if (result.rc > 0) {return Promise.reject(result)}

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
                //applyRange===undefined，说明即使有recordInfo，也不进行对应的rule检查
                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:collName,applyRange:undefined,arr_currentSearchRange:arr_currentSearchRange})
                // ap.inf('inputPreCehck result',result)
                if(result.rc>0){return Promise.reject(result)}
                result = await userLogin_async({req: req})
                return Promise.resolve(result)
            }
            if(originalUrl==='/user/uniqueCheck' || originalUrl==='/user/uniqueCheck/') {
                await controllerPreCheck.userStateCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})
                expectedPart=[e_part.SINGLE_FIELD]
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                if (result.rc > 0) {return Promise.reject(result)}
                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:collName,applyRange:e_applyRange.CREATE,arr_currentSearchRange:arr_currentSearchRange})
                // ap.inf('create use inputPreCheck result',result)
                if(result.rc>0){return Promise.reject(result)}
                result = await uniqueCheck_async({req: req})
                return Promise.resolve(result)
            }
            if(originalUrl==='/user/retrievePassword' || originalUrl==='/user/retrievePassword/') {
                //只是为了确保account这个字段必须存在（而并不是意味此操作为创建用户）
                let applyRange=e_applyRange.CREATE
                //retrievePassword无需登录，只需账号即可
/*                userLoginCheck={
                    needCheck:true,
                    error:controllerError.dispatch.post.notLoginCantRetrievePassword
                }
                await controllerPreCheck.userStateCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})*/
                expectedPart=[e_part.SINGLE_FIELD]
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                if (result.rc > 0) {return Promise.reject(result)}
                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:collName,applyRange:applyRange,arr_currentSearchRange:arr_currentSearchRange})
                // ap.inf('create use inputPreCheck result',result)
                if(result.rc>0){return Promise.reject(result)}
                result = await retrievePassword_async({req: req})
                return Promise.resolve(result)
            }

            break
        case 'delete':
            if(originalUrl==='/user/logout' || originalUrl==='/user/logout/') {
                result=await userLogout_async({req:req})
                return Promise.resolve(result)
            }

            break;
        case 'put':
            if(originalUrl==='/user' || originalUrl==='/user/') {
                // ap.inf('req.body.values',req.body.values)
                applyRange=e_applyRange.UPDATE_SCALAR
                userLoginCheck={
                    needCheck:true,
                    error:controllerError.dispatch.put.notLoginCantUpdateUserInfo
                }
                await controllerPreCheck.userStateCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})
                expectedPart=[e_part.RECORD_INFO]
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                if (result.rc > 0) {return Promise.reject(result)}

                //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                await controllerChecker.ifObjectIdInPartCrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[collName],applyRange:applyRange})

                //对req中的recordId和recordInfo中加密的objectId进行解密
                let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
                let tempSalt=userInfo.tempSalt
                controllerHelper.decryptInputValue({req:req,expectedPart:expectedPart,salt:tempSalt,browserCollRule:browserInputRule[collName]})

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

                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:collName,applyRange:e_applyRange.UPDATE_SCALAR,arr_currentSearchRange:arr_currentSearchRange})
                if(result.rc>0){return Promise.reject(result)}
                result = await updateUser_async({req: req})
                return Promise.resolve(result)
            }
            if(originalUrl==='/user/changePassword' || originalUrl==='/user/changePassword/') {
                userLoginCheck={
                    needCheck:true,
                    error:controllerError.dispatch.notLoginCantUpdatePassword
                }
                await controllerPreCheck.userStateCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})
                result = await changePassword_async({req: req})
                return Promise.resolve(result)
            }
            if(originalUrl==='/user/uploadUserPhoto' || originalUrl==='/user/uploadUserPhoto/') {
                // ap.inf('upload in')
                userLoginCheck={
                    needCheck:true,
                    error:controllerError.dispatch.notLoginCantUpdateUserPhoto
                }
                penalizeCheck={
                    penalizeType:e_penalizeType.NO_UPLOAD_USER_PHOTO,
                    penalizeSubType:e_penalizeSubType.UPDATE,
                    penalizeCheckError:controllerError.dispatch.put.userInPenalizeNoPhotoUpload
                }
                await controllerPreCheck.userStateCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})
                // ap.inf('userStateCheck_async done')
                expectedPart=[e_part.SINGLE_FIELD]
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                if (result.rc > 0) {return Promise.reject(result)}
                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:collName,applyRange:e_applyRange.UPDATE_SCALAR,arr_currentSearchRange:arr_currentSearchRange})
                // ap.inf('inputPreCheck result',result)
                if(result.rc>0){return Promise.reject(result)}
                result = await uploadUserPhoto_async({req: req})
                return Promise.resolve(result)
            }
            break;
        default:
            // return Promise.reject()

    }


    /*let collName=e_coll.USER,tmpResult

    //dispatcher只检测req的结构，以及req中method的格式和值，以便后续可以直接根据method进行调用
    tmpResult=controllerHelper.checkMethod({req:req})
    // console.log(   `checkMethod Result===========>${JSON.stringify(tmpResult)}`)
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }


    //因为method已经检测过，所有要从req.body.values中删除，防止重复检查，并保证validateFormat能正常功能工作
    let method=req.body.values[e_part.METHOD]
    delete req.body.values[e_part.METHOD]

    let userLoginCheck,penalizeCheck,expectedPart
    switch (method){
        case e_method.CREATE: //create
            // console.log(`create in`)
            // ap.inf('create in')

            userLoginCheck={
                needCheck:false,
                // error:controllerError.userNotLoginCantCreateComment
            }
            penalizeCheck={
/!*                penalizeType:e_penalizeType.NO_ARTICLE,
                penalizeSubType:e_penalizeSubType.CREATE,
                penalizeCheckError:controllerError.userInPenalizeNoCommentCreate*!/
            }
            expectedPart=[e_part.RECORD_INFO,e_part.CAPTCHA]//
            // console.log(`before precheck done=====.`)
            // ap.inf('start')
            await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
            // ap.inf('end')
            //await helper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
// console.log(`precheck done=====.`)

            tmpResult=await createUser_async(req)
            // console.log(`create  tmpResult ${JSON.stringify(tmpResult)}`)
            break;
        case e_method.SEARCH:// search
            break;
        case e_method.UPDATE: //update
            userLoginCheck={
                needCheck:true,
                error:controllerError.notLoginCantUpdate
            }
            penalizeCheck={
                /!*                penalizeType:e_penalizeType.NO_ARTICLE,
                                penalizeSubType:e_penalizeSubType.CREATE,
                                penalizeCheckError:controllerError.userInPenalizeNoCommentCreate*!/
            }
            expectedPart=[e_part.RECORD_INFO]
            // console.log(`before precheck done=====.`)
            await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
	    //await helper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
         //    console.log(`req.session indisp ${JSON.stringify(req.session)}`)
            tmpResult=await updateUser_async(req)
            break;
        case e_method.DELETE: //delete
            break;
        case e_method.MATCH: //match(login_async)
            userLoginCheck={
                needCheck:false,
                // error:controllerError.userNotLoginCantCreateComment
            }
            penalizeCheck={
/!*                                penalizeType:e_penalizeType.NO_ARTICLE,
                                penalizeSubType:e_penalizeSubType.CREATE,
                                penalizeCheckError:controllerError.userInPenalizeNoCommentCreate*!/
            }
            //update的时候，userId直接保存在session中，无需通过client传入
            expectedPart=[e_part.RECORD_INFO,e_part.CAPTCHA]
            // console.log(`before precheck done=====.`)
            await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
	    //await helper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
            tmpResult=await userLogin_async(req)
            break;
        case e_method.UPLOAD: //create
            let reqTypePrefix=e_intervalCheckPrefix.UPLOAD_USER_PHOTO
            // console.log(`create in`)
            // ap.inf('create in')
            // await controllerHelper.checkInterval_async({req:req,reqTypePrefix:e_intervalCheckPrefix.UPLOAD_USER_PHOTO})

            userLoginCheck={
                needCheck:true,
                error:controllerError.notLoginCantUpload
            }
            penalizeCheck={
                penalizeType:e_penalizeType.NO_UPLOAD_USER_PHOTO,
                // penalizeSubType:e_penalizeSubType.CREATE,
                penalizeCheckError:controllerError.userInPenalizeNoPhotoUpload
            }
            expectedPart=[e_part.RECORD_INFO]
            // console.log(`before precheck done=====.`)
            // ap.inf('before preCheck done')
            await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,reqTypePrefix:reqTypePrefix})
            // ap.inf('after preCheck done')
            // ap.inf('end')
            //await helper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
// console.log(`precheck done=====.`)

            tmpResult=await uploadUserPhoto_async({req:req})
            // console.log(`create  tmpResult ${JSON.stringify(tmpResult)}`)
            break;
        default:
           ap.err(`======>ERR:Wont in cause method check before`)
            // console.log(`match tmpResult ${JSON.stringify(tmpResult)}`)
    }
    
    return Promise.resolve()*/
}


module.exports={
    dispatcher_async,
    // login_async,
    // uniqueCheck_async,
    // retrievePassword_async,
    // uploadPhoto_async,
    // generateCaptcha_async,
    // controllerError
}