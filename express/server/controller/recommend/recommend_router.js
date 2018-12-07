/**
 * Created by 张伟 on 2018/11/19.
 */
'use strict'


const ap=require('awesomeprint')
const express = require('express');
//var app=express()
const router = express.Router();

const server_common_file_require=require('../../../server_common_file_require')
const nodeEnum=server_common_file_require.nodeEnum
const genFinalReturnResult=server_common_file_require.misc.genFinalReturnResult
//require('../../../../server_common/function/assist/misc').genFinalReturnResult
// const article_logic=require('./article_logic')
// const article_comment_logic=require('./article_comment_logic')
// const article_upload_file_logic=require('./article_upload_file_logic')
// const likeDislike_logic=require('./liekDislike_logic')
const systemError=server_common_file_require.systemError

// const e_uploadFileType=nodeEnum.UploadFileType


const recommend_dispatcher_async=require('./recommend_dispatch').recommend_dispatcher_async
// const article_comment_dispatch_async=require('../article_comment/article_comment_dispatch').comment_dispatcher_async
// const article_likeDislike_dispatcher_async=require(`./express/server/controller/articleLikeDislike`).article_likeDislike_dispatcher_async
// const articleUploadFile_dispatch_async=require(`.`).articleUploadFile_dispatch_async

/***    创建新分享    ***/
router.post('/',function(req,res,next){
    recommend_dispatcher_async({req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`create   recommend   success, result:  ${JSON.stringify(v)}`)
            }
            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                ap.err('create   recommend    fail:',err)
                // console.log(`create   recommend    fail: ${JSON.stringify(err)}`)
            }
            return res.json(genFinalReturnResult(err))

        }
    )
})


/***    读取 接收人 接收到的所有 未读 分享文档     ****/
router.get('/getUnreadRecommend',function(req,res,next){
    recommend_dispatcher_async({req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`get all read receive recommend success, result:  ${JSON.stringify(v)}`)
            }
            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`get all read receive recommend fail: ${JSON.stringify(err)}`)
            }
            return res.json(genFinalReturnResult(err))

        }
    )
})
/***    读取 接收人 接收到的所有 已读 分享文档     ****/
router.get('/getReadRecommend',function(req,res,next){
    recommend_dispatcher_async({req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`get all read receive recommend success, result:  ${JSON.stringify(v)}`)
            }
            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`get all read receive recommend fail: ${JSON.stringify(err)}`)
            }
            return res.json(genFinalReturnResult(err))

        }
    )
})
/***    读取发送的所有分享文档     ****/
router.get('/getSendRecommend',function(req,res,next){
    recommend_dispatcher_async({req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`get all send  recommend success, result:  ${JSON.stringify(v)}`)
            }
            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`get all send recommend fail: ${JSON.stringify(err)}`)
            }
            return res.json(genFinalReturnResult(err))

        }
    )
})
/***    接收人读取（点击）未读分享文档（需要同完成未读->已读，打开文档交给另外的url完成）    ****/
router.put('/readUnreadRecommend',function(req,res,next){
    recommend_dispatcher_async({req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`read unread recommend success, result:  ${JSON.stringify(v)}`)
            }
            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`read unread receive recommend fail: ${JSON.stringify(err)}`)
            }
            return res.json(genFinalReturnResult(err))

        }
    )
})





router.all('*',function(req,res,next){
    // ap.inf('systemError.systemError.noMatchRESTAPI',systemError.systemError.noMatchRESTAPI)
    return res.json(genFinalReturnResult(systemError.systemError.noMatchRESTAPI))
})


// console.log('router',router)

module.exports={router}