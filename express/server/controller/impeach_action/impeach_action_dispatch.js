/**
 * Created by ada on 2017/9/30.
 */
'use strict'


/*                          server common                       */
const server_common_file_include=require('../../../server_common_file_require')

const nodeEnum=server_common_file_include.nodeEnum
const mongoEnum=server_common_file_include.mongoEnum
const controllerHelper=server_common_file_include.controllerHelper

const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB


const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method//require('../../constant/enum/node').Method


/*                          genEnum                           */
// const e_coll=require('../../constant/genEnum/DB_Coll').Coll


/*                          controller                          */
const controllerError=require('./impeach_action_setting/impeach_action_controllerError').controllerError
const create_async=require('./impeach_action_logic/create_impeach_action').createImpeachAction_async


const controllerSetting=require('./impeach_action_setting/impeach_action_setting').setting



//对CRUD（输入参数带有method）操作调用对应的函数
async function dispatcher_async(req){
    let collName=controllerSetting.MAIN_HANDLED_COLL_NAME,tmpResult

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
            // console.log(`create in`)
            userLoginCheck={
                needCheck:true,
                error:controllerError.notLoginCantChangeAction
            }
            penalizeCheck={
                penalizeType:e_penalizeType.NO_IMPEACH,
                penalizeSubType:e_penalizeSubType.CREATE,
                penalizeCheckError:controllerError.userInPenalizeNoImpeachCreate
            }
            // console.log(`penalizeCheck==============>${JSON.stringify(penalizeCheck)}`)
            expectedPart=[e_part.RECORD_INFO]
            // console.log(`=====>before precheck done<=====`)
            await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
            //await helper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
            // console.log(`=====>after precheck done<=====`)
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

    return Promise.resolve({rc:0})
}


module.exports={
    dispatcher_async,
}