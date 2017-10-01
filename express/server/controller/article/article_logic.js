/**
 * Created by Ada on 2017/7/9.
 * url：
 *  1. /user，根据method的不同，调用不同的函数进行对应的处理
 *  2. /user/unique: 用户注册的时候，对应用户名/账号进行唯一性检查
 */
'use strict'

const fs=require('fs')

const server_common_file_require=require('../../../server_common_file_require')
const maxSearchKeyNum=server_common_file_require.globalConfiguration.searchSetting.maxKeyNum
const maxSearchPageNum=server_common_file_require.globalConfiguration.searchMaxPage.readName

const e_userState=server_common_file_require.nodeEnum.UserState
const e_part=server_common_file_require.nodeEnum.ValidatePart
const e_method=server_common_file_require.nodeEnum.Method
const e_randomStringType=server_common_file_require.nodeEnum.RandomStringType
const e_uploadFileType=server_common_file_require.nodeEnum.UploadFileType
// const e_method=server_common_file_require.nodeEnum.Method

const e_hashType=server_common_file_require.nodeRuntimeEnum.HashType

const e_env=server_common_file_require.nodeEnum.Env
const e_docStatus=server_common_file_require.mongoEnum.DocStatus.DB
const e_penalizeType=server_common_file_require.mongoEnum.PenalizeType.DB
const e_penalizeSubType=server_common_file_require.mongoEnum.PenalizeSubType.DB
const e_iniSettingObject=require('../../constant/genEnum/initSettingObject').iniSettingObject
const e_articleStatus=server_common_file_require.mongoEnum.ArticleStatus.DB
const e_resourceProfileRange=server_common_file_require.mongoEnum.ResourceProfileRange.DB
const e_resourceProfileType=server_common_file_require.mongoEnum.ResourceProfileType.DB
const e_storePathUsage=server_common_file_require.mongoEnum.StorePathUsage.DB

const e_fileSizeUnit=server_common_file_require.nodeRuntimeEnum.FileSizeUnit

const dataConvert=server_common_file_require.dataConvert
const gmImage=server_common_file_require.gmImage//require('../../function/assist/gmImage')

const currentEnv=server_common_file_require.appSetting.currentEnv
// const uploadFileDefine=require('../../constant/config/globalConfiguration').uploadFileDefine


const fkConfig=server_common_file_require.fkConfig.fkConfig

const e_dbModel=require('../../constant/genEnum/dbModel')
const e_coll=require('../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../constant/genEnum/DB_field').Field
const e_internal_field=require('../../constant/genEnum/DB_internal_field').Field
const e_uniqueField=require('../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../constant/genEnum/inputRule_field_chineseName').ChineseName
// const e_inputFieldCheckType=server_common_file_require.nodeEnum.InputFieldCheckType

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


// const validateCreateRecorderValue=require('../../function/validateInput/validateValue').validateCreateRecorderValue
// const validateUpdateRecorderValue=require('../../function/validateInput/validateValue').validateUpdateRecorderValue
// const validateCURecordInfoFormat=require('../../function/validateInput/validateFormat').validateCURecordInfoFormat
// const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule
const internalInputRule=require('../../constant/inputRule/internalInputRule').internalInputRule
const inputRule=require('../../constant/inputRule/inputRule').inputRule
const e_fieldChineseName=require('../../constant/genEnum/inputRule_field_chineseName').ChineseName


/*const mongoError=server_common_file_require.mongoError//require('../../constant/error/mongo/mongoError').error

const regex=server_common_file_require.regex*/

/*const maxNumber=require('../../constant/config/globalConfiguration').maxNumber
const miscConfiguration=require('../../constant/config/globalConfiguration').miscConfiguration

const mailAccount=require('../../constant/config/globalConfiguration').mailAccount*/

/*          create article              */
// const checkUserState=require('../')
/*         upload user photo         */

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
            /*          新建文档无需任何输入参数，需要内部自动产生            */

            tmpResult=await controllerHelper.preCheck_async({req:req,collName,method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,}) //e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum

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
            tmpResult=await controllerHelper.preCheck_async({req:req,collName,method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})
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




/*              新article无任何输入，所有的值都是内部产生                */
async  function createArticle_async(req){
    let tmpResult,docValue
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let userId=userInfo.userId
// console.log(`userId ====>${userId}`)

    docValue={}
    docValue[e_field.ARTICLE.NAME]="新建文档"

    docValue[e_field.ARTICLE.STATUS]=e_articleStatus.EDITING
    tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.folder,condition:{authorId:userId,name:'我的文档'}})
    if(tmpResult.length===0){
        return Promise.reject(controllerError.userNoDefaultFolder)
    }
    docValue[e_field.ARTICLE.FOLDER_ID]=tmpResult[0]['id']
    docValue[e_field.ARTICLE.CATEGORY_ID]=e_iniSettingObject.category.other
    docValue[e_field.ARTICLE.HTML_CONTENT]=`\br`


    // console.log(`after attachment check=========>${JSON.stringify(docValue)}`)
// console.log(`docValue is ====>${JSON.stringify(docValue)}`)
    /*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           */
    let internalValue={}
    internalValue[e_field.ARTICLE.AUTHOR_ID]=userId
    if(e_env.DEV===currentEnv && Object.keys(internalValue).length>0){
        // console.log(`before newDocValue====>${JSON.stringify(internalValue)}`)
        // let newDocValue=dataConvert.addSubFieldKeyValue(internalValue)
        // console.log(`newDocValue====>${JSON.stringify(newDocValue)}`)
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[e_coll.ARTICLE],collInternalRule:internalInputRule[e_coll.ARTICLE]})
// console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    Object.assign(docValue,internalValue)

    //new article插入db
    tmpResult= await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.article,value:docValue})
    console.log(`create result is ====>${JSON.stringify(tmpResult)}`)

    return Promise.resolve({rc:0,msg:tmpResult})
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

    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let userId=userInfo.userId

    let articleId=req.body.values[e_part.RECORD_ID]
    let originalArticle
    let collName=e_coll.ARTICLE

    /*              查找id为文档，且作者为userid的记录，找不到说明不是作者，无权修改            */
    let condition={}
    condition['_id']=articleId
    condition[e_field.ARTICLE.AUTHOR_ID]=userId
    tmpResult=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel[collName],condition:condition})
    if(tmpResult.length!==1){
        return Promise.reject(controllerError.notAuthorized)
    }
    originalArticle=misc.objectDeepCopy({},tmpResult[0])

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
    // console.log(`before fk exist check`)
    // console.log(`docValue=${JSON.stringify(docValue)}`)
    // console.log(`collFkConfig=${JSON.stringify(fkConfig[collName])}`)
    // console.log(`collFieldChineseName=${JSON.stringify(e_fieldChineseName[collName])}`)
    // docValue,collFkConfig,collFieldChineseName
    await controllerChecker.ifFkValueExist_async({docValue:docValue,collFkConfig:fkConfig[collName],collFieldChineseName:e_fieldChineseName[collName]})
    // console.log(`after fk exist check`)
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

// console.log(`afet xss ==============>`)
        //检测content中的image的信息
        let collConfig={
            collName:e_coll.ARTICLE,  //存储内容（包含图片DOM）的coll名字
            fkFieldName:e_field.ARTICLE.ARTICLE_IMAGES_ID,//coll中，存储图片objectId的字段名
            contentFieldName:e_field.ARTICLE.HTML_CONTENT, //coll中，存储内容的字段名
            ownerFieldName:e_field.ARTICLE.AUTHOR_ID,// coll中，作者的字段名
        }
        let collImageConfig={
            collName:e_coll.ARTICLE_IMAGE,//实际存储图片的coll名
            fkFieldName:e_field.ARTICLE_IMAGE.ARTICLE_ID, //字段名，记录图片存储在那个coll中
            imageHashFieldName:e_field.ARTICLE_IMAGE.HASH_NAME //记录图片hash名字的字段名
        }
        docValue[e_field.ARTICLE.HTML_CONTENT]=await controllerHelper.contentDbDeleteNotExistImage_async({
            content:docValue[e_field.ARTICLE.HTML_CONTENT],
            recordId:articleId,
            collConfig:collConfig,
            collImageConfig:collImageConfig,
        })
// console.log(`afet image check ==============>${JSON.stringify(docValue[e_field.ARTICLE.HTML_CONTENT])}`)
    }
    // console.log(`image check done====>`)
    //2. 如果有tag，对其中的每个tag，在对应的coll（tag）中，执行“如果不存在，就插入”的操作。coll（tag）的功能是为搜索提供AutoComplete的功能
    if(undefined!==docValue[e_field.ARTICLE.TAGS]){
        for(let singleTag of docValue[e_field.ARTICLE.TAGS]){
            await common_operation_model.findOneAndUpdate_returnRecord_async({
                dbModel:e_dbModel[e_coll.TAG],
                condition:{[e_field.TAG.NAME]:singleTag},
                updateFieldsValue:{[e_field.TAG.NAME]:singleTag},//采用和condition一致的数据，防止存在的字段被改变
                updateOption:{upsert:true},//实现如果没有查找到doc，则新加入一个doc
            })
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
        tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.folder,condition:condition})
        // console.log(`folder check result=========>${JSON.stringify(tmpResult)}`)
        if(tmpResult.length!==1){
            return Promise.reject(controllerError.notAuthorizedFolder)
        }
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

// console.log(`to be update =============>`)
    /*              如果有unique字段，需要预先检查unique(express级别，而不是mongoose级别)            */
    if(undefined!==e_uniqueField[collName] && e_uniqueField[collName].length>0) {
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue})
    }

    /*              更新数据            */
    await common_operation_model.update_returnRecord_async({dbModel:e_dbModel[collName],id:articleId,values:docValue})
    return Promise.resolve({rc:0})

}



module.exports={
    article_dispatcher_async,
    controllerError,
}