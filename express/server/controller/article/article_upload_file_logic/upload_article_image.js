/**
 * Created by ada on 2017/9/1.
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)

/**************  controller相关常量  ****************/
const controller_setting=require('../article_setting/article_setting').setting
const controllerError=require('../article_setting/article_controllerError').controllerError

/***************  数据库相关常量   ****************/
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject

/***************  rule   ****************/
const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule
const browserInputRule=require('../../../constant/inputRule/browserInputRule').browserInputRule



const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共常量   ******************/
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart
const e_resourceFieldName=nodeEnum.ResourceFieldName
// const e_uploadFileType=nodeEnum.UploadFileType
const e_uploadFileDefinitionFieldName=nodeEnum.UploadFileDefinitionFieldName

const e_fileSizeUnit=nodeRuntimeEnum.FileSizeUnit

const e_resourceRange=mongoEnum.ResourceRange.DB
// const e_resourceRange=mongoEnum.AdminUserType.DB
const e_storePathUsage=mongoEnum.StorePathUsage.DB
const e_resourceType=mongoEnum.ResourceType.DB

/** 需要同时更新IMAGE和ARTICLE，applyRange需要分别设置    **/
const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange
/**************  公共函数   ******************/
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const hash=server_common_file_require.crypt.hash
const resourceCheck=server_common_file_require.resourceCheck

/*************** 配置信息 *********************/
const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig
const uploadFileDefine=server_common_file_require.globalConfiguration.uploadFileDefine

const gmImage=server_common_file_require.gmImage//require('../../function/assist/gmImage')

const e_gmGetter=nodeRuntimeEnum.GmGetter

async function uploadArticleImage_async({req}){
    // console.log(`uploadArticleImage_async in`)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    /*************************************************/
    /************      define variant     ***********/
    /************************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME

    // console.log(`req============>${JSON.stringify(req)}`)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    // console.log(`userInfo============>${JSON.stringify(userInfo)}`)
    // let docValue=req.body.values[e_part.RECORD_INFO]
    let recordId=req.body.values[e_part.RECORD_ID]
    /************************************************/
    /*****************  用户类型检测     ************/
    /************************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})

    /**********************************************/
    /***********    用户权限检测    **************/
    /*********************************************/
    let originalDoc
    if(userType===e_allUserType.USER_NORMAL){
        originalDoc=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
            dbModel:e_dbModel.article,
            recordId:recordId,
            ownerFieldsName:[e_field.ARTICLE.AUTHOR_ID],
            userId:userId,
            additionalCondition:undefined,
        })
        if(false===originalDoc){
            return Promise.reject(controllerError.upload.notAuthorCantUploadImage)
        }
    }

    /***********************************************************************/
    /*************  获得上传文件的信息并判断 文件是否valid        *********/
    /***********************************************************************/
    let maxFileSize=uploadFileDefine[e_coll.ARTICLE_IMAGE][e_uploadFileDefinitionFieldName.MAX_SIZE_IN_BYTE]
    let uploadResult=await controllerHelper.uploadFileToTmpDir_async({req:req, uploadTmpDir:e_iniSettingObject.store_path.UPLOAD_TMP.upload_tmp_dir.path, maxFileSize:maxFileSize,fileSizeUnit:e_fileSizeUnit.MB})
    let {originalFilename,path,size}=uploadResult


    //判断图片格式是否允许
    let suffix
    let gmInst=gmImage.initImage({originalFilename})
    suffix=await gmImage.getImageProperty_async(gmInst,e_gmGetter.FORMAT)
    if(-1===uploadFileDefine.common.imageType.indexOf(suffix)){
        fs.unlink(path)
        return Promise.reject(controllerError.upload.imageFormatNotSupport)
    }

    //判断图片的长，宽，是否符合
    let wh=await gmImage.getImageProperty_async(gmInst,e_gmGetter.SIZE)
    if(wh.width > uploadFileDefine[e_coll.article_image][e_uploadFileDefinitionFieldName.MAX_WIDTH]
        || wh.height > uploadFileDefine[e_coll.article_image][e_uploadFileDefinitionFieldName.MAX_HEIGHT]
    ){
        return Promise.reject(controllerError.upload.imageResolutionNotSupport)
    }

    let requiredResource={
        [e_resourceFieldName.USED_NUM]:1,
        [e_resourceFieldName.DISK_USAGE_SIZE_IN_MB]:size,
        [e_resourceFieldName.FILE_ABS_PATH]:path,
    }
    /*******************************************************************************************/
    /*                                       resource check                                    */
    /*******************************************************************************************/
    let resourceProfileRangeToBeCheck=[e_resourceRange.IMAGE_PER_ARTICLE,e_resourceRange.WHOLE_RESOURCE_PER_PERSON_FOR_ALL_ARTICLE]
    await resourceCheck.ifEnoughResource_async({requiredResource:requiredResource,resourceProfileRange:resourceProfileRangeToBeCheck,userId:userId,containerId:recordId})
    /*              获得用户当前的所有资源配置，并检查当前占用的资源（磁盘空间）+文件的资源（sizeInMB）后，还小于==>所有<==的资源配置（）                         */

    /*let resourceResult=await controllerHelper.findResourceProfileRecords_async({arr_resourceProfileRange:resourceProfileRangeToBeCheck})

    let calcResult
    //recordId是articleId
    for(let singleResourceProfileRecord of resourceResult){
        switch (singleResourceProfileRecord[e_field.RESOURCE_PROFILE.RANGE]){
            case e_resourceRange.IMAGE_PER_ARTICLE:
                calcResult=await controllerHelper.calcExistResource_async({resourceProfileRange:e_resourceRange.IMAGE_PER_ARTICLE,articleId:recordId})
                if(singleResourceProfileRecord[e_resourceFieldName.MAX_FILE_NUM]<calcResult[e_resourceFieldName.MAX_FILE_NUM]+1)
                {
                    fs.unlink(path)
                    return Promise.reject(controllerError.articleImageNumExceed)
                }
                if(singleResourceProfileRecord[e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]<calcResult[e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB])
                {
                    fs.unlink(path)
                    return Promise.reject(controllerError.articleImageSizeExceed)
                }
                break;
            case e_resourceRange.WHOLE_RESOURCE_PER_PERSON_FOR_ALL_ARTICLE:
                //从user_resource_static中group查询得到 总资源值
                calcResult=await controllerHelper.calcExistResource_async({resourceProfileRange:e_resourceRange.WHOLE_RESOURCE_PER_PERSON_FOR_ALL_ARTICLE,userId:userId})
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
    }*/
// console.log(`rexource check done ======================`)
    /*              文件move到永久存储目录                           */
    let finalFileName
    //对原始文件名进行md5化，然后加上suffix
    let md5NameWithoutSuffix=hash(`${originalFilename}${Date.now()}`,e_hashType.MD5)
    finalFileName=`${md5NameWithoutSuffix.msg}.${suffix.toLowerCase()}`
    //获得合适的存储路径，并move文件
    // if(e_uploadFileType.IMAGE===type){
    tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.ARTICLE_INNER_IMAGE})
        //tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.ARTICLE_INNER_IMAGE,e_field:e_field})
    // }
   /* if(e_uploadFileType.ATTACHMENT===type){
        tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.ARTICLE_INNER_ATTACHMENT})
        //tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.ARTICLE_INNER_ATTACHMENT,e_field:e_field})
    }*/
    let finalPath=tmpResult.path+finalFileName
    let pathId=tmpResult._id
    fs.renameSync(path,finalPath)



    /*************************************************/
    /****           更新关联表（IMAGE）        ******/
    /************************************************/
    let internalValue={},fileCollName
    internalValue[e_field.ARTICLE_IMAGE.NAME]=originalFilename
    internalValue[e_field.ARTICLE_IMAGE.HASH_NAME]=finalFileName
    internalValue[e_field.ARTICLE_IMAGE.PATH_ID]=pathId
    internalValue[e_field.ARTICLE_IMAGE.SIZE_IN_MB]=size
    internalValue[e_field.ARTICLE_IMAGE.AUTHOR_ID]=userId
    internalValue[e_field.ARTICLE_IMAGE.ARTICLE_ID]=recordId
    fileCollName=e_coll.ARTICLE_IMAGE

    if(e_env.DEV===currentEnv){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[fileCollName],collInternalRule:internalInputRule[fileCollName],applyRange:e_applyRange.CREATE})
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    //更新e_coll.ARTICLE_IMAGE
    tmpResult=await common_operation_model.create_returnRecord_async({dbModel:e_dbModel[fileCollName],value:internalValue})
    let fileId=tmpResult._id



    /*              更新记录到article                  */
    let updateValues={}
    updateValues["$push"]={[e_field.ARTICLE.ARTICLE_IMAGES_ID]:fileId}
    //image/attachment移动到article本身了
    updateValues["$inc"]={
        [e_field.ARTICLE.IMAGES_NUM]:1,
        [e_field.ARTICLE.IMAGES_SIZE_IN_MB]:size,
    }

    await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.article,id:recordId,updateFieldsValue:updateValues})
/*    let fieldToBeChanged=e_field.ARTICLE.ARTICLE_IMAGES_ID
    tmpResult=await e_dbModel.article.update({_id:recordId},{$push:{[fieldToBeChanged]:fileId}})
    /!*              更新user_resource_static          *!/
    tmpResult=await e_dbModel.user_resource_static.update({
        [e_field.USER_RESOURCE_STATIC.USER_ID]:userId,
        [e_field.USER_RESOURCE_STATIC.RESOURCE_TYPE]:e_resourceType.ARTICLE_IMAGE
    },{
        $inc:{
            [e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_NUM]:1,
            [e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_SIZE_IN_MB]:size,
        }
    })*/



    return Promise.resolve({rc:0})

}

module.exports={
    uploadArticleImage_async,
}