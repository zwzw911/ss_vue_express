/**
 * Created by Ada on 2017/7/9.
 * url：
 *  1. /user，根据method的不同，调用不同的函数进行对应的处理
 *  2. /user/unique: 用户注册的时候，对应用户名/账号进行唯一性检查
 */
'use strict'

const fs=require('fs')

const server_common_file_require=require('../../../server_common_file_require')

const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

// const e_userState=require('../../constant/enum/node').UserState
const e_part=nodeEnum.ValidatePart//require('../../constant/enum/node').ValidatePart
const e_method=nodeEnum.Method//require('../../constant/enum/node').Method


const e_env=nodeEnum.Env//require('../../constant/enum/node').Env
// const e_docStatus=require('../../constant/enum/mongo').DocStatus.DB
const e_penalizeType=server_common_file_require.mongoEnum.PenalizeType.DB
const e_penalizeSubType=server_common_file_require.mongoEnum.PenalizeSubType.DB
const e_uploadFileType=nodeEnum.UploadFileType

const currentEnv=server_common_file_require.appSetting.currentEnv
// const uploadFileDefine=require('../../constant/config/globalConfiguration').uploadFileDefine

const e_dbModel=require('../../constant/genEnum/dbModel')
const fkConfig=server_common_file_require.fkConfig.fkConfig//require('../../model/mongo/fkConfig').fkConfig

const e_coll=require('../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../constant/genEnum/DB_field').Field
// const e_internal_field=require('../../constant/genEnum/DB_internal_field').Field
// const e_uniqueField=require('../../constant/enum/DB_uniqueField').UniqueField
// const e_inputFieldCheckType=require('../../constant/enum/node').InputFieldCheckType

const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model




const controllerError=require('./not_used_article_upload_file_setting/article_upload_file_controllerError').controllerError
// const create_async=require('./likeDisLike_logic/create_likeDisLike').createLikeDisLike_async
const update_uploadArticleImage_async=require('./article_upload_file_logic/upload_article_image').uploadArticleImage_async
const update_uploadArticleAttachment_async=require('./article_upload_file_logic/upload_article_attachment').uploadArticleAttachment_async
// const delete_async=require('./impeach_logic/delete_impeach').deleteImpeach_async
const controllerSetting=require('./not_used_article_upload_file_setting/article_upload_file_setting').setting







//对article image的不同method（其实只有create），进行预检，然后调用逻辑
async function articleUploadFile_dispatch_async({req,type}){
    let collName=controllerSetting.MAIN_HANDLED_COLL_NAME,tmpResult
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
            break;
        case e_method.SEARCH:// search
            break;
        case e_method.UPDATE: //update
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
            // console.log(`dispatch preCheck doen`)
            if(type===e_uploadFileType.IMAGE){
                tmpResult=await update_uploadArticleImage_async({req:req})
            }
            if(type===e_uploadFileType.ATTACHMENT){
                tmpResult=await update_uploadArticleAttachment_async({req:req})
            }
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
/*async function uploadArticleFile_async({req,type}){
    let tmpResult

    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let userId=userInfo.userId
	
    let articleId=req.body.values[e_part.RECORD_ID]
    // let originalArticle
    let collName=e_coll.ARTICLE
    let fileCollName

    /!*              查找id为文档，且作者为userid的记录，找不到说明不是作者，无权修改            *!/
    let condition={}
    condition['_id']=articleId
    condition[e_field.ARTICLE.AUTHOR_ID]=userId
// console.log(`condition to check user =====>${JSON.stringify(condition)}`)
    tmpResult=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel[collName],condition:condition})
    if(tmpResult.length!==1){
        return Promise.reject(controllerError.notAuthorized)
    }
    // originalArticle=misc.objectDeepCopy({},tmpResult.msg[0])

    /!*              上传文件存储到临时目录                         *!/
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
    /!*              获得用户当前的所有资源配置，并检查当前占用的资源（磁盘空间）+文件的资源（sizeInMB）后，还小于==>所有<==的资源配置（）                         *!/
    let resourceProfileRangeToBeCheck=[e_resourceRange.PER_PERSON,e_resourceRange.PER_ARTICLE]
    //首先检查个人的（范围最大），然后检查article（范围小点的）
    for(let singleResourceProfileRange of resourceProfileRangeToBeCheck){
	tmpResult=await controllerHelper.chooseLastValidResourceProfile_async({resourceProfileRange:singleResourceProfileRange,userId:userId})
        //tmpResult=await controllerHelper.chooseLastValidResourceProfile_async({resourceProfileRange:singleResourceProfileRange,userId:userId,e_field:e_field})
//console.log(`chosed profile========>${JSON.stringify(tmpResult)}`)
        //只有一条记录，要么是default，要么是VIP
        let currentResourceProfile=misc.objectDeepCopy(tmpResult.msg)
        /!*              计算当前（每个）资源配置是否还够用               *!/
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


    /!*              文件move到永久存储目录                           *!/
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

    /!*              内部field value检测                            *!/
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
    /!*              插入记录到article_image            *!/
    tmpResult=await common_operation_model.create_returnRecord_async({dbModel:e_dbModel[fileCollName],value:internalValue})
    let fileId=tmpResult._id
    /!*              更新记录到article                  *!/
    tmpResult=await e_dbModel.article.update({_id:articleId},{$push:{[fieldToBeChanged]:fileId}})
    return Promise.resolve({rc:0})
}*/









module.exports={
    // article_dispatcher_async,
    // comment_dispatcher_async,
    articleUploadFile_dispatch_async,
    
    
    // uploadArticleImage_async,
    // uploadArticleFile_async,

    // controllerError
}