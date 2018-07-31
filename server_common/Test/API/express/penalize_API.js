/**
 * Created by zhang wei on 2018/5/17.
 */
'use strict'
/*************************************************************/
/******************        3rd or lib      ******************/
/*************************************************************/
const request=require('supertest')
const assert=require('assert')
const ap=require(`awesomeprint`)

/*************************************************************/
/******************        公共函数      ******************/
/*************************************************************/
const redisOperation=require('../../../model/redis/operation/redis_common_operation')
const objectDeepCopy=require(`../../../function/assist/misc`).objectDeepCopy
/*************************************************************/
/******************        公共常量      ******************/
/*************************************************************/
const e_part=require('../../../constant/enum/nodeEnum').ValidatePart
const e_field=require('../../../constant/genEnum/DB_field').Field

/****************       PENALIZE            *****************/
/*
* @penalizeInfo:{reason:,penalizeType:,penalizeSubype:,duration:}
* @penalizedUserData:受处罚的人
* */
async function createPenalize_returnPenalizeId_async({adminUserSess,penalizeInfo,penalizedUserId,adminApp}){
    let condition={}
    // console.log(`penalizedUserData========>${JSON.stringify(penalizedUserData)}`)
    /*    condition={
            [e_field.USER.ACCOUNT]:penalizedUserData[e_field.USER.ACCOUNT]
        }
        // console.log(`condition========>${JSON.stringify(condition)}`)
        let userInfo=await common_operation_model.find_returnRecords_async({dbModel:e_dbMoodel[e_coll.USER],condition:condition})
        // console.log(`tmpResult========>${JSON.stringify(tmpResult)}`)
        let punishedId=userInfo[0][`_id`]*/
    // ap.wrn('penalizedUserId',penalizedUserId)
    penalizeInfo[e_field.ADMIN_PENALIZE.PUNISHED_ID]=penalizedUserId

    let data={values:{}}
    // data.values={}
    // console.log(`adminUserSess ===>${JSON.stringify(adminUserSess)}`)
    // console.log(`data.values ===>${JSON.stringify(data.values)}`)
    // data.values[e_part.METHOD]=e_method.CREATE
    data.values[e_part.RECORD_INFO]=penalizeInfo
    // ap.inf('create penalize data',data.values)
    // console.log(`data.values ===>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(adminApp).post('/admin_penalize/').set('Accept', 'application/json').set('Cookie',[adminUserSess]).send(data)
            .end(function(err, res) {
                // if (err) return done(err);

                let parsedRes=JSON.parse(res.text)
                // console.log(`parsedRes ios ${JSON.stringify(parsedRes)}`)
                // console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                // articleId=
                ap.inf('result of create penalize',parsedRes)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(parsedRes.msg['id'])
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
                    // console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
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

async function deletePenalizeById_async({adminUserSess,data,adminApp}){


    // console.log(`data.values ===>${JSON.stringify(data.values)}`)
    return new Promise(function(resolve,reject){
        request(adminApp).delete('/admin_penalize/').set('Accept', 'application/json').set('Cookie',[adminUserSess]).send(data)
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

module.exports={
    createPenalize_returnPenalizeId_async,
    deletePenalize_async,
    deletePenalizeById_async,
}