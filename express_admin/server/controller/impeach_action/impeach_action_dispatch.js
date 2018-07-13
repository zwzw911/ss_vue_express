/**
 * Created by ada on 2017/9/30.
 */
'use strict'

const ap=require('awesomeprint')

/**********  dispatch相关常量  ***********/
const controllerError=require('./impeach_action_setting/impeach_action_controllerError').controllerError
const controllerSetting=require('./impeach_action_setting/impeach_action_setting').setting

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

const createImpeachAction_async=require('./impeach_action_logic/create_impeach_action').createImpeachAction_async

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
        case 'post':
            if(originalUrl==='/admin_user/' || originalUrl==='/admin_user/') {
                applyRange=e_applyRange.CREATE
                userLoginCheck={
                    needCheck:true,
                    error:controllerError.dispatch.post.notLoginCantChangeAction
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
                // ap.wrn('before result')
                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:collName,applyRange:e_applyRange.CREATE,arr_currentSearchRange:arr_currentSearchRange})
                // ap.wrn('result',result)
                if(result.rc>0){return Promise.reject(result)}
                result = await createImpeachAction_async({req: req,applyRange:applyRange})
                return Promise.resolve(result)
            }
    }
}
async function dispatcher_async(req){
    let collName=controllerSetting.MAIN_HANDLED_COLL_NAME,tmpResult
    // console.log(`impeach action for admin  in`)
    //dispatcher只检测req的结构，以及req中method的格式和值，以便后续可以直接根据method进行调用
    tmpResult=controllerHelper.checkMethod({req:req})
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }

    //因为method已经检测过，所有要从req.body.values中删除，防止重复检查
    let method=req.body.values[e_part.METHOD]
    delete req.body.values[e_part.METHOD]

    let userLoginCheck,penalizeCheck,expectedPart
    switch (method){
        case e_method.CREATE: //create
            // console.log(`impeach action for admin create in`)
            userLoginCheck={
                needCheck:true,
                error:controllerError.notLoginCantChangeAction
            }
            penalizeCheck={
                /*                penalizeType:e_penalizeType.NO_ARTICLE,
                 penalizeSubType:e_penalizeSubType.CREATE,
                 penalizeCheckError:controllerError.userInPenalizeNoCommentCreate*/
            }
            expectedPart=[e_part.RECORD_INFO]
            //console.log(`==============>userLoginChecke for impeach action================>${JSON.stringify(controllerError.notLoginCantChangeAction)}`)
            await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
            //await helper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
// console.log(`precheck done=====.`)
            tmpResult=await create_async(req)
            // console.log(`create  tmpResult ${JSON.stringify(tmpResult)}`)
            break;
        case e_method.SEARCH:// search
            break;
        case e_method.UPDATE: //update
            break;
        case e_method.DELETE: //delete
            break;
        case e_method.MATCH: //match(login_async)
            break;
        default:
            console.log(`======>ERR:Wont in cause method check before`)
        // console.log(`match tmpResult ${JSON.stringify(tmpResult)}`)
    }

    return Promise.resolve(tmpResult)
}


module.exports={
    dispatcher_async,
}