/**
 * Created by wzhan039 on 2017/10/24.
 */
'use strict'

const ap=require('awesomeprint')
/*                          server common                       */
const server_common_file_require=require('../../../server_common_file_require')

const nodeEnum=server_common_file_require.nodeEnum
const mongoEnum=server_common_file_require.mongoEnum
const controllerHelper=server_common_file_require.controllerHelper

// const e_uploadFileType=nodeEnum.UploadFileType
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
const controllerError=require('./user_friend_group_setting/user_friend_group_controllerError').controllerError
const controllerSetting=require('./user_friend_group_setting/user_friend_group_setting').setting
const create_async=require('./user_friend_group_logic/create_user_friend_group').createUserFriendGroup_async
const update_async=require('./user_friend_group_logic/update_user_friend_group').updateUserFriendGroup_async
// const updateSubFieldOnly_async=require('./user_friend_group_logic/update_user_friend_group_sub_field_only').updateUserFriendGroup_async
const delete_async=require('./user_friend_group_logic/delete_user_friend_group').deleteUserFriendGroup_async
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
            /*          create 必须有impeachType（impeach_route中，根据URL设置）           */
            userLoginCheck={
                needCheck:true,
                error:controllerError.notLoginCantCreateUserFriendGroup
            }

            penalizeCheck={
                penalizeType:e_penalizeType.NO_USER_FRIEND_GROUP,
                penalizeSubType:e_penalizeSubType.CREATE,
                penalizeCheckError:controllerError.inPenalizeCantCreateUserFriendGroup
            }
            //此处RECORD_INFO只包含了一个字段：impeachArticle或者(comment)Id。
            // impeachType是由URL决定（是internal的field），需要和其他默认之合并之后，才能进行preCheck_async（否则validate value会fail）
            expectedPart=[e_part.RECORD_INFO]
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
                error:controllerError.notLoginCantUpdateUserFriendGroup
            }
            penalizeCheck={
                penalizeType:e_penalizeType.NO_USER_FRIEND_GROUP,
                penalizeSubType:e_penalizeSubType.UPDATE,
                penalizeCheckError:controllerError.inPenalizeCantUpdateUserFriendGroup
            }

            expectedPart=[e_part.RECORD_ID]

            optionalPart=[e_part.RECORD_INFO,e_part.EDIT_SUB_FIELD]
            tmpResult=controllerHelper.checkOptionPartExist({req:req,optionPart:optionalPart,findType:e_findEleInArray.AT_LEAST_ONE,expectedPart:expectedPart})
            if(tmpResult.rc>0){
                    return Promise.reject(tmpResult)
            }
// ap.print('after check option part',expectedPart)
            tmpResult=await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
            // ap.print('tmpResult',tmpResult)
            /*      执行逻辑                */
            tmpResult=await update_async({req:req,expectedPart:expectedPart})

            /*/!*          需要区分是普通还是subField的update            *!/
            if(undefined===uploadType || uploadType===e_uploadType.NORMAL){
                expectedPart=[e_part.RECORD_INFO,e_part.RECORD_ID]
                optionalPart=[e_part.EDIT_SUB_FIELD]
                controllerHelper.pushOptionalPartIntoExpectedPart_noReturn({req:req,arr_optionalPart:optionalPart,arr_expectedPart:expectedPart})
                // console.log(`update preCheck start============>`)
                tmpResult=await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
                //tmpResult=await controllerHelper.preCheck_async({req:req,collName:collConfig.collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
                // console.log(`update preCheck done============>`)

                /!*      执行逻辑                *!/
                tmpResult=await update_async({req:req,expectedPart:expectedPart})
            }
            if(uploadType===e_uploadType.SUB_FIELD){
                expectedPart=[e_part.EDIT_SUB_FIELD]
                // controllerHelper.pushOptionalPartIntoExpectedPart_noReturn({req:req,arr_optionalPart:optionalPart,arr_expectedPart:expectedPart})
                // console.log(`update preCheck start============>`)
                tmpResult=await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
                //tmpResult=await controllerHelper.preCheck_async({req:req,collName:collConfig.collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
                // console.log(`update preCheck done============>`)

                /!*      执行逻辑                *!/
                tmpResult=await updateSubFieldOnly_async({req:req,expectedPart:expectedPart})
            }*/
            break;
        case e_method.DELETE: //delete
            userLoginCheck={
                needCheck:true,
                error:controllerError.notLoginCantDeleteUserFriendGroup
            }
            penalizeCheck={
                penalizeType:e_penalizeType.NO_IMPEACH,
                penalizeSubType:e_penalizeSubType.DELETE,
                penalizeCheckError:controllerError.inPenalizeCantDeleteUserFriendGroup
            }
            expectedPart=[e_part.RECORD_ID]
            tmpResult=await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
            tmpResult=await delete_async({req:req})
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