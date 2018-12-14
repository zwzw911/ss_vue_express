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
/**********************************************************/
/******************  公共常量     ***********************/
/**********************************************************/
const e_resourceFieldName=require(`../constant/enum/nodeEnum`).ResourceFieldName
const e_resourceConfigFieldName=require(`../constant/enum/nodeEnum`).ResourceConfigFieldName


const e_resourceRange=require(`../constant/enum/mongoEnum`).ResourceRange.DB
/**********************************************************/
/******************  普通函数     ***********************/
/**********************************************************/
const fileResourceCalc=require('./fileResourceCalc')
const numOnlyResourceCalc=require('./numOnlyResourceCalc')
const recordInternalError_async=require('../function/supervisor/supervisor').recordInternalError_async

/**********************************************************/
/******************  db操作函数     ***********************/
/**********************************************************/
const common_operation_model=require('../model/mongo/operation/common_operation_model')

/**********************************************************/
/******************  error 定义    ***********************/
/**********************************************************/
const helperError=require('../constant/error/controller/helperError')




/**     根据数值判断是否为 文件资源的计算（数量和size）
 *  return：boolean
 * **/
function ifCalcFileResource({singleResourceRange}) {
    if(parseInt(singleResourceRange)>0 && parseInt(singleResourceRange)<100){
        return true
    }
    if(parseInt(singleResourceRange)>=100 ){
        return false
    }
}
/*  为arr_resourceProfileRange中的每个resourceRange，获得当前valida的user_resource_profile(basic或者advanced)，并最终找到对应的resourceProfile
* @singleResourceProfileRange；需要获得profile的resource
* @userId：对哪个用户的resource检索profile
*
* return：singleResourceProfileRange对应的一条记录
* */
async function findValidResourceProfiles_async({singleResourceProfileRange,userId}){
    // ap.inf('findValidResourceProfiles_async in')
    let validUserResourceProfileRecord //userResourceProfile中的一个记录
    //为每种resourceProfileRange查找valida的resourceProfile
    // for(let singleResourceProfileRange of arr_resourceProfileRange){
    let condition={"$and":[{'dDate':{$exists:false}}]}
    // ap.inf('findValidResourceProfiles_async->condition',condition)
    //首先在resourceProfile中，根据resourceRange查找所有对应的resourceProfile（包括所有type（当前为basic和advanced））
    condition["$and"].push({[e_field.RESOURCE_PROFILE.RESOURCE_RANGE]:singleResourceProfileRange})
    // ap.inf('findValidResourceProfiles_async->condition',condition)
    let resourceProfileResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.resource_profile,condition:condition})
    // ap.inf('findValidResourceProfiles_async->resourceProfileResult',resourceProfileResult)
    //根据所有查找到的resourceProfile id，在user_profile查找所有对应的，且尚未过期的记录
    let currentDate=new Date()
    let userResourceProfileCondition={"$and":[
            {[e_field.USER_RESOURCE_PROFILE.RESOURCE_PROFILE_ID]:{'$in':[]}},
            {[e_field.USER_RESOURCE_PROFILE.END_DATE]:{$gt:currentDate}},
            // {[e_field.USER_RESOURCE_PROFILE.START_DATE]:{$gt:currentDate}},
            {[e_field.USER_RESOURCE_PROFILE.USER_ID]:userId},
        ]}
    let userResourceProfileSelectFields='-uDate' //包含所有field的值
    let option={$sort:{[e_field.USER_RESOURCE_PROFILE.ID]:-1}} //按照cDate递减，方便返回结果取值（idx=0为第一条）
    // ap.inf('findValidResourceProfiles_async->userResourceProfileCondition',userResourceProfileCondition)
    for(let idx in resourceProfileResult){
        let singleResourceProfileResult=resourceProfileResult[idx]
        //ap.inf('singleResourceProfileResult',singleResourceProfileResult)
        //ap.inf('userResourceProfileCondition["$and"][0][\'$in\']',userResourceProfileCondition["$and"][0][e_field.USER_RESOURCE_PROFILE.RESOURCE_PROFILE_ID]['$in'])
        userResourceProfileCondition["$and"][0][e_field.USER_RESOURCE_PROFILE.RESOURCE_PROFILE_ID]['$in'].push(singleResourceProfileResult[e_field.RESOURCE_PROFILE.ID])
    }
    // ap.inf('findValidResourceProfiles_async->userResourceProfileCondition',userResourceProfileCondition)
    let validResultForSingleResourceProfileRange=await common_operation_model.find_returnRecords_async({
        dbModel:e_dbModel.user_resource_profile,
        selectedFields:userResourceProfileSelectFields,
        options:option,
        condition:userResourceProfileCondition
    })
    // ap.wrn('findValidResourceProfiles_async->validResultForSingleResourceProfileRange',validResultForSingleResourceProfileRange)
    //根据返回记录的数量判断valida的profile id
    if(0===validResultForSingleResourceProfileRange.length){
        await recordInternalError_async({})
        return Promise.reject(helperError.resourceCheck.findValidResourceProfiles_async.userHasNoProfileForProFileRange({profileRange:singleResourceProfileRange}))
    }
    //返回最后一条记录（如果只有一条，那就返回第一条（basic），多天返回advanced）
    else{
        validUserResourceProfileRecord=validResultForSingleResourceProfileRange[0]//因为是按照id递减排列的，所以第一条为valid
    }
    // }

    let validResourceProfileRecord=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.resource_profile,id:validUserResourceProfileRecord[e_field.USER_RESOURCE_PROFILE.RESOURCE_PROFILE_ID]})
    return Promise.resolve(validResourceProfileRecord)
}

//
function ifSpaceExceed({currentUsedSpace,requiredSpace,resourceProfileRecord}){
    // ap.inf('resourceProfileRecord',resourceProfileRecord)
    // ap.inf('currentUsedSpace',currentUsedSpace)
    return currentUsedSpace+requiredSpace > resourceProfileRecord[e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]
}
function ifNumExceed({currentUsedNum,requiredNum,resourceProfileRecord}){
    // ap.inf('currentUsedNum',currentUsedNum)
    // ap.inf('requiredNum',requiredNum)
    // ap.inf('resourceProfileRecord',resourceProfileRecord)
    return currentUsedNum+requiredNum > resourceProfileRecord[e_field.RESOURCE_PROFILE.MAX_NUM]
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
    // ap.inf('requiredResource',requiredResource)
    // ap.inf('resourceProfileRange',resourceProfileRange)
    // ap.inf('userId',userId)
    for(let singleResourceProfileRange of resourceProfileRange){
        // ap.inf('singleResourceProfileRange',singleResourceProfileRange)
        //1. 根据resourceProfileRange获得对应的当前可用的 资源配置文件（valid resourceProfile）
        let resourceProfile=await findValidResourceProfiles_async({singleResourceProfileRange:singleResourceProfileRange,userId:userId})
        // ap.wrn('valida resourceProfile',resourceProfile)
        //2. 根据resourceProfileRange和（或） userId/containerId，获得当前使用资源量
        let usedResource,spaceExceedFlag,numExceedFlag//,


        let fileResourceFlag=ifCalcFileResource({singleResourceRange:singleResourceProfileRange})//是否统计文件资源（需要计算SIZE）
        /**     对文件进行资源判定       **/
        if(true===fileResourceFlag){
            // ap.inf('fileResourceFlag true singleResourceProfileRange',singleResourceProfileRange)
            // ap.inf('e_resourceRange.ATTACHMENT_PER_ARTICLE',e_resourceRange.ATTACHMENT_PER_ARTICLE)
            switch (singleResourceProfileRange){
                case e_resourceRange.ATTACHMENT_PER_ARTICLE:
                    // ap.inf('ATTACHMENT_PER_ARTICLE in')
                    usedResource=await fileResourceCalc.calcArticleResourceUsage_async({singleResourceProfileRange:singleResourceProfileRange,articleId:containerId})
                    // ap.inf('usedResource',usedResource)
                    // ap.inf('usedResource',usedResource)
                    spaceExceedFlag=ifSpaceExceed({currentUsedSpace:usedResource[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB],requiredSpace:requiredResource[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB],resourceProfileRecord:resourceProfile})
                    if(true===spaceExceedFlag){
                        //如果超出，将所有文件都删除（需要用户取舍后重新上传）
                        deleteFiles({arr_fileAbsPath:requiredResource[e_resourceFieldName.FILE_ABS_PATH]})
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.articleAttachmentDiskUsageExceed({resourceProfileRangeSizeInMb:resourceProfile[e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]}))
                    }

                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    if(true===numExceedFlag){
                        // ap.inf('attachment num exceed')
                        // ap.inf('requiredResource[e_resourceFieldName.FILE_ABS_PATH]',requiredResource[e_resourceFieldName.FILE_ABS_PATH])
                        deleteFiles({arr_fileAbsPath:requiredResource[e_resourceFieldName.FILE_ABS_PATH]})
                        // ap.inf('delete done')
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.articleAttachmentNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    // ap.inf('ATTACHMENT_PER_ARTICLE done')
                    break;
                case e_resourceRange.IMAGE_PER_ARTICLE:
                    usedResource=await fileResourceCalc.calcArticleResourceUsage_async({singleResourceProfileRange:singleResourceProfileRange,articleId:containerId})
                    spaceExceedFlag=ifSpaceExceed({currentUsedSpace:usedResource[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB],requiredSpace:requiredResource[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB],resourceProfileRecord:resourceProfile})
                    if(true===spaceExceedFlag){
                        deleteFiles({arr_fileAbsPath:requiredResource[e_resourceFieldName.FILE_ABS_PATH]})
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.articleImageDiskUsageExceed({resourceProfileRangeSizeInMb:resourceProfile[e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]}))
                    }

                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    if(true===numExceedFlag){
                        deleteFiles({arr_fileAbsPath:requiredResource[e_resourceFieldName.FILE_ABS_PATH]})
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.articleImageNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    break
                case e_resourceRange.WHOLE_FILE_RESOURCE_PER_PERSON:
                    // ap.inf('ifEnoughResource_async WHOLE_FILE_RESOURCE_PER_PERSON in')
                    usedResource=await fileResourceCalc.calcUserTotalResourceUsage_async({userId:userId})
                    // ap.inf('usedResource',usedResource)
                    spaceExceedFlag=ifSpaceExceed({currentUsedSpace:usedResource[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB],requiredSpace:requiredResource[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB],resourceProfileRecord:resourceProfile})
                    if(true===spaceExceedFlag){
                        deleteFiles({arr_fileAbsPath:requiredResource[e_resourceFieldName.FILE_ABS_PATH]})
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.userTotalDiskUsageExceed({resourceProfileRangeSizeInMb:resourceProfile[e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]}))
                    }
                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    if(true===numExceedFlag){
                        deleteFiles({arr_fileAbsPath:requiredResource[e_resourceFieldName.FILE_ABS_PATH]})
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.userTotalFileNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    // ap.inf('WHOLE_FILE_RESOURCE_PER_PERSON done')
                    break
                /****     举报图片资源      ****/
                case e_resourceRange.IMAGE_PER_IMPEACH_OR_COMMENT:
                    usedResource=await fileResourceCalc.calcImageResourcePerImpeachOrComment_async({userId:userId,containerId:containerId})
                    spaceExceedFlag=ifSpaceExceed({currentUsedSpace:usedResource[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB],requiredSpace:requiredResource[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB],resourceProfileRecord:resourceProfile})
                    if(true===spaceExceedFlag){
                        deleteFiles({arr_fileAbsPath:requiredResource[e_resourceFieldName.FILE_ABS_PATH]})
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.impeachImageDiskUsageExceed({resourceProfileRangeSizeInMb:resourceProfile[e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]}))
                    }
                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    if(true===numExceedFlag){
                        deleteFiles({arr_fileAbsPath:requiredResource[e_resourceFieldName.FILE_ABS_PATH]})
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.impeachImageNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    break;
                case e_resourceRange.ATTACHMENT_PER_IMPEACH:
                    usedResource=await fileResourceCalc.calcAttachmentResourcePerImpeachOrComment_async({userId:userId,containerId:containerId})
                    spaceExceedFlag=ifSpaceExceed({currentUsedSpace:usedResource[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB],requiredSpace:requiredResource[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB],resourceProfileRecord:resourceProfile})
                    if(true===spaceExceedFlag){
                        deleteFiles({arr_fileAbsPath:requiredResource[e_resourceFieldName.FILE_ABS_PATH]})
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.impeachAttachmentDiskUsageExceed({resourceProfileRangeSizeInMb:resourceProfile[e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]}))
                    }
                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    if(true===numExceedFlag){
                        deleteFiles({arr_fileAbsPath:requiredResource[e_resourceFieldName.FILE_ABS_PATH]})
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.impeachAttachmentNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    break;
                case e_resourceRange.IMAGE_PER_USER_IN_WHOLE_IMPEACH:
                    usedResource=await fileResourceCalc.calcImageResourcePerNormalUserInWholeImpeach_async({userId:userId,containerId:containerId})
                    spaceExceedFlag=ifSpaceExceed({currentUsedSpace:usedResource[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB],requiredSpace:requiredResource[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB],resourceProfileRecord:resourceProfile})
                    if(true===spaceExceedFlag){
                        deleteFiles({arr_fileAbsPath:requiredResource[e_resourceFieldName.FILE_ABS_PATH]})
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.impeachImageDiskUsagePerUserInWholeImpeachExceed({resourceProfileRangeSizeInMb:resourceProfile[e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]}))
                    }
                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    if(true===numExceedFlag){
                        deleteFiles({arr_fileAbsPath:requiredResource[e_resourceFieldName.FILE_ABS_PATH]})
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.impeachImageNumPerUserInWholeImpeachExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    break;
                case e_resourceRange.IMAGE_IN_WHOLE_IMPEACH:
                    usedResource=await fileResourceCalc.calcImageResourceInWholeImpeach_async({userId:userId,containerId:containerId})
                    spaceExceedFlag=ifSpaceExceed({currentUsedSpace:usedResource[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB],requiredSpace:requiredResource[e_resourceFieldName.DISK_USAGE_SIZE_IN_MB],resourceProfileRecord:resourceProfile})
                    if(true===spaceExceedFlag){
                        deleteFiles({arr_fileAbsPath:requiredResource[e_resourceFieldName.FILE_ABS_PATH]})
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.impeachImageDiskUsageInWholeImpeachExceed({resourceProfileRangeSizeInMb:resourceProfile[e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]}))
                    }
                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    if(true===numExceedFlag){
                        deleteFiles({arr_fileAbsPath:requiredResource[e_resourceFieldName.FILE_ABS_PATH]})
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.impeachImageNumInWholeImpeachExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    break;
            }
        }

        /**     对数量判定       **/
        // ap.wrn('fileResourceFlag',fileResourceFlag)
        if(false===fileResourceFlag){
            switch (singleResourceProfileRange){


                case e_resourceRange.MAX_FOLDER_NUM_PER_USER:
                    // ap.inf('MAX_FOLDER_NUM_PER_USER')
                    usedResource=await numOnlyResourceCalc.calcFolderNum_async({userId:userId})
                    // ap.inf('usedResource',usedResource)
                    // ap.inf('resourceProfile',resourceProfile)
                    //folder只要检测数量
                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    if(true===numExceedFlag){
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.totalFolderNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    break
                /**     friend  group       **/
                case e_resourceRange.MAX_FRIEND_GROUP_NUM_PER_USER:
                    usedResource=await numOnlyResourceCalc.calcUserFriendGroupNum_async({userId:userId,containerId:containerId})
                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    if(true===numExceedFlag){
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.totalUserFriendGroupNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    break

                /**     add friend      **/
                case e_resourceRange.MAX_FRIEND_NUM_PER_USER:
                    usedResource=await numOnlyResourceCalc.calcFriendNumPerUser_async({userId:userId,containerId:containerId})
                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    if(true===numExceedFlag){
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.totalUserFriendNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    break
                case e_resourceRange.MAX_UNTREATED_ADD_FRIEND_REQUEST_PER_USER:
                    usedResource=await numOnlyResourceCalc.calcUntreatedFriendRequestNum_async({userId:userId})
                    // ap.inf('usedResource',usedResource)
                    // ap.inf('resourceProfile',resourceProfile)
                    //只要检测数量
                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    if(true===numExceedFlag){
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.totalFolderNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    break;
                    /**     文档      **/
                case e_resourceRange.MAX_NEW_ARTICLE_PER_USER:
                    usedResource=await numOnlyResourceCalc.calcNewArticleNum_async({userId:userId})
                    // ap.inf('usedResource',usedResource)
                    // ap.inf('resourceProfile',resourceProfile)
                    //只要检测数量
                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    if(true===numExceedFlag){
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.totalNewArticleNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    break;
                case e_resourceRange.MAX_ARTICLE_PER_USER:
                    usedResource=await numOnlyResourceCalc.calcArticleNum_async({userId:userId})
                    // ap.inf('usedResource',usedResource)
                    // ap.inf('resourceProfile',resourceProfile)
                    //只要检测数量
                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    if(true===numExceedFlag){
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.totalArticleNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    break;
                case e_resourceRange.MAX_COMMENT_PER_ARTICLE:
                    usedResource=await numOnlyResourceCalc.calcCommentPerArticleNum_async({userId:userId,con:containerId})
                    // ap.inf('usedResource',usedResource)
                    // ap.inf('resourceProfile',resourceProfile)
                    //只要检测数量
                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    if(true===numExceedFlag){
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.totalCommentPerArticleNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    break;
                case e_resourceRange.MAX_COMMENT_PER_ARTICLE_PER_USER:
                    usedResource=await numOnlyResourceCalc.calcCommentPerArticlePerUserNum_async({userId:userId,containerId:containerId})
                    // ap.inf('usedResource',usedResource)
                    // ap.inf('resourceProfile',resourceProfile)
                    //只要检测数量
                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    if(true===numExceedFlag){
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.totalCommentPerArticlePerUserNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    break;
                /****     举报数量      ****/
                case e_resourceRange.MAX_SIMULTANEOUS_NEW_OR_EDITING_IMPEACH_PER_USER:
                    usedResource=await numOnlyResourceCalc.calcSimultaneousNewOrEditingImpeachNum_async({userId:userId,containerId:containerId})
                    // ap.wrn('usedResource',usedResource)
                    // ap.wrn('resourceProfile',resourceProfile)
                    //只要检测数量
                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    if(true===numExceedFlag){
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.totalNewOrEditingImpeachNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    break;
                case e_resourceRange.MAX_REVOKE_IMPEACH_PER_USER:
                    usedResource=await numOnlyResourceCalc.calcRevokeImpeachNum_async({userId:userId,containerId:containerId})
                    // ap.inf('usedResource',usedResource)
                    // ap.inf('resourceProfile',resourceProfile)
                    //只要检测数量
                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    if(true===numExceedFlag){
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.totalRevokeImpeachNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    break;
                case e_resourceRange.MAX_SIMULTANEOUS_WAIT_FOR_ASSIGN_IMPEACH_PER_USER:
                    usedResource=await numOnlyResourceCalc.calcSimultaneousWaitAssignImpeachNum_async({userId:userId,containerId:containerId})
                    // ap.wrn('usedResource',usedResource)
                    // ap.wrn('resourceProfile',resourceProfile)
                    //只要检测数量
                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    if(true===numExceedFlag){
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.totalWaitAssignImpeachNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    break;
                    /**     impeach comment num         **/
                case e_resourceRange.MAX_COMMENT_PER_IMPEACH_PER_USER:
                    usedResource=await numOnlyResourceCalc.calcImpeachCommentPerUserNum_async({userId:userId,containerId:containerId})
                    // ap.wrn('usedResource',usedResource)
                    // ap.wrn('resourceProfile',resourceProfile)
                    //只要检测数量
                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    if(true===numExceedFlag){
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.totalImpeachCommentPerUserNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    break;
                /**     public group num && member num per group         **/
                case e_resourceRange.MAX_PUBLIC_GROUP_NUM:
                    usedResource=await numOnlyResourceCalc.calcPublicGroupNum_async({userId:userId,containerId:containerId})
                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    if(true===numExceedFlag){
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.totalPublicGroupPerUserNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    break;
                case e_resourceRange.MAX_MEMBER_PER_GROUP:
                    usedResource=await numOnlyResourceCalc.calcMemberPerPublic_async({userId:userId,containerId:containerId})
                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    if(true===numExceedFlag){
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.totalMemberPerPublicGroupNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    break

                case e_resourceRange.MAX_DECLINE_JOIN_REQUEST:
                    usedResource=await numOnlyResourceCalc.calcJoinPublicGroupDeclineNum_async({userId:userId,containerId:containerId})
                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    if(true===numExceedFlag){
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.totalJoinPubliGroupDeclineNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    break
                case e_resourceRange.MAX_SEND_RECOMMENDS:
                    usedResource=await numOnlyResourceCalc.calcSendRecommends_async({userId:userId,containerId:containerId})
                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    if(true===numExceedFlag){
                        // ap.err('heer')
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.totalSendRecommendNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    break
                case e_resourceRange.MAX_READ_RECEIVE_RECOMMENDS:
                    usedResource=await numOnlyResourceCalc.calcReadReceivedRecommends_async({userId:userId,containerId:containerId})
                    numExceedFlag=ifNumExceed({currentUsedNum:usedResource[e_resourceFieldName.USED_NUM],requiredNum:requiredResource[e_resourceFieldName.USED_NUM],resourceProfileRecord:resourceProfile})
                    ap.err('numExceedFlag',numExceedFlag)
                    if(true===numExceedFlag){
                        ap.err('heer')
                        return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.totalReadReceivedRecommendNumExceed({resourceProfileNum:resourceProfile[e_field.RESOURCE_PROFILE.MAX_NUM]}))
                    }
                    break

                default:
                    return Promise.reject(helperError.resourceCheck.ifEnoughResource_async.noHandleCodeProfileRange())
                //ap.err(`ResourceRange ${singleResourceProfileRange} no related method to calc resource usage`)
            }
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