/**
 * Created by zhang wei on 2018/6/5.
 */
'use strict'

const ap=require('awesomeprint')

const express = require('express');
const router = express.Router();

const server_common_file_require=require('../../../server_common_file_require')

const systemError=server_common_file_require.systemError

const genFinalReturnResult=server_common_file_require.misc.genFinalReturnResult//require('../../function/assist/misc').genFinalReturnResult
const likeDislikeDispatcher_async=require('./articleLiekDislike_dispatch').article_likeDislike_dispatcher_async

router.post('/like',function(req,res,next){

    likeDislikeDispatcher_async({req:req}).then(
        (v)=>{
            console.log(`likeDislike success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`likeDislike fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )
})
router.post('/dislike',function(req,res,next){

    likeDislikeDispatcher_async({req:req}).then(
        (v)=>{
            console.log(`likeDislike success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`likeDislike fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )
})

router.all('*',function(req,res,next){
    // ap.inf('systemError.systemError.noMatchRESTAPI',systemError.systemError.noMatchRESTAPI)
    return res.json(genFinalReturnResult(systemError.systemError.noMatchRESTAPI))
})

module.exports={
    router
}