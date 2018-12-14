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
const addFriendDispatcher_async=require('./add_friend_dispatch').dispatcher_async

// const nodeEnum=server_common_file_require.nodeEnum
// const e_uploadFileType=nodeEnum.UploadFileType

/*****  新建 添加朋友的请求    *******/
router.post('/',function(req,res,next){
//     console.log(`req in`)
// console.log(`req is ${JSON.stringify(req.body)}`)
    addFriendDispatcher_async({req:req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                ap.inf(`create   add friend    success, result:  ${JSON.stringify(v)}`)
            }
            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                ap.err(`create   add friend     fail: ${JSON.stringify(err)}`)
            }
            return res.json(genFinalReturnResult(err))

        }
    )
})

/*****  被请求人 拒绝/同意 添加朋友的请求    *******/
router.put('/accept',function(req,res,next){
//     console.log(`req in`)
// console.log(`req is ${JSON.stringify(req.body)}`)
    addFriendDispatcher_async({req:req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
               ap.inf(`accept add friend success, result:  ${JSON.stringify(v)}`)
            }

            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                ap.err(`accept add friend fail: ${JSON.stringify(err)}`)
            }

            return res.json(genFinalReturnResult(err))
        }
    )
})
router.put('/decline',function(req,res,next){
//     console.log(`req in`)
// console.log(`req is ${JSON.stringify(req.body)}`)
    addFriendDispatcher_async({req:req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                ap.inf(`decline add friend success, result:  ${JSON.stringify(v)}`)
            }

            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                ap.err(`decline add friend fail: ${JSON.stringify(err)}`)
            }

            return res.json(genFinalReturnResult(err))
        }
    )
})

router.all('*',function(req,res,next){
    // ap.inf('systemError.systemError.noMatchRESTAPI',systemError.systemError.noMatchRESTAPI)
    return res.json(genFinalReturnResult(systemError.systemError.noMatchRESTAPI))
})
/*router.post('/image',function(req,res,next){
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

module.exports={router}