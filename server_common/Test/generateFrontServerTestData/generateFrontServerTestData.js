/**
 * Created by 张伟 on 2018/7/20.
 * 创建最小数据集，用于vue（页面）测试
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)
const app=require('../../../express/app')
const adminApp=require(`../../../express_admin/app`)

/******************    公共常量       **************/
const e_field=require('../../constant/genEnum/DB_field').Field
const e_part=require('../../constant/enum/nodeEnum').ValidatePart
const e_coll=require('../../constant/genEnum/DB_Coll').Coll
const e_dbModel=require('../../constant/genEnum/dbModel')

const e_addFriendRule=require('../../constant/enum/mongoEnum').AddFriendRule.DB
/****************  公共函数 ********************/
// const server_common_file_require=require('../../server_common_file_require')

/*const db_operation_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")
const common_operation_model=server_common_file_require.common_operation_model
// const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')

const userAPI=server_common_file_require.user_API//require('../API_helper/API_helper')
const penalizeAPI=server_common_file_require.penalize_API
const commonAPI=server_common_file_require.common_API
const articleAPI=server_common_file_require.article_API
const impeachAPI=server_common_file_require.impeach_API
const impeachActionAPI=server_common_file_require.impeachAction_API
const impeachCommentAPI=server_common_file_require.impeachComment_API
const publicGroupAPI=server_common_file_require.publicGroup_API
const friendGroupAPI=server_common_file_require.friend_group_API

const userComponentFunction=server_common_file_require.user_component_function
const adminUserComponentFunction=server_common_file_require.admin_user_component_function
const articleComponentFunction=server_common_file_require.article_component_function*/
const db_operation_helper=require('../db_operation_helper')//require("../../../server_common/Test/db_operation_helper")
const common_operation_model=require('../../model/mongo/operation/common_operation_model')
// const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')
// const commonAPI=require('../API/common_API')
//
// const userAPI=require('../API/express/user_API')//require('../API_helper/API_helper')
// const folderAPI=require('../API/express/folder_API')
// const penalizeAPI=require('../API/express/penalize_API')
// const articleAPI=require('../API/express/article_API')
// const impeachAPI=require('../API/express/impeach_API')
// const impeachActionAPI=require('../API/express/impeachAction_API')
// const impeachCommentAPI=require('../API/express/impeachComment_API')
// const publicGroupAPI=require('../API/express/publicGroup_API')
// const friendGroupAPI=require('../API/express/friend_group_API')

// const userComponentFunction=require('../component_function/express/user_component_function')
// const adminUserComponentFunction=require('../component_function/express_admin/admin_user_component_function')
// const articleComponentFunction=require('../component_function/express/article_component_function')
//
// const removeAllData=require('../../maintain/preDeploy/removeAllData')
// const operateInitData=require('../../maintain/preDeploy/operateInitData')
// const rePreDeploy_async=require('../../maintain/preDeploy/main').rePreDeploy_async
const userData=require('../testData').user
const c_user=require('../class/class_user').c_user
/****************  测试数据 ********************/
const user={
    user1:{name:'zw',account:'12341234123',password:'123456',[e_field.USER.ADD_FRIEND_RULE]:e_addFriendRule.NOONE_ALLOW},
}

const user1=new c_user({userData:user.user1})
const user2=new c_user({userData:userData.user2})
const user3=new c_user({userData:userData.user3})


/**     API     **/

async function generateFrontTestData(){
    let tmpResult

    /**             recreate user                **/
    await user1.reCreateUserGetSessUserIdSalt_async()
    await user2.reCreateUserGetSessUserIdSalt_async()
    await user3.reCreateUserGetSessUserIdSalt_async()
    /**             user create folder              **/
    let user1_topFolderId1=await user1.createFolderReturnId_async({folderName:'顶级目录1'})
    await user1.createFolderReturnId_async({folderName:'顶级目录1的子目录1',parentEncryptedFolderId:user1_topFolderId1})
    await user1.createFolderReturnId_async({folderName:'顶级目录1的子目录2',parentEncryptedFolderId:user1_topFolderId1})
    /**             user add friend and friend accept             **/
    await user1.createFriendGroupReturnEncryptedId_async({friendGroupName:'测试'})
    let requestId=await user1.sendAddFriendRequest_returnId_async({friendId:user2.userId})
    await user2.acceptFriendRequest_returnId_async({requestId:requestId})
}




generateFrontTestData().then(
    (v)=>{ap.inf('generateFrontTestData done',v)},
    (e)=>{ap.inf('generateFrontTestData fail',e)}
)
module.exports={
    generateFrontTestData
}
