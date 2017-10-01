/**
 * Created by Ada on 2017/08/17.
 * url：
 */
'use strict'




const fs=require('fs')
const server_common_file_require=require('../../../server_common_file_require')

const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum


const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method

const e_uploadFileType=nodeEnum.UploadFileType


const e_hashType=nodeRuntimeEnum.HashType

const e_env=nodeEnum.Env

const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB
const e_iniSettingObject=require('../../constant/genEnum/initSettingObject').iniSettingObject

const e_resourceProfileRange=mongoEnum.ResourceProfileRange.DB
const e_storePathUsage=mongoEnum.StorePathUsage.DB

const e_fileSizeUnit=nodeRuntimeEnum.FileSizeUnit

const currentEnv=server_common_file_require.appSetting.currentEnv
const uploadFileDefine=server_common_file_require.globalConfiguration.uploadFileDefine

const e_dbModel=require('../../constant/genEnum/dbModel')
const fkConfig=server_common_file_require.fkConfig.fkConfig

const e_coll=require('../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../constant/genEnum/DB_field').Field


const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const hash=server_common_file_require.crypt.hash

const misc=server_common_file_require.misc
// const checkRobot_async=require('../../function/assist/checkRobot').checkRobot_async


// const sanityHtml=server_common_file_require.sanityHtml
/*const generateRandomString=require('../../function/assist/misc').generateRandomString
const sendVerificationCodeByEmail_async=require('../../function/assist/misc').sendVerificationCodeByEmail_async
const ifUserLogin=require('../../function/assist/misc').ifUserLogin*/

// const dataConvert=server_common_file_require.dataConvert
// const validateCreateRecorderValue=require('../../function/validateInput/validateValue').validateCreateRecorderValue
// const validateUpdateRecorderValue=require('../../function/validateInput/validateValue').validateUpdateRecorderValue
// const validateCURecordInfoFormat=require('../../function/validateInput/validateFormat').validateCURecordInfoFormat
// const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule
const internalInputRule=require('../../constant/inputRule/internalInputRule').internalInputRule
const inputRule=require('../../constant/inputRule/inputRule').inputRule
const e_fieldChineseName=require('../../constant/genEnum/inputRule_field_chineseName').ChineseName


// const mongoError=require('../../constant/error/mongo/mongoError').error

// const regex=require('../../constant/regex/regex').regex

// const maxNumber=require('../../constant/config/globalConfiguration').maxNumber
// const miscConfiguration=require('../../constant/config/globalConfiguration').miscConfiguration
//
// const mailAccount=require('../../constant/config/globalConfiguration').mailAccount


const calcResourceConfig=require('../../constant/config/calcResourceConfig')
/*          create article              */
// const checkUserState=require('../')
/*         upload user photo         */
const gmImage=server_common_file_require.gmImage
// const userPhotoConfiguration=require('../../constant/config/globalConfiguration').uploadFileDefine.user_thumb
const e_gmGetter=nodeRuntimeEnum.GmGetter
// const e_gmCommand=require('../../constant/enum/node_runtime').GmCommand
// const uploadFile=require('../../function/assist/upload')

/*         generate captcha         */
// const captchaIntervalConfiguration=require('../../constant/config/globalConfiguration').intervalCheckConfiguration.captcha


const controllerError={
    /*          common              */
/*    fieldAlreadyExist(chineseFieldName,fieldInputValue){
        switch (fieldName){
            case e_field.article
        }
        return {rc:50200,msg:{client:`${fieldInputValue}已经存在`, server:`字段${chineseFieldName}中，值${fieldInputValue}已经存在`}}},*/



    /*          upload impeach(comment)   image                */
    userNotLoginCantCreateImpeachImage:{rc:50800,msg:`用户尚未登录，无法插入图片`},
    // undefinedRangeType:{rc:50402,msg:{client:`内部参数错误，请联系管理员`,server:`未定义的rangeType`}},
    userInPenalizeNoImpeachUpdate:{rc:50803,msg:`管理员禁止更新文档`},
    undefinedColl:{rc:50804,msg:{client:`内部参数错误，请联系管理员`,server:`未定义图片要插入到哪里`}},
    notOwner:{rc:50804,msg:{client:`输入参数错误`,server:`不能更新他人的举报/后续处理`}},

    //资源已经使用完毕
    resourceSizeAlreadyExceed:{rc:50806,msg:{client:`总容量已经达到最大值，无法继续添加文件`,server:`容量达到最大`}},
    resourceNumAlreadyExceed:{rc:50808,msg:{client:`总数量达到最大值，无法继续添加文件`,server:`数量达到最大`}},

    //新文件会导致资源使用完毕
    resourceSizeWillExceed:{rc:50806,msg:{client:`剩余总容量不足，无法继续添加文件`,server:`新文件会导致容量达到最大`}},
    resourceNumWillExceed:{rc:50808,msg:{client:`剩余数量不足，无法继续添加文件`,server:`新文件会导致数量达到最大`}},
    
    
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
/*
* @uploadFileType: 上传的是image还是attachment
* @forColl： 上传的文件是for impeach还是impeachComment（因为这2者共用处理代码以及同一个coll）
* */
async function impeachUploadFile_dispatch_async({req,uploadFileType,forColl}){
    let collName=forColl,tmpResult
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
        //对于图片来说，是create（虽然此create是在impeach的update中进行操作的）
        case e_method.CREATE: //create
            userLoginCheck={
                needCheck:true,
                error:controllerError.userNotLoginCantCreateImpeachImage
            }
            penalizeCheck={
                penalizeType:e_penalizeType.NO_IMPEACH,  //用户是否可以在新建的IMPEACH/IMPEACH_COMMENT插入图片（虽然是update，但对于用户，实际是新建）
                penalizeSubType:e_penalizeSubType.UPDATE, //create文件，是在impeach/impeachComment的update中进行操作的，
                penalizeCheckError:controllerError.userInPenalizeNoImpeachUpdate
            }
            expectedPart=[e_part.RECORD_ID]  //对哪个impeach/impeachComment进行更新（实际上是新建）
            tmpResult=await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
	    //tmpResult=await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart,e_field:e_field,e_coll:e_coll,e_internal_field:e_internal_field,maxSearchKeyNum:maxSearchKeyNum,maxSearchPageNum:maxSearchPageNum})

            let validCollName=[e_coll.IMPEACH,e_coll.IMPEACH_COMMENT]
            /*              检查collName是否合格              */
            if(-1===validCollName.indexOf(collName)){
                return Promise.reject(controllerError.undefinedColl)
            }
            tmpResult=await uploadImpeachFile_async({req:req,uploadFileType:uploadFileType,forColl:forColl})



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
 * @uploadFileType: 上传的是image还是attachment
 * @forColl： 上传的文件是for impeach还是impeachComment（因为这2者共用处理代码以及同一个coll）
* */
async function uploadImpeachFile_async({req,uploadFileType,forColl}) {
    // console.log(   `uploadImpeachFile_async in`)
    let tmpResult
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let userId=userInfo.userId

    let referenceId = req.body.values[e_part.RECORD_ID] //根据refreenceColl决定recordId关联到哪个coll
    // let originalArticle
    let collName = forColl
    let fileCollName        //存储file的coll
    let ownerFieldName      //impeach/impeach_comment中，用户的id（用来在fileCollName中统计资源）
    let sizeFieldName       //fileCollName中，记录size的字段名
    // let fileStoreCollName
    let fkFileOwnerFieldName       //fileCollName中，记录用户的字段名
    //上传image只对如下coll生效

    /*                根据图片要插入到impeach还是impeachComment，设置userId对应的字段名            */
    switch (collName) {
        case e_coll.IMPEACH:
            ownerFieldName = e_field.IMPEACH.CREATOR_ID
            break
        case e_coll.IMPEACH_COMMENT:
            ownerFieldName = e_field.IMPEACH_COMMENT.AUTHOR_ID
            break
    }

    /*              在对应的coll（impeach/impeachComment）中，查找id为文档，且作者为userid的记录，找不到说明不是作者，无权修改            */
    let condition = {}
    condition['_id'] = referenceId
    condition[ownerFieldName] = userId
// console.log(`condition to check user =====>${JSON.stringify(condition)}`)
    tmpResult = await  common_operation_model.find_returnRecords_async({dbModel: e_dbModel[collName], condition: condition})
    if (tmpResult.length !== 1) {
        return Promise.reject(controllerError.notOwner)
    }
    // originalArticle=misc.objectDeepCopy({},tmpResult.msg[0])



    /*                              预先计算已经占用的资源数量，并比较是否超出                           */
    //不同的resourceRange，需要计算不同的resourceUsage和profile
    let currentResourceUsage={}
    let resourceProfile={}
    //定义需要检查的类型（按用户进行计算，按单个举报/举报处理计算）
    let resourceProfileRangeToBeCheck = [e_resourceProfileRange.PER_PERSON_IN_IMPEACH, e_resourceProfileRange.PER_IMPEACH_OR_COMMENT]
    //对每个range进行计算时，要统计的资源所在的coll
    let resourceCollToBeCheck = [e_coll.IMPEACH_ATTACHMENT, e_coll.IMPEACH_IMAGE]
    for(let singleResourceRange of resourceProfileRangeToBeCheck){
        //不同的resourceRange，需要计算不同的resource
        currentResourceUsage[singleResourceRange]= {totalFileNum: 0, totalSizeInMb: 0}
        for(let singleResourceColl of resourceCollToBeCheck){
            let result=await controllerHelper.calcExistResource_async({
                resourceProfileRange:singleResourceRange,
                resourceFileFieldName:calcResourceConfig.resourceFileFieldName[singleResourceColl],
                fieldsValueToFilterGroup:calcResourceConfig.fieldsValueToFilterGroup({impeach:{userId:userId,referenceId:referenceId}})[singleResourceColl],
            })
            currentResourceUsage[singleResourceRange]['totalFileNum']+=result['totalFileNum']
            currentResourceUsage[singleResourceRange]['totalSizeInMb']+=result['totalSizeInMb']
            console.log(`resourceRange====>${singleResourceRange},resourceType=====>${singleResourceType}, result========>${JSON.stringify(result)}`)
        }
        //选择profile，并将currentResourceUsage[singleResourceRange]传入比较
        resourceProfile[singleResourceRange]=await controllerHelper.chooseLastValidResourceProfile_async({resourceProfileRange:singleResourceRange,userId:userId})
	//resourceProfile[singleResourceRange]=await controllerHelper.chooseLastValidResourceProfile_async({resourceProfileRange:singleResourceRange,userId:userId,e_field:e_field})

        await controllerChecker.ifResourceStillValid_async({currentResourceUsage:currentResourceUsage[singleResourceRange],currentResourceProfile:resourceProfile[singleResourceRange],error:{sizeExceed:controllerError.resourceSizeAlreadyExceed,numberExceed:controllerError.resourceNumAlreadyExceed}})
    }

    /*              上传文件存储到临时目录                         */
    let maxFileSize = uploadFileDefine[collName][uploadFileType].maxSizeInByte
    let uploadResult = await controllerHelper.uploadFileToTmpDir_async({
        req: req,
        uploadTmpDir: e_iniSettingObject.store_path.UPLOAD_TMP.upload_tmp_dir.path,
        maxFileSize: maxFileSize,
        fileSizeUnit: e_fileSizeUnit.MB
    })
    let {originalFilename, path, size} = uploadResult.msg


    let fileInfo={size:size,path:path}
    for(let singleResourceRange of resourceProfileRangeToBeCheck){
        await controllerChecker.ifNewFileLeadExceed_async({currentResourceUsage:currentResourceUsage[singleResourceRange],currentResourceProfile:resourceProfile[singleResourceRange],fileInfo:fileInfo,error:{sizeExceed:controllerError.resourceSizeWillExceed,numberExceed:controllerError.resourceNumWillExceed}})
    }
  
    /*              文件move到永久存储目录                           */
    let finalFileName,suffix
    //格式检查
    if(e_uploadFileType.IMAGE===uploadFileType){
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
    if(e_uploadFileType.ATTACHMENT===uploadFileType){
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
    if(e_uploadFileType.IMAGE===uploadFileType){
        tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.ARTICLE_INNER_IMAGE})
	//tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.ARTICLE_INNER_IMAGE,e_field:e_field})
    }
    if(e_uploadFileType.ATTACHMENT===uploadFileType){
        tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.ARTICLE_INNER_ATTACHMENT})
	//tmpResult=await controllerHelper.chooseStorePath_async({usage:e_storePathUsage.ARTICLE_INNER_ATTACHMENT,e_field:e_field})
    }
    let finalPath=tmpResult.path+finalFileName
    let pathId=tmpResult._id
    fs.renameSync(path,finalPath)

    /*              内部field value检测                            */
    let internalValue={},fieldToBeChanged
    if(e_uploadFileType.IMAGE===uploadFileType){
        internalValue[e_field.IMPEACH_IMAGE.NAME]=originalFilename
        internalValue[e_field.IMPEACH_IMAGE.HASH_NAME]=finalFileName
        internalValue[e_field.IMPEACH_IMAGE.PATH_ID]=pathId
        internalValue[e_field.IMPEACH_IMAGE.SIZE_IN_MB]=size
        internalValue[e_field.IMPEACH_IMAGE.AUTHOR_ID]=userId
        internalValue[e_field.IMPEACH_IMAGE.REFERENCE_ID]=referenceId
        internalValue[e_field.IMPEACH_IMAGE.REFERENCE_COLL]=collName
        fileCollName=e_coll.IMPEACH_IMAGE
        if(collName===e_coll.IMPEACH){
            fieldToBeChanged=e_field.IMPEACH.IMPEACH_IMAGES_ID
        }
        if(collName===e_coll.IMPEACH_COMMENT){
            fieldToBeChanged=e_field.IMPEACH_COMMENT.IMPEACH_IMAGES_ID
        }        
    }
    /*if(e_uploadFileType.ATTACHMENT===uploadFileType){
        internalValue[e_field.IMPEACH_ATTACHMENT.NAME]=originalFilename
        internalValue[e_field.IMPEACH_ATTACHMENT.HASH_NAME]=finalFileName
        internalValue[e_field.IMPEACH_ATTACHMENT.PATH_ID]=pathId
        internalValue[e_field.IMPEACH_ATTACHMENT.SIZE_IN_MB]=size
        internalValue[e_field.IMPEACH_ATTACHMENT.AUTHOR_ID]=userId
        internalValue[e_field.IMPEACH_ATTACHMENT.ARTICLE_ID]=articleId
        fileCollName=e_coll.IMPEACH_ATTACHMENT
        fieldToBeChanged=e_field.ARTICLE.IMPEACH_ATTACHMENTS_ID
    }*/

    if(e_env.DEV===currentEnv){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[fileCollName],collInternalRule:internalInputRule[fileCollName]})
// console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }

    /*                  外键检查                        */
    //上传文件的所有字段都是内部字段，无client输入的docValue
    await controllerChecker.ifFkValueExist_async({docValue:internalValue,collFkConfig:fkConfig[fileCollName],collFieldChineseName:e_fieldChineseName[fileCollName]})



    //因为都是internal field，直接插入到coll
    /*              插入记录到impeach_image            */
    tmpResult=await common_operation_model.create_returnRecord_async({dbModel:e_dbModel[fileCollName],value:internalValue})
    let fileId=tmpResult._id
    /*              更新记录到impeach/impeach_Comment                 */
    tmpResult=await e_dbModel[collName].update({_id:referenceId},{$push:{[fieldToBeChanged]:fileId}})
    return Promise.resolve({rc:0})
}









module.exports={
    // article_dispatcher_async,
    // comment_dispatcher_async,
    impeachUploadFile_dispatch_async,
    
    
    // uploadArticleImage_async,
    // uploadImpeachFile_async,

    controllerError
}