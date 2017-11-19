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

const dataConvert=require(`../controller/dataConvert`)
async function removeExistsRecord_async(){
    await db_operation_helper.deleteAllModelRecord_async({})
}

/****************       USER            *****************/
async function createUser_async({userData,app}){
    let data={}
    data.values={}
    data.values[e_part.RECORD_INFO]=userData
// console.log(`userDate for create user==============>${JSON.stringify(userData)}`)
    data.values.method=e_method.CREATE
    return new Promise(function(resolve,reject){
        request(app).post('/user/').set('Accept', 'application/json').send(data)
            .end(function(err, res) {
                let parsedRes=JSON.parse(res.text)
                // console.log(`created user =========> ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve({rc:0})
            });
    })
}

//返回一个promise，那么无需done
async function userLogin_returnSess_async({userData,app}){
    let data={}
    data.values={}
    data.values.method=e_method.MATCH
    let userTmp=objectDeepCopy(userData)
    delete userTmp['name']
    delete userTmp['userType']
    // console.log(`userTmp====>${JSON.stringify(userTmp)}`)
    data.values[e_part.RECORD_INFO]=userTmp//,notExist:{value:123}
    return new Promise(function(resolve,reject){
        request.agent(app).post('/user/').set('Accept', 'application/json').send(data)
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
async function adminUserLogin_returnSess_async({userData,adminApp}){
    // console.log(`adminUserLogin_returnSess_async userData =============>${JSON.stringify(userData)}`)
    let data={}
    data.values={}
    data.values.method=e_method.MATCH
    let userDataCopy=objectDeepCopy(userData)
    delete userDataCopy['userType']
    delete userDataCopy[e_field.ADMIN_USER.USER_PRIORITY]
    data.values[e_part.RECORD_INFO]=userDataCopy//,notExist:{value:123}
    // console.log(`adminUser login data ===>${JSON.stringify(data)}`)
    return new Promise(function(resolve,reject){
        request.agent(adminApp).post('/admin_user/').set('Accept', 'application/json').send(data)
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
    console.log(`penalizedUserData========>${JSON.stringify(penalizedUserData)}`)
    condition={
        [e_field.USER.ACCOUNT]:penalizedUserData[e_field.USER.ACCOUNT]
    }
    console.log(`condition========>${JSON.stringify(condition)}`)
    let userInfo=await common_operation_model.find_returnRecords_async({dbModel:e_dbMoodel[e_coll.USER],condition:condition})
    // console.log(`tmpResult========>${JSON.stringify(tmpResult)}`)
    let punishedId=userInfo[0][`_id`]
    penalizeInfo[e_field.ADMIN_PENALIZE.PUNISHED_ID]=punishedId

    let data={values:{}}
    // data.values={}
    // console.log(`adminUserSess ===>${JSON.stringify(adminUserSess)}`)
    // console.log(`data.values ===>${JSON.stringify(data.values)}`)
    data.values[e_part.METHOD]=e_method.CREATE
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
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(parsedRes.msg[`_id`])
            });
    })
}



module.exports={
    removeExistsRecord_async,

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
}
