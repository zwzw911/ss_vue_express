/**
 * Created by 张伟 on 2018/9/27.
 * 为了保证前端刷新不出错，设置的router
 * 某些URL只是前端用作路由，无需后端传递任何数据，如果后端没有对应的router，会报错。所以设置这些啥的不干的路由
 */
'use strict'
const express = require('express');
//var app=express()
const router = express.Router();

const server_common_file_require=require('./server_common_file_require')
const systemError=server_common_file_require.systemError
const genFinalReturnResult=server_common_file_require.misc.genFinalReturnResult

const route_only_dispatcher_async=require('./routerOnlyDispatch').router_only_dispatcher_async
/***    用户中心    ***/
router.get('/userCenter',function(req,res,next){
    return res.json({rc:0,msg:'asdf'})
    // route_only_dispatcher_async({req}).then(
    //     (v)=>{
    //         if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
    //             console.log(`get user center   success, result:  ${JSON.stringify(v)}`)
    //         }
    //
    //         return res.json(v)
    //     },
    //     (err)=>{
    //         if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
    //             console.log(`get user center     fail: ${JSON.stringify(err)}`)
    //         }
    //
    //         return res.json(genFinalReturnResult(err))
    //
    //     }
    // )
    // return
})

router.all('*',function(req,res,next){
    // ap.inf('systemError.systemError.noMatchRESTAPI',systemError.systemError.noMatchRESTAPI)
    return res.json(genFinalReturnResult(systemError.systemError.noMatchRESTAPI))
})

module.exports={router}