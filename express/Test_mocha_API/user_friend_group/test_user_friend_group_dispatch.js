/**
 * Created by Ada on 2017/7/11.
 */
'use strict'

/**************  特定相关常量  ****************/
const controllerError=require('../../server/controller/user_friend_group/user_friend_group_setting/user_friend_group_controllerError').controllerError
let baseUrl="/user_friend_group/",finalUrl,url


/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)

/******************    待测函数  **************/
const app=require('../../app')
const adminApp=require(`../../../express_admin/app`)

const server_common_file_require=require('../../server_common_file_require')
/****************  公共常量 ********************/
const e_serverRuleType=server_common_file_require.inputDataRuleType.ServerRuleType

const nodeEnum=server_common_file_require.nodeEnum
const e_part=nodeEnum.ValidatePart

const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum

const mongoEnum=server_common_file_require.mongoEnum
const e_addFriendStatus=mongoEnum.AddFriendStatus.DB
const e_impeachAllAction=mongoEnum.ImpeachAllAction.DB
const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB
const e_articleStatus=mongoEnum.ArticleStatus.DB
const e_publicGroupJoinInRule=mongoEnum.PublicGroupJoinInRule.DB

const e_coll=require('../../server/constant/genEnum/DB_Coll').Coll
const e_field=require('../../server/constant/genEnum/DB_field').Field


const e_parameterPart=server_common_file_require.testCaseEnum.ParameterPart
const e_skipPart=server_common_file_require.testCaseEnum.SkipPart



/******************    数据库函数  **************/

/****************  公共函数 ********************/
const db_operation_helper=server_common_file_require.db_operation_helper//require("../../../server_common/Test/db_operation_helper")
const testData=server_common_file_require.testData//require('../../../server_common/Test/testData')

const userAPI=server_common_file_require.user_API//require('../API_helper/API_helper')
const penalizeAPI=server_common_file_require.penalize_API
const commonAPI=server_common_file_require.common_API
const articleAPI=server_common_file_require.article_API
const impeachAPI=server_common_file_require.impeach_API
const friendGroupAPI=server_common_file_require.friend_group_API

const userComponentFunction=server_common_file_require.user_component_function
const adminUserComponentFunction=server_common_file_require.admin_user_component_function
const misc_helper=server_common_file_require.misc_helper
const crypt=server_common_file_require.crypt

const generateTestData=server_common_file_require.generateTestData

const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule


/****************  公共错误 ********************/
const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
// const controllerCheckerError=server_common_file_require.helperError.checker
const controllerCheckerError=server_common_file_require.helperError.checker
const systemError=server_common_file_require.assistError.systemError
// const objectDeepCopy=server_common_file_require.misc.objectDeepCopy



// const controllerError=require('../../server/controller/penalize/penalize_setting/penalize_controllerError').controllerError


let recordId1,recordId2,recordId3
let expectedErrorRc

let user1IdCryptedByUser1,user1IdCryptedByUser2,user1IdCryptedByUser3,
    user2IdCryptedByUser1,user2IdCryptedByUser2,user2IdCryptedByUser3,
    user3IdCryptedByUser1,user3IdCryptedByUser2,user3IdCryptedByUser3,
    user3IdCryptedByAdminRoot,adminRootIdCryptedByUser1,
    user1Sess,user2Sess,user3Sess,adminRootSess,
    user1Id,user2Id,user3Id,adminRootId
let unExistObjectCryptedByUser1
let friendGroupId1,friendGroupId1CryptedByUser1
let data={values:{}}

let normalRecord={
    // [e_field.IMPEACH_COMMENT.]:'new impeach',
    [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:'random group name',
    // [e_field.PUBLIC_GROUP.JOIN_IN_RULE]:e_publicGroupJoinInRule.PERMIT_ALLOW,
}

describe('user friend group dispatch:',async  function() {
    before('prepare', async function () {
        let tmpResult = await generateTestData.getUserCryptedUserId_async({app: app, adminApp: adminApp})

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
        friendGroupId1CryptedByUser1=tmpResult['_id']
        /**     admin create penalize for user3     **/
            //create penalize for user3
        let adminRootSalt = await commonAPI.getTempSalt_async({sess: adminRootSess})
        // ap.inf('root user salt',adminRootSalt)
        let cryptedUser3Id = crypt.encryptSingleValue({fieldValue: user3Id, salt: adminRootSalt}).msg
        // ap.inf('cryptedUser3Id',cryptedUser3Id)
        let penalizeInfoForUser3 = {
            penalizeType: e_penalizeType.NO_USER_FRIEND_GROUP,
            penalizeSubType: e_penalizeSubType.ALL,
            // penalizedError:undefined, //错误根据具体method定义
            [e_field.ADMIN_PENALIZE.DURATION]: 0,
            [e_field.ADMIN_PENALIZE.REASON]: 'test reason, no indication',
        }
        await penalizeAPI.createPenalize_returnPenalizeId_async({
            adminUserSess: adminRootSess,
            penalizeInfo: penalizeInfoForUser3,
            penalizedUserId: cryptedUser3Id,
            adminApp: adminApp
        })
        ap.inf('****************************************************************************')
        ap.inf('****************************************************************************')

    })

    /***************    create  impeach  comment ***************/
    describe('create user friend group:',async  function() {
        let sess
        before('prepare', async function () {
            url=''
            finalUrl=baseUrl+url
            sess=await userAPI.getFirstSession({app})
        })
        it('1.0 unmatch url', async function() {
            // ap.inf('sess',sess)
            expectedErrorRc=systemError.systemError.noMatchRESTAPI.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:baseUrl+'test',sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('1.1 user not login', async function() {
            // ap.inf('sess',sess)
            expectedErrorRc=controllerError.dispatch.post.notLoginCantCreateUserFriendGroup.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('1.2 user in penalize cant create public group', async function() {
            expectedErrorRc=controllerError.dispatch.post.userInPenalizeCantCreateUserFriendGroup.rc
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('1.3 inputValue recordInfo:  field friendsInGroup cant be input by create', async function() {
            expectedErrorRc=controllerCheckerError.ifObjectIdCrypted.fieldNotMatchApplyRange.rc
            data={values:{[e_part.RECORD_INFO]:{[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:unExistObjectCryptedByUser1}}}
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        /**     create的时候，没有objectId字段      **/
        /*it('1.4 inputValue recordInfo:  fieldValue to be decrypt is string, but regex check failed', async function() {
            expectedErrorRc=controllerCheckerError.ifObjectIdCrypted.recordInfoContainInvalidObjectId.rc
            data={values:{[e_part.RECORD_INFO]:{[e_field.IMPEACH_COMMENT.IMPEACH_ID]:'1234'}}}
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('1.5 inputValue recordInfo:  fieldValue after decrypt is string, but invalid objecId', async function() {
            normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]='3410cae041c38fcae905d65501cf7f776ea6b127850b0955269481f6a4db1b22'
            expectedErrorRc=browserInputRule.impeach_comment.impeachId.format.error.rc
            data={values:{[e_part.RECORD_INFO]:normalRecord}}
            await misc_helper.postDataToAPI_compareFieldRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.IMPEACH_COMMENT.IMPEACH_ID,app:app})
        });*/

        /***************    update user friend group ***************/
        describe('update user friend group',async  function() {
            let sess
            before('prepare', async function () {
                url=''
                finalUrl=baseUrl+url
                sess=await userAPI.getFirstSession({app})
                // normalRecord[e_field.IMPEACH.IMPEACHED_ARTICLE_ID]=adminRootIdCryptedByUser1
            })
            it('2.1 user not login', async function() {
                // ap.inf('sess',sess)
                expectedErrorRc=controllerError.dispatch.put.notLoginCantUpdateUserFriendGroup.rc
                await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            });
            it('2.2 user in penalize cant update user friend group', async function() {
                expectedErrorRc=controllerError.dispatch.put.userInPenalizeCantUpdateUserFriendGroup.rc
                await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            });
            it('2.3 inputValue recordInfo: , fieldValue to be decrypt not string', async function() {
                expectedErrorRc=validateError.validateFormat.inputValuePartRecordIdCryptedValueFormatWrong.rc
                data={values:{[e_part.RECORD_ID]:1234,[e_part.RECORD_INFO]:normalRecord}}
                await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            });
            it('2.4 inputValue recordInfo:  fieldValue to be decrypt is string, but regex check failed', async function() {
                expectedErrorRc=validateError.validateFormat.inputValuePartRecordIdCryptedValueFormatWrong.rc
                data={values:{[e_part.RECORD_ID]:'1234',[e_part.RECORD_INFO]:normalRecord}}
                await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            });
            it('2.5 inputValue recordInfo:  fieldValue after decrypt is string, but invalid objectId', async function() {
                // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeachId1CryptedByUser1
                expectedErrorRc=validateError.validateFormat.inputValuePartRecordIdDecryptedValueFormatWrong.rc
                data={values:{[e_part.RECORD_ID]:'3410cae041c38fcae905d65501cf7f776ea6b127850b0955269481f6a4db1b22',[e_part.RECORD_INFO]:normalRecord}}
                await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.IMPEACH_COMMENT.IMPEACH_ID,app:app})
            });

        })
        /***************    move friend in different user friend group ***************/
        describe('move friend',async  function() {
            let sess,editSubFieldValue
            before('prepare', async function () {
                url='move_friend'
                finalUrl=baseUrl+url
                sess=await userAPI.getFirstSession({app})
                editSubFieldValue={
                    [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:{}
                }
                // normalRecord[e_field.IMPEACH.IMPEACHED_ARTICLE_ID]=adminRootIdCryptedByUser1
            })
            it('3.1 user not login', async function() {
                // ap.inf('sess',sess)
                expectedErrorRc=controllerError.dispatch.put.notLoginCantMoveFriend.rc
                await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            });
            it('3.2 user in penalize cant update user friend group', async function() {
                expectedErrorRc=controllerError.dispatch.put.userInPenalizeCantMoveFriend.rc
                await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            })

            it('3.3 inputValue editSubValue: from value to be decrypt not string', async function() {
                expectedErrorRc=controllerCheckerError.ifObjectIdCrypted.editSubFromIsInvalidEncryptedObjectId.rc
                editSubFieldValue[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]={'from':1234,'eleArray':['3410cae041c38fcae905d65501cf7f776ea6b127850b0955269481f6a4db1b22']}
                data={values:{[e_part.EDIT_SUB_FIELD]:editSubFieldValue}}
                await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            });
            it('3.4 inputValue editSubValue:  from value to be decrypt is string, but regex check failed', async function() {
                editSubFieldValue[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]={'from':'1234','eleArray':['3410cae041c38fcae905d65501cf7f776ea6b127850b0955269481f6a4db1b22']}
                expectedErrorRc=controllerCheckerError.ifObjectIdCrypted.editSubFromIsInvalidEncryptedObjectId.rc
                data={values:{[e_part.EDIT_SUB_FIELD]:editSubFieldValue}}
                await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            });
            it('3.5 inputValue editSubValue:  from value  after decrypt is string, but invalid objectId', async function() {
                editSubFieldValue[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]={'from':'3410cae041c38fcae905d65501cf7f776ea6b127850b0955269481f6a4db1b22','eleArray':['3410cae041c38fcae905d65501cf7f776ea6b127850b0955269481f6a4db1b22']}
                expectedErrorRc=validateError.validateValue.fromMustBeObjectId.rc
                data={values:{[e_part.EDIT_SUB_FIELD]:editSubFieldValue}}
                await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.IMPEACH_COMMENT.IMPEACH_ID,app:app})
            });

            it('3.6 inputValue editSubValue: to value to be decrypt not string', async function() {
                editSubFieldValue[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]={'to':1234,'eleArray':['3410cae041c38fcae905d65501cf7f776ea6b127850b0955269481f6a4db1b22']}
                expectedErrorRc=controllerCheckerError.ifObjectIdCrypted.editSubToIsInvalidEncryptedObjectId.rc
                data={values:{[e_part.EDIT_SUB_FIELD]:editSubFieldValue}}
                await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            });

            it('3.7 inputValue editSubValue: eleArray value to be decrypt not string', async function() {
                editSubFieldValue[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]={'from':'3410cae041c38fcae905d65501cf7f776ea6b127850b0955269481f6a4db1b22','eleArray':[1234]}
                expectedErrorRc=controllerCheckerError.ifObjectIdCrypted.editSubEleArrayIsInvalidEncryptedObjectId.rc
                data={values:{[e_part.EDIT_SUB_FIELD]:editSubFieldValue}}
                await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            });

/*            it('3.8 inputValue editSubValue: empty', async function() {
                editSubFieldValue[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]={}
                expectedErrorRc=controllerCheckerError.ifObjectIdCrypted.editSubEleArrayIsInvalidEncryptedObjectId.rc
                data={values:{[e_part.EDIT_SUB_FIELD]:editSubFieldValue}}
                await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            });*/
        })
    })
})