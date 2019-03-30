/**
 * Created by 张伟 on 2018/11/22.
 */
'use strict'

// const userComponenFunction=require('../component_function/express/user_component_function')
// const adminUserComponenFunction=require('../component_function/express_admin/admin_user_component_function')
// const app=require('../../../express/app')
// const adminApp=require('../../../express_admin/app')
/**     third module         **/
const ap=require('awesomeprint')

/**     API         **/
const commonAPI=require('../API/common_API')
const userAPI=require('../API/express/user_API')
const penalizeAPI=require('../API/express/penalize_API')
const articleAPI=require('../API/express/article_API')
const recommendAPI=require('../API/express/recommend_API')
const folderAPI=require('../API/express/folder_API')
const friendGroupAPI=require('../API/express/friend_group_API')
const addFriendAPI=require('../API/express/add_friend_API')
const collectionAPI=require('../API/express/collection_API')

const adminUserAPI=require('../API/express_admin/admin_user_API')
/**     common function         **/
const crypt=require('../../function/assist/crypt')
const misc=require('../../function/assist/misc')

const db_operation_helper= require('../db_operation_helper')
const common_operation_model= require('../../model/mongo/operation/common_operation_model')
/**     enum constant         **/
const mongoEnum=require('../../constant/enum/mongoEnum')
const e_addFriendStatus=mongoEnum.AddFriendStatus.DB

const nodeEnum=require('../../constant/enum/nodeEnum')
const e_part=nodeEnum.ValidatePart
const e_subField=nodeEnum.SubField
const e_chooseFriendInfoFieldName=nodeEnum.ChooseFriendInfoFieldName

const e_dbModel=require('../../constant/genEnum/dbModel')

const e_field=require('../../constant/genEnum/DB_field').Field

const testData=require('../testData')

const globalConfiguration=require('../../constant/config/globalConfiguration')
const e_defaultFriendGroupName=globalConfiguration.userGroupFriend.defaultGroupName.enumFormat


class c_user{
    constructor({userData}) {
        // ap.inf('start constructor')
        // ap.inf('userData',userData)
        this.userData=misc.objectDeepCopy(userData)
        // delete this.userData['addFriendRule']
        this.app=require('../../../express/app')
        // ap.inf('constructor done')
        // this.y = y;
/*        this.function={
            create:{
                article:this.createArticleReturnEncryptedId_async,
                recommend:this.createRecommendReturnEncryptedId_async,
            }
        }*/
    }
    static async getResourceProfileSetting_async({resourceRange,resourceType}){
        let result= await db_operation_helper.getResourceProfileSetting_async({resourceRange:resourceRange,resourceType:resourceType})
        return Promise.resolve(result.num)
    }
    static async setResourceProfileSetting_async({resourceRange,resourceType,num}){
        return await db_operation_helper.changeResourceProfileSetting_async({resourceRange:resourceRange,resourceType:resourceType,num:num})
    }

    async reCreateUserGetSessUserIdSalt_async(){
        //删除用户
        // ap.inf('start to del account',userData.account)
        await db_operation_helper.deleteUserAndRelatedInfo_async({account:this.userData.account,name:this.userData.name})
        //获得sessionId
        let tmpSess=await userAPI.getFirstSession({app:this.app})
        //生成并获得captcha(for create user)
        await userAPI.genCaptcha({sess:tmpSess,app:this.app})
        let captcha=await userAPI.getCaptcha({sess:tmpSess})
        //建立用户
        await userAPI.createUser_async({userData:this.userData,captcha:captcha,app:this.app,sess:tmpSess})

        //生成并获得captcha(for login)
        await userAPI.genCaptcha({sess:tmpSess,app:this.app})
        captcha=await userAPI.getCaptcha({sess:tmpSess})
        // ap.inf('userDate',userData)
        //登录获得sess
        this.sess=await userAPI.userLogin_returnSess_async({userData:this.userData,app:this.app,captcha:captcha,sess:tmpSess})
        ap.wrn('this.sess',this.sess)
        //获得userId
        this.userId=await db_operation_helper.getUserId_async({userAccount:this.userData.account})

        this.tempSalt=await commonAPI.getTempSalt_async({sess:this.sess})

        //获得topLevelFolderId
        let condition={
            [e_field.FOLDER.AUTHOR_ID]:this.userId,
            [e_field.FOLDER.PARENT_FOLDER_ID]:{'$exists':false},
            // [e_field.FOLDER.NAME]:e_defaultFriendGroupName.MyFriend,
            'dDate':{'$exists':false},
        }
        let tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.folder,condition:condition})
        if(0===tmpResult.length){
            // ap.wrn('无法获得顶级目录')
            return
        }
        this.topFolderId=tmpResult[0]['id']

        //获得topCollectionId
        condition={
            [e_field.COLLECTION.CREATOR_ID]:this.userId,
            [e_field.COLLECTION.PARENT_ID]:{'$exists':false},
            // [e_field.FOLDER.NAME]:e_defaultFriendGroupName.MyFriend,
            'dDate':{'$exists':false},
        }
        // ap.wrn('get collection id condition',condition)
        tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.collection,condition:condition})
        // ap.wrn('get collection id result',tmpResult)
        if(0===tmpResult.length){
            // ap.wrn('无法获得顶级目录')
            return
        }
        this.topCollectionId=tmpResult[0]['id']
    }

    async getExistUserSessUserIdSalt_async({userData}){
        //获得sessionId
        let tmpSess=await userAPI.getFirstSession({app:this.app})
        //生成并获得captcha(for login)
        await userAPI.genCaptcha({sess:tmpSess,app:this.app})
        let captcha=await userAPI.getCaptcha({sess:tmpSess})
        // ap.inf('userDate',userData)
        //登录获得sess
        this.sess=await userAPI.userLogin_returnSess_async({userData:this.userData,app:this.app,captcha:captcha,sess:tmpSess})
        // ap.wrn('userDate',userData)
        //获得userId
        this.userId=await db_operation_helper.getUserId_async({userAccount:this.userData.account})

        this.tempSalt=await commonAPI.getTempSalt_async({sess:this.sess})
    }
    encryptedObjectId({decryptedObjectId}){
        return crypt.encryptSingleValue({fieldValue:decryptedObjectId,salt:this.tempSalt}).msg
    }
    decryptedObjectId({encryptedObjectId}){
        return crypt.decryptSingleValue({fieldValue:encryptedObjectId,salt:this.tempSalt}).msg
    }

    /**     create relate information    **/
    /**     创建目录        **/
    async createFolderReturnId_async({folderName,parentEncryptedFolderId}){
        let data={values:{[e_part.RECORD_INFO]:{}}}
        if(undefined!==parentEncryptedFolderId){
            data.values[e_part.RECORD_INFO]={
                [e_field.FOLDER.PARENT_FOLDER_ID]:parentEncryptedFolderId
            }
        }
        data.values[e_part.RECORD_INFO][e_field.FOLDER.NAME]=folderName

        let result=await folderAPI.createFolder_async({sess:this.sess,data:data,app:this.app})
        // ap.inf('create folder result',result)
        return Promise.resolve(result['id'])
    }
    /**     获取用户顶级目录        **/
    async getTopFolderReturnEnryptedId_async({}){


        let result=await folderAPI.getAllTopLevelFolder_async({sess:this.sess,app:this.app})
        // ap.inf('create folder result',result)
        return Promise.resolve(result['folder'][0]['id'])
    }
    /**     创建文档        **/
    async createArticleReturnEncryptedId_async({setStatusFinish=true}){
        //创建new article
        let recordId=await articleAPI.createNewArticle_returnArticleId_async({userSess:this.sess,app:this.app})
        if(true===setStatusFinish){
            //更新到完成状态
            let data={values:{}}
            data.values[e_part.RECORD_ID]=recordId
            data.values[e_part.RECORD_INFO]={[e_field.ARTICLE.STATUS]:mongoEnum.ArticleStatus.DB.FINISHED}
            // ap.wrn('data',data)
            await articleAPI.updateArticle_returnArticleId_async({userSess:this.sess,data:data,app:this.app})
        }
        return Promise.resolve(recordId)
    }
    /**     创建好友分组       **/
    async createFriendGroupReturnEncryptedId_async({friendGroupName}){
        let data={
            values:{
                [e_part.RECORD_INFO]:{
                    [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:friendGroupName,
                    // [e_field.SEND_RECOMMEND.RECEIVERS]:receivers
                }
            }
        }
        // console.log(this.app)
        let result=await friendGroupAPI.createUserFriendGroup_returnRecord_async({data:data,app:this.app,sess:this.sess})
        return Promise.resolve(result['id'])
    }
    /**     创建收藏夹           **/
    async createCollection_ReturnEncryptedId_async({collectionName}){
        // ap.wrn('this.topCollectionId',this.topCollectionId)
        let data={
            values:{
                [e_part.RECORD_INFO]:{
                    [e_field.COLLECTION.NAME]:collectionName
                }
            }
        }
        // ap.wrn('data',data)
        // ap.wrn('sess',this.sess)
        let result=await collectionAPI.createCollection_returnEncryptedId_async({data:data,app:this.app,userSess:this.sess})
        // ap.wrn('resutl',result)
        return Promise.resolve(result)
    }
    /**     收藏文档           **/
    async collectArticle_async({articleId}){
        let data={
            values:{
                [e_part.EDIT_SUB_FIELD]:{
                    [e_field.COLLECTION.ARTICLES_ID]:{
                        [e_subField.TO]:this.encryptedObjectId({decryptedObjectId:this.topCollectionId}),
                        [e_subField.ELE_ARRAY]:[this.encryptedObjectId({decryptedObjectId:articleId})]
                    }
                }
            }
        }
        // ap.wrn('data',data)
        // ap.wrn('sess',this.sess)
        let result=await collectionAPI.updateCollectionArticleTopic_async({data:data,app:this.app,userSess:this.sess})
        // ap.wrn('resutl',result)
        return Promise.resolve(result)
    }
    /**     获得好友分组Id    **/
    async getFriendGroupId_async({friendGroupName}){
        let condition={
            [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:this.userId,
            [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:friendGroupName,
            'dDate':{'$exists':false},
        }
        let tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user_friend_group,condition:condition})
        if(tmpResult.length>0){
            return Promise.resolve(tmpResult[0]['id'])
        }else{
            return Promise.resolve(null)
        }
    }

    /**     请求添加好友，如果被请求人的rule是any_allow,则无需返回requestId     **/
    async sendAddFriendRequest_returnId_async({friendId}){
        // ap.wrn('sendAddFriendRequest_returnId_async in')
        let data={
            values:{
                [e_part.SINGLE_FIELD]:{
                    [e_field.ADD_FRIEND_REQUEST.RECEIVER]:this.encryptedObjectId({decryptedObjectId:friendId}),
                    // [e_field.SEND_RECOMMEND.RECEIVERS]:receivers
                }
            }
        }
        // create friend request 返回字符 “请求已经发出”，需要db操作获得requestId
        let result=await addFriendAPI.createAddFriend_returnRecord_async({data:data,app:this.app,sess:this.sess})

        let condition={
            [e_field.ADD_FRIEND_REQUEST.ORIGINATOR]:this.userId,
            [e_field.ADD_FRIEND_REQUEST.RECEIVER]:friendId,
            [e_field.ADD_FRIEND_REQUEST.STATUS]:e_addFriendStatus.UNTREATED,
        }
        result=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.add_friend_request,condition:{}})
        //如果被请求的用户的加好友rule是allow_anyone，则无requestId
        //如果被请求的用户的加好友rule是permit，才返回requestId
        // ap.wrn('result',result)
        if(result[0]){
            return Promise.resolve(result[0]['id'])
        }else{
            return Promise.resolve()
        }
    }
    /**     同意添加好友请求        **/
    async acceptFriendRequest_returnId_async({requestId}){
        // ap.wrn('requestId',requestId)
        let data={
            values: {
                [e_part.RECORD_ID]: this.encryptedObjectId({decryptedObjectId: requestId})
            }
        }
        // ap.wrn('data',data)
        await addFriendAPI.acceptAddFriend_returnRecord_async({data:data,app:this.app,sess:this.sess})
    }
    /**     移动好友到新好友分组        **/
    async moveFriendToNewFriendGroup_async({originFriendGroupName,newFriendGroupName,arr_moveEncryptedFriends}){
        // ap.wrn('arr_moveEncryptedFriends',arr_moveEncryptedFriends)
        let condition={
            [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:this.userId,
            [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:originFriendGroupName,
        }
        let tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user_friend_group,condition:condition})
        let originFriendGroupId=tmpResult[0]['_id']
        condition={
            [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:this.userId,
            [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:newFriendGroupName,
        }
        tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user_friend_group,condition:condition})
        let newFriendGroupId=tmpResult[0]['_id']

        let data={
            values: {
                [e_part.EDIT_SUB_FIELD]:{
                    [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:{
                        'from':this.encryptedObjectId({decryptedObjectId:originFriendGroupId}),
                        'to':this.encryptedObjectId({decryptedObjectId:newFriendGroupId}),
                        'eleArray':arr_moveEncryptedFriends,
                    }
                },
            }
        }
        // ap.wrn('data',data)
        await friendGroupAPI.moveFriend_async({data:data,app:this.app,sess:this.sess})

    }
    /**     创建分享        **/
    async createRecommendReturnEncryptedId_async({articleId,receivers}){
        let data={
            values:{
                [e_part.RECORD_INFO]:{
                    [e_field.SEND_RECOMMEND.ARTICLE_ID]:articleId,
                    // [e_field.SEND_RECOMMEND.RECEIVERS]:receivers
                },
                [e_part.CHOOSE_FRIEND]:{
                    [e_chooseFriendInfoFieldName.FRIENDS]:receivers,
                }
            }
        }
        let recordId=await recommendAPI.createSendRecommend_returnCryptedId_async({data:data,app:this.app,userSess:this.sess})
        return Promise.resolve(recordId)
    }
    /**     读取推荐文档       **/
    async updateReceivedUnreadCommendToRead_async({unreadRecommendId}){
        let data={
            values:{
                [e_part.RECORD_ID]:unreadRecommendId
            }
        }
        let recordId=await recommendAPI.updateReceivedUnreadCommendToRead_async({data:data,app:this.app,userSess:this.sess})
        // ap.wrn('recordId',recordId)
        return Promise.resolve(recordId)
    }
    /**     添加文档到收藏夹        **/
    async addArticleToCollection_async({articlesId,destCollectionId}){
/*        let encryptedArticles=[]
        for(let singleArticle of articlesId){
            encryptedArticles.push(this.encryptedObjectId({decryptedObjectId:singleArticle}))
        }*/
        let data={values:{
            [e_part.EDIT_SUB_FIELD]:{
                [e_field.COLLECTION.ARTICLES_ID]:{
                    [e_subField.TO]:this.encryptedObjectId({decryptedObjectId:destCollectionId}),
                    [e_subField.ELE_ARRAY]:articlesId,
                }
            }
        }}
        let result=await collectionAPI.updateCollectionArticleTopic_async({data:data,userSess:this.sess,app:this.app})
        return Promise.resolve(result)
    }
}

class c_adminUser{
    constructor({adminUserData}) {
        // ap.inf('start constructor')
        // ap.inf('userData',adminUserData)
        this.adminUserData=misc.objectDeepCopy(adminUserData)
        // delete this.userData['addFriendRule']
        this.adminApp=require('../../../express_admin/app')

    }

    async adminLoginGetSessUserIdSalt_async(){
        let tmpSess=await adminUserAPI.getFirstAdminSession({adminApp:this.adminApp})
        // ap.inf('tmpSess',tmpSess)
        //生成并获得captcha
        // ap.inf('gen admin cpatcha in')
        await adminUserAPI.genAdminCaptcha({sess:tmpSess,adminApp:this.adminApp})
        let captcha=await adminUserAPI.getAdminCaptcha({sess:tmpSess})
        // ap.inf('captcha',captcha)

        this.sess=await adminUserAPI.adminUserLogin_returnSess_async({userData:this.adminUserData,captcha:captcha,sess:tmpSess,adminApp:this.adminApp})

        // this.sess=await adminUserComponenFunction.adminUserLogin_returnSess_async({userData:this.adminUserData,adminApp:this.adminApp})
        // ap.inf('adminLoginGetSessAdnUserId userId',this.sess)
        this.userId=await db_operation_helper.getAdminUserId_async({userName:this.adminUserData.name})
        // ap.inf('adminLoginGetSessAdnUserId userId',this.userId)
        this.tempSalt=await commonAPI.getTempSalt_async({sess:this.sess})
        // ap.inf('adminLoginGetSessAdnUserId tempSalt',this.tempSalt)
    }
    encryptedObjectId({decryptedObjectId}){
        return crypt.encryptSingleValue({fieldValue:decryptedObjectId,salt:this.tempSalt}).msg
    }
    decryptedObjectId({encryptedObjectId}){
        return crypt.decryptSingleValue({fieldValue:encryptedObjectId,salt:this.tempSalt}).msg
    }
    async createPenalize_async({penalizeInfo,decryptedUserId}){
        let cryptedUserId=this.encryptedObjectId({decryptedObjectId:decryptedUserId})
        return await penalizeAPI.createPenalize_returnPenalizeId_async({
            adminUserSess:this.sess,
            penalizeInfo:penalizeInfo,
            penalizedUserId:cryptedUserId,
            adminApp:this.adminApp})
    }
/*    async reCreateUserGetSessAndUserId(){
        // ap.inf('reCreateUserGetSessAndUserId start')
        let tmpResult=await userComponenFunction.reCreateUser_returnSessUserId_async({userData:this.userData,app:this.app})
        // ap.inf('reCreateUserGetSessAndUserId  done',tmpResult)
        this.userId=tmpResult['userId']
        this.session=tmpResult['sess']
    }*/
}

module.exports={
    c_user,
    c_adminUser,
}
/*let newUser=new user({app:app,userData:testData.user.user2})
newUser.reCreateUserGetSessAndUserId().then(
    function(res){
        ap.inf('newUser userid',newUser.userId)
        ap.inf('newUser sess',newUser.sess)
    },
    function (err) {},
)*/
/*let newUser=new adminUser({adminApp:adminApp,adminUserData:testData.admin_user.adminRoot})
newUser.adminLoginGetSessUserIdSalt().then(
    function(res){
        ap.inf('newUser userid',newUser.userId)
        ap.inf('newUser sess',newUser.sess)
        ap.inf('crypted value',newUser.getCryptedObjectId({originObjectId:testData.unExistObjectId}))
    },
    function (err) {},
)*/
// ap.inf('crypted value',newUser.getCryptedObjectId({originObjectId:testData.unExistObjectId}))
