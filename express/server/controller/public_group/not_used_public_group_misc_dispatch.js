/**
 * Created by wzhan039 on 2017/10/24.
 * 用户请求加入/退出；admin添加/退出；批准/拒绝加入
 */
'use strict'

const ap=require('awesomeprint')
/*                          server common                       */
const server_common_file_require=require('../../../server_common_file_require')

const nodeEnum=server_common_file_require.nodeEnum
const mongoEnum=server_common_file_require.mongoEnum
const controllerHelper=server_common_file_require.controllerHelper

const e_uploadFileType=nodeEnum.UploadFileType
const e_uploadType=nodeEnum.UpdateType
const e_findEleInArray=nodeEnum.FindEleInArray

const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB


const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method//require('../../constant/enum/node').Method
const e_field=require(`../../constant/genEnum/DB_field`).Field
const e_coll=require(`../../constant/genEnum/DB_Coll`).Coll
/*                          genEnum                           */
// const e_coll=require('../../constant/genEnum/DB_Coll').Coll


/*                          controller                          */
const controllerError=require('./public_group_setting/public_group_controllerError').controllerError
const controllerSetting=require('./public_group_setting/public_group_setting').setting
// const create_async=require('./public_group_logic/create_public_group').createPublicGroup_async
const update_requestJoin_async=require('./public_group_operation/requestJoin').update_requestJoin_async
// const updateSubFieldOnly_async=require('./user_friend_group_logic/update_user_friend_group_sub_field_only').updatePublicGroup_async
// const delete_async=require('./public_group_logic/delete_public_group').deletePublicGroup_async
// const uploadImage_async=require('./impeach_logic/upload_impeach_image').uploadImpeachCommentFile_async


async function dispatcher_async({req}){
    //检查格式
    let collName=controllerSetting.MAIN_HANDLED_COLL_NAME,tmpResult//,collConfig={},collImageConfig={}

    //checkMethod只检测req的结构，以及req中method的格式和值，以便后续可以直接根据method进行调用
    tmpResult=controllerHelper.checkMethod({req:req})
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }
    //因为method已经检测过，所有要从req.body.values中删除，防止重复检查
    let method=req.body.values[e_part.METHOD]
    delete req.body.values[e_part.METHOD]

    let userLoginCheck,penalizeCheck,expectedPart,optionalPart
    switch (method){
        case e_method.CREATE: //create

            break;
        case e_method.SEARCH:// search
            break;
        case e_method.UPDATE: //为了保持logic的简洁性，此update只对 加入/退出群，批准/拒绝加入群，加入/推出管理  进行处理
            userLoginCheck={
                needCheck:true,
                error:controllerError.notLoginCantUpdatePublicGroup
            }
            penalizeCheck={
                penalizeType:e_penalizeType.NO_PUBLIC_GROUP,
                penalizeSubType:e_penalizeSubType.UPDATE,
                penalizeCheckError:controllerError.inPenalizeCantUpdatePublicGroup
            }

            expectedPart=[e_part.RECORD_ID]
            // ap.inf('expectedPart',expectedPart)
            tmpResult=await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
            // ap.print('tmpResult',tmpResult)
            /*      执行逻辑                */
            tmpResult=await update_requestJoin_async({req:req,expectedPart:expectedPart})


            break;
        case e_method.DELETE: //delete

            break;
        case e_method.MATCH: //match(login_async)
            break;
        case e_method.UPLOAD:
            break;
    }

    return Promise.resolve(tmpResult)
}

module.exports={
    dispatcher_async
}