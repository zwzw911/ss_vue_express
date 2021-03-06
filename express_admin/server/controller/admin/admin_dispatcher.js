/**
 * Created by Ada on 2017/7/9.
 * url：
 *  1. /user，根据method的不同，调用不同的函数进行对应的处理
 *  2. /user/unique: 用户注册的时候，对应用户名/账号进行唯一性检查
 */
'use strict'

const ap=require('awesomeprint')

/**********  dispatch相关常量  ***********/
const controllerError=require('./admin_setting/admin_user_controllerError').controllerError
const controllerSetting=require('./admin_setting/admin_setting').setting

const server_common_file_require=require('../../../server_common_file_require')

/*************   公共函数 ************/
const controllerHelper=server_common_file_require.controllerHelper
const controllerPreCheck=server_common_file_require.controllerPreCheck
const controllerChecker=server_common_file_require.controllerChecker
/************   公共常量 ***************/
const nodeEnum=server_common_file_require.nodeEnum
// const e_userState=require('../../constant/enum/node').UserState
const e_part=nodeEnum.ValidatePart
// const e_method=nodeEnum.Method//require('../../constant/enum/node').Method
const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange

const e_coll=require('../../constant/genEnum/DB_Coll').Coll
/*************   其他常量   ************/
const e_searchRange=server_common_file_require.inputDataRuleType.SearchRange
const dispatchError=server_common_file_require.helperError.dispatch
/**************  rule  ****************/
const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule



const createUser_async=require('./admin_logic/create_admin_user').createUser_async
const updateUser_async=require('./admin_logic/update_admin_user').updateUser_async
const deleteUser_async=require('./admin_logic/delete_admin_user').deleteUser_async
const userLogin_async=require('./admin_logic/admin_user_login').login_async
const userLogout_async=require('./admin_logic/admin_user_logout').logout_async
const userUniqueCheck_async=require('./admin_logic/admin_misc_func').uniqueCheck_async
const generateCaptcha_async=require('./admin_logic/admin_misc_func').generateCaptcha_async
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
    let tmpResult
    let applyRange
    ap.inf('req.route.stack[0].method',req.route.stack[0].method)
    //dispatcher只检测req的结构，以及req中method的格式和值，以便后续可以直接根据method进行调用
    //interval和robot检测
    await controllerPreCheck.commonPreCheck_async({req:req,collName:collName})

    switch (req.route.stack[0].method){
        case 'put':
            if(originalUrl==='/admin_user/' || originalUrl==='/admin_user/') {
                applyRange=e_applyRange.UPDATE_SCALAR
                userLoginCheck={
                    needCheck:true,
                    error:controllerError.dispatch.put.notLoginCantUpdateUser
                }
                await controllerPreCheck.userStatusCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})
                expectedPart=[e_part.RECORD_INFO,e_part.RECORD_ID] //有权限的用户可以更改其他admin账号的信息
                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                if (result.rc > 0) {return Promise.reject(result)}

                //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                // ap.inf('before decrypt',req.body.values)
                await controllerChecker.ifObjectIdInPartEncrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[collName],applyRange:applyRange})

                //对req中的recordId和recordInfo中加密的objectId进行解密
                let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
                let tempSalt=userInfo.tempSalt
                controllerHelper.decryptInputValue({req:req,expectedPart:expectedPart,salt:tempSalt,browserCollRule:browserInputRule[collName]})
                // ap.inf('after decrypt',req.body.values)
                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:collName,applyRange:e_applyRange.UPDATE_SCALAR,arr_currentSearchRange:arr_currentSearchRange})
                // ap.inf('result',result)
                if(result.rc>0){return Promise.reject(result)}
                result = await updateUser_async({req: req,applyRange:applyRange})
                return Promise.resolve(result)
            }
            break
        case 'post':
            if(originalUrl==='/admin_user/' || originalUrl==='/admin_user/') {
                applyRange=e_applyRange.CREATE
                userLoginCheck={
                    needCheck:true,
                    error:controllerError.dispatch.post.notLoginCantCreateUser
                }
                await controllerPreCheck.userStatusCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})
                expectedPart=[e_part.RECORD_INFO,e_part.CAPTCHA]
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                if (result.rc > 0) {return Promise.reject(result)}

                //对req中的recordId和recordInfo进行objectId（加密过的）格式判断
                await controllerChecker.ifObjectIdInPartEncrypted_async({req:req,expectedPart:expectedPart,browserCollRule:browserInputRule[collName],applyRange:applyRange})

                //对req中的recordId和recordInfo中加密的objectId进行解密
                let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
                let tempSalt=userInfo.tempSalt
                controllerHelper.decryptInputValue({req:req,expectedPart:expectedPart,salt:tempSalt,browserCollRule:browserInputRule[collName]})
                // ap.wrn('before result')
                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:collName,applyRange:e_applyRange.CREATE,arr_currentSearchRange:arr_currentSearchRange})
                // ap.wrn('result',result)
                if(result.rc>0){return Promise.reject(result)}
                result = await createUser_async({req: req,applyRange:applyRange})
                return Promise.resolve(result)
            }

            if(originalUrl==='/admin_user/login' || originalUrl==='/admin_user/login/') {
                // ap.inf('req.body.values',req.body.values)
                await controllerPreCheck.userStatusCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})
                expectedPart=[e_part.RECORD_INFO,e_part.CAPTCHA]
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                if (result.rc > 0) {return Promise.reject(result)}

                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:collName,applyRange:undefined,arr_currentSearchRange:arr_currentSearchRange})
                if(result.rc>0){return Promise.reject(result)}
                result = await userLogin_async({req: req})
                return Promise.resolve(result)
            }

            if(originalUrl==='/admin_user/uniqueCheck' || originalUrl==='/admin_user/uniqueCheck/') {
                await controllerPreCheck.userStatusCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})
                expectedPart=[e_part.SINGLE_FIELD]
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                if (result.rc > 0) {return Promise.reject(result)}

                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:collName,applyRange:undefined,arr_currentSearchRange:arr_currentSearchRange})
                if(result.rc>0){return Promise.reject(result)}
                result = await userUniqueCheck_async({req: req})
                return Promise.resolve(result)
            }
            break
        case 'get':

            if(originalUrl==='/admin_user/captcha' || originalUrl==='/admin_user/captcha/') {

                //captcha一般在注册或者登录时候使用，此时用户尚未登录
                await controllerPreCheck.userStatusCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})
                // ap.inf('userStatusCheck_async done')
                result = await generateCaptcha_async({req: req})
                return Promise.resolve(result)
            }
            break;
        case 'delete':
            if(originalUrl==='/admin_user/' || originalUrl==='/admin_user/') {
                userLoginCheck={
                    needCheck:true,
                    error:controllerError.dispatch.delete.notLoginCantDeleteUser
                }
                await controllerPreCheck.userStatusCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})
                expectedPart=[e_part.RECORD_ID]
                //是否为期望的part
                result = controllerPreCheck.inputCommonCheck({req:req, expectedPart:expectedPart})
                if (result.rc > 0) {return Promise.reject(result)}

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

                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:collName,applyRange:e_applyRange.DELETE,arr_currentSearchRange:arr_currentSearchRange})
                if(result.rc>0){return Promise.reject(result)}
                result = await deleteUser_async({req: req})
                return Promise.resolve(result)
            }

            if(originalUrl==='/admin_user/logout' || originalUrl==='/admin_user/logout/') {
                result=await userLogout_async({req:req,applyRange:applyRange})
                return Promise.resolve(result)
            }
            break
    }
    
    return Promise.resolve({rc:0})
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