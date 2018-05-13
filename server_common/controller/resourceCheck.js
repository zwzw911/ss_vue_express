/**
 * Created by zhang wei on 2018/4/27.
 * 独立文件，用来检查用户预订的资源是否有剩余，可以用来
 */
'use strict'
/**********************************************************/
/******************  第三方函数     ***********************/
/**********************************************************/
const ap=require('awesomeprint')
const fs=require('fs')
const deleteFiles=require('../function/assist/file').deleteFiles

const e_field=require(`../constant/genEnum/DB_field`).Field
const e_coll=require(`../constant/genEnum/DB_Coll`).Coll
const e_dbModel=require(`../constant/genEnum/dbModel`)

const e_resourceFieldName=require(`../constant/enum/nodeEnum`).ResourceFieldName
const e_resourceConfigFieldName=require(`../constant/enum/nodeEnum`).ResourceConfigFieldName

const e_resourceType=require(`../constant/enum/mongoEnum`).ResourceType.DB

const e_resourceProfileRange=require(`../constant/enum/mongoEnum`).ResourceProfileRange.DB
/**********************************************************/
/******************  普通函数     ***********************/
/**********************************************************/
const recordInternalError_async=require('../function/supervisor/supervisor').recordInternalError_async
/**********************************************************/
/******************  db操作函数     ***********************/
/**********************************************************/
const common_operation_model=require('../model/mongo/operation/common_operation_model')

/**********************************************************/
/******************  error 定义    ***********************/
/**********************************************************/
const helperError=require('../constant/error/controller/helperError')

//日常：计算总体(total)资源，并存入user_resource_static,修正可能出现的资源统计错误
//当前只计算用户的article中的image和attachment的总数，以便确定用户总的使用空间
const daily={
    [e_resourceType.ARTICLE_IMAGE]:function({arr_userId}){
        let config={
            [e_resourceConfigFieldName.COLL_NAME]:e_coll.ARTICLE_IMAGE,
            [e_resourceConfigFieldName.RESOURCE_TYPE]:e_resourceType.ARTICLE_IMAGE,
            [e_resourceConfigFieldName.DB_MODEL]:e_dbModel.article_image,
            [e_resourceConfigFieldName.RAW_DOC_GROUP]:{
                _id:`$${[e_field.ARTICLE_IMAGE.AUTHOR_ID]}`,
                [e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]:{$sum:`$${e_field.ARTICLE_IMAGE.SIZE_IN_MB}`},
                [e_resourceFieldName.MAX_FILE_NUM]:{$sum:1}
            }
        }
        if(undefined!==arr_userId && arr_userId.length>0){
            config[e_resourceConfigFieldName.RAW_DOC_FILTER]={[e_field.ARTICLE_IMAGE.AUTHOR_ID]:{$in:arr_userId}}
        }
        return config
    },
    [e_resourceType.ARTICLE_ATTACHMENT]:function({arr_userId}){
        let config={
            [e_resourceConfigFieldName.COLL_NAME]:e_coll.ARTICLE_ATTACHMENT,
            [e_resourceConfigFieldName.RESOURCE_TYPE]:e_resourceType.ARTICLE_ATTACHMENT,
            [e_resourceConfigFieldName.DB_MODEL]:e_dbModel.article_image,
            [e_resourceConfigFieldName.RAW_DOC_GROUP]:{
                _id:`$${[e_field.ARTICLE_ATTACHMENT.AUTHOR_ID]}`,
                [e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]:{$sum:`$${e_field.ARTICLE_ATTACHMENT.SIZE_IN_MB}`},
                [e_resourceFieldName.MAX_FILE_NUM]:{$sum:1}
            }
        }
        if(undefined!==arr_userId && arr_userId.length>0){
            config[e_resourceConfigFieldName.RAW_DOC_FILTER]={[e_field.ARTICLE_IMAGE.AUTHOR_ID]:{$in:arr_userId}}
        }
        return config
    }
}

const calcResourceCriteria={
    //用户在 单个 文档中的图片：需要实时获得
    /*[e_resourceProfileRange.IMAGE_PER_ARTICLE]:({articleId})=>{
        return [
            {
                collName:e_coll.ARTICLE_IMAGE,
                match:{
                    [e_field.ARTICLE_IMAGE.ARTICLE_ID]:articleId
                },
                group:{
                    _id:`$${[e_field.ARTICLE_IMAGE.ARTICLE_ID]}`,
                    [e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]:{$sum:`$${e_field.ARTICLE_IMAGE.SIZE_IN_MB}`},
                    [e_resourceFieldName.MAX_FILE_NUM]:{$sum:1}
                },
            }
        ]
    },
    //用户在 单个 文档中的附件：需要实时获得
    [e_resourceProfileRange.ATTACHMENT_PER_ARTICLE]:({articleId})=>{
        return [
            {
                collName:e_coll.ARTICLE_ATTACHMENT,
                match:{
                    [e_field.ARTICLE_ATTACHMENT.ARTICLE_ID]:articleId
                },
                group:{
                    _id:`$${[e_field.ARTICLE_ATTACHMENT.ARTICLE_ID]}`,
                    [e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]:{$sum:`$${e_field.ARTICLE_ATTACHMENT.SIZE_IN_MB}`},
                    [e_resourceFieldName.MAX_FILE_NUM]:{$sum:1}
                },
            }
        ]
    },*/
    //用户在 所有 文档中的资源，直接读取user_resource_static的内容
    [e_resourceProfileRange.WHOLE_RESOURCE_PER_PERSON_FOR_ALL_ARTICLE]:({userId})=>{
        return [
            {
                collName:e_coll.USER_RESOURCE_STATIC,
                match:{
                    [e_field.USER_RESOURCE_STATIC.USER_ID]:userId
                },
                group:{
                    _id:`$${[e_field.USER_RESOURCE_STATIC.USER_ID]}`,
                    [e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]:{$sum:`$${e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_SIZE_IN_MB}`},
                    [e_resourceFieldName.MAX_FILE_NUM]:{$sum:`$${e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_NUM}`}
                },
            },
            {
                collName:e_coll.ARTICLE_ATTACHMENT,
                match:{
                    [e_field.ARTICLE_IMAGE.AUTHOR_ID]:userId
                },
                group:{
                    _id:`$${[e_field.ARTICLE_IMAGE.AUTHOR_ID]}`,
                    [e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]:{$sum:`$${e_field.ARTICLE_ATTACHMENT.SIZE_IN_MB}`},
                    [e_resourceFieldName.MAX_FILE_NUM]:{$sum:1}
                },
            }
        ]
    },


    //用户在 单个 举报中的图片：需要实时获得
    [e_resourceProfileRange.IMAGE_PER_IMPEACH_OR_COMMENT]:({impeach_comment_Id})=>{
        return [
            {
                collName:e_coll.IMPEACH_IMAGE,
                match:{
                    [e_field.IMPEACH_IMAGE.REFERENCE_ID]:impeach_comment_Id
                },
                group:{
                    _id:`$${[e_field.IMPEACH_IMAGE.REFERENCE_ID]}`,
                    [e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]:{$sum:`$${e_field.IMPEACH_IMAGE.SIZE_IN_MB}`},
                    [e_resourceFieldName.MAX_FILE_NUM]:{$sum:1}
                },
            }
        ]
    },

    //用户在 整个 举报和评论中的图片：需要实时获得
    [e_resourceProfileRange.IMAGE_PER_PERSON_FOR_WHOLE_IMPEACH]:({userId,arr_impeach_and_comment_id})=>{
        return [
            {
                collName:e_coll.IMPEACH_IMAGE,
                match:{
                    [e_field.IMPEACH_IMAGE.REFERENCE_ID]:{"$in":arr_impeach_and_comment_id},
                    [e_field.IMPEACH_IMAGE.AUTHOR_ID]:userId,
                },
                group:{
                    _id:`$${[e_field.IMPEACH_IMAGE.AUTHOR_ID]}`,
                    [e_resourceFieldName.TOTAL_FILE_SIZE_IN_MB]:{$sum:`$${e_field.IMPEACH_IMAGE.SIZE_IN_MB}`},
                    [e_resourceFieldName.MAX_FILE_NUM]:{$sum:1}
                },
            }
        ]
    },
}

/*  为arr_resourceProfileRange中的每个resourceRange，获得当前valida的user_resource_profile(basic或者advanced)
* @singleResourceProfileRange；需要获得profile的resource
* @userId：对哪个用户的resource检索profile
*
* return：singleResourceProfileRange对应的一条记录
* */
async function findValidResourceProfiles_async({singleResourceProfileRange,userId}){
    let validResourceProfileRecord
    //为每种resourceProfileRange查找valida的resourceProfile
    // for(let singleResourceProfileRange of arr_resourceProfileRange){
    let condition={"$and":[{'dDate':{$exists:false}}]}
    //首先在resourceProfile中，根据resourceRange查找所有对应的resourceProfile（包括所有type（当前为basic和advanced））
    condition.push({[e_field.RESOURCE_PROFILE.RANGE]:singleResourceProfileRange})
    let resourceProfileResult=common_operation_model.find_returnRecords_async({dbModel:e_dbModel.resource_profile,condition:condition})
    //根据所有查找到的resourceProfile id，在user_profile查找所有对应的记录
    let currentDate=new Date()
    let userResourceProfileCondition={"$and":[
            {[e_field.USER_RESOURCE_PROFILE.RESOURCE_PROFILE_ID]:{'$in':[]}},
            {[e_field.USER_RESOURCE_PROFILE.END_DATE]:{$lt:currentDate}},
            {[e_field.USER_RESOURCE_PROFILE.START_DATE]:{$gt:currentDate}},
            {[e_field.USER_RESOURCE_PROFILE.USER_ID]:userId},
        ]}
    let userResourceProfileSelectFields='-uDate' //包含所有field的值
    let option={$sort:{[e_field.USER_RESOURCE_PROFILE.ID]:-1}} //按照cDate递减，方便返回结果取值（idx=0为第一条）
    for(let singleResourceProfileResult of resourceProfileResult){
        userResourceProfileCondition[e_field.USER_RESOURCE_PROFILE.RESOURCE_PROFILE_ID]['$in'].push(singleResourceProfileResult[e_field.RESOURCE_PROFILE.ID])
    }
    let validResultForSingleResourceProfileRange=common_operation_model.find_returnRecords_async({
        dbModel:e_dbModel.user_resource_profile,
        selectedFields:userResourceProfileSelectFields,
        options:option,
        condition:userResourceProfileCondition
    })
    //根据返回记录的数量判断valida的profile id
    if(0===validResultForSingleResourceProfileRange.length){
        await recordInternalError_async({})
        return Promise.reject(helperError.resourceCheck.findValidResourceProfiles_async.userHasNoProfileForProFileRange({profileRange:singleResourceProfileRange}))
    }
    //返回最后一条记录（如果只有一条，那就返回第一条（basic），多天返回advanced）
    else{
        validResourceProfileRecord=validResultForSingleResourceProfileRange[0]//因为是按照id递减排列的，所以第一条为valid
    }
    // }


    return Promise.resolve(validResourceProfileRecord)
}

//
function ifSpaceExceed({currentUsedSpace,requiredSpace,resourceProfileRecord}){
    return currentUsedSpace+requiredSpace > resourceProfileRecord[e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]
}
function ifNumExceed({currentUsedNum,requiredNum,resourceProfileRecord}){
    return currentUsedNum+requiredNum > resourceProfileRecord[e_field.RESOURCE_PROFILE.MAX_NUM]
}
/**********************************************************************************/
/**********************             article        *******************************/
/**********************************************************************************/
/*  根据resourceProfileRange，计算对应的resource usage（当前只支持image/attachmentPerArticle）
* @singleResourceProfileRange: 为了代码结构简单，传入单个resourceProfile，而不是数组（实际应用中，一般也只要传入一个resourceProfileRange，例如，上传附件和上传图片一般是分开操作的）
*
* 返回：对象。 key为arr_resourceProfileRange中的元素，values手机object，{num:xxx,sizeInMb:yyy}
* */
async function calcArticleResourceUsage_async({singleResourceProfileRange,articleId}){
    let result
    //没有任何需要检查的profileRange，则返回空object
/*    if(arr_resourceProfileRange.length===0){
        return Promise.resolve({})
    }*/
    //首先读取数据库（无路是image还是attachment的resourceUsage，都存在同一条记录中）
    let articleRecord=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.article,id:articleId})
    if(null===articleRecord){
        return Promise.reject(helperError.resourceCheck.calcArticleResourceUsage_async.articleNotExistCantCalcResource)
    }
    //为每个resourceProfileRange获得统计信息
    // for(let singleResourceProfileRange of arr_resourceProfileRange){
        switch (singleResourceProfileRange){
            case e_resourceProfileRange.IMAGE_PER_ARTICLE:
                // result[singleResourceProfileRange]={
                result={
                    [e_resourceFieldName.USED_NUM]:articleRecord[e_field.ARTICLE.IMAGES_NUM],
                    [e_resourceFieldName.DISK_USAGE_SIZE_IN_MB]:articleRecord[e_field.ARTICLE.IMAGES_SIZE_IN_MB],
                }
                break;
            case e_resourceProfileRange.ATTACHMENT_PER_ARTICLE:
                // result[singleResourceProfileRange]=
                result={
                    [e_resourceFieldName.USED_NUM]:articleRecord[e_field.ARTICLE.ATTACHMENTS_NUM],
                    [e_resourceFieldName.DISK_USAGE_SIZE_IN_MB]:articleRecord[e_field.ARTICLE.ATTACHMENTS_SIZE_IN_MB],
                }
                break;
            default:
                return Promise.reject(helperError.resourceCheck.calcArticleResourceUsage_async.unknownResourceProfileRange)

        }
    // }
    return Promise.resolve(result)
}

/**********************************************************************************/
/**********************             total          *******************************/
/**********************************************************************************/
/*  直接读取user_resource_static中user的记录（当前记录的num和sizeInMb只包括article的image和attachment）
* */
async function calcUserTotalResourceUsage_async({userId}){
    let result=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.user_resource_static,id:userId})
    if(null===result){
        await recordInternalError_async({})
        return Promise.reject(helperError.resourceCheck.calcUserTotalResourceUsage_async.userNotExistCantGetUsage)
    }

    return Promise.resolve({num:result[e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_NUM],sizeInMb:result[e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_SIZE_IN_MB]})
}

/**********************************************************************************/
/**********************             folder        *******************************/
/**********************************************************************************/
/*  计算folder的数量
* */
async function calcFolderNum_async({userId}){
    let condition={
        [e_field.FOLDER.AUTHOR_ID]:userId,
        'dDate':{$exists:false},
    }
    let folderNum=await common_operation_model.count_async({dbModel:e_dbModel.folder,condition:condition})
    return Promise.resolve({num:folderNum})
}

/*******************************************************************************************/
/******************         主函数，用来检测是否还是有disk space可用        ***************/
/*******************************************************************************************/
/* @requiredResource: 当前请求需要的资源（当前请求上传的附件/图片的总大小和数量）。对象 {num:xx,sizeInMb;yy,filesAbsPath:[]}
* @resourceProfileRange: 数组，要检测的resource的类型（例如，是检测附件还是图片）
* @userId: 当前用户
* @containerId；包含文件（附件/图片）的主体（article/impeach）
*
* return: boolean
* */
async function ifEnoughResource_async({requiredResource,resourceProfileRange,userId,containerId}){
    for(let singleResourceProfileRange of resourceProfileRange){
        //1. 根据resourceProfileRange获得对应的当前可用的 资源配置文件（valid resourceProfile）
        let resourceProfile=await findValidResourceProfiles_async({singleResourceProfileRange:singleResourceProfileRange})
        //2. 根据resourceProfileRange和（或） userId/containerId，获得当前使用资源量
        let usedResource,spaceExceedFlag,numExceedFlag
        switch (singleResourceProfileRange){
            case e_resourceProfileRange.ATTACHMENT_PER_ARTICLE:
                usedResource=await calcArticleResourceUsage_async({singleResourceProfileRange:singleResourceProfileRange,articleId:containerId})
                spaceExceedFlag=ifSpaceExceed({currentUsedSpace:usedResource[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB],requiredSpace:requiredResource[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB],resourceProfileRecord:[e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]})
                if(true===spaceExceedFlag){
                    //如果超出，将所有文件都删除（需要用户取舍后重新上传）
                    deleteFiles({arr_fileAbsPath:requiredResource.filesAbsPath})
                    return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.articleAttachmentDiskUsageExceed({resourceProfileRangeSizeInMb:resourceProfile[e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]}))
                }

                numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:[e_field.RESOURCE_PROFILE.MAX_NUM]})
                if(true===numExceedFlag){
                    deleteFiles({arr_fileAbsPath:requiredResource.filesAbsPath})
                    return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.articleAttachmentNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                }
                break;
            case e_resourceProfileRange.IMAGE_PER_ARTICLE:
                usedResource=await calcArticleResourceUsage_async({singleResourceProfileRange:singleResourceProfileRange,articleId:containerId})
                spaceExceedFlag=ifSpaceExceed({currentUsedSpace:usedResource[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB],requiredSpace:requiredResource[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB],resourceProfileRecord:[e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]})
                if(true===spaceExceedFlag){
                    deleteFiles({arr_fileAbsPath:requiredResource.filesAbsPath})
                    return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.articleImageDiskUsageExceed({resourceProfileRangeSizeInMb:resourceProfile[e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]}))
                }

                numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:[e_field.RESOURCE_PROFILE.MAX_NUM]})
                if(true===numExceedFlag){
                    deleteFiles({arr_fileAbsPath:requiredResource.filesAbsPath})
                    return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.articleImageNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                }
                break
            case e_resourceProfileRange.WHOLE_RESOURCE_PER_PERSON_FOR_ALL_ARTICLE:
                usedResource=await calcUserTotalResourceUsage_async({userId:userId})
                spaceExceedFlag=ifSpaceExceed({currentUsedSpace:usedResource[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB],requiredSpace:requiredResource[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB],resourceProfileRecord:[e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]})
                if(true===spaceExceedFlag){
                    deleteFiles({arr_fileAbsPath:requiredResource.filesAbsPath})
                    return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.userTotalDiskUsageExceed({resourceProfileRangeSizeInMb:resourceProfile[e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]}))
                }
                numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:[e_field.RESOURCE_PROFILE.MAX_NUM]})
                if(true===numExceedFlag){
                    deleteFiles({arr_fileAbsPath:requiredResource.filesAbsPath})
                    return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.userTotalFileNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                }
                break
            case e_resourceProfileRange.FOLDER_NUM:
                usedResource=await calcFolderNum_async({userId:userId})
                //folder只要检测数量
                numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:[e_field.RESOURCE_PROFILE.MAX_NUM]})
                if(true===numExceedFlag){
                    return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.totalFolderNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                }
                break
            default:
                ap.err(`ResourceProfileRange ${singleResourceProfileRange} no related method to calc resource usage`)
        }


    }
    //无需返回，只要不是reject即可
    return Promise.resolve()
}




module.exports={
    // findValidResourceProfiles_async, //查找用户当前使用的Profile
    // calcArticleResourceUsage_async,//计算单个article的附件/图片使用情况
    // calcUserTotalResourceUsage_async,//计算用户中的使用情况
    ifEnoughResource_async,
}