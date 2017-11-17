/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


const request=require('supertest')
const adminApp=require('../../app')
const app=require('../../../express/app')
const assert=require('assert')

const server_common_file_require=require('../../server_common_file_require')
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field
const enumValue=require('../../server/constant/genEnum/enumValue')


//for fkValue check
const e_chineseFieldName=require('../../server/constant/genEnum/inputRule_field_chineseName').ChineseName

const e_adminUserType=server_common_file_require.mongoEnum.AdminUserType.DB
const e_adminPriorityType=server_common_file_require.mongoEnum.AdminPriorityType.DB
const e_impeachAdminAction=server_common_file_require.mongoEnum.ImpeachAdminAction.DB
const e_impeachUserAction=server_common_file_require.mongoEnum.ImpeachUserAction.DB
const e_penalizeType=server_common_file_require.mongoEnum.PenalizeType.DB
const e_penalizeSubType=server_common_file_require.mongoEnum.PenalizeSubType.DB
const e_impeachState=server_common_file_require.mongoEnum.ImpeachState.DB
// const common_operation_model=server_common_file_require.common_operation_model
// const dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
const controllerCheckerError=server_common_file_require.helperError.checker
// const helperError=server_common_file_require.helperError.checker

const controllerError=require('../../server/controller/impeach_action/impeach_action_setting/impeach_action_controllerError').controllerError

const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper= server_common_file_require.db_operation_helper
const testData=server_common_file_require.testData//require('../testData')
const API_helper=server_common_file_require.API_helper//require('../API_helper/API_helper')
const component_function=server_common_file_require.component_function
const misc_helper=server_common_file_require.misc_helper

let adminUser1Info,adminUser2Info,adminUser3Info,adminUser1Id,adminUser2Id,adminUser3Id,adminUser1Sess,adminUser2Sess,adminUser3Sess,adminUser1Data,adminUser2Data,adminUser3Data
let user1Info,user2Info,user3Info,user1Id,user2Id,user3Id,user1Sess,user2Sess,user3Sess,user1Data,user2Data,user3Data
let adminRootSess,adminRootId,data={values:{}}

let impeach1Id,impeach2Id,impeach3Id
let article1Id,article2Id,article3Id

let impeachActionInfo
let  baseUrl="/impeach_action/",finalUrl,url

let normalRecord={
    [e_field.IMPEACH_ACTION.IMPEACH_ID]:undefined,
    [e_field.IMPEACH_ACTION.ACTION]:e_impeachAdminAction.ASSIGN,
    [e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]:undefined,
    // [e_field.IMPEACH_STATE.OWNER_ID]:undefined,

}
/*              create_impeach_state中的错误               */
describe('create impeach action', async function() {
    url=''
    finalUrl=baseUrl+url

    before('root admin user login', async function(){
        // parameter[`APIUrl`]=finalUrl
        /*              首先创建普通admin，以便利用rootAdmin还有所有权限的特性              */
        adminRootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        // adminRootId=db_operation_helper.getAdminUserId_async({userName:testData.admin_user.adminUser1.name})
        /*              adminUser1 only has deal priority           */
        adminUser1Data=Object.assign({},testData.admin_user.adminUser1,{[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.IMPEACH_DEAL]})
        // console.log(`adminUser1Data================>${JSON.stringify(adminUser1Data)}`)
        adminUser1Info=await component_function.reCreateAdminUser_returnSessUserId_async({userData:adminUser1Data,rootSess:adminRootSess,adminApp:adminApp})
        adminUser1Sess=adminUser1Info[`sess`]
        adminUser1Id=adminUser1Info[`userId`]
        /*              adminUser2 only has assign priority           */
        adminUser2Data=Object.assign({},testData.admin_user.adminUser2,{[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.IMPEACH_ASSIGN]})
        adminUser2Info=await component_function.reCreateAdminUser_returnSessUserId_async({userData:adminUser2Data,rootSess:adminRootSess,adminApp:adminApp})
        adminUser2Sess=adminUser2Info[`sess`]
        adminUser2Id=adminUser2Info[`userId`]

        /*              再创建root admin，只有create的权限，以便测试adminUer1/2的权限是否正确              */
        /*              reCreate root user without IMPEACH priority                 */
        let adminRootData=Object.assign({},testData.admin_user.adminRoot,{[e_field.ADMIN_USER.USER_PRIORITY]:[e_adminPriorityType.CREATE_ADMIN_USER]})
        await component_function.reCreateAdminRoot_async({adminRootData:adminRootData})
        adminRootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        adminRootId=db_operation_helper.getAdminUserId_async({userName:testData.admin_user.adminUser1.name})



        /*              普通用户user1创建一个impeach，并且submit                */
        user1Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        // let {sess:user1Sess,userId:user1Id}=user1Info
        user1Sess=user1Info[`sess`]
        user1Id=user1Info[`userId`]
        // console.log(`user1Sess===============================>${JSON.stringify(user1Sess)}`)
        article1Id=await component_function.createArticle_setToFinish_returnArticleId_async({userSess:user1Sess,app:app})
        impeach1Id=await API_helper.createImpeachForArticle_returnImpeachId_async({articleId:article1Id,userSess:user1Sess,app:app})
        //submit impeach
        impeachActionInfo={
            [e_field.IMPEACH_ACTION.ACTION]:e_impeachUserAction.SUBMIT,
            [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeach1Id,
        }
        await API_helper.createImpeachAction_async({sess:user1Sess,impeachActionInfo:impeachActionInfo,app:app})



        /*              普通用户user2创建一个impeach，并且已经结束                */
        user2Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user2,app:app})
        // let {sess:user2Sess,userId:user2Id}=user2Info
        user2Sess=user2Info[`sess`]
        user2Id=user2Info[`userId`]
        article2Id=await component_function.createArticle_setToFinish_returnArticleId_async({userSess:user2Sess,app:app})
        impeach2Id=await API_helper.createImpeachForArticle_returnImpeachId_async({articleId:article1Id,userSess:user2Sess,app:app})
        //submit impeach
        impeachActionInfo={
            [e_field.IMPEACH_ACTION.ACTION]:e_impeachUserAction.SUBMIT,
            [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeach2Id,
        }
        await API_helper.createImpeachAction_async({sess:user2Sess,impeachActionInfo:impeachActionInfo,app:app})
        //assign impeach
        impeachActionInfo={
            [e_field.IMPEACH_ACTION.ACTION]:e_impeachAdminAction.ASSIGN,
            [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeach2Id,
            [e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]:adminUser1Id,
        }
        await API_helper.createImpeachAction_async({sess:adminUser2Sess,impeachActionInfo:impeachActionInfo,app:adminApp})
        //accept impeach
        impeachActionInfo={
            [e_field.IMPEACH_ACTION.ACTION]:e_impeachAdminAction.ACCEPT,
            [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeach2Id,
            [e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]:adminUser1Id,
        }
        await API_helper.createImpeachAction_async({sess:adminUser1Sess,impeachActionInfo:impeachActionInfo,app:adminApp})
        //finish impeach
        impeachActionInfo={
            [e_field.IMPEACH_ACTION.ACTION]:e_impeachAdminAction.FINISH,
            [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeach2Id,
            [e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]:adminUser1Id,
        }
        await API_helper.createImpeachAction_async({sess:adminUser1Sess,impeachActionInfo:impeachActionInfo,app:adminApp})

        /*              普通用户user3创建一个impeach，并且删除(无法测试，被fkValueCheck截胡了)                */
        user3Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user3,app:app})
        // let {sess:user3Sess,userId:user3Id}=user3Info
        user3Sess=user3Info[`sess`]
        user3Id=user3Info[`userId`]
        article3Id=await component_function.createArticle_setToFinish_returnArticleId_async({userSess:user3Sess,app:app})
        impeach3Id=await API_helper.createImpeachForArticle_returnImpeachId_async({articleId:article3Id,userSess:user3Sess,app:app})
        // console.log(`impeach3Id===============>${impeach3Id}`)
        await API_helper.delete_impeach_async({impeachId:impeach3Id,userSess:user3Sess,app:app})


        normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeach1Id
        // normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachAdminAction.ASSIGN
    });


    /*              userType wrong             */
    it(`userType check`, async function(){
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE

        let copy=objectDeepCopy(normalRecord)
        copy[e_field.IMPEACH_ACTION.ACTION]=e_impeachAdminAction.ASSIGN
        copy[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]=adminUser1Id

        data.values[e_part.RECORD_INFO]=copy
        // console.log(`user1Sess============>${JSON.stringify(user1Sess)}`)
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:controllerCheckerError.userTypeNotExpected.rc,app:adminApp})
    })
    /*              action not allow for adminUser            */
    it(`action not allow for admin`, async function(){
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        let copy=objectDeepCopy(normalRecord)

        copy[e_field.IMPEACH_ACTION.ACTION]=e_impeachUserAction.CREATE
        copy[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]=adminUser1Id

        data.values[e_part.RECORD_INFO]=copy
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser2Sess,data:data,expectedErrorRc:controllerError.invalidActionForAdminUser.rc,app:adminApp})
    })
    /*            priority check             */
    it(`adminUser1 has no priority to assign impeachId1 to adminUser2`, async function(){
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        let copy=objectDeepCopy(normalRecord)
        copy[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeach1Id
        copy[e_field.IMPEACH_ACTION.ACTION]=e_impeachAdminAction.ASSIGN
        copy[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]=adminUser2Id
        data.values[e_part.RECORD_INFO]=copy
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:controllerError.userHasNoPriorityToThisOption.rc,app:adminApp})
    })
    /*            admin owner id must be set for every admin action            */
    it(`miss admin owner id`, async function(){
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        let copy=objectDeepCopy(normalRecord)
        copy[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeach1Id
        copy[e_field.IMPEACH_ACTION.ACTION]=e_impeachAdminAction.ASSIGN
        // copy[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]=adminUser2Id
        data.values[e_part.RECORD_INFO]=copy
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser2Sess,data:data,expectedErrorRc:controllerError.ownerIdMustExists.rc,app:adminApp})
    })


    /*              fk exists check            */
    it('fk:IMPEACH_ID not exists', async function() {
        data.values={}
        let copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=testData.unExistObjectId
        copyNormalRecord[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]=adminUser1Id
        copyNormalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachAdminAction.ASSIGN

        data.values[e_part.RECORD_INFO]=copyNormalRecord

        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser2Sess,data:data,expectedErrorRc:controllerHelperError.fkValueNotExist(e_chineseFieldName.impeach_action.impeachId,testData.unExistObjectId).rc,app:adminApp})
    });
    it('adminUser1 try to create action while current owner is adminUser2', async function() {
        data.values={}
        let copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachAdminAction.FINISH
        copyNormalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeach1Id
        copyNormalRecord[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]=adminUser1Id

        data.values[e_part.RECORD_INFO]=copyNormalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:controllerError.forbidToTakeActionForCurrentImpeach.rc,app:adminApp})

    });
    it('adminUser1 try to finish impeachId2 again', async function() {
        data.values={}
        let copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachAdminAction.FINISH
        copyNormalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeach2Id
        copyNormalRecord[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]=adminUser1Id

        data.values[e_part.RECORD_INFO]=copyNormalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:controllerError.invalidActionBaseOnCurrentAction.rc,app:adminApp})
    });

    /*
    /!*无法测试，被fkValueCheck截胡了*!/
    it('adminUser1 try to finish deleted impeachId3', async function() {
        data.values={}
        let copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachAdminAction.FINISH
        copyNormalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeach3Id
        copyNormalRecord[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]=adminUser1Id

        data.values[e_part.RECORD_INFO]=copyNormalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:controllerError.relatedImpeachAlreadyDeleted.rc,app:adminApp})
    });
    /!*无法测试，被actionBasePrevious截胡了*!/
    it('adminUser1 try to accept  deleted impeachId2', async function() {
        data.values={}
        let copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachAdminAction.ACCEPT
        copyNormalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeach2Id
        copyNormalRecord[e_field.IMPEACH_ACTION.ADMIN_OWNER_ID]=adminUser1Id

        data.values[e_part.RECORD_INFO]=copyNormalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminUser1Sess,data:data,expectedErrorRc:controllerError.impeachAlreadyDone.rc,app:adminApp})
    });*/


    after(`rollback adminRoot priority configure`, async function(){
        /*              reCreate root user without all priority                 */
        let adminUser=Object.assign({},testData.admin_user.adminRoot,{[e_field.ADMIN_USER.USER_PRIORITY]:enumValue.AdminPriorityType})
        await component_function.reCreateAdminRoot_async({adminRootData:adminUser})
    })
})
