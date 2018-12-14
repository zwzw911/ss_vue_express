/**
 * Created by ada on 2017/9/30.
 */
'use strict'

/*              common  require                 */
const express = require('express');
const router = express.Router();
const server_common_file_require=require('../../../server_common_file_require')
const genFinalReturnResult=server_common_file_require.misc.genFinalReturnResult//require('../../function/assist/misc').genFinalReturnResult
const systemError=server_common_file_require.assistError.systemError
/*              dispatch require                 */
const dispatcher_async=require('./impeach_comment_dispatch').dispatcher_async

const nodeEnum=server_common_file_require.nodeEnum
const e_uploadFileType=nodeEnum.UploadFileType

router.post('/',function(req,res,next){
//     console.log(`req in`)
// console.log(`req is ${JSON.stringify(req.body)}`)
    dispatcher_async({req:req}).then(
        (v)=>{
            console.log(`create   impeach comment   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`create   impeach comment    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})
router.put('/',function(req,res,next){
//     console.log(`req in`)
// console.log(`req is ${JSON.stringify(req.body)}`)
    dispatcher_async({req:req}).then(
        (v)=>{
            console.log(`create   impeach comment   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`create   impeach comment    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})
router.post('/uploadImage/:impeachCommentId',function(req,res,next){
//     console.log(`req in`)
// console.log(`req is ${JSON.stringify(req.body)}`)
    dispatcher_async({req:req,type:e_uploadFileType.IMAGE}).then(
        (v)=>{
            console.log(`create   impeach comment   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`create   impeach comment    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})

router.all('*',function(req,res,next){
    // ap.inf('systemError.systemError.noMatchRESTAPI',systemError.systemError.noMatchRESTAPI)
    return res.json(genFinalReturnResult(systemError.systemError.noMatchRESTAPI))
})

module.exports={router}