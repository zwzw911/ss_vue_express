/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


const request=require('supertest')
const app=require('../../app')
const assert=require('assert')
const ap=require(`awesomeprint`)

const server_common_file_require=require('../../server_common_file_require')
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field

// const common_operation_model=server_common_file_require.common_operation_model
// const dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
const controllerCheckerError=server_common_file_require.helperError.checker

const controllerError=require('../../server/controller/user/user_setting/user_controllerError').controllerError

const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper=server_common_file_require.db_operation_helper//require("../API_helper/db_operation_helper")
const testData=server_common_file_require.testData//require('../testData')
const API_helper=server_common_file_require.API_helper//require('../API_helper/API_helper')
const component_function=server_common_file_require.component_function

const image_path_for_test=server_common_file_require.appSetting.absolutePath.image_path_for_test

const misc_help=server_common_file_require.misc_helper
// const misc_helper=server_common_file_require.misc_helper
let baseUrl="/user/"
let userId  //create后存储对应的id，以便后续的update操作

let adminUser1Info,adminUser2Info,adminUser3Info,adminUser1Id,adminUser2Id,adminUser3Id,adminUser1Sess,adminUser2Sess,adminUser3Sess,adminUser1Data,adminUser2Data,adminUser3Data
let user1Info,user2Info,user3Info,user1Id,user2Id,user3Id,user1Sess,user2Sess,user3Sess,user1Data,user2Data,user3Data
let userData,tmpResult,copyNormalRecord



describe('user1 register unique check:', function() {
    let data = {values: {recordInfo: {}, method: e_method.CREATE}}, url = ``, finalUrl = baseUrl + url
    before('prepare', async function () {
        await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
    });
    it('register unique name check fail', function(done) {
        data.values[e_part.RECORD_INFO]=testData.user.user1//
        // console.log(``)
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, controllerCheckerError.fieldValueUniqueCheckError({collName:e_coll.USER, fieldName:e_field.USER.NAME}).rc)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    });

    it('register unique account check fail', function(done) {
        let user1Tmp=objectDeepCopy(testData.user.user1)
        user1Tmp['name']='19912341234'
        data.values[e_part.RECORD_INFO]=user1Tmp
        // console.log(` data.values[e_part.RECORD_INFO] ${JSON.stringify( data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,controllerCheckerError.fieldValueUniqueCheckError({collName:e_coll.USER, fieldName:e_field.USER.ACCOUNT}).rc)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    });
})

describe('POST /user/uniqueCheck_async ', function() {
    let data={values:{}},url='uniqueCheck_async',finalUrl=baseUrl+url

    it('single field unique name check', function(done) {
        data.values[e_part.SINGLE_FIELD]={name:testData.user.user1.name}//,notExist:{value:123}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,controllerCheckerError.fieldValueUniqueCheckError({collName:e_coll.USER, fieldName:e_field.USER.NAME}).rc)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    });

    it('unique account check', function(done) {
        data.values[e_part.SINGLE_FIELD]={account:testData.user.user1.account}//,notExist:{value:123}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,controllerCheckerError.fieldValueUniqueCheckError({collName:e_coll.USER, fieldName:e_field.USER.ACCOUNT}).rc)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    });

    it('unique: not support field check', function(done) {
        data.values[e_part.SINGLE_FIELD]={password:'123456'}//,notExist:{value:123}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,controllerError.fieldNotSupport.rc)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    });

    it('unique name check ok', function(done) {
        data.values[e_part.SINGLE_FIELD]={name:'notExistName'}//,notExist:{value:123}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    });
})



describe('user1 login:', function() {
    let data={values:{method:e_method.MATCH}},url='',finalUrl=baseUrl+url


    it('user not exist', function(done) {
        // console.log(`testData.user.userNotExist====>${JSON.stringify(testData.user.userNotExist)}`)
        let notExistUserTmp=objectDeepCopy(testData.user.userNotExist)
        // console.log(`notExistUserTmp====>${JSON.stringify(notExistUserTmp)}`)
        delete notExistUserTmp['name']
        delete notExistUserTmp['userType']
        // console.log(`notExistUserTmp ${JSON.stringify(notExistUserTmp)}`)
        data.values[e_part.RECORD_INFO]=notExistUserTmp//,notExist:{value:123}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,controllerError.accountNotExist.rc)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })

    it('user login with wrong password', function(done) {
        let user1Tmp=objectDeepCopy(testData.user.user1)
        delete user1Tmp['name']        //使用账号登录
        delete user1Tmp['userType']
        // condition['account']['value']='12341234132'
        // console.log(`testData.user.user1Tmp==============> ${JSON.stringify(testData.user.user1Tmp)}`)
        user1Tmp['password']='12341234132'
        // console.log(`testData.user.user1Tmp==============> ${JSON.stringify(testData.user.user1Tmp)}`)
        // console.log(`testData.user.user1==============> ${JSON.stringify(testData.user.user1)}`)
        data.values[e_part.RECORD_INFO]=user1Tmp//,notExist:{value:123}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,controllerError.accountPasswordNotMatch.rc)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })

    it('user login field number not expected', function(done) {
        let user1Tmp=objectDeepCopy(testData.user.user1)
        // delete testData.user.user1Tmp['password']
        data.values[e_part.RECORD_INFO]=user1Tmp//,notExist:{value:123}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,controllerError.loginFieldNumNotExpected.rc)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })

    it('user login miss mandatory field', function(done) {
        let user1Tmp=objectDeepCopy(testData.user.user1)
        delete user1Tmp['password']
        delete user1Tmp['userType']
        data.values[e_part.RECORD_INFO]=user1Tmp//,notExist:{value:123}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,controllerError.loginMandatoryFieldNotExist('field').rc)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })




    it('user login correct', function(done) {
        console.log(`testData.user.user1 ${JSON.stringify(testData.user.user1)}`)
        let user1Tmp=objectDeepCopy(testData.user.user1)
        delete user1Tmp['name']
        delete user1Tmp['userType']
        data.values[e_part.RECORD_INFO]=user1Tmp//,notExist:{value:123}
        // console.log(`data.values ${JSON.stringify(data.values)}`)

        request.agent(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ${JSON.stringify(res['header']['set-cookie'][0])}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })
})


describe('update user： ', function() {
    let data = {values:{method:e_method.MATCH}}, url = '', finalUrl = baseUrl + url

    let sess
    before('user login first before update', async function() {
        let userInfo=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        sess=userInfo['sess']
        await db_operation_helper.deleteUserAndRelatedInfo_async({account:testData.user.user2.account,name:testData.user.user2.name})
        // console.log(`sess ======>${JSON.stringify(sess)}`)
    })
/*    after('delete exist create testData.user.user2', async function() {
        let testData.user.user2ModelTmp=objectDeepCopy(testData.user.user2ForModel)
        delete testData.user.user2ModelTmp['name']
        delete testData.user.user2ModelTmp['password']
        // let condition={name:{value:'test'},account:{value:'12341234123'}}
        // delete condition['password']
        console.log(`testData.user.user2ModelTmp==============> ${JSON.stringify(testData.user.user2ModelTmp)}`)
        let result=await common_operation_model.find({dbModel:dbModel.user,condition:testData.user.user2ModelTmp})
        console.log(`find result==============> ${JSON.stringify(result)}`)
        if(0===result.rc && result.msg[0]){
            let userId=result.msg[0]['id']
            // console.log(`find id ${JSON.stringify(userId)}`)
            result=await common_operation_model.deleteOne({dbModel:dbModel.user,condition:testData.user.user2ModelTmp})
            result=await common_operation_model.deleteOne({dbModel:dbModel.sugar,condition:{userId:userId}})
            result=await common_operation_model.deleteOne({dbModel:dbModel.user_friend_group,condition:{userId:userId}})
            // console.log(`delete result is ${JSON.stringify(result)}`)
        }
    })*/

/*    it('user not exist in coll', function(done) {
        data.values[e_part.RECORD_INFO]={account:{value:'15921776543'},password:{value:'123456'}}//,notExist:{value:123}
        request(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                console.log(`res ${JSON.stringify(res['header']['set-cookie'][0].split(';')[0])}`)
                sess=res['header']['set-cookie'][0].split(';')[0]
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })*/
    it('update user1 with  upload photo png', function(done) {
        let finalUrl='/user/uploadPhoto'
        // data.values.method=e_method.UPDATE
        // data.values[e_part.RECORD_INFO]={account:{value:testData.user.user1.account.value},name:{value:'anotherName'}}//,notExist:{value:123}
        // console.log(`data.values ${JSON.stringify(data.values)}`)
        // console.log(`image_path_for_test======> ${JSON.stringify(image_path_for_test)}`)
        ap.wrn('${image_path_for_test}gm_test.png',`${image_path_for_test}gm_test.png`)
        request(app).post(finalUrl).field('name','file')
            // .attach('file','H:/ss_vue_express/培训结果1.png')
            .attach('file',`${image_path_for_test}gm_test.png`)
            // .attach('file','H:/ss_vue_express/gm_test.png')
            .set('Cookie',[sess])
            // .send(data)
            .set('Accept', 'application/json')
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ${JSON.stringify(res['header']['set-cookie']['connect.sid'])}`)
                console.log(`parsedRes ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })
    it('update user1 with  upload photo jpeg', function(done) {
        let finalUrl='/user/uploadPhoto'
        // data.values.method=e_method.UPDATE
        // data.values[e_part.RECORD_INFO]={account:{value:testData.user.user1.account.value},name:{value:'anotherName'}}//,notExist:{value:123}
        // console.log(`data.values ${JSON.stringify(data.values)}`)
        // console.log(`sess ${JSON.stringify(sess)}`)
        request(app).post(finalUrl).field('name','file')
        // .attach('file','H:/ss_vue_express/培训结果1.png')
            .attach('file',`${image_path_for_test}无标题.jpg`)
            // .attach('file','H:/ss_vue_express/gm_test.png')
            .set('Cookie',[sess])//.send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ${JSON.stringify(res['header']['set-cookie']['connect.sid'])}`)
                console.log(`parsedRes ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })
    it('update testData.user.user1 with account not change', function(done) {
        data.values.method=e_method.UPDATE
        data.values[e_part.RECORD_INFO]={account:testData.user.user1.account}//,notExist:{value:123}
        // console.log(`data.values ${JSON.stringify(data.values)}`)
        // console.log(`sess ${JSON.stringify(sess)}`)
        request.agent(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ${JSON.stringify(res['header']['set-cookie']['connect.sid'])}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })


    let newPassword='asdf456'
    it('update testData.user.user1 with  password change', function(done) {
        data.values.method=e_method.UPDATE
        data.values[e_part.RECORD_INFO]={password:newPassword}//,notExist:{value:123}
        // console.log(`data.values ${JSON.stringify(data.values)}`)
        console.log(`sess==============> ${JSON.stringify(sess)}`)
        request.agent(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ${JSON.stringify(res['header']['set-cookie']['connect.sid'])}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })
    it('check new password of user1 by login', function(done) {
        data.values.method=e_method.MATCH
        let user1Tmp=objectDeepCopy(testData.user.user1)
        delete user1Tmp['name']
        delete user1Tmp['userType']
        user1Tmp['password']=newPassword
        // delete testData.user.user1Tmp['password']
        data.values[e_part.RECORD_INFO]=user1Tmp//,notExist:{value:123}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ${JSON.stringify(res['header']['set-cookie'][0].split(';')[0])}`)
                // sess=res['header']['set-cookie'][0].split(';')[0]
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // console.log(`sess==============> ${JSON.stringify(sess)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })







    it('user2(register)  correct value', function(done) {
        data.values.method=e_method.CREATE
        data.values[e_part.RECORD_INFO]=testData.user.user2//
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    });

    it('update user1  with same account as user2', function(done) {
        let user1UpdateTmp=objectDeepCopy(testData.user.user2)
        delete user1UpdateTmp['name']
        delete user1UpdateTmp['password']
        delete user1UpdateTmp['userType']
        data.values.method=e_method.UPDATE
        data.values[e_part.RECORD_INFO]=user1UpdateTmp//,notExist:{value:123}
        request.agent(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ${JSON.stringify(res['header']['set-cookie']['connect.sid'])}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,controllerCheckerError.fieldValueUniqueCheckError({collName:e_coll.USER,fieldName:e_field.USER.ACCOUNT}).rc)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })

    it('update testData.user.user1 account successfully(must disable duration check in updateUser_async)', function(done) {
        data.values.method=e_method.UPDATE
        data.values[e_part.RECORD_INFO]={account:'19912341234'}//,notExist:{value:123}
        request.agent(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ${JSON.stringify(res['header']['set-cookie']['connect.sid'])}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })

    it('update testData.user.user1 account too frequently(must enable duration check in updateUser_async)', function(done) {
        data.values.method=e_method.UPDATE
        data.values[e_part.RECORD_INFO]={account:'11912341235'}//,notExist:{value:123}
        request.agent(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ${JSON.stringify(res['header']['set-cookie']['connect.sid'])}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,controllerError.accountCantChange.rc)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })

    after("rollback testData.user.user1's update account", async function() {
        await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})

    })

    after('delete new create user2', async function() {
        await db_operation_helper.deleteUserAndRelatedInfo_async({account:testData.user.user2.account,name:testData.user.user2.name})

    })
})

describe('change password:', function() {
    let data = {}, url = 'changePassword', finalUrl = baseUrl + url
    let newPassword='oiqier123'
    let user1Sess
    before('user login first before update', async function() {
        await db_operation_helper.deleteUserAndRelatedInfo_async({account:testData.user.user1.account,name:testData.user.user1.name})
        let userInfo=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        user1Sess=userInfo['sess']
    })


    it('inputValue miss mandatory recordInfo', async function() {
        // let finalUrl='/user/uploadPhoto'
        data={
            values:{
                [e_part.METHOD]:e_method.UPDATE,
            }

        }
        let expectedErrorRc=controllerError.changePasswordInputRecordInfoFormatInCorrect.rc
        await misc_help.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    })
    it('inputValue miss mandatory recordInfo field oldPassword', async function() {
        // let finalUrl='/user/uploadPhoto'
        data={
            values:{
                [e_part.METHOD]:e_method.UPDATE,
                [e_part.RECORD_INFO]:{
                    'oldPassword':testData.user.user1.password,
                    // 'newPassword':newPassword,
                },
            }

        }
        let expectedErrorRc=controllerError.changePasswordInputRecordInfoFormatInCorrect.rc
        await misc_help.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    })
    it('inputValue include extra method', async function() {
        // let finalUrl='/user/uploadPhoto'
        data={
            values:{
                [e_part.METHOD]:e_method.UPDATE,
                [e_part.RECORD_INFO]:{
                    'oldPassword':testData.user.user1.password,
                    'newPassword':newPassword,
                },
            }
        }
        let expectedErrorRc=controllerError.changePasswordInputFormatNotExpected.rc
        await misc_help.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    })

    it('inputValue miss mandatory field value', async function() {
        // let finalUrl='/user/uploadPhoto'
        data={
            values:{
                // [e_part.METHOD]:e_method.UPDATE,
                [e_part.RECORD_INFO]:{
                    'oldPassword':testData.user.user1.password,
                    'newPassword':null,
                },
            }
        }
        let expectedErrorRc=controllerError.missMandatoryField.rc
        await misc_help.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    })

    it('inputValue field value type incorrect', async function() {
        // let finalUrl='/user/uploadPhoto'
        data={
            values:{
                // [e_part.METHOD]:e_method.UPDATE,
                [e_part.RECORD_INFO]:{
                    'oldPassword':testData.user.user1.password,
                    'newPassword':[newPassword],
                },
            }
        }
        let expectedErrorRc=controllerError.fieldValueTypeIncorrect.rc
        await misc_help.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    })

    it('inputValue field value pattern incorrect', async function() {
        // let finalUrl='/user/uploadPhoto'
        data={
            values:{
                // [e_part.METHOD]:e_method.UPDATE,
                [e_part.RECORD_INFO]:{
                    'oldPassword':testData.user.user1.password,
                    'newPassword':'12',
                },
            }
        }
        let expectedErrorRc=controllerError.fieldValueFormatIncorrect.rc
        await misc_help.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    })

    it('inputValue old password incorrect', async function() {
        // let finalUrl='/user/uploadPhoto'
        data={
            values:{
                // [e_part.METHOD]:e_method.UPDATE,
                [e_part.RECORD_INFO]:{
                    'oldPassword':testData.user.user1.password+'1',
                    'newPassword':newPassword,
                },
            }
        }
        let expectedErrorRc=controllerError.oldPasswordIncorrect.rc
        await misc_help.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    })

    it('inputValue not change ', async function() {
        // let finalUrl='/user/uploadPhoto'
        data={
            values:{
                // [e_part.METHOD]:e_method.UPDATE,
                [e_part.RECORD_INFO]:{
                    'oldPassword':testData.user.user1.password,
                    'newPassword':testData.user.user1.password,
                },
            }
        }
        let expectedErrorRc=0
        await misc_help.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    })

    it('change password success ', async function() {
        // let finalUrl='/user/uploadPhoto'
        data={
            values:{
                // [e_part.METHOD]:e_method.UPDATE,
                [e_part.RECORD_INFO]:{
                    'oldPassword':testData.user.user1.password,
                    'newPassword':newPassword,
                },
            }
        }
        let expectedErrorRc=0
        await misc_help.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    })
})


describe('retrieve password: ', function() {
    let data = {values:{}}, url = '', finalUrl = baseUrl + url,sess
    before('recreate exist user3', async function(){
        let userInfo=await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user3,app:app})
        // console.log(`userInfo=======>${JSON.stringify(userInfo)}`)
        sess=userInfo[`sess`]
        // console.log(`sess=======>${JSON.stringify(sess)}`)
    });


    it('testData.user.user3 update new account', function(done) {
        // console.log(`testData.user.user3 ${JSON.stringify(testData.user.user1)}`)
        data.values.method=e_method.UPDATE
        data.values[e_part.RECORD_INFO]={account:testData.user.user3NewAccount,}//,notExist:{value:123}
        console.log(`data.values ${JSON.stringify(data.values)}`)
        // console.log(`sess==============> ${JSON.stringify(sess)}`)
        request.agent(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ${JSON.stringify(res['header']['set-cookie']['connect.sid'])}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });

    })



    it('testData.user.user3 use old(qq) account retrieve password', function(done) {
        // console.log(`testData.user.user3 ${JSON.stringify(testData.user.user1)}`)
        url='retrievePassword'
        finalUrl=baseUrl+url
        delete data.values[e_part.METHOD]
        delete data.values[e_part.RECORD_INFO]
        data.values[e_part.SINGLE_FIELD]={account:testData.user.user3.account,}//,notExist:{value:123}
        // console.log(`data.values ${JSON.stringify(data.values)}`)
        // console.log(`sess==============> ${JSON.stringify(sess)}`)
        request.agent(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ${JSON.stringify(res['header']['set-cookie']['connect.sid'])}`)
                // console.log()
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });

    })


    after('delete new create testData.user.user3', async function() {
        await db_operation_helper.deleteUserAndRelatedInfo_async({account:testData.user.user3NewAccount,name:testData.user.user3NewAccount.name})

    })
})



describe('captcha: ', function() {
    let url = 'captcha', finalUrl = baseUrl + url,sess
    it('captcha', function(done) {
        request.agent(app).post(finalUrl).set('Accept', 'application/json')
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ${JSON.stringify(res['header']['set-cookie']['connect.sid'])}`)
                sess=res['header']['set-cookie'][0].split(';')[0]
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });

    })

    it('captcha interval check fail', function(done) {
        request.agent(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess])
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ${JSON.stringify(res['header']['set-cookie']['connect.sid'])}`)

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,controllerError.intervalBetween2CaptchaTooShort.rc)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });

    })
})


describe('upload user photo by data url:', function() {
    let data={values:{method:e_method.UPLOAD}}
    let dataUrl='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAPb0lEQVR4nO3d+VOUd4LHcf6GqJPN6Uwllama3SRVmU02qWQnm5jRHK7GY3KMiZlEJ64Iyo3I2dw30tz3JZeczdnclwIiNwjddAOCaDK7M0mMHErT/d4fujE03dJgpoqu8FD1/kmt4ulXfaH70/2UFo+8FYmQ+WSx2d+AkABi1gkgZpYAYmYJIGaWAGJmCSBmlgBiZgkgZpYAYmYJIGaWAGJmCSBmlgBiZgkgZpYAYmYJIGaWAGJmCSBmlgBiZgkgZpYAYmYJIGaWAGJmCSBmllGQHbvEPP1BLP96OIkXPk7mhY+S+d3hJHZ+EMv2XeJN/6Z/yVn85+fB3O9oKG8dS+CISxF2IVX4JTYQlFxPQGIdXtHVWPkVs986nZc/Oa/7N0EPKITnD4Vt+sWZa9veDGLHG15GsygrDmA5SXEYZVWl9A3KUSgUyGQyRk…bYToSjlvXRduUJzcxONjQ1c7eqirbmGgbpzBifjPoj8LEsjlmjktgYYyG0RRwog6wAxHArvjYcwMtRJc3MzVVVVVFdX09LSQk11Kb3VzgYQyzO7Sn6WpWsndSD6GMhtBJD1g+hvU/eUIQwPdNLY2Eh1dTV1dXU0NTUhrSploM7DKAbKlSfExgAD+RkiI20FENMgq4dCL+5ORDMml9Hb20t7e/t9GElpIa0VQUYwXNCMe7A4cgr1qJXuhOhj3B06wZe2Lmx/WwBZEyQ90Y70RDvSdKUm2hMf74F7aCa2ojgsXSI44RjKcYdgjtn54+TuQlqCzapsSU2wJSXuFKnxVqTFn16RNYkxp/na8RxP7fnlf8hhvSC/fdOKV/edNcji2b2hrO6ZveHsfF/MU+9G8uSe8zy5J+J+T78bZvD3TfXMB6Fb4hMn6+6/wtn2ZojRhP+DyswSQMwsAcTMEkDMLAHEzBJAzCwBxMz6f9SU6ZZ2YGQaAAAAAElFTkSuQmCC'
    data.values[e_part.RECORD_INFO]={[e_field.USER.PHOTO_DATA_URL]:dataUrl}
    let finalUrl,url='',expectedErrorRc
    before('user1 recreate and login ', async function() {
        url = ''
        finalUrl = baseUrl + url
        // parameter[`APIUrl`]=finalUrl
        let user1Info = await component_function.reCreateUser_returnSessUserId_async({
            userData: testData.user.user1,
            app: app
        })
        user1Id = user1Info[`userId`]
        user1Sess = user1Info[`sess`]
    })

    it('user upload data url', async function(){
        url='uploadUserPhoto/'
        finalUrl = baseUrl + url
// ap.inf('user1Sess',user1Sess)
        expectedErrorRc=0
        await misc_help.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    })
})