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


const e_dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule
/****************  公共错误 ********************/
const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
const controllerCheckerError=server_common_file_require.helperError.checker
const validatePartObjectIdEncryptedError=validateError.validatePartObjectIdEncrypted
// const helperError=server_common_file_require.helperError.helper
// const common_operation_model=server_common_file_require.common_operation_model
/****************  公共函数 ********************/
const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper= server_common_file_require.db_operation_helper
const testData=server_common_file_require.testData//require('../testData')

const userAPI=server_common_file_require.user_API//require('../API_helper/API_helper')
// const penalizeAPI=server_common_file_require.penalize_API
const commonAPI=server_common_file_require.common_API
const folderAPI=server_common_file_require.folder_API

// const userComponentFunction=server_common_file_require.user_component_function
// const adminUserComponentFunction=server_common_file_require.admin_user_component_function
const misc_helper=server_common_file_require.misc_helper
// const crypt=server_common_file_require.crypt
/****************  全局设置 ********************/
let globalConfiguration=server_common_file_require.globalConfiguration


/****************  变量 ********************/
let  baseUrl="/collection/",finalUrl,url
// //管理员登录信息
// let adminUser1Info,adminUser2Info,adminUser3Info,adminUser1Id,adminUser2Id,adminUser3Id,adminUser1Sess,adminUser2Sess,adminUser3Sess,adminUser1Data,adminUser2Data,adminUser3Data
// //用户登录信息
// let user1Info,user2Info,user3Info,user1Id,user2Id,user3Id,user1Sess,user2Sess,user3Sess,user1Data,user2Data,user3Data
// let userData,tmpResult,copyNormalRecord
let data={values:{}}
let expectedErrorRc
// let recordId1,recordId2,recordId3,expectedErrorRc
// let user1ParentFolderIdCrypted,user1ParentFolderIdGetByUser2Crypted

let normalRecord={
    // [e_field.FOLDER.AUTHOR_ID]:undefined,
    // [e_field.FOLDER.LEVEL]:undefined,
    [e_field.COLLECTION.NAME]:undefined,
    // [e_field.SEND_RECOMMEND.RECEIVERS]:undefined,
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


        await adminRoot.createPenalize_async({penalizeInfo:penalizeInfo,decryptedUserId:user3.userId})

        // ap.inf('test')
        // parameter[`APIUrl`]=finalUrl
        user1_articleId1=await user1.createArticleReturnEncryptedId_async({setStatusFinish:true})
        user1_decryptedArticleId1=user1.decryptedObjectId({encryptedObjectId:user1_articleId1})
        // ap.inf('user1ParentFolderIdGetByUser2Crypted',user1ParentFolderIdGetByUser2Crypted)
        console.log(`==============================================================`)
        console.log(`=================    before all done      ====================`)
        console.log(`==============================================================`)
    });

    /***************    create    ***************/
    it('1.1 user not login', async function() {
        expectedErrorRc=controllerError.dispatch.post.notLoginCantCreateCollection.rc
        let sess=await userAPI.getFirstSession({app})
        // ap.inf('sess',sess)
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('1.2 user in penalize cant create', async function() {
        expectedErrorRc=controllerError.dispatch.post.userInPenalizeCantCreateCollection.rc
        // let sess=await API_helper.getFirstSession({app})
        // ap.inf('sess',user3.sess)
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('1.3 user1 send req with incorrect part', async function() {
        expectedErrorRc=validateError.validateFormat.inputValuePartNotMatch.rc
        let copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.COLLECTION.NAME]='test'
        // copyNormalRecord[e_field.SEND_RECOMMEN.RECEIVERS]=[]
        data={
            values:{
                [e_part.RECORD_ID]:testData.unExistObjectId
            }
        }
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:user1.app})
    });
    it('1.4 user1 send req with part empty', async function() {
        expectedErrorRc=validateError.validateFormat.recordInfoCantEmpty.rc
        let copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.COLLECTION.NAME]=''
        // copyNormalRecord[e_field.SEND_RECOMMEN.RECEIVERS]=[]
        data={
            values:{
                [e_part.RECORD_INFO]:{},
            }
        }
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:user1.app})
    });
    it('1.5 user1 send req with name empty', async function() {
        expectedErrorRc=browserInputRule.collection.name.minLength.error.rc
        let copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.COLLECTION.NAME]=''
        // copyNormalRecord[e_field.SEND_RECOMMEN.RECEIVERS]=[]
        data={
            values:{
                [e_part.RECORD_INFO]:copyNormalRecord
            }
        }
        await misc_helper.postDataToAPI_compareFieldRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:user1.app,fieldName:'name'})
    });

    /***************    update name    ***************/
    describe('update collection name', function() {
        before('before update collection name', async function(){
            url='name'
            finalUrl=baseUrl+url
        })
        it('2.1 user not login', async function() {
            expectedErrorRc=controllerError.dispatch.put.notLoginCantUpdateCollectionName.rc
            let sess=await userAPI.getFirstSession({app})
            // ap.inf('sess',sess)
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('2.2 user in penalize cant update collection name', async function() {
            expectedErrorRc=controllerError.dispatch.put.userInPenalizeCantUpdateCollectionName.rc
            // let sess=await API_helper.getFirstSession({app})
            // ap.inf('sess',user3.sess)
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3.sess,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('2.3 encrypted record id incorrect', async function() {
            expectedErrorRc=validateError.validateFormat.inputValuePartRecordIdCryptedValueFormatWrong.rc
            let copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.COLLECTION.NAME]='test'
            // copyNormalRecord[e_field.SEND_RECOMMEN.RECEIVERS]=[]
            data={
                values:{
                    [e_part.RECORD_INFO]:copyNormalRecord,
                    [e_part.RECORD_ID]:'testId'
                }
            }
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('2.4 decrypted record id incorrect', async function() {
            expectedErrorRc=validateError.validateFormat.inputValuePartRecordIdDecryptedValueFormatWrong.rc
            let copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.COLLECTION.NAME]='test'
            // copyNormalRecord[e_field.SEND_RECOMMEN.RECEIVERS]=[]
            data={
                values:{
                    [e_part.RECORD_INFO]:copyNormalRecord,
                    [e_part.RECORD_ID]:user1.encryptedObjectId({decryptedObjectId:'gggggggggggggggggggggggg'})
                }
            }
            ap.inf('data',data)
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
    })
    describe('update collection content', function() {
        before('before update collection content', async function(){
            url='content'
            finalUrl=baseUrl+url
        })
        it('3.1 user not login', async function() {
            expectedErrorRc=controllerError.dispatch.put.notLoginCantUpdateCollectionContent.rc
            let sess=await userAPI.getFirstSession({app})
            // ap.inf('sess',sess)
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('3.2 user in penalize cant update collection name', async function() {
            expectedErrorRc=controllerError.dispatch.put.userInPenalizeCantUpdateCollectionContent.rc
            // let sess=await API_helper.getFirstSession({app})
            // ap.inf('sess',user3.sess)
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3.sess,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('3.3 encrypted record id incorrect', async function() {
            expectedErrorRc=validateError.validateFormat.inputValuePartRecordIdCryptedValueFormatWrong.rc
            let copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.COLLECTION.NAME]='test'
            // copyNormalRecord[e_field.SEND_RECOMMEN.RECEIVERS]=[]
            data={
                values:{
                    [e_part.RECORD_INFO]:copyNormalRecord,
                    [e_part.RECORD_ID]:'testId'
                }
            }
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('3.4 decrypted record id incorrect', async function() {
            expectedErrorRc=validateError.validateFormat.inputValuePartRecordIdDecryptedValueFormatWrong.rc
            let copyNormalRecord=objectDeepCopy(normalRecord)
            copyNormalRecord[e_field.COLLECTION.NAME]='test'
            // copyNormalRecord[e_field.SEND_RECOMMEN.RECEIVERS]=[]
            data={
                values:{
                    [e_part.RECORD_INFO]:copyNormalRecord,
                    [e_part.RECORD_ID]:user1.encryptedObjectId({decryptedObjectId:'gggggggggggggggggggggggg'})
                }
            }
            ap.inf('data',data)
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
    })
    /***************    delete collection    ***************/
    describe('delete collection', function() {
        before('before delete collection', async function(){
            url=''
            finalUrl=baseUrl+url
        })
        it('4.1 user not login', async function() {
            expectedErrorRc=controllerError.dispatch.delete.notLoginCantDeleteCollection.rc
            let sess=await userAPI.getFirstSession({app})
            // ap.inf('sess',sess)
            await misc_helper.deleteAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('4.2 user in penalize cant update collection name', async function() {
            expectedErrorRc=controllerError.dispatch.delete.userInPenalizeCantDeleteCollection.rc
            // let sess=await API_helper.getFirstSession({app})
            // ap.inf('sess',user3.sess)
            await misc_helper.deleteAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3.sess,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('4.3 encrypted record id incorrect', async function() {
            expectedErrorRc=validateError.validateFormat.inputValuePartRecordIdCryptedValueFormatWrong.rc
            // let copyNormalRecord=objectDeepCopy(normalRecord)
            // copyNormalRecord[e_field.COLLECTION.NAME]='test'
            // copyNormalRecord[e_field.SEND_RECOMMEN.RECEIVERS]=[]
            data={
                values:{
                    // [e_part.RECORD_INFO]:copyNormalRecord,
                    [e_part.RECORD_ID]:'testId'
                }
            }
            await misc_helper.deleteAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('4.4 decrypted record id incorrect', async function() {
            expectedErrorRc=validateError.validateFormat.inputValuePartRecordIdDecryptedValueFormatWrong.rc
            // let copyNormalRecord=objectDeepCopy(normalRecord)
            // copyNormalRecord[e_field.COLLECTION.NAME]='test'
            // copyNormalRecord[e_field.SEND_RECOMMEN.RECEIVERS]=[]
            data={
                values:{
                    // [e_part.RECORD_INFO]:copyNormalRecord,
                    [e_part.RECORD_ID]:user1.encryptedObjectId({decryptedObjectId:'gggggggggggggggggggggggg'})
                }
            }
            // ap.inf('data',data)
            await misc_helper.deleteAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1.sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
    })
    /***************    get collection   list    ***************/
    describe('get  collection list', function() {
        before('before get  collection list', async function(){
            url=''
            finalUrl=baseUrl+url
        })
        it('5.1 user not login', async function() {
            expectedErrorRc=controllerError.dispatch.get.notLoginCantGetCollectionList.rc
            let sess=await userAPI.getFirstSession({app})
            // ap.inf('sess',sess)
            await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:sess,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('5.2 user in penalize cant get collection list', async function() {
            expectedErrorRc=controllerError.dispatch.get.userInPenalizeCantGetCollectionList.rc
            // let sess=await API_helper.getFirstSession({app})
            // ap.inf('sess',user3.sess)
            await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:user3.sess,expectedErrorRc:expectedErrorRc,app:app})
        });

    })
    /***************    get single collection content    ***************/
    describe('get collection content', function() {
        before('before get  collection content', async function(){
            url=''
            finalUrl=baseUrl+url
        })
        it('6.1 user not login', async function() {
            expectedErrorRc=controllerError.dispatch.get.notLoginCantGetCollectionContent.rc
            let sess=await userAPI.getFirstSession({app})
            // ap.inf('sess',sess)
            finalUrl=baseUrl+user1.encryptedObjectId({decryptedObjectId:testData.unExistObjectId})
            await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:sess,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('6.2 user in penalize cant get collection list', async function() {
            expectedErrorRc=controllerError.dispatch.get.userInPenalizeCantGetCollectionContent.rc
            // let sess=await API_helper.getFirstSession({app})
            // ap.inf('sess',user3.sess)
            finalUrl=baseUrl+user1.encryptedObjectId({decryptedObjectId:testData.unExistObjectId})
            await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:user3.sess,expectedErrorRc:expectedErrorRc,app:app})
        });
        /*it('6.3 encrypted collectionId incorrect', async function() {
            expectedErrorRc=controllerError.dispatch.get.encryptedObjectIdFormatInvalid.rc
            // let sess=await API_helper.getFirstSession({app})
            // ap.inf('sess',user3.sess)
            finalUrl=baseUrl+'gggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg'
            await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:user1.sess,expectedErrorRc:expectedErrorRc,app:app})
        });*/
        it('6.4 decrypted collectionId incorrect', async function() {
            expectedErrorRc=controllerError.dispatch.get.decryptedObjectIdFormatInvalid.rc
            // let sess=await API_helper.getFirstSession({app})
            // ap.inf('sess',user3.sess)
            finalUrl=baseUrl+user1.encryptedObjectId({decryptedObjectId:'gggggggggggggggggggggggg'})
            await misc_helper.getDataFromAPI_async({APIUrl:finalUrl,sess:user1.sess,expectedErrorRc:expectedErrorRc,app:app})
        });
    })
})



