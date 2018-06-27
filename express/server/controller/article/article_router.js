/**
 * Created by Ada on 2017/7/9.
 * url：
 *  1. /user，根据method的不同，调用不同的函数进行对应的处理
 *  2. /user/unique: 用户注册的时候，对应用户名/账号进行唯一性检查
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


const article_dispatcher_async=require('./article_dispatch').article_dispatcher_async
// const article_comment_dispatch_async=require('../article_comment/article_comment_dispatch').comment_dispatcher_async
// const article_likeDislike_dispatcher_async=require(`./express/server/controller/articleLikeDislike`).article_likeDislike_dispatcher_async
// const articleUploadFile_dispatch_async=require(`.`).articleUploadFile_dispatch_async

/***    创建新文档（无任何参数）    ***/
router.post('/',function(req,res,next){

    article_dispatcher_async({req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`create   article   success, result:  ${JSON.stringify(v)}`)
            }

            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`create   article    fail: ${JSON.stringify(err)}`)
            }

            return res.json(genFinalReturnResult(err))

        }
    )
})
/***    更改新文档（recordId+recordInfo）    ***/
router.put('/',function(req,res,next){

    article_dispatcher_async({req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`update   article   success, result:  ${JSON.stringify(v)}`)
            }

            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`update   article    fail: ${JSON.stringify(err)}`)
            }

            return res.json(genFinalReturnResult(err))

        }
    )
})
/***    删除文档（recordId）    ***/
router.delete('/',function(req,res,next){

    article_dispatcher_async({req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`update   article   success, result:  ${JSON.stringify(v)}`)
            }

            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`update   article    fail: ${JSON.stringify(err)}`)
            }

            return res.json(genFinalReturnResult(err))

        }
    )
})


/***    上传图片(只包含上传文件，db操作由article的update，通过对article的content分析进行)    ***/
router.post('/articleImage',function(req,res,next){

    article_dispatcher_async({req:req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`articleImage upload  success, result:  ${JSON.stringify(v)}`)
            }

            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`articleImage upload fail: ${JSON.stringify(err)}`)
            }

            return res.json(genFinalReturnResult(err))

        }
    )
})


/***    上传附件    ***/
router.post('/articleAttachment',function(req,res,next){
// ap.inf('upload Attachment in')
    article_dispatcher_async({req:req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`articleAttachment upload success, result:  ${JSON.stringify(v)}`)
            }

            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`articleAttachment upload fail: ${JSON.stringify(err)}`)
            }

            return res.json(genFinalReturnResult(err))
        }
    )
})
router.delete('/articleAttachment',function(req,res,next){

    article_dispatcher_async({req:req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`articleAttachment upload success, result:  ${JSON.stringify(v)}`)
            }

            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`articleAttachment upload fail: ${JSON.stringify(err)}`)
            }

            return res.json(genFinalReturnResult(err))
        }
    )
})





router.all('*',function(req,res,next){
    // ap.inf('systemError.systemError.noMatchRESTAPI',systemError.systemError.noMatchRESTAPI)
    return res.json(genFinalReturnResult(systemError.systemError.noMatchRESTAPI))
})




module.exports={router}