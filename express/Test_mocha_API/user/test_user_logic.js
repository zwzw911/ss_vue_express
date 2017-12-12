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

// const common_operation_model=server_common_file_require.common_operation_model
// const dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
const controllerCheckerError=server_common_file_require.helperError.checker

const controllerError=require('../../server/controller/user/user_logic/user_controllerError').controllerError

const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper=server_common_file_require.db_operation_helper//require("../API_helper/db_operation_helper")
const testData=server_common_file_require.testData//require('../testData')
const API_helper=server_common_file_require.API_helper//require('../API_helper/API_helper')
const component_function=server_common_file_require.component_function

const image_path_for_test=server_common_file_require.appSetting.absolutePath.image_path_for_test

let baseUrl="/user/"
let userId  //create后存储对应的id，以便后续的update操作





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
        sess=await  API_helper.userLogin_returnSess_async({userData:testData.user.user1,app:app})
        await db_operation_helper.deleteUserAndRelatedInfo_async({account:testData.user.user2.account})
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
        data.values[e_part.RECORD_INFO]={account:testData.user.user1.account.value,name:'anotherName'}//,notExist:{value:123}
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
        data.values[e_part.RECORD_INFO]={password:newPassword,name:'anotherName'}//,notExist:{value:123}
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

    after("rollback testData.user.user1's update account", function(done) {
        data.values.method=e_method.UPDATE
        // console.log(`testData.user.user1 ====> ${JSON.stringify(testData.user.user1)}`)
        data.values[e_part.RECORD_INFO]=testData.user.user1//,notExist:{value:123}
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

    after('delete new create user2', async function() {
        await db_operation_helper.deleteUserAndRelatedInfo_async({account:testData.user.user2.account})

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
        await db_operation_helper.deleteUserAndRelatedInfo_async({account:testData.user.user3NewAccount})

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