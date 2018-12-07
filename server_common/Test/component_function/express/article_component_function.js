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
/******************        API            ******************/
/*************************************************************/
const articleAPI=require('../../API/express/article_API')
const commonAPI=require('../../API/common_API')
const db_operation_helper=require('../../db_operation_helper')

/*************************************************************/
/******************        公共常量      ******************/
/*************************************************************/
const e_part=require('../../../constant/enum/nodeEnum').ValidatePart
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_articleStatus=require('../../../constant/enum/mongoEnum').ArticleStatus.DB
/*************************************************************/
/**************        direct function         **************/
/*************************************************************/
const encryptSingleValue=require(`../../../function/assist/crypt`).encryptSingleValue


async function createArticle_setToFinish_returnArticleId_async({userSess,app}){
    //创建new article
    let recordId=await articleAPI.createNewArticle_returnArticleId_async({userSess:userSess,app:app})
    //更新到完成状态
    let data={values:{}}
    data.values[e_part.RECORD_ID]=recordId
    data.values[e_part.RECORD_INFO]={[e_field.ARTICLE.STATUS]:e_articleStatus.FINISHED}
    // ap.wrn('data',data)
    await articleAPI.updateArticle_returnArticleId_async({userSess:userSess,data:data,app:app})

    return Promise.resolve(recordId)
}

module.exports={
    createArticle_setToFinish_returnArticleId_async,
}