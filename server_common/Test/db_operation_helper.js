/**
 * Created by ada on 2017/8/9.
 */
'use strict'
const ap=require(`awesomeprint`)

// const server_common_file_require=require('../../express_admin/server_common_file_require')
const nodeEnum=require(`../constant/enum/nodeEnum`)
const mongoEnum=require(`../constant/enum/mongoEnum`)
const nodeRuntimeEnum=require(`../constant/enum/nodeRuntimeEnum`)

const common_operation_model=require(`../model/mongo/operation/common_operation_model`)
const e_dbModel=require('../constant/genEnum/dbModel')

// const e_part=require('../../server/constant/enum/node').ValidatePart
// const e_method=require('../../server/constant/enum/node').Method
const e_coll=require('../constant/genEnum/DB_Coll').Coll
const e_field=require('../constant/genEnum/DB_field').Field
const dbModelInArray=require('../constant/genEnum/dbModelInArray')

const e_hashType=nodeRuntimeEnum.HashType
const hash=require('../function/assist/crypt').hash //server_common_file_require.crypt.hash

const e_accountType=mongoEnum.AccountType.DB
const e_docStatus=mongoEnum.DocStatus.DB
const e_articleStatus=mongoEnum.ArticleStatus.DB
const e_impeachType=mongoEnum.ImpeachType.DB
const e_impeachState=mongoEnum.ImpeachState.DB
const e_addFriendStatus=mongoEnum.AddFriendStatus.DB

const initSettingObject=require('../constant/genEnum/initSettingObject').iniSettingObject

const regex=require(`../constant/regex/regex`).regex//server_common_file_require.regex.regex

let tmpResult
async function deleteUserAndRelatedInfo_async({account,name}){
    // ap.inf('account',account)
    let result=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user,condition:{$or:[{account:account},{name:name}]}})
    // ap.inf('find result',result)
    if(0<result.length){
        let userId=result[0]['id']
        // ap.inf('delete use account',account)
        await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.user,condition:{_id:userId}})
        await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.sugar,condition:{userId:userId}})
        await common_operation_model.deleteMany_async({dbModel:e_dbModel.user_friend_group,condition:{userId:userId}})
        await common_operation_model.deleteMany_async({dbModel:e_dbModel.folder,condition:{authorId:userId}})
        await common_operation_model.deleteMany_async({dbModel:e_dbModel.user_resource_profile,condition:{userId:userId}})
        //删除所有添加朋友
        await common_operation_model.deleteMany_async({dbModel:e_dbModel.add_friend_request,condition:{[e_field.ADD_FRIEND_REQUEST.ORIGINATOR]:userId}})
        //删除所有好友分组（以及其中的朋友）
        await common_operation_model.deleteMany_async({dbModel:e_dbModel.user_friend_group,condition:{[e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:userId}})


        //删除所有文档
        await common_operation_model.deleteMany_async({dbModel:e_dbModel.article,condition:{[e_field.ARTICLE.AUTHOR_ID]:userId}})
        //删除所有举报
        await common_operation_model.deleteMany_async({dbModel:e_dbModel.impeach_comment,condition:{[e_field.IMPEACH_COMMENT.AUTHOR_ID]:userId}})
        await common_operation_model.deleteMany_async({dbModel:e_dbModel.impeach_action,condition:{[e_field.IMPEACH_ACTION.CREATOR_ID]:userId}})
        await common_operation_model.deleteMany_async({dbModel:e_dbModel.impeach,condition:{[e_field.IMPEACH.CREATOR_ID]:userId}})
        //删除群/入群请求
        await common_operation_model.deleteMany_async({dbModel:e_dbModel.public_group,condition:{[e_field.PUBLIC_GROUP.CREATOR_ID]:userId}})
        await common_operation_model.deleteMany_async({dbModel:e_dbModel.join_public_group_request,condition:{[e_field.JOIN_PUBLIC_GROUP_REQUEST.CREATOR_ID]:userId}})
    }

}

async function deleteAdminUserAndRelatedInfo_async(userName){
    let result=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.admin_user,condition:{name:userName}})
    // console.log(`find user result =======>${JSON.stringify(result)}`)
    if(0<result.length){
        let userId=result[0]['id']
        await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.admin_user,condition:{name:userName}})
        await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.admin_sugar,condition:{userId:userId}})
        // await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.user_friend_group,condition:{userId:userId}})
        // await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.folder,condition:{authorId:userId}})
        // await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.user_resource_profile,condition:{userId:userId}})
    }
}

async function deleteUserPenalize_async({account}){
    let result=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user,condition:{account:account}})
    // console.log(`find user result =======>${JSON.stringify(result)}`)
    if(0<result.length){
        let userId=result[0]['id']
        await common_operation_model.deleteMany_async({dbModel:e_dbModel.admin_penalize,condition:{[e_field.ADMIN_PENALIZE.PUNISHED_ID]:userId}})
        // await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.admin_sugar,condition:{userId:userId}})
        // await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.user_friend_group,condition:{userId:userId}})
        // await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.folder,condition:{authorId:userId}})
        // await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.user_resource_profile,condition:{userId:userId}})
    }

}

async function deleteAllModelRecord_async({}){
    let skipColl=[e_coll.STORE_PATH,e_coll.CATEGORY,e_coll.RESOURCE_PROFILE,e_coll.ADMIN_USER,e_coll.ADMIN_SUGAR]
    for(let singleDbModel of dbModelInArray){
        if(-1===skipColl.indexOf(singleDbModel.modelName)){
        //console.log(`model name======>${singleDbModel.modelName}`)
        await common_operation_model.removeAll_async({dbModel:singleDbModel})
        }

    }
}

//userModel；定义在testData中的user info
async function create_user_async({userInfo}){
    //更改，添加额外字段
    userInfo[e_field.USER.PASSWORD]=hash(`${userInfo.password}`,e_hashType.SHA256).msg
    userInfo[e_field.USER.LAST_SIGN_IN_DATE]=Date.now()
    userInfo[e_field.USER.LAST_ACCOUNT_UPDATE_DATE]=Date.now()
    userInfo[e_field.USER.DOC_STATUS]=e_docStatus.DONE
    let accountValue=userInfo[e_field.USER.ACCOUNT]
    if(regex.email.test(accountValue)){
        userInfo[e_field.USER.ACCOUNT_TYPE]=e_accountType.EMAIL
    }
    if(regex.mobilePhone.test(accountValue)){
        userInfo[e_field.USER.ACCOUNT_TYPE]=e_accountType.MOBILE_PHONE
    }
    tmpResult=await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.user,value:userInfo})
    return Promise.resolve(tmpResult)
}

async function deleteMany_async({dbModel,condition}){
    return new Promise(function(resolve,reject){
        dbModel.deleteMany(condition,function(err){
            if(err){
                return reject(err)
            }
            return resolve(true)
        })
    })
}

async function deleteCollRecords_async({arr_dbModel}){
    for(let singleDbModel of arr_dbModel){
        await singleDbModel.remove({}).catch(
            function(err){
                return Promise.reject(err)
            }
        )
    }

}
async function create_article_async({userId,categoryId}){
    tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.folder,condition:{[e_field.FOLDER.AUTHOR_ID]:userId}})
    //console.log(`pathid========>${JSON.stringify(article)}`)
    let folderId=tmpResult[0]['_id']
    let article={
        [e_field.ARTICLE.AUTHOR_ID]:userId,
        [e_field.ARTICLE.NAME]:'test article',
        [e_field.ARTICLE.HTML_CONTENT]:'test article contentn',
        [e_field.ARTICLE.CATEGORY_ID]:(undefined===categoryId) ? initSettingObject.category.other:categoryId ,//don't care if real exist
        [e_field.ARTICLE.FOLDER_ID]:folderId,//default folder id
        [e_field.ARTICLE.STATUS]:e_articleStatus.FINISHED,
        // [e_field.ARTICLE.]:e_articleStatus.FINISHED,
    }

    console.log(`article========>${JSON.stringify(article)}`)
    let tmpResult=await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.article,value:article})
    return Promise.resolve(tmpResult)
}

async function create_impeach_for_article_async({userId,articleId,impeached_userId}){
    let impeach={
        [e_field.IMPEACH.CREATOR_ID]:userId,
        [e_field.IMPEACH.TITLE]:'impeach create by user2',
        [e_field.IMPEACH.CONTENT]:'test impeach',
        [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]:articleId,
        [e_field.IMPEACH.IMPEACH_TYPE]:e_impeachType.ARTICLE,
        [e_field.IMPEACH.CURRENT_STATE]:e_impeachState.ONGOING,
        [e_field.IMPEACH.IMPEACHED_USER_ID]:impeached_userId,
    }
    let tmpResult=await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.impeach,value:impeach})
    return Promise.resolve(tmpResult)
}


//imageInfo: {sizeInMb:xxx, authorId,referenceId,referenceColl,referenceColl:yyy, pathid:zzz, hashName:aaa}
async function createImageForImpeach_ReturnAllRecord_async({imagesInfo}){
    let tmpResult=await common_operation_model.insertMany_returnRecord_async({dbModel:e_dbModel.impeach_image,docs:imagesInfo})
    // console.log(`tmpre==========>${JSON.stringify(tmpResult)}`)
    return Promise.resolve(tmpResult)
}



async function getUserId_async({userAccount}) {
    tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user,condition:{account:userAccount}})
    // console.log(`user1Id result===================================>${JSON.stringify(tmpResult)}`)
    return Promise.resolve(tmpResult[0]['_id'])
}

async function getAdminUserId_async({userName}) {
    // console.log(`userName===================================>${JSON.stringify(userName)}`)
    tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.admin_user,condition:{[e_field.ADMIN_USER.NAME]:userName}})
    // console.log(`user1Id result===================================>${JSON.stringify(tmpResult)}`)
    return Promise.resolve(tmpResult[0]['_id'])
}

async function getGroupId_async({userId,groupName}) {
    // console.log(`userName===================================>${JSON.stringify(userName)}`)
    tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user_friend_group,condition:{[e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:userId,[e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:groupName}})
    // console.log(`user1Id result===================================>${JSON.stringify(tmpResult)}`)
    return Promise.resolve(tmpResult[0]['_id'])
}

async function getCategoryId_async({categoryName}) {
    // console.log(`userName===================================>${JSON.stringify(userName)}`)
    tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.category,condition:{[e_field.CATEGORY.NAME]:categoryName}})
    // console.log(`user1Id result===================================>${JSON.stringify(tmpResult)}`)
    return Promise.resolve(tmpResult[0]['id'])
}

async function getUserFolderId_async(userData){
    // let user1Tmp = {}
    // user1Tmp[e_field.USER.ACCOUNT] = testData.user.user2[e_field.USER.ACCOUNT]
    // user1Tmp[e_field.USER.PASSWORD] = testData.user.user2[e_field.USER.PASSWORD]

    let condition = {
        [e_field.USER.ACCOUNT]:userData[e_field.USER.ACCOUNT]
    }
    // 查找userId
    let tmpResult = await common_operation_model.find_returnRecords_async({dbModel: e_dbModel.user, condition: condition})
    condition = {}
    condition[e_field.FOLDER.AUTHOR_ID] = tmpResult[0]['_id']
    let options = {$sort: {cDate: 1}}
    tmpResult = await common_operation_model.find_returnRecords_async({
        dbModel: e_dbModel.folder,
        condition: condition,
        options: options
    })
    // console.log(`folderis =====================>${JSON.stringify(tmpResult[0]['_id'].toString())}`)
    return Promise.resolve(tmpResult[0]['_id'].toString())
}



async function getAddFriendRequest_async({originatorId,receiverId}){
    // let user1Tmp = {}
    // user1Tmp[e_field.USER.ACCOUNT] = testData.user.user2[e_field.USER.ACCOUNT]
    // user1Tmp[e_field.USER.PASSWORD] = testData.user.user2[e_field.USER.PASSWORD]

    let condition = {
        [e_field.ADD_FRIEND_REQUEST.RECEIVER]:receiverId,
        [e_field.ADD_FRIEND_REQUEST.ORIGINATOR]:originatorId,
        [e_field.ADD_FRIEND_REQUEST.STATUS]:e_addFriendStatus.UNTREATED,
    }
    // 查找userId
    let tmpResult = await common_operation_model.find_returnRecords_async({dbModel: e_dbModel.add_friend_request, condition: condition})
    // condition = {}
    // condition[e_field.FOLDER.AUTHOR_ID] = tmpResult[0]['_id']
    let options = {$sort: {cDate: 1}}
    tmpResult = await common_operation_model.find_returnRecords_async({
        dbModel: e_dbModel.add_friend_request,
        condition: condition,
        options: options
    })
    // ap.inf('getAddFriendRequest_async tmpResult',tmpResult)
    // console.log(`folderis =====================>${JSON.stringify(tmpResult[0]['_id'].toString())}`)
    return Promise.resolve(tmpResult[0]['_id'].toString())
}
/*async function findByIdAndUpdate_returnRecord_async({dbModel,id,updateFieldsValue,updateOption}){
    // console.log(`find by id :${id}`)
    let result=await dbModel.findByIdAndUpdate(id,updateFieldsValue,updateOption)
        .catch(
            function(err){
                return Promise.reject(err)
            })
    return Promise.resolve(result)
}*/
/***        获得resourceProfile的设置，以便恢复       ***/
async function getResourceProfileSetting_async({resourceRange,resourceType}){
    let condition={}
    if(undefined!==resourceRange){
        condition[e_field.RESOURCE_PROFILE.RESOURCE_RANGE]=resourceRange
    }
    if(undefined!==resourceType){
        condition[e_field.RESOURCE_PROFILE.RESOURCE_TYPE]=resourceType
    }
    let tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.resource_profile,condition:condition})
    if(tmpResult.length!==1){
        return Promise.reject('没有找到正确的profile')
    }

    return Promise.resolve({num:tmpResult[0][e_field.RESOURCE_PROFILE.MAX_NUM],size:tmpResult[0][e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]})
}
async function changeResourceProfileSetting_async({resourceRange,resourceType,num,size}){
    let condition={}
    if(undefined!==resourceRange){
        condition[e_field.RESOURCE_PROFILE.RESOURCE_RANGE]=resourceRange
    }
    if(undefined!==resourceType){
        condition[e_field.RESOURCE_PROFILE.RESOURCE_TYPE]=resourceType
    }
    let tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.resource_profile,condition:condition})
    if(tmpResult.length!==1){
        return Promise.reject('没有找到正确的profile')
    }
    let recordId=tmpResult[0]['_id']
    let updateValue={}
    if(undefined!==num){
        updateValue[e_field.RESOURCE_PROFILE.MAX_NUM]=num
    }
    if(undefined!==size){
        updateValue[e_field.RESOURCE_PROFILE.MAX_DISK_SPACE_IN_MB]=size
    }
    await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.resource_profile,id:recordId,updateFieldsValue:updateValue})
}
module.exports={
    deleteUserAndRelatedInfo_async,
    deleteAdminUserAndRelatedInfo_async,
    deleteUserPenalize_async,
    deleteAllModelRecord_async,
    deleteMany_async,
    deleteCollRecords_async,

    create_user_async,
    create_article_async,
    create_impeach_for_article_async,
    // createImageForImpeach_ReturnImageId_async,
    createImageForImpeach_ReturnAllRecord_async,
    getGroupId_async,
    getUserId_async,
    getAdminUserId_async,

    getCategoryId_async,

    getUserFolderId_async,

    getAddFriendRequest_async,
    // findByIdAndUpdate_returnRecord_async,
    getResourceProfileSetting_async,
    changeResourceProfileSetting_async,
}