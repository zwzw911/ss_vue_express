/**
 * Created by Ada on 2017/7/11.
 */
'use strict'


const request=require('supertest')
const app=require('../../app')
const assert=require('assert')

const e_part=require('../../server/constant/enum/node').ValidatePart
const e_method=require('../../server/constant/enum/node').Method

const common_operation=require('../../server/model/mongo/operation/common_operation')
const dbModel=require('../../server/model/mongo/dbModel')

const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=require('../../server/constant/error/validateError').validateError
const helpError=require('../../server/constant/error/controller/helperError').helper

const contollerError=require('../../server/controller/user/user').controllerError

const objectDeepCopy=require('../../server/function/assist/misc').objectDeepCopy

let baseUrl="/user/"
let userId  //create后存储对应的id，以便后续的update操作
let newUser1={name:{value:'123456789'},account:{value:'15921776540'},password:{value:'123456'}}
let newUser2={name:{value:'zw'},account:{value:'15921776549'},password:{value:'654321'}}
let newUser3={name:{value:'ada'},account:{value:'wei.ag.zhang@alcate-sbell.com.cn'},password:{value:'654321'}}
let user3NewAccount='1952206639@qq.com'

let notExistUser={name:{value:'test'},account:{value:'13912341234'},password:{value:'123456'}}

let newUser1ForModel={name:'123456789',account:'15921776540',password:'123456'}
let newUser2ForModel={name:'zw',account:'15921776549',password:'654321'}
let newUser3ForModel={name:'ada',account:'wei.ag.zhang@alcate-sbell.com.cn',password:'654321'}
let notExistUseForModelr={name:'test',account:'13912341234',password:'123456'}
// let correctValueForModel={name:'123456789',account:'15921776543',password:'123456'}
// let copyValue={name:{value:'123456789'},account:{value:'15921776543'},password:{value:'123456'}}

describe('user format check:', function() {
    let data = {values: {recordInfo: {}}}, url = ``, finalUrl = baseUrl + url


    it('miss part method', function(done) {
        // data.values[e_part.RECORD_INFO]={account:{value:'1'}}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,helpError.methodPartMustExistInDispatcher.rc)
                done();
            });
    });

    it('method is unknown value', function(done) {
        data.values[e_part.METHOD]=10
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,validateError.validateFormat.inputValuePartMethodValueFormatWrong.rc)
                done();
            });
    });
})



describe('user(register) rule check', function() {
    let data={values:{recordInfo:{},method:e_method.CREATE}},url=``,finalUrl=baseUrl+url

    it('miss require field name', function(done) {
        data.values[e_part.RECORD_INFO]={account:{value:'1'}}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                done();
            });
    });
    it('require field name too short', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'1'}}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.format.error.rc)
                done();
            });
    });
    it('require field name too long', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'123456789012345678901234567890'}}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.format.error.rc)
                done();
            });
    });

    it('miss require field account', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'123456789'}}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.account.rc,browserInputRule.user.account.require.error.rc)
                done();
            });
    });
    it('require field account not phone or email', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'123456789'},account:{value:'1'}}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.account.rc,browserInputRule.user.account.format.error.rc)
                done();
            });
    });


    it('miss require field password', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'123456789'},account:{value:'15921776543'}}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.password.rc,browserInputRule.user.password.require.error.rc)
                done();
            });
    });
    it('require field password not match', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'123456789'},account:{value:'15921776543'},password:{value:'1'}}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.msg.password.rc,browserInputRule.user.password.format.error.rc)
                done();
            });
    });

    it('not exist field check', function(done) {
        data.values[e_part.RECORD_INFO]={name:{value:'123456789'},account:{value:'15921776543'},password:{value:'1'},notExist:{value:123}}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // assert.deepStrictEqual(parsedRes.rc,99999)
                assert.deepStrictEqual(parsedRes.rc,validateError.validateFormat.recordInfoFiledRuleNotDefine.rc)
                done();
            });
    });


})



describe('user(register) correct value:', function() {
    let data={values:{recordInfo:{},method:e_method.CREATE}},url=``,finalUrl=baseUrl+url
    before('delete exist user1', async function(){
        /*              清理已有数据              */
        console.log(`######   delete exist record   ######`)
        // console.log(`correctValueForModel ${JSON.stringify(correctValueForModel)}`)
        let condition=objectDeepCopy(newUser1ForModel)
        delete condition['name']
        delete condition['password']
        console.log(`condition ${JSON.stringify(condition)}`)
        let result=await common_operation.find({dbModel:dbModel.user,condition:condition})
        console.log(`find result ${JSON.stringify(result)}`)
        if(0===result.rc && result.msg[0]){
            let userId=result.msg[0]['id']
            // console.log(`find id ${JSON.stringify(userId)}`)
            result=await common_operation.deleteOne({dbModel:dbModel.user,condition:condition})
            result=await common_operation.deleteOne({dbModel:dbModel.sugar,condition:{userId:userId}})
            result=await common_operation.deleteOne({dbModel:dbModel.user_friend_group,condition:{userId:userId}})
            // console.log(`delete result is ${JSON.stringify(result)}`)
        }
        // done()
    });

    it('user1 register', function(done) {
        data.values[e_part.RECORD_INFO]=newUser1//
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

describe('user(register) unique check:', function() {
    let data = {values: {recordInfo: {}, method: e_method.CREATE}}, url = ``, finalUrl = baseUrl + url
    it('register unique name check fail', function(done) {
        data.values[e_part.RECORD_INFO]=newUser1//
        // console.log(``)
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,contollerError.nameAlreadyExists.rc)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    });

    it('register unique account check fail', function(done) {
        let user1Tmp=objectDeepCopy(newUser1)
        user1Tmp['name']['value']='19912341234'
        data.values[e_part.RECORD_INFO]=user1Tmp
        // console.log(` data.values[e_part.RECORD_INFO] ${JSON.stringify( data.values[e_part.RECORD_INFO])}`)
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,contollerError.accountAlreadyExists.rc)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    });
})

describe('POST /user/uniqueCheck_async ', function() {
    let data={values:{}},url='uniqueCheck_async',finalUrl=baseUrl+url

    it('unique name check', function(done) {
        data.values[e_part.SINGLE_FIELD]={name:{value:newUser1.name.value}}//,notExist:{value:123}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,contollerError.nameAlreadyExists.rc)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    });

    it('unique account check', function(done) {
        data.values[e_part.SINGLE_FIELD]={account:{value:newUser1.account.value}}//,notExist:{value:123}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,contollerError.accountAlreadyExists.rc)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    });

    it('unique: not support field check', function(done) {
        data.values[e_part.SINGLE_FIELD]={password:{value:'123456'}}//,notExist:{value:123}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,contollerError.fieldNotSupport.rc)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    });

    it('unique name check ok', function(done) {
        data.values[e_part.SINGLE_FIELD]={name:{value:'anotherName'}}//,notExist:{value:123}
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



describe(' user1 login:', function() {
    let data={values:{method:e_method.MATCH}},url='',finalUrl=baseUrl+url


    it('user not exist', function(done) {
        let notExistUserTmp=objectDeepCopy(notExistUser)
        delete notExistUserTmp['name']
        console.log(`notExistUserTmp ${JSON.stringify(notExistUserTmp)}`)
        data.values[e_part.RECORD_INFO]=notExistUserTmp//,notExist:{value:123}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,contollerError.accountNotExist.rc)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })

    it('user login with wrong password', function(done) {
        let user1Tmp=objectDeepCopy(newUser1)
        delete user1Tmp['name']        //使用账号登录
        // condition['account']['value']='12341234132'
        // console.log(`user1Tmp==============> ${JSON.stringify(user1Tmp)}`)
        user1Tmp['password']['value']='12341234132'
        // console.log(`user1Tmp==============> ${JSON.stringify(user1Tmp)}`)
        // console.log(`newUser1==============> ${JSON.stringify(newUser1)}`)
        data.values[e_part.RECORD_INFO]=user1Tmp//,notExist:{value:123}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,contollerError.accountPasswordNotMatch.rc)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })

    it('user login field number not expected', function(done) {
        let user1Tmp=objectDeepCopy(newUser1)
        // delete user1Tmp['password']
        data.values[e_part.RECORD_INFO]=user1Tmp//,notExist:{value:123}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,contollerError.loginFieldNumNotExpected.rc)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })

    it('user login miss mandatory field', function(done) {
        let user1Tmp=objectDeepCopy(newUser1)
        delete user1Tmp['password']
        data.values[e_part.RECORD_INFO]=user1Tmp//,notExist:{value:123}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,contollerError.loginMandatoryFieldNotExist('field').rc)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })




    it('user login correct', function(done) {
        console.log(`newUser1 ${JSON.stringify(newUser1)}`)
        let user1Tmp=objectDeepCopy(newUser1)
        delete user1Tmp['name']
        data.values[e_part.RECORD_INFO]=user1Tmp//,notExist:{value:123}
        console.log(`data.values ${JSON.stringify(data.values)}`)

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
    before('user login first before update', function(done) {
        data.values.method=e_method.MATCH
        let user1Tmp=objectDeepCopy(newUser1)
        delete user1Tmp['name']
        // delete user1Tmp['password']
        data.values[e_part.RECORD_INFO]=user1Tmp//,notExist:{value:123}
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ${JSON.stringify(res['header']['set-cookie'][0].split(';')[0])}`)
                sess=res['header']['set-cookie'][0].split(';')[0]
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                console.log(`sess==============> ${JSON.stringify(sess)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })
/*    after('delete exist create user2', async function() {
        let user2ModelTmp=objectDeepCopy(newUser2ForModel)
        delete user2ModelTmp['name']
        delete user2ModelTmp['password']
        // let condition={name:{value:'test'},account:{value:'12341234123'}}
        // delete condition['password']
        console.log(`user2ModelTmp==============> ${JSON.stringify(user2ModelTmp)}`)
        let result=await common_operation.find({dbModel:dbModel.user,condition:user2ModelTmp})
        console.log(`find result==============> ${JSON.stringify(result)}`)
        if(0===result.rc && result.msg[0]){
            let userId=result.msg[0]['id']
            // console.log(`find id ${JSON.stringify(userId)}`)
            result=await common_operation.deleteOne({dbModel:dbModel.user,condition:user2ModelTmp})
            result=await common_operation.deleteOne({dbModel:dbModel.sugar,condition:{userId:userId}})
            result=await common_operation.deleteOne({dbModel:dbModel.user_friend_group,condition:{userId:userId}})
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

    it('update user1 with  account not change', function(done) {
        data.values.method=e_method.UPDATE
        data.values[e_part.RECORD_INFO]={account:{value:newUser1.account.value},name:{value:'anotherName'}}//,notExist:{value:123}
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
    it('update user1 with  password change', function(done) {
        data.values.method=e_method.UPDATE
        data.values[e_part.RECORD_INFO]={password:{value:newPassword},name:{value:'anotherName'}}//,notExist:{value:123}
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
        let user1Tmp=objectDeepCopy(newUser1)
        delete user1Tmp['name']
        user1Tmp['password']['value']=newPassword
        // delete user1Tmp['password']
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
        data.values[e_part.RECORD_INFO]=newUser2//
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

    it('update user1 name with same account as user2', function(done) {
        let user1UpdateTmp=objectDeepCopy(newUser2)
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
                assert.deepStrictEqual(parsedRes.rc,contollerError.accountAlreadyExists.rc)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })

    it('update user1 account successfully(must disable duration check in updateUser_async)', function(done) {
        data.values.method=e_method.UPDATE
        data.values[e_part.RECORD_INFO]={account:{value:'19912341234'}}//,notExist:{value:123}
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

    it('update user1 account too frequently(must enable duration check in updateUser_async)', function(done) {
        data.values.method=e_method.UPDATE
        data.values[e_part.RECORD_INFO]={account:{value:'11912341235'}}//,notExist:{value:123}
        request.agent(app).post(finalUrl).set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ${JSON.stringify(res['header']['set-cookie']['connect.sid'])}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,contollerError.accountCantChange.rc)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })

    after("rollback user1's update account", function(done) {
        data.values.method=e_method.UPDATE
        data.values[e_part.RECORD_INFO]={account:{value:newUser1.account.value}}//,notExist:{value:123}
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
        let user2ModelTmp=objectDeepCopy(newUser2ForModel)
        delete user2ModelTmp['name']
        delete user2ModelTmp['password']
        // let condition={name:{value:'test'},account:{value:'12341234123'}}
        // delete condition['password']
        let result=await common_operation.find({dbModel:dbModel.user,condition:user2ModelTmp})
        // console.log(`find result ${JSON.stringify(result)}`)
        if(0===result.rc && result.msg[0]){
            let userId=result.msg[0]['id']
            // console.log(`find id ${JSON.stringify(userId)}`)
            result=await common_operation.deleteOne({dbModel:dbModel.user,condition:user2ModelTmp})
            result=await common_operation.deleteOne({dbModel:dbModel.sugar,condition:{userId:userId}})
            result=await common_operation.deleteOne({dbModel:dbModel.user_friend_group,condition:{userId:userId}})
            // console.log(`delete result is ${JSON.stringify(result)}`)
        }
    })
})


describe('retrieve password: ', function() {
    let data = {values:{}}, url = '', finalUrl = baseUrl + url,sess
    // let sess
    it('create new user3)', function(done) {
        data.values.method=e_method.CREATE
        data.values[e_part.RECORD_INFO]=newUser3//
        request(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })

    it('user3 login correct', function(done) {
        // console.log(`newUser3 ${JSON.stringify(newUser1)}`)
        data.values.method=e_method.MATCH
        let user3Tmp=objectDeepCopy(newUser3)
        delete user3Tmp['name']
        data.values[e_part.RECORD_INFO]=user3Tmp//,notExist:{value:123}
        console.log(`data.values ${JSON.stringify(data.values)}`)

        request.agent(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                sess=res['header']['set-cookie'][0].split(';')[0]
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })

    it('user3 login correct', function(done) {
        // console.log(`newUser3 ${JSON.stringify(newUser1)}`)
        data.values.method=e_method.MATCH
        let user3Tmp=objectDeepCopy(newUser3)
        delete user3Tmp['name']
        data.values[e_part.RECORD_INFO]=user3Tmp//,notExist:{value:123}
        console.log(`data.values ${JSON.stringify(data.values)}`)

        request.agent(app).post(finalUrl).set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                sess=res['header']['set-cookie'][0].split(';')[0]
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
                done();
            });
    })

    it('user3 update new account', function(done) {
        // console.log(`newUser3 ${JSON.stringify(newUser1)}`)
        data.values.method=e_method.UPDATE
        data.values[e_part.RECORD_INFO]={account:{value:user3NewAccount},}//,notExist:{value:123}
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

    it('user3 use current account retrieve password', function(done) {
        // console.log(`newUser3 ${JSON.stringify(newUser1)}`)
        url='retrievePassword'
        finalUrl=baseUrl+url
        delete data.values[e_part.METHOD]
        delete data.values[e_part.RECORD_INFO]
        data.values[e_part.SINGLE_FIELD]={account:{value:user3NewAccount},}//,notExist:{value:123}
        console.log(`data.values ${JSON.stringify(data.values)}`)
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
})