/**
 * Created by Ada on 2017/8/14.
 */
'use strict'




const fs=require('fs')

const e_userState=require('../../constant/enum/node').UserState
const e_part=require('../../constant/enum/node').ValidatePart
const e_method=require('../../constant/enum/node').Method
const e_randomStringType=require('../../constant/enum/node').RandomStringType
const e_uploadFileType=require('../../constant/enum/node').UploadFileType
// const e_method=require('../../constant/enum/node').Method

const e_hashType=require('../../constant/enum/node_runtime').HashType

const e_env=require('../../constant/enum/node').Env
const e_docStatus=require('../../constant/enum/mongo').DocStatus.DB
const e_penalizeType=require('../../constant/enum/mongo').PenalizeType.DB
const e_penalizeSubType=require('../../constant/enum/mongo').PenalizeSubType.DB
const e_iniSettingObject=require('../../constant/enum/initSettingObject').iniSettingObject
const e_articleStatus=require('../../constant/enum/mongo').ArticleStatus.DB
const e_impeachStatus=require('../../constant/enum/mongo').ImpeachStatus.DB
const e_impeachType=require('../../constant/enum/mongo').ImpeachType.DB
const e_referenceColl=require('../../constant/enum/mongo').ImpeachImageReferenceColl.DB

const e_fileSizeUnit=require('../../constant/enum/node_runtime').FileSizeUnit

const currentEnv=require('../../constant/config/appSetting').currentEnv
const uploadFileDefine=require('../../constant/config/globalConfiguration').uploadFileDefine

const e_dbModel=require('../../model/mongo/dbModel')
const fkConfig=require('../../model/mongo/fkConfig').fkConfig

const e_coll=require('../../constant/enum/DB_Coll').Coll
const e_field=require('../../constant/enum/DB_field').Field
const e_internal_field=require('../../constant/enum/DB_internal_field').Field
const e_uniqueField=require('../../constant/enum/DB_uniqueField').UniqueField
// const e_inputFieldCheckType=require('../../constant/enum/node').InputFieldCheckType

const helper=require('../helper')
const common_operation_model=require('../../model/mongo/operation/common_operation_model')
const hash=require('../../function/assist/crypt').hash

const misc=require('../../function/assist/misc')
// const checkRobot_async=require('../../function/assist/checkRobot').checkRobot_async


const sanityHtml=require('../../function/assist/sanityHtml').sanityHtml
/*const generateRandomString=require('../../function/assist/misc').generateRandomString
const sendVerificationCodeByEmail_async=require('../../function/assist/misc').sendVerificationCodeByEmail_async
const ifUserLogin=require('../../function/assist/misc').ifUserLogin*/

const dataConvert=require('../dataConvert')
const validateCreateRecorderValue=require('../../function/validateInput/validateValue').validateCreateRecorderValue
const validateUpdateRecorderValue=require('../../function/validateInput/validateValue').validateUpdateRecorderValue
const validateCURecordInfoFormat=require('../../function/validateInput/validateFormat').validateCURecordInfoFormat
// const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule
const internalInputRule=require('../../constant/inputRule/internalInputRule').internalInputRule
const inputRule=require('../../constant/inputRule/inputRule').inputRule
const e_fieldChineseName=require('../../constant/enum/inputRule_field_chineseName').ChineseName


const mongoError=require('../../constant/error/mongo/mongoError').error

const regex=require('../../constant/regex/regex').regex

const maxNumber=require('../../constant/config/globalConfiguration').maxNumber
const miscConfiguration=require('../../constant/config/globalConfiguration').miscConfiguration

const mailAccount=require('../../constant/config/globalConfiguration').mailAccount

/*          create article              */
// const checkUserState=require('../')
/*         upload user photo         */
const gmImage=require('../../function/assist/gmImage')
// const userPhotoConfiguration=require('../../constant/config/globalConfiguration').uploadFileDefine.user_thumb
const e_gmGetter=require('../../constant/enum/node_runtime').GmGetter
const e_gmCommand=require('../../constant/enum/node_runtime').GmCommand
const uploadFile=require('../../function/assist/upload')

/*         generate captcha         */
const captchaIntervalConfiguration=require('../../constant/config/globalConfiguration').intervalCheckConfiguration.captcha


const controllerError={
    /*          common              */
/*    fieldAlreadyExist(chineseFieldName,fieldInputValue){
        switch (fieldName){
            case e_field.article
        }
        return {rc:50200,msg:{client:`${fieldInputValue}已经存在`, server:`字段${chineseFieldName}中，值${fieldInputValue}已经存在`}}},*/

    /*          create new impeach              */
    userNotLoginCantCreate:{rc:50602,msg:`尚未登录，无法举报`},
    // userNoDefaultFolder:{rc:50205,msg:`没有默认目录，无法创建新文档`},
    userInPenalizeNoImpeachCreate:{rc:50604,msg:`管理员禁止举报`},
    contentSanityFailed:{rc:50606,msg:`举报内容包含有害内容，无法提交`},
    unknownImpeachType:{rc:50608,msg:`未知举报类型，无法创建`},


    // /*          update impeach              */
    // userNotLoginCantUpdate:{rc:50208,msg:`用户尚未登录，无法更改文档`},
    // userInPenalizeNoArticleUpdate:{rc:50209,msg:`管理员禁止更新文档`},
    // htmlContentSanityFailed:{rc:50210,msg:`文档内容中包含有害信息`},
    // notAuthorized:{rc:50212,msg:`无权更改文档`},
    // notAuthorizedFolder:{rc:50214,msg:`非目录创建者，无权在目录中添加文档`},


    // userInPenalizeNoArticleUpdate:{rc:50232,msg:`管理员禁止更新文档`},
}


//对CRUD（输入参数带有method）操作调用对应的函数
async function impeach_dispatcher_async(req){

    //检查格式
    // console.log(`req is ${JSON.stringify(req.cookies)}`)
    // console.log(`dispatcher in`)
    // console.log(`req.body.values ${JSON.stringify(req.body.values)}`)
    let collName=e_coll.IMPEACH,tmpResult

    //checkMethod只检测req的结构，以及req中method的格式和值，以便后续可以直接根据method进行调用
    tmpResult=helper.checkMethod({req:req})
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }
    //因为method已经检测过，所有要从req.body.values中删除，防止重复检查
    let method=req.body.values[e_part.METHOD]
    delete req.body.values[e_part.METHOD]

    let userLoginCheck,penalizeCheck,expectedPart
    switch (method){
        case e_method.CREATE: //create
            userLoginCheck={
                needCheck:true,
                error:controllerError.userNotLoginCantCreate
            }
            penalizeCheck={
                penalizeType:e_penalizeType.NO_IMPEACH,
                penalizeSubType:e_penalizeSubType.CREATE,
                penalizeCheckError:controllerError.userInPenalizeNoImpeachCreate
            }
            //此处RECORD_INFO只包含了部分字段：impeachType/impeachArticle(comment)Id,需要和其他默认之合并之后，才能进行preCheck_async（否则validate value会fail）
            expectedPart=[e_part.RECORD_INFO]
            //默认值模拟client端格式，以便直接进行validate value的测试
            let defaultDocValue={}
            defaultDocValue[e_field.IMPEACH.TITLE]={'value':'新举报'}
            defaultDocValue[e_field.IMPEACH.CONTENT]={'value':'对文档/评论的内容进行举报'}
            defaultDocValue[e_field.IMPEACH.IMPEACH_STATUS]={'value':e_impeachStatus.NEW}
            //合并defaultDoCValue和client端输入，模拟新建举报的client输入
            if(undefined!==req.body.values[e_part.RECORD_INFO]){
                Object.assign(req.body.values[e_part.RECORD_INFO],defaultDocValue)
            }

            tmpResult=await helper.preCheck_async({req:req,collName,method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})

            let collConfig={
                collName:e_coll.IMPEACH,  //存储内容（包含图片DOM）的coll名字
                fkFieldName:e_field.IMPEACH.IMPEACH_IMAGES_ID,//coll中，存储图片objectId的字段名
                contentFieldName:e_field.IMPEACH.CONTENT, //coll中，存储内容的字段名
            }
            let collImageConfig={
                collName:e_coll.IMPEACH_IMAGE,//实际存储图片的coll名
                fkFieldName:e_field.IMPEACH_IMAGE.IMPEACH_ID, //字段名，记录图片存储在那个coll中
                imageHashFieldName:e_field.IMPEACH_IMAGE.HASH_NAME //记录图片hash名字的字段名
            }
            // tmpResult=await createContent_async({req:req,collConfig:collConfig,collImageConfig:collImageConfig})
            tmpResult=await createContent_async({req:req,collConfig:collConfig})



            break;
        case e_method.SEARCH:// search
            break;
        case e_method.UPDATE: //update
            /*userLoginCheck={
                needCheck:true,
                error:controllerError.userNotLoginCantUpdate
            }
            penalizeCheck={
                penalizeType:e_penalizeType.NO_ARTICLE,
                penalizeSubType:e_penalizeSubType.UPDATE,
                penalizeCheckError:controllerError.userInPenalizeNoArticleUpdate
            }
            expectedPart=[e_part.RECORD_INFO,e_part.RECORD_ID]
            tmpResult=await helper.preCheck_async({req:req,collName,method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
// console.log(`article update precheck result======>${JSON.stringify(tmpResult)}`)

            /!*      执行逻辑                *!/
            tmpResult=await updateArticle_async(req)*/
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
* @collName：对哪个记录进行操作（article/impeach/comment?）
* @collImageName: 如果content要插入图片，图片存储的coll
* */
async  function createContent_async({req,collConfig}){
    let tmpResult,userId,docValue,collName
    userId=req.session.userId
    collName=collConfig.collName
// console.log(`userId ====>${userId}`)
    /*              检查是否有权（authorize）创建            */


    /*              client数据转换                  */
    docValue=req.body.values[e_part.RECORD_INFO]
    dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])

    /*              特殊字段的检查                 */
    //content是否包含XSS+content是否有要删除的image
    let contentFieldName=collConfig.contentFieldName
    if(undefined!==docValue[contentFieldName]){
        let content=docValue[contentFieldName]
        //XSS检查
        await helper.contentXSSCheck_async({content:content,error:controllerError.contentSanityFailed})
        //content中图片和db中的图片比较，决定是否要删除content中DOM，以及是否要删除db中的记录
        /*
        create中因为没有recordId，所以无法执行contentDbDeleteNotExistImage_async
        同时，create中content为初始化内容，无image，也不必要执行contentDbDeleteNotExistImage_async
        docValue[contentFieldName]=await helper.contentDbDeleteNotExistImage_async({content:content,recordId:recordId,collConfig:collConfig,collImageConfig:collImageConfig})
        */
    }
console.log(`contentXSSCheck_async done`)




    /*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           */
    let internalValue={}
    internalValue[e_field.IMPEACH.CREATOR_ID]=userId
    internalValue[e_field.IMPEACH.IMPEACH_STATUS]=e_impeachStatus.NEW //覆盖client端输入，确保字段值是new（防止恶意设置成其他值）
    //根据获得其作者ID
    let impeachedThingId //articleId/comment的id
    let impeachedThingFieldName //impeach中，id位于（article/comment）的那个coll

    let impeachedThingRelatedColl //id对应哪个coll，以便从中获得userId
    let impeachedThingRelatedCollFieldName //id对应哪个coll，其中哪个字段代表userId
    switch (docValue[e_field.IMPEACH.IMPEACH_TYPE]){
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
    tmpResult=await  common_operation_model.findById({dbModel:e_dbModel[impeachedThingRelatedColl],id:impeachedThingId})
    internalValue[e_field.IMPEACH.IMPEACHED_USER_ID]=tmpResult.msg[impeachedThingRelatedCollFieldName]
// console.log(`impeached user id=======>${JSON.stringify(internalValue[e_field.IMPEACH.IMPEACHED_USER_ID])}`)

    if(e_env.DEV===currentEnv && Object.keys(internalValue).length>0){
        // console.log(`before newDocValue====>${JSON.stringify(internalValue)}`)
        // let newDocValue=dataConvert.addSubFieldKeyValue(internalValue)
        // console.log(`newDocValue====>${JSON.stringify(newDocValue)}`)
        let tmpResult=helper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[collName],collInternalRule:internalInputRule[collName]})
// console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    Object.assign(docValue,internalValue)
console.log(`after internal check =======>${JSON.stringify(docValue)}`)

    /*              检查外键字段的值是否存在(fkConfig中存在的)                */
    await helper.ifFkValueExist_async({docValue:docValue,collFkConfig:fkConfig[collName],collFieldChineseName:e_fieldChineseName[collName]})

    /*              upload image才会有                     */
    /*/!*              检查外键字段的值是否存在(因为referenceId需要和referenceType并在一起才能判断属于哪个coll，因此要手动写code)                *!/
    let fkFieldValue=docValue[e_field.IMPEACH_IMAGE.REFERENCE_ID]
    let relatedCollName,fkFieldChineseName=e_fieldChineseName[e_coll.IMPEACH_IMAGE]
    switch (docValue[e_field.IMPEACH_IMAGE.REFERENCE_COLL]){
        case e_referenceColl.IMPEACH:
            await helper.ifSingleFieldFkValueExist_async({fkFieldValue,relatedCollName,fkFieldChineseName,})
            break;
        case e_referenceColl.IMPEACH_COMMENT:
            await helper.ifSingleFieldFkValueExist_async({fkFieldValue,relatedCollName,fkFieldChineseName,})
            break;
        default:

    }*/




    /*              如果有unique字段，需要预先检查unique(express级别，而不是mongoose级别)            */
    if(undefined!==e_uniqueField[collName] && e_uniqueField[collName].length>0) {
        await helper.ifFiledInDocValueUnique_async({collName: collName, docValue: docValue})
    }

    //new article插入db
    tmpResult= await common_operation_model.create({dbModel:e_dbModel[collName],value:docValue})
// console.log(`create result is ====>${JSON.stringify(tmpResult)}`)

    return Promise.resolve({rc:0,msg:tmpResult.msg})
}


/*
* 更新文档
* 1. 需要当前用户是否有权修改文档（为文档作者）
* 2. 需要检查html中的image是否在磁盘上存在
* 3. 检查tag(传入为字符)是否存在，不存在，在coll tag中新建记录，最终用objectId替换字符
* 4. 检查是否选择了folder（输入为objectId），如果选择了，folder是否为当前用户所有
* */
async function updateArticle_async(req){
    // console.log(`update article in========>`)

    let tmpResult
    let userId=req.session.userId
    let articleId=req.body.values[e_part.RECORD_ID]
    let originalArticle
    let collName=e_coll.ARTICLE

    /*              查找id为文档，且作者为userid的记录，找不到说明不是作者，无权修改            */
    let condition={}
    condition['_id']=articleId
    condition[e_field.ARTICLE.AUTHOR_ID]=userId
    tmpResult=await  common_operation_model.find({dbModel:e_dbModel[collName],condition:condition})
    if(tmpResult.msg.length!==1){
        return Promise.reject(controllerError.notAuthorized)
    }
    originalArticle=misc.objectDeepCopy({},tmpResult.msg[0])

    /*              client数据转换                  */
    let docValue=req.body.values[e_part.RECORD_INFO]
    dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])

    // let result=await common_operation_model.findById({dbModel:dbModel[e_coll.USER],id:objectId})
    // let userId=result.msg[e_field.USER.]

    /*              剔除value没有变化的field            */
    // console.log(`updateUser after compare with origin value ${JSON.stringify(docValue)}`)
    // console.log(`originUserInfo value ${JSON.stringify(originUserInfo)}`)
    for(let singleFieldName in docValue){
        if(docValue[singleFieldName]===originalArticle[singleFieldName]){
            delete docValue[singleFieldName]
        }
    }


    /*              检查外键字段的值是否存在                */
    await helper.ifFkValueExist_async({docValue:docValue,collFkConfig:fkConfig[collName],collFieldChineseName:e_fieldChineseName[collName]})

// console.log(`fk exist check done====>`)
//     console.log(`docValue====>${JSON.stringify(docValue)}`)

    /*              检测某些字段                  */
    //1. 如果content存在
    // 1.1 content进行sanity，sanity之后的结果失败，返回错误（而不是存入db）
    // 1.2 其中包含的图片是否已经被删除，删除的话，需要同时在磁盘上删除对应的文件，以便节省空间
    if(undefined!==docValue[e_field.ARTICLE.HTML_CONTENT]){
        let htmlContent=docValue[e_field.ARTICLE.HTML_CONTENT]
        if(sanityHtml(htmlContent)!==htmlContent){
            return Promise.reject(controllerError.htmlContentSanityFailed)
        }
        // console.log(`sanity html done=======>`)
        let innerImageInArticle=htmlContent.match(regex.hashImageName)
        // console.log(`innerImageInArticle=======>${JSON.stringify(innerImageInArticle)}`)
        let articleImageCondition={}
        articleImageCondition[e_field.ARTICLE_IMAGE.ARTICLE_ID]=articleId
        //读取article的所有图片文件信息
        tmpResult=await common_operation_model.find({dbModel:e_dbModel.article_image,condition:articleImageCondition})
        if(null!==innerImageInArticle && innerImageInArticle.length>0){

        }

    }
    // console.log(`image check done====>`)
    //2. 如果有tag，检测是否已经在coll中存在。存在：从字符转换成objectId，不存在，coll tag中创建一个新的，并获得objectId
    if(undefined!==docValue[e_field.ARTICLE.TAGS_ID]){
        for(let idx in docValue[e_field.ARTICLE.TAGS_ID]){
            let tmpCondition={}
            tmpCondition[e_field.TAG.NAME]=docValue[e_field.ARTICLE.TAGS_ID][idx]
            tmpResult=await common_operation_model.find({dbModel:e_dbModel.tag,condition:tmpCondition})
            //tag已经存在，用objectId替换掉原来的字符
            if(tmpResult.msg.length===1){
                // console.log(`tag exiust==========`)
                docValue[e_field.ARTICLE.TAGS_ID][idx]=tmpResult.msg[0]['_id']
            }else{
            //tag 不存在，创建一个新的tag，并保存返回的objectId
            //     console.log(`tag not exist==========`)
                tmpResult=await common_operation_model.create({dbModel:e_dbModel.tag,value:{name:docValue[e_field.ARTICLE.TAGS_ID][idx]}})
                // console.log(`tag new create result==========${JSON.stringify(tmpResult)}`)
                // console.log(`docValue not exit==========${JSON.stringify(docValue)}`)
                docValue[e_field.ARTICLE.TAGS_ID][idx]=tmpResult.msg['_id']
            }
        }

    }
    // console.log(`tag check result====>${JSON.stringify(docValue)}`)
    // console.log(`tag check done====>`)
    //3. 如果有folder，检测folder的owner是否为当前用户
    if(undefined!==docValue[e_field.ARTICLE.FOLDER_ID]){
        condition={}
        condition[e_field.FOLDER.AUTHOR_ID]=userId
        condition['_id']=docValue[e_field.ARTICLE.FOLDER_ID]
        // console.log(`folder check=========>${JSON.stringify(condition)}`)
        tmpResult=await common_operation_model.find({dbModel:e_dbModel.folder,condition:condition})
        // console.log(`folder check result=========>${JSON.stringify(tmpResult)}`)
        if(tmpResult.msg.length!==1){
            return Promise.reject(controllerError.notAuthorizedFolder)
        }
    }

    /*              获得internal field，并进行检查                  */
    let internalValue={}
/*    if(undefined!==docValue[e_field.ARTICLE.TAGS_ID]){
        internalValue[e_field.ARTICLE.TAGS_ID]=docValue[e_field.ARTICLE.TAGS_ID]
    }*/
    if(e_env.DEV===currentEnv && Object.keys(internalValue).length>0){
        let tmpResult=helper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[collName],collInternalRule:internalInputRule[e_coll.ARTICLE]})
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    //因为internalValue只是进行了转换，而不是新增，所以无需ObjectDeepCopy
    // Object.assign(docValue,internalValue)


    /*              如果有unique字段，需要预先检查unique(express级别，而不是mongoose级别)            */
    if(undefined!==e_uniqueField[collName] && e_uniqueField[collName].length>0) {
        await helper.ifFiledInDocValueUnique_async({collName: collName, docValue: docValue})
    }

    /*              更新数据            */
    tmpResult=await common_operation_model.update({dbModel:e_dbModel[collName],id:articleId,values:docValue})
    return Promise.resolve({rc:0})

}



module.exports={
    impeach_dispatcher_async,
    controllerError,
}