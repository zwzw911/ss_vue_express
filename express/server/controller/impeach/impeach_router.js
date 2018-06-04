/**
 * Created by Ada on 2017/8/14.
 * url： http://domain/impeach/
 */
'use strict'



const express = require('express');
//var app=express()
const router = express.Router();

const server_common_file_require=require('../../../server_common_file_require')
const nodeEnum=server_common_file_require.nodeEnum
const mongoEnum=server_common_file_require.mongoEnum

const genFinalReturnResult=server_common_file_require.misc.genFinalReturnResult
const systemError=server_common_file_require.systemError
// const impeach_logic=require('./impeach_logic')
// const impeachComment_logic=require('./impeachComment_logic_bk')
// const article_comment_logic=require('./article_comment_logic')
const upload_impeach_image=require('./impeach_logic/upload_impeach_image').uploadImpeachCommentFile_async
// const likeDislike_logic=require('./liekDislike_logic')
const e_uploadFileType=nodeEnum.UploadFileType
const e_coll=require('../../constant/genEnum/DB_Coll').Coll

const e_impeachType=mongoEnum.ImpeachType.DB

const dispatcher_async=require('./impeach_dispatch').dispatcher_async
/*        通过method，判断是CRUDM中的那个操作
*   C: register
*
* */
/*              对于update，使用原始URL            */
/*router.post('/',function(req,res,next){

    dispatcher_async({req:req}).then(
        (v)=>{
            console.log(`create   impeach for article  success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`create   impeach  for article  fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})*/


/*             对于create，通过不同的URL，指明impeachedType是article还是comment                     */
router.post('/article',function(req,res,next){
// console.log(`req===========>${JSON.stringify(req)}`)
    dispatcher_async({req:req,impeachType:e_impeachType.ARTICLE}).then(
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

    dispatcher_async({req:req,impeachType:e_impeachType.COMMENT}).then(
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


/*/!*              CRUD for impeach comment                *!/
router.post('/impeachComment',function(req,res,next){

    impeachComment_logic.impeachComment_dispatcher_async({req:req}).then(
        (v)=>{
            console.log(`create   impeachComment success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`create   impeachComment   fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})*/


/*              上传文件                */
/* @uploadFileType: 上传的是image还是attachment
* @forColl： 上传的文件是for impeach还是impeachComment（因为这2者共用处理代码以及同一个coll）
* */
router.post('/impeachImage',function(req,res,next){

    upload_impeach_image({req:req}).then(
        (v)=>{
            console.log(`impeachImage upload  success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`impeachImage upload fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})
/*router.post('/impeachCommentImage',function(req,res,next){

    impeach_upload_file_logic.impeachUploadFile_dispatch_async({req:req,uploadFileType:e_uploadFileType.IMAGE,forColl:e_coll.IMPEACH_COMMENT}).then(
        (v)=>{
            console.log(`impeachCommentImage upload  success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`impeachCommentImage upload fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})*/





/*router.post('/impeachAttachment',function(req,res,next){

    impeach_upload_file_logic.impeachUploadFile_dispatch_async({req:req,uploadFileType:e_uploadFileType.ATTACHMENT,forColl:e_coll.IMPEACH}).then(
        (v)=>{
            console.log(`impeachAttachment upload success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`impeachAttachment upload fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})
router.post('/impeachCommentAttachment',function(req,res,next){

    impeach_upload_file_logic.impeachUploadFile_dispatch_async({req:req,uploadFileType:e_uploadFileType.ATTACHMENT,forColl:e_coll.IMPEACH_COMMENT}).then(
        (v)=>{
            console.log(`impeachCommentAttachment upload success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`impeachCommentAttachment upload fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})*/



router.all('*',function(req,res,next){
    // ap.inf('systemError.systemError.noMatchRESTAPI',systemError.systemError.noMatchRESTAPI)
    return res.json(genFinalReturnResult(systemError.systemError.noMatchRESTAPI))
})


module.exports={router}