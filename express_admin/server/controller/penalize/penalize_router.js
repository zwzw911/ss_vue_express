/**
 * Created by ada on 2017/9/30.
 */
'use strict'

/*              common  require                 */
const express = require('express');
const router = express.Router();
const server_common_file_require=require('../../../server_common_file_require')
const genFinalReturnResult=server_common_file_require.misc.genFinalReturnResult//require('../../function/assist/misc').genFinalReturnResult
const systemError=server_common_file_require.systemError
/*              dispatch require                 */
const dispatcher_async=require('./penalize_dispatch').dispatcher_async


/*        通过method，判断是CRUDM中的那个操作
 *   C: register
 *   M: match(login)
 * */
router.post('/',function(req,res,next){
    // console.log(`req in`)
// console.log(`req is ${JSON.stringify(req.body)}`)
    dispatcher_async(req).then(
        (v)=>{
            console.log(`create   penalize   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`create   penalize    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})

router.delete('/',function(req,res,next){
    // console.log(`req in`)
// console.log(`req is ${JSON.stringify(req.body)}`)
    dispatcher_async(req).then(
        (v)=>{
            console.log(`create   penalize   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`create   penalize    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})

router.all('*',function(req,res,next){
    // ap.inf('systemError.systemError.noMatchRESTAPI',systemError.systemError.noMatchRESTAPI)
    return res.json(genFinalReturnResult(systemError.systemError.noMatchRESTAPI))
})

module.exports={router}