/**
 * Created by Ada on 2017/7/9.
 * url：
 *  1. /user，根据method的不同，调用不同的函数进行对应的处理
 *  2. /user/unique: 用户注册的时候，对应用户名/账号进行唯一性检查
 */
'use strict'

const fs=require('fs')

const server_common_file_include=require('../../../server_common_file_require')

const nodeEnum=server_common_file_include.nodeEnum
const nodeRuntimeEnum=server_common_file_include.nodeRuntimeEnum
const mongoEnum=server_common_file_include.mongoEnum

const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_uploadFileType=nodeEnum.UploadFileType
// const e_method=require('../../constant/enum/node').Method

const e_hashType=nodeRuntimeEnum.HashType

const e_env=nodeEnum.Env

const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB
const e_iniSettingObject=require('../../constant/genEnum/initSettingObject').iniSettingObject
const e_resourceProfileRange=mongoEnum.ResourceProfileRange.DB
const e_storePathUsage=mongoEnum.StorePathUsage.DB

const e_fileSizeUnit=nodeRuntimeEnum.FileSizeUnit

const currentEnv=server_common_file_include.appSetting.currentEnv
const uploadFileDefine=server_common_file_include.globalConfiguration.uploadFileDefine

const e_dbModel=require('../../constant/genEnum/dbModel')
// const fkConfig=server_common_file_include.fkConfig

const e_coll=require('../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../constant/genEnum/DB_field').Field

// const e_inputFieldCheckType=require('../../constant/enum/node').InputFieldCheckType

const controllerHelper=server_common_file_include.controllerHelper
const common_operation_model=server_common_file_include.common_operation_model
const hash=server_common_file_include.crypt.hash//require('../../function/assist/crypt').hash

const misc=server_common_file_include.misc//require('../../function/assist/misc')
// const checkRobot_async=require('../../function/assist/checkRobot').checkRobot_async


// const sanityHtml=server_common_file_include.sanityHtml//require('../../function/assist/sanityHtml').sanityHtml
/*const generateRandomString=require('../../function/assist/misc').generateRandomString
const sendVerificationCodeByEmail_async=require('../../function/assist/misc').sendVerificationCodeByEmail_async
const ifUserLogin=require('../../function/assist/misc').ifUserLogin*/

const dataConvert=server_common_file_include.dataConvert
// const validateCreateRecorderValue=require('../../function/validateInput/validateValue').validateCreateRecorderValue
// const validateUpdateRecorderValue=require('../../function/validateInput/validateValue').validateUpdateRecorderValue
// const validateCURecordInfoFormat=require('../../function/validateInput/validateFormat').validateCURecordInfoFormat
// const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule
const internalInputRule=require('../../constant/inputRule/internalInputRule').internalInputRule
const inputRule=require('../../constant/inputRule/inputRule').inputRule
// const e_fieldChineseName=require('../../constant/enum/inputRule_field_chineseName').ChineseName


// const mongoError=server_common_file_include.mongoError//require('../../constant/error/mongo/mongoError').error

// const regex=server_common_file_include.regex//require('../../constant/regex/regex').regex

/*const maxNumber=require('../../constant/config/globalConfiguration').maxNumber
const miscConfiguration=require('../../constant/config/globalConfiguration').miscConfiguration

const mailAccount=require('../../constant/config/globalConfiguration').mailAccount*/

/*          create article              */
// const checkUserState=require('../')
/*         upload user photo         */
const gmImage=server_common_file_include.gmImage//require('../../function/assist/gmImage')
// const userPhotoConfiguration=require('../../constant/config/globalConfiguration').uploadFileDefine.user_thumb
const e_gmGetter=nodeRuntimeEnum.GmGetter
/*const e_gmCommand=nodeRuntimeEnum.GmCommand
const uploadFile=require('../../function/assist/upload')*/

/*         generate captcha         */
//const captchaIntervalConfiguration=require('../../constant/config/globalConfiguration').intervalCheckConfiguration.captcha


const controllerError={
    /*          common              */
/*    fieldAlreadyExist(chineseFieldName,fieldInputValue){
        switch (fieldName){
            case e_field.article
        }
        return {rc:50200,msg:{client:`${fieldInputValue}已经存在`, server:`字段${chineseFieldName}中，值${fieldInputValue}已经存在`}}},*/



    /*          upload article image                */
    userNotLoginCantCreateArticleImage:{rc:50400,msg:`用户尚未登录，无法插入图片`},
    undefinedRangeType:{rc:50402,msg:{client:`内部参数错误，请联系管理员`,server:`未定义的rangeType`}},
    userInPenalizeNoArticleUpdate:{rc:50403,msg:`管理员禁止更新文档`},

    //image 超出 resource_profile
    articleImageSizeExceed:{rc:50404,msg:{client:`文档图片总容量达到最大值，无法继续添加图片`,server:`文档图片容量达到最大`}},
    articleImageNumExceed:{rc:50406,msg:{client:`文档图片数量达到最大值，无法继续添加图片`,server:`文档图片数量达到最大`}},
    //attachment 超出 resource_profile
    articleAttachmentSizeExceed:{rc:50408,msg:{client:`文档附件总容量达到最大值，无法继续添加附件`,server:`文档附件容量达到最大`}},
    articleAttachmentNumExceed:{rc:50410,msg:{client:`文档附件数量达到最大值，无法继续添加附件`,server:`文档附件数量达到最大`}},
    //总量（用户为单位） 超出 resource_profile
    personalSizeExceed:{rc:50412,msg:{client:`个人空间达到最大值，无法继续添加文件`,server:`个人空间容量达到最大`}},
    personalFileNumExceed:{rc:50414,msg:{client:`个人文件数量达到最大值，无法继续添加`,server:`个人文件数量达到最大`}},

    notSupportImageFormat:{rc:50416,msg:`图片格式不支持`},
    notSupportAttachmentFormat:{rc:50418,msg:`附件格式不支持`},

}




//对article image的不同method（其实只有create），进行预检，然后调用逻辑
async function articleUploadFile_dispatch_async({req,type}){
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
                error:controllerError.userNotLoginCantCreateArticleImage
            }
            penalizeCheck={
                penalizeType:e_penalizeType.NO_ARTICLE, //用户是否可以对ARTICLE进行更新（因为插入image实际上是对article进行update操作
                penalizeSubType:e_penalizeSubType.UPDATE, //只有在update中才能插入图片，
                penalizeCheckError:controllerError.userInPenalizeNoArticleUpdate
            }
            expectedPart=[e_part.RECORD_ID]
            tmpResult=await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
            tmpResult=await uploadArticleFile_async({req:req,type:type})



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



/*
* type: image还是attachment
* */
async function uploadArticleFile_async({req,type}){
    let tmpResult

    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let userId=userInfo.userId
	
    let articleId=req.body.values[e_part.RECORD_ID]
    // let originalArticle
    let collName=e_coll.ARTICLE
    let fileCollName

    /*              查找id为文档，且作者为userid的记录，找不到说明不是作者，无权修改            */
    let condition={}
    condition['_id']=articleId
    condition[e_field.ARTICLE.AUTHOR_ID]=userId
// console.log(`condition to check user =====>${JSON.stringify(condition)}`)
    tmpResult=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel[collName],condition:condition})
    if(tmpResult.length!==1){
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
    let uploadResult=await controllerHelper.uploadFileToTmpDir_async({req:req, uploadTmpDir:e_iniSettingObject.store_path.UPLOAD_TMP.upload_tmp_dir.path, maxFileSize:maxFileSize,fileSizeUnit:e_fileSizeUnit.MB})
    let {originalFilename,path,size}=uploadResult.msg

    // console.log(`group start========>`)
    /*              获得用户当前的所有资源配置，并检查当前占用的资源（磁盘空间）+文件的资源（sizeInMB）后，还小于==>所有<==的资源配置（）                         */
    let resourceProfileRangeToBeCheck=[e_resourceProfileRange.PER_PERSON,e_resourceProfileRange.PER_ARTICLE]
    //首先检查个人的（范围最大），然后检查article（范围小点的）
    for(let singleResourceProfileRange of resourceProfileRangeToBeCheck){
	tmpResult=await controllerHelper.chooseLastValidResourceProfile_async({resourceProfileRange:singleResourceProfileRange,userId:userId})
        //tmpResult=await controllerHelper.chooseLastValidResourceProfile_async({resourceProfileRange:singleResourceProfileRange,userId:userId,e_field:e_field})
//console.log(`chosed profile========>${JSON.stringify(tmpResult)}`)
        //只有一条记录，要么是default，要么是VIP
        let currentResourceProfile=misc.objectDeepCopy(tmpResult.msg)
        /*              计算当前（每个）资源配置是否还够用               */
        let currentResourceUsage={totalFileNum:0,totalFileSizeInMb:0}
        //设置分组条件
        let match={},group={}

        switch (singleResourceProfileRange){
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
        tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.ARTICLE_INNER_IMAGE})
	//tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.ARTICLE_INNER_IMAGE,e_field:e_field})
    }
    if(e_uploadFileType.ATTACHMENT===type){
    	tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.ARTICLE_INNER_ATTACHMENT})
	//tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.ARTICLE_INNER_ATTACHMENT,e_field:e_field})
    }
    let finalPath=tmpResult.path+finalFileName
    let pathId=tmpResult._id
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
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[fileCollName],collInternalRule:internalInputRule[fileCollName]})
// console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }

    //因为都是internal field，直接插入到coll
    /*              插入记录到article_image            */
    tmpResult=await common_operation_model.create_returnRecord_async({dbModel:e_dbModel[fileCollName],value:internalValue})
    let fileId=tmpResult._id
    /*              更新记录到article                  */
    tmpResult=await e_dbModel.article.update({_id:articleId},{$push:{[fieldToBeChanged]:fileId}})
    return Promise.resolve({rc:0})
}









module.exports={
    // article_dispatcher_async,
    // comment_dispatcher_async,
    articleUploadFile_dispatch_async,
    
    
    // uploadArticleImage_async,
    // uploadArticleFile_async,

    controllerError
}