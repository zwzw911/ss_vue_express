/**
 * Created by ada on 2017/9/1.
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)

/**************  controller相关常量  ****************/
const controller_setting=require('../impeach_comment_setting/impeach_comment_setting').setting
const controllerError=require('../impeach_comment_setting/impeach_comment_controllerError').controllerError

/***************  数据库相关常量   ****************/
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')


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
const e_uploadFileRange=nodeRuntimeEnum.UploadFileRange

const e_resourceRange=mongoEnum.ResourceRange.DB
// const e_resourceRange=mongoEnum.AdminUserType.DB
const e_storePathUsage=mongoEnum.StorePathUsage.DB
const e_resourceType=mongoEnum.ResourceType.DB
const e_allUserType=mongoEnum.AllUserType.DB
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
const uploadFile=server_common_file_require.upload
const file=server_common_file_require.file
/*************** 配置信息 *********************/
const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig
const uploadFileDefine=server_common_file_require.globalConfiguration.uploadFileDefine

const gmImage=server_common_file_require.gmImage//require('../../function/assist/gmImage')

const e_gmGetter=nodeRuntimeEnum.GmGetter

async function uploadImpeachCommentFile_async({req}){
    // console.log(`uploadImpeachCommentFile_async in`)
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
    let recordId=req.params['impeachCommentId']  //impeachCommentId。容纳上传文件的主体
    // console.log(`docValue============>${JSON.stringify(docValue)}`)
    // console.log(`recordId============>${JSON.stringify(recordId)}`)
    /************************************************/
    /*****************  用户类型检测     ************/
    /************************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})
    /*******************************************************************************************/
    /*                                     参数过滤                                           */
    /*******************************************************************************************/
    // dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])
    // console.log(`docValue after constructUpdateCriteria============>${JSON.stringify(docValue)}`)
    /**********************************************/
    /***********    用户权限检测    **************/
    /*********************************************/
    let originalDoc
    //当前要上传图片/附件的文档是否为作者本人
    originalDoc=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
        dbModel:e_dbModel[collName],
        recordId:recordId,
        ownerFieldsName:[e_field.IMPEACH_COMMENT.AUTHOR_ID],
        userId:userId,
        additionalCondition:undefined
    })
    if(false===originalDoc){
        return Promise.reject(controllerError.upload.notImpeachCommentCreatorCantUploadFile)
    }
    // =misc.objectDeepCopy(tmpResult)

    /************************************************/
    /*****************     特定检测      ************/
    /************************************************/
    //impeachComment的documentStatus必须为NEW（而不是submit）。和impeach检查点不同
/*    let impeachComment=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.impeach_comment,id:recordId})
    if(null!==impeachComment){*/
        if(originalDoc[e_field.IMPEACH_COMMENT.DOCUMENT_STATUS]!==e_impeachState.NEW){
            return Promise.reject(controllerError.upload.cantUploadImageForNonNewImpeachComment)
        }
    // }



    /*******************************************************************************************/
    /*                          delete field cant be update from client                        */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                              remove not change field                                    */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                          check field number after delete                                */
    /*******************************************************************************************/

    /***********************************************************************/
    /*************  获得上传文件的信息并判断 文件是否valid        *********/
    /***********************************************************************/
    let tmpPath=controllerHelper.chooseTmpDir({uploadFileRange:e_uploadFileRange.IMPEACH_COMMENT_IMAGE})
    let uploadOption={
        // maxFilesSize:2097152,
        maxFilesSize:uploadFileDefine.impeach_comment.image[e_uploadFileDefinitionFieldName.MAX_SIZE_IN_BYTE],//300k   头像文件大小100k
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
    if(0===tmpResult.msg.files.length){
        return Promise.reject(controllerError.upload.noUploadImage)
    }
    let filesInfo= controllerHelper.getUploadFileNameAndSize({formParseFiles:tmpResult.msg.files,expectedFileSizeUnit:e_fileSizeUnit.MB})

    // let uploadResult=await controllerHelper.uploadFileToTmpDir_async({req:req, uploadTmpDir:e_iniSettingObject.store_path.UPLOAD_TMP.upload_tmp_dir.path, maxFileSize:maxFileSize,fileSizeUnit:e_fileSizeUnit.MB})
    /**         检测        **/
    let totalFileSize=0,filesPath=[]
    //检测格式/size/解析度（图片）
    for(let singleFileInfo of filesInfo){
        let {originalFilename,path,size}=singleFileInfo

        //判断图片格式是否允许
        let suffix
        let gmInst=gmImage.initImage({originalFilename})
        suffix=await gmImage.getImageProperty_async(gmInst,e_gmGetter.FORMAT)
        if(-1===uploadFileDefine.common.imageType.indexOf(suffix)){
            file.deleteUploadedTmpFile({formParseFiles:filesInfo})
            return Promise.reject(controllerError.upload.imageFormatNotSupport)
        }
        /** 添加suffix，后续改名用  **/
        singleFileInfo['suffix']=suffix

        //判断图片的长，宽，是否符合
        let wh=await gmImage.getImageProperty_async(gmInst,e_gmGetter.SIZE)
        if(wh.width > uploadFileDefine[e_coll.impeach_comment][e_uploadFileDefinitionFieldName.MAX_WIDTH]
            || wh.height > uploadFileDefine[e_coll.impeach_comment][e_uploadFileDefinitionFieldName.MAX_HEIGHT]
        ){
            file.deleteUploadedTmpFile({formParseFiles:filesInfo})
            return Promise.reject(controllerError.upload.imageResolutionNotSupport)
        }

        totalFileSize+=singleFileInfo.size
        filesPath.push(singleFileInfo.path)
    }

    /**********************************************/
    /**    resource check （impeachComment）     **/
    /**********************************************/
    let requiredResource={
        [e_resourceFieldName.USED_NUM]:filesInfo.length,
        [e_resourceFieldName.DISK_USAGE_SIZE_IN_MB]:totalFileSize,
        [e_resourceFieldName.FILE_ABS_PATH]:filesPath,
    }
    // console.log(`get upload fild info  =====>${JSON.stringify(uploadResult)}`)
    let resourceProfileRangeToBeCheck=[e_resourceRange.IMAGE_PER_IMPEACH_OR_COMMENT,e_resourceRange.IMAGE_IN_WHOLE_IMPEACH,e_resourceRange.IMAGE_PER_USER_IN_WHOLE_IMPEACH]
    await resourceCheck.ifEnoughResource_async({requiredResource:requiredResource,resourceProfileRange:resourceProfileRangeToBeCheck,userId:userId,containerId:recordId})


    let records=[]  //所有要被插入的数据
    let fileCollName=e_coll.IMPEACH_COMMENT_IMAGE
    let fieldToBeChanged=e_field.IMPEACH_COMMENT.IMPEACH_IMAGES_ID

    /**        产生文件最终路径和名称（hashName），以及对应的数据           **/
    //获得合适的存储路径，并move文件
    tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.IMPEACH_IMAGE})
    let storePath=tmpResult.path
    let pathId=tmpResult._id
    for(let singleFileInfo of filesInfo){
        let {originalFilename,path,size,suffix}=singleFileInfo
        //对原始文件名进行md5化，然后加上suffix
        let md5NameWithoutSuffix=hash(`${originalFilename}${Date.now()}`,e_hashType.MD5)
        let finalFileName=`${md5NameWithoutSuffix.msg}.${suffix.toLowerCase()}`
        //tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.ARTICLE_INNER_IMAGE,e_field:e_field})
        singleFileInfo['finalPath'] = storePath + finalFileName


        /***************************************************/
        /**                 产生对应的数据                **/
        /****************************************************/
        let internalValue={}
        // if(e_uploadFileType.IMAGE===type){
        internalValue[e_field.IMPEACH_COMMENT_IMAGE.NAME]=originalFilename
        internalValue[e_field.IMPEACH_COMMENT_IMAGE.HASH_NAME]=finalFileName
        internalValue[e_field.IMPEACH_COMMENT_IMAGE.PATH_ID]=pathId
        internalValue[e_field.IMPEACH_COMMENT_IMAGE.SIZE_IN_MB]=size
        internalValue[e_field.IMPEACH_COMMENT_IMAGE.AUTHOR_ID]=userId
        internalValue[e_field.IMPEACH_COMMENT_IMAGE.IMPEACH_COMMENT_ID]=recordId
        // internalValue[e_field.IMPEACH_COMMENT_IMAGE.REFERENCE_COLL]=e_coll.IMPEACH_COMMENT



        if(e_env.DEV===currentEnv){
            let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInternalRule:internalInputRule[fileCollName],applyRange:e_applyRange.CREATE})
// console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
            if(tmpResult.rc>0){
                return Promise.reject(tmpResult)
            }
        }

        records.push(internalValue)
    }


    /********************************************/
    /**            db operation              **/
    /********************************************/
    tmpResult=await common_operation_model.insertMany_returnRecord_async({dbModel:e_dbModel[fileCollName],docs:records})
    // tmpResult=await common_operation_model.create_returnRecord_async({dbModel:e_dbModel[fileCollName],value:internalValue})
    let fileId=[]
    if(tmpResult.length>0){
        for(let singleFile of tmpResult){
            fileId.push(singleFile.id)

        }

    }
    /*              更新记录到关联表：IMPEACH_COMMENT                  */
    let updateValues={}
    updateValues["$push"]={[e_field.IMPEACH_COMMENT.IMPEACH_IMAGES_ID]:fileId}
    //image/attachment移动到article本身了
    updateValues["$inc"]={
        [e_field.IMPEACH_COMMENT.IMAGES_NUM]:filesInfo.length,
        [e_field.IMPEACH_COMMENT.IMAGES_SIZE_IN_MB]:totalFileSize,
    }
    await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.impeach_comment,id:recordId,updateFieldsValue:updateValues})

    /*      移动文件        */
    for(let singleFileInfo of filesInfo){
        fs.rename(path,singleFileInfo['finalPath'])  //只执行，不关心结果（默认操作完成了）
    }

    return Promise.resolve({rc:0})

}

module.exports={
    uploadImpeachCommentFile_async,
}