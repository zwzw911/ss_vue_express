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
const e_resourceType=mongoEnum.ResourceType.DB

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

async function uploadArticleAttachment_async({req}){
    // console.log(`uploadArticleAttachment_async in`)
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
    tmpResult=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({dbModel:e_dbModel.article,recordId:recordId,ownerFieldName:e_field.ARTICLE.AUTHOR_ID,ownerFieldValue:userId,additionalCondition:undefined})
    if(false===tmpResult){
        return Promise.reject(controllerError.notArticleAuthorCantUploadAttachment)
    }
    let originalDoc=misc.objectDeepCopy(tmpResult)
/*    let condition={}
    condition['_id']=recordId
    condition[e_field.ARTICLE.AUTHOR_ID]=userId
// console.log(`condition to check user =====>${JSON.stringify(condition)}`)
    tmpResult=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel[collName],condition:condition})
    // console.log(`tmpResult =====>${JSON.stringify(tmpResult)}`)
    if(tmpResult.length!==1){
        return Promise.reject(controllerError.notArticleAuthorCantInsertFile)
    }*/
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
    // if(e_uploadFileType.IMAGE===type){
        maxFileSize=uploadFileDefine[e_coll.ARTICLE_ATTACHMENT][e_uploadFileDefinitionFieldName.MAX_SIZE_IN_BYTE]
    // }
    let uploadResult=await controllerHelper.uploadFileToTmpDir_async({req:req, uploadTmpDir:e_iniSettingObject.store_path.UPLOAD_TMP.upload_tmp_dir.path, maxFileSize:maxFileSize,fileSizeUnit:e_fileSizeUnit.MB})
    let {originalFilename,path,size}=uploadResult


    //判断图片格式是否允许
    let suffix=await controllerHelper.ifFileSuffixMatchContentType_returnSuffixOrFalse_async({uploadResult})
    if(false===suffix){
        return Promise.reject(controllerError.attachmentFormatIncorrect)
    }

    if(-1===uploadFileDefine.common.attachmentType.indexOf(suffix)){
        fs.unlink(path)
        return Promise.reject(controllerError.attachmentFormatNotSupport)
    }

/*    //判断图片的长，宽，是否符合
    let wh=await gmImage.getImageProperty_async(gmInst,e_gmGetter.SIZE)
    if(wh.width > uploadFileDefine[e_coll.article_image][e_uploadFileDefinitionFieldName.MAX_WIDTH]
        || wh.height > uploadFileDefine[e_coll.article_image][e_uploadFileDefinitionFieldName.MAX_HEIGHT]
    ){
        return Promise.reject(controllerError.imageResolutionNotSupport)
    }*/

    // console.log(`get upload fild info  =====>${JSON.stringify(uploadResult)}`)
    /*******************************************************************************************/
    /*                                       resource check                                    */
    /*******************************************************************************************/
    /*              获得用户当前的所有资源配置，并检查当前占用的资源（磁盘空间）+文件的资源（sizeInMB）后，还小于==>所有<==的资源配置（）                         */
    let resourceProfileRangeToBeCheck=[e_resourceProfileRange.ATTACHMENT_PER_ARTICLE,e_resourceProfileRange.WHOLE_RESOURCE_PER_PERSON_FOR_ALL_ARTICLE]
    let resourceResult=await controllerHelper.findResourceProfileRecords_async({arr_resourceProfileRange:resourceProfileRangeToBeCheck})

    let calcResult
    //recordId是articleId
    for(let singleResourceProfileRecord of resourceResult){
        switch (singleResourceProfileRecord[e_field.RESOURCE_PROFILE.RANGE]){
            case e_resourceProfileRange.ATTACHMENT_PER_ARTICLE:
                calcResult=await controllerHelper.calcExistResource_async({resourceProfileRange:e_resourceProfileRange.ATTACHMENT_PER_ARTICLE,articleId:recordId})
                if(singleResourceProfileRecord[e_resourceFieldName.MAX_FILE_NUM]<calcResult[e_resourceFieldName.MAX_FILE_NUM]+1)
                {
                    fs.unlink(path)
                    return Promise.reject(controllerError.articleAttachmentNumExceed)
                }
                if(singleResourceProfileRecord[e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]<calcResult[e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB])
                {
                    fs.unlink(path)
                    return Promise.reject(controllerError.articleAttachmentSizeExceed)
                }
                break;
            case e_resourceProfileRange.WHOLE_RESOURCE_PER_PERSON_FOR_ALL_ARTICLE:
                //从user_resource_static中group查询得到 总资源值
                calcResult=await controllerHelper.calcExistResource_async({resourceProfileRange:e_resourceProfileRange.WHOLE_RESOURCE_PER_PERSON_FOR_ALL_ARTICLE,userId:userId})
                if(singleResourceProfileRecord[e_resourceFieldName.MAX_FILE_NUM]<calcResult[e_resourceFieldName.MAX_FILE_NUM])
                {
                    fs.unlink(path)
                    return Promise.reject(controllerError.personalFileNumExceed)
                }
                if(singleResourceProfileRecord[e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]<calcResult[e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB])
                {
                    fs.unlink(path)
                    return Promise.reject(controllerError.personalSizeExceed)
                }
                break;
            default:
                return Promise.reject(controllerError.resourceRangeNotExpected)
        }
    }
// console.log(`rexource check done ======================`)
    /*              文件move到永久存储目录                           */
    let finalFileName
    //对原始文件名进行md5化，然后加上suffix
    let md5NameWithoutSuffix=hash(`${originalFilename}${Date.now()}`,e_hashType.MD5)
    finalFileName=`${md5NameWithoutSuffix.msg}.${suffix.toLowerCase()}`
    //获得合适的存储路径，并move文件
    // if(e_uploadFileType.IMAGE===type){
    tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.ARTICLE_INNER_ATTACHMENT})
        //tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.ARTICLE_INNER_IMAGE,e_field:e_field})
    // }
   /* if(e_uploadFileType.ATTACHMENT===type){
        tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.ARTICLE_INNER_ATTACHMENT})
        //tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.ARTICLE_INNER_ATTACHMENT,e_field:e_field})
    }*/
    let finalPath=tmpResult.path+finalFileName
    let pathId=tmpResult._id
    fs.renameSync(path,finalPath)

    // console.log(`save fild done ======================`)
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
    // if(e_uploadFileType.IMAGE===type){
    //     internalValue[e_field.ARTICLE_IMAGE.NAME]=originalFilename
    //     internalValue[e_field.ARTICLE_IMAGE.HASH_NAME]=finalFileName
    //     internalValue[e_field.ARTICLE_IMAGE.PATH_ID]=pathId
    //     internalValue[e_field.ARTICLE_IMAGE.SIZE_IN_MB]=size
    //     internalValue[e_field.ARTICLE_IMAGE.AUTHOR_ID]=userId
    //     internalValue[e_field.ARTICLE_IMAGE.ARTICLE_ID]=recordId
    //     fileCollName=e_coll.ARTICLE_IMAGE
    //     fieldToBeChanged=e_field.ARTICLE.ARTICLE_IMAGES_ID
    // }
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

    //更新e_coll.ARTICLE_ATTACHMENT
    tmpResult=await common_operation_model.create_returnRecord_async({dbModel:e_dbModel[fileCollName],value:internalValue})
    let fileId=tmpResult._id
    /*              更新记录到article                  */
    tmpResult=await e_dbModel.article.update({_id:recordId},{$push:{[fieldToBeChanged]:fileId}})
    /*              更新user_resource_static          */
    tmpResult=await e_dbModel.user_resource_static.update({
        [e_field.USER_RESOURCE_STATIC.USER_ID]:userId,
        [e_field.USER_RESOURCE_STATIC.RESOURCE_TYPE]:e_resourceType.ARTICLE_ATTACHMENT
    },{
        $inc:{
            [e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_NUM]:1,
            [e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_SIZE_IN_MB]:size,
        }
    })



    return Promise.resolve(tmpResult)

}

module.exports={
    uploadArticleAttachment_async,
}