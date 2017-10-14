/**
 * Created by Ada on 2017/8/14.
 */
'use strict'

const fs=require('fs')

const server_common_file_require=require('../../../server_common_file_require')

const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

/*const maxSearchKeyNum=require('../../../constant/config/globalConfiguration').searchSetting.maxKeyNum
const maxSearchPageNum=require('../../../constant/config/globalConfiguration').searchMaxPage.readName*/

// const e_userState=require('../../constant/enum/node').UserState
const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
/*const e_randomStringType=require('../../constant/enum/node').RandomStringType
const e_uploadFileType=require('../../constant/enum/node').UploadFileType*/
// const e_method=require('../../constant/enum/node').Method

// const e_hashType=require('../../constant/enum/node_runtime').HashType

const e_env=nodeEnum.Env
// const e_docStatus=mongoEnum.DocStatus.DB
const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB
// const e_iniSettingObject=require('../../constant/enum/initSettingObject').iniSettingObject
// const e_articleStatus=mongoEnum.ArticleStatus.DB
const e_impeachState=mongoEnum.ImpeachState.DB
const e_impeachType=mongoEnum.ImpeachType.DB
// const e_referenceColl=mongoEnum.ImpeachImageReferenceColl.DB

// const e_fileSizeUnit=require('../../constant/enum/node_runtime').FileSizeUnit

const currentEnv=server_common_file_require.appSetting.currentEnv
// const uploadFileDefine=require('../../constant/config/globalConfiguration').uploadFileDefine

const e_dbModel=require('../../constant/genEnum/dbModel')
const fkConfig=server_common_file_require.fkConfig.fkConfig

const e_coll=require('../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../constant/genEnum/DB_field').Field
// const e_internal_field=require('../../constant/enum/DB_internal_field').Field
const e_uniqueField=require('../../constant/genEnum/DB_uniqueField').UniqueField
// const e_chineseName=require('../../constant/genEnum/inputRule_field_chineseName').ChineseName
// const e_inputFieldCheckType=require('../../constant/enum/node').InputFieldCheckType
const e_fieldChineseName=require('../../constant/genEnum/inputRule_field_chineseName').ChineseName

const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
// const hash=require('../../function/assist/crypt').hash

const misc=server_common_file_require.misc
// const checkRobot_async=require('../../function/assist/checkRobot').checkRobot_async


const sanityHtml=server_common_file_require.sanityHtml.sanityHtml
/*const generateRandomString=require('../../function/assist/misc').generateRandomString
const sendVerificationCodeByEmail_async=require('../../function/assist/misc').sendVerificationCodeByEmail_async
const ifUserLogin=require('../../function/assist/misc').ifUserLogin*/

const dataConvert=server_common_file_require.dataConvert
/*const validateCreateRecorderValue=require('../../function/validateInput/validateValue').validateCreateRecorderValue
const validateUpdateRecorderValue=require('../../function/validateInput/validateValue').validateUpdateRecorderValue
const validateCURecordInfoFormat=require('../../function/validateInput/validateFormat').validateCURecordInfoFormat*/
// const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule
const internalInputRule=require('../../constant/inputRule/internalInputRule').internalInputRule
const inputRule=require('../../constant/inputRule/inputRule').inputRule



// const mongoError=require('../../constant/error/mongo/mongoError').error

const regex=server_common_file_require.regex

/*const maxNumber=require('../../constant/config/globalConfiguration').maxNumber
const miscConfiguration=require('../../constant/config/globalConfiguration').miscConfiguration

const mailAccount=require('../../constant/config/globalConfiguration').mailAccount*/

/*          create article              */
// const checkUserState=require('../')
/*         upload user photo         */
// const gmImage=require('../../function/assist/gmImage')
// const userPhotoConfiguration=require('../../constant/config/globalConfiguration').uploadFileDefine.user_thumb
/*const e_gmGetter=require('../../constant/enum/node_runtime').GmGetter
const e_gmCommand=require('../../constant/enum/node_runtime').GmCommand
const uploadFile=require('../../function/assist/upload')*/

/*         generate captcha         */
// const captchaIntervalConfiguration=require('../../constant/config/globalConfiguration').intervalCheckConfiguration.captcha


const controllerError={
    /*          common              */
/*    fieldAlreadyExist(chineseFieldName,fieldInputValue){
        switch (fieldName){
            case e_field.article
        }
        return {rc:50200,msg:{client:`${fieldInputValue}已经存在`, server:`字段${chineseFieldName}中，值${fieldInputValue}已经存在`}}},*/

    /*          create new impeach              */
    notDefineImpeachType:{rc:50601,msg:`举报类型未设置`},
    userNotLoginCantCreate:{rc:50602,msg:`尚未登录，无法举报`},
    // userNoDefaultFolder:{rc:50205,msg:`没有默认目录，无法创建新文档`},
    userInPenalizeNoImpeachCreate:{rc:50604,msg:`管理员禁止举报`},
    contentSanityFailed:{rc:50606,msg:`举报内容包含有害内容，无法提交`},
    unknownImpeachType:{rc:50608,msg:`未知举报类型，无法创建`},
    impeachObjectNotExist:{rc:50609,msg:`举报对象不存在`},

    /*          update impeach              */
    impeachTypeNotAllow:{rc:50610,msg:`无需设置举报类型`},
    userNotLoginCantUpdate:{rc:50611,msg:`用户尚未登录，无法更改`},
    userInPenalizeNoImpeachUpdate:{rc:50612,msg:`管理员禁止更新举报`},
    notAuthorized:{rc:50614,msg:`非举报创建者，无权修改举报`},
    inputSanityFailed:{rc:50616,msg:`输入内容中包含有害信息`},
    // userInPenalizeNoArticleUpdate:{rc:50209,msg:`管理员禁止更新文档`},
    // inputSanityFailed:{rc:50210,msg:`文档内容中包含有害信息`},
    // notAuthorized:{rc:50212,msg:`无权更改文档`},




}


//对CRUD（输入参数带有method）操作调用对应的函数
async function impeach_dispatcher_async(req,impeachType){

    //检查格式
    // console.log(`req is ${JSON.stringify(req.cookies)}`)
    // console.log(`dispatcher in`)
    // console.log(`req.body.values ${JSON.stringify(req.body.values)}`)
    let tmpResult,collConfig={},collImageConfig={}

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
            //默认值模拟client端格式，以便直接进行validate value的测试
            let defaultDocValue={}
            defaultDocValue[e_field.IMPEACH.TITLE]={'value':'新举报'}
            defaultDocValue[e_field.IMPEACH.CONTENT]={'value':'对文档/评论的内容进行举报'}
            // defaultDocValue[e_field.IMPEACH.IMPEACH_STATUS]={'value':e_impeachStatus.NEW}
            //合并defaultDoCValue和client端输入，模拟新建举报的client输入
            if(undefined!==req.body.values[e_part.RECORD_INFO]){
                Object.assign(req.body.values[e_part.RECORD_INFO],defaultDocValue)
            }
            collConfig={
                collName:e_coll.IMPEACH,  //存储内容（包含图片DOM）的coll名字
                fkFieldName:e_field.IMPEACH.IMPEACH_IMAGES_ID,//coll中，存储图片objectId的字段名
                contentFieldName:e_field.IMPEACH.CONTENT, //coll中，存储内容的字段名
            }
            // console.log(`req.body.values===========>${JSON.stringify(req.body.values)}`)
            // console.log(`expectedPart===========>${JSON.stringify(expectedPart)}`)
            tmpResult=await controllerHelper.preCheck_async({req:req,collName:collConfig.collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
	    //tmpResult=await controllerHelper.preCheck_async({req:req,collName:collConfig.collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
            // tmpResult=await createContent_async({req:req,collConfig:collConfig,collImageConfig:collImageConfig})
            tmpResult=await createContent_async({req:req,collConfig:collConfig,impeachType:impeachType})
            break;
        case e_method.SEARCH:// search
            break;
        case e_method.UPDATE: //update
// console.log(`update in========================>`)
            /*          update 必须没有impeachType（impeach_route中，根据URL设置）           */
            if(undefined!==impeachType){
                return Promise.reject(controllerError.impeachTypeNotAllow)
            }


            userLoginCheck={
                needCheck:true,
                error:controllerError.userNotLoginCantUpdate
            }
            penalizeCheck={
                penalizeType:e_penalizeType.NO_IMPEACH,
                penalizeSubType:e_penalizeSubType.UPDATE,
                penalizeCheckError:controllerError.userInPenalizeNoImpeachUpdate
            }
            /*          collConfig和collImageConfig主要用于image检查，也提供collName       */
            collConfig={
                collName:e_coll.IMPEACH,  //存储内容（包含图片DOM）的coll名字
                fkFieldName:e_field.IMPEACH.IMPEACH_IMAGES_ID,//coll中，存储图片objectId的字段名
                contentFieldName:e_field.IMPEACH.CONTENT, //coll中，存储内容的字段名
                ownerFieldName:e_field.IMPEACH.CREATOR_ID,// coll中，作者的字段名
            }
            collImageConfig={
                collName:e_coll.IMPEACH_IMAGE,//实际存储图片的coll名
                fkFieldName:e_field.IMPEACH_IMAGE.REFERENCE_ID, //字段名，记录图片存储在那个coll中
                imageHashFieldName:e_field.IMPEACH_IMAGE.HASH_NAME //记录图片hash名字的字段名
            }
            expectedPart=[e_part.RECORD_INFO,e_part.RECORD_ID]

            tmpResult=await controllerHelper.preCheck_async({req:req,collName:collConfig.collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
	    //tmpResult=await controllerHelper.preCheck_async({req:req,collName:collConfig.collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
// console.log(`collImageConfig======>${JSON.stringify(collImageConfig)}`)



            /*      执行逻辑                */
            tmpResult=await updateContent_async({req:req,collConfig:collConfig,collImageConfig:collImageConfig})
            break;
        case e_method.DELETE: //delete
            break;
        case e_method.MATCH: //match(login_async)

    }
    
    return Promise.resolve(tmpResult)
}




/*          必须新产生一个默认document，以便提供objectId，这样用户插入图片的时候，就可以使用此objectId作为外键了
            新content无任何输入，所有的值都是内部产生
* @defaultDocValue: 在后台创建一个默认记录，以便image或者content得到对应的id，进行操作
* @collConfig:主要用在update，create中只是用了其中的collName
* @impeachType: 根据URL指明被举报的是article还是comment，需要加入到internal Field中
* */
async  function createContent_async({req,collConfig,impeachType}){
    let tmpResult,docValue,collName
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let userId=userInfo.userId

    collName=collConfig.collName
// console.log(`createContent_async in with  impeachType====>${impeachType}`)
    /*              检查是否有权（authorize）创建            */


    /*              client数据转换                  */
    docValue=req.body.values[e_part.RECORD_INFO]
    //dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])

    /*              特殊字段的检查                 */
    //content是否包含XSS+content是否有要删除的image
    let contentFieldName=collConfig.contentFieldName
    if(undefined!==docValue[contentFieldName]){
        let content=docValue[contentFieldName]
        //XSS检查
        await controllerHelper.contentXSSCheck_async({content:content,error:controllerError.contentSanityFailed})
        //content中图片和db中的图片比较，决定是否要删除content中DOM，以及是否要删除db中的记录
        /*
        create中因为没有recordId，所以无法执行contentDbDeleteNotExistImage_async
        同时，create中content为初始化内容，无image，也不必要执行contentDbDeleteNotExistImage_async
        docValue[contentFieldName]=await controllerHelper.contentDbDeleteNotExistImage_async({content:content,recordId:recordId,collConfig:collConfig,collImageConfig:collImageConfig})
        */
    }
// console.log(`contentXSSCheck_async done`)

    /*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           */
    let internalValue={}

    //检查从impeach_route传入的impeachType是不是预定值之一
    if(e_env.DEV===currentEnv){
        // console.log(`Object.values(e_impeachType)=======>${JSON.stringify(Object.values(e_impeachType))}`)
        if(-1===Object.values(e_impeachType).indexOf(impeachType)){
            return Promise.reject(controllerError.unknownImpeachType)
        }
    }
    internalValue[e_field.IMPEACH.IMPEACH_TYPE]=impeachType

    internalValue[e_field.IMPEACH.CREATOR_ID]=userId
    // internalValue[e_field.IMPEACH.IMPEACH_STATUS]=e_impeachStatus.NEW //覆盖client端输入，确保字段值是new（防止恶意设置成其他值）
    //根据获得其作者ID
    let impeachedThingId //articleId/comment的id
    let impeachedThingFieldName //impeach中，id位于（article/comment）的那个coll

    let impeachedThingRelatedColl //id对应哪个coll，以便从中获得userId
    let impeachedThingRelatedCollFieldName //id对应哪个coll，其中哪个字段代表userId
    switch (impeachType){
        case e_impeachType.ARTICLE:
            impeachedThingRelatedColl=e_coll.ARTICLE
            impeachedThingRelatedCollFieldName=e_field.ARTICLE.AUTHOR_ID

            impeachedThingFieldName=e_field.IMPEACH.IMPEACHED_ARTICLE_ID
            break;
        case e_impeachType.COMMENT:
            impeachedThingRelatedColl=e_coll.ARTICLE_COMMENT
            impeachedThingRelatedCollFieldName=e_field.ARTICLE_COMMENT.AUTHOR_ID

            impeachedThingFieldName=e_field.IMPEACH.IMPEACHED_COMMENT_ID
            break;
        default:
            return Promise.reject(controllerError.unknownImpeachType)

    }
    impeachedThingId=docValue[impeachedThingFieldName]
    // console.log(`impeachedThingRelatedColl======>${impeachedThingRelatedColl}`)
    // console.log(`e_dbModel[impeachedThingRelatedColl]=====>${JSON.stringify(e_dbModel[impeachedThingRelatedColl])}`)
    // console.log(`impeachedThingId=====>${JSON.stringify(impeachedThingId)}`)
    tmpResult=await  common_operation_model.findById_returnRecord_async({dbModel:e_dbModel[impeachedThingRelatedColl],id:impeachedThingId})
    if(null===tmpResult){
        return Promise.reject(controllerError.impeachObjectNotExist)
    }
    internalValue[e_field.IMPEACH.IMPEACHED_USER_ID]=tmpResult[impeachedThingRelatedCollFieldName]
// console.log(`impeached user id=======>${JSON.stringify(internalValue[e_field.IMPEACH.IMPEACHED_USER_ID])}`)

    if(e_env.DEV===currentEnv && Object.keys(internalValue).length>0){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[collName],collInternalRule:internalInputRule[collName]})
// console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    Object.assign(docValue,internalValue)
// console.log(`after internal check =======>${JSON.stringify(docValue)}`)

    /*              检查外键字段的值是否存在(fkConfig中存在的)                */
    await controllerChecker.ifFkValueExist_async({docValue:docValue,collFkConfig:fkConfig[collName],collFieldChineseName:e_fieldChineseName[collName]})

     /*              如果有unique字段，需要预先检查unique(express级别，而不是mongoose级别)            */
    if(undefined!==e_uniqueField[collName] && e_uniqueField[collName].length>0) {
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue})
	//await controllerHelper.ifFiledInDocValueUnique_async({collName: collName, docValue: docValue,e_uniqueField:e_uniqueField,e_chineseName:e_chineseName})
    }

    //new impeach插入db
    tmpResult= await common_operation_model.create_returnRecord_async({dbModel:e_dbModel[collName],value:docValue})
// console.log(`create result is ====>${JSON.stringify(tmpResult)}`)

    //插入关联数据（impeachState=new）
    let impeachStateValue={
        [e_field.IMPEACH_STATE.IMPEACH_ID]:tmpResult['_id'],
        [e_field.IMPEACH_STATE.OWNER_ID]:userId,
        [e_field.IMPEACH_STATE.OWNER_COLL]:e_coll.USER,
        [e_field.IMPEACH_STATE.STATE]:e_impeachState.NEW,
        [e_field.IMPEACH_STATE.DEALER_ID]:userId,
        [e_field.IMPEACH_STATE.DEALER_COLL]:e_coll.USER,
    }
    await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.impeach_state,value:impeachStateValue})
    return Promise.resolve({rc:0,msg:tmpResult})
}


/*
* 更新文档(不包含图片和附件)
* 1. 需要当前用户是否有权修改文档（为文档作者）
* 2. 需要检查html中的image是否在磁盘上存在
* 3. 检查tag(传入为字符)是否存在，不存在，在coll tag中新建记录，最终用objectId替换字符
* 4. 检查是否选择了folder（输入为objectId），如果选择了，folder是否为当前用户所有
* */
async function updateContent_async({req,collConfig,collImageConfig}){
    // console.log(`update article in========>`)

    let tmpResult

    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let userId=userInfo.userId

    let impeachId=req.body.values[e_part.RECORD_ID]
    let originalDoc
    let collName=collConfig.collName



    /*              查找id为举报，且作者为userId，且未被标记为删除的举报记录，找不到说明不是作者，无权修改            */
    let condition={}
    condition['_id']=impeachId
    condition[collConfig.ownerFieldName]=userId
    condition['dDate']={$exists:false}
    tmpResult=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel[collName],condition:condition})
    if(tmpResult.length!==1){
        return Promise.reject(controllerError.notAuthorized)
    }
    originalDoc=misc.objectDeepCopy({},tmpResult[0])

    /*              client数据转换                  */
    let docValue=req.body.values[e_part.RECORD_INFO]
    //dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])

    /*              update中，字段impeachedArticleId和impeachedCommentId是client输入，但是在update是不能被修改，需要删除
    *               impeachStatus通过一个独立的RESTAPI进行修改（逻辑更加清晰），所以此处也要删除
    */
    let notAllowUpdateFields=[e_field.IMPEACH.IMPEACHED_ARTICLE_ID,e_field.IMPEACH.IMPEACHED_COMMENT_ID,e_field.IMPEACH.IMPEACH_STATUS]
    for(let singleNotAllowUpdateField of notAllowUpdateFields){
        delete docValue[singleNotAllowUpdateField]
    }
/*    /!*              update中，对于不同的用户，字段impeachStatus只能设置部分，而不是所有             *!/
    let normalUserAllowStatus=[e_impeachStatus.COMMIT]
    let adminUserAllowStatus=[e_impeachStatus.COMMIT]*/
    // let result=await common_operation_model.findById({dbModel:dbModel[e_coll.USER],id:objectId})
    // let userId=result.msg[e_field.USER.]

    /*              剔除value没有变化的field            */
    // console.log(`updateUser after compare with origin value ${JSON.stringify(docValue)}`)
    // console.log(`originUserInfo value ${JSON.stringify(originUserInfo)}`)
    for(let singleFieldName in docValue){
        if(docValue[singleFieldName]===originalDoc[singleFieldName]){
            delete docValue[singleFieldName]
        }
    }


    /*              检查外键字段的值是否存在                */
    await controllerChecker.ifFkValueExist_async({docValue:docValue,collFkConfig:fkConfig[collName],collFieldChineseName:e_fieldChineseName[collName]})

    /*              XSS检测                                 */
    let xssFields=[e_field.IMPEACH.TITLE,e_field.IMPEACH.CONTENT]
    for(let singleXSSField of xssFields){
        if(undefined!==docValue[singleXSSField]) {
            let htmlContent = docValue[singleXSSField]
            if (sanityHtml(htmlContent) !== htmlContent) {
                return Promise.reject(controllerError.inputSanityFailed)
            }
        }
    }

    /*              检测某些字段                  */
    //1. 如果content存在
    // 1.2 其中包含的图片是否已经被删除，删除的话，需要同时在磁盘上删除对应的文件，以便节省空间
    if(undefined!==docValue[e_field.IMPEACH.CONTENT]){
        docValue[e_field.IMPEACH.CONTENT]=await controllerHelper.contentDbDeleteNotExistImage_async({
            content:docValue[e_field.ARTICLE.HTML_CONTENT],
            recordId:impeachId,
            collConfig:collConfig,
            collImageConfig:collImageConfig,
        })
    }


    /*              获得internal field，并进行检查                  */
    let internalValue={}
/*    if(undefined!==docValue[e_field.ARTICLE.TAGS_ID]){
        internalValue[e_field.ARTICLE.TAGS_ID]=docValue[e_field.ARTICLE.TAGS_ID]
    }*/
    if(e_env.DEV===currentEnv && Object.keys(internalValue).length>0){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[collName],collInternalRule:internalInputRule[e_coll.ARTICLE]})
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    //因为internalValue只是进行了转换，而不是新增，所以无需ObjectDeepCopy
    // Object.assign(docValue,internalValue)


    /*              如果有unique字段，需要预先检查unique(express级别，而不是mongoose级别)            */
    if(undefined!==e_uniqueField[collName] && e_uniqueField[collName].length>0) {
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue})
	//await controllerHelper.ifFiledInDocValueUnique_async({collName: collName, docValue: docValue,e_uniqueField:e_uniqueField,e_chineseName:e_chineseName})
    }

    /*              更新数据            */
    await common_operation_model.update_returnRecord_async({dbModel:e_dbModel[collName],id:impeachId,values:docValue})
    return Promise.resolve({rc:0})

}



module.exports={
    impeach_dispatcher_async,
    controllerError,
}