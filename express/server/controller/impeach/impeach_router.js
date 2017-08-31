/**
 * Created by Ada on 2017/8/14.
 * url： http://domain/impeach/
 */
'use strict'



const express = require('express');
//var app=express()
const router = express.Router();
const genFinalReturnResult=require('../../function/assist/misc').genFinalReturnResult
const impeach_logic=require('./impeach_logic')
const impeachComment_logic=require('./impeachComment_logic')
// const article_comment_logic=require('./article_comment_logic')
const impeach_upload_file_logic=require('./impeach_upload_file_logic')
// const likeDislike_logic=require('./liekDislike_logic')
const e_uploadFileType=require('../../constant/enum/node').UploadFileType
const e_coll=require('../../constant/enum/DB_Coll').Coll

const e_impeachType=require('../../constant/enum/mongo').ImpeachType.DB
/*        通过method，判断是CRUDM中的那个操作
*   C: register
*
* */
/*              对于update，使用原始URL            */
router.post('/',function(req,res,next){

    impeach_logic.impeach_dispatcher_async(req).then(
        (v)=>{
            console.log(`create   impeach for article  success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`create   impeach  for article  fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})


/*             对于create，通过不同的URL，指明impeachedType是article还是comment                     */
router.post('/article',function(req,res,next){

    impeach_logic.impeach_dispatcher_async(req,e_impeachType.ARTICLE).then(
        (v)=>{
            console.log(`create   impeach for article  success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`create   impeach  for article  fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})
router.post('/comment',function(req,res,next){

    impeach_logic.impeach_dispatcher_async(req,e_impeachType.COMMENT).then(
        (v)=>{
            console.log(`create   impeach  for comment success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`create   impeach for comment   fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})


/*              CRUD for impeach comment                */
router.post('/impeachComment',function(req,res,next){

    impeachComment_logic.impeachComment_dispatcher_async(req).then(
        (v)=>{
            console.log(`create   impeachComment success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`create   impeachComment   fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})


/*              上传文件                */
/* @uploadFileType: 上传的是image还是attachment
* @forColl： 上传的文件是for impeach还是impeachComment（因为这2者共用处理代码以及同一个coll）
* */
router.post('/impeachImage',function(req,res,next){

    impeach_upload_file_logic.impeachUploadFile_dispatch_async({req:req,uploadFileType:e_uploadFileType.IMAGE,forColl:e_coll.IMPEACH}).then(
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
router.post('/impeachCommentImage',function(req,res,next){

    impeach_upload_file_logic.impeachUploadFile_dispatch_async({req:req,uploadFileType:e_uploadFileType.IMAGE,forColl:e_coll.IMPEACH_COMMENT}).then(
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





router.post('/impeachAttachment',function(req,res,next){

    impeach_upload_file_logic.impeachUploadFile_dispatch_async({req:req,uploadFileType:e_uploadFileType.ATTACHMENT,forColl:e_coll.IMPEACH}).then(
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
router.post('/impeachCommentAttachment',function(req,res,next){

    impeach_upload_file_logic.impeachUploadFile_dispatch_async({req:req,uploadFileType:e_uploadFileType.ATTACHMENT,forColl:e_coll.IMPEACH_COMMENT}).then(
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






module.exports={router}