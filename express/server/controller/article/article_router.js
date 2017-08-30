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
const genFinalReturnResult=require('../../function/assist/misc').genFinalReturnResult
const article_logic=require('./article_logic')
const article_comment_logic=require('./article_comment_logic')
const article_upload_file_logic=require('./article_upload_file_logic')
const likeDislike_logic=require('./liekDislike_logic')

const e_uploadFileType=require('../../constant/enum/node').UploadFileType
/*        通过method，判断是CRUDM中的那个操作
*   C: register
*   M: match(login)
* */
router.post('/',function(req,res,next){

    article_logic.article_dispatcher_async(req).then(
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

    article_comment_logic.comment_dispatcher_async(req).then(
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

    article_upload_file_logic.articleUploadFile_dispatch_async({req:req,type:e_uploadFileType.IMAGE}).then(
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

    article_upload_file_logic.articleUploadFile_dispatch_async({req:req,type:e_uploadFileType.ATTACHMENT}).then(
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

    likeDislike_logic.article_likeDislike_dispatcher_async({req:req}).then(
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








module.exports={router}