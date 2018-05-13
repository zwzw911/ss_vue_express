/**
 * Created by Ada on 2017/8/24.
 *
 * 模拟常用的REST_API
 *
 */
'use strict'
const request=require('supertest')
// const adminApp=require('../../express_admin/app')
// const app=require('../../express/app')
const assert=require('assert')

const ap=require(`awesomeprint`)
// const server_common_file_require=require('../../express_admin/server_common_file_require')
const nodeEnum=require(`../constant/enum/nodeEnum`)

const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_field=require('../constant/genEnum/DB_field').Field
const e_coll=require('../constant/genEnum/DB_Coll').Coll
const e_dbMoodel=require(`../constant/genEnum/dbModel`)

const objectDeepCopy=require(`../function/assist/misc`).objectDeepCopy
const db_operation_helper=require('./db_operation_helper')
const common_operation_model=require(`../model/mongo/operation/common_operation_model`)
const  redisOperation=require(`../model/redis/operation/redis_common_operation`)

const dataConvert=require(`../controller/dataConvert`)
async function removeExistsRecord_async(){
    await db_operation_helper.deleteAllModelRecord_async({})
}

/****************    Get tmp session     ****************/
//首次上，需要获得临时session
//无需传入任何数据
async function getFirstSession({app}){
    return new Promise(function(resolve,reject){
        request(app).post('/user/').set('Accept', 'application/json').send({})
            .end(function(err, res) {
                let returnSess=res['header']['set-cookie'][0].split(';')[0]
                let parsedRes=JSON.parse(res.text)
                // ap.inf('returnSess', returnSess)
                // assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(returnSess)
            });
    })
}


/****************    gen captcha     ****************/
//首次上，需要获得临时session
//无需传入任何数据
async function genCaptcha({sess,app}){
    return new Promise(function(resolve,reject){
        request(app).get('/user/captcha').set('Accept', 'application/json').set('Cookie', [sess]).send({})
            .end(function(err, res) {
                // let returnSess=res['header']['set-cookie'][0].split(';')[0]
                // let parsedRes=JSON.parse(res.text)
                // ap.inf('captcha resul', returnSess)
                // assert.deepStrictEqual(parsedRes.rc,0)
                return resolve()
            });
    })
}
/****************    directly get captcha from db to pass captcha check     ****************/
//首次上，需要获得临时session
//无需传入任何数据
async function getCaptcha({sess}){
    let sessContent=sess.split('=')[1]
    let sessId=sessContent.split('.')[0].replace('s%3A','')
    // ap.inf('key',`${sessId}:captcha`)
    let serverCaptcha= await redisOperation.get_async({db:2,key:`${sessId}:captcha`})
    return Promise.resolve(serverCaptcha)
}

/****************    Get admin tmp session     ****************/
//首次上，需要获得临时session
//无需传入任何数据
async function getFirstAdminSession({adminApp}){
    return new Promise(function(resolve,reject){
        request(adminApp).post('/adminUser/').set('Accept', 'application/json').send({})
            .end(function(err, res) {
                let returnSess=res['header']['set-cookie'][0].split(';')[0]
                let parsedRes=JSON.parse(res.text)
                // ap.inf('returnSess', returnSess)
                // assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(returnSess)
            });
    })
}
/****************    gen admin captcha     ****************/
//首次上，需要获得临时session
//无需传入任何数据
async function genAdminCaptcha({sess,adminApp}){
    // ap.inf('genAdminCaptcha in')
    return new Promise(function(resolve,reject){
        request(adminApp).get('/admin_user/captcha/').set('Accept', 'application/json').set('Cookie', [sess]).send({})
            .end(function(err, res) {
                // let returnSess=res['header']['set-cookie'][0].split(';')[0]
                // let parsedRes=JSON.parse(res.text)
                // ap.inf('captcha resul', returnSess)
                // assert.deepStrictEqual(parsedRes.rc,0)
                return resolve()
            });
    })
}
/****************    directly get admin captcha from db to pass captcha check     ****************/
//首次上，需要获得临时session
//无需传入任何数据
async function getAdminCaptcha({sess}){
    let sessContent=sess.split('=')[1]
    let sessId=sessContent.split('.')[0].replace('s%3A','')
    // ap.inf('key',`${sessId}:captcha`)
    let serverCaptcha= await redisOperation.get_async({db:8,key:`${sessId}:captcha`})
    return Promise.resolve(serverCaptcha)
}
/****************       USER            *****************/
async function createUser_async({userData,captcha,sess,app}){
    let data={}
    data.values={}
    data.values[e_part.RECORD_INFO]=userData
    data.values[e_part.CAPTCHA]=captcha
    // ap.inf('createUser_async data',data)
// console.log(`userDate for create user==============>${JSON.stringify(userData)}`)
//     data.values.method=e_method.CREATE
    return new Promise(function(resolve,reject){
        request(app).post('/user/').set('Accept', 'application/json').set('Cookie', [sess]).send(data)
            .end(function(err, res) {
                ap.inf('res result',res)
                let parsedRes=JSON.parse(res.text)
                // console.log(`created user =========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve({rc:0})
            });
    })
}

//返回一个promise，那么无需done
async function userLogin_returnSess_async({userData,captcha,sess,app}){
    let data={}
    data.values={}
    // data.values.method=e_method.MATCH
    let userTmp=objectDeepCopy(userData)
    delete userTmp['name']
    delete userTmp['userType']
    // ap.inf('userLogin_returnSess_async data',userTmp)
    // console.log(`userTmp====>${JSON.stringify(userTmp)}`)
    data.values[e_part.RECORD_INFO]=userTmp//,notExist:{value:123}
    data.values[e_part.CAPTCHA]=captcha
    // ap.inf('userLogin_returnSess_async data',data.values)
    return new Promise(function(resolve,reject){
        request.agent(app).post('/user/login').set('Accept', 'application/json').set('Cookie', [sess]).send(data)
            .end(function(err, res) {
                let returnSess=res['header']['set-cookie'][0].split(';')[0]
                let parsedRes=JSON.parse(res.text)
                // console.log(`userlogin returnSess ################### ${JSON.stringify(returnSess)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                // console.log(`user login result ==================> ${JSON.stringify(parsedRes)}`)
                // done();
                return resolve(returnSess)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
            });
    })
}

/****************       ADMIN_USER            *****************/
async function createAdminUser_async({userData,sess,adminApp}){
    let data={values:{}}
    let url='/admin_user/'

    data.values[e_part.RECORD_INFO]=userData
// console.log(`userDate==============>${JSON.stringify(userData)}`)
    data.values[e_part.METHOD]=e_method.CREATE
    // console.log(`data.values==============>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(adminApp).post(url).set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                let parsedRes=JSON.parse(res.text)
                console.log(`createAdminUser_async result =========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve({rc:0})
            });
    })

}

//返回一个promise，那么无需done
//userData:{name:{value:xxx},password:{value:yyyyy}}
async function adminUserLogin_returnSess_async({userData,captcha,sess,adminApp}){
    // console.log(`adminUserLogin_returnSess_async userData =============>${JSON.stringify(userData)}`)
    let data={}
    data.values={}
    // data.values.method=e_method.MATCH
    let userDataCopy=objectDeepCopy(userData)
    delete userDataCopy['userType']
    delete userDataCopy[e_field.ADMIN_USER.USER_PRIORITY]
    data.values[e_part.RECORD_INFO]=userDataCopy//,notExist:{value:123}
    data.values[e_part.CAPTCHA]=captcha
    // console.log(`adminUser login data ===>${JSON.stringify(data)}`)
    return new Promise(function(resolve,reject){
        request.agent(adminApp).post('/admin_user/login/').set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                // console.log(`err ==================> ${JSON.stringify(err)}`)
                // console.log(`adminUserLogin_returnSess_async res ==================> ${JSON.stringify(res)}`)
                let returnSess=res['header']['set-cookie'][0].split(';')[0]
                // console.log(`admin userlogin returnSess ################### ${JSON.stringify(returnSess)}`)
                let parsedRes=JSON.parse(res.text)
                // console.log(`returnSess ################### ${JSON.stringify(returnSess)}`)
                assert.deepStrictEqual(parsedRes.rc,0)

                // done();
                return resolve(returnSess)
                // assert.deepStrictEqual(parsedRes.msg.password.rc,10722)
            });
    })
}


/****************       IMPEACH            *****************/
/*
* @impeachType: article/comment
* */
async function createImpeachForArticle_returnImpeachId_async({articleId,userSess,app}) {
    let data={}
    data.values={}
    data.values[e_part.RECORD_INFO]={
        // [e_field.IMPEACH.IMPEACH_TYPE]:{value:impeachType},
        [e_field.IMPEACH.IMPEACHED_ARTICLE_ID]:articleId,
    }
    data.values[e_part.METHOD] = e_method.CREATE
    // console.log(`createImpeach_async===>data.values ===>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(app).post('/impeach/article').set('Accept', 'application/json').set('Cookie', [userSess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                // console.log(`createImpeach_returnImpeachId_async result=========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, 0)
                return resolve(parsedRes['msg']['_id'])
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                // done();
            });
    })
}

async function delete_impeach_async({impeachId,userSess,app}){
    let data={}
    data.values={}
    data.values[e_part.RECORD_ID]=impeachId

    data.values[e_part.METHOD] = e_method.DELETE
    return new Promise(function(resolve,reject){
        request(app).post('/impeach/article').set('Accept', 'application/json').set('Cookie', [userSess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                console.log(`data.values of delete_impeach_async===========> ${JSON.stringify(data.values)}`)
                let parsedRes = JSON.parse(res.text)
                // console.log(`createImpeach_returnImpeachId_async result=========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, 0)
                return resolve(true)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                // done();
            });
    })
}
async function createImpeachForComment_returnImpeachId_async({commentId,userSess}) {
    let data={}
    data.values={}


    data.values[e_part.RECORD_INFO]={
        // [e_field.IMPEACH.IMPEACH_TYPE]:{value:impeachType},
        [e_field.IMPEACH.IMPEACHED_COMMENT_ID]:{value:commentId},
    }


    data.values[e_part.METHOD] = e_method.CREATE
    // console.log(`createImpeach_async===>data.values ===>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(app).post('/impeach/comment').set('Accept', 'application/json').set('Cookie', [userSess]).send(data)
            .end(function (err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                // console.log(`createImpeach_returnImpeachId_async result=========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc, 0)
                return resolve(parsedRes['msg']['_id'])
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                // done();
            });
    })

}

async function updateImpeach_async({data,userSess,app}) {
    // console.log(`createImpeach_async===>data.values ===>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(app).post('/impeach/').set('Accept', 'application/json').set('Cookie', [userSess]).send(data)
            .end(function (err, res) {
                if (err) return reject(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes = JSON.parse(res.text)
                // console.log(`updateImpeach result=========> ${JSON.stringify(parsedRes)}`)
                // console.log(`expectRc result=========> ${JSON.stringify(expectRc)}`)
                // assert.deepStrictEqual(parsedRes.rc, 0)
                // return resolve(parsedRes['msg']['_id'])
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(0)
                // done();
            });
    })
}

/****************       ARTICLE            *****************/
async function createNewArticle_returnArticleId_async({userSess,app}){
    let data={values:{}}
    // data.values={}
    // console.log(`sess1 ===>${JSON.stringify(sess1)}`)
    // console.log(`data.values ===>${JSON.stringify(data.values)}`)
    data.values[e_part.METHOD]=e_method.CREATE
    // console.log(`data.values ===>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(app).post('/article/').set('Accept', 'application/json').set('Cookie',[userSess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // articleId=
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(parsedRes['msg']['_id'])
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                // done();
            });
    })
}

async function updateArticle_returnArticleId_async({userSess,recordId,values,app}){
    let data={values:{}}
    // data.values={}
    // console.log(`sess1 ===>${JSON.stringify(sess1)}`)
    // console.log(`data.values ===>${JSON.stringify(data.values)}`)
    data.values[e_part.RECORD_INFO]=values
    data.values[e_part.RECORD_ID]=recordId
    data.values[e_part.METHOD]=e_method.UPDATE
    // console.log(`data.values ===>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(app).post('/article/').set('Accept', 'application/json').set('Cookie',[userSess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);
                // console.log(`res ios ${JSON.stringify(res)}`)
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // articleId=
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(parsedRes)
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                // done();
            });
    })
}
/****************       PENALIZE            *****************/
/*
* @penalizeInfo:{reason:,penalizeType:,penalizeSubype:,duration:}
* @penalizedUserData:受处罚的人
* */
async function createPenalize_returnPenalizeId_async({adminUserSess,penalizeInfo,penalizedUserData,adminApp}){
    let condition={}
    // console.log(`penalizedUserData========>${JSON.stringify(penalizedUserData)}`)
    condition={
        [e_field.USER.ACCOUNT]:penalizedUserData[e_field.USER.ACCOUNT]
    }
    // console.log(`condition========>${JSON.stringify(condition)}`)
    let userInfo=await common_operation_model.find_returnRecords_async({dbModel:e_dbMoodel[e_coll.USER],condition:condition})
    // console.log(`tmpResult========>${JSON.stringify(tmpResult)}`)
    let punishedId=userInfo[0][`_id`]
    penalizeInfo[e_field.ADMIN_PENALIZE.PUNISHED_ID]=punishedId

    let data={values:{}}
    // data.values={}
    // console.log(`adminUserSess ===>${JSON.stringify(adminUserSess)}`)
    // console.log(`data.values ===>${JSON.stringify(data.values)}`)
    // data.values[e_part.METHOD]=e_method.CREATE
    data.values[e_part.RECORD_INFO]=penalizeInfo
    // console.log(`data.values ===>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(adminApp).post('/admin_penalize/').set('Accept', 'application/json').set('Cookie',[adminUserSess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ios ${JSON.stringify(parsedRes)}`)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // articleId=
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(parsedRes.msg['_id'])
                // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                // done();
            });
    })
}

async function deletePenalize_async({adminUserSess,penalizeInfo,penalizedUserData,adminApp}){
    //查找同类型为过期的penalizeId，然后通过API撤销
    // console.log(`deletePenalize_async in`)
    let condition
    condition={
        [e_field.USER.ACCOUNT]:penalizedUserData[e_field.USER.ACCOUNT]
    }

    let tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbMoodel[e_coll.USER],condition:condition})
    // console.log(`tmpResult========>${JSON.stringify(tmpResult)}`)
    //查找active的penalize
    let punishedId=tmpResult[0][`_id`]
    condition={
        "$or":[{[e_field.ADMIN_PENALIZE.DURATION]:0},{'endDate':{'$gt':Date.now()}}],
        //未被删除，同时也未到期或者duration=0（永久未到期），才能视为valid的penalize
        'dDate':{'$exists':false},
        [e_field.ADMIN_PENALIZE.PUNISHED_ID]:punishedId,
        [e_field.ADMIN_PENALIZE.PENALIZE_TYPE]:penalizeInfo[e_field.ADMIN_PENALIZE.PENALIZE_TYPE],
        [e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE]:penalizeInfo[e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE],
    }
    // console.log(`condition========>${JSON.stringify(condition)}`)
    let activePenalizeRecords=await common_operation_model.find_returnRecords_async({dbModel:e_dbMoodel[e_coll.ADMIN_PENALIZE],condition:condition,selectedFields:"-uDate"})
    // console.log(`activePenalizeRecords========>${JSON.stringify(activePenalizeRecords)}`)
    if(activePenalizeRecords.length>0){
        let data={values:{}}
        // data.values={}
        //console.log(`adminUserSess of ===>${JSON.stringify(adminUserSess)}`)
        // console.log(`data.values ===>${JSON.stringify(data.values)}`)
        data.values[e_part.METHOD]=e_method.DELETE
        data.values[e_part.RECORD_ID]=activePenalizeRecords[0][`_id`]
        data.values[e_part.RECORD_INFO]={[e_field.ADMIN_PENALIZE.REVOKE_REASON]:'test for revoke penalize'}
        // console.log(`data.values ===>${JSON.stringify(data.values)}`)
        return new Promise(function(resolve,reject){
            request(adminApp).post('/admin_penalize/').set('Accept', 'application/json').set('Cookie',[adminUserSess]).send(data)
                .end(function(err, res) {
                    // if (err) return done(err);
                    // console.log(`res ios ${JSON.stringify(res)}`)
                    let parsedRes=JSON.parse(res.text)
                    console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                    // articleId=
                    assert.deepStrictEqual(parsedRes.rc,0)
                    return resolve({rc:0})
                    // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                    // done();
                });
        })
    }
    return Promise.resolve({rc:0})
}

async function deletePenalizeById_async({adminUserSess,penalizeId,adminApp}){

        let data={values:{}}
        // data.values={}
        //console.log(`adminUserSess of ===>${JSON.stringify(adminUserSess)}`)
        // console.log(`data.values ===>${JSON.stringify(data.values)}`)
        data.values[e_part.METHOD]=e_method.DELETE
        data.values[e_part.RECORD_ID]=penalizeId
        data.values[e_part.RECORD_INFO]={[e_field.ADMIN_PENALIZE.REVOKE_REASON]:'test for revoke penalize by id'}
        // console.log(`data.values ===>${JSON.stringify(data.values)}`)
        return new Promise(function(resolve,reject){
            request(adminApp).post('/admin_penalize/').set('Accept', 'application/json').set('Cookie',[adminUserSess]).send(data)
                .end(function(err, res) {
                    // if (err) return done(err);
                    // console.log(`res ios ${JSON.stringify(res)}`)
                    let parsedRes=JSON.parse(res.text)
                    console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                    // articleId=
                    assert.deepStrictEqual(parsedRes.rc,0)
                    return resolve({rc:0})
                    // assert.deepStrictEqual(parsedRes.msg.name.rc,browserInputRule.user.name.require.error.rc)
                    // done();
                });
        })

    // return Promise.resolve({rc:0})
}

//普通或者admin用户提交action
//impeachActionInfo:{}
async function createImpeachAction_async({sess,impeachActionInfo,app}){
    let data={values:{}}
    data.values[e_part.METHOD]=e_method.CREATE
    data.values[e_part.RECORD_INFO]=impeachActionInfo
    return new Promise(function(resolve,reject){
        request(app).post('/impeach_action/').set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve({rc:0})
            });
    })
}

/*              impeach_comment             */
async function createImpeachComment_returnId_async({sess,impeachId,app}){
    let data={values:{}}
    data.values[e_part.METHOD]=e_method.CREATE
    data.values[e_part.RECORD_INFO]={[e_field.IMPEACH_COMMENT.IMPEACH_ID]:impeachId}
    return new Promise(function(resolve,reject){
        request(app).post('/impeach_comment/').set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                let parsedRes=JSON.parse(res.text)
                // console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(parsedRes.msg)
            });
    })
}


/****************       CREATE ADD_FRIEND            *****************/
async function createAddFriend_returnRecord_async({userData,sess,app}){
    let data={values:{}}
    let url='/add_friend/'
    data.values[e_part.RECORD_INFO]=userData
// console.log(`userDate==============>${JSON.stringify(userData)}`)
    data.values[e_part.METHOD]=e_method.CREATE
    // console.log(`data.values==============>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(app).post(url).set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                let parsedRes=JSON.parse(res.text)
                // console.log(`createAddFriend_async result =========> ${JSON.stringify(parsedRes)}`)
                // ap.print(`parsedRes.msg`,parsedRes.msg)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(parsedRes.msg)
            });
    })
}

//userData只能有一个字段status
async function updateAddFriend_returnRecord_async({userData,recordId,sess,app}){
    let data={values:{}}
    let url='/add_friend/'
    data.values[e_part.RECORD_INFO]=userData
    data.values[e_part.RECORD_ID]=recordId
    // ap.print('data.values[e_part.RECORD_INFO]',data.values[e_part.RECORD_INFO])
    data.values[e_part.METHOD]=e_method.UPDATE
    // console.log(`data.values==============>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(app).post(url).set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                let parsedRes=JSON.parse(res.text)
                // console.log(`createAddFriend_async result =========> ${JSON.stringify(parsedRes)}`)
                // ap.print(`parsedRes.msg`,parsedRes.msg)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(parsedRes.msg)
            });
    })
}

/****************       CREATE USER_FRIEND_GROUP            *****************/
async function createUserFriendGroup_returnRecord_async({userData,sess,app}){
    let data={values:{}}
    let url='/user_friend_group/'
    data.values[e_part.RECORD_INFO]=userData
// console.log(`userDate==============>${JSON.stringify(userData)}`)
    data.values[e_part.METHOD]=e_method.CREATE
    // console.log(`data.values==============>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(app).post(url).set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                let parsedRes=JSON.parse(res.text)
                // console.log(`createAddFriend_async result =========> ${JSON.stringify(parsedRes)}`)
                // ap.print(`parsedRes.msg`,parsedRes.msg)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(parsedRes.msg)
            });
    })
}

//userData只能有一个字段status
async function updateUserFriendGroup_returnRecord_async({userDataForRecordInfo,recordId,userDataForEditSubField,sess,app}){
    let data={values:{}}
    let url='/user_friend_group/'
    data.values[e_part.RECORD_INFO]=userDataForRecordInfo
    data.values[e_part.RECORD_ID]=recordId
    data.values[e_part.EDIT_SUB_FIELD]=userDataForEditSubField
    // ap.print('data.values[e_part.RECORD_INFO]',data.values[e_part.RECORD_INFO])
    data.values[e_part.METHOD]=e_method.UPDATE
    console.log(`data.values==============>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(app).post(url).set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                let parsedRes=JSON.parse(res.text)
                // console.log(`createAddFriend_async result =========> ${JSON.stringify(parsedRes)}`)
                // ap.print(`parsedRes.msg`,parsedRes.msg)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(parsedRes.msg)
            });
    })
}

/****************       GENERAL CREATE            *****************/
async function generalCreate_returnRecord_async({userData,sess,app,url}){
    let data={values:{}}
    // let url='/public_group/'
    data.values[e_part.RECORD_INFO]=userData
// console.log(`userDate==============>${JSON.stringify(userData)}`)
    data.values[e_part.METHOD]=e_method.CREATE
    // console.log(`data.values==============>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(app).post(url).set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                let parsedRes=JSON.parse(res.text)
                // console.log(`createAddFriend_async result =========> ${JSON.stringify(parsedRes)}`)
                // ap.print(`parsedRes.msg`,parsedRes.msg)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(parsedRes.msg)
            });
    })
}

/****************       GENERAL UPDATE             *****************/
async function generalUpdate_returnRecord_async({docValue,manipulateArray,recordId,sess,app,url}){
    let data={values:{}}
    // let url='/public_group/'
    if(undefined!==docValue){
        data.values[e_part.RECORD_INFO]=docValue
    }
    if(undefined!==manipulateArray){
        data.values[e_part.MANIPULATE_ARRAY]=manipulateArray
    }
    data.values[e_part.RECORD_ID]=recordId
// console.log(`userDate==============>${JSON.stringify(userData)}`)
    data.values[e_part.METHOD]=e_method.UPDATE
    // console.log(`data.values==============>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(app).post(url).set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                let parsedRes=JSON.parse(res.text)
                // console.log(`createAddFriend_async result =========> ${JSON.stringify(parsedRes)}`)
                // ap.print(`parsedRes.msg`,parsedRes.msg)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(parsedRes.msg)
            });
    })
}


module.exports={
    removeExistsRecord_async,

    getFirstSession,//第一次登陆，需要获得session（不带登录信息）
    genCaptcha,
    getCaptcha,

    getFirstAdminSession,
    genAdminCaptcha,
    getAdminCaptcha,

    createUser_async,
    userLogin_returnSess_async,

    createAdminUser_async,
    adminUserLogin_returnSess_async,

    // userCreateArticle_returnArticleId_async,
    createImpeachForArticle_returnImpeachId_async,
    delete_impeach_async,
    // createImpeachForComment_returnImpeachId_async,
    updateImpeach_async,

    createNewArticle_returnArticleId_async,
    updateArticle_returnArticleId_async,

    createPenalize_returnPenalizeId_async,
    deletePenalize_async,
    deletePenalizeById_async,


    createImpeachAction_async,

    createImpeachComment_returnId_async,

    createAddFriend_returnRecord_async,
    updateAddFriend_returnRecord_async,

    createUserFriendGroup_returnRecord_async,
    updateUserFriendGroup_returnRecord_async,

    generalCreate_returnRecord_async,
    generalUpdate_returnRecord_async,
}
