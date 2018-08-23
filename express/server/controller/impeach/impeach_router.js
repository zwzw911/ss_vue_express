/**
 * Created by Ada on 2017/8/14.
 * url： http://domain/impeach/
 */
'use strict'



const ap=require('awesomeprint')
const express = require('express');
//var app=express()
const router = express.Router();

const server_common_file_require=require('../../../server_common_file_require')
const nodeEnum=server_common_file_require.nodeEnum
const genFinalReturnResult=server_common_file_require.misc.genFinalReturnResult
//require('../../../../server_common/function/assist/misc').genFinalReturnResult
// const article_logic=require('./article_logic')
// const article_comment_logic=require('./article_comment_logic')
// const article_upload_file_logic=require('./article_upload_file_logic')
// const likeDislike_logic=require('./liekDislike_logic')
const systemError=server_common_file_require.systemError

const impeach_dispatcher_async=require('./impeach_dispatch').impeach_dispatcher_async



/*             对于create，通过不同的URL，指明impeachedType是article还是comment                     */
router.post('/article',function(req,res,next){
// console.log(`req===========>${JSON.stringify(req)}`)
    impeach_dispatcher_async({req:req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV) {
                console.log(`create   impeach for article  success, result:  ${JSON.stringify(v)}`)
            }

            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV) {
                console.log(`create   impeach  for article  fail: ${JSON.stringify(err)}`)
            }

            return res.json(genFinalReturnResult(err))

        }
    )
})
router.post('/comment',function(req,res,next){

    impeach_dispatcher_async({req:req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV) {
                console.log(`create   impeach  for comment success, result:  ${JSON.stringify(v)}`)
            }

            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV) {
                console.log(`create   impeach for comment   fail: ${JSON.stringify(err)}`)
            }

            return res.json(genFinalReturnResult(err))

        }
    )
})

router.put('/',function(req,res,next){

    impeach_dispatcher_async({req:req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV) {
                console.log(`update   impeach  for comment success, result:  ${JSON.stringify(v)}`)
            }

            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV) {
                console.log(`update   impeach for comment   fail: ${JSON.stringify(err)}`)
            }

            return res.json(genFinalReturnResult(err))

        }
    )
})

router.delete('/',function(req,res,next){

    impeach_dispatcher_async({req:req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV) {
                console.log(`delete   impeach  for comment success, result:  ${JSON.stringify(v)}`)
            }

            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV) {
                console.log(`delete   impeach for comment   fail: ${JSON.stringify(err)}`)
            }

            return res.json(genFinalReturnResult(err))

        }
    )
})
/*              上传文件                */
/* @uploadFileType: 上传的是image还是attachment
* @forColl： 上传的文件是for impeach还是impeachComment（因为这2者共用处理代码以及同一个coll）
* */
router.post('/uploadImage/:impeachId',function(req,res,next){

    impeach_dispatcher_async({req:req}).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV) {
                console.log(`impeachImage upload  success, result:  ${JSON.stringify(v)}`)
            }

            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV) {
                console.log(`impeachImage upload fail: ${JSON.stringify(err)}`)
            }

            return res.json(genFinalReturnResult(err))

        }
    )
})




router.all('*',function(req,res,next){
    // ap.inf('systemError.systemError.noMatchRESTAPI',systemError.systemError.noMatchRESTAPI)
    return res.json(genFinalReturnResult(systemError.systemError.noMatchRESTAPI))
})


module.exports={router}