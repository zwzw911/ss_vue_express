/**
 * Created by wzhan039 on 2017/10/26.
 */
'use strict'

/*                      server common                                           */
const server_common_file_require=require('../../../../server_common_file_require')

/*                      genEnum                     */
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
// const e_impeachState=server_common_file_require.mongoEnum.ImpeachState.DB
// const e_impeachUserAction=server_common_file_require.mongoEnum.ImpeachUserAction.DB
// const e_impeachAdminAction=server_common_file_require.mongoEnum.ImpeachAdminAction.DB
// const e_impeachAllAction=server_common_file_require.mongoEnum.ImpeachAllAction.DB
// const e_adminPriorityType=server_common_file_require.mongoEnum.AdminPriorityType.DB

const setting={
    MAIN_HANDLED_COLL_NAME:e_coll.COLLECTION
}

module.exports={
    setting,
    /*    endState,
     endAction,
     adminPriorityRelatedAction,
     availableNextUserAction,
     availableNextAdminAction,
     impeachActionMatchState,*/
}