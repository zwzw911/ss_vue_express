/**
 * Created by Ada on 2017/9/22.
 * url：
 *  1. /admin，根据method的不同，调用不同的函数进行对应的处理
 *  2. /admin/unique: 创建用户时候，对应用户名/账号进行唯一性检查
 */
'use strict'

const ap=require('awesomeprint')

const express = require('express');
//var app=express()
const router = express.Router();

const server_common_file_require=require('../../../server_common_file_require')

const systemError=server_common_file_require.systemError
const genFinalReturnResult=server_common_file_require.misc.genFinalReturnResult//require('../../function/assist/misc').genFinalReturnResult
const userDispatcher_async=require('./admin_dispatcher').dispatcher_async
const userMiscFunc=require('./admin_logic/admin_misc_func')
/*let originalUrl=req.originalUrl
ap.inf('originalUrl',originalUrl)*/
// ap.wrn('admin router in')
/*              create          */
router.post('/',function(req,res,next){
    userDispatcher_async(req).then(
        (v)=>{
            return res.json(v)
        },
        (err)=>{
            return res.json(genFinalReturnResult(err))

        }
    )
})

/*              update          */
router.put('/',function(req,res,next){
    userDispatcher_async(req).then(
        (v)=>{
            return res.json(v)
        },
        (err)=>{
            return res.json(genFinalReturnResult(err))

        }
    )
})

/*              delete          */
router.delete('/',function(req,res,next){
    userDispatcher_async(req).then(
        (v)=>{
            return res.json(v)
        },
        (err)=>{
            return res.json(genFinalReturnResult(err))

        }
    )
})


router.post('/login',function(req,res,next){
    // ap.inf('match url')
    userDispatcher_async(req).then(
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
router.delete('/logout',function(req,res,next){
    // ap.inf('match url')
    userDispatcher_async(req).then(
        (v)=>{
            ap.inf(`user logout success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`user logout fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )
})
router.post('/uniqueCheck',function(req,res,next){
    userDispatcher_async(req).then(
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
    userDispatcher_async(req).then(
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
    userDispatcher_async(req).then(
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
    userDispatcher_async(req).then(
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

router.get('/captcha',function(req,res,next){
// ap.inf('router captcha in')
    userDispatcher_async(req).then(
        (v)=>{
            ap.inf(`captcha  success, `)//result:  ${JSON.stringify(v)}
            return res.json(v)
        },
        (err)=>{
            ap.err(`captcha  fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )

})


router.all('*',function(req,res,next){
    // ap.wrn('* in')
    // ap.inf('systemError.systemError.noMatchRESTAPI',systemError.systemError.noMatchRESTAPI)
    return res.json(genFinalReturnResult(systemError.systemError.noMatchRESTAPI))
})

module.exports={router}