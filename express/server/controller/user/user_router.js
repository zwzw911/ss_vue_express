/**
 * Created by Ada on 2017/7/9.
 * url：
 *  1. /user，根据method的不同，调用不同的函数进行对应的处理
 *  2. /user/unique: 用户注册的时候，对应用户名/账号进行唯一性检查
 */
'use strict'

const ap=require('awesomeprint')

const express = require('express');
const router = express.Router();

const server_common_file_require=require('../../../server_common_file_require')

const systemError=server_common_file_require.systemError

const genFinalReturnResult=server_common_file_require.misc.genFinalReturnResult//require('../../function/assist/misc').genFinalReturnResult
const userDispatcher_async=require('./user_dispatcher').dispatcher_async


//用来为uploadUserPhoto失败的req，在redis中设置对应的reject
const controllerHelper=server_common_file_require.controllerHelper
const e_intervalCheckPrefix=server_common_file_require.nodeEnum.IntervalCheckPrefix

router.post('/',function(req,res,next){
    userDispatcher_async(req).then(
        (v)=>{
            ap.inf(`user create success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`user create fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )
    // next()
})

router.put('/',function(req,res,next){
    userDispatcher_async(req).then(
        (v)=>{
            ap.inf(`user update success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`user update fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )
    // next()
})
router.delete('/',function(req,res,next){
    userDispatcher_async(req).then(
        (v)=>{
            ap.inf(`user delete success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            ap.err(`user delete fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))
        }
    )
    // next()
})
router.get('/',function(req,res,next){
    // ap.inf('match url')
    userDispatcher_async(req).then(
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
router.get('/:userId',function(req,res,next){
    // ap.inf('match url')
    userDispatcher_async(req).then(
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
router.post('/uploadUserPhoto',function(req,res,next){
    // ap.inf('post upload user photo in')
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
router.put('/uploadUserPhoto',function(req,res,next){
    ap.inf('put upload user photo in')
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



router.get('/captcha',function(req,res,next){
// ap.inf('router in')
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
    // ap.inf('systemError.systemError.noMatchRESTAPI',systemError.systemError.noMatchRESTAPI)
    return res.json(genFinalReturnResult(systemError.systemError.noMatchRESTAPI))
})

module.exports={router}