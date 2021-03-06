/**
 * Created by ada on 2017/9/30.
 */
'use strict'

/*              common  require                 */
const express = require('express');
const router = express.Router();
const server_common_file_require=require('../../../server_common_file_require')
const genFinalReturnResult=server_common_file_require.misc.genFinalReturnResult//require('../../function/assist/misc').genFinalReturnResult

/*              dispatch require                 */
const dispatcher_async=require('./dispatch').dispatcher_async

const nodeEnum=server_common_file_require.nodeEnum
const e_uploadFileType=nodeEnum.UploadFileType
/*        通过method，判断是CRUDM中的那个操作
 *   C: register
 *   M: match(login)
 * */
router.post('/',function(req,res,next){
//     console.log(`req in`)
// console.log(`req is ${JSON.stringify(req.body)}`)
    dispatcher_async({req:req}).then(
        (v)=>{
            console.log(`create   user friend group   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`create   user friend group    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})

router.post('/image',function(req,res,next){
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

module.exports={router}