/**
 * Created by ada on 2017/9/30.
 */
'use strict'
const ap=require('awesomeprint')
/*              common  require                 */
const express = require('express');
const router = express.Router();
const server_common_file_require=require('../../../server_common_file_require')
const genFinalReturnResult=server_common_file_require.misc.genFinalReturnResult//require('../../function/assist/misc').genFinalReturnResult
const systemError=server_common_file_require.assistError.systemError

/*              dispatch require                 */
const dispatcher_async=require('./public_group_dispatch').dispatcher_async
// const requestJoin_async=require('./public_group_operation/requestJoin').requestJoin_async
// const requestLeave_async=require('./public_group_operation/requestLeave').requestLeave_async
// const adminManageRequest_async=require('./public_group_operation/adminManageRequest').adminManageRequest_async
// const adminRemoveMember_async=require('./public_group_operation/adminRemoveMember').adminRemoveMember_async
// const creatorAddRemoveAdmin_async=require('./public_group_operation/creatorAddRemoveAdmin').creatorAddRemoveAdmin_async
const nodeEnum=server_common_file_require.nodeEnum
// const i=server_common_file_require.inputDataRuleType
// const e_method=nodeEnum.Method
const e_part=nodeEnum.ValidatePart
const e_updateType=nodeEnum.UpdateType

router.post('/',function(req,res,next){
    // ap.inf('req in')
// console.log(`req is ${JSON.stringify(req.body)}`)
    dispatcher_async({req:req}).then(
        (v)=>{
            console.log(`create  public group   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`create   public group    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})
router.put('/',function(req,res,next){
    // ap.inf('req in')
// console.log(`req is ${JSON.stringify(req.body)}`)
    dispatcher_async({req:req}).then(
        (v)=>{
            console.log(`update  public group   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`update   public group    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})
router.delete('/',function(req,res,next){
    // ap.inf('req in')
// console.log(`req is ${JSON.stringify(req.body)}`)
    dispatcher_async({req:req}).then(
        (v)=>{
            console.log(`delete  public group   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`delete   public group    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})


/**         misc        **/
router.put('/exit',function(req,res,next){
    // ap.inf('req in')
// console.log(`req is ${JSON.stringify(req.body)}`)
    dispatcher_async({req:req}).then(
        (v)=>{
            console.log(`update  public group   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`update   public group    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )
})
/**     成员加入，由join_public_group_request处理   **/
router.put('/removeMember',function(req,res,next){
    // ap.inf('req in')
// console.log(`req is ${JSON.stringify(req.body)}`)
    dispatcher_async({req:req}).then(
        (v)=>{
            console.log(`update  public group   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`update   public group    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )
})
router.put('/manageAdminMember',function(req,res,next){
    // ap.inf('req in')
// console.log(`req is ${JSON.stringify(req.body)}`)
    dispatcher_async({req:req}).then(
        (v)=>{
            console.log(`update  public group   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`update   public group    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )
})


//用户退群
router.put('/requestExit',function(req,res,next){
    // ap.inf('requestJoin in')
// console.log(`req is ${JSON.stringify(req.body)}`)
    dispatcher_async({req:req}).then(
        (v)=>{
            console.log(`request leave success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`request leave  fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})



router.all('*',function(req,res,next){
    // ap.inf('systemError.systemError.noMatchRESTAPI',systemError.systemError.noMatchRESTAPI)
    return res.json(genFinalReturnResult(systemError.systemError.noMatchRESTAPI))
})
module.exports={router}