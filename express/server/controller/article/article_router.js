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
const systemError=server_common_file_require.assistError.systemError

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

/***    读取首页文档，通过单独的URL来获取（而不是post 参数，防止恶意用户自己输入查询参数）      ****/
router.get('/mainPage',function(req,res,next){
    //articleId通过req.params.articleId获得
    article_dispatcher_async({req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                // console.log(`get main page   article   success, result:  ${JSON.stringify(v)}`)
            }
            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`get main page   article    fail: ${JSON.stringify(err)}`)
            }
            return res.json(genFinalReturnResult(err))
        }
    )
})
router.get('/latestArticle',function(req,res,next){

    article_dispatcher_async({req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`get latest   article   success, result:  ${JSON.stringify(v)}`)
            }
            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`get latest   article    fail: ${JSON.stringify(err)}`)
            }
            return res.json(genFinalReturnResult(err))
        }
    )
})
/***    更新时需要首先获得原始文档内容（recordId）    ***/
router.get('/getUpdateArticle/:articleId',function(req,res,next){
    //articleId通过req.params.articleId获得
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
//非更新获得文档（例如，阅读他人写的文档）
router.get('/:articleId',function(req,res,next){
    //articleId通过req.params.articleId获得
    article_dispatcher_async({req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                // console.log(`get article success, result:  ${JSON.stringify(v)}`)
            }
            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`get article fail: ${JSON.stringify(err)}`)
            }
            return res.json(genFinalReturnResult(err))
        }
    )
})
/***    上传图片(只包含上传文件，db操作由article的update，通过对article的content分析进行)    ***/
router.post('/articleImage/:articleId',function(req,res,next){

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
router.post('/articleAttachment/:articleId',function(req,res,next){
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
                // console.log(`articleAttachment upload fail: ${JSON.stringify(err)}`)
                ap.wrn('articleAttachment upload fail: ',err)
            }

            return res.json(genFinalReturnResult(err))
        }
    )
})
/***    下载附件    ***/
router.get('/articleAttachment/:attachmentId',function(req,res,next){
// ap.inf('upload Attachment in')
    article_dispatcher_async({req:req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`articleAttachment download success, result:  ${JSON.stringify(v)}`)
            }

            //clieng端，只需要将URL设置成标签a的href即可（axios只返回文件内容，且无法被浏览器识别为文件）
            return res.download(v.msg.path,v.msg.fileName)
            // return res.json({rc:0,msg:{fileContent}})
                // ,{headers:{'Content-Type':'arraybuffer','Content-Disposition':'attachment'}
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                // console.log(`articleAttachment upload fail: ${JSON.stringify(err)}`)
                ap.wrn('articleAttachment download fail: ',err)
            }

            return res.json(genFinalReturnResult(err))
        }
    )
})
/***    删除附件    ***/
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