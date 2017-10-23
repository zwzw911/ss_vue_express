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

const e_adminUserType=server_common_file_require.mongoEnum.AdminUserType.DB
const e_adminPriorityType=server_common_file_require.mongoEnum.AdminPriorityType.DB
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

const controllerError=require('../../server/controller/impeach_action/impeach_action_setting/impeach_state_controllerError').controllerError

const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper= server_common_file_require.db_operation_helper
const testData=server_common_file_require.testData//require('../testData')
const API_helper=server_common_file_require.API_helper//require('../API_helper/API_helper')
const component_function=server_common_file_require.component_function
// const db=require('../db_operation_helper/db_operation_helper')

let  baseUrl="/impeach_state/",finalUrl,url
let adminRootSess,adminUser1Sess,adminUser2Sess,adminUser3Sess,user1Sess,user1Id,user2Id

let normalRecord={
    [e_field.IMPEACH_STATE.IMPEACH_ID]:undefined,
    [e_field.IMPEACH_STATE.STATE]:e_impeachState.NEW,
    [e_field.IMPEACH_STATE.OWNER_COLL]:undefined,
    [e_field.IMPEACH_STATE.OWNER_ID]:undefined,

}
/*              create_impeach_state中的错误               */
describe('create impeach state', async function() {
    let data={values:{method:e_method.CREATE}}
    before('root admin user login', async function(){
        url=''
        finalUrl=baseUrl+url
        // parameter[`APIUrl`]=finalUrl
        let user1Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        user1Id=user1Info[`userId`]
        user1Sess=user1Info[`sess`]
        // console.log(`user1Sess==========${JSON.stringify(user1Sess)}`)
        adminRootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        // parameter['sess']=user1Sess
        // console.log(`adminRootSess==========${JSON.stringify(adminRootSess)}`)
        let articledId=await API_helper.createNewArticle_returnArticleId_async({userSess:user1Sess,app:app})
        let impeachId=await API_helper.createImpeachForArticle_returnImpeachId_async({articleId:articledId,userSess:user1Sess,app:app})
        normalRecord[e_field.IMPEACH_STATE.IMPEACH_ID]=impeachId

        // console.log(`userId==========${JSON.stringify(user1Id)}`)
        // console.log(`user1Sess==========${JSON.stringify(user1Sess)}`)
    });

    /*              userType check              */
    it('userType check', function(done) {
        data.values={}
        let copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.IMPEACH_STATE.IMPEACH_ID]="59d446dbbd708b15a4c11ae9"
        data.values[e_part.RECORD_INFO]=copyNormalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        console.log(`data=====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[adminRootSess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerCheckerError.userTypeNotExpected.rc)
                done();
            });
    });
    /*              normal user not allow to input ownerColl/id, ther are input in code            */
    it('ownerColl/id cant input from client', function(done) {
        data.values={}
        let copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.IMPEACH_STATE.IMPEACH_ID]="59d446dbbd708b15a4c11ae9"
        copyNormalRecord[e_field.IMPEACH_STATE.OWNER_COLL]=e_coll.USER
        copyNormalRecord[e_field.IMPEACH_STATE.OWNER_ID]=user1Id
        data.values[e_part.RECORD_INFO]=copyNormalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        console.log(`data=====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user1Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerError.normalUserForbidInputOwnerCollAndId.rc)
                done();
            });
    });
    /*              fk exists check            */
    it('fk:IMPEACH_ID not exists', function(done) {
        data.values={}
        let copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.IMPEACH_STATE.IMPEACH_ID]="59d446dbbd708b15a4c11ae9"
        data.values[e_part.RECORD_INFO]=copyNormalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        console.log(`data=====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user1Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerHelperError.fkValueNotExist(e_chineseFieldName.admin_penalize.punishedId,normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]).rc)
                done();
            });
    });
    it('fk:ownColl/ownId not exists', function(done) {
        data.values={}
        let copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.IMPEACH_STATE.OWNER_ID]=user1Id
        copyNormalRecord[e_field.IMPEACH_STATE.OWNER_COLL]=e_coll.ADMIN_USER
        data.values[e_part.RECORD_INFO]=copyNormalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        // data.values[e_part.RECORD_INFO]=Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:{value:['1','1']}})
        console.log(`data=====>${JSON.stringify(data.values)}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user1Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerHelperError.fkValueNotExist(e_chineseFieldName.admin_penalize.punishedId,normalRecord[e_field.ADMIN_PENALIZE.PUNISHED_ID]).rc)
                done();
            });
    });



    it('user1 try to change state for impeach2 which not create by user2', function(done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_INFO]={
            [e_field.IMPEACH_STATE.IMPEACH_ID]:impeachId2,
            [e_field.IMPEACH_STATE.STATE]:e_impeachState.ASSIGN,
        }
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user1Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerError.notCreatorOfImpeach.rc)
                done();
            });
    });

    it('user1 has no impeach_state', function(done) {
        /*              清除impeach_state                 */
        test_helper.deleteMany_async({dbModel:e_dbModel.impeach_state,condition:{[e_field.IMPEACH_STATE.IMPEACH_ID]:impeachId1}}).then(
            (v)=>{
                data.values={}
                data.values[e_part.METHOD]=e_method.CREATE
                // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
                data.values[e_part.RECORD_INFO]={
                    [e_field.IMPEACH_STATE.IMPEACH_ID]:impeachId1,
                    [e_field.IMPEACH_STATE.STATE]:e_impeachState.ASSIGN,
                }
                // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
                request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user1Sess]).send(data)
                    .end(function(err, res) {
                        // if (err) return done(err);
                        // console.log(`res ios ${JSON.stringify(res)}`)
                        let parsedRes=JSON.parse(res.text)
                        console.log(`parsedRes =========>${JSON.stringify(parsedRes)}`)
                        // assert.deepStrictEqual(parsedRes.rc,99999)
                        assert.deepStrictEqual(parsedRes.rc,controllerError.cantCreateSinceNoPreviousState.rc)
                        done();
                    });
            },
            (e)=>{}
        )

        /*            .then(
         (res)=>{
         let parsedRes=JSON.parse(res.text)
         console.log(`parsedRes =========>${JSON.stringify(parsedRes)}`)
         // assert.deepStrictEqual(parsedRes.rc,99999)
         assert.deepStrictEqual(parsedRes.rc,controllerError.notCreatorOfImpeach.rc)
         },
         (e)=>{console.log(`error is ${JSON.stringify(e)}`)}
         )*/

    });

    it('impeachId2 done then create state is not allow', function(done) {
        /*              清除impeach_state                 */
        // console.log(`impeachId2 ==========>${JSON.stringify(impeachId2)}`)
        let doc={
            [e_field.IMPEACH_STATE.DEALER_ID]:user2Id,
            [e_field.IMPEACH_STATE.DEALER_COLL]:e_coll.USER,
            [e_field.IMPEACH_STATE.OWNER_ID]:user2Id,
            [e_field.IMPEACH_STATE.DEALER_COLL]:e_coll.USER,
            [e_field.IMPEACH_STATE.IMPEACH_ID]:impeachId2,
            [e_field.IMPEACH_STATE.STATE]:e_impeachState.DONE
        }
        e_dbModel.impeach_state.create(doc)
            .then(
                (v)=>{
                    // console.log(`update result is =======>${JSON.stringify(v)}`)
                    data.values={}
                    data.values[e_part.METHOD]=e_method.CREATE
                    // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
                    data.values[e_part.RECORD_INFO]={
                        [e_field.IMPEACH_STATE.IMPEACH_ID]:impeachId2,
                        [e_field.IMPEACH_STATE.STATE]:e_impeachState.ASSIGN,
                    }
                    // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
                    request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user2Sess]).send(data)
                        .end(function(err, res) {
                            // if (err) return done(err);
                            // console.log(`res ios ${JSON.stringify(res)}`)
                            let parsedRes=JSON.parse(res.text)
                            console.log(`parsedRes =========>${JSON.stringify(parsedRes)}`)
                            // assert.deepStrictEqual(parsedRes.rc,99999)
                            assert.deepStrictEqual(parsedRes.rc,controllerError.impeachEndedNoMoreStateChangeAllow.rc)
                            done();
                        });
                },
                (e)=>{}
            )
    });

    it('user2 has no NEW state', function(done) {
        /*              清除impeach_state                 */
        // console.log(`impeachId2 ==========>${JSON.stringify(impeachId2)}`)
        let condition={[e_field.IMPEACH_STATE.IMPEACH_ID]:impeachId2}
        let changeFieldValue={[e_field.IMPEACH_STATE.STATE]:e_impeachState.ASSIGN}
        e_dbModel.impeach_state.update(condition,changeFieldValue)
            .then(
                (v)=>{
                    // console.log(`update result is =======>${JSON.stringify(v)}`)
                    data.values={}
                    data.values[e_part.METHOD]=e_method.CREATE
                    // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
                    data.values[e_part.RECORD_INFO]={
                        [e_field.IMPEACH_STATE.IMPEACH_ID]:impeachId2,
                        [e_field.IMPEACH_STATE.STATE]:e_impeachState.ASSIGN,
                    }
                    // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
                    request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user2Sess]).send(data)
                        .end(function(err, res) {
                            // if (err) return done(err);
                            // console.log(`res ios ${JSON.stringify(res)}`)
                            let parsedRes=JSON.parse(res.text)
                            console.log(`parsedRes =========>${JSON.stringify(parsedRes)}`)
                            // assert.deepStrictEqual(parsedRes.rc,99999)
                            assert.deepStrictEqual(parsedRes.rc,controllerError.firstStateMustBeNew.rc)
                            done();
                        });
                },
                (e)=>{}
            )
    });

    it('user4 input state NEW', function(done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_INFO]={
            [e_field.IMPEACH_STATE.IMPEACH_ID]:impeachId4,
            [e_field.IMPEACH_STATE.STATE]:e_impeachState.NEW,
        }
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user4Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes =========>${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerError.NEWStateNotAllow.rc)
                done();
            });
    });

    it('user4 input invalid state ASSIGN(ASSIGN for admin user)', function(done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_INFO]={
            [e_field.IMPEACH_STATE.IMPEACH_ID]:impeachId4,
            [e_field.IMPEACH_STATE.STATE]:e_impeachState.ASSIGN,
        }
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user4Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes =========>${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerError.invalidStateBaseOnCurrentState.rc)
                done();
            });
    });

    it('impeachId4 deleted, but user4 still try to change state not allow', function(done) {
        let condition={'_id':impeachId4}
        let changeFieldValue={'dDate':Date.now()}
        e_dbModel.impeach.update(condition,changeFieldValue)
            .then(
                (v)=>{
                    data.values={}
                    data.values[e_part.METHOD]=e_method.CREATE
                    // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
                    data.values[e_part.RECORD_INFO]={
                        [e_field.IMPEACH_STATE.IMPEACH_ID]:impeachId4,
                        [e_field.IMPEACH_STATE.STATE]:e_impeachState.ASSIGN,
                    }
                    // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
                    request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user4Sess]).send(data)
                        .end(function(err, res) {
                            // if (err) return done(err);
                            // console.log(`res ios ${JSON.stringify(res)}`)
                            let parsedRes=JSON.parse(res.text)
                            console.log(`parsedRes =========>${JSON.stringify(parsedRes)}`)
                            // assert.deepStrictEqual(parsedRes.rc,99999)
                            assert.deepStrictEqual(parsedRes.rc,controllerError.relatedImpeachAlreadyDeleted.rc)
                            done();
                        });
                }
            )

    });

})

