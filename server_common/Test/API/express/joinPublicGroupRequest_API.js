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



/*              public_group             */
async function createJoinPublicGroupRequest_returnId_async({sess,data,app}){
    // let data={values:{}}
    // // data.values[e_part.METHOD]=e_method.CREATE
    // data.values[e_part.RECORD_INFO]={[e_field.IMPEACH_COMMENT.IMPEACH_ID]:impeachId}
    return new Promise(function(resolve,reject){
        request(app).post('/join_public_group_request/').set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                let parsedRes=JSON.parse(res.text)
                console.log(`parsedRes ${JSON.stringify(parsedRes)}`)

                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(parsedRes.msg.id)
            });
    })
}

async function updateJoinPublicGroupRequest_returnReturn_async({sess,data,app}){
    // let data={values:{}}
    // // data.values[e_part.METHOD]=e_method.CREATE
    // data.values[e_part.RECORD_INFO]={[e_field.IMPEACH_COMMENT.IMPEACH_ID]:impeachId}
    return new Promise(function(resolve,reject){
        request(app).put('/join_public_group_request/').set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                let parsedRes=JSON.parse(res.text)
                // console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(parsedRes)
            });
    })
}
/*async function deletePublicGroup_async({sess,data,app}){
    // let data={values:{}}
    // // data.values[e_part.METHOD]=e_method.CREATE
    // data.values[e_part.RECORD_INFO]={[e_field.IMPEACH_COMMENT.IMPEACH_ID]:impeachId}
    return new Promise(function(resolve,reject){
        request(app).put('/public_group/').set('Accept', 'application/json').set('Cookie',[sess]).send(data)
            .end(function(err, res) {
                let parsedRes=JSON.parse(res.text)
                // console.log(`parsedRes ${JSON.stringify(parsedRes)}`)
                assert.deepStrictEqual(parsedRes.rc,0)
                return resolve(parsedRes.msg.id)
            });
    })
}*/
module.exports={
    createJoinPublicGroupRequest_returnId_async,
    updateJoinPublicGroupRequest_returnReturn_async,
    // deletePublicGroup_async,
}