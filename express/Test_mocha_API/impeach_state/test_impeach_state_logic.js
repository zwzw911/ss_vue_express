/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


const request=require('supertest')
const app=require('../../app')
const assert=require('assert')

const server_common_file_require=require('../../server_common_file_require')
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field
const e_impeachState=mongoEnum.ImpeachState.DB

// const common_operation_model=server_common_file_require.common_operation_model
const e_dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
const controllerCheckerError=server_common_file_require.helperError.checker

const controllerError=require('../../server/controller/impeach_state/impeach_state_setting/impeach_state_controllerError').controllerError

const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const test_helper= server_common_file_require.db_operation_helper
const testData=server_common_file_require.testData//require('../testData')
const API_helper=server_common_file_require.API_helper//require('../API_helper/API_helper')





let data = {values: {}},  baseUrl="/impeach_state/",finalUrl=''
let user1Sess,user2Sess,user4Sess,user1Id,user2Id,impeachId1,impeachId2,impeachId4,articleId

/*              create_impeach_state中的错误               */
describe('create impeach_state error:', function() {
    finalUrl=baseUrl
    before('delete user1/2/3 then insert user1/2/3', async function(){
        /*              普通用户操作             */
        //测试没有impeach_state的输入
        await test_helper.deleteUserAndRelatedInfo_async({account:testData.user.user1ForModel.account})
        await  API_helper.createUser_async({userData:testData.user.user1,app:app})
        user1Sess=await  API_helper.userLogin_returnSess_async({userData:testData.user.user1,app:app})
        //测试第一个impeach_state不为NEW的输入，测试impeach_stete已经结束的输入
        await test_helper.deleteUserAndRelatedInfo_async({account:testData.user.user2ForModel.account})
        await  API_helper.createUser_async({userData:testData.user.user2,app:app})
        user2Sess=await  API_helper.userLogin_returnSess_async({userData:testData.user.user2,app:app})
        user2Id=await test_helper.getUserId_async({userAccount:testData.user.user2ForModel.account})

        //测试impeach删除的state的输入
        await test_helper.deleteUserAndRelatedInfo_async({account:testData.user.user4ForModel.account})
        await  API_helper.createUser_async({userData:testData.user.user4,app:app})
        user4Sess=await  API_helper.userLogin_returnSess_async({userData:testData.user.user4,app:app})
        // console.log(`user1Sess ${JSON.stringify(user1Sess)}`)
    });
    before('user1 create article', async function(){
        /*              普通用户操作             */
        articleId=await  API_helper.userCreateArticle_returnArticleId_async({userSess:user1Sess,app:app})
    });
    before('user1/2/3 create impeach1/2/3 for article', async function(){
        /*              普通用户操作             */
        impeachId1=await  API_helper.createImpeachForArticle_returnImpeachId_async({articleId:articleId,userSess:user1Sess,app:app})
        impeachId2=await  API_helper.createImpeachForArticle_returnImpeachId_async({articleId:articleId,userSess:user2Sess,app:app})
        impeachId4=await  API_helper.createImpeachForArticle_returnImpeachId_async({articleId:articleId,userSess:user4Sess,app:app})
        // console.log(`rootSess ${JSON.stringify(rootSess)}`)
    });

    it('impeachId not exist', function(done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_INFO]={
            [e_field.IMPEACH_STATE.IMPEACH_ID]:{value:'59d45aa2ec0c05121c34c27d'},
            [e_field.IMPEACH_STATE.STATE]:{value:e_impeachState.ASSIGN},
        }
        // console.log(`data=====>${JSON.stringify(data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[user1Sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,controllerHelperError.fkValueNotExist('impeachId').rc)
                done();
            });
    });

    it('user1 try to change state for impeach2 which not create by user2', function(done) {
        data.values={}
        data.values[e_part.METHOD]=e_method.CREATE
        // console.log(`Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]})=========>${JSON.stringify(Object.assign(testData.admin_user.user1,{[e_field.ADMIN_USER.USER_PRIORITY]:[99999]}))}`)
        data.values[e_part.RECORD_INFO]={
            [e_field.IMPEACH_STATE.IMPEACH_ID]:{value:impeachId2},
            [e_field.IMPEACH_STATE.STATE]:{value:e_impeachState.ASSIGN},
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
                    [e_field.IMPEACH_STATE.IMPEACH_ID]:{value:impeachId1},
                    [e_field.IMPEACH_STATE.STATE]:{value:e_impeachState.ASSIGN},
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
                        [e_field.IMPEACH_STATE.IMPEACH_ID]:{value:impeachId2},
                        [e_field.IMPEACH_STATE.STATE]:{value:e_impeachState.ASSIGN},
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
                    [e_field.IMPEACH_STATE.IMPEACH_ID]:{value:impeachId2},
                    [e_field.IMPEACH_STATE.STATE]:{value:e_impeachState.ASSIGN},
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
            [e_field.IMPEACH_STATE.IMPEACH_ID]:{value:impeachId4},
            [e_field.IMPEACH_STATE.STATE]:{value:e_impeachState.NEW},
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
            [e_field.IMPEACH_STATE.IMPEACH_ID]:{value:impeachId4},
            [e_field.IMPEACH_STATE.STATE]:{value:e_impeachState.ASSIGN},
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
                        [e_field.IMPEACH_STATE.IMPEACH_ID]:{value:impeachId4},
                        [e_field.IMPEACH_STATE.STATE]:{value:e_impeachState.ASSIGN},
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






