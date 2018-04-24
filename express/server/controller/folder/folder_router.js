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


//用来为uploadUserPhoto失败的req，在redis中设置对应的reject
const controllerHelper=server_common_file_require.controllerHelper
const e_intervalCheckPrefix=server_common_file_require.nodeEnum.IntervalCheckPrefix

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
router.delete('/',function(req,res,next){
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
router.get('/;folderId',function(req,res,next){
    // ap.inf('match url')
    folderDispatcher_async(req).then(
        (v)=>{
            ap.inf(`user get success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`user get fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )
})

router.post('/login',function(req,res,next){
    // ap.inf('match url')
    folderDispatcher_async(req).then(
        (v)=>{
            ap.inf(`user login success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`user login fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )
})

router.post('/uniqueCheck',function(req,res,next){
    folderDispatcher_async(req).then(
        (v)=>{
            ap.inf(`unique check  success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`unique check  fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )
})

router.post('/retrievePassword',function(req,res,next){
    folderDispatcher_async(req).then(
        (v)=>{
            ap.inf(`retrievePassword  success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`retrievePassword  fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )
})

router.put('/changePassword',function(req,res,next){
    folderDispatcher_async(req).then(
        (v)=>{
            ap.inf(`changePassword  success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`changePassword  fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )
})

router.put('/uploadUserPhoto',function(req,res,next){
    // ap.inf('put upload user photo in')
    folderDispatcher_async(req).then(
        (v)=>{
            ap.inf(`upload photo  success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`upload photo  fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )
})
/*router.post('/uploadUserPhoto',function(req,res,next){
// console.log(`uploadPhoto in`)
    userMiscFunc.uploadDataUrlPhoto_async({req}).then(
        (v)=>{
            console.log(`uploadPhoto  success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`uploadPhoto  fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
           /!* //因为uploadPhoto是直接暴露出来的，可能会引发攻击，因此任何错误都将被视为reject（一刀切，将内部引发的错误也算攻击...）
            controllerHelper.setReject_async({req:req,reqTypePrefix:e_intervalCheckPrefix.UPLOAD_USER_PHOTO}).then(function(result){
                console.log(`uploadPhoto  reject, please try ${result} seconds later`)
                return res.json(genFinalReturnResult(err))
            },function(err){
                console.log(`uploadPhoto  fail: ${JSON.stringify(err)}`)
                return res.json(genFinalReturnResult(err))
            })*!/



        }
    )
})*/




router.get('/captcha',function(req,res,next){
// ap.inf('router in')
    folderDispatcher_async(req).then(
        (v)=>{
            ap.inf(`captcha  success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`captcha  fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )
    /*userMiscFunc.generateCaptcha_async({req:req}).then(
        (v)=>{
            console.log(`captcha  success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`captcha  fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )*/
})

module.exports={router}