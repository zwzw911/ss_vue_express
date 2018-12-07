/**
 * Created by 张伟 on 2019/11/20.
 */
'use strict'

/**************  controller相关常量  ****************/
const controllerError=require('../../server/controller/recommend/recommend_setting/recommend_controllerError').controllerError


/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')
// const request=require('supertest')
// const assert=require('assert')

/******************    待测函数  **************/
const app=require('../../app')
const adminApp=require('../../../express_admin/app')


const server_common_file_require=require('../../server_common_file_require')
/****************  class ********************/
const class_user=server_common_file_require.class_user
/******************    数据库函数  **************/
const common_operation_model=server_common_file_require.common_operation_model

/****************  公共常量 ********************/
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange

const e_part=nodeEnum.ValidatePart

const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field
//for fkValue check
const e_chineseFieldName=require('../../server/constant/genEnum/inputRule_field_chineseName').ChineseName

const iniSettingObject=require(`../../server/constant/genEnum/initSettingObject`).iniSettingObject

const e_adminUserType=mongoEnum.AdminUserType.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB
const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB
const e_impeachState=mongoEnum.ImpeachState.DB
const e_addFriendStatus=mongoEnum.AddFriendStatus.DB
const e_impeachAdminAction=mongoEnum.ImpeachAdminAction.DB
const e_resourceRange=mongoEnum.ResourceRange.DB
const e_resourceType=mongoEnum.ResourceType.DB

const e_dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule
/****************  公共错误 ********************/
const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
const controllerCheckerError=server_common_file_require.helperError.checker
const inputValueLogicCheckError=server_common_file_require.helperError.inputValueLogicCheck
// const inputValueLogicCheckError=server_common_file_require.helperError.inputValueLogicCheck
const resourceCheckError=server_common_file_require.helperError.resourceCheck
// const common_operation_model=server_common_file_require.common_operation_model
/****************  公共函数 ********************/
const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper= server_common_file_require.db_operation_helper
const testData=server_common_file_require.testData//require('../testData')
const commonAPI=server_common_file_require.common_API//require('../API_helper/API_helper')
const penalizeAPI=server_common_file_require.penalize_API
const userAPI=server_common_file_require.user_API
const folderAPI=server_common_file_require.folder_API
const userComponentFunction=server_common_file_require.user_component_function
const adminUserComponentFunction=server_common_file_require.admin_user_component_function
const misc_helper=server_common_file_require.misc_helper
const crypt=server_common_file_require.crypt
/****************  全局设置 ********************/
let globalConfiguration=server_common_file_require.globalConfiguration
const fkConfig=server_common_file_require.fkConfig.fkConfig

/****************  变量 ********************/
let  baseUrl="/recommend/",finalUrl,url
let data={values:{}}
let expectedErrorRc,copyNormalRecord

let normalRecord={
    // [e_field.FOLDER.AUTHOR_ID]:undefined,
    // [e_field.FOLDER.LEVEL]:undefined,
    [e_field.SEND_RECOMMEND.ARTICLE_ID]:undefined,
    [e_field.SEND_RECOMMEND.RECEIVERS]:undefined,
}

let penalizeInfo={
    [e_field.ADMIN_PENALIZE.PENALIZE_TYPE]:e_penalizeType.NO_RECOMMEND,
    // penalizeType:e_penalizeType.NO_RECOMMEND,
    [e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE]:e_penalizeSubType.ALL,
    // penalizeSubType:e_penalizeSubType.ALL,
    // penalizedError:undefined, //错误根据具体method定义
    [e_field.ADMIN_PENALIZE.DURATION]:0,
    [e_field.ADMIN_PENALIZE.REASON]:'test reason, no indication',
}

let user1=new class_user.c_user({userData:testData.user.user1})
let user2=new class_user.c_user({userData:testData.user.user2})
let user3=new class_user.c_user({userData:testData.user.user3})
let adminRoot=new class_user.c_adminUser({adminUserData:testData.admin_user.adminRoot})

describe('dispatch', function() {

    let user1_articleId1,user1_decryptedArticleId1
    before('user1/2/3  login and create article and impeach', async function(){
        url=''
        // parameter[`APIUrl`]=finalUrl
        finalUrl=baseUrl+url

        await user1.reCreateUserGetSessUserIdSalt_async()
        await user2.reCreateUserGetSessUserIdSalt_async()
        await user3.reCreateUserGetSessUserIdSalt_async()
        await adminRoot.adminLoginGetSessUserIdSalt_async()

        user1_articleId1=await user1.createArticleReturnId_async({setStatusFinish:true})
        user1_decryptedArticleId1=user1.decryptedObjectId({decryptedObjectId:user1_articleId1})
        console.log(`==============================================================`)
        console.log(`=================    before all done      ====================`)
        console.log(`==============================================================`)
    });


    /**              create                      **/
    describe('create', function() {
        it('1.1 create:unexpected user type', async function() {
            copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.SEND_RECOMMEND.ARTICLE_ID]=adminRoot.cryptedObjectId({unCryptedObjectId:user1_decryptedArticleId1})
            copyNormalRecord[e_field.SEND_RECOMMEND.RECEIVERS]=[adminRoot.cryptedObjectId({unCryptedObjectId:user1.userId})]
            expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
            data.values={[e_part.RECORD_INFO]:copyNormalRecord}
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRoot.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('1.2 create:articleId not exist', async function() {
            copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.SEND_RECOMMEND.ARTICLE_ID]=user1.cryptedObjectId({unCryptedObjectId:testData.unExistObjectId})
            copyNormalRecord[e_field.SEND_RECOMMEND.RECEIVERS]=[user1.cryptedObjectId({unCryptedObjectId:user1.userId})]
            expectedErrorRc=inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.fkValueNotExist().rc
            data.values={[e_part.RECORD_INFO]:copyNormalRecord}
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('1.3 create:sender in receivers', async function() {
            copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.SEND_RECOMMEND.ARTICLE_ID]=user1_articleId1
            copyNormalRecord[e_field.SEND_RECOMMEND.RECEIVERS]=[user1.cryptedObjectId({unCryptedObjectId:user1.userId})]
            expectedErrorRc=controllerError.logic.post.cantSendRecommendToSelf.rc
            data.values={[e_part.RECORD_INFO]:copyNormalRecord}
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('1.4 create:duplicate send to same user', async function() {
            // ap.wrn('first recommend')
            copyNormalRecord=objectDeepCopy(normalRecord)
            // copyNormalRecord[e_field.SEND_RECOMMEND.ARTICLE_ID]=user1_articleId1
            // copyNormalRecord[e_field.SEND_RECOMMEND.RECEIVERS]=[user1.cryptedObjectId({unCryptedObjectId:user2.userId})]
            await user1.createRecommendReturnEncryptedId_async({articleId:user1_articleId1,receivers:[user1.cryptedObjectId({unCryptedObjectId:user2.userId})]})
            // ap.wrn('first done')
            expectedErrorRc=controllerError.logic.post.allReceiversHasAlreadyGetRecommend.rc
            data.values={[e_part.RECORD_INFO]:copyNormalRecord}
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('1.5 create:user1 try to recommend not finished article', async function() {
            // ap.wrn('first recommend')
            let articleId=await user1.createArticleReturnId_async({setStatusFinish:false})
            copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.SEND_RECOMMEND.ARTICLE_ID]=articleId
            copyNormalRecord[e_field.SEND_RECOMMEND.RECEIVERS]=[user1.cryptedObjectId({unCryptedObjectId:user2.userId})]
            // await user1.createRecommendReturnEncryptedId_async({value:copyNormalRecord})
            // ap.wrn('first done')
            expectedErrorRc=controllerError.logic.post.articleStatusNotFinish.rc
            data.values={[e_part.RECORD_INFO]:copyNormalRecord}
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('2.1 create:receivers not exist', async function() {
            copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.SEND_RECOMMEND.ARTICLE_ID]=user1_articleId1
            copyNormalRecord[e_field.SEND_RECOMMEND.RECEIVERS]=[user1.cryptedObjectId({unCryptedObjectId:testData.unExistObjectId})]
            expectedErrorRc=inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.fkValueNotExist().rc
            data.values={[e_part.RECORD_INFO]:copyNormalRecord}
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('2.2 create:article priority(ownership) failed', async function() {
            copyNormalRecord=objectDeepCopy(normalRecord)
            fkConfig[e_coll.SEND_RECOMMEND][e_field.SEND_RECOMMEND.ARTICLE_ID]['fkCollOwnerFields']=[e_field.ARTICLE.AUTHOR_ID]
            copyNormalRecord[e_field.SEND_RECOMMEND.ARTICLE_ID]=user2.cryptedObjectId({unCryptedObjectId:user1_decryptedArticleId1})
            copyNormalRecord[e_field.SEND_RECOMMEND.RECEIVERS]=[user2.cryptedObjectId({unCryptedObjectId:user1.userId})]
            expectedErrorRc=inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.notHasPriorityForFkField().rc
            data.values={[e_part.RECORD_INFO]:copyNormalRecord}
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

            fkConfig[e_coll.SEND_RECOMMEND][e_field.SEND_RECOMMEND.ARTICLE_ID]['fkCollOwnerFields']=[]
        });
        it('2.3 create:receivers priority(ownership) failed', async function() {
            copyNormalRecord=objectDeepCopy(normalRecord)
            fkConfig[e_coll.SEND_RECOMMEND][e_field.SEND_RECOMMEND.RECEIVERS]['fkCollOwnerFields']=['photoPathId']
            copyNormalRecord[e_field.SEND_RECOMMEND.ARTICLE_ID]=user2.cryptedObjectId({unCryptedObjectId:user1_decryptedArticleId1})
            copyNormalRecord[e_field.SEND_RECOMMEND.RECEIVERS]=[user2.cryptedObjectId({unCryptedObjectId:user1.userId}),user2.cryptedObjectId({unCryptedObjectId:user3.userId})]
            expectedErrorRc=inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.notHasPriorityForFkField().rc
            data.values={[e_part.RECORD_INFO]:copyNormalRecord}
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

            fkConfig[e_coll.SEND_RECOMMEND][e_field.SEND_RECOMMEND.RECEIVERS]['fkCollOwnerFields']=[]
        });
        it('2.4 create: total send recommend exceed', async function() {
            let originValue=await class_user.c_user.getResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_SEND_RECOMMENDS,resourceType:e_resourceType.BASIC})
            await class_user.c_user.setResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_SEND_RECOMMENDS,resourceType:e_resourceType.BASIC,num:0})

            copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.SEND_RECOMMEND.ARTICLE_ID]=user2.cryptedObjectId({unCryptedObjectId:user1_decryptedArticleId1})
            copyNormalRecord[e_field.SEND_RECOMMEND.RECEIVERS]=[user2.cryptedObjectId({unCryptedObjectId:user1.userId}),user2.cryptedObjectId({unCryptedObjectId:user3.userId})]
            expectedErrorRc=resourceCheckError.ifEnoughResource_async.totalSendRecommendNumExceed({}).rc
            data.values={[e_part.RECORD_INFO]:copyNormalRecord}
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
// ap.wrn('originValue',originValue)
            await class_user.c_user.setResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_SEND_RECOMMENDS,resourceType:e_resourceType.BASIC,num:originValue})
            // ap.wrn('restore done')
        });
        it('3.1 create: user1 share own article to user2 success,user2 share own article to user2, cause user1s article pop', async function() {
            copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.SEND_RECOMMEND.ARTICLE_ID]=user1_articleId1
            copyNormalRecord[e_field.SEND_RECOMMEND.RECEIVERS]=[user1.cryptedObjectId({unCryptedObjectId:user2.userId})]
            expectedErrorRc=0
            data.values={[e_part.RECORD_INFO]:copyNormalRecord}
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

            copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.SEND_RECOMMEND.ARTICLE_ID]=await user3.createArticleReturnId_async({setStatusFinish:true})
            copyNormalRecord[e_field.SEND_RECOMMEND.RECEIVERS]=[user3.cryptedObjectId({unCryptedObjectId:user2.userId})]
            expectedErrorRc=0
            data.values={[e_part.RECORD_INFO]:copyNormalRecord}
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

        });
        it('3.9 create: user1 share own article to user2 success', async function() {


            copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.SEND_RECOMMEND.ARTICLE_ID]=user1_articleId1
            copyNormalRecord[e_field.SEND_RECOMMEND.RECEIVERS]=[user1.cryptedObjectId({unCryptedObjectId:user2.userId})]
            expectedErrorRc=0
            data.values={[e_part.RECORD_INFO]:copyNormalRecord}
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
// ap.wrn('originValue',originValue)
//         await class_user.c_user.setResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_SEND_RECOMMENDS,resourceType:e_resourceType.BASIC,num:originValue})
            // ap.wrn('restore done')
        });
    })
    /**              get recommend list                      **/
    describe('get receive recommend list', async function() {
        let user1_sendRecommendId,sendRecommendId

        before('user1 share own article to user2/user3,user3 read this recommend', async function(){
            url='getUnreadRecommend'
            finalUrl=baseUrl+url
            // ap.wrn('finalUrl',finalUrl)

            //user1 share own doc to user2/user3
            user1_sendRecommendId=await user1.createRecommendReturnEncryptedId_async({articleId:user1_articleId1,receivers:[user1.cryptedObjectId({unCryptedObjectId:user2.userId}),user1.cryptedObjectId({unCryptedObjectId:user3.userId})]})
            sendRecommendId=user1.decryptedObjectId({decryptedObjectId:user1_sendRecommendId})
            //user3 read this shared doc
            await user3.updateReceivedUnreadCommendToRead_async({unreadRecommendId:user3.cryptedObjectId({unCryptedObjectId:sendRecommendId})})
            console.log(`==============================================================`)
            console.log(`=======    before get receive recommend list done      =======`)
            console.log(`==============================================================`)
        })
        it('4.1 get recommend list: user2 get unread recommends', async function() {
            // ap.wrn('case finalUrl',finalUrl)
            expectedErrorRc=0
            await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:user2.sess,expectedErrorRc:expectedErrorRc,app:app})
        })
        //无法直接获得结果，需要人工检测db（user3 unread=0， read=1）
        it('4.2 get recommend list: user3 get read recommends', async function() {
            // ap.wrn('case finalUrl',finalUrl)
            expectedErrorRc=0
            await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:user2.sess,expectedErrorRc:expectedErrorRc,app:app})
        })

        it('4.3 get recommend list: user2 reach max read recommends', async function() {
            let originNum=await class_user.c_user.getResourceProfileSetting_async({resourceType:e_resourceType.BASIC,resourceRange:e_resourceRange.MAX_READ_RECEIVE_RECOMMENDS})
            ap.wrn('originNum',originNum)
            await class_user.c_user.setResourceProfileSetting_async({resourceType:e_resourceType.BASIC,resourceRange:e_resourceRange.MAX_READ_RECEIVE_RECOMMENDS,num:0})
            data={
                values:{
                    [e_part.RECORD_ID]:user2.cryptedObjectId({unCryptedObjectId:sendRecommendId})
                }
            }
            expectedErrorRc=0
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            await class_user.c_user.setResourceProfileSetting_async({resourceType:e_resourceType.BASIC,resourceRange:e_resourceRange.MAX_READ_RECEIVE_RECOMMENDS,num:originNum})
        })
    })

    describe('get all send recommend list', async function() {
        let user1_sendRecommendId,sendRecommendId

        before('user1 share own article to user2/user3,user3 read this recommend', async function(){
            url='getSendRecommend'
            finalUrl=baseUrl+url
            // ap.wrn('finalUrl',finalUrl)

            //user1 share own doc to user2/user3
            user1_sendRecommendId=await user1.createRecommendReturnEncryptedId_async({articleId:user1_articleId1,receivers:[user1.cryptedObjectId({unCryptedObjectId:user2.userId}),user1.cryptedObjectId({unCryptedObjectId:user3.userId})]})
            sendRecommendId=user1.decryptedObjectId({decryptedObjectId:user1_sendRecommendId})
            //user3 read this shared doc
            // await user3.updateReceivedUnreadCommendToRead_async({unreadRecommendId:user3.cryptedObjectId({unCryptedObjectId:sendRecommendId})})
            console.log(`==============================================================`)
            console.log(`=======    before get receive recommend list done      =======`)
            console.log(`==============================================================`)
        })
        it('5.1 get recommend list: user2 get unread recommends', async function() {
            // ap.wrn('case finalUrl',finalUrl)
            expectedErrorRc=0
            await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:user1.sess,expectedErrorRc:expectedErrorRc,app:app})
        })
        /*//无法直接获得结果，需要人工检测db（user3 unread=0， read=1）
        it('5.2 get recommend list: user3 get read recommends', async function() {
            // ap.wrn('case finalUrl',finalUrl)
            expectedErrorRc=0
            await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:user2.sess,expectedErrorRc:expectedErrorRc,app:app})
        })

        it('5.3 get recommend list: user2 reach max read recommends', async function() {
            let originNum=await class_user.c_user.getResourceProfileSetting_async({resourceType:e_resourceType.BASIC,resourceRange:e_resourceRange.MAX_READ_RECEIVE_RECOMMENDS})
            ap.wrn('originNum',originNum)
            await class_user.c_user.setResourceProfileSetting_async({resourceType:e_resourceType.BASIC,resourceRange:e_resourceRange.MAX_READ_RECEIVE_RECOMMENDS,num:0})
            data={
                values:{
                    [e_part.RECORD_ID]:user2.cryptedObjectId({unCryptedObjectId:sendRecommendId})
                }
            }
            expectedErrorRc=0
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            await class_user.c_user.setResourceProfileSetting_async({resourceType:e_resourceType.BASIC,resourceRange:e_resourceRange.MAX_READ_RECEIVE_RECOMMENDS,num:originNum})
        })*/
    })
    /**              update recommend                       **/
    describe('update receive recommend ', async function() {
        let user1_sendRecommendId,sendRecommendId

        before('user1 share own article to user2/user3,user3 read this recommend', async function(){
            url='readUnreadRecommend'
            finalUrl=baseUrl+url
            // ap.wrn('finalUrl',finalUrl)

            //user1 share own doc to user2/user3
            user1_sendRecommendId=await user1.createRecommendReturnEncryptedId_async({articleId:user1_articleId1,receivers:[user1.cryptedObjectId({unCryptedObjectId:user2.userId}),user1.cryptedObjectId({unCryptedObjectId:user3.userId})]})
            sendRecommendId=user1.decryptedObjectId({decryptedObjectId:user1_sendRecommendId})
            //user3 read this shared doc
            // await user3.updateReceivedUnreadCommendToRead_async({unreadRecommendId:user3.cryptedObjectId({unCryptedObjectId:sendRecommendId})})
            console.log(`==============================================================`)
            console.log(`=======    before update receive recommend list done      =======`)
            console.log(`==============================================================`)
        })


        it('6.1 update recommend list: user2 reach max read recommends', async function() {
            let originNum=await class_user.c_user.getResourceProfileSetting_async({resourceType:e_resourceType.BASIC,resourceRange:e_resourceRange.MAX_READ_RECEIVE_RECOMMENDS})
            // ap.wrn('originNum',originNum)
            await class_user.c_user.setResourceProfileSetting_async({resourceType:e_resourceType.BASIC,resourceRange:e_resourceRange.MAX_READ_RECEIVE_RECOMMENDS,num:0})
            data={
                values:{
                    [e_part.RECORD_ID]:user2.cryptedObjectId({unCryptedObjectId:sendRecommendId})
                }
            }
            expectedErrorRc=resourceCheckError.ifEnoughResource_async.totalReadReceivedRecommendNumExceed({}).rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            await class_user.c_user.setResourceProfileSetting_async({resourceType:e_resourceType.BASIC,resourceRange:e_resourceRange.MAX_READ_RECEIVE_RECOMMENDS,num:originNum})
        })
    })
})



