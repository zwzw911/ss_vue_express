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


/*                      server common                                           */
const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共常量   ******************/
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart
//上传文件的定义
const e_resourceFieldName=nodeEnum.ResourceFieldName
const e_uploadFileDefinitionFieldName=nodeEnum.UploadFileDefinitionFieldName

// const e_resourceRange=nodeEnum.Resource
const e_fileSizeUnit=nodeRuntimeEnum.FileSizeUnit
const e_uploadFileRange=nodeRuntimeEnum.UploadFileRange

const e_resourceRange=mongoEnum.ResourceRange.DB
const e_storePathUsage=mongoEnum.StorePathUsage.DB
const e_resourceType=mongoEnum.ResourceType.DB
const e_allUserType=mongoEnum.AllUserType.DB


const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange


/**************  公共函数   ******************/
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const hash=server_common_file_require.crypt.hash
const resourceCheck=server_common_file_require.resourceCheck
const uploadFile=server_common_file_require.upload
const file=server_common_file_require.file
/*************** 配置信息 *********************/
const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig
const uploadFileDefine=server_common_file_require.globalConfiguration.uploadFileDefine

const gmImage=server_common_file_require.gmImage//require('../../function/assist/gmImage')

const e_gmGetter=nodeRuntimeEnum.GmGetter

async function uploadArticleAttachment_async({req}){

    // console.log(`uploadArticleAttachment_async in`)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    /*************************************************/
    /************      define variant     ***********/
    /************************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME

    // console.log(`req============>${JSON.stringify(req)}`)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    // ap.inf('userInfo',userInfo)
    // console.log(`userInfo============>${JSON.stringify(userInfo)}`)
    // let docValue=req.body.values[e_part.RECORD_INFO]
    // ap.inf('req.params',req.params)
    let recordId=req.params['articleId']
    // ap.inf('recordId',recordId)
    // console.log(`docValue============>${JSON.stringify(docValue)}`)
    // console.log(`recordId============>${JSON.stringify(recordId)}`)
    /*******************************************************************************************/
    /*                                     参数过滤                                           */
    /*******************************************************************************************/
    // dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])
    // console.log(`docValue after constructUpdateCriteria============>${JSON.stringify(docValue)}`)
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
        // ap.inf('originalDoc',originalDoc)
        if(false===originalDoc){
            return Promise.reject(controllerError.upload.notAuthorCantUploadAttachment)
        }
    }
// ap.inf('priority check done')

    /***********************************************************************/
    /*************  获得上传文件的信息并判断 文件是否valid        *********/
    /***********************************************************************/
    let tmpPath=controllerHelper.chooseTmpDir({uploadFileRange:e_uploadFileRange.ARTICLE_ATTACHMENT})
    let uploadOption={
        // maxFilesSize:2097152,
        maxFilesSize:uploadFileDefine.article.article_attachment[e_uploadFileDefinitionFieldName.MAX_SIZE_IN_BYTE],//300k   头像文件大小100k
        maxFileNumPerTrans:1,//每次只能上传一个头像文件
        // maxFields:1,
        name:'file',
        uploadDir:tmpPath,
    }
    //检查上传参数设置的是否正确
    tmpResult=uploadFile.checkOption(uploadOption)
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }
    //读取上传的文件，获得文件信息
    tmpResult=await uploadFile.formParse_async({req:req,option:uploadOption})
    // ap.inf('upload file info',tmpResult)
    if(0===tmpResult.msg.files.length){
        return Promise.reject(controllerError.upload.noUploadAttachment)
    }

    let filesInfo= controllerHelper.getUploadFileNameAndSize({formParseFiles:tmpResult.msg.files,expectedFileSizeUnit:e_fileSizeUnit.MB})
    // ap.inf('filesInfo',filesInfo)
    /**         检测        **/
    let totalFileSize=0,filesPath=[]
    for(let singleFileInfo of filesInfo){
        //判断后缀和content-type是否一致
        let suffix=await controllerChecker.ifFileSuffixMatchContentType_returnSuffixOrFalse_async({uploadFileResult:singleFileInfo})
        // ap.inf('check suffix result',suffix)
        if(false===suffix){
            file.deleteUploadedTmpFile({formParseFiles:filesInfo})
            // ap.inf('after deleteUploadedTmpFile')
            return Promise.reject(controllerError.upload.attachmentFormatIncorrect)
        }
        //判断格式是否允许
        if(-1===uploadFileDefine.common.attachmentType.indexOf(suffix)){
            file.deleteUploadedTmpFile({formParseFiles:filesInfo})
            return Promise.reject(controllerError.upload.attachmentFormatNotSupport)
        }
        /** 添加suffix，后续改名用 **/
        singleFileInfo['suffix']=suffix

        totalFileSize+=singleFileInfo.size
        filesPath.push(singleFileInfo.path)
    }

    ap.inf('filesInfo new field',filesInfo)

    /**********************************************/
    /**    resource check （impeachComment）     **/
    /**********************************************/
    let requiredResource={
        [e_resourceFieldName.USED_NUM]:filesInfo.length,
        [e_resourceFieldName.DISK_USAGE_SIZE_IN_MB]:totalFileSize,
        [e_resourceFieldName.FILE_ABS_PATH]:filesPath,
    }
    /*              获得用户当前的所有资源配置，并检查当前占用的资源（磁盘空间）+文件的资源（sizeInMB）后，还小于==>所有<==的资源配置（）                         */
    let resourceProfileRangeToBeCheck=[e_resourceRange.ATTACHMENT_PER_ARTICLE,e_resourceRange.WHOLE_FILE_RESOURCE_PER_PERSON]
    await resourceCheck.ifEnoughResource_async({requiredResource:requiredResource,resourceProfileRange:resourceProfileRangeToBeCheck,userId:userId,containerId:recordId})
    ap.inf('resource check done')

    let records=[]  //所有要被插入的数据
    let fileCollName=e_coll.ARTICLE_ATTACHMENT

    /**        产生文件最终路径和名称（hashName），以及对应的数据           **/
    //获得合适的存储路径，并move文件
    tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.ARTICLE_INNER_ATTACHMENT})
    let storePath=tmpResult.path
    let pathId=tmpResult._id
    for(let singleFileInfo of filesInfo) {
        let {originalFilename, path, size, suffix} = singleFileInfo
        //对原始文件名进行md5化，然后加上suffix
        let md5NameWithoutSuffix = hash(`${originalFilename}${Date.now()}`, e_hashType.MD5)
        let finalFileName = `${md5NameWithoutSuffix.msg}.${suffix.toLowerCase()}`
        //tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.ARTICLE_INNER_IMAGE,e_field:e_field})
        singleFileInfo['finalPath'] = storePath + finalFileName

        /***************************************************/
        /**                 产生对应的数据                **/
        /****************************************************/
        let internalValue={}

        internalValue[e_field.ARTICLE_ATTACHMENT.NAME]=originalFilename
        internalValue[e_field.ARTICLE_ATTACHMENT.HASH_NAME]=finalFileName
        internalValue[e_field.ARTICLE_ATTACHMENT.PATH_ID]=pathId
        internalValue[e_field.ARTICLE_ATTACHMENT.SIZE_IN_MB]=size
        internalValue[e_field.ARTICLE_ATTACHMENT.AUTHOR_ID]=userId
        internalValue[e_field.ARTICLE_ATTACHMENT.ARTICLE_ID]=recordId

        if(e_env.DEV===currentEnv){
            let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInternalRule:internalInputRule[fileCollName],applyRange:e_applyRange.CREATE})
// console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
            if(tmpResult.rc>0){
                return Promise.reject(tmpResult)
            }
        }

        records.push(internalValue)
    }
    /************************************************/
    /*************      db operation   *************/
    /************************************************/
    let createdAttachment=await common_operation_model.insertMany_returnRecord_async({dbModel:e_dbModel[fileCollName],docs:records})
    // tmpResult=await common_operation_model.create_returnRecord_async({dbModel:e_dbModel[fileCollName],value:internalValue})
    let fileId=[]
    if(createdAttachment.length>0) {
        for (let singleFile of createdAttachment) {
            fileId.push(singleFile.id)
        }
    }
    /*              更新记录到:ARTICLE       */
    let updateValues={}
    updateValues["$push"]={[e_field.ARTICLE.ARTICLE_ATTACHMENTS_ID]:fileId}
    //image/attachment移动到article本身了
    updateValues["$inc"]={
        [e_field.ARTICLE.ATTACHMENTS_NUM]:filesInfo.length,
        [e_field.ARTICLE.ATTACHMENTS_SIZE_IN_MB]:totalFileSize,
    }
    await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.article,id:recordId,updateFieldsValue:updateValues})
    /*              更新记录到关联表:USER_RESOURCE_STATIC       */
    //合并image和attachment，简化处理
    tmpResult=await e_dbModel.user_resource_static.update({
        [e_field.USER_RESOURCE_STATIC.USER_ID]:userId,
        [e_field.USER_RESOURCE_STATIC.RESOURCE_RANGE]:e_resourceRange.WHOLE_FILE_RESOURCE_PER_PERSON
    },{
        $inc:{
            [e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_NUM]:filesInfo.length,
            [e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_SIZE_IN_MB]:totalFileSize,
        }
    })


    for(let singleFileInfo of filesInfo){
        fs.rename(path,singleFileInfo['finalPath'])  //只执行，不关心结果（默认操作完成了）
    }

    //创建的附件需要返回信息，以便显示在页面
    createdAttachment=createdAttachment.toObject()
    for(let singleCreatedRecord of createdAttachment){
        /*********************************************/
        /**********      删除指定字段       *********/
        /*********************************************/
        controllerHelper.keepFieldInRecord({record:singleCreatedRecord,fieldsToBeDeleted:[e_field.ARTICLE_ATTACHMENT.HASH_NAME,e_field.ARTICLE_ATTACHMENT.NAME]})
        /*********************************************/
        /**********      加密 敏感数据       *********/
        /*********************************************/
        controllerHelper.cryptRecordValue({record:singleCreatedRecord,salt:tempSalt,collName:collName})
    }

    return Promise.resolve({rc:0,msg:createdAttachment.to})

}

module.exports={
    uploadArticleAttachment_async,
}