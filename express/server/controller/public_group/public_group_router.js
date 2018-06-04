/**
 * Created by ada on 2017/9/30.
 */
'use strict'
const ap=require('awesomeprint')
/*              common  require                 */
const express = require('express');
const router = express.Router();
const server_common_file_require=require('../../../server_common_file_require')
const genFinalReturnResult=server_common_file_require.misc.genFinalReturnResult//require('../../function/assist/misc').genFinalReturnResult
const systemError=server_common_file_require.systemError

/*              dispatch require                 */
const dispatcher_async=require('./public_group_dispatch').dispatcher_async
const requestJoin_async=require('./public_group_misc_logic/requestJoin').requestJoin_async
const requestLeave_async=require('./public_group_misc_logic/requestLeave').requestLeave_async
const adminManageRequest_async=require('./public_group_misc_logic/adminManageRequest').adminManageRequest_async
const adminRemoveMember_async=require('./public_group_misc_logic/adminRemoveMember').adminRemoveMember_async
const creatorAddRemoveAdmin_async=require('./public_group_misc_logic/creatorAddRemoveAdmin').creatorAddRemoveAdmin_async
const nodeEnum=server_common_file_require.nodeEnum
// const i=server_common_file_require.inputDataRuleType
const e_method=nodeEnum.Method
const e_part=nodeEnum.ValidatePart
const e_updateType=nodeEnum.UpdateType
// const e_uploadFileType=nodeEnum.UploadFileType
/*        通过method，判断是CRUDM中的那个操作
 *   C: register
 *   M: match(login)
 * */
router.post('/',function(req,res,next){
    // ap.inf('req in')
// console.log(`req is ${JSON.stringify(req.body)}`)
    dispatcher_async({req:req}).then(
        (v)=>{
            console.log(`create  user friend group   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`create   user friend group    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})


/*              虚拟方法，对coll的部分字段操作;preCheck和logic放在一起               */
//用户请求加入群
router.post('/requestJoin',function(req,res,next){
    // ap.inf('requestJoin in')
// console.log(`req is ${JSON.stringify(req.body)}`)
    requestJoin_async({req:req}).then(
        (v)=>{
            console.log(`request join success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`request join fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})
//用户退群
router.post('/requestLeave',function(req,res,next){
    // ap.inf('requestJoin in')
// console.log(`req is ${JSON.stringify(req.body)}`)
    requestLeave_async({req:req}).then(
        (v)=>{
            console.log(`request leave success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`request leave  fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})

//管理员处理 加入请求
router.post('/adminManageRequest',function(req,res,next){
    // ap.inf('requestJoin in')
// console.log(`req is ${JSON.stringify(req.body)}`)
    adminManageRequest_async({req:req}).then(
        (v)=>{
            console.log(`admin manage request success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`admin manage request fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})
//管理员直接踢人
router.post('/adminRemoveMember',function(req,res,next){
    // ap.inf('requestJoin in')
// console.log(`req is ${JSON.stringify(req.body)}`)
    adminRemoveMember_async({req:req}).then(
        (v)=>{
            console.log(`admin remove member success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`admin remove member fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})

//创建人加减管理员
router.post('/creatorAddRemoveAdmin',function(req,res,next){
    // ap.inf('requestJoin in')
// console.log(`req is ${JSON.stringify(req.body)}`)
    creatorAddRemoveAdmin_async({req:req}).then(
        (v)=>{
            console.log(`creator add remove admin success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`creator add remove admin fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})
/*router.post('/updateUserFriendGroup',function(req,res,next){
//     console.log(`req in`)
// console.log(`req is ${JSON.stringify(req.body)}`)
    if(undefined===req.body.values[e_part.METHOD] && req.body.values[e_part.METHOD]===e_method.UPDATE){
        dispatcher_async({req:req,updateType:e_updateType.SUB_FIELD}).then(
            (v)=>{
                console.log(`update  user friend group sub field  success, result:  ${JSON.stringify(v)}`)
                return res.json(v)
            },
            (err)=>{
                console.log(`update   user friend group  sub field  fail: ${JSON.stringify(err)}`)
                return res.json(genFinalReturnResult(err))

            }
        )
    }

})*/
router.all('*',function(req,res,next){
    // ap.inf('systemError.systemError.noMatchRESTAPI',systemError.systemError.noMatchRESTAPI)
    return res.json(genFinalReturnResult(systemError.systemError.noMatchRESTAPI))
})
module.exports={router}