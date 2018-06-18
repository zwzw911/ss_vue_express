/**
 * Created by Ada on 2017/7/11.
 */
'use strict'

/**************  controller相关常量  ****************/
const controllerError=require('../../server/controller/add_friend/add_friend_setting/add_friend_controllerError').controllerError

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

const userComponentFunction=server_common_file_require.user_component_function
const adminUserComponentFunction=server_common_file_require.admin_user_component_function
const misc_helper=server_common_file_require.misc_helper
const crypt=server_common_file_require.crypt

const browserInputRule=require('../../server/constant/inputRule/browserInputRule').browserInputRule


/****************  公共错误 ********************/
const validateError=server_common_file_require.validateError//require('../../server/constant/error/validateError').validateError
const controllerHelperError=server_common_file_require.helperError.helper//require('../../server/constant/error/controller/helperError').helper
// const controllerCheckerError=server_common_file_require.helperError.checker
const controllerCheckerError=server_common_file_require.helperError.checker

// const objectDeepCopy=server_common_file_require.misc.objectDeepCopy



// const controllerError=require('../../server/controller/penalize/penalize_setting/penalize_controllerError').controllerError
/****************  变量 ********************/
let baseUrl="/add_friend/",finalUrl,url

//管理员登录信息
let adminUser1Info,adminUser2Info,adminUser3Info,adminUser1Id,adminUser2Id,adminUser3Id,adminUser1Sess,adminUser2Sess,adminUser3Sess,adminUser1Data,adminUser2Data,adminUser3Data
//用户登录信息
let user1Info,user2Info,user3Info,user1Id,user2Id,user3Id,user1Sess,user2Sess,user3Sess,user1Data,user2Data,user3Data
let userData,tmpResult,copyNormalRecord
let adminRootSess,adminRootId,data={values:{}}

let recordId1,recordId2,recordId3,expectedErrorRc
let user1IdCrypted,user1IdGetByUser2Crypted

let recordId //当有update/delete的时候，需要真实的recordid，来pass recordId的最后一个case（正确通过）
let normalRecord={
    // [e_field.ADD_FRIEND.ORIGINATOR]:undefined,
    [e_field.ADD_FRIEND.RECEIVER]:undefined,
}



describe('dispatch', function() {

    before('user1/2/3  login and create article and impeach', async function () {
        url = ''
        // parameter[`APIUrl`]=finalUrl
        finalUrl = baseUrl + url

        let penalizeInfoForUser3 = {
            penalizeType: e_penalizeType.NO_ADD_FRIEND,
            penalizeSubType: e_penalizeSubType.ALL,
            // penalizedError:undefined, //错误根据具体method定义
            [e_field.ADMIN_PENALIZE.DURATION]: 0,
            [e_field.ADMIN_PENALIZE.REASON]: 'test reason, no indication',
        }
        // ap.inf('test')
        // parameter[`APIUrl`]=finalUrl
        user1Info = await userComponentFunction.reCreateUser_returnSessUserId_async({
            userData: testData.user.user1,
            app: app
        })
        user1Id = user1Info[`userId`]
        user1Sess = user1Info[`sess`]
        // ap.inf('user1Info',user1Info)
        user2Info = await userComponentFunction.reCreateUser_returnSessUserId_async({
            userData: testData.user.user2,
            app: app
        })
        user2Id = user2Info[`userId`]
        user2Sess = user2Info[`sess`]

        user3Info = await userComponentFunction.reCreateUser_returnSessUserId_async({
            userData: testData.user.user3,
            app: app
        })
        // ap.inf('user3Info',user3Info)
        user3Id = user3Info[`userId`]
        user3Sess = user3Info[`sess`]

        /**     admin create penalize for user3     **/
        adminRootSess = await adminUserComponentFunction.adminUserLogin_returnSess_async({
            userData: testData.admin_user.adminRoot,
            adminApp: adminApp
        })
        adminRootId = await db_operation_helper.getAdminUserId_async({userName: testData.admin_user.adminRoot.name})
        //create penalize for user3
        let adminRootSalt = await commonAPI.getTempSalt_async({sess: adminRootSess})
        // ap.inf('root user salt',adminRootSalt)
        let cryptedUser3Id = crypt.cryptSingleFieldValue({fieldValue: user3Id, salt: adminRootSalt}).msg
        // ap.inf('cryptedUser3Id',cryptedUser3Id)
        await penalizeAPI.createPenalize_returnPenalizeId_async({
            adminUserSess: adminRootSess,
            penalizeInfo: penalizeInfoForUser3,
            penalizedUserId: cryptedUser3Id,
            adminApp: adminApp
        })

        user1IdCrypted=await commonAPI.cryptObjectId_async({objectId:user1Id,sess:user1Sess})
        // ap.inf('user1ParentFolderIdGetByUser2Crypted',user1ParentFolderIdGetByUser2Crypted)
        console.log(`==============================================================`)
        console.log(`=================    before all done      ====================`)
        console.log(`==============================================================`)
    });

    /***************    create    ***************/
    it('1.1 user not login', async function() {
        expectedErrorRc=controllerError.dispatch.post.notLoginCantCreateAddFriend.rc
        let sess=await userAPI.getFirstSession({app})
        // ap.inf('sess',sess)
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('1.2 user in penalize cant create', async function() {
        expectedErrorRc=controllerError.dispatch.post.userInPenalizeCantCreateAddFriend.rc
        // let sess=await API_helper.getFirstSession({app})
        // ap.inf('sess',sess)
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('2.1 inputValue singleField: req.body.values part recordInfo null', async function() {
        expectedErrorRc=validateError.validateFormat.inputValuePartSingleFieldValueFormatWrong.rc
        data={values:{[e_part.SINGLE_FIELD]:null}}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    /*    it('4.1.1 inputValue: req.body.values part RECORDINFO undefined', async function() {
            expectedErrorRc=validateError.validateFormat.inputValuePartRecordInfoValueFormatWrong.rc
            data={values:{[e_part.RECORD_INFO]:undefined}}
            await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });*/
    it('2.2 inputValue singleField: req.body.values part recordInfo not object', async function() {
        expectedErrorRc=validateError.validateFormat.inputValuePartSingleFieldValueFormatWrong.rc
        data={values:{[e_part.SINGLE_FIELD]:[]}}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });

    it('3.1 inputValue singleField: fieldValue to be decrypt not string', async function() {
        expectedErrorRc=controllerCheckerError.ifObjectIdCrypted.singleFieldValueContainInvalidObjectId.rc
        data={values:{[e_part.SINGLE_FIELD]:{[e_field.ADD_FRIEND.RECEIVER]:1234}}}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('3.2 inputValue singleField: fieldValue to be decrypt is string, but regex check failed', async function() {
        expectedErrorRc=controllerCheckerError.ifObjectIdCrypted.singleFieldValueContainInvalidObjectId.rc
        data={values:{[e_part.SINGLE_FIELD]:{[e_field.ADD_FRIEND.RECEIVER]:'1234'}}}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    it('3.3 inputValue singleField: fieldValue after decrypt is string, but invalid objectId', async function() {
        expectedErrorRc=browserInputRule.add_friend.receiver.format.error.rc
        data={values:{[e_part.SINGLE_FIELD]:{[e_field.ADD_FRIEND.RECEIVER]:'3410cae041c38fcae905d65501cf7f776ea6b127850b0955269481f6a4db1b22'}}}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.FOLDER.PARENT_FOLDER_ID,app:app})
    });

    it('4.1 inputValue singleField format:more than 1 field', async function() {
        expectedErrorRc=validateError.validateFormat.singleFieldMustOnlyOneField.rc
        data={values:{[e_part.SINGLE_FIELD]:{'unknown_field1':user1IdCrypted,'unknown_field2':user1IdCrypted}}}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.FOLDER.NAME,app:app})
    });
    //无法走到，undefined传入后变成空对象
    it('4.2 inputValue singleField format:field value cant be undefined', async function() {
        expectedErrorRc=validateError.validateFormat.singleFieldMustOnlyOneField.rc
        data={values:{[e_part.SINGLE_FIELD]:{[e_field.ADD_FRIEND.RECEIVER]:undefined}}}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.FOLDER.NAME,app:app})
    });
    it('4.3 inputValue singleField format:field cant be id', async function() {
        expectedErrorRc=validateError.validateFormat.singleFieldCantContainId.rc
        data={values:{[e_part.SINGLE_FIELD]:{id:user1IdCrypted}}}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.FOLDER.NAME,app:app})
    });
    it('4.4 inputValue singleField format:unknown field name', async function() {
        expectedErrorRc=validateError.validateFormat.singleFiledRuleNotDefine.rc
        data={values:{[e_part.SINGLE_FIELD]:{'unknown_field':user1IdCrypted}}}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.FOLDER.NAME,app:app})
    });

    it('5.1 inputValue singleField: fieldValue is null', async function() {
        expectedErrorRc=validateError.validateValue.CUDTypeWrong.rc
        data={values:{[e_part.SINGLE_FIELD]:{[e_field.ADD_FRIEND.RECEIVER]:null}}}
        await misc_helper.postDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
    });
    /***************    update    ***************/
    describe('dispatch:update', function(){
        before('set url', async function () {
            url='accept'
            finalUrl=baseUrl+url
        })
        it('10.1 update:user not login cant update', async function() {

            expectedErrorRc=controllerError.dispatch.put.notLoginCantUpdateAddFriend.rc
            let sess=await userAPI.getFirstSession({app})
            // ap.inf('finalUrl',finalUrl)
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('11.1 update:include unknown part', async function() {
            expectedErrorRc=validateError.validateFormat.inputValuePartNotMatch.rc
            // let sess=await userAPI.getFirstSession({app})
            let data={values:{'unknown part':{}}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('11.2 update:not include expected part', async function() {
            expectedErrorRc=validateError.validateFormat.inputValuePartNotMatch.rc
            // let sess=await userAPI.getFirstSession({app})
            let data={values:{[e_part.RECORD_INFO]:{}}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('12.1 inputValue singleField: fieldValue to be decrypt not string', async function() {
            expectedErrorRc=validateError.validateFormat.inputValuePartRecordIdCryptedValueFormatWrong.rc
            data={values:{[e_part.RECORD_ID]:1234}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('12.2 inputValue singleField: fieldValue to be decrypt is string, but regex check failed', async function() {
            expectedErrorRc=validateError.validateFormat.inputValuePartRecordIdCryptedValueFormatWrong.rc
            data={values:{[e_part.RECORD_ID]:'1234'}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('12.3 inputValue singleField: fieldValue after decrypt is string, but invalid objectId', async function() {
            expectedErrorRc=validateError.validateFormat.inputValuePartRecordIdDecryptedValueFormatWrong.rc
            data={values:{[e_part.RECORD_ID]:'3410cae041c38fcae905d65501cf7f776ea6b127850b0955269481f6a4db1b22'}}
            await misc_helper.putDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.FOLDER.PARENT_FOLDER_ID,app:app})
        });
    })

})


