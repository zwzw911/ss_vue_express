/**
 * Created by Ada on 2017/7/11.
 */
'use strict'
/**************  controller相关常量  ****************/
const controllerError=require('../../server/controller/user_friend_group/user_friend_group_setting/user_friend_group_controllerError').controllerError
let baseUrl="/user_friend_group/",finalUrl,url
/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)
const assert=require(`assert`)
/******************    待测函数  **************/
const app=require('../../app')
const adminApp=require(`../../../express_admin/app`)

const server_common_file_require=require('../../server_common_file_require')
/****************  公共常量 ********************/
const e_serverRuleType=server_common_file_require.inputDataRuleType.ServerRuleType

const nodeEnum=server_common_file_require.nodeEnum
const e_part=nodeEnum.ValidatePart
const e_subField=nodeEnum.SubField
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum

const mongoEnum=server_common_file_require.mongoEnum
const e_addFriendStatus=mongoEnum.AddFriendStatus.DB
const e_impeachAllAction=mongoEnum.ImpeachAllAction.DB
const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB
const e_articleStatus=mongoEnum.ArticleStatus.DB
const e_impeachState=mongoEnum.ImpeachState.DB
const e_resourceRange=mongoEnum.ResourceRange.DB
const e_resourceType=mongoEnum.ResourceType.DB
const e_documentStatus=mongoEnum.DocumentStatus.DB
const e_impeachUserAction=mongoEnum.ImpeachAllAction.DB
const e_publicGroupJoinInRule=mongoEnum.PublicGroupJoinInRule.DB
const e_dbModel=require('../../server/constant/genEnum/dbModel')
const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field


const e_parameterPart=server_common_file_require.testCaseEnum.ParameterPart
const e_skipPart=server_common_file_require.testCaseEnum.SkipPart


const e_iniSettingObject=require('../../server/constant/genEnum/initSettingObject').iniSettingObject

const userGroupFriend_Configuration=server_common_file_require.globalConfiguration.userGroupFriend
/******************    数据库函数  **************/

/****************  公共函数 ********************/
const db_operation_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")
const common_operation_model=server_common_file_require.common_operation_model
const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')

const userAPI=server_common_file_require.user_API//require('../API_helper/API_helper')
const penalizeAPI=server_common_file_require.penalize_API
const commonAPI=server_common_file_require.common_API
const articleAPI=server_common_file_require.article_API
const impeachAPI=server_common_file_require.impeach_API
const impeachActionAPI=server_common_file_require.impeachAction_API
const impeachCommentAPI=server_common_file_require.impeachComment_API
const publicGroupAPI=server_common_file_require.publicGroup_API
const friendGroupAPI=server_common_file_require.friend_group_API
const addFriendAPI=server_common_file_require.add_friend_API

const userComponentFunction=server_common_file_require.user_component_function
const adminUserComponentFunction=server_common_file_require.admin_user_component_function
const articleComponentFunction=server_common_file_require.article_component_function
const misc_helper=server_common_file_require.misc_helper
const crypt=server_common_file_require.crypt
const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const generateTestData=server_common_file_require.generateTestData

const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule


/****************  公共错误 ********************/
const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
// const controllerCheckerError=server_common_file_require.helperError.checker
const controllerCheckerError=server_common_file_require.helperError.checker
const resourceCheckError=server_common_file_require.helperError.resourceCheck
const inputValueLogicCheckError=server_common_file_require.helperError.inputValueLogicCheck






let recordId1,recordId2,recordId3,expectedErrorRc

let user1IdCryptedByUser1,user1IdCryptedByUser2,user1IdCryptedByUser3,
    user2IdCryptedByUser1,user2IdCryptedByUser2,user2IdCryptedByUser3,
    user3IdCryptedByUser1,user3IdCryptedByUser2,user3IdCryptedByUser3,
    user3IdCryptedByAdminRoot,adminRootIdCryptedByUser1,
    user1Sess,user2Sess,user3Sess,adminRootSess,
    user1Id,user2Id,user3Id,adminRootId

let friendGroupId1,friendGroupId1CryptedByUser1,friendGroupId1CryptedByUser2,friendGroupId1CryptedByAdminRoot
let unExistObjectCryptedByUser1
let defaultGroup1,defaultGroup1CryptedByUser1
// let articleId1
let data={values:{}}

let normalRecord={
    [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:'好友',
    // [e_field.USER_FRIEND_GROUP.]:e_impeachUserAction.SUBMIT,
    // [e_field.IMPEACH_ACTION.OWNER_ID]:undefined, //普通用户无需操作此字段
}

let tmpResult
/*              create user friend group               */
describe('user friend group', async function() {
    before('prepare', async function () {
        tmpResult = await generateTestData.getUserCryptedUserId_async({app: app, adminApp: adminApp})

        user1IdCryptedByUser1 = tmpResult['user1IdCryptedByUser1']
        user1IdCryptedByUser2 = tmpResult['user1IdCryptedByUser2']
        user1IdCryptedByUser3 = tmpResult['user1IdCryptedByUser3']
        user2IdCryptedByUser1 = tmpResult['user2IdCryptedByUser1']
        user2IdCryptedByUser2 = tmpResult['user2IdCryptedByUser2']
        user2IdCryptedByUser3 = tmpResult['user2IdCryptedByUser3']
        user3IdCryptedByUser1 = tmpResult['user3IdCryptedByUser1']
        user3IdCryptedByUser2 = tmpResult['user3IdCryptedByUser2']
        user3IdCryptedByUser3 = tmpResult['user3IdCryptedByUser3']
        user3IdCryptedByAdminRoot = tmpResult['user3IdCryptedByAdminRoot']
        adminRootIdCryptedByUser1 = tmpResult['adminRootIdCryptedByUser1']
        user1Sess = tmpResult['user1Sess']
        user2Sess = tmpResult['user2Sess']
        user3Sess = tmpResult['user3Sess']
        adminRootSess = tmpResult['adminRootSess']
        user1Id = tmpResult['user1Id']
        user2Id = tmpResult['user2Id']
        user3Id = tmpResult['user3Id']
        adminRootId = tmpResult['adminRootId']

        /**     unExistObjectId         **/
        unExistObjectCryptedByUser1=await commonAPI.cryptObjectId_async({objectId:testData.unExistObjectId,sess:user1Sess})
        /**     user1 create group      **/
        let friendGroupData={}
        friendGroupData.values={
            [e_part.RECORD_INFO]:{
                [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:'test test test'
            }
        }
        tmpResult=await friendGroupAPI.createUserFriendGroup_returnRecord_async({data:friendGroupData,sess:user1Sess,app:app})
        // ap.wrn('create friend group',tmpResult)
        friendGroupId1CryptedByUser1=tmpResult['id']
        // ap.wrn('friendGroupId1CryptedByUser1',friendGroupId1CryptedByUser1)
        friendGroupId1=await commonAPI.decryptObjectId_async({objectId:friendGroupId1CryptedByUser1,sess:user1Sess})
        friendGroupId1CryptedByAdminRoot=await commonAPI.cryptObjectId_async({objectId:friendGroupId1,sess:adminRootSess})
        friendGroupId1CryptedByUser2=await commonAPI.cryptObjectId_async({objectId:friendGroupId1,sess:user2Sess})
        /**     user1 find default group      **/
        let condition={
            [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:'我的好友',
            [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:user1Id
        }
        tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user_friend_group,condition:condition})
        defaultGroup1=tmpResult[0]['_id']
        defaultGroup1CryptedByUser1=await commonAPI.cryptObjectId_async({objectId:defaultGroup1,sess:user1Sess})
        // ap.wrn('defaultGroup',defaultGroup)
        console.log(`==============================================================`)
        console.log(`===============    move friend all done      =================`)
        console.log(`==============================================================`)
    });
    /****************************************/
    /*              create                  */
    /****************************************/
    describe('create user friend group',async  function() {
        before('prepare', async function () {
            data.values = {}
            url = ''
            finalUrl = baseUrl + url
        })
        it('1.1 admin not allow for create', async function() {
            data.values={}
            data.values[e_part.RECORD_INFO]=normalRecord
            // data.values[e_part.METHOD]=e_method.CREATE
            expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('1.2 group name unique check', async function() {
            data.values={}
            normalRecord={[e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:userGroupFriend_Configuration.defaultGroupName.enumFormat.MyFriend}
            data.values[e_part.RECORD_INFO]=normalRecord
            // data.values[e_part.METHOD]=e_method.CREATE

            expectedErrorRc=controllerCheckerError.compoundFieldHasMultipleDuplicateRecord({collName:e_coll.USER_FRIEND_GROUP,singleCompoundFieldName:'unique_group_name_for_user'}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            // normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachUserAction.SUBMIT
        });
        it('1.3 group name check:XSS', async function() {
            data.values={}
            // normalRecord=
            data.values[e_part.RECORD_INFO]={[e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:'<alert>a'}
            // data.values[e_part.METHOD]=e_method.CREATE

            expectedErrorRc=inputValueLogicCheckError.ifValueXSS.fieldValueXSS({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('1.4 group number limitation check(need modify global manually) ', async function() {
            let resourceRange=e_resourceRange.MAX_FRIEND_GROUP_NUM_PER_USER
            let originalSetting=await db_operation_helper.getResourceProfileSetting_async({resourceRange:resourceRange,resourceType:e_resourceType.BASIC})
            // ap.wrn('originalSetting',originalSetting)
            await db_operation_helper.changeResourceProfileSetting_async({resourceRange:resourceRange,resourceType:e_resourceType.BASIC,num:0})


            data.values={}
            data.values[e_part.RECORD_INFO]={[e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:'新朋友群'}
            // data.values[e_part.METHOD]=e_method.CREATE

            expectedErrorRc=resourceCheckError.ifEnoughResource_async.totalUserFriendGroupNumExceed({}).rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

            //恢复原始设置
            await db_operation_helper.changeResourceProfileSetting_async({resourceRange:resourceRange,resourceType:e_resourceType.BASIC,num:originalSetting['num'],size:originalSetting['size']})
        });

    })

    /****************************************/
    /*              update                  */
    /****************************************/
    describe('update user friend group',async  function() {
        before('prepare', async function () {
            data.values = {}
            url = ''
            finalUrl = baseUrl + url
        })
        it('2.1 admin try to update user1s friend group', async function () {
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByAdminRoot
            data.values[e_part.RECORD_ID] =friendGroupId1CryptedByAdminRoot
            data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl: finalUrl,sess: adminRootSess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('2.2 user2 try to update user1 group', async function() {
            data.values={}
            data.values[e_part.RECORD_INFO]=normalRecord
            data.values[e_part.RECORD_ID]=friendGroupId1CryptedByUser2
            // data.values[e_part.METHOD]=e_method.UPDATE
            expectedErrorRc=controllerError.update.notUserGroupOwnerCantUpdate.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('2.3 user1 try to update default groups name', async function() {




            data.values={}
            data.values[e_part.RECORD_ID]=defaultGroup1CryptedByUser1
            data.values[e_part.RECORD_INFO]={
                [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:'好友',
            }

            // data.values[e_part.METHOD]=e_method.UPDATE
            expectedErrorRc=controllerError.update.notAllowUpdateDefaultRecord.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('2.4 user1 try to update group name to default name', async function() {
            data.values={}
            data.values[e_part.RECORD_INFO]={
                [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:'我的好友',
            }
            data.values[e_part.RECORD_ID]=friendGroupId1CryptedByUser1
            // data.values[e_part.METHOD]=e_method.UPDATE
            expectedErrorRc=controllerCheckerError.compoundFieldHasMultipleDuplicateRecord({collName:e_coll.USER_FRIEND_GROUP,singleCompoundFieldName:'unique_group_name_for_user'}).rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('2.5 group name check:XSS', async function() {
            data.values={}
            data.values[e_part.RECORD_ID]=friendGroupId1CryptedByUser1
            data.values[e_part.RECORD_INFO]={[e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:'<alert>a'}
            // data.values[e_part.METHOD]=e_method.CREATE

            expectedErrorRc=inputValueLogicCheckError.ifValueXSS.fieldValueXSS({}).rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });

    })

    /****************************************/
    /*              delete                  */
    /****************************************/
    describe('delete user friend group',async  function() {
        before('prepare', async function () {
            data.values = {}
            url = ''
            finalUrl = baseUrl + url
        })

        it('3.1 admin try to delete user1s friend group', async function () {
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByAdminRoot
            data.values[e_part.RECORD_ID] = friendGroupId1CryptedByAdminRoot
            // data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.deleteAPI_compareCommonRc_async({APIUrl: finalUrl,sess: adminRootSess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('3.2 user2 try to delete user1s friend group', async function () {
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByAdminRoot
            data.values[e_part.RECORD_ID] = friendGroupId1CryptedByUser2
            // data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = controllerError.delete.notUserGroupOwnerCantDelete.rc
            await misc_helper.deleteAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user2Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
        })
        it('3.3 user1 try to delete default friend group', async function () {
            // await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.public_group,id:publicGroupId1,updateFieldsValue:{"$push":{[e_field.PUBLIC_GROUP.MEMBERS_ID]:testData.unExistObjectId}}})
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID] = impeachId1CryptedByAdminRoot
            data.values[e_part.RECORD_ID] = defaultGroup1CryptedByUser1
            // data.values[e_part.RECORD_INFO] = normalRecord
            expectedErrorRc = controllerError.delete.cantDeleteDefaultGroup.rc
            await misc_helper.deleteAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})

            // await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.public_group,id:publicGroupId1,updateFieldsValue:{"$pull":{[e_field.PUBLIC_GROUP.MEMBERS_ID]:testData.unExistObjectId}}})
        })
        it('3.4 user1 try to delete friend group with member id exceed 1', async function () {
            //添加一个成语
            await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.public_group,id:friendGroupId1,updateFieldsValue:{"$push":{[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:testData.unExistObjectId}}})

            // data.values[e_part.RECORD_ID] = friendGroupId1CryptedByUser1
            //
            // expectedErrorRc = controllerError.delete.cantDeleteGroupContainFriend.rc
            // await misc_helper.deleteAPI_compareCommonRc_async({APIUrl: finalUrl,sess: user1Sess,data: data,expectedErrorRc: expectedErrorRc,app: app})
            //
            // await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.public_group,id:friendGroupId1,updateFieldsValue:{"$pullAll":{[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:testData.unExistObjectId}}})
        })
    })

    /****************************************/
    /*              move friend              /
    /****************************************/
    describe('move friend',async  function() {
        let user1DefaultGroupId,user1DefaultGroupIdCryptedByUser1,user1DefaultGroupIdCryptedByUser3,user1GroupId1,user1GroupId1CryptedByUser1
        let user3DefaultGroupId,user3DefaultGroupIdCryptedByUser3,user3DefaultGroupIdCryptedByUser1
        let unKnownGroupIdCryptedByUser1
        before('prepare', async function () {
            data.values = {}
            url = 'move_friend'
            finalUrl = baseUrl + url
            /**     user1 add user3 to be friend        **/
            let addFriendData={
                'values':{
                    [e_part.SINGLE_FIELD]:{
                        [e_field.ADD_FRIEND_REQUEST.RECEIVER]:user3IdCryptedByUser1
                    }
                }

            }
            // data.values[e_part.RECORD_INFO]=addFriendData
            await addFriendAPI.createAddFriend_returnRecord_async({data:addFriendData,sess:user1Sess,app:app})
            /**     unknown group id        **/
            unKnownGroupIdCryptedByUser1=await commonAPI.cryptObjectId_async({objectId:testData.unExistObjectId,sess:user1Sess})
            /**     user1 default group id      **/
            let condition={
                [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:user1Id,
                [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:userGroupFriend_Configuration.defaultGroupName.enumFormat.MyFriend,
            }
            // ap.wrn('condition',condition)
            tmpResult=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user_friend_group,condition:condition})

            user1DefaultGroupId=tmpResult[0]['_id']
            user1DefaultGroupIdCryptedByUser1=await commonAPI.cryptObjectId_async({objectId:user1DefaultGroupId,sess:user1Sess})
            user1DefaultGroupIdCryptedByUser3=await commonAPI.cryptObjectId_async({objectId:user1DefaultGroupId,sess:user3Sess})
            /**     user1 create new group     **/
            let friendGroupData={
                'values':{
                    [e_part.RECORD_INFO]:{
                        [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:'new'
                    }
                }

            }
            tmpResult=await friendGroupAPI.createUserFriendGroup_returnRecord_async({data:friendGroupData,sess:user1Sess,app:app})
            // ap.wrn('tmpResult',tmpResult)
            user1GroupId1CryptedByUser1=tmpResult['id']
            user1GroupId1=await commonAPI.decryptObjectId_async({objectId:user1GroupId1CryptedByUser1,sess:user1Sess})

            /**     user3DefaultGroupId     **/
            condition={
                [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:user3Id,
                [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:userGroupFriend_Configuration.defaultGroupName.enumFormat.MyFriend,
            }
            tmpResult=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user_friend_group,condition:condition})
            user3DefaultGroupId=tmpResult[0]['_id']
            user3DefaultGroupIdCryptedByUser1=await commonAPI.cryptObjectId_async({objectId:user3DefaultGroupId,sess:user1Sess})
            user3DefaultGroupIdCryptedByUser3=await commonAPI.cryptObjectId_async({objectId:user3DefaultGroupId,sess:user3Sess})
        })
        /*                  edit sub field check                */
        //此错误在checkEditSubFieldEleArray_async检测到
        it('4.1 duplicate ele in ele array', async function() {
            data.values={}
            // data.values[e_part.RECORD_INFO]=normalRecord
            // data.values[e_part.RECORD_ID]=defaultGroupId1
            data.values[e_part.EDIT_SUB_FIELD]={
                [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:{
                    [e_subField.FROM]:user1GroupId1CryptedByUser1,
                    [e_subField.TO]:user1DefaultGroupIdCryptedByUser1,
                    [e_subField.ELE_ARRAY]:[user3IdCryptedByUser1,user3IdCryptedByUser1],
                }
            }
            // data.values[e_part.METHOD]=e_method.UPDATE
            expectedErrorRc=controllerHelperError.eleArrayContainDuplicateEle.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('4.2 to record not exist', async function() {
            data.values={}
            // data.values[e_part.RECORD_INFO]=normalRecord
            // data.values[e_part.RECORD_ID]=defaultGroupId1
            data.values[e_part.EDIT_SUB_FIELD]={
                [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:{
                    [e_subField.FROM]:user1GroupId1CryptedByUser1,
                    [e_subField.TO]:unKnownGroupIdCryptedByUser1,
                    [e_subField.ELE_ARRAY]:[user3IdCryptedByUser1],
                }
            }
            // data.values[e_part.METHOD]=e_method.UPDATE
            expectedErrorRc=controllerError.moveFriend.fromToRecordIdNotExists.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('4.3 to record not belong to user1', async function() {
            data.values={}
            // data.values[e_part.RECORD_INFO]=normalRecord
            // data.values[e_part.RECORD_ID]=defaultGroupId1
            data.values[e_part.EDIT_SUB_FIELD]={
                [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:{
                    [e_subField.FROM]:user1DefaultGroupIdCryptedByUser1,
                    [e_subField.TO]:user3DefaultGroupIdCryptedByUser1,
                    [e_subField.ELE_ARRAY]:[user3IdCryptedByUser1],
                }
            }
            // data.values[e_part.METHOD]=e_method.UPDATE
            expectedErrorRc=controllerError.moveFriend.notOwnFromToRecordId.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        /*it('user1 try to move user3 to unknown groupId)', async function() {
            data.values={}
            // data.values[e_part.RECORD_INFO]=normalRecord
            // data.values[e_part.RECORD_ID]=defaultGroupId1
            data.values[e_part.EDIT_SUB_FIELD]={
                [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:{
                    [e_subField.FROM]:user1DefaultGroupIdCryptedByUser1,
                    [e_subField.TO]:unKnownGroupIdCryptedByUser1,
                    [e_subField.ELE_ARRAY]:[user3Id],
                }
            }
            data.values[e_part.METHOD]=e_method.UPDATE
            expectedErrorRc=helperError.toIdNotExist.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });*/
/*        it('user1 try to move user3 from normal group to default group, while this group reach max num(manual test，maxUserPerDefaultGroup/maxUserPerGroup =1)', async function() {
            data.values={}
            // data.values[e_part.RECORD_INFO]=normalRecord
            data.values[e_part.RECORD_ID]=defaultGroupId1
            data.values[e_part.EDIT_SUB_FIELD]={
                [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:{
                    [e_subField.FROM]:groupId3,
                    [e_subField.TO]:defaultGroupId1,
                    [e_subField.ELE_ARRAY]:[user3Id],
                }
            }
            data.values[e_part.METHOD]=e_method.UPDATE
            expectedErrorRc=helperError.toRecordNotEnoughRoom.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });*/
        it('4.4 user1 try to move not exist userId)', async function() {
            data.values={}
            // data.values[e_part.RECORD_INFO]=normalRecord
            // data.values[e_part.RECORD_ID]=defaultGroupId1
            data.values[e_part.EDIT_SUB_FIELD]={
                [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:{
                    [e_subField.FROM]:user1DefaultGroupIdCryptedByUser1,
                    [e_subField.TO]:user1GroupId1CryptedByUser1,
                    [e_subField.ELE_ARRAY]:[unKnownGroupIdCryptedByUser1],
                }
            }
            // data.values[e_part.METHOD]=e_method.UPDATE
            expectedErrorRc=controllerHelperError.eleArrayRecordIdNotExists.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });

        /*//checkEditSubFieldFromTo_async
        it('user1 try to move user3 from unknown groupId', async function() {
            let fromToError={
                fromToRecordIdNotExists:controllerError.fromToRecordIdNotExists,
                notOwnFromToRecordId:controllerError.notOwnFromToRecordId,
            }
            data.values={}
            // data.values[e_part.RECORD_INFO]=normalRecord
            data.values[e_part.RECORD_ID]=defaultGroupId1
            data.values[e_part.EDIT_SUB_FIELD]={
                [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:{
                    [e_subField.FROM]:testData.unExistObjectId,
                    [e_subField.TO]:defaultGroupId2,
                    [e_subField.ELE_ARRAY]:[user3Id],
                }
            }
            data.values[e_part.METHOD]=e_method.UPDATE
            expectedErrorRc=fromToError.fromToRecordIdNotExists.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });*/
        /*it('user2 try to move user3 from group3 which own by user1', async function() {
            let fromToError={
                fromToRecordIdNotExists:controllerError.fromToRecordIdNotExists,
                notOwnFromToRecordId:controllerError.notOwnFromToRecordId,
            }
            data.values={}
            // data.values[e_part.RECORD_INFO]=normalRecord
            data.values[e_part.RECORD_ID]=defaultGroupId1OfUser1
            data.values[e_part.EDIT_SUB_FIELD]={
                [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:{
                    [e_subField.FROM]:groupId3,
                    [e_subField.TO]:defaultGroupId2,
                    [e_subField.ELE_ARRAY]:[user3Id],
                }
            }
            data.values[e_part.METHOD]=e_method.UPDATE
            expectedErrorRc=fromToError.notOwnFromToRecordId.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });*/



        it('4.5 user1 try to update with same from/to', async function() {
            data.values={}
            // data.values[e_part.RECORD_INFO]=normalRecord
            // data.values[e_part.RECORD_ID]=groupId3
            // data.values[e_part.RECORD_INFO]={
            //     [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:'新的分组'
            //
            // }
            data.values[e_part.EDIT_SUB_FIELD]={
                [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:{
                    [e_subField.FROM]:user1DefaultGroupIdCryptedByUser1,
                    [e_subField.TO]:user1DefaultGroupIdCryptedByUser1,
                    [e_subField.ELE_ARRAY]:[user3IdCryptedByUser1],
                }
            }
            // data.values[e_part.METHOD]=e_method.UPDATE
            expectedErrorRc=0
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });


    })



})

