/**
 * Created by ada on 2017/9/22.
 */
'use strict'

/*                      server common                                           */
const server_common_file_require=require('../../../../server_common_file_require')

/*                      genEnum                     */
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_impeachState=server_common_file_require.mongoEnum.ImpeachState.DB


const setting={
    MAIN_HANDLED_COLL_NAME:e_coll.IMPEACH_STATE
}

//对于当前状态，下一个可用的状态
const availableNextState={
    [e_impeachState.NEW]:{
        [e_coll.USER]:[e_impeachState.SUBMIT],
    },
    [e_impeachState.SUBMIT]:{
        [e_coll.USER]:[e_impeachState.REVOKE],//自动改成NEW
        [e_coll.ADMIN_USER]:[e_impeachState.ACCEPT]
    },
    //一旦accept，必须由admin进行处理（防止普通用户随便举报）
    [e_impeachState.ACCEPT]:{
        [e_coll.ADMIN_USER]:[e_impeachState.ASSIGN]
    },
    [e_impeachState.ASSIGN]:{
        [e_coll.ADMIN_USER]:[e_impeachState.ONGOING]
    },
    [e_impeachState.ONGOING]:{
        [e_coll.ADMIN_USER]:[e_impeachState.DONE,e_impeachState.REJECT]
    },
}

//一个impeach的最终状态
const endState=[e_impeachState.REJECT,e_impeachState.DONE]

module.exports={
    setting,
    endState,
    availableNextState,
}
// console.log(`${JSON.stringify(setting)}`)