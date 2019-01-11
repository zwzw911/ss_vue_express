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
const e_coll=require('../../constant/genEnum/DB_Coll').Coll
const e_dbModel=require('../../constant/genEnum/dbModel')

const e_part=require('../../constant/enum/nodeEnum').ValidatePart
const e_chooseFriendInfoFieldName=require('../../constant/enum/nodeEnum').ChooseFriendInfoFieldName
const e_addFriendRule=require('../../constant/enum/mongoEnum').AddFriendRule.DB
/****************  公共函数 ********************/
const db_operation_helper=require('../db_operation_helper')//require("../../../server_common/Test/db_operation_helper")
const common_operation_model=require('../../model/mongo/operation/common_operation_model')

const userData=require('../testData').user
const c_user=require('../class/class_user').c_user
/****************  全局配置 ********************/
const globalConfiguration=require('../../constant/config/globalConfiguration')
const defaultFriendGroupName=globalConfiguration.userGroupFriend.defaultGroupName.enumFormat
/****************  测试数据 ********************/
const user={
    user1:{name:'zw',account:'12341234123',password:'123456',[e_field.USER.ADD_FRIEND_RULE]:e_addFriendRule.ANYONE_ALLOW},
}

const user1=new c_user({userData:user.user1})
const user2=new c_user({userData:userData.user2})
const user3=new c_user({userData:userData.user3})
const user4=new c_user({userData:userData.user4})

/**     API     **/

async function generateFrontTestData_async(){
    let tmpResult

    /**             recreate user                **/
    await user1.reCreateUserGetSessUserIdSalt_async()
    await user2.reCreateUserGetSessUserIdSalt_async()
    await user3.reCreateUserGetSessUserIdSalt_async()
    await user4.reCreateUserGetSessUserIdSalt_async()
    /**             user1 create folder              **/
    let user1_topFolderId1=await user1.createFolderReturnId_async({folderName:'顶级目录1'})
    await user1.createFolderReturnId_async({folderName:'顶级目录1的子目录1',parentEncryptedFolderId:user1_topFolderId1})
    await user1.createFolderReturnId_async({folderName:'顶级目录1的子目录2',parentEncryptedFolderId:user1_topFolderId1})
    /**             user1 create collection              **/
    let user1_encrypted_collection=await user1.createCollection_ReturnEncryptedId_async({collectionName:'new_collection'})
    /**             user add friend and friend accept             **/
    //以为user1的添加好友的rule是any_allow,所以无需返回requestId，直接accept
    await user1.createFriendGroupReturnEncryptedId_async({friendGroupName:'测试'})
    await user2.sendAddFriendRequest_returnId_async({friendId:user1.userId})
    await user3.sendAddFriendRequest_returnId_async({friendId:user1.userId})
    await user4.sendAddFriendRequest_returnId_async({friendId:user1.userId})
    //move user2/user3 from default 我的好友 to 测试
    await user1.moveFriendToNewFriendGroup_async({
        originFriendGroupName:defaultFriendGroupName.MyFriend,
        newFriendGroupName:'测试',
        arr_moveEncryptedFriends:[user1.encryptedObjectId({decryptedObjectId:user2.userId}),user1.encryptedObjectId({decryptedObjectId:user3.userId})]
    })
    /***    user1 create article        ***/
    let user1_encrypted_articleId=await user1.createArticleReturnEncryptedId_async({setStatusFinish:true})
    let user1_encrypted_articleId1=await user1.createArticleReturnEncryptedId_async({setStatusFinish:true})
    let user1_encrypted_articleId2=await user1.createArticleReturnEncryptedId_async({setStatusFinish:true})

    /***    user1 collect self article        ***/
    await user1.addArticleToCollection_async({
        articlesId:[user1_encrypted_articleId,user1_encrypted_articleId1,user1_encrypted_articleId2],
        destCollectionId:user1.decryptedObjectId({encryptedObjectId:user1_encrypted_collection}),
    })
}




generateFrontTestData_async().then(
    (v)=>{ap.inf('generateFrontTestData done',v)},
    (e)=>{ap.inf('generateFrontTestData fail',e)}
)
module.exports={
    generateFrontTestData_async
}
