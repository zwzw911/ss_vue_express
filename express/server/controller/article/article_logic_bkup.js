/**
 * Created by Ada on 2017/7/9.
 * url：
 *  1. /user，根据method的不同，调用不同的函数进行对应的处理
 *  2. /user/unique: 用户注册的时候，对应用户名/账号进行唯一性检查
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
const e_resourceRange=require('../../constant/enum/mongo').ResourceRange.DB
const e_resourceType=require('../../constant/enum/mongo').ResourceType.DB
const e_storePathUsage=require('../../constant/enum/mongo').StorePathUsage.DB

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

    /*          create new article              */
    userNotLoginCantCreate:{rc:50204,msg:`用户尚未登录，无法新建文档`},
    userNoDefaultFolder:{rc:50205,msg:`没有默认目录，无法创建新文档`},
    userInPenalizeNoArticleCreate:{rc:50206,msg:`管理员禁止创建文档`},

    /*          update article              */
    userNotLoginCantUpdate:{rc:50208,msg:`用户尚未登录，无法更改文档`},
    userInPenalizeNoArticleUpdate:{rc:50209,msg:`管理员禁止更新文档`},
    htmlContentSanityFailed:{rc:50210,msg:`文档内容中包含有害信息`},
    notAuthorized:{rc:50212,msg:`无权更改文档`},
    notAuthorizedFolder:{rc:50214,msg:`非目录创建者，无权在目录中添加文档`},

    /*          create new comment              */
    userNotLoginCantCreateComment:{rc:50220,msg:`用户尚未登录，无法发表评论`},
    userInPenalizeNoCommentCreate:{rc:50222,msg:`管理员禁止发表评论`},

    /*          upload article image                */
    userNotLoginCantCreateArticleImage:{rc:50230,msg:`用户尚未登录，无法插入图片`},
    undefinedRangeType:{rc:50232,msg:{client:`内部参数错误，请联系管理员`,server:`未定义的rangeType`}},

    //image 超出 resource_profile
    articleImageSizeExceed:{rc:50234,msg:{client:`文档图片总容量达到最大值，无法继续添加图片`,server:`文档图片容量达到最大`}},
    articleImageNumExceed:{rc:50236,msg:{client:`文档图片数量达到最大值，无法继续添加图片`,server:`文档图片数量达到最大`}},
    //attachment 超出 resource_profile
    articleAttachmentSizeExceed:{rc:50234,msg:{client:`文档附件总容量达到最大值，无法继续添加附件`,server:`文档附件容量达到最大`}},
    articleAttachmentNumExceed:{rc:50236,msg:{client:`文档附件数量达到最大值，无法继续添加附件`,server:`文档附件数量达到最大`}},
    //总量（用户为单位） 超出 resource_profile
    personalSizeExceed:{rc:50234,msg:{client:`个人空间达到最大值，无法继续添加文件`,server:`个人空间容量达到最大`}},
    personalFileNumExceed:{rc:50236,msg:{client:`个人文件数量达到最大值，无法继续添加`,server:`个人文件数量达到最大`}},

    notSupportImageFormat:{rc:50238,msg:`图片格式不支持`},
    notSupportAttachmentFormat:{rc:50238,msg:`附件格式不支持`},
    // userInPenalizeNoArticleUpdate:{rc:50232,msg:`管理员禁止更新文档`},
}


//对CRUD（输入参数带有method）操作调用对应的函数
async function article_dispatcher_async(req){

    //检查格式
    // console.log(`req is ${JSON.stringify(req.cookies)}`)
    // console.log(`dispatcher in`)
    // console.log(`req.body.values ${JSON.stringify(req.body.values)}`)
    let collName=e_coll.ARTICLE,tmpResult

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
                penalizeType:e_penalizeType.NO_ARTICLE,
                penalizeSubType:e_penalizeSubType.CREATE,
                penalizeCheckError:controllerError.userInPenalizeNoArticleCreate
            }
            expectedPart=[]
            tmpResult=await helper.preCheck_async({req:req,collName,method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})

            tmpResult=await createArticle_async(req)



            break;
        case e_method.SEARCH:// search
            break;
        case e_method.UPDATE: //update
            userLoginCheck={
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

            /*      执行逻辑                */
            tmpResult=await updateArticle_async(req)
            break;
        case e_method.DELETE: //delete
            break;
        case e_method.MATCH: //match(login_async)

    }
    
    return Promise.resolve(tmpResult)
}


//对CRUD（输入参数带有method）操作调用对应的函数
async function comment_dispatcher_async(req){

    //检查格式
    // console.log(`req is ${JSON.stringify(req.cookies)}`)
    // console.log(`dispatcher in`)
    // console.log(`req.body.values ${JSON.stringify(req.body.values)}`)
    let collName=e_coll.ARTICLE_COMMENT,tmpResult

    //dispatcher只检测req的结构，以及req中method的格式和值，以便后续可以直接根据method进行调用
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
                error:controllerError.userNotLoginCantCreateComment
            }
            penalizeCheck={
                penalizeType:e_penalizeType.NO_ARTICLE,
                penalizeSubType:e_penalizeSubType.CREATE,
                penalizeCheckError:controllerError.userInPenalizeNoCommentCreate
            }
            expectedPart=[e_part.RECORD_INFO]
            await helper.preCheck_async({req:req,collName,method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})

            await createComment_async(req)

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

    }

    return Promise.resolve(tmpResult)
}


//对article image的不同method（其实只有create），进行遇见，然后调用逻辑
async function articleUploadFile_dispatch_async(req){
    let collName=e_coll.ARTICLE,tmpResult
    //检查格式
    // console.log(`req is ${JSON.stringify(req.cookies)}`)
    // console.log(`dispatcher in`)
    // console.log(`req.body.values ${JSON.stringify(req.body.values)}`)

    //simditor上传的是params函数
    if(undefined!==req.body.params){
        req.body.values=req.body.params
    }



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
                error:controllerError.userNotLoginCantCreateArticleImage
            }
            penalizeCheck={
                penalizeType:e_penalizeType.NO_ARTICLE,
                penalizeSubType:e_penalizeSubType.UPDATE,
                penalizeCheckError:controllerError.userInPenalizeNoArticleUpdate
            }
            expectedPart=[e_part.RECORD_ID]
            tmpResult=await helper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
            tmpResult=await uploadArticleImage_async(req)



            break;
        case e_method.SEARCH:// search
            break;
        case e_method.UPDATE: //update
            break;
        case e_method.DELETE: //delete
            break;
        case e_method.MATCH: //match(login_async)

    }

    return Promise.resolve(tmpResult)
}

/*              新article无任何输入，所有的值都是内部产生                */
async  function createArticle_async(req){
    let tmpResult,userId,docValue
    userId=req.session.userId
// console.log(`userId ====>${userId}`)
    /*                  添加内部产生的client值（name && status && authorId && folderId）                  */
    docValue={}
    docValue[e_field.ARTICLE.NAME]="新建文档"

    docValue[e_field.ARTICLE.STATUS]=e_articleStatus.EDITING
    tmpResult=await common_operation_model.find({dbModel:e_dbModel.folder,condition:{authorId:userId,name:'我的文档'}})
    if(tmpResult.msg.length===0){
        return Promise.reject(controllerError.userNoDefaultFolder)
    }
    docValue[e_field.ARTICLE.FOLDER_ID]=tmpResult.msg[0]['id']
    docValue[e_field.ARTICLE.CATEGORY_ID]=e_iniSettingObject.category.other
    docValue[e_field.ARTICLE.HTML_CONTENT]=`\br`


    // console.log(`after attachment check=========>${JSON.stringify(docValue)}`)
// console.log(`docValue is ====>${JSON.stringify(docValue)}`)
    /*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           */
    let internalValue={}
    internalValue[e_field.ARTICLE.AUTHOR_ID]=req.session.userId
    if(e_env.DEV===currentEnv && Object.keys(internalValue).length>0){
        // console.log(`before newDocValue====>${JSON.stringify(internalValue)}`)
        // let newDocValue=dataConvert.addSubFieldKeyValue(internalValue)
        // console.log(`newDocValue====>${JSON.stringify(newDocValue)}`)
        let tmpResult=helper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[e_coll.ARTICLE],collInternalRule:internalInputRule[e_coll.ARTICLE]})
// console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    Object.assign(docValue,internalValue)

    //new article插入db
    tmpResult= await common_operation_model.create({dbModel:e_dbModel.article,value:docValue})
    console.log(`create result is ====>${JSON.stringify(tmpResult)}`)

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


async function createComment_async(req){
    // console.log(`create comment in =====>`)
    let tmpResult
    let userId=req.session.userId
    // let articleId=req.body.values[e_part.RECORD_ID]
    let collName=e_coll.ARTICLE_COMMENT
    // let originalArticle


    /*              client数据转换                  */
    let docValue=req.body.values[e_part.RECORD_INFO]
    dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])

    // let result=await common_operation_model.findById({dbModel:dbModel[e_coll.USER],id:objectId})
    // let userId=result.msg[e_field.USER.]


    /*              检查外键字段的值是否存在                */
    await helper.ifFkValueExist_async({docValue:docValue,collFkConfig:fkConfig[collName],collFieldChineseName:e_fieldChineseName[collName]})



    /*              获得internal field，并进行检查                  */
    let internalValue={}
    internalValue[e_field.ARTICLE_COMMENT.AUTHOR_ID]=userId
    if(e_env.DEV===currentEnv && Object.keys(internalValue).length>0){
        let tmpResult=helper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[collName],collInternalRule:internalInputRule[collName]})
        // console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    //internal加入docValue
    Object.assign(docValue,internalValue)

// console.log(`combined docValue is ${JSON.stringify(docValue)}`)
    /*              如果有unique字段，需要预先检查unique(express级别，而不是mongoose级别)            */
    if(undefined!==e_uniqueField[collName] && e_uniqueField[collName].length>0) {
        await helper.ifFiledInDocValueUnique_async({collName: collName, docValue: docValue})
    }


    /*              创建数据            */
    // let articleId=docValue[e_field.ARTICLE_COMMENT.ARTICLE_ID]
    await common_operation_model.create({dbModel:e_dbModel[collName],value:docValue})
    // tmpResult=await common_operation_model.update({dbModel:e_dbModel[collName],id:articleId,values:docValue})
    return Promise.resolve({rc:0})
}






/*async function uploadArticleImage_async(req){
    let tmpResult
    let userId=req.session.userId
    let articleId=req.body.values[e_part.RECORD_ID]
    let originalArticle
    let collName=e_coll.ARTICLE

    /!*              查找id为文档，且作者为userid的记录，找不到说明不是作者，无权修改            *!/
    let condition={}
    condition['_id']=articleId
    condition[e_field.ARTICLE.AUTHOR_ID]=userId
console.log(`condition to check user =====>${JSON.stringify(condition)}`)
    tmpResult=await  common_operation_model.find({dbModel:e_dbModel[collName],condition:condition})
    if(tmpResult.msg.length!==1){
        return Promise.reject(controllerError.notAuthorized)
    }
    originalArticle=misc.objectDeepCopy({},tmpResult.msg[0])

    /!*              上传文件存储到临时目录                         *!/
    let uploadResult=await helper.uploadFileToTmpDir_async({req:req, uploadTmpDir:e_iniSettingObject.store_path.UPLOAD_TMP.upload_tmp_dir.path, maxFileSize:uploadFileDefine.article_image.maxSizeInByte,fileSizeUnit:e_fileSizeUnit.MB})
    let {originalFilename,path,size}=uploadResult.msg

    // console.log(`group start========>`)
    /!*              获得用户当前的所有资源配置，并检查当前占用的资源（磁盘空间）+文件的资源（sizeInMB）后，还小于==>所有<==的资源配置（）                         *!/
    let resourceRangeToBeCheck=[e_resourceRange.PER_PERSON,e_resourceRange.PER_ARTICLE]
    //首先检查个人的（范围最大），然后检查article（范围小点的）
    for(let singleResourceRange of resourceRangeToBeCheck){
        tmpResult=await helper.chooseLastValidResourceProfile_async({resourceRange:singleResourceRange,userId:userId})
console.log(`chosed profile========>${JSON.stringify(tmpResult)}`)
        //只有一条记录，要么是default，要么是VIP
        let currentResourceProfile=misc.objectDeepCopy(tmpResult.msg)
        /!*              计算当前（每个）资源配置是否还够用               *!/
        let currentResourceUsage={totalFileNum:0,totalFileSizeInMb:0}
        //设置分组条件
        let match={},group={}

        switch (singleResourceRange){
            case e_resourceRange.PER_PERSON:
                //根据用户进行分组，获得所有image/attachment的size总和（Mb）
                match[e_field.ARTICLE_IMAGE.AUTHOR_ID]=dataConvert.convertToObjectId(userId)
                group={
                    _id:`$${[e_field.ARTICLE_IMAGE.AUTHOR_ID]}`,
                    totalImageSizeInMb:{$sum:`$${e_field.ARTICLE_IMAGE.SIZE_IN_MB}`},
                    totalFileNum:{$sum:1}
                }
                tmpResult=await common_operation_model.group_async({dbModel:e_dbModel.article_image,match:match,group:group})
console.log(`group by person result =====>${JSON.stringify(tmpResult)}`)
                currentResourceUsage.totalFileSizeInMb=tmpResult['totalImageSizeInMb']
                currentResourceUsage.totalFileNum=tmpResult['totalFileNum']
                //进行比较
                if(size+currentResourceUsage.totalFileSizeInMb>currentResourceProfile[e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]){
                    fs.unlink(path)
                    return Promise.reject(controllerError.personalSizeExceed)
                }
                if(1+currentResourceUsage.totalFileNum>currentResourceProfile[e_field.RESOURCE_PROFILE.MAX_FILE_NUM]){
                    fs.unlink(path)
                    return Promise.reject(controllerError.personalFileNumExceed)
                }
                break
            case e_resourceRange.PER_ARTICLE:
                //根据articleId进行分组，获得当前article中image/attachment的数量，已经size总和（byte）
                match[e_field.ARTICLE_IMAGE.AUTHOR_ID]=dataConvert.convertToObjectId(userId)
                match[e_field.ARTICLE_IMAGE.ARTICLE_ID]=dataConvert.convertToObjectId(articleId)
                group={
                    _id:`$${[e_field.ARTICLE_IMAGE.ARTICLE_ID]}`,
                    totalImageSizeInMb:{$sum:`$${e_field.ARTICLE_IMAGE.SIZE_IN_MB}`},
                    totalNum:{$sum:1}
                }
                tmpResult=await common_operation_model.group_async({dbModel:e_dbModel.article_image,match:match,group:group})
console.log(`group by article result =====>${JSON.stringify(tmpResult)}`)
                currentResourceUsage.totalFileSizeInMb=tmpResult['totalImageSizeInMb']
                currentResourceUsage.totalFileNum=tmpResult['totalFileNum']
                //进行比较
                if(size+currentResourceUsage.totalFileSizeInMb>currentResourceProfile[e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]){
                    fs.unlink(path)
                    return Promise.reject(controllerError.articleImageSizeExceed)
                }
                if(1+currentResourceUsage.totalFileNum>currentResourceProfile[e_field.RESOURCE_PROFILE.MAX_FILE_NUM]){
                    fs.unlink(path)
                    return Promise.reject(controllerError.articleImageNumExceed)
                }
                break
            default:
                return Promise.reject(controllerError.undefinedRangeType)
        }
    }


    /!*              文件move到永久存储目录                           *!/
    //通过gm获得格式
    let gmInst=gmImage.initImage({originalFilename})
    tmpResult=await gmImage.getImageProperty_async(gmInst,e_gmGetter.FORMAT)
    let suffix=tmpResult.msg
    //判断格式是否valid，否，报错=》删除=》推出
    if(-1===uploadFileDefine.common.imageType.indexOf(suffix)){
        fs.unlink(path)
        return Promise.reject(controllerError.notSupportImageFormat)
    }
    //对原始文件名进行md5化，然后加上gm得到的格式
    let md5NameWithoutSuffix=hash(`${originalFilename}${Date.now()}`,e_hashType.MD5)
    let finalFileName=`${md5NameWithoutSuffix.msg}.${suffix.toLowerCase()}`
    //获得合适的存储路径，并move文件
    tmpResult=await helper.chooseStorePath_async({usage:e_storePathUsage.ARTICLE_INNER_ATTACHMENT})
    let finalPath=tmpResult.msg.path+finalFileName
    let pathId=tmpResult.msg._id
    fs.renameSync(path,finalPath)

    /!*              内部检测                            *!/
    let internalValue={}
    internalValue[e_field.ARTICLE_IMAGE.NAME]=originalFilename
    internalValue[e_field.ARTICLE_IMAGE.HASH_NAME]=finalFileName
    internalValue[e_field.ARTICLE_IMAGE.PATH_ID]=pathId
    internalValue[e_field.ARTICLE_IMAGE.SIZE_IN_MB]=size
    internalValue[e_field.ARTICLE_IMAGE.AUTHOR_ID]=userId
    internalValue[e_field.ARTICLE_IMAGE.ARTICLE_ID]=articleId
    if(e_env.DEV===currentEnv){
        let tmpResult=helper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[collName],collInternalRule:internalInputRule[collName]})
// console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }

    //因为都是internal field，直接插入到coll
    /!*              插入记录到article_image            *!/
    tmpResult=await common_operation_model.create({dbModel:e_dbModel[collName],value:internalValue})
    let imageId=tmpResult.msg._id
    /!*              更新记录到article                  *!/
    tmpResult=await e_dbModel[e_coll.ARTICLE].update({_id:articleId},{$push:{[e_field.ARTICLE.ARTICLE_IMAGES_ID]:imageId}})
    return Promise.resolve({rc:0})
}*/


/*
* type: image还是attachment
* */
async function uploadArticleFile_async({req,type}){
    let tmpResult
    let userId=req.session.userId
    let articleId=req.body.values[e_part.RECORD_ID]
    // let originalArticle
    let collName=e_coll.ARTICLE
    let fileCollName

    /*              查找id为文档，且作者为userid的记录，找不到说明不是作者，无权修改            */
    let condition={}
    condition['_id']=articleId
    condition[e_field.ARTICLE.AUTHOR_ID]=userId
console.log(`condition to check user =====>${JSON.stringify(condition)}`)
    tmpResult=await  common_operation_model.find({dbModel:e_dbModel[collName],condition:condition})
    if(tmpResult.msg.length!==1){
        return Promise.reject(controllerError.notAuthorized)
    }
    // originalArticle=misc.objectDeepCopy({},tmpResult.msg[0])

    /*              上传文件存储到临时目录                         */
    let maxFileSize
    if(e_uploadFileType.IMAGE===type){
        maxFileSize=uploadFileDefine.article_image.maxSizeInByte
    }
    if(e_uploadFileType.ATTACHMENT===type){
        maxFileSize=uploadFileDefine.article_attachment.maxSizeInByte
    }
    let uploadResult=await helper.uploadFileToTmpDir_async({req:req, uploadTmpDir:e_iniSettingObject.store_path.UPLOAD_TMP.upload_tmp_dir.path, maxFileSize:maxFileSize,fileSizeUnit:e_fileSizeUnit.MB})
    let {originalFilename,path,size}=uploadResult.msg

    // console.log(`group start========>`)
    /*              获得用户当前的所有资源配置，并检查当前占用的资源（磁盘空间）+文件的资源（sizeInMB）后，还小于==>所有<==的资源配置（）                         */
    let resourceRangeToBeCheck=[e_resourceRange.PER_PERSON,e_resourceRange.PER_ARTICLE]
    //首先检查个人的（范围最大），然后检查article（范围小点的）
    for(let singleResourceRange of resourceRangeToBeCheck){
        tmpResult=await helper.chooseLastValidResourceProfile_async({resourceRange:singleResourceRange,userId:userId})
console.log(`chosed profile========>${JSON.stringify(tmpResult)}`)
        //只有一条记录，要么是default，要么是VIP
        let currentResourceProfile=misc.objectDeepCopy(tmpResult.msg)
        /*              计算当前（每个）资源配置是否还够用               */
        let currentResourceUsage={totalFileNum:0,totalFileSizeInMb:0}
        //设置分组条件
        let match={},group={}

        switch (singleResourceRange){
            case e_resourceRange.PER_PERSON:
                //根据用户进行分组，获得所有image/attachment的size总和（Mb）
                match[e_field.ARTICLE_IMAGE.AUTHOR_ID]=dataConvert.convertToObjectId(userId)
                group={
                    _id:`$${[e_field.ARTICLE_IMAGE.AUTHOR_ID]}`,
                    totalImageSizeInMb:{$sum:`$${e_field.ARTICLE_IMAGE.SIZE_IN_MB}`},
                    totalFileNum:{$sum:1}
                }
                tmpResult=await common_operation_model.group_async({dbModel:e_dbModel.article_image,match:match,group:group})
console.log(`group by person result =====>${JSON.stringify(tmpResult)}`)
                currentResourceUsage.totalFileSizeInMb+=tmpResult['totalImageSizeInMb']
                currentResourceUsage.totalFileNum+=tmpResult['totalFileNum']

                group={
                    _id:`$${[e_field.ARTICLE_ATTACHMENT.AUTHOR_ID]}`,
                    totalImageSizeInMb:{$sum:`$${e_field.ARTICLE_ATTACHMENT.SIZE_IN_MB}`},
                    totalFileNum:{$sum:1}
                }
                tmpResult=await common_operation_model.group_async({dbModel:e_dbModel.article_attachment,match:match,group:group})
console.log(`group by person result =====>${JSON.stringify(tmpResult)}`)
                currentResourceUsage.totalFileSizeInMb+=tmpResult['totalImageSizeInMb']
                currentResourceUsage.totalFileNum+=tmpResult['totalFileNum']

                //进行比较
                if(size+currentResourceUsage.totalFileSizeInMb>currentResourceProfile[e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]){
                    fs.unlink(path)
                    return Promise.reject(controllerError.personalSizeExceed)
                }
                if(1+currentResourceUsage.totalFileNum>currentResourceProfile[e_field.RESOURCE_PROFILE.MAX_FILE_NUM]){
                    fs.unlink(path)
                    return Promise.reject(controllerError.personalFileNumExceed)
                }
                break
            case e_resourceRange.PER_ARTICLE:
                //根据articleId进行分组，获得当前article中image/attachment的数量，以及size总和（byte）
                match[e_field.ARTICLE_IMAGE.AUTHOR_ID]=dataConvert.convertToObjectId(userId)
                match[e_field.ARTICLE_IMAGE.ARTICLE_ID]=dataConvert.convertToObjectId(articleId)
                group={
                    _id:`$${[e_field.ARTICLE_IMAGE.ARTICLE_ID]}`,
                    totalImageSizeInMb:{$sum:`$${e_field.ARTICLE_IMAGE.SIZE_IN_MB}`},
                    totalNum:{$sum:1}
                }
                tmpResult=await common_operation_model.group_async({dbModel:e_dbModel.article_image,match:match,group:group})
console.log(`group by article result =====>${JSON.stringify(tmpResult)}`)
                currentResourceUsage.totalFileSizeInMb+=tmpResult['totalImageSizeInMb']
                currentResourceUsage.totalFileNum+=tmpResult['totalFileNum']

                group={
                    _id:`$${[e_field.ARTICLE_ATTACHMENT.ARTICLE_ID]}`,
                    totalImageSizeInMb:{$sum:`$${e_field.ARTICLE_ATTACHMENT.SIZE_IN_MB}`},
                    totalNum:{$sum:1}
                }
                tmpResult=await common_operation_model.group_async({dbModel:e_dbModel.article_attachment,match:match,group:group})
console.log(`group by article result =====>${JSON.stringify(tmpResult)}`)
                currentResourceUsage.totalFileSizeInMb+=tmpResult['totalImageSizeInMb']
                currentResourceUsage.totalFileNum+=tmpResult['totalFileNum']


                //进行比较
                if(size+currentResourceUsage.totalFileSizeInMb>currentResourceProfile[e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]){
                    fs.unlink(path)
                    return Promise.reject(controllerError.articleImageSizeExceed)
                }
                if(1+currentResourceUsage.totalFileNum>currentResourceProfile[e_field.RESOURCE_PROFILE.MAX_FILE_NUM]){
                    fs.unlink(path)
                    return Promise.reject(controllerError.articleImageNumExceed)
                }
                break
            default:
                return Promise.reject(controllerError.undefinedRangeType)
        }
    }


    /*              文件move到永久存储目录                           */
    let finalFileName,suffix
    //格式检查
    if(e_uploadFileType.IMAGE===type){
        //通过gm获得格式
        let gmInst=gmImage.initImage({originalFilename})
        tmpResult=await gmImage.getImageProperty_async(gmInst,e_gmGetter.FORMAT)
        suffix=tmpResult.msg
        //判断格式是否valid，否，报错=》删除=》推出
        if(-1===uploadFileDefine.common.imageType.indexOf(suffix)){
            fs.unlink(path)
            return Promise.reject(controllerError.notSupportImageFormat)
        }
    }
    if(e_uploadFileType.ATTACHMENT===type){
        let tmp=originalFilename.split('.')
        suffix=tmp[tmp.length-1]
        //判断格式是否valid，否，报错=》删除=》推出
        if(-1===uploadFileDefine.common.attachmentType.indexOf(suffix)){
            fs.unlink(path)
            return Promise.reject(controllerError.notSupportAttachmentFormat)
        }
    }
    //对原始文件名进行md5化，然后加上suffix
    let md5NameWithoutSuffix=hash(`${originalFilename}${Date.now()}`,e_hashType.MD5)
    finalFileName=`${md5NameWithoutSuffix.msg}.${suffix.toLowerCase()}`

    //获得合适的存储路径，并move文件
    if(e_uploadFileType.IMAGE===type){
        tmpResult=await helper.chooseStorePath_async({usage:e_storePathUsage.ARTICLE_INNER_IMAGE})
    }
    if(e_uploadFileType.ATTACHMENT===type){
        tmpResult=await helper.chooseStorePath_async({usage:e_storePathUsage.ARTICLE_INNER_ATTACHMENT})
    }
    let finalPath=tmpResult.msg.path+finalFileName
    let pathId=tmpResult.msg._id
    fs.renameSync(path,finalPath)

    /*              内部field value检测                            */
    let internalValue={},fieldToBeChanged
    if(e_uploadFileType.IMAGE===type){
        internalValue[e_field.ARTICLE_IMAGE.NAME]=originalFilename
        internalValue[e_field.ARTICLE_IMAGE.HASH_NAME]=finalFileName
        internalValue[e_field.ARTICLE_IMAGE.PATH_ID]=pathId
        internalValue[e_field.ARTICLE_IMAGE.SIZE_IN_MB]=size
        internalValue[e_field.ARTICLE_IMAGE.AUTHOR_ID]=userId
        internalValue[e_field.ARTICLE_IMAGE.ARTICLE_ID]=articleId
        fileCollName=e_coll.ARTICLE_IMAGE
        fieldToBeChanged=e_field.ARTICLE.ARTICLE_IMAGES_ID
    }
    if(e_uploadFileType.ATTACHMENT===type){
        internalValue[e_field.ARTICLE_ATTACHMENT.NAME]=originalFilename
        internalValue[e_field.ARTICLE_ATTACHMENT.HASH_NAME]=finalFileName
        internalValue[e_field.ARTICLE_ATTACHMENT.PATH_ID]=pathId
        internalValue[e_field.ARTICLE_ATTACHMENT.SIZE_IN_MB]=size
        internalValue[e_field.ARTICLE_ATTACHMENT.AUTHOR_ID]=userId
        internalValue[e_field.ARTICLE_ATTACHMENT.ARTICLE_ID]=articleId
        fileCollName=e_coll.ARTICLE_ATTACHMENT
        fieldToBeChanged=e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID
    }

    if(e_env.DEV===currentEnv){
        let tmpResult=helper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[fileCollName],collInternalRule:internalInputRule[fileCollName]})
// console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }

    //因为都是internal field，直接插入到coll
    /*              插入记录到article_image            */
    tmpResult=await common_operation_model.create({dbModel:e_dbModel[fileCollName],value:internalValue})
    let fileId=tmpResult.msg._id
    /*              更新记录到article                  */
    tmpResult=await e_dbModel.article.update({_id:articleId},{$push:{[fieldToBeChanged]:fileId}})
    return Promise.resolve({rc:0})
}









module.exports={
    article_dispatcher_async,
    comment_dispatcher_async,
    articleUploadFile_dispatch_async,
    
    
    // uploadArticleImage_async,
    // uploadArticleFile_async,

    controllerError
}