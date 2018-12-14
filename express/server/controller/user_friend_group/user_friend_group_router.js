/**
 * Created by ada on 2017/9/30.
 */
'use strict'

/*              common  require                 */
const ap=require('awesomeprint')
const express = require('express');
const router = express.Router();
const server_common_file_require=require('../../../server_common_file_require')
const genFinalReturnResult=server_common_file_require.misc.genFinalReturnResult//require('../../function/assist/misc').genFinalReturnResult
const systemError=server_common_file_require.assistError.systemError

/*              dispatch require                 */
const dispatcher_async=require('./user_friend_group_dispatch').dispatcher_async

// const nodeEnum=server_common_file_require.nodeEnum
// const i=server_common_file_require.inputDataRuleType
// const e_method=nodeEnum.Method
// const e_part=nodeEnum.ValidatePart
// const e_updateType=nodeEnum.UpdateType
/**     读取所有好友分组的信息     **/
router.get('/',function(req,res,next){

    dispatcher_async({req:req}).then(
        (v)=>{
            ap.inf(`get  user friend group   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`get   user friend group    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})
/** 读取friend group以及其下的friends  **/
router.get('/friends',function(req,res,next){

    dispatcher_async({req:req}).then(
        (v)=>{
            ap.inf(`get  user friend group   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`get   user friend group    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})
/** 读取单个friend group下的friends  **/
router.get('/friendGroup/:friendGroupId',function(req,res,next){

    dispatcher_async({req:req}).then(
        (v)=>{
            ap.inf(`get friend group member  success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`get friend group  member  fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})

/**     创建新好友分组 **/
router.post('/',function(req,res,next){

    dispatcher_async({req:req}).then(
        (v)=>{
            ap.inf(`create  user friend group   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`create   user friend group    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})
/**     更新好友分组（的名称） **/
router.put('/',function(req,res,next){

    dispatcher_async({req:req}).then(
        (v)=>{
            ap.inf(`update  user friend group   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`update   user friend group    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})

/**     删除好友分组      **/
router.delete('/',function(req,res,next){

    dispatcher_async({req:req}).then(
        (v)=>{
            ap.inf(`delete  user friend group   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`delete   user friend group    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})


/**     将好友在好友分组间移动     **/
router.put('/move_friend',function(req,res,next){

    dispatcher_async({req:req}).then(
        (v)=>{
            ap.inf(`move friend success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`move friend fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})

/**     查找好友**/
router.get('/friend',function(req,res,next){

    dispatcher_async({req:req}).then(
        (v)=>{
            console.log(`search friend success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`search friend fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})
router.all('*',function(req,res,next){
    // ap.inf('systemError.systemError.noMatchRESTAPI',systemError.systemError.noMatchRESTAPI)
    return res.json(genFinalReturnResult(systemError.systemError.noMatchRESTAPI))
})
module.exports={router}