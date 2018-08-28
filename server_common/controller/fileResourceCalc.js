/**
 * Created by 张伟 on 2018/6/12.
 * 用来计算 已经使用的 文件资源（数量和大小）
 */
'use strict'
/**********************************************************/
/******************  第三方函数     ***********************/
/**********************************************************/
const ap=require('awesomeprint')
const fs=require('fs')

/**********************************************************/
/******************    公共常量     ***********************/
/**********************************************************/
const e_field=require(`../constant/genEnum/DB_field`).Field
const e_coll=require(`../constant/genEnum/DB_Coll`).Coll
const e_dbModel=require(`../constant/genEnum/dbModel`)

const e_resourceFieldName=require(`../constant/enum/nodeEnum`).ResourceFieldName

const e_resourceRange=require('../constant/enum/mongoEnum').ResourceRange.DB
/**********************************************************/
/******************    公共函数     ***********************/
/**********************************************************/
const deleteFiles=require('../function/assist/file').deleteFiles
const recordInternalError_async=require('../function/supervisor/supervisor').recordInternalError_async
/**********************************************************/
/******************  db操作函数     ***********************/
/**********************************************************/
const common_operation_model=require('../model/mongo/operation/common_operation_model')

/**********************************************************/
/******************  error 定义    ***********************/
/**********************************************************/
const helperError=require('../constant/error/controller/helperError')











/**********************************************************************************/
/**********************             total          *******************************/
/**********************************************************************************/
/*  直接读取user_resource_static中user的记录（当前记录的num和sizeInMb只包括article的image和attachment）
* */
async function calcUserTotalResourceUsage_async({userId}){
    let condition={
        [e_field.USER_RESOURCE_STATIC.USER_ID]:userId,
        [e_field.USER_RESOURCE_STATIC.RESOURCE_RANGE]:e_resourceRange.WHOLE_FILE_RESOURCE_PER_PERSON,
    }
    // ap.wrn('calcUserTotalResourceUsage_async condition',condition)
    let result=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user_resource_static,condition:condition})
    // ap.wrn('calcUserTotalResourceUsage_async result',result)
    if(0===result.length){
        await recordInternalError_async({})
        return Promise.reject(helperError.resourceCheck.calcUserTotalResourceUsage_async.userNotExistCantGetUsage)
    }

    return Promise.resolve({[e_resourceFieldName.USED_NUM]:result[0][e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_NUM],[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB]:result[0][e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_SIZE_IN_MB]})
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
    // ap.inf('articleId',articleId)
    let articleRecord=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.article,id:articleId})
    // ap.inf('calcArticleResourceUsage_async articleRecord',articleRecord)
    if(null===articleRecord){
        return Promise.reject(helperError.resourceCheck.calcArticleResourceUsage_async.articleNotExistCantCalcResource)
    }
    //为每个resourceProfileRange获得统计信息
    // for(let singleResourceProfileRange of arr_resourceProfileRange){
    // ap.inf('calcArticleResourceUsage_async singleResourceProfileRange',singleResourceProfileRange)
    // ap.inf('calcArticleResourceUsage_async e_resourceRange.ATTACHMENT_PER_ARTICLE',e_resourceRange.ATTACHMENT_PER_ARTICLE)
    switch (singleResourceProfileRange){
        case e_resourceRange.IMAGE_PER_ARTICLE:
            // result[singleResourceProfileRange]={
            result={
                [e_resourceFieldName.USED_NUM]:articleRecord[e_field.ARTICLE.IMAGES_NUM],
                [e_resourceFieldName.DISK_USAGE_SIZE_IN_MB]:articleRecord[e_field.ARTICLE.IMAGES_SIZE_IN_MB],
            }
            break;
        case e_resourceRange.ATTACHMENT_PER_ARTICLE:
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
/*********************           impeach  resource       *************************/
/**********************************************************************************/
//查询单个impeach或者impeachComment使用的资源
async function calcImageResourcePerImpeachOrComment_async({userId,containerId}){
    //通过盲检（先impeach后impeachComment）

    let condition={
        [e_field.IMPEACH.ID]:containerId,
        // [e_field.IMPEACH.CREATOR_ID]:userId,
        // [e_field.IMPEACH.CURRENT_STATE]:e_impeachState.EDITING,
        // 'dDate':{$exists:false},
    }
    let impeachResource=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.impeach,id:containerId})
    if(null!==impeachResource){
        return Promise.resolve({[e_resourceFieldName.USED_NUM]:impeachResource[e_field.IMPEACH.IMAGES_NUM],[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB]:impeachResource[e_field.IMPEACH.IMAGES_SIZE_IN_MB]})
    }

    //不是impeach，那么到impeachComment中查找
    let impeachCommentResource=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.impeach_comment,id:containerId})
    if(null!==impeachResource){
        return Promise.resolve({[e_resourceFieldName.USED_NUM]:impeachCommentResource[e_field.IMPEACH_COMMENT.IMAGES_NUM],[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB]:impeachCommentResource[e_field.IMPEACH_COMMENT.IMAGES_SIZE_IN_MB]})
    }

    return Promise.reject(helperError.resourceCheck.calcResourcePerImpeachOrComment_async.noMatchImpeachOrCommentToCalcImage)
}

async function calcAttachmentResourcePerImpeachOrComment_async({userId,containerId}){
    //attachment只能impeach有

    let condition={
        [e_field.IMPEACH.ID]:containerId,
        // [e_field.IMPEACH.CREATOR_ID]:userId,
        // [e_field.IMPEACH.CURRENT_STATE]:e_impeachState.EDITING,
        // 'dDate':{$exists:false},
    }
    let impeachResource=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.impeach,id:containerId})
    if(null!==impeachResource){
        return Promise.resolve({[e_resourceFieldName.USED_NUM]:impeachResource[e_field.IMPEACH.ATTACHMENTS_NUM],[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB]:impeachResource[e_field.IMPEACH.ATTACHMENTS_SIZE_IN_MB]})
    }

    return Promise.reject(helperError.resourceCheck.calcResourcePerImpeachOrComment_async.noMatchImpeachToCalcAttachment)
}

//普通用户在整个impeach过程中使用的图片资源统计(管理员用户不做统计，默认是合格的)
async function calcImageResourcePerNormalUserInWholeImpeach_async({userId,impeachId}){
    let result={
        [e_resourceFieldName.USED_NUM]:0,
        [e_resourceFieldName.DISK_USAGE_SIZE_IN_MB]:0
    }
    //首先查找impeach
    let condition={
        [e_field.IMPEACH.ID]:impeachId,
    }
    let impeachResource=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.impeach,id:impeachId})
    if(null!==impeachResource){
        result[e_resourceFieldName.USED_NUM]+=impeachResource[e_field.IMPEACH.IMAGES_NUM]
        result[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB]+=impeachResource[e_field.IMPEACH.IMAGES_SIZE_IN_MB]
    }

    //然后查找impeachComment
    let aggregateParams={
        'match':{
            [e_field.IMPEACH_COMMENT.IMPEACH_ID]:impeachId,
            [e_field.IMPEACH_COMMENT.AUTHOR_ID]:userId,
        },
        'project':{},//{field1:1,field2:0}
        'group':{
            // _id:`$${[e_field.IMPEACH_COMMENT.IMPEACH_ID]}`,
            _id:null,
            [e_resourceFieldName.DISK_USAGE_SIZE_IN_MB]:{$sum:`$${e_field.IMPEACH_COMMENT.IMAGES_SIZE_IN_MB}`},
            [e_resourceFieldName.USED_NUM]:{$sum:`$${e_field.IMPEACH_COMMENT.IMAGES_NUM}`}
        },
        'sort':{},
    }
    let impeachCommentResource=await common_operation_model.group_async({dbModel:e_dbModel.impeach_comment,aggregateParams:aggregateParams})
    if(null!==impeachCommentResource[e_resourceFieldName.USED_NUM]){
        result[e_resourceFieldName.USED_NUM]+=impeachCommentResource[e_field.IMPEACH.IMAGES_NUM]
        result[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB]+=impeachCommentResource[e_field.IMPEACH.IMAGES_SIZE_IN_MB]
    }

    return Promise.resolve(result)
    // return Promise.reject(helperError.resourceCheck.calcResourcePerImpeachOrComment_async.noMatchImpeachToCalcAttachment)
}

//整个impeach过程中使用的图片资源统计
async function calcImageResourceInWholeImpeach_async({userId,impeachId}){
    let result={
        [e_resourceFieldName.USED_NUM]:0,
        [e_resourceFieldName.DISK_USAGE_SIZE_IN_MB]:0
    }
    //首先查找impeach
    let condition={
        [e_field.IMPEACH.ID]:impeachId,
    }
    let impeachResource=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.impeach,id:impeachId})
    if(null!==impeachResource){
        result[e_resourceFieldName.USED_NUM]+=impeachResource[e_field.IMPEACH.IMAGES_NUM]
        result[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB]+=impeachResource[e_field.IMPEACH.IMAGES_SIZE_IN_MB]
    }

    //然后查找impeachComment
    let aggregateParams={
        'match':{
            [e_field.IMPEACH_COMMENT.IMPEACH_ID]:impeachId,
            // [e_field.IMPEACH_COMMENT.AUTHOR_ID]:userId,
        },
        'project':{},//{field1:1,field2:0}
        'group':{
            // _id:`$${[e_field.IMPEACH_COMMENT.IMPEACH_ID]}`,
            _id:null,
            [e_resourceFieldName.DISK_USAGE_SIZE_IN_MB]:{$sum:`$${e_field.IMPEACH_COMMENT.IMAGES_SIZE_IN_MB}`},
            [e_resourceFieldName.USED_NUM]:{$sum:`$${e_field.IMPEACH_COMMENT.IMAGES_NUM}`}
        },
        'sort':{},
    }
    let impeachCommentResource=await common_operation_model.group_async({dbModel:e_dbModel.impeach_comment,aggregateParams:aggregateParams})
    if(null!==impeachCommentResource[e_resourceFieldName.USED_NUM]){
        result[e_resourceFieldName.USED_NUM]+=impeachCommentResource[e_field.IMPEACH.IMAGES_NUM]
        result[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB]+=impeachCommentResource[e_field.IMPEACH.IMAGES_SIZE_IN_MB]
    }

    return Promise.resolve(result)
    // return Promise.reject(helperError.resourceCheck.calcResourcePerImpeachOrComment_async.noMatchImpeachToCalcAttachment)
}

module.exports={
    calcUserTotalResourceUsage_async,
    calcArticleResourceUsage_async,

    calcImageResourcePerImpeachOrComment_async,
    calcAttachmentResourcePerImpeachOrComment_async,
    calcImageResourcePerNormalUserInWholeImpeach_async,
    calcImageResourceInWholeImpeach_async,
}