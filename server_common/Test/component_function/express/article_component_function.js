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
/**************        direct function         **************/
/*************************************************************/
const cryptSingleFieldValue=require(`../../../function/assist/crypt`).cryptSingleFieldValue


async function createArticle_setToFinish_returnArticleId_async({userSess,app}){
    //创建new article
    let recordId=await articleAPI.createNewArticle_returnArticleId_async({userSess:userSess,app:app})
    //更新到完成状态
    await API_helper.updateArticle_returnArticleId_async({userSess:userSess,recordId:recordId,values:{[e_field.ARTICLE.STATUS]:e_articleStatus.FINISHED},app:app})

    return Promise.resolve(recordId)
}

module.exports={
    createArticle_setToFinish_returnArticleId_async,
}