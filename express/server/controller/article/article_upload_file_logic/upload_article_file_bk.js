/**
 * Created by ada on 2017/9/1.
 */
'use strict'
/*                      controller setting                */
const controller_setting=require('../article_upload_file_setting/article_upload_file_setting').setting
const controllerError=require('../article_upload_file_setting/article_upload_file_controllerError').controllerError

/*                      specify: genEnum                */
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject
const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule
const browserInputRule=require('../../../constant/inputRule/browserInputRule').browserInputRule


/*                      server common                                           */
const server_common_file_require=require('../../../../server_common_file_require')
/*                      server common：enum                                       */
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart

//上传文件的定义
const e_resourceFieldName=nodeEnum.ResourceFieldName
const e_uploadFileType=nodeEnum.UploadFileType
const e_uploadFileDefinitionFieldName=nodeEnum.UploadFileDefinitionFieldName

// const e_resourceProfileRange=nodeEnum.Resource
const e_fileSizeUnit=nodeRuntimeEnum.FileSizeUnit

const e_resourceProfileRange=mongoEnum.ResourceProfileRange.DB
// const e_resourceRange=mongoEnum.AdminUserType.DB
const e_storePathUsage=mongoEnum.StorePathUsage.DB

/*                      server common：function                                       */
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const hash=server_common_file_require.crypt.hash

/*                      server common：other                                       */
const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig
const uploadFileDefine=server_common_file_require.globalConfiguration.uploadFileDefine

const gmImage=server_common_file_require.gmImage//require('../../function/assist/gmImage')

const e_gmGetter=nodeRuntimeEnum.GmGetter

async function uploadArticleFile_async({req,type}){
    // console.log(`uploadArticleFile_async in`)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    /*******************************************************************************************/
    /*                                          define variant                                 */
    /*******************************************************************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME

    // console.log(`req============>${JSON.stringify(req)}`)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority}=userInfo
    // console.log(`userInfo============>${JSON.stringify(userInfo)}`)
    // let docValue=req.body.values[e_part.RECORD_INFO]
    let recordId=req.body.values[e_part.RECORD_ID]
    // console.log(`docValue============>${JSON.stringify(docValue)}`)
    // console.log(`recordId============>${JSON.stringify(recordId)}`)
    /*******************************************************************************************/
    /*                                     参数过滤                                           */
    /*******************************************************************************************/
    // dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])
    // console.log(`docValue after constructUpdateCriteria============>${JSON.stringify(docValue)}`)
    /*******************************************************************************************/
    /*                                       authorization check                               */
    /*******************************************************************************************/
    //当前要上传图片/附件的文档是否为作者本人
    let condition={}
    condition['_id']=recordId
    condition[e_field.ARTICLE.AUTHOR_ID]=userId
// console.log(`condition to check user =====>${JSON.stringify(condition)}`)
    tmpResult=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel[collName],condition:condition})
    // console.log(`tmpResult =====>${JSON.stringify(tmpResult)}`)
    if(tmpResult.length!==1){
        return Promise.reject(controllerError.notArticleAuthorCantInsertFile)
    }
    // console.log(`authorization check  =====>`)
    /*******************************************************************************************/
    /*                          delete field cant be update from client                        */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                              remove not change field                                    */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                          check field number after delete                                */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                          获得上传文件的信息并判断 文件是否valid                         */
    /*******************************************************************************************/
    let maxFileSize
    if(e_uploadFileType.IMAGE===type){
        maxFileSize=uploadFileDefine[e_coll.ARTICLE_IMAGE][e_uploadFileDefinitionFieldName.MAX_SIZE_IN_BYTE]
    }
    if(e_uploadFileType.ATTACHMENT===type){
        maxFileSize=uploadFileDefine[e_coll.ARTICLE_ATTACHMENT][e_uploadFileDefinitionFieldName.MAX_SIZE_IN_BYTE]
    }
    let uploadResult=await controllerHelper.uploadFileToTmpDir_async({req:req, uploadTmpDir:e_iniSettingObject.store_path.UPLOAD_TMP.upload_tmp_dir.path, maxFileSize:maxFileSize,fileSizeUnit:e_fileSizeUnit.MB})
    let {originalFilename,path,size}=uploadResult


    //判断图片格式是否允许
    let suffix
    if(e_uploadFileType.IMAGE===type){
        let gmInst=gmImage.initImage({originalFilename})
        suffix=await gmImage.getImageProperty_async(gmInst,e_gmGetter.FORMAT)
        if(-1===uploadFileDefine.common.imageType.indexOf(suffix)){
            fs.unlink(path)
            return Promise.reject(controllerError.imageFormatNotSupport)
        }

        //判断图片的长，宽，是否符合
        let wh=await gmImage.getImageProperty_async(gmInst,e_gmGetter.SIZE)
        if(wh.width > uploadFileDefine[e_coll.article_image][e_uploadFileDefinitionFieldName.MAX_WIDTH]
            || wh.height > uploadFileDefine[e_coll.article_image][e_uploadFileDefinitionFieldName.MAX_HEIGHT]
        ){
            return Promise.reject(controllerError.imageResolutionNotSupport)
        }
    }

    //判断附件格式是否支持
    if(e_uploadFileType.ATTACHMENT===type){
        tmpResult=await controllerChecker.ifFileSuffixMatchContentType_returnSuffixOrFalse_async({uploadFileResult:uploadResult})
        if(false===tmpResult){
            return Promise.reject(controllerError.attachmentFormatIncorrect)
        }
        suffix=tmpResult
        //判断格式是否valid，否，报错=》删除=》推出
        if(-1===uploadFileDefine.common.attachmentType.indexOf(suffix)){
            fs.unlink(path)
            return Promise.reject(controllerError.notSupportAttachmentFormat)
        }
    }




    // console.log(`get upload fild info  =====>${JSON.stringify(uploadResult)}`)
    /*******************************************************************************************/
    /*                                       resource check                                    */
    /*******************************************************************************************/
    /*              获得用户当前的所有资源配置，并检查当前占用的资源（磁盘空间）+文件的资源（sizeInMB）后，还小于==>所有<==的资源配置（）                         */
    if()
    let resourceProfileRangeToBeCheck=[e_resourceProfileRange.,e_resourceProfileRange.PER_ARTICLE]
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
            case e_resourceProfileRange.PER_PERSON:
                //根据用户进行分组，获得所有image+attachment的size总和（Mb）
                match[e_field.ARTICLE_IMAGE.AUTHOR_ID]=dataConvert.convertToObjectId(userId)
                group={
                    _id:`$${[e_field.ARTICLE_IMAGE.AUTHOR_ID]}`,
                    totalFileSizeInMb:{$sum:`$${e_field.ARTICLE_IMAGE.SIZE_IN_MB}`},
                    totalFileNum:{$sum:1}
                }
                tmpResult=await common_operation_model.group_async({dbModel:e_dbModel.article_image,match:match,group:group})
                console.log(`group by person result =====>${JSON.stringify(tmpResult)}`)
                currentResourceUsage.totalFileSizeInMb+=tmpResult['totalFileSizeInMb']
                currentResourceUsage.totalFileNum+=tmpResult['totalFileNum']

                group={
                    _id:`$${[e_field.ARTICLE_ATTACHMENT.AUTHOR_ID]}`,
                    totalFileSizeInMb:{$sum:`$${e_field.ARTICLE_ATTACHMENT.SIZE_IN_MB}`},
                    totalFileNum:{$sum:1}
                }
                tmpResult=await common_operation_model.group_async({dbModel:e_dbModel.article_attachment,match:match,group:group})
                console.log(`group by person result =====>${JSON.stringify(tmpResult)}`)
                currentResourceUsage.totalFileSizeInMb+=tmpResult['totalFileSizeInMb']
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
            case e_resourceProfileRange.PER_ARTICLE:
                //根据articleId进行分组，获得当前article中image/attachment的数量，以及size总和（byte）
                //article，如果上传的是image，需要检查image是否超出
                if(e_uploadFileType.IMAGE===type){
                    match[e_field.ARTICLE_IMAGE.AUTHOR_ID]=dataConvert.convertToObjectId(userId)
                    match[e_field.ARTICLE_IMAGE.ARTICLE_ID]=dataConvert.convertToObjectId(recordId)
                    group={
                        _id:`$${[e_field.ARTICLE_IMAGE.ARTICLE_ID]}`,
                        totalFileSizeInMb:{$sum:`$${e_field.ARTICLE_IMAGE.SIZE_IN_MB}`},
                        totalNum:{$sum:1}
                    }
                    tmpResult=await common_operation_model.group_async({dbModel:e_dbModel.article_image,match:match,group:group})
                    console.log(`group by article result =====>${JSON.stringify(tmpResult)}`)
                }

                
                // currentResourceUsage.totalFileSizeInMb+=tmpResult['totalFileSizeInMb']
                // currentResourceUsage.totalFileNum+=tmpResult['totalFileNum']
                
                if(e_uploadFileType.ATTACHMENT===type){
                    group={
                        _id:`$${[e_field.ARTICLE_ATTACHMENT.ARTICLE_ID]}`,
                        totalFileSizeInMb:{$sum:`$${e_field.ARTICLE_ATTACHMENT.SIZE_IN_MB}`},
                        totalNum:{$sum:1}
                    }
                    tmpResult=await common_operation_model.group_async({dbModel:e_dbModel.article_attachment,match:match,group:group})
                    console.log(`group by article result =====>${JSON.stringify(tmpResult)}`)
                }
               
                currentResourceUsage.totalFileSizeInMb+=tmpResult['totalFileSizeInMb']
                currentResourceUsage.totalFileNum+=tmpResult['totalFileNum']


                //进行比较（如果上传的image，则比较文档的image是否超出；如果是attachment，则比较文档的attachment是否超出）
                if(size+currentResourceUsage.totalFileSizeInMb>currentResourceProfile[e_field.RESOURCE_PROFILE.TOTAL_FILE_SIZE_IN_MB]){
                    fs.unlink(path)
                    if(e_uploadFileType.IMAGE===type){
                        return Promise.reject(controllerError.articleImageSizeExceed)
                    }
                    if(e_uploadFileType.ATTACHMENT===type){
                        return Promise.reject(controllerError.articleAttachmentSizeExceed)
                    }
                }
                if(1+currentResourceUsage.totalFileNum>currentResourceProfile[e_field.RESOURCE_PROFILE.MAX_FILE_NUM]){
                    fs.unlink(path)
                    if(e_uploadFileType.IMAGE===type){
                        return Promise.reject(controllerError.articleImageNumExceed)
                    }
                    if(e_uploadFileType.ATTACHMENT===type){
                        return Promise.reject(controllerError.articleAttachmentNumExceed)
                    }

                }
                break
            default:
                return Promise.reject(controllerError.undefinedRangeType)
        }
    }
// console.log(`rexource check done ======================`)
    /*              文件move到永久存储目录                           */
    let finalFileName
    //格式检查


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

    console.log(`save fild done ======================`)
    // let tmpResult=await common_operation_model.findById({dbModel:dbModel[e_coll.USER],id:objectId})
    // let userId=tmpResult.msg[e_field.USER.]
    /*******************************************************************************************/
    /*                                     specific priority check                             */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                                    fk value是否存在                                     */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                                  enum unique check(enum in array)                       */
    /*******************************************************************************************/


    /*******************************************************************************************/
    /*                                       特定字段的处理（检查）                            */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                                  field value duplicate check                            */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                         添加internal field，然后检查                                    */
    /*******************************************************************************************/
    let internalValue={},fieldToBeChanged,fileCollName
    if(e_uploadFileType.IMAGE===type){
        internalValue[e_field.ARTICLE_IMAGE.NAME]=originalFilename
        internalValue[e_field.ARTICLE_IMAGE.HASH_NAME]=finalFileName
        internalValue[e_field.ARTICLE_IMAGE.PATH_ID]=pathId
        internalValue[e_field.ARTICLE_IMAGE.SIZE_IN_MB]=size
        internalValue[e_field.ARTICLE_IMAGE.AUTHOR_ID]=userId
        internalValue[e_field.ARTICLE_IMAGE.ARTICLE_ID]=recordId
        fileCollName=e_coll.ARTICLE_IMAGE
        fieldToBeChanged=e_field.ARTICLE.ARTICLE_IMAGES_ID
    }
    if(e_uploadFileType.ATTACHMENT===type){
        internalValue[e_field.ARTICLE_ATTACHMENT.NAME]=originalFilename
        internalValue[e_field.ARTICLE_ATTACHMENT.HASH_NAME]=finalFileName
        internalValue[e_field.ARTICLE_ATTACHMENT.PATH_ID]=pathId
        internalValue[e_field.ARTICLE_ATTACHMENT.SIZE_IN_MB]=size
        internalValue[e_field.ARTICLE_ATTACHMENT.AUTHOR_ID]=userId
        internalValue[e_field.ARTICLE_ATTACHMENT.ARTICLE_ID]=recordId
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
    /*******************************************************************************************/
    /*                                          unique check                                   */
    /*******************************************************************************************/


    /*******************************************************************************************/
    /*                                  db operation                                           */
    /*******************************************************************************************/

    tmpResult=await common_operation_model.create_returnRecord_async({dbModel:e_dbModel[fileCollName],value:internalValue})
    let fileId=tmpResult._id
    /*              更新记录到article                  */
    tmpResult=await e_dbModel.article.update({_id:recordId},{$push:{[fieldToBeChanged]:fileId}})
    return Promise.resolve(tmpResult)

}

module.exports={
    uploadArticleFile_async,
}