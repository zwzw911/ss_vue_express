/**
 * Created by Ada on 2017/7/9.
 * url：
 *  1. /user，根据method的不同，调用不同的函数进行对应的处理
 *  2. /user/unique: 用户注册的时候，对应用户名/账号进行唯一性检查
 */
'use strict'



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

const e_uploadFileType=nodeEnum.UploadFileType


const article_dispatcher_async=require('./article_dispatch').article_dispatcher_async
const article_comment_dispatch_async=require('./article_comment_dispatch').comment_dispatcher_async
const article_likeDislike_dispatcher_async=require(`./liekDislike_dispatch`).article_likeDislike_dispatcher_async
const articleUploadFile_dispatch_async=require(`./article_upload_file_dispatch`).articleUploadFile_dispatch_async
/*        通过method，判断是CRUDM中的那个操作
*   C: register
*   M: match(login)
* */
router.post('/',function(req,res,next){

    article_dispatcher_async(req).then(
        (v)=>{
            console.log(`create   article   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`create   article    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})

/*        通过method，判断是CRUDM中的那个操作(实际comment只有CREATE)
 *   C: register
 * */
router.post('/comment',function(req,res,next){

    article_comment_dispatch_async({req:req}).then(
        (v)=>{
            console.log(`comment   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`comment  fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )
})

/*              上传文件                */
router.post('/articleImage',function(req,res,next){

    articleUploadFile_dispatch_async({req:req,type:e_uploadFileType.IMAGE}).then(
        (v)=>{
            console.log(`articleImage upload  success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`articleImage upload fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})

router.post('/articleAttachment',function(req,res,next){

    articleUploadFile_dispatch_async({req:req,type:e_uploadFileType.ATTACHMENT}).then(
        (v)=>{
            console.log(`articleAttachment upload success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`articleAttachment upload fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})


/*                  article like_dislike    */
router.post('/likeDislike',function(req,res,next){

    article_likeDislike_dispatcher_async({req:req}).then(
        (v)=>{
            console.log(`likeDislike success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`likeDislike fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})



router.all('*',function(req,res,next){
    // ap.inf('systemError.systemError.noMatchRESTAPI',systemError.systemError.noMatchRESTAPI)
    return res.json(genFinalReturnResult(systemError.systemError.noMatchRESTAPI))
})




module.exports={router}