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
const dispatcher_async=require('./impeach_action_dispatch').dispatcher_async


/*        通过method，判断是CRUDM中的那个操作
 *   C: register
 *   M: match(login)
 * */
router.post('/',function(req,res,next){
//     console.log(`req in`)
// console.log(`req is ${JSON.stringify(req.body)}`)
    dispatcher_async(req).then(
        (v)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV){
                console.log(`create   impeach action   success, result:  ${JSON.stringify(v)}`)
            }
            return res.json(v)
        },
        (err)=>{
            if(server_common_file_require.appSetting.currentEnv===server_common_file_require.nodeEnum.Env.DEV) {
                console.log(`create   impeach action     fail: ${JSON.stringify(err)}`)
            }
            return res.json(genFinalReturnResult(err))

        }
    )
})


module.exports={router}