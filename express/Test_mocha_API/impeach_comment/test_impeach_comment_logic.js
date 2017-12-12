/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


const request=require('supertest')
const app=require('../../app')
const adminApp=require('../../../express_admin/app')
const assert=require('assert')

const server_common_file_require=require('../../server_common_file_require')
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field
//for fkValue check
const e_chineseFieldName=require('../../server/constant/genEnum/inputRule_field_chineseName').ChineseName

const iniSettingObject=require(`../../server/constant/genEnum/initSettingObject`).iniSettingObject

const e_documentStatus=server_common_file_require.mongoEnum.DocumentStatus.DB
const e_adminPriorityType=server_common_file_require.mongoEnum.AdminPriorityType.DB
const e_penalizeType=server_common_file_require.mongoEnum.PenalizeType.DB
const e_penalizeSubType=server_common_file_require.mongoEnum.PenalizeSubType.DB
// const e_impeachState=server_common_file_require.mongoEnum.ImpeachState.DB
const e_impeachUserAction=server_common_file_require.mongoEnum.ImpeachUserAction.DB
// const e_impeachAdminAction=server_common_file_require.mongoEnum.ImpeachAdminAction.DB

const common_operation_model=server_common_file_require.common_operation_model
const e_dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
const controllerCheckerError=server_common_file_require.helperError.checker
const helperError=server_common_file_require.helperError.helper
// const common_operation_model=server_common_file_require.common_operation_model

const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper= server_common_file_require.db_operation_helper
const testData=server_common_file_require.testData//require('../testData')
const API_helper=server_common_file_require.API_helper//require('../API_helper/API_helper')
const component_function=server_common_file_require.component_function
const misc_helper=server_common_file_require.misc_helper

const controllerError=require('../../server/controller/impeach_comment/impeach_comment_setting/impeach_comment_controllerError').controllerError

let  baseUrl="/impeach_comment/",finalUrl,url
let adminUser1Info,adminUser2Info,adminUser3Info,adminUser1Id,adminUser2Id,adminUser3Id,adminUser1Sess,adminUser2Sess,adminUser3Sess,adminUser1Data,adminUser2Data,adminUser3Data
let user1Info,user2Info,user3Info,user1Id,user2Id,user3Id,user1Sess,user2Sess,user3Sess,user1Data,user2Data,user3Data
let adminRootSess,adminRootId,data={values:{}}

let impeach1Id,impeach2Id,impeach3Id,article1Id,article2Id,article3Id,impeachComment1Id,impeachComment2Id
let recordId,expectedErrorRc

let normalRecord={
    [e_field.IMPEACH_COMMENT.IMPEACH_ID]:undefined,
    [e_field.IMPEACH_COMMENT.CONTENT]:`test for test test`,
    // [e_field.IMPEACH_ACTION.OWNER_ID]:undefined, //普通用户无需操作此字段
}

/*              create_impeach_comment中的错误               */
describe('create impeach comment', async function() {


    data={values:{method:e_method.CREATE}}

    before('user1  login and create article and impeach', async function(){
        url=''
        finalUrl=baseUrl+url
        // parameter[`APIUrl`]=finalUrl
        user1Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        user1Id=user1Info[`userId`]
        user1Sess=user1Info[`sess`]

        user2Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user2,app:app})
        user2Id=user2Info[`userId`]
        user2Sess=user2Info[`sess`]

        user3Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user3,app:app})
        user3Id=user3Info[`userId`]
        user3Sess=user3Info[`sess`]



        article1Id=await component_function.createArticle_setToFinish_returnArticleId_async({userSess:user1Sess,app:app})
        impeach1Id=await API_helper.createImpeachForArticle_returnImpeachId_async({articleId:article1Id,userSess:user1Sess,app:app})
        normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeach1Id
        //提交impeach
        let impeachActionInfo={
            [e_field.IMPEACH_ACTION.ACTION]:e_impeachUserAction.SUBMIT,
            [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeach1Id,
        }
        await API_helper.createImpeachAction_async({sess:user1Sess,impeachActionInfo:impeachActionInfo,app:app})

        adminRootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})

        /*          user2 create a impeach, but delete it, then no one can add comment to it            */
        article2Id=await component_function.createArticle_setToFinish_returnArticleId_async({userSess:user2Sess,app:app})
        impeach2Id=await API_helper.createImpeachForArticle_returnImpeachId_async({articleId:article2Id,userSess:user2Sess,app:app})
        await API_helper.delete_impeach_async({impeachId:impeach2Id,userSess:user2Sess,app:app})

        /*              user3 create impeach, not submit                */
        article3Id=await component_function.createArticle_setToFinish_returnArticleId_async({userSess:user3Sess,app:app})
        impeach3Id=await API_helper.createImpeachForArticle_returnImpeachId_async({articleId:article3Id,userSess:user3Sess,app:app})

        console.log(`==============================================================`)
        console.log(`=================    before all done      ====================`)
        console.log(`==============================================================`)
    });

    /*              userType check              */
    it('userType check, admin not allow for submit', async function() {
        data.values={}
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:controllerCheckerError.userTypeNotExpected.rc,app:app})

    });


    /*              fk exists check            */
    it('fk:IMPEACH_ID not exists', async function() {
        data.values={}
        let copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=testData.unExistObjectId
        data.values[e_part.RECORD_INFO]=copyNormalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        let expectedErrorRc=controllerHelperError.fkValueNotExist(e_chineseFieldName.impeach_action.impeachId,normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]).rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

    });

    /*              fk exists check(impeachId already deleted)            */
    it('fk:IMPEACH_ID already deleted', async function() {
        data.values={}
        let copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeach2Id
        data.values[e_part.RECORD_INFO]=copyNormalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        let expectedErrorRc=controllerHelperError.fkValueNotExist(e_chineseFieldName.impeach_action.impeachId,normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]).rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

    });

    /*              authorization check            */
    it('authorization check: user2 not creator try to add impeach comment', async function() {
        data.values={}
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:controllerError.notImpeachCreatorCantCreateComment.rc,app:app})
    });
    /*              logic: user3 try to add comment for not submitted impeach3, and not allow            */
    it('user3 try to add impeach comment for non submit impeach', async function() {
        data.values={}
        let copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]=impeach3Id
        data.values[e_part.RECORD_INFO]=copyNormalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:controllerError.impeachNotSubmitNoNeedToAddComment.rc,app:app})
    });
    /*              logic: reuse not finished impeach comment           */
    it('user1 reuse not finished impeach comment', async function() {
        data.values={}
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        let result=await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:0,app:app})
        let notFinishedCommentId=result[`msg`]
        let newResult=await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:0,app:app})
        assert.deepStrictEqual(notFinishedCommentId, newResult[`msg`])
    });

    /*              特定字段处理（content内部处理，无法XSS检查）           */
/*    it('content XSS check', async function() {
        data.values={}
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:controllerError.notImpeachCreatorCantCreateComment.rc,app:app})
    });*/

})



/*              create_impeach_comment中的错误               */
describe('update impeach comment', async function() {

    data={values:{method:e_method.UPDATE}}

    before('user1  login and create article and impeach and impeachComment', async function(){
        url=''
        finalUrl=baseUrl+url
        // parameter[`APIUrl`]=finalUrl
        user1Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        user1Id=user1Info[`userId`]
        user1Sess=user1Info[`sess`]

        user2Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user2,app:app})
        user2Id=user2Info[`userId`]
        user2Sess=user2Info[`sess`]

        article1Id=await component_function.createArticle_setToFinish_returnArticleId_async({userSess:user1Sess,app:app})
        impeach1Id=await API_helper.createImpeachForArticle_returnImpeachId_async({articleId:article1Id,userSess:user1Sess,app:app})
        normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeach1Id
        //提交impeach
        let impeachActionInfo={
            [e_field.IMPEACH_ACTION.ACTION]:e_impeachUserAction.SUBMIT,
            [e_field.IMPEACH_ACTION.IMPEACH_ID]:impeach1Id,
        }
        await API_helper.createImpeachAction_async({sess:user1Sess,impeachActionInfo:impeachActionInfo,app:app})

        adminRootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})


        impeachComment1Id=await API_helper.createImpeachComment_returnId_async({sess:user1Sess,impeachId:impeach1Id,app:app})


        /*          user2 create a impeach, then but delete it, then no one can add comment to it            */
        article2Id=await component_function.createArticle_setToFinish_returnArticleId_async({userSess:user2Sess,app:app})
        impeach2Id=await API_helper.createImpeachForArticle_returnImpeachId_async({articleId:article2Id,userSess:user2Sess,app:app})
        impeachComment2Id=await API_helper.createImpeachComment_returnId_async({sess:user1Sess,impeachId:impeach1Id,app:app})
        await API_helper.delete_impeach_async({impeachId:impeach2Id,userSess:user2Sess,app:app})

        console.log(`impeachComment1Id============>${impeachComment1Id}`)
        console.log(`==============================================================`)
        console.log(`=================    before all done      ====================`)
        console.log(`==============================================================`)
    });

    /*              userType check              */
    it('userType check', async function() {
        data.values={}
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.RECORD_ID]=impeachComment1Id
        data.values[e_part.METHOD]=e_method.UPDATE
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:controllerCheckerError.userTypeNotExpected.rc,app:app})

    });


    /*              fk exists check（server get real impeachId through recordId）            */
    it('fk:IMPEACH_ID not exists for update', async function() {

        data.values={}

        let copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=testData.unExistObjectId

        data.values[e_part.RECORD_ID]=impeachComment1Id
        data.values[e_part.RECORD_INFO]=copyNormalRecord
        data.values[e_part.METHOD]=e_method.UPDATE

        // let expectedErrorRc=controllerHelperError.fkValueNotExist(e_chineseFieldName.impeach_action.impeachId,normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]).rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:0,app:app})

    });

    /*              fk exists check（deleted impeach means fk check fail）            */
    it('user2 try to update impeachComment2 with related impeach2 already be deleted', async function() {

        data.values={}

        let copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeach2Id

        data.values[e_part.RECORD_ID]=impeachComment2Id
        data.values[e_part.RECORD_INFO]=copyNormalRecord
        data.values[e_part.METHOD]=e_method.UPDATE

        let expectedErrorRc=controllerHelperError.fkValueNotExist(e_chineseFieldName.impeach_action.impeachId,normalRecord[e_field.IMPEACH_ACTION.IMPEACH_ID]).rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });


    /*              updated record not exist            */
    it('user1 update unexist impeach comment', async function() {
        data.values={}

        data.values[e_part.RECORD_ID]=testData.unExistObjectId
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.METHOD]=e_method.UPDATE
        expectedErrorRc=controllerError.impeachCommentNotExist.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    /*              authorization check            */
    it('authorization check: user2 not creator try to update user1 impeach comment', async function() {
        data.values={}

        data.values[e_part.RECORD_ID]=impeachComment1Id
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.METHOD]=e_method.UPDATE

        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:controllerError.notImpeachCreatorCantUpdateComment.rc,app:app})
    });

    /*                    特定字段处理                  */
    it('user1 content XSS check', async function() {
        data.values={}
        let copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.IMPEACH_COMMENT.CONTENT]="<script>alert('test')</script>"
        data.values[e_part.RECORD_ID]=impeachComment1Id
        data.values[e_part.RECORD_INFO]=copyNormalRecord
        data.values[e_part.METHOD]=e_method.UPDATE

        expectedErrorRc=helperError.XSSCheckFailed('content').rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
     });

    /*                                      */
    it('user1 try to update committed impeach comment(cant update impeach comment)', async function() {
        data.values={}
        let copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.IMPEACH_COMMENT.CONTENT]="test for test test test"
        data.values[e_part.RECORD_ID]=impeachComment1Id
        data.values[e_part.RECORD_INFO]=copyNormalRecord
        data.values[e_part.METHOD]=e_method.UPDATE

        expectedErrorRc=0
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        expectedErrorRc=controllerError.impeachCommentAlreadyCommitCantBeUpdate.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
})

