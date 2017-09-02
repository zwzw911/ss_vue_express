/**
 * Created by Ada on 2017/7/9.
 * url：
 *  1. /user，根据method的不同，调用不同的函数进行对应的处理
 *  2. /user/unique: 用户注册的时候，对应用户名/账号进行唯一性检查
 */
'use strict'



const express = require('express');
//var app=express()
const router = express.Router();
const genFinalReturnResult=require('../../function/assist/misc').genFinalReturnResult
const userDispatcher_async=require('./user_dispatcher').dispatcher_async
const userMiscFunc=require('./user_logic/user_misc_func')
/*        通过method，判断是CRUDM中的那个操作
*   C: register
*   M: match(login)
* */
router.post('/',function(req,res,next){

    userDispatcher_async(req).then(
        (v)=>{
            console.log(`create   register   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`create   register    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})

router.post('/uniqueCheck_async',function(req,res,next){

    userMiscFunc.uniqueCheck_async(req).then(
        (v)=>{
            console.log(`unique check  success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`unique check  fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})

router.post('/retrievePassword',function(req,res,next){

    userMiscFunc.retrievePassword_async(req).then(
        (v)=>{
            console.log(`retrievePassword  success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`retrievePassword  fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})




router.post('/uploadPhoto',function(req,res,next){

    userDispatcher_async.uploadPhoto_async(req).then(
        (v)=>{
            console.log(`uploadPhoto  success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`uploadPhoto  fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})




router.post('/captcha',function(req,res,next){

    userMiscFunc.generateCaptcha_async(req).then(
        (v)=>{
            console.log(`captcha  success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`captcha  fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})

module.exports={router}