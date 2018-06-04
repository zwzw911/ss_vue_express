/**
 * Created by 张伟 on 2018/04/23.
 */
'use strict'

const ap=require('awesomeprint')

const express = require('express');
//var app=express()
const router = express.Router();

const server_common_file_require=require('../../../server_common_file_require')


const genFinalReturnResult=server_common_file_require.misc.genFinalReturnResult//require('../../function/assist/misc').genFinalReturnResult
const folderDispatcher_async=require('./folder_dispatcher').dispatcher_async

const systemError=server_common_file_require.systemError
//用来为uploadUserPhoto失败的req，在redis中设置对应的reject
const controllerHelper=server_common_file_require.controllerHelper
const e_intervalCheckPrefix=server_common_file_require.nodeEnum.IntervalCheckPrefix


// let originalUrl=req.originalUrl
// ap.inf('originalUrl',originalUrl)
// ap.inf('req.route.stack[0].method',req.route.stack[0].method)
ap.inf('router',router)

//create folder
router.post('/',function(req,res,next){
    folderDispatcher_async(req).then(
        (v)=>{
            ap.inf(`create folder success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`create folder fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )
    // next()
})
//update folder(包括folder改名，移动等)
router.put('/',function(req,res,next){
    folderDispatcher_async(req).then(
        (v)=>{
            ap.inf(`update folder success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`user update fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )
    // next()
})
//delete folder
/*router.delete('/:recordId',function(req,res,next){
    // ap.inf('delete in')
    folderDispatcher_async(req).then(
        (v)=>{
            ap.inf(`delete folder success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`delete folder fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )
    // next()
})*/

//delete可以传递参数，只需axios参数格式改成axios.delete(url,{data:data})
router.delete('/',function(req,res,next){
    // ap.inf('delete all in')
    folderDispatcher_async(req).then(
        (v)=>{
            ap.inf(`delete folder success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`delete folder fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )
    // next()
})
//read folder
//GET  /folder/folderId    or     GET /folder
router.get('/:folderId',function(req,res,next){
    // ap.inf('folderId',req.params.folderId)
    folderDispatcher_async(req).then(
        (v)=>{
            ap.inf(`folderId get success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`folderId get fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )
})
router.get('/',function(req,res,next){
    // ap.inf('match url')
    folderDispatcher_async(req).then(
        (v)=>{
            ap.inf(`folder get success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`folder get fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )
})

router.all('*',function(req,res,next){
    // ap.inf('systemError.systemError.noMatchRESTAPI',systemError.systemError.noMatchRESTAPI)
    return res.json(genFinalReturnResult(systemError.systemError.noMatchRESTAPI))
})

module.exports={router}