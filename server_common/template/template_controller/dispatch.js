/**
 * Created by wzhan039 on 2017/10/24.
 */
'use strict'
/*                          server common                       */
const server_common_file_require=require('../../../server_common_file_require')

const nodeEnum=server_common_file_require.nodeEnum
const mongoEnum=server_common_file_require.mongoEnum
const controllerHelper=server_common_file_require.controllerHelper

const e_uploadFileType=nodeEnum.UploadFileType

const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB


const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method//require('../../constant/enum/node').Method
const e_field=require(`../../constant/genEnum/DB_field`).Field
const e_coll=require(`../../constant/genEnum/DB_Coll`).Coll
/*                          genEnum                           */
// const e_coll=require('../../constant/genEnum/DB_Coll').Coll


/*                          controller                          */
const controllerError=require('./impeach_setting/impeach_controllerError').controllerError
const controllerSetting=require('./impeach_setting/impeach_setting').setting

const create_async=require('./impeach_logic/create_impeach').createImpeach_async
const update_async=require('./impeach_logic/update_impeach').updateImpeach_async
const delete_async=require('./impeach_logic/delete_impeach').deleteImpeach_async
const uploadImage_async=require('./impeach_logic/upload_impeach_image').uploadImpeachCommentFile_async


async function dispatcher_async({req,impeachType}){
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

    let userLoginCheck,penalizeCheck,expectedPart
    switch (method){
        case e_method.CREATE: //create
            /*          create 必须有impeachType（impeach_route中，根据URL设置）           */
            if(undefined===impeachType){
                return Promise.reject(controllerError.notDefineImpeachType)
            }

            userLoginCheck={
                needCheck:true,
                error:controllerError.userNotLoginCantCreate
            }

            penalizeCheck={
                penalizeType:e_penalizeType.NO_IMPEACH,
                penalizeSubType:e_penalizeSubType.CREATE,
                penalizeCheckError:controllerError.userInPenalizeNoImpeachCreate
            }
            //此处RECORD_INFO只包含了一个字段：impeachArticle或者(comment)Id。
            // impeachType是由URL决定（是internal的field），需要和其他默认之合并之后，才能进行preCheck_async（否则validate value会fail）
            expectedPart=[e_part.RECORD_INFO]
            //recordInfo存在的情况下，才试图从中获得impeachArticle/CommentId，组成新纪录;否则，直接在preCheck中报错
            if(undefined!==req.body.values[e_part.RECORD_INFO]){
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
            }
            // console.log(`before preCheck_async===============>`)
            tmpResult=await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
            // console.log(`after preCheck_async===============>`)
            //tmpResult=await controllerHelper.preCheck_async({req:req,collName:collConfig.collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
            // tmpResult=await createContent_async({req:req,collConfig:collConfig,collImageConfig:collImageConfig})
            tmpResult=await create_async({req:req,impeachType:impeachType})
            break;
        case e_method.SEARCH:// search
            break;
        case e_method.UPDATE: //update
            userLoginCheck={
                needCheck:true,
                error:controllerError.userNotLoginCantUpdate
            }
            penalizeCheck={
                penalizeType:e_penalizeType.NO_IMPEACH,
                penalizeSubType:e_penalizeSubType.UPDATE,
                penalizeCheckError:controllerError.userInPenalizeNoImpeachUpdate
            }

            expectedPart=[e_part.RECORD_INFO,e_part.RECORD_ID]
            // console.log(`update preCheck start============>`)
            tmpResult=await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
            //tmpResult=await controllerHelper.preCheck_async({req:req,collName:collConfig.collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
            // console.log(`update preCheck done============>`)

            /*      执行逻辑                */
            tmpResult=await update_async({req:req})
            break;
        case e_method.DELETE: //delete
            userLoginCheck={
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
            tmpResult=await delete_async({req:req})
            break;
        case e_method.MATCH: //match(login_async)
            break;
        case e_method.UPLOAD:
            userLoginCheck={
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
            }

            break;
    }

    return Promise.resolve(tmpResult)
}

module.exports={
    dispatcher_async
}