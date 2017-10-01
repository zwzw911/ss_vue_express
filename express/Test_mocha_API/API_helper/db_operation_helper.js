/**
 * Created by ada on 2017/8/9.
 */
'use strict'

const server_common_file_require=require('../../server_common_file_require')
const nodeEnum=server_common_file_require.nodeEnum
const mongoEnum=server_common_file_require.mongoEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum

const common_operation_model=server_common_file_require.common_operation_model
const e_dbModel=require('../../server/constant/genEnum/dbModel')

// const e_part=require('../../server/constant/enum/node').ValidatePart
// const e_method=require('../../server/constant/enum/node').Method
const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field
const dbModelInArray=require('../../server/constant/genEnum/dbModelInArray')

const e_hashType=nodeRuntimeEnum.HashType
const hash=server_common_file_require.crypt.hash//require('../../server/function/assist/crypt').hash

const e_accountType=mongoEnum.AccountType.DB
const e_docStatus=mongoEnum.DocStatus.DB
const e_articleStatus=mongoEnum.ArticleStatus.DB
const e_impeachType=mongoEnum.ImpeachType.DB
const e_impeachState=mongoEnum.ImpeachState.DB

const initSettingObject=require('../../server/constant/genEnum/initSettingObject').iniSettingObject

const regex=server_common_file_require.regex.regex

let tmpResult
async function deleteUserAndRelatedInfo_async({account}){
    // console.log(`account =======>${JSON.stringify(account)}`)
    let result=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user,condition:{account:account}})
    // console.log(`find user result =======>${JSON.stringify(result)}`)
    if(0<result.length){
        let userId=result[0]['id']
        await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.user,condition:{account:account}})
        await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.sugar,condition:{userId:userId}})
        await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.user_friend_group,condition:{userId:userId}})
        await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.folder,condition:{authorId:userId}})
        await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.user_resource_profile,condition:{userId:userId}})
    }

}


async function deleteAllModelRecord_async({}){
    let skipColl=[e_coll.STORE_PATH,e_coll.CATEGORY,e_coll.RESOURCE_PROFILE]
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
        // [e_field.IMPEACH.IM]:e_impeachStatus.ONGOING,
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


module.exports={
    deleteUserAndRelatedInfo_async,
    deleteAllModelRecord_async,

    create_user_async,
    create_article_async,
    create_impeach_for_article_async,
    // createImageForImpeach_ReturnImageId_async,
    createImageForImpeach_ReturnAllRecord_async,
    getUserId_async,

}