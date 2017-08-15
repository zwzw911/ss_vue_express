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
// const article_comment_logic=require('./article_comment_logic')
// const article_upload_file_logic=require('./article_upload_file_logic')
// const likeDislike_logic=require('./liekDislike_logic')

// const e_uploadFileType=require('../../constant/enum/node').UploadFileType
/*        通过method，判断是CRUDM中的那个操作
*   C: register
*
* */
router.post('/',function(req,res,next){

    impeach_logic.impeach_dispatcher_async(req).then(
        (v)=>{
            console.log(`create   impeach   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`create   impeach    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})










module.exports={router}