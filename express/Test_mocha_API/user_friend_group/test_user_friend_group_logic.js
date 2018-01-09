/**
 * Created by Ada on 2017/7/11.
 */
'use strict'
const ap=require('awesomeprint')

const request=require('supertest')
const app=require('../../app')
const adminApp=require('../../../express_admin/app')
const assert=require('assert')

// const ap=require(`awesomeprint`)

const server_common_file_require=require('../../server_common_file_require')
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field
//for fkValue check
const e_chineseFieldName=require('../../server/constant/genEnum/inputRule_field_chineseName').ChineseName

const iniSettingObject=require(`../../server/constant/genEnum/initSettingObject`).iniSettingObject

const e_adminUserType=server_common_file_require.mongoEnum.AdminUserType.DB
const e_adminPriorityType=server_common_file_require.mongoEnum.AdminPriorityType.DB
const e_penalizeType=server_common_file_require.mongoEnum.PenalizeType.DB
const e_penalizeSubType=server_common_file_require.mongoEnum.PenalizeSubType.DB
const e_impeachState=server_common_file_require.mongoEnum.ImpeachState.DB
const e_impeachUserAction=server_common_file_require.mongoEnum.ImpeachUserAction.DB
const e_addFriendStatus=server_common_file_require.mongoEnum.AddFriendStatus.DB


const e_subField=server_common_file_require.nodeEnum.SubField


const common_operation_model=server_common_file_require.common_operation_model
const e_dbModel=require('../../server/constant/genEnum/dbModel')

// const inputRule=require('../../server/constant/inputRule/inputRule').inputRule
const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule

const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
const controllerCheckerError=server_common_file_require.helperError.checker
const helperError=server_common_file_require.helperError.helper
// const common_operation_model=server_common_file_require.common_operation_model

const objectDeepCopy=server_common_file_require.misc.objectDeepCopy

const db_operation_helper= server_common_file_require.db_operation_helper
const testData=server_common_file_require.testData//require('../testData')
const API_helper=server_common_file_require.API_helper//require('../API_helper/API_helper')
const component_function=server_common_file_require.component_function
const misc_helper=server_common_file_require.misc_helper


/*                      configuration                                               */
const userGroupFriend_Configuration=server_common_file_require.globalConfiguration.userGroupFriend

const controllerError=require('../../server/controller/user_friend_group/user_friend_group_setting/user_friend_group_controllerError').controllerError

let  baseUrl="/user_friend_group/",finalUrl,url
let adminUser1Info,adminUser2Info,adminUser3Info,adminUser1Id,adminUser2Id,adminUser3Id,adminUser1Sess,adminUser2Sess,adminUser3Sess,adminUser1Data,adminUser2Data,adminUser3Data
let user1Info,user2Info,user3Info,user1Id,user2Id,user3Id,user1Sess,user2Sess,user3Sess,user1Data,user2Data,user3Data
let userData,tmpResult,copyNormalRecord
let adminRootSess,adminRootId,data={values:{}}

let recordId1,recordId2,recordId3,expectedErrorRc

let defaultGroupId1,defaultGroupId2,groupId3,defaultGroupId1OfUser1
let normalRecord={
    [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:'家人',
    // [e_field.USER_FRIEND_GROUP.]:e_impeachUserAction.SUBMIT,
    // [e_field.IMPEACH_ACTION.OWNER_ID]:undefined, //普通用户无需操作此字段
}

/*              create user friend group               */
describe('create user friend group', async function() {
    data={values:{method:e_method.CREATE}}
    before('reCreate user1/2/3 and admin', async function(){
        url=''
        finalUrl=baseUrl+url
        // parameter[`APIUrl`]=finalUrl
        let user1Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user1,app:app})
        user1Id=user1Info[`userId`]
        user1Sess=user1Info[`sess`]

        let user2Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user2,app:app})
        user2Id=user2Info[`userId`]
        user2Sess=user2Info[`sess`]

        let user3Info =await component_function.reCreateUser_returnSessUserId_async({userData:testData.user.user3,app:app})
        user3Id=user3Info[`userId`]
        user3Sess=user3Info[`sess`]

        adminRootSess=await API_helper.adminUserLogin_returnSess_async({userData:testData.admin_user.adminRoot,adminApp:adminApp})
        adminRootId=db_operation_helper.getAdminUserId_async({userName:testData.admin_user.adminRoot.name})

        /*              get all user1 group id              */
        tmpResult=await common_operation_model.find_returnRecords_async({
            dbModel:e_dbModel.user_friend_group,
            condition:{
                [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:userGroupFriend_Configuration.defaultGroupName.enumFormat.MyFriend,
                [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:user1Id,
            }
        })
        defaultGroupId1=tmpResult[0]['_id']
        tmpResult=await common_operation_model.find_returnRecords_async({
            dbModel:e_dbModel.user_friend_group,
            condition:{
                [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:userGroupFriend_Configuration.defaultGroupName.enumFormat.BlackList,
                [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:user1Id,
            }
        })
        defaultGroupId2=tmpResult[0]['_id']

        /*              get 1 user2 default group id              */
        tmpResult=await common_operation_model.find_returnRecords_async({
            dbModel:e_dbModel.user_friend_group,
            condition:{
                [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:userGroupFriend_Configuration.defaultGroupName.enumFormat.MyFriend,
                [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:user2Id,
            }
        })
        defaultGroupId1OfUser1=tmpResult[0]['_id']

        /*              user1 add user2/3 as friend,user2/3 accept, user3 move to normal group           */
        userData={
            [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:'新的分组'
        }
        tmpResult=await API_helper.createUserFriendGroup_returnRecord_async({userData:userData,sess:user1Sess,app:app})
        groupId3=tmpResult['_id']


        //user1 add user3=>user3 accept=>user1 move user3 to default group
        userData={[e_field.ADD_FRIEND.RECEIVER]:user3Id}
        tmpResult=await API_helper.createAddFriend_returnRecord_async({userData:userData,sess:user1Sess,app:app})
        recordId2=tmpResult['_id']
        userData={[e_field.ADD_FRIEND.STATUS]:e_addFriendStatus.ACCEPT}
        await API_helper.updateAddFriend_returnRecord_async({userData:userData,recordId:recordId2,sess:user3Sess,app:app})

        let userDataForEditSubField={
            [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:{
                [e_subField.FROM]:defaultGroupId1,
                [e_subField.TO]:groupId3,
                [e_subField.ELE_ARRAY]:[user3Id],
            }
        }
        await API_helper.updateUserFriendGroup_returnRecord_async({userDataForRecordInfo:undefined,recordId:defaultGroupId1,userDataForEditSubField:userDataForEditSubField,sess:user1Sess,app:app})

        //user1 add user2=>user2 accept
        userData={[e_field.ADD_FRIEND.RECEIVER]:user2Id}
        tmpResult=await API_helper.createAddFriend_returnRecord_async({userData:userData,sess:user1Sess,app:app})
        recordId1=tmpResult['_id']
        userData={[e_field.ADD_FRIEND.STATUS]:e_addFriendStatus.ACCEPT}
        await API_helper.updateAddFriend_returnRecord_async({userData:userData,recordId:recordId1,sess:user2Sess,app:app})



        



        // ap.print('defaultGroupId1',defaultGroupId1)
        // ap.print('defaultGroupId2',defaultGroupId2)
        console.log(`==============================================================`)
        console.log(`=================    before all done      ====================`)
        console.log(`==============================================================`)
    });
    /****************************************/
    /*              create                  */
    /****************************************/
    it('userType check, admin not allow for create', async function() {
        data.values={}
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.METHOD]=e_method.CREATE
        expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('group number limitation check(need modify global manually) ', async function() {
        data.values={}
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.METHOD]=e_method.CREATE

        expectedErrorRc=controllerError.reachMaxUserFriendGroupNum.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('group name check:XSS', async function() {
        data.values={}
        normalRecord={[e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:'<alert>a'}
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.METHOD]=e_method.CREATE

        expectedErrorRc=helperError.XSSCheckFailed('group name').rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('group name unique check', async function() {
        data.values={}
        normalRecord={[e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:userGroupFriend_Configuration.defaultGroupName.enumFormat.MyFriend}
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.METHOD]=e_method.CREATE

        expectedErrorRc=controllerError.groupNameAlreadyExistCantCreate.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        // normalRecord[e_field.IMPEACH_ACTION.ACTION]=e_impeachUserAction.SUBMIT
    });

    /****************************************/
    /*              update                  */
    /****************************************/
    it('userType check, admin not allow for update', async function() {
        data.values={}
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.RECORD_ID]=recordId1
        data.values[e_part.METHOD]=e_method.UPDATE
        expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });

    it('user2 try to update user1 group', async function() {
        data.values={}
        data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.RECORD_ID]=defaultGroupId1
        data.values[e_part.METHOD]=e_method.UPDATE
        expectedErrorRc=controllerError.notUserGroupOwnerCantUpdate.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('user1 try to update group which already be delete', async function() {
        await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.user_friend_group,id:defaultGroupId1,updateFieldsValue:{'dDate':1}})

        data.values={}
        // data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.EDIT_SUB_FIELD]={
            [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:{
                [e_subField.FROM]:defaultGroupId1,
                [e_subField.TO]:defaultGroupId2,
                [e_subField.ELE_ARRAY]:[user2Id],
            }
        }
        data.values[e_part.RECORD_ID]=defaultGroupId1
        data.values[e_part.METHOD]=e_method.UPDATE
        expectedErrorRc=controllerError.notUserGroupOwnerCantUpdate.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

        await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.user_friend_group,id:defaultGroupId1,updateFieldsValue:{'$unset':{'dDate':1}}})
    });

    it('user1 try to update default group name', async function() {
        data.values={}
        // data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.RECORD_ID]=defaultGroupId1
        data.values[e_part.RECORD_INFO]={
            [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:'不能更改default group的名字'
        }
        data.values[e_part.METHOD]=e_method.UPDATE
        expectedErrorRc=controllerError.notAllowUpdateDefaultRecord.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });

    /*                  edit sub field check                */
    //此错误在checkEditSubFieldEleArray_async检测到
    it('user1 try to move double user3', async function() {
        data.values={}
        // data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.RECORD_ID]=defaultGroupId1
        data.values[e_part.EDIT_SUB_FIELD]={
            [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:{
                [e_subField.FROM]:groupId3,
                [e_subField.TO]:defaultGroupId2,
                [e_subField.ELE_ARRAY]:[user3Id,user3Id],
            }
        }
        data.values[e_part.METHOD]=e_method.UPDATE
        expectedErrorRc=helperError.eleArrayContainDuplicateEle.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('user1 try to move user3 to unknown groupId)', async function() {
        data.values={}
        // data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.RECORD_ID]=defaultGroupId1
        data.values[e_part.EDIT_SUB_FIELD]={
            [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:{
                [e_subField.FROM]:groupId3,
                [e_subField.TO]:testData.unExistObjectId,
                [e_subField.ELE_ARRAY]:[user3Id],
            }
        }
        data.values[e_part.METHOD]=e_method.UPDATE
        expectedErrorRc=helperError.toIdNotExist.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('user1 try to move user3 from normal group to default group, while this group reach max num(manual test，maxUserPerDefaultGroup/maxUserPerGroup =1)', async function() {
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
    });
    it('user1 try to move not exist userId)', async function() {
        data.values={}
        // data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.RECORD_ID]=defaultGroupId1
        data.values[e_part.EDIT_SUB_FIELD]={
            [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:{
                [e_subField.FROM]:groupId3,
                [e_subField.TO]:defaultGroupId1,
                [e_subField.ELE_ARRAY]:[testData.unExistObjectId],
            }
        }
        data.values[e_part.METHOD]=e_method.UPDATE
        expectedErrorRc=helperError.eleArrayRecordIdNotExists.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });

    //checkEditSubFieldFromTo_async
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
    });
    it('user2 try to move user3 from group3 which own by user1', async function() {
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
    });



    it('user1 try to update with old values(not change)', async function() {
        data.values={}
        // data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.RECORD_ID]=groupId3
        data.values[e_part.RECORD_INFO]={
            [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:'新的分组'

        }
        data.values[e_part.EDIT_SUB_FIELD]={
            [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:{
                [e_subField.FROM]:groupId3,
                [e_subField.TO]:groupId3,
                [e_subField.ELE_ARRAY]:[user3Id],
            }
        }
        data.values[e_part.METHOD]=e_method.UPDATE
        expectedErrorRc=0
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });

    it('user1 try to update group name with XSS', async function() {
        data.values={}
        // data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.RECORD_ID]=groupId3
        data.values[e_part.RECORD_INFO]={
            [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:'<alert>a'

        }

        data.values[e_part.METHOD]=e_method.UPDATE
        expectedErrorRc=helperError.XSSCheckFailed('group name').rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });

    it('user1 try to update group name with default group name', async function() {
        data.values={}
        // data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.RECORD_ID]=groupId3
        data.values[e_part.RECORD_INFO]={
            [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:userGroupFriend_Configuration.defaultGroupName.enumFormat.MyFriend

        }

        data.values[e_part.METHOD]=e_method.UPDATE
        expectedErrorRc=controllerError.groupNameAlreadyExistCantUpdate.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });

    /****************************************/
    /*              delete                  */
    /****************************************/
    it('userType check, admin not allow for delete', async function() {
        data.values={}
        // data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.RECORD_ID]=groupId3
        data.values[e_part.METHOD]=e_method.DELETE
        expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('not owner cant delete', async function() {
        data.values={}
        // data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.RECORD_ID]=groupId3
        data.values[e_part.METHOD]=e_method.DELETE
        expectedErrorRc=controllerError.notUserGroupOwnerCantDelete.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('cant delete default group', async function() {
        data.values={}
        // data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.RECORD_ID]=defaultGroupId1
        data.values[e_part.METHOD]=e_method.DELETE
        expectedErrorRc=controllerError.cantDeleteDefaultGroup.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });

    it('cant delete group still contain friend', async function() {
        let userDataForEditSubField={
            [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:{
                [e_subField.FROM]:defaultGroupId1,
                [e_subField.TO]:groupId3,
                [e_subField.ELE_ARRAY]:[user3Id],
            }
        }
        await API_helper.updateUserFriendGroup_returnRecord_async({
            userDataForRecordInfo:undefined,
            recordId:defaultGroupId1,
            userDataForEditSubField:userDataForEditSubField,
            sess:user1Sess,
            app:app})
        data.values={}
        // data.values[e_part.RECORD_INFO]=normalRecord
        data.values[e_part.RECORD_ID]=groupId3
        data.values[e_part.METHOD]=e_method.DELETE
        expectedErrorRc=controllerError.cantDeleteGroupContainFriend.rc
        await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
})

