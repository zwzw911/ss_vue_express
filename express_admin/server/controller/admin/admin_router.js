/**
 * Created by Ada on 2017/9/22.
 * url：
 *  1. /admin，根据method的不同，调用不同的函数进行对应的处理
 *  2. /admin/unique: 创建用户时候，对应用户名/账号进行唯一性检查
 */
'use strict'



const express = require('express');
//var app=express()
const router = express.Router();

const server_common_file_require=require('../../../server_common_file_require')


const genFinalReturnResult=server_common_file_require.misc.genFinalReturnResult//require('../../function/assist/misc').genFinalReturnResult
const userDispatcher_async=require('./admin_dispatcher').dispatcher_async
const userMiscFunc=require('./admin_logic/admin_misc_func')
/*        通过method，判断是CRUDM中的那个操作
*   C: register
*   M: match(login)
* */
router.post('/',function(req,res,next){
//     console.log(`req in`)
// console.log(`req is ${JSON.stringify(req.body)}`)
    userDispatcher_async(req).then(
        (v)=>{
            // console.log(`create   admin register   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            // console.log(`create  admin register    fail: ${JSON.stringify(err)}`)
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

/*router.post('/retrievePassword',function(req,res,next){

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
})*/




/*router.post('/uploadPhoto',function(req,res,next){
// console.log(`uploadPhoto in`)
    userMiscFunc.uploadPhoto_async(req).then(
        (v)=>{
            console.log(`uploadPhoto  success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`uploadPhoto  fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})*/




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