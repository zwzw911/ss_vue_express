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
const dispatcher_async=require('./join_public_group_request_dispatch').dispatcher_async

const nodeEnum=server_common_file_require.nodeEnum
const e_uploadFileType=nodeEnum.UploadFileType

/**     请求加入        **/
router.post('/',function(req,res,next){
//     console.log(`req in`)
// console.log(`req is ${JSON.stringify(req.body)}`)
    dispatcher_async({req:req}).then(
        (v)=>{
            console.log(`create   join public group request   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`create   join public group    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})

/**     处理请求        **/
router.put('/accept',function(req,res,next){
//     console.log(`req in`)
// console.log(`req is ${JSON.stringify(req.body)}`)
    dispatcher_async({req:req}).then(
        (v)=>{
            console.log(`handle   join public group   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`handle   join public group    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})
router.put('/decline',function(req,res,next){
//     console.log(`req in`)
// console.log(`req is ${JSON.stringify(req.body)}`)
    dispatcher_async({req:req}).then(
        (v)=>{
            console.log(`handle   join public group   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`handle   join public group    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})
/*router.post('/uploadImage',function(req,res,next){
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
})*/

router.all('*',function(req,res,next){
    // ap.inf('systemError.systemError.noMatchRESTAPI',systemError.systemError.noMatchRESTAPI)
    return res.json(genFinalReturnResult(systemError.systemError.noMatchRESTAPI))
})

module.exports={router}