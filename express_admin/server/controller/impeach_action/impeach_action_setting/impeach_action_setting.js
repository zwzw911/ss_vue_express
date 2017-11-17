/**
 * Created by ada on 2017/9/22.
 */
'use strict'

/*                      server common                                           */
const server_common_file_require=require('../../../../server_common_file_require')

/*                      genEnum                     */
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_impeachState=server_common_file_require.mongoEnum.ImpeachState.DB
const e_impeachUserAction=server_common_file_require.mongoEnum.ImpeachUserAction.DB
const e_impeachAdminAction=server_common_file_require.mongoEnum.ImpeachAdminAction.DB
const e_impeachAllAction=server_common_file_require.mongoEnum.ImpeachAllAction.DB
const e_adminPriorityType=server_common_file_require.mongoEnum.AdminPriorityType.DB

const setting={
    MAIN_HANDLED_COLL_NAME:e_coll.IMPEACH_ACTION
}

//对于当前操作，下一个可用的操作
const availableNextUserAction={
    [e_impeachUserAction.CREATE]:[e_impeachUserAction.SUBMIT],
    [e_impeachUserAction.SUBMIT]:[e_impeachUserAction.REVOKE],

}
const availableNextAdminAction={
    [e_impeachUserAction.SUBMIT]:[e_impeachAdminAction.ASSIGN],
    [e_impeachAdminAction.ASSIGN]:[e_impeachAdminAction.ACCEPT],
    [e_impeachAdminAction.ACCEPT]:[e_impeachAdminAction.REJECT,e_impeachAdminAction.FINISH]
}
//一个impeach的最终状态
const endState=[e_impeachState.DONE]
const endAction=[e_impeachAdminAction.REJECT,e_impeachAdminAction.FINISH]

//admin拥有的权限，对应可以操作的action
const adminPriorityRelatedAction={
    [e_adminPriorityType.IMPEACH_ASSIGN]:[e_impeachAdminAction.ASSIGN],
    [e_adminPriorityType.IMPEACH_DEAL]:[e_impeachAdminAction.ACCEPT,e_impeachAdminAction.FINISH,e_impeachAdminAction.REJECT]
}

//admin用户可用的操作需要的权限（便于代码中进行判断）
const adminActionNeededPriority={
    [e_impeachAdminAction.FINISH]:e_adminPriorityType.IMPEACH_DEAL,
    [e_impeachAdminAction.ASSIGN]:e_adminPriorityType.IMPEACH_ASSIGN,
    [e_impeachAdminAction.REJECT]:e_adminPriorityType.IMPEACH_DEAL,
    [e_impeachAdminAction.ACCEPT]:e_adminPriorityType.IMPEACH_DEAL,
}
//action和state的匹配关系
const impeachActionMatchState={
    [e_impeachAllAction.CREATE]:e_impeachState.NEW,
    [e_impeachAllAction.SUBMIT]:e_impeachState.WAIT_ASSIGN,
    [e_impeachAllAction.REVOKE]:e_impeachState.NEW,

    [e_impeachAllAction.ASSIGN]:e_impeachState.WAIT_HANDLE,
    [e_impeachAllAction.ACCEPT]:e_impeachState.ONGOING,
    [e_impeachAllAction.REJECT]:e_impeachState.DONE,
    [e_impeachAllAction.FINISH]:e_impeachState.DONE,
}
// console.log(`${JSON.stringify(adminPriorityRelatedAction)}`)
module.exports={
    setting,
    endState,
    endAction,
    adminPriorityRelatedAction,
    availableNextUserAction,
    availableNextAdminAction,
    adminActionNeededPriority,
    impeachActionMatchState,
}
// console.log(`${JSON.stringify(setting)}`)