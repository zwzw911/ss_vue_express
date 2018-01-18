/**
 * Created by ada on 2017/9/1.
 */
'use strict'
const ap=require(`awesomeprint`)

/*                      controller setting                */
const controller_setting=require('../impeach_setting/impeach_setting').setting
const controllerError=require('../impeach_setting/impeach_controllerError').controllerError

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
const e_impeachState=mongoEnum.ImpeachState.DB

const e_storePathUsage=mongoEnum.StorePathUsage.DB
const e_resourceType=mongoEnum.ResourceType.DB
const e_allUserType=mongoEnum.AllUserType.DB
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

async function uploadImpeachCommentFile_async({req}){
    // console.log(`uploadImpeachCommentFile_async in`)
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
    let recordId=req.body.values[e_part.RECORD_ID]  //impeach的id
    // console.log(`docValue============>${JSON.stringify(docValue)}`)
    // console.log(`recordId============>${JSON.stringify(recordId)}`)
    /*******************************************************************************************/
    /*                                     用户类型和权限检测                                  */
    /*******************************************************************************************/
    await controllerChecker.ifExpectedUserType_async({req:req,arr_expectedUserType:[e_allUserType.USER_NORMAL]})
    /*******************************************************************************************/
    /*                                     参数过滤                                           */
    /*******************************************************************************************/
    // dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])
    // console.log(`docValue after constructUpdateCriteria============>${JSON.stringify(docValue)}`)
    /*******************************************************************************************/
    /*                                       authorization check                               */
    /*******************************************************************************************/
    //当前要上传图片/附件的文档是否为作者本人
    tmpResult=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({dbModel:e_dbModel[collName],recordId:recordId,ownerFieldName:e_field.IMPEACH.CREATOR_ID,ownerFieldValue:userId,additionalCondition:undefined})
    if(false===tmpResult){
        return Promise.reject(controllerError.notImpeachCreatorCantUploadFile)
    }
    let originalDoc=misc.objectDeepCopy(tmpResult)

    /*******************************************************************************************/
    /*                                       upload  authorization check                       */
    /*******************************************************************************************/
    //impeach的CURRENT_STATE必须为NEW（而不是其他）。和impeach的检查点不同
    let impeach=common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.impeach,id:recordId})
    if(null!==impeach){
        if(impeach[e_field.IMPEACH_COMMENT.CURRENT_STATE]!==e_impeachState.NEW){
            return Promise.reject(controllerError.cantUploadImageForNonNewImpeach)
        }
    }
    /*let condition={}
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
   /* if(e_uploadFileType.IMAGE===type){
        maxFileSize=uploadFileDefine.article_image.maxSizeInByte
    }
    if(e_uploadFileType.ATTACHMENT===type){
        maxFileSize=uploadFileDefine.article_attachment.maxSizeInByte
    }*/
    maxFileSize=uploadFileDefine.impeach.image[e_uploadFileDefinitionFieldName.MAX_SIZE_IN_BYTE]
    let uploadResult=await controllerHelper.uploadFileToTmpDir_async({req:req, uploadTmpDir:e_iniSettingObject.store_path.UPLOAD_TMP.upload_tmp_dir.path, maxFileSize:maxFileSize,fileSizeUnit:e_fileSizeUnit.MB})
    let {originalFilename,path,size}=uploadResult

    //判断图片格式是否允许
    let suffix
    let gmInst=gmImage.initImage({originalFilename})
    suffix=await gmImage.getImageProperty_async(gmInst,e_gmGetter.FORMAT)
    if(-1===uploadFileDefine.common.imageType.indexOf(suffix)){
        fs.unlink(path)
        return Promise.reject(controllerError.imageFormatNotSupport)
    }

    //判断图片的长，宽，是否符合
    let wh=await gmImage.getImageProperty_async(gmInst,e_gmGetter.SIZE)
    if(wh.width > uploadFileDefine[e_coll.impeach_comment][e_uploadFileType.IMAGE][e_uploadFileDefinitionFieldName.MAX_WIDTH]
    || wh.height > uploadFileDefine[e_coll.impeach_comment][e_uploadFileType.IMAGE][e_uploadFileDefinitionFieldName.MAX_HEIGHT]
    ){
        return Promise.reject(controllerError.imageResolutionNotSupport)
    }
    // console.log(`get upload fild info  =====>${JSON.stringify(uploadResult)}`)
    /*******************************************************************************************/
    /*                               resource check （impeachComment）                         */
    /*******************************************************************************************/
    /*              获得通用资源配置，并检查当前占用的资源（磁盘空间）+文件的资源（sizeInMB）后，还小于==>所有<==的资源配置（）                         */
    let resourceProfileRangeToBeCheck=[e_resourceProfileRange.IMAGE_PER_IMPEACH_OR_COMMENT,e_resourceProfileRange.IMAGE_PER_PERSON_FOR_WHOLE_IMPEACH]
    //查找对应的resource profile
    let resourceResult=await controllerHelper.findResourceProfileRecords_async({arr_resourceProfileRange:resourceProfileRangeToBeCheck})

    //此处recordId指的是impeachComment
    let calcResult
    for(let singleResourceProfileRecord of resourceResult){
        switch (singleResourceProfileRecord[e_field.RESOURCE_PROFILE.RANGE]){
            case e_resourceProfileRange.IMAGE_PER_IMPEACH_OR_COMMENT:
                calcResult=await controllerHelper.calcExistResource_async({resourceProfileRange:e_resourceProfileRange.IMAGE_PER_IMPEACH_OR_COMMENT,impeach_comment_id:recordId})
                if(singleResourceProfileRecord[e_resourceFieldName.MAX_FILE_NUM]<calcResult[e_resourceFieldName.MAX_FILE_NUM]+1)
                {
                    fs.unlink(path)
                    return Promise.reject(controllerError.impeachCommentImageNumExceed)
                }
                if(singleResourceProfileRecord[e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]<calcResult[e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB])
                {
                    fs.unlink(path)
                    return Promise.reject(controllerError.impeachCommentImageSizeExceed)
                }
                break;
            case e_resourceProfileRange.IMAGE_PER_PERSON_FOR_WHOLE_IMPEACH:
                //根据impeachId在impeach_comment查找所有对应的comment
                tmpResult=common_operation_model.find_returnRecords_async({dbModel:e_dbModel.impeach_comment,condition:{[e_field.IMPEACH_COMMENT.IMPEACH_ID]:recordId}})
                //impeachId+commentId作为match条件传给calcExistResource_async
                let arr_impeach_and_comment_id=[]
                arr_impeach_and_comment_id.push(recordId)
                if(tmpResult.length>0){
                    for(let singleEle of tmpResult){
                        arr_impeach_and_comment_id.push(singleEle[e_field.IMPEACH_COMMENT.ID])
                    }
                }
                //计算impeach和comment的image
                calcResult=await controllerHelper.calcExistResource_async({resourceProfileRange:e_resourceProfileRange.IMAGE_PER_PERSON_FOR_WHOLE_IMPEACH,userId:userId,arr_impeach_and_comment_id:arr_impeach_and_comment_id})
                if(singleResourceProfileRecord[e_resourceFieldName.MAX_FILE_NUM]<calcResult[e_resourceFieldName.MAX_FILE_NUM])
                {
                    fs.unlink(path)
                    return Promise.reject(controllerError.wholeImpeachImageNumExceed)
                }
                if(singleResourceProfileRecord[e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]<calcResult[e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB])
                {
                    fs.unlink(path)
                    return Promise.reject(controllerError.wholeImpeachImageSizeExceed)
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
    tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.IMPEACH_IMAGE})
        //tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.ARTICLE_INNER_IMAGE,e_field:e_field})

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
        internalValue[e_field.IMPEACH_IMAGE.NAME]=originalFilename
        internalValue[e_field.IMPEACH_IMAGE.HASH_NAME]=finalFileName
        internalValue[e_field.IMPEACH_IMAGE.PATH_ID]=pathId
        internalValue[e_field.IMPEACH_IMAGE.SIZE_IN_MB]=size
        internalValue[e_field.IMPEACH_IMAGE.AUTHOR_ID]=userId
        internalValue[e_field.IMPEACH_IMAGE.REFERENCE_ID]=recordId
        internalValue[e_field.IMPEACH_IMAGE.REFERENCE_COLL]=e_coll.IMPEACH

        fileCollName=e_coll.IMPEACH_IMAGE
        fieldToBeChanged=e_field.IMPEACH.IMPEACH_IMAGES_ID
    // }
    /*if(e_uploadFileType.ATTACHMENT===type){
        internalValue[e_field.ARTICLE_ATTACHMENT.NAME]=originalFilename
        internalValue[e_field.ARTICLE_ATTACHMENT.HASH_NAME]=finalFileName
        internalValue[e_field.ARTICLE_ATTACHMENT.PATH_ID]=pathId
        internalValue[e_field.ARTICLE_ATTACHMENT.SIZE_IN_MB]=size
        internalValue[e_field.ARTICLE_ATTACHMENT.AUTHOR_ID]=userId
        internalValue[e_field.ARTICLE_ATTACHMENT.ARTICLE_ID]=recordId
        fileCollName=e_coll.ARTICLE_ATTACHMENT
        fieldToBeChanged=e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID
    }*/
    if(e_env.DEV===currentEnv){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[fileCollName],collInternalRule:internalInputRule[fileCollName],method:req.body.values[e_part.METHOD]})
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
    /*              更新记录到IMPEACH_COMMENT                  */
    tmpResult=await e_dbModel.article.update({_id:recordId},{$push:{[fieldToBeChanged]:fileId}})
    /*              更新user_resource_static          */
    tmpResult=await e_dbModel.user_resource_static.update({
        [e_field.USER_RESOURCE_STATIC.USER_ID]:userId,
        [e_field.USER_RESOURCE_STATIC.RESOURCE_TYPE]:e_resourceType.IMPEACH_COMMENT_IMAGE
    },{
        $inc:{
            [e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_NUM]:1,
            [e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_SIZE_IN_MB]:size,
        }
    })

    return Promise.resolve(tmpResult)

}

module.exports={
    uploadImpeachCommentFile_async,
}