'use strict'


/**************  特定相关常量  ****************/
const controllerError=require('../../server/controller/public_group/public_group_setting/public_group_controllerError').controllerError
let baseUrl="/public_group/",finalUrl,url


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
const publicGroupAPI=server_common_file_require.publicGroup_API

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
const systemError=server_common_file_require.systemError
// const objectDeepCopy=server_common_file_require.misc.objectDeepCopy



// const controllerError=require('../../server/controller/penalize/penalize_setting/penalize_controllerError').controllerError


let recordId1,recordId2,recordId3,expectedErrorRc

let user1IdCryptedByUser1,user1IdCryptedByUser2,user1IdCryptedByUser3,
    user2IdCryptedByUser1,user2IdCryptedByUser2,user2IdCryptedByUser3,
    user3IdCryptedByUser1,user3IdCryptedByUser2,user3IdCryptedByUser3,
    user3IdCryptedByAdminRoot,adminRootIdCryptedByUser1,
    user1Sess,user2Sess,user3Sess,adminRootSess,
    user1Id,user2Id,user3Id,adminRootId

let recordId2CryptedByAdminRoot,recordId1CryptedByUser2,recordId1CryptedByUser3,recordId2CryptedByUser2
let articleId1,articleId1CryptedByUser1,article1CryptedByAdminRoot,article1CryptedByUser2
let articleId2,articleId2CryptedByUser1,articleId2CryptedByUser2
let articleId3,articleId3CryptedByUser2
let publicGroupId1,publicGroupId1CryptedByUser1,publicGroupId1CryptedByUser2,publicGroupId1CryptedByAdminRoot
let impeachId1,impeachId1CryptedByUser1,impeachId1CryptedByUser2,impeachId1CryptedByAdminRoot
let data={values:{}}

let normalRecord={
    // [e_field.IMPEACH_COMMENT.]:'new impeach',
    [e_field.PUBLIC_GROUP.ADMINS_ID]:{},
    // [e_field.PUBLIC_GROUP.JOIN_IN_RULE]:e_publicGroupJoinInRule.ANYONE_ALLOW,
}
let publicGroupInfo1={}
publicGroupInfo1[e_field.PUBLIC_GROUP.NAME]='group name for user1'
publicGroupInfo1[e_field.PUBLIC_GROUP.JOIN_IN_RULE]=e_publicGroupJoinInRule.PERMIT_ALLOW
    ,
describe('user1 register unique check:',async  function() {

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
        /**     user1 create public group with rule permit      **/
        data.values={}
        data.values[e_part.RECORD_INFO]=publicGroupInfo1
        publicGroupId1CryptedByUser1=await publicGroupAPI.createPublicGroup_returnId_async({sess:user1Sess,data:data,app:app})
        publicGroupId1=await commonAPI.decryptObjectId_async({objectId:publicGroupId1CryptedByUser1,sess:user1Sess})
        publicGroupId1CryptedByUser2=await commonAPI.cryptObjectId_async({objectId:publicGroupId1,sess:user2Sess})
        publicGroupId1CryptedByAdminRoot=await commonAPI.cryptObjectId_async({objectId:publicGroupId1,sess:adminRootSess})

        /**     admin create penalize for user3     **/
            //create penalize for user3
        let adminRootSalt = await commonAPI.getTempSalt_async({sess: adminRootSess})
        // ap.inf('root user salt',adminRootSalt)
        let cryptedUser3Id = crypt.encryptSingleValue({fieldValue: user3Id, salt: adminRootSalt}).msg
        // ap.inf('cryptedUser3Id',cryptedUser3Id)
        let penalizeInfoForUser3 = {
            penalizeType: e_penalizeType.NO_PUBLIC_GROUP,
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
    })

    /***************    update admin member ***************/
    describe('add/remove admin member',async  function() {
        let sess
        before('prepare', async function () {
            url='manageAdminMember'
            finalUrl=baseUrl+url
            sess=await userAPI.getFirstSession({app})

            data.values={}
            data.values[e_part.RECORD_ID]=publicGroupId1CryptedByUser1
            data.values[e_part.MANIPULATE_ARRAY]={}
            // normalRecord[e_field.IMPEACH.IMPEACHED_ARTICLE_ID]=adminRootIdCryptedByUser1
        })
        it('1.1 user not login', async function() {
            // ap.inf('sess',sess)
            expectedErrorRc=controllerError.dispatch.put.notLoginCantManageAdminMember.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('1.2 user in penalize cant update public group', async function() {
            expectedErrorRc=controllerError.dispatch.put.notLoginCantManageAdminMember.rc
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('1.3 inputValue MANIPULATE_ARRAY: , fieldValue to be decrypt not string', async function() {
            normalRecord[e_field.PUBLIC_GROUP.ADMINS_ID]={'add':[1234]}
            expectedErrorRc=controllerCheckerError.ifObjectIdCrypted.manipulateArraySubPartAddContainInvalidObjectId.rc
            data={values:{[e_part.RECORD_ID]:publicGroupId1CryptedByUser1,[e_part.MANIPULATE_ARRAY]:normalRecord}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('1.4 inputValue MANIPULATE_ARRAY:  fieldValue to be decrypt is string, but regex check failed', async function() {
            normalRecord[e_field.PUBLIC_GROUP.ADMINS_ID]={'add':['1234']}
            expectedErrorRc=controllerCheckerError.ifObjectIdCrypted.manipulateArraySubPartAddContainInvalidObjectId.rc
            data={values:{[e_part.RECORD_ID]:publicGroupId1CryptedByUser1,[e_part.MANIPULATE_ARRAY]:normalRecord}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('1.5 inputValue MANIPULATE_ARRAY:  fieldValue after decrypt is string, but invalid objecId', async function() {
            normalRecord[e_field.PUBLIC_GROUP.ADMINS_ID]={'add':['3410cae041c38fcae905d65501cf7f776ea6b127850b0955269481f6a4db1b22']}
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeachId1CryptedByUser1
            expectedErrorRc=browserInputRule.public_group.adminsId.format.error.rc
            data={values:{[e_part.RECORD_ID]:publicGroupId1CryptedByUser1,[e_part.MANIPULATE_ARRAY]:normalRecord}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        });
        /**     需要手工更改ARRAY_MAX_LENGTH的定义      **/
        it('1.6 inputValue MANIPULATE_ARRAY:  fieldValue number exceed MAX_ARRAY', async function() {
            normalRecord[e_field.PUBLIC_GROUP.ADMINS_ID]={'add':['3410cae041c38fcae905d65501cf7f776ea6b127850b0955269481f6a4db1b22','3410cae041c38fcae905d65501cf7f776ea6b127850b0955269481f6a4db1b22']}
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeachId1CryptedByUser1
            expectedErrorRc=browserInputRule.public_group.adminsId.arrayMaxLength.error.rc
            data={values:{[e_part.RECORD_ID]:publicGroupId1CryptedByUser1,[e_part.MANIPULATE_ARRAY]:normalRecord}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        });
        /**         ifObjectIdInPartCrypted_async  for    MANIPULATE_ARRAY   **/
        it('2.1 inputValue MANIPULATE_ARRAY:  encrypted value not objectId ', async function() {
            normalRecord={}
            let tmp=await commonAPI.cryptObjectId_async({objectId:1234,sess:user1Sess})
            normalRecord[e_field.PUBLIC_GROUP.ADMINS_ID]={'add':[tmp]}
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeachId1CryptedByUser1
            expectedErrorRc=controllerCheckerError.ifObjectIdCrypted.manipulateArraySubPartAddContainInvalidObjectId.rc
            data={values:{[e_part.RECORD_ID]:publicGroupId1CryptedByUser1,[e_part.MANIPULATE_ARRAY]:normalRecord}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        });
        it('2.1 inputValue MANIPULATE_ARRAY:  encrypted value not objectId ', async function() {
            normalRecord={}
            let tmp=await commonAPI.cryptObjectId_async({objectId:1234,sess:user1Sess})
            normalRecord[e_field.PUBLIC_GROUP.ADMINS_ID]={'remove':[tmp]}
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeachId1CryptedByUser1
            expectedErrorRc=controllerCheckerError.ifObjectIdCrypted.manipulateArraySubPartAddContainInvalidObjectId.rc
            data={values:{[e_part.RECORD_ID]:publicGroupId1CryptedByUser1,[e_part.MANIPULATE_ARRAY]:normalRecord}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        });
        /**    MANIPULATE_ARRAY format check **/
        it('4.1 inputValue MANIPULATE_ARRAY:  value not object', async function() {
            // normalRecord[e_field.PUBLIC_GROUP.ADMINS_ID]=[]
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeachId1CryptedByUser1
            expectedErrorRc=validateError.validateFormat.inputValuePartManipulateArrayValueFormatWrong.rc
            data={values:{[e_part.RECORD_ID]:publicGroupId1CryptedByUser1,[e_part.MANIPULATE_ARRAY]:[]}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        });
        it('4.2 inputValue MANIPULATE_ARRAY:  value not object', async function() {
            // normalRecord[e_field.PUBLIC_GROUP.ADMINS_ID]=[]
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeachId1CryptedByUser1
            expectedErrorRc=validateError.validateFormat.inputValuePartManipulateArrayValueFormatWrong.rc
            data={values:{[e_part.RECORD_ID]:publicGroupId1CryptedByUser1,[e_part.MANIPULATE_ARRAY]:1234}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        });
        it('4.3 inputValue MANIPULATE_ARRAY:  value not object', async function() {
            // normalRecord[e_field.PUBLIC_GROUP.ADMINS_ID]=[]
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeachId1CryptedByUser1
            expectedErrorRc=validateError.validateFormat.inputValuePartManipulateArrayValueFormatWrong.rc
            data={values:{[e_part.RECORD_ID]:publicGroupId1CryptedByUser1,[e_part.MANIPULATE_ARRAY]:null}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        });

        it('4.4 inputValue MANIPULATE_ARRAY:  no related rule', async function() {
            normalRecord={}
            normalRecord['field']={}
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeachId1CryptedByUser1
            expectedErrorRc=validateError.validateFormat.manipulateArray.manipulateArrayNoRelatedRule.rc
            data={values:{[e_part.RECORD_ID]:publicGroupId1CryptedByUser1,[e_part.MANIPULATE_ARRAY]:normalRecord}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        });

        it('4.5 inputValue MANIPULATE_ARRAY:  field value not object', async function() {
            normalRecord={}
            normalRecord[e_field.PUBLIC_GROUP.ADMINS_ID]=[]
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeachId1CryptedByUser1
            expectedErrorRc=validateError.validateFormat.manipulateArray.manipulateArrayFieldValueMustBeObject.rc
            data={values:{[e_part.RECORD_ID]:publicGroupId1CryptedByUser1,[e_part.MANIPULATE_ARRAY]:normalRecord}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        });
        it('4.6 inputValue MANIPULATE_ARRAY:  field value not object', async function() {
            normalRecord={}
            normalRecord[e_field.PUBLIC_GROUP.ADMINS_ID]=1234
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeachId1CryptedByUser1
            expectedErrorRc=validateError.validateFormat.manipulateArray.manipulateArrayFieldValueMustBeObject.rc
            data={values:{[e_part.RECORD_ID]:publicGroupId1CryptedByUser1,[e_part.MANIPULATE_ARRAY]:normalRecord}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        });
        it('4.7 inputValue MANIPULATE_ARRAY:  field value not object', async function() {
            normalRecord={}
            normalRecord[e_field.PUBLIC_GROUP.ADMINS_ID]=null
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeachId1CryptedByUser1
            expectedErrorRc=validateError.validateFormat.manipulateArray.manipulateArrayFieldValueMustBeObject.rc
            data={values:{[e_part.RECORD_ID]:publicGroupId1CryptedByUser1,[e_part.MANIPULATE_ARRAY]:normalRecord}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        });

        it('4.8 inputValue MANIPULATE_ARRAY:  field value key number  not object', async function() {
            normalRecord={}
            normalRecord[e_field.PUBLIC_GROUP.ADMINS_ID]={}
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeachId1CryptedByUser1
            expectedErrorRc=validateError.validateFormat.manipulateArray.manipulateArrayFieldKeyNumberWrong.rc
            data={values:{[e_part.RECORD_ID]:publicGroupId1CryptedByUser1,[e_part.MANIPULATE_ARRAY]:normalRecord}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        });
        it('4.9 inputValue MANIPULATE_ARRAY:  field value key number  not object', async function() {
            normalRecord={}
            normalRecord[e_field.PUBLIC_GROUP.ADMINS_ID]={'ke':[],'k2':[],'k3':[]}
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeachId1CryptedByUser1
            expectedErrorRc=validateError.validateFormat.manipulateArray.manipulateArrayFieldKeyNumberWrong.rc
            data={values:{[e_part.RECORD_ID]:publicGroupId1CryptedByUser1,[e_part.MANIPULATE_ARRAY]:normalRecord}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        });

        it('4.10 inputValue MANIPULATE_ARRAY:  field value key name not defined', async function() {
            normalRecord={}
            normalRecord[e_field.PUBLIC_GROUP.ADMINS_ID]={'ke':[],'k2':[]}
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeachId1CryptedByUser1
            expectedErrorRc=validateError.validateFormat.manipulateArray.manipulateArrayFieldKeyNameWrong.rc
            data={values:{[e_part.RECORD_ID]:publicGroupId1CryptedByUser1,[e_part.MANIPULATE_ARRAY]:normalRecord}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        });

        /**    MANIPULATE_ARRAY value check **/
        it('5.1 inputValue MANIPULATE_ARRAY:  field value related rule type not array', async function() {
            normalRecord={}
            normalRecord[e_field.PUBLIC_GROUP.NAME]={'add':{}}
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeachId1CryptedByUser1
            expectedErrorRc=validateError.validateValue.manipulateArray.fieldDataTypeNotArray.rc
            data={values:{[e_part.RECORD_ID]:publicGroupId1CryptedByUser1,[e_part.MANIPULATE_ARRAY]:normalRecord}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        });
        it('5.2 inputValue MANIPULATE_ARRAY:  field value key value not array', async function() {
            normalRecord={}
            normalRecord[e_field.PUBLIC_GROUP.ADMINS_ID]={'add':{}}
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeachId1CryptedByUser1
            expectedErrorRc=validateError.validateValue.manipulateArray.fieldKeyValueMustBeArray.rc
            data={values:{[e_part.RECORD_ID]:publicGroupId1CryptedByUser1,[e_part.MANIPULATE_ARRAY]:normalRecord}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        });
        it('5.3 inputValue MANIPULATE_ARRAY:  field value key value can not be empty array', async function() {
            normalRecord={}
            normalRecord[e_field.PUBLIC_GROUP.ADMINS_ID]={'add':[]}
            // normalRecord[e_field.IMPEACH_COMMENT.IMPEACH_ID]=impeachId1CryptedByUser1
            expectedErrorRc=validateError.validateValue.manipulateArray.fieldKeyValueCantEmpty.rc
            data={values:{[e_part.RECORD_ID]:publicGroupId1CryptedByUser1,[e_part.MANIPULATE_ARRAY]:normalRecord}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        });

    })

})