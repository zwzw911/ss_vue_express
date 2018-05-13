/**
 * Created by Ada on 2017/8/2.
 *
 * 检查发起的请求是否为机器人，
 */
'use strict'

const e_coll=require('../../constant/genEnum/DB_Coll').Coll
// const e_method=require('../../constant/enum/nodeEnum').Method

/*          检查create article的请求是否为robot发起的
* return: boolean
* */
async function createArticle_async({userId}){
    return Promise.resolve(true)
}

/*          检查update article的请求是否为robot发起的
* return: boolean
* */
async function updateArticle_async({userId}){
    return Promise.resolve(true)
}

/*          检查create comment的请求是否为robot发起的
 * return: boolean
 * */
async function createComment_async({userId}){
    return Promise.resolve(true)
}





let checkRobot_async={}

// checkRobot_async[e_coll.ARTICLE]={}
// checkRobot_async[e_coll.ARTICLE][e_method.CREATE]=createArticle_async
// checkRobot_async[e_coll.ARTICLE][e_method.UPDATE]=updateArticle_async
//
// checkRobot_async[e_coll.ARTICLE_COMMENT]={}
// checkRobot_async[e_coll.ARTICLE_COMMENT][e_method.CREATE]=createComment_async

// console.log(`typeof======>${typeof checkRobot_async[e_coll.ARTICLE][e_method.CREATE] }`)
// console.log(`${JSON.stringify(checkRobot_async)}`)
module.exports={
    checkRobot_async,
}
