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
/****************   公共常量   ******************/
//error
const dispatchError=server_common_file_require.helperError.dispatch
const controllerHelper=server_common_file_require.controllerHelper
//enum
const nodeEnum=server_common_file_require.nodeEnum
const mongoEnum=server_common_file_require.mongoEnum
// const e_userState=require('../../constant/enum/node').UserState
const e_part=nodeEnum.ValidatePart
const e_applyRange=nodeEnum.ApplyRange//require('../../constant/enum/node').Method
const e_coll=require('../../constant/genEnum/DB_Coll').Coll

const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB

const e_intervalCheckPrefix=server_common_file_require.nodeEnum.IntervalCheckPrefix
const e_searchRange=server_common_file_require.inputDataRuleType.SearchRange

const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange
/**************  controller相关常量  ****************/
const controllerError=require(`./folder_setting/folder_controllerError`).controllerError
const controllerSetting=require('./folder_setting/folder_setting').setting

/**************  controller处理函数  ****************/
const createFolder_async=require('./folder_logic/create_folder').createFolder_async
const getFolder_async=require('./folder_logic/get_folder').getFolder_async
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
    let result=dispatchError.common.unknownRequestRul

    /***   1. interval和robot检测   ***/
    await controllerPreCheck.commonPreCheck_async({req:req,collName:collName})
    // ap.inf('commonPreCheck_async done')
    /***   2. 根据method，以及url，进行对应的检查，最后调用处理函数   ***/
    /**    检查包括：用户是否登录/用户是否被处罚/输入值的格式和范围是否正确（POST/PUT） **/
    switch (req.route.stack[0].method) {
        case 'get':
            //get只能在url中包含参数，所以无inputPreCheck
            if(originalUrl==='/folder' || originalUrl==='/folder/') {
                userLoginCheck={
                    needCheck:true,
                    error:controllerError.dispatch.get.notLoginCantGetFolder
                }

                await controllerPreCheck.userStateCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})

                if(result.rc>0){return Promise.reject(result)}
                result = await getFolder_async({req: req})
                return Promise.resolve(result)
            }
            break;
        case 'post':
            if(originalUrl==='/folder' || originalUrl==='/folder/') {
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
                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:collName,applyRange:e_applyRange.CREATE,arr_currentSearchRange:arr_currentSearchRange})
                // ap.inf('create use inputPreCheck result',result)
                if(result.rc>0){return Promise.reject(result)}
                result = await createFolder_async({req: req})
                return Promise.resolve(result)
            }
            break
        case 'delete':
            //get只能在url中包含参数，所以无inputPreCheck
            if(originalUrl==='/folder' || originalUrl==='/folder/') {
                userLoginCheck={
                    needCheck:true,
                    error:controllerError.dispatch.delete.notLoginCantDeleteFolder
                }

                await controllerPreCheck.userStateCheck_async({req:req,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck})

                if(result.rc>0){return Promise.reject(result)}
                result = await deleteFolder_async({req: req})
                return Promise.resolve(result)
            }
            break;
        case 'put':
            if(originalUrl==='/folder' || originalUrl==='/folder/') {
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
                expectedPart=[e_part.RECORD_INFO]
                result=controllerPreCheck.inputPreCheck({req:req,expectedPart:expectedPart,collName:collName,applyRange:e_applyRange.UPDATE_SCALAR,arr_currentSearchRange:arr_currentSearchRange})
                // ap.inf('create use inputPreCheck result',result)
                if(result.rc>0){return Promise.reject(result)}
                result = await updateFolder_async({req: req})
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