/**
 * Created by ada on 2017/9/30.
 */
'use strict'

/*              common  require                 */
const express = require('express');
const router = express.Router();
const server_common_file_require=require('../../../server_common_file_require')
const genFinalReturnResult=server_common_file_require.misc.genFinalReturnResult//require('../../function/assist/misc').genFinalReturnResult


/*              dispatch require                 */
const dispatcher_async=require('./user_friend_group_dispatch').dispatcher_async

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
//     console.log(`req in`)
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
module.exports={router}