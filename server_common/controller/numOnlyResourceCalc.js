/**
 * Created by 张伟 on 2018/6/12.
 * 用来计算 已经使用的 记录数资源
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

const e_impeachState=require('../constant/enum/mongoEnum').ImpeachState.DB
const e_addFriendStatus=require('../constant/enum/mongoEnum').AddFriendStatus.DB
const e_articleStatus=require('../constant/enum/mongoEnum').ArticleStatus.DB
const e_joinPublicGroupHandleResult=require('../constant/enum/mongoEnum').JoinPublicGroupHandleResult.DB
// const e_toBeFriendHandleResult=require('../constant/enum/mongoEnum').ToBeFriendHandleResult.DB

const e_resourceFieldName=require(`../constant/enum/nodeEnum`).ResourceFieldName
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
    return Promise.resolve({[e_resourceFieldName.USED_NUM]:folderNum})
}
/**********************************************************************************/
/**********************         user friend group     ****************************/
/**********************************************************************************/
//最大朋友群数量
async function calcUserFriendGroupNum_async({userId,containerId}){
    let condition={
        [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:userId,
        // [e_field.USER_FRIEND_GROUP.PUBLIC_GROUP_ID]:containerId,
        // [e_field.USER_FRIEND_GROUP.HANDLE_RESULT]:e_joinPublicGroupHandleResult.DECLINE,
        'dDate':{$exists:false},
    }
    let num=await common_operation_model.count_async({dbModel:e_dbModel.user_friend_group,condition:condition})
    return Promise.resolve({[e_resourceFieldName.USED_NUM]:num})
}
/**********************************************************************************/
/**********************      max add friend request   ****************************/
/**********************************************************************************/
/*  计算当前未处理的添加用户的请求数
* */
async function calcUntreatedFriendRequestNum_async({userId}){
    let condition={
        [e_field.ADD_FRIEND_REQUEST.ORIGINATOR]:userId,
        [e_field.ADD_FRIEND_REQUEST.STATUS]:e_addFriendStatus.UNTREATED,
        'dDate':{$exists:false},
    }
    let untreatedNum=await common_operation_model.count_async({dbModel:e_dbModel.add_friend_request,condition:condition})
    return Promise.resolve({[e_resourceFieldName.USED_NUM]:untreatedNum})
}
/*  计算当前用户的朋友数量(包含default group的数量)
* */
async function calcFriendNumPerUser_async({userId,containerId}){
    // {$match: {username : "Alex"}},
    // {$unwind: "$tags"},
    // {$project: {count:{$add:1}}},
    // {$group: {_id: null, number: {$sum: "$count" }}
    let aggregateParams=[
        {
            '$match':{
                [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:userId,
                // [e_field.IMPEACH_COMMENT.AUTHOR_ID]:userId,
            }
        },
        {
            '$project':{
                'friendNum':{"$size":`$${e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP}`}
            },
        },
            {
                '$group':{
                    _id:null,
                    [e_resourceFieldName.USED_NUM]:{$sum:`$friendNum`}
                }
            },
        {
            '$project':{
                _id:0,
                [e_resourceFieldName.USED_NUM]:1
                }
         },
        // },
    ]

    let untreatedNum=await e_dbModel.user_friend_group.aggregate(aggregateParams)
    // console.log(`group result is ${JSON.stringify(re
    return Promise.resolve({[e_resourceFieldName.USED_NUM]:untreatedNum})
}
/**********************************************************************************/
/**********************           new article        *****************************/
/**********************************************************************************/
/*  计算folder的数量
* */
async function calcNewArticleNum_async({userId}){
    let condition={
        [e_field.ARTICLE.AUTHOR_ID]:userId,
        [e_field.ARTICLE.STATUS]:e_articleStatus.NEW,
        'dDate':{$exists:false},
    }
    let recordNum=await common_operation_model.count_async({dbModel:e_dbModel.article,condition:condition})
    return Promise.resolve({[e_resourceFieldName.USED_NUM]:recordNum})
}
/**********************************************************************************/
/**********************              article        *******************************/
/**********************************************************************************/
/*  计算folder的数量
* */
async function calcArticleNum_async({userId}){
    let condition={
        [e_field.ARTICLE.AUTHOR_ID]:userId,
        'dDate':{$exists:false},
    }
    let recordNum=await common_operation_model.count_async({dbModel:e_dbModel.article,condition:condition})
    return Promise.resolve({[e_resourceFieldName.USED_NUM]:recordNum})
}
/**********************************************************************************/
/**********************       article comment        *****************************/
/**********************************************************************************/
/*  计算article的总评论数量
* */
async function calcCommentPerArticleNum_async({userId,containerId}){
    let condition={
        [e_field.ARTICLE_COMMENT.ARTICLE_ID]:containerId,
        'dDate':{$exists:false},
    }
    let recordNum=await common_operation_model.count_async({dbModel:e_dbModel.article_comment,condition:condition})
    return Promise.resolve({[e_resourceFieldName.USED_NUM]:recordNum})
}
/*  计算article下，当前用户的总评论数量
* */
async function calcCommentPerArticlePerUserNum_async({userId,containerId}){
    let condition={
        [e_field.ARTICLE_COMMENT.AUTHOR_ID]:userId,
        [e_field.ARTICLE_COMMENT.ARTICLE_ID]:containerId,
        'dDate':{$exists:false},
    }
    let recordNum=await common_operation_model.count_async({dbModel:e_dbModel.article_comment,condition:condition})
    return Promise.resolve({[e_resourceFieldName.USED_NUM]:recordNum})
}
/**********************************************************************************/
/**********************              impeach num    *******************************/
/**********************************************************************************/
//计算未结束就被删除（撤销）的举报(防止大量创建后删除)
async function calcRevokeImpeachNum_async({userId,containerId}){
    let condition={
        [e_field.IMPEACH.CREATOR_ID]:userId,
        // [e_field.IMPEACH.CURRENT_STATE]:e_impeachState.EDITING,
        'dDate':{$exists:true},
    }
    let recordNum=await common_operation_model.count_async({dbModel:e_dbModel.impeach,condition:condition})
    return Promise.resolve({[e_resourceFieldName.USED_NUM]:recordNum})
}

/*  计算article的总评论数量
* */
async function calcSimultaneousNewOrEditingImpeachNum_async({userId,containerId}){
    let condition={
        [e_field.IMPEACH.CREATOR_ID]:userId,
        [e_field.IMPEACH.CURRENT_STATE]:{$in:[e_impeachState.NEW,e_impeachState.EDITING]},
        'dDate':{$exists:false},
    }
    let recordNum=await common_operation_model.count_async({dbModel:e_dbModel.impeach,condition:condition})
    // ap.wrn('recordNum',recordNum)
    return Promise.resolve({[e_resourceFieldName.USED_NUM]:recordNum})
}
/*  计算article下，当前用户的总评论数量
* */
async function calcSimultaneousWaitAssignImpeachNum_async({userId,containerId}){
    let condition={
        [e_field.IMPEACH.CREATOR_ID]:userId,
        [e_field.IMPEACH.CURRENT_STATE]:e_impeachState.WAIT_ASSIGN,
        'dDate':{$exists:false},
    }
    let recordNum=await common_operation_model.count_async({dbModel:e_dbModel.article_comment,condition:condition})
    return Promise.resolve({[e_resourceFieldName.USED_NUM]:recordNum})
}

/**********************************************************************************/
/***********             impeach comment num per user     *************************/
/**********************************************************************************/
//计算未结束就被删除（撤销）的举报(防止大量创建后删除)
async function calcImpeachCommentPerUserNum_async({userId,containerId}){
    let condition={
        [e_field.IMPEACH_COMMENT.AUTHOR_ID]:userId,
        [e_field.IMPEACH_COMMENT.IMPEACH_ID]:containerId,
        'dDate':{$exists:true},
    }
    let recordNum=await common_operation_model.count_async({dbModel:e_dbModel.impeach,condition:condition})
    // ap.wrn('calc result',recordNum)
    return Promise.resolve({[e_resourceFieldName.USED_NUM]:recordNum})
}
/**********************************************************************************/
/**********************           public group          ****************************/
/**********************************************************************************/
//计算已经创建的公共群数
async function calcPublicGroupNum_async({userId,containerId}){
    let condition={
        [e_field.PUBLIC_GROUP.CREATOR_ID]:userId,
        // [e_field.IMPEACH_COMMENT.IMPEACH_ID]:containerId,
        // 'dDate':{$exists:true},
    }
    let recordNum=await common_operation_model.count_async({dbModel:e_dbModel.public_group,condition:condition})
    // ap.wrn('calc result',recordNum)
    return Promise.resolve({[e_resourceFieldName.USED_NUM]:recordNum})
}
//计算某个公共群数的人数
async function calcMemberPerPublic_async({userId,containerId}){
/*    let condition={
        [e_field.PUBLIC_GROUP.CREATOR_ID]:userId,
        // [e_field.IMPEACH_COMMENT.IMPEACH_ID]:containerId,
        // 'dDate':{$exists:true},
    }*/
    let record=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.public_group,id:containerId})
    // ap.wrn('calc result',recordNum)
    return Promise.resolve({[e_resourceFieldName.USED_NUM]:record[e_field.PUBLIC_GROUP.MEMBERS_ID].length})
}

/**********************************************************************************/
/**************      max join public group reject request times   *****************/
/**********************************************************************************/
/*  计算用户入群被拒次数
* */
async function calcJoinPublicGroupDeclineNum_async({userId,containerId}){
    let condition={
        [e_field.JOIN_PUBLIC_GROUP_REQUEST.CREATOR_ID]:userId,
        [e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID]:containerId,
        [e_field.JOIN_PUBLIC_GROUP_REQUEST.HANDLE_RESULT]:e_joinPublicGroupHandleResult.DECLINE,
        'dDate':{$exists:false},
    }
    let untreatedNum=await common_operation_model.count_async({dbModel:e_dbModel.add_friend_request,condition:condition})
    return Promise.resolve({[e_resourceFieldName.USED_NUM]:untreatedNum})
}


/**  用户已经分享的文档数量        **/
async function calcSendRecommends_async({userId,containerId}){
    let condition={
        [e_field.SEND_RECOMMEND.SENDER]:userId,
        // [e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID]:containerId,
        // [e_field.JOIN_PUBLIC_GROUP_REQUEST.HANDLE_RESULT]:e_joinPublicGroupHandleResult.DECLINE,
        'dDate':{$exists:false},
    }
    let untreatedNum=await common_operation_model.count_async({dbModel:e_dbModel.send_recommend,condition:condition})
    return Promise.resolve({[e_resourceFieldName.USED_NUM]:untreatedNum})
}
/**  用户已读 分享文档数        **/
async function calcReadReceivedRecommends_async({userId,containerId}){
    let condition={
        [e_field.RECEIVE_RECOMMEND.RECEIVER]:userId,
        // [e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID]:containerId,
        // [e_field.JOIN_PUBLIC_GROUP_REQUEST.HANDLE_RESULT]:e_joinPublicGroupHandleResult.DECLINE,
        'dDate':{$exists:false},
    }
    let result=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.receive_recommend,condition:condition})
    return Promise.resolve({[e_resourceFieldName.USED_NUM]:result[0][e_field.RECEIVE_RECOMMEND.READ_RECOMMENDS_NUM]})
}

/**  用户 现有 收藏夹 数量        **/
async function calcExistsCollectionNum_async({userId,containerId}){
    let condition={
        [e_field.COLLECTION.CREATOR_ID]:userId,
        // [e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID]:containerId,
        // [e_field.JOIN_PUBLIC_GROUP_REQUEST.HANDLE_RESULT]:e_joinPublicGroupHandleResult.DECLINE,
        'dDate':{$exists:false},
    }
    let result=await common_operation_model.count_async({dbModel:e_dbModel.collection,condition:condition})
    return Promise.resolve({[e_resourceFieldName.USED_NUM]:result})
}
async function calcCollectionArticleNum_async({userId,containerId}){
/*    let condition={
        [e_field.COLLECTION.CREATOR_ID]:userId,
        '_id':containerId,
        // [e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID]:containerId,
        // [e_field.JOIN_PUBLIC_GROUP_REQUEST.HANDLE_RESULT]:e_joinPublicGroupHandleResult.DECLINE,
        'dDate':{$exists:false},
    }*/
    let result=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.collection,id:containerId})
    return Promise.resolve({[e_resourceFieldName.USED_NUM]:result[e_field.COLLECTION.ARTICLE_NUM]})
}
async function calcCollectionTopicNum_async({userId,containerId}){
/*    let condition={
        [e_field.COLLECTION.CREATOR_ID]:userId,
        // [e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID]:containerId,
        // [e_field.JOIN_PUBLIC_GROUP_REQUEST.HANDLE_RESULT]:e_joinPublicGroupHandleResult.DECLINE,
        'dDate':{$exists:false},
    }*/
    let result=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.collection,id:containerId})
    return Promise.resolve({[e_resourceFieldName.USED_NUM]:result[e_field.COLLECTION.TOPIC_NUM]})
}
module.exports={
    calcFolderNum_async,

    calcUserFriendGroupNum_async,
    calcUntreatedFriendRequestNum_async,
    calcFriendNumPerUser_async,

    calcNewArticleNum_async,
    calcArticleNum_async,
    calcCommentPerArticleNum_async,
    calcCommentPerArticlePerUserNum_async,
    calcRevokeImpeachNum_async,
    calcSimultaneousNewOrEditingImpeachNum_async,
    calcSimultaneousWaitAssignImpeachNum_async,

    calcImpeachCommentPerUserNum_async,

    // calcAddFriendNum_async,

    calcPublicGroupNum_async,
    calcMemberPerPublic_async,

    calcJoinPublicGroupDeclineNum_async,

    calcSendRecommends_async,
    calcReadReceivedRecommends_async,

    /**     collection      **/
    calcExistsCollectionNum_async,
    calcCollectionArticleNum_async,
    calcCollectionTopicNum_async,
}