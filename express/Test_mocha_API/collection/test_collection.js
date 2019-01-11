/**
 * Created by 张伟 on 2019/11/20.
 */
'use strict'

/**************  controller相关常量  ****************/
const controllerError=require('../../server/controller/collection/collection_setting/collection_controllerError').controllerError


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
const e_chooseFriendInfoFieldName=nodeEnum.ChooseFriendInfoFieldName
const e_subField=nodeEnum.SubField

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
const e_defaultFriendGroupName=globalConfiguration.userGroupFriend.defaultGroupName.enumFormat
/****************  变量 ********************/
let  baseUrl="/collection/",finalUrl,url
let data={values:{}}
let expectedErrorRc,copyNormalRecord

let normalRecord={
    // [e_field.FOLDER.AUTHOR_ID]:undefined,
    // [e_field.FOLDER.LEVEL]:undefined,
    [e_field.COLLECTION.NAME]:undefined,
    [e_field.COLLECTION.PARENT_ID]:undefined,
}

let penalizeInfo={
    [e_field.ADMIN_PENALIZE.PENALIZE_TYPE]:e_penalizeType.NO_COLLECTION,
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
let user4=new class_user.c_user({userData:testData.user.user4})

let adminRoot=new class_user.c_adminUser({adminUserData:testData.admin_user.adminRoot})

describe('dispatch', function() {

    let user1_articleId1,user1_decryptedArticleId1
    let user1_articleId2,user1_decryptedArticleId2
    let user3_myFriend,user3_blackList
    before('user1/2/3  login and create article and impeach', async function(){
        url=''
        // parameter[`APIUrl`]=finalUrl
        finalUrl=baseUrl+url

        await user1.reCreateUserGetSessUserIdSalt_async()
        await user2.reCreateUserGetSessUserIdSalt_async()
        await user3.reCreateUserGetSessUserIdSalt_async()
        await user4.reCreateUserGetSessUserIdSalt_async()
        await adminRoot.adminLoginGetSessUserIdSalt_async()

        /**         user1 create articles: 1st finish, 2nd not finish       **/
        user1_articleId1=await user1.createArticleReturnEncryptedId_async({setStatusFinish:true})
        user1_decryptedArticleId1=user1.decryptedObjectId({encryptedObjectId:user1_articleId1})
        user1_articleId2=await user1.createArticleReturnEncryptedId_async({setStatusFinish:false})
        user1_decryptedArticleId2=user1.decryptedObjectId({encryptedObjectId:user1_articleId2})

        console.log(`==============================================================`)
        console.log(`=================    before all done      ====================`)
        console.log(`==============================================================`)
    });


    /**              create                      **/
    describe('create', function() {
        it('1.1 create:unexpected user type', async function() {
            copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.COLLECTION.NAME]='tete'
            // copyNormalRecord[e_field.COLLECTION.PARENT_ID]=adminRoot.encryptedObjectId({decryptedObjectId:adminRoot.userId})
            // copyNormalRecord[e_field.SEND_RECOMMEND.RECEIVERS]=[adminRoot.encryptedObjectId({decryptedObjectId:user1.userId})]
            expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
            data.values={
                [e_part.RECORD_INFO]:copyNormalRecord,

            }
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRoot.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        /*it('1.2 create:parentId not owner', async function() {
            copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.COLLECTION.NAME]='test'
            // ap.wrn('user2.topCollectionId',user2.topCollectionId)
            // copyNormalRecord[e_field.COLLECTION.PARENT_ID]=user1.encryptedObjectId({decryptedObjectId:user2.topCollectionId})
            expectedErrorRc=inputValueLogicCheckError.ifFkValueExist_And_FkHasPriority_async.notHasPriorityForFkField().rc
            data.values={
                [e_part.RECORD_INFO]:copyNormalRecord,

            }
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });*/
        it('1.3 create:name xss', async function() {
            copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.COLLECTION.NAME]='<alert>'
            // copyNormalRecord[e_field.COLLECTION.PARENT_ID]=user1.encryptedObjectId({decryptedObjectId:user1.topCollectionId})
            expectedErrorRc=inputValueLogicCheckError.ifValueXSS.fieldValueXSS({}).rc
            data.values={
                [e_part.RECORD_INFO]:copyNormalRecord,

            }
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('1.4 collection  exceed', async function() {
            let origNum=await class_user.c_user.getResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_COLLECTION_PER_USER,resourceType:e_resourceType.BASIC})
            await class_user.c_user.setResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_COLLECTION_PER_USER,resourceType:e_resourceType.BASIC,num:0})

            copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.COLLECTION.NAME]='我的收藏'
            // copyNormalRecord[e_field.COLLECTION.PARENT_ID]=user1.encryptedObjectId({decryptedObjectId:user1.topCollectionId})
            expectedErrorRc=resourceCheckError.ifEnoughResource_async.totalCollectionNumExceed({}).rc
            data.values={
                [e_part.RECORD_INFO]:copyNormalRecord,

            }
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            await class_user.c_user.setResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_COLLECTION_PER_USER,resourceType:e_resourceType.BASIC,num:origNum})
        });
        it('1.5 user1 has 2 top level parent collection', async function() {
            /**     创建默认的收藏目录（我的收藏，根目录）   **/
            let myCollection={
                [e_field.COLLECTION.NAME]:'我的收藏1',
                [e_field.COLLECTION.CREATOR_ID]:user1.userId,
                [e_field.COLLECTION.PARENT_ID]:user1.userId,//为了符合rule中定义的，parentId必须存在，先随意设置一个parentId
                /*        [e_field.COLLECTION.ARTICLES_ID]:[],
                        [e_field.COLLECTION.TOPICS_ID]:[],*/
            }
            // ap.wrn('myCollection',myCollection)
            let tmpResult=await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.collection,value:myCollection})
            //然后将顶级collect的parentId删除点
            await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.collection,id:tmpResult['_id'],updateFieldsValue:{$unset:{[e_field.COLLECTION.PARENT_ID]:1}}})

            // let nonTopLevelCollectionId=await user1.createCollection_ReturnEncryptedId_async({collectionName:'child'})
            copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.COLLECTION.NAME]='我的收藏'
            // copyNormalRecord[e_field.COLLECTION.PARENT_ID]=nonTopLevelCollectionId
            expectedErrorRc=controllerError.logic.post.cantFindTopParentCollectionId.rc
            data.values={
                [e_part.RECORD_INFO]:copyNormalRecord,
            }
            // ap.wrn('data',data)
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

            await common_operation_model.findByIdAndRemove_async({dbModel:e_dbModel.collection,id:tmpResult['_id']})
        });
        it('1.6 create success', async function() {
            copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.COLLECTION.NAME]='我的收藏'
            // copyNormalRecord[e_field.COLLECTION.PARENT_ID]=user1.encryptedObjectId({decryptedObjectId:user1.topCollectionId})
            expectedErrorRc=0
            data.values={
                [e_part.RECORD_INFO]:copyNormalRecord,

            }
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
    })
    /**              delete collection                      **/
    describe('delete collection ', async function() {
        let user1_encrypted_collectionId,user1_collectionId,sendRecommendId

        before('user1 create new collection', async function(){
            url=''
            finalUrl=baseUrl+url
            // ap.wrn('finalUrl',finalUrl)

            //user1 share own doc to user2/user3
            user1_encrypted_collectionId=await user1.createCollection_ReturnEncryptedId_async({collectionName:'childCollection'})
            user1_collectionId=user1.decryptedObjectId({encryptedObjectId:user1_encrypted_collectionId})
            //user3 read this shared doc
            // await user3.updateReceivedUnreadCommendToRead_async({unreadRecommendId:user3.encryptedObjectId({decryptedObjectId:sendRecommendId})})
            console.log(`==============================================================`)
            console.log(`=======    before get receive recommend list done      =======`)
            console.log(`==============================================================`)
        })
        it('2.1 user type not expected', async function() {
            // ap.wrn('case finalUrl',finalUrl)
            data.values={
                [e_part.RECORD_ID]:adminRoot.encryptedObjectId({decryptedObjectId:user1_collectionId}),
            }
            expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.deleteAPI_compareCommonRc_async({APIUrl:finalUrl,data:data,sess:adminRoot.sess,expectedErrorRc:expectedErrorRc,app:app})
        })
        //无法直接获得结果，需要人工检测db（user3 unread=0， read=1）
        it('2.2 user2 try to delete user1s collection id', async function() {
            // ap.wrn('case finalUrl',finalUrl)
            data.values={
                [e_part.RECORD_ID]:user2.encryptedObjectId({decryptedObjectId:user1_collectionId})
            }
            expectedErrorRc=controllerError.logic.delete.notCreatorCantDelete.rc
            await misc_helper.deleteAPI_compareCommonRc_async({APIUrl:finalUrl,data:data,sess:user2.sess,expectedErrorRc:expectedErrorRc,app:app})
        })

        it('2.3 user1 try to delete top level collection id', async function() {

            await class_user.c_user.setResourceProfileSetting_async({resourceType:e_resourceType.BASIC,resourceRange:e_resourceRange.MAX_READ_RECEIVE_RECOMMENDS,num:0})
            data.values={
                    [e_part.RECORD_ID]:user1.encryptedObjectId({decryptedObjectId:user1.topCollectionId})
                }

            expectedErrorRc=controllerError.logic.delete.cantDeleteTopLevelCollection.rc
            await misc_helper.deleteAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

        })
    })

    describe('get all collection', async function() {
        let user1_sendRecommendId,sendRecommendId

        before('user1 get collection', async function(){
            url=''
            finalUrl=baseUrl+url
            console.log(`==============================================================`)
            console.log(`=======    before get receive recommend list done      =======`)
            console.log(`==============================================================`)
        })
        it('3.1 get collection: user type not expected', async function() {
            // ap.wrn('case finalUrl',finalUrl)
            expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:adminRoot.sess,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('3.2 get collection success', async function() {
            // ap.wrn('case finalUrl',finalUrl)
            expectedErrorRc=0
            await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:user1.sess,expectedErrorRc:expectedErrorRc,app:app})
        })
    })
    describe('get collection content', async function() {
        let user1_sendRecommendId,sendRecommendId

        before('user1 get collection content', async function(){
            url=''
            finalUrl=baseUrl+url
            console.log(`==============================================================`)
            console.log(`=======    before get receive recommend list done      =======`)
            console.log(`==============================================================`)
        })
        it('4.1 get collection: user type not expected', async function() {
            // ap.wrn('case finalUrl',finalUrl)
            expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:adminRoot.sess,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('4.2 user1 try to get user2 collection content', async function() {
            url=user1.encryptedObjectId({decryptedObjectId:user2.topCollectionId})
            finalUrl=baseUrl+url
            expectedErrorRc=controllerError.logic.get.notCreatorCantReadCollectionContent.rc
            await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:user1.sess,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('4.3 user1  get top level collection content success', async function() {
            url=user1.encryptedObjectId({decryptedObjectId:user1.topCollectionId})
            finalUrl=baseUrl+url
            expectedErrorRc=0
            await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:user1.sess,expectedErrorRc:expectedErrorRc,app:app})
        })
    })
    /**              update collection（name）                       **/
    describe('update collection(name) ', async function() {
        let user1_encrypted_collection_id,user1_collection_id

        before('user1 create new ', async function(){
            url='name'
            finalUrl=baseUrl+url
            // ap.wrn('finalUrl',finalUrl)

            //user1 create collection
            user1_encrypted_collection_id=await user1.createCollection_ReturnEncryptedId_async({collectionName:'child'})
            user1_collection_id=user1.decryptedObjectId({encryptedObjectId:user1_encrypted_collection_id})
            //user3 read this shared doc
            // await user3.updateReceivedUnreadCommendToRead_async({unreadRecommendId:user3.encryptedObjectId({decryptedObjectId:sendRecommendId})})
            console.log(`==============================================================`)
            console.log(`=======    before update collection name done      =======`)
            console.log(`==============================================================`)
        })
        it('5.1 user1 update collection name with not expected user type', async function() {
            expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
            data.values={
                    [e_part.RECORD_ID]:adminRoot.encryptedObjectId({decryptedObjectId:user1_collection_id}),
                    [e_part.RECORD_INFO]:{
                        [e_field.COLLECTION.NAME]:'new'
                    }
                }
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRoot.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('5.2 user2 try to update user1s collection name', async function() {
            expectedErrorRc=controllerError.logic.put.notCreatorCantUpdateCollectionName.rc
            data.values={
                [e_part.RECORD_ID]:user2.encryptedObjectId({decryptedObjectId:user1_collection_id}),
                [e_part.RECORD_INFO]:{
                    [e_field.COLLECTION.NAME]:'new'
                }
            }
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('5.3 user1 try to update top level collection name', async function() {
            expectedErrorRc=controllerError.logic.put.cantUpdateTopLevelCollectionName.rc
            data.values={
                [e_part.RECORD_ID]:user1.encryptedObjectId({decryptedObjectId:user1.topCollectionId}),
                [e_part.RECORD_INFO]:{
                    [e_field.COLLECTION.NAME]:'new'
                }
            }
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('5.4 user1 try to update collection name with XSS', async function() {
            expectedErrorRc=inputValueLogicCheckError.ifValueXSS.fieldValueXSS({}).rc
            data.values={
                [e_part.RECORD_ID]:user1_encrypted_collection_id,
                [e_part.RECORD_INFO]:{
                    [e_field.COLLECTION.NAME]:'<alert>'
                }
            }
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
    })

    /**              update collection（content:article）                       **/
    describe('update collection content ', async function() {
        let user1_encrypted_collection_id, user1_collection_id
        let user2_finished_articleId,user2_not_finished_articleId
        let user3_finished_articleId,user3_not_finished_articleId
        before('user1 create new ', async function () {
            url = 'content'
            finalUrl = baseUrl + url
            // ap.wrn('finalUrl',finalUrl)

            /**     user1 create new collection     **/
            user1_encrypted_collection_id = await user1.createCollection_ReturnEncryptedId_async({collectionName: 'child'})
            user1_collection_id = user1.decryptedObjectId({encryptedObjectId: user1_encrypted_collection_id})
            /**     user2 create 2 new article,1 finish,1 not finish     **/
            let tmpResult=await user2.createArticleReturnEncryptedId_async({setStatusFinish:true})
            // ap.wrn('cereted article ',tmpResult)
            user2_finished_articleId=user2.decryptedObjectId({encryptedObjectId:tmpResult})
            tmpResult=await user2.createArticleReturnEncryptedId_async({setStatusFinish:false})
            user2_not_finished_articleId=user2.decryptedObjectId({encryptedObjectId:tmpResult})

            /**     user3 create new finish article      **/
            tmpResult=await user3.createArticleReturnEncryptedId_async({setStatusFinish:true})
            // ap.wrn('cereted article ',tmpResult)
            user3_finished_articleId=user3.decryptedObjectId({encryptedObjectId:tmpResult})
            tmpResult=await user2.createArticleReturnEncryptedId_async({setStatusFinish:false})
            user3_not_finished_articleId=user2.decryptedObjectId({encryptedObjectId:tmpResult})
            /**     user1 collect user3s article      **/
            await user1.collectArticle_async({articleId:user3_finished_articleId})

            console.log(`==============================================================`)
            console.log(`=======    before update collection name done      =======`)
            console.log(`==============================================================`)
        })
        it('6.1 adminRoot add article to collection with not expected user type', async function () {
            expectedErrorRc = controllerCheckerError.userTypeNotExpected.rc
            data.values = {
                [e_part.EDIT_SUB_FIELD]:{
                    [e_field.COLLECTION.ARTICLES_ID]:{
                        [e_subField.TO]:adminRoot.encryptedObjectId({decryptedObjectId:user1.topCollectionId}),
                        [e_subField.ELE_ARRAY]:[adminRoot.encryptedObjectId({decryptedObjectId:user2_finished_articleId})]
                    }
                },
            }
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRoot.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('6.2 user2 add article to collection with ele array duplicate', async function () {
            expectedErrorRc = controllerHelperError.eleArrayContainDuplicateEle.rc
            data.values = {
                [e_part.EDIT_SUB_FIELD]:{
                    [e_field.COLLECTION.ARTICLES_ID]:{
                        [e_subField.TO]:user1.encryptedObjectId({decryptedObjectId:user1.topCollectionId}),
                        [e_subField.ELE_ARRAY]:[user1.encryptedObjectId({decryptedObjectId:user2_finished_articleId}),user1.encryptedObjectId({decryptedObjectId:user2_finished_articleId})]
                    }
                },
            }
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('6.3 user2 add article to collection with ele array contain un exist object id', async function () {
            expectedErrorRc = controllerHelperError.eleArrayRecordIdNotExists.rc
            data.values = {
                [e_part.EDIT_SUB_FIELD]:{
                    [e_field.COLLECTION.ARTICLES_ID]:{
                        [e_subField.TO]:user1.encryptedObjectId({decryptedObjectId:user1.topCollectionId}),
                        [e_subField.ELE_ARRAY]:[user1.encryptedObjectId({decryptedObjectId:testData.unExistObjectId})]
                    }
                },
            }
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('6.4 user1 add article to collection with to recorder not exist', async function () {
            expectedErrorRc = controllerError.logic.put.fromToRecordIdNotExists.rc
            data.values = {
                [e_part.EDIT_SUB_FIELD]:{
                    [e_field.COLLECTION.ARTICLES_ID]:{
                        [e_subField.TO]:user1.encryptedObjectId({decryptedObjectId:testData.unExistObjectId}),
                        [e_subField.ELE_ARRAY]:[user1.encryptedObjectId({decryptedObjectId:user2_finished_articleId})]
                    }
                },
            }
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('6.5 user1 add article to collection with to recorder not self owner', async function () {
            expectedErrorRc = controllerError.logic.put.notOwnFromToRecordId.rc
            data.values = {
                [e_part.EDIT_SUB_FIELD]:{
                    [e_field.COLLECTION.ARTICLES_ID]:{
                        [e_subField.TO]:user1.encryptedObjectId({decryptedObjectId:user2.topCollectionId}),
                        [e_subField.ELE_ARRAY]:[user1.encryptedObjectId({decryptedObjectId:user2_finished_articleId})]
                    }
                },
            }
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('6.6 user1 add article to collection with to recorder not self owner', async function () {
            expectedErrorRc = controllerError.logic.put.notOwnFromToRecordId.rc
            data.values = {
                [e_part.EDIT_SUB_FIELD]:{
                    [e_field.COLLECTION.ARTICLES_ID]:{
                        [e_subField.TO]:user1.encryptedObjectId({decryptedObjectId:user2.topCollectionId}),
                        [e_subField.ELE_ARRAY]:[user1.encryptedObjectId({decryptedObjectId:user2_finished_articleId})]
                    }
                },
            }
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('6.7 user1 add not finished article', async function () {
            expectedErrorRc = controllerError.logic.put.articleStatusNotFinished.rc
            data.values = {
                [e_part.EDIT_SUB_FIELD]:{
                    [e_field.COLLECTION.ARTICLES_ID]:{
                        [e_subField.TO]:user1.encryptedObjectId({decryptedObjectId:user1.topCollectionId}),
                        [e_subField.ELE_ARRAY]:[user1.encryptedObjectId({decryptedObjectId:user2_not_finished_articleId})]
                    }
                },
            }
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        })
        it('6.8 user1 add finished article exceed num', async function () {
            let origNum=await class_user.c_user.getResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_ARTICLE_PER_COLLECTION,resourceType:e_resourceType.BASIC})
            await class_user.c_user.setResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_ARTICLE_PER_COLLECTION,resourceType:e_resourceType.BASIC,num:0})

            expectedErrorRc = resourceCheckError.ifEnoughResource_async.totalArticleNumInCollectionExceed({}).rc
            data.values = {
                [e_part.EDIT_SUB_FIELD]:{
                    [e_field.COLLECTION.ARTICLES_ID]:{
                        [e_subField.TO]:user1.encryptedObjectId({decryptedObjectId:user1.topCollectionId}),
                        [e_subField.ELE_ARRAY]:[user1.encryptedObjectId({decryptedObjectId:user2_finished_articleId})]
                    }
                },
            }
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

            await class_user.c_user.setResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_ARTICLE_PER_COLLECTION,resourceType:e_resourceType.BASIC,num:origNum})
        })
        it('6.9 user1 try to collect user3s article again', async function () {
            // let origNum=await class_user.c_user.getResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_ARTICLE_PER_COLLECTION,resourceType:e_resourceType.BASIC})
            // await class_user.c_user.setResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_ARTICLE_PER_COLLECTION,resourceType:e_resourceType.BASIC,num:0})

            expectedErrorRc = controllerError.logic.put.alreadyCollect.rc
            data.values = {
                [e_part.EDIT_SUB_FIELD]:{
                    [e_field.COLLECTION.ARTICLES_ID]:{
                        [e_subField.TO]:user1.encryptedObjectId({decryptedObjectId:user1.topCollectionId}),
                        [e_subField.ELE_ARRAY]:[user1.encryptedObjectId({decryptedObjectId:user3_finished_articleId})]
                    }
                },
            }
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

            // await class_user.c_user.setResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_ARTICLE_PER_COLLECTION,resourceType:e_resourceType.BASIC,num:origNum})
        })
        it('6.10 user1 add finished article to default(top level) collection success', async function () {
            // let origNum=await class_user.c_user.getResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_ARTICLE_PER_COLLECTION,resourceType:e_resourceType.BASIC})
            // await class_user.c_user.setResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_ARTICLE_PER_COLLECTION,resourceType:e_resourceType.BASIC,num:0})

            expectedErrorRc = 0
            data.values = {
                [e_part.EDIT_SUB_FIELD]:{
                    [e_field.COLLECTION.ARTICLES_ID]:{
                        [e_subField.TO]:user1.encryptedObjectId({decryptedObjectId:user1.topCollectionId}),
                        [e_subField.ELE_ARRAY]:[user1.encryptedObjectId({decryptedObjectId:user2_finished_articleId})]
                    }
                },
            }
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

            // await class_user.c_user.setResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_ARTICLE_PER_COLLECTION,resourceType:e_resourceType.BASIC,num:origNum})
        })
        it('6.11 user1 move finished article from default to new collection success', async function () {
            // let origNum=await class_user.c_user.getResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_ARTICLE_PER_COLLECTION,resourceType:e_resourceType.BASIC})
            // await class_user.c_user.setResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_ARTICLE_PER_COLLECTION,resourceType:e_resourceType.BASIC,num:0})

            expectedErrorRc = 0
            data.values = {
                [e_part.EDIT_SUB_FIELD]:{
                    [e_field.COLLECTION.ARTICLES_ID]:{
                        [e_subField.TO]:user1.encryptedObjectId({decryptedObjectId:user1.topCollectionId}),
                        [e_subField.ELE_ARRAY]:[user1.encryptedObjectId({decryptedObjectId:user2_finished_articleId})]
                    }
                },
            }
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

            // await class_user.c_user.setResourceProfileSetting_async({resourceRange:e_resourceRange.MAX_ARTICLE_PER_COLLECTION,resourceType:e_resourceType.BASIC,num:origNum})
        })
    })
})



