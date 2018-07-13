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
const dispatcher_async=require('./user_friend_group_dispatch').dispatcher_async

// const nodeEnum=server_common_file_require.nodeEnum
// const i=server_common_file_require.inputDataRuleType
// const e_method=nodeEnum.Method
// const e_part=nodeEnum.ValidatePart
// const e_updateType=nodeEnum.UpdateType

router.post('/',function(req,res,next){

    dispatcher_async({req:req}).then(
        (v)=>{
            console.log(`create  user friend group   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`create   user friend group    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})
router.put('/',function(req,res,next){

    dispatcher_async({req:req}).then(
        (v)=>{
            console.log(`update  user friend group   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`update   user friend group    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})
router.delete('/',function(req,res,next){

    dispatcher_async({req:req}).then(
        (v)=>{
            console.log(`delete  user friend group   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`delete   user friend group    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})


router.put('/move_friend',function(req,res,next){

    dispatcher_async({req:req}).then(
        (v)=>{
            console.log(`move friend success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`move friend fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})
router.all('*',function(req,res,next){
    // ap.inf('systemError.systemError.noMatchRESTAPI',systemError.systemError.noMatchRESTAPI)
    return res.json(genFinalReturnResult(systemError.systemError.noMatchRESTAPI))
})
module.exports={router}