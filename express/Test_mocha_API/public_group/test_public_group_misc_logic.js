/**
 * Created by Ada on 2017/7/11.
 */
'use strict'

const controllerError=require('../../server/controller/public_group/public_group_setting/public_group_controllerError').controllerError
let  baseUrl="/public_group/",finalUrl,url

const ap=require(`awesomeprint`)

const request=require('supertest')
const app=require('../../app')
const adminApp=require('../../../express_admin/app')
const assert=require('assert')

const server_common_file_require=require('../../server_common_file_require')
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange

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
const e_publicGroupJoinInRule=server_common_file_require.mongoEnum.PublicGroupJoinInRule.DB
const e_impeachUserAction=server_common_file_require.mongoEnum.ImpeachUserAction.DB
const e_impeachAdminAction=server_common_file_require.mongoEnum.ImpeachAdminAction.DB

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

let globalConfiguration=server_common_file_require.globalConfiguration
let adminUser1Info,adminUser2Info,adminUser3Info,adminUser1Id,adminUser2Id,adminUser3Id,adminUser1Sess,adminUser2Sess,adminUser3Sess,adminUser1Data,adminUser2Data,adminUser3Data
let user1Info,user2Info,user3Info,user1Id,user2Id,user3Id,user1Sess,user2Sess,user3Sess,user1Data,user2Data,user3Data
let userData,tmpResult,copyNormalRecord
let adminRootSess,adminRootId,data={values:{}}

let recordId1,recordId2,recordId3,expectedErrorRc

let normalRecord={
    [e_field.PUBLIC_GROUP.NAME]:'test',
    [e_field.PUBLIC_GROUP.JOIN_IN_RULE]:e_publicGroupJoinInRule.PERMIT_ALLOW,
    // [e_field.IMPEACH_ACTION.OWNER_ID]:undefined, //普通用户无需操作此字段
}

/*              create_impeach_state中的错误               */
describe('public group', async function() {
    data={values:{method:e_method.CREATE}}
    let impeachId,impeachId2
    before('user1/2/3 recreate and login ', async function(){
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

        /*          user1/2 create group(for unique test)     */
        tmpResult=await API_helper.generalCreate_returnRecord_async({userData:normalRecord,sess:user1Sess,app:app,url:finalUrl,})
        recordId1=tmpResult['_id']

        copyNormalRecord=objectDeepCopy(normalRecord)
        copyNormalRecord[e_field.PUBLIC_GROUP.NAME]='test2'
        copyNormalRecord[e_field.PUBLIC_GROUP.JOIN_IN_RULE]=e_publicGroupJoinInRule.NOONE_ALLOW
        tmpResult=await API_helper.generalCreate_returnRecord_async({userData:copyNormalRecord,sess:user2Sess,app:app,url:finalUrl,})
        recordId2=tmpResult['_id']
        console.log(`==============================================================`)
        console.log(`=================    before all done      ====================`)
        console.log(`==============================================================`)
    });

    /****************************************/
    /*              create                  */
    /****************************************/
    describe('request join', async function() {
        // userType check
        before('init var',async function(){
            data.values={}
            data.values[e_part.METHOD]=e_method.UPDATE
            finalUrl='/public_group/requestJoin'
        })

        it('userType check, admin not allow for join ', async function() {
            data.values[e_part.RECORD_ID]=recordId1

            expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it(`user1 try to join not exist group`, async function() {
            data.values[e_part.RECORD_ID]=testData.unExistObjectId

            expectedErrorRc=controllerError.notFindGroup.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        });
        it(`user1 try to join group2 which not allow anyone join`, async function() {
            data.values[e_part.RECORD_ID]=recordId2

            expectedErrorRc=controllerError.groupNotAllowJoin.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        });
        it(`user2 try to join group1 which already reach max(manually change global setting)`, async function() {
            data.values[e_part.RECORD_ID]=recordId1

            expectedErrorRc=controllerError.groupMemberReachMax.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        });
        it(`user2 try to join group1 twice`, async function() {
            data.values[e_part.RECORD_ID]=recordId1

            expectedErrorRc=0
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
            expectedErrorRc=controllerError.alreadySendRequest.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        });
    })

    describe('request leave', async function() {
        // userType check
        before('init var',async function(){
            data.values={}
            data.values[e_part.METHOD]=e_method.UPDATE
            finalUrl='/public_group/requestLeave'

            //user2 requestJoin group1， user1 agree
            data.values[e_part.RECORD_ID]=recordId1
            expectedErrorRc=0
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:'/public_group/requestJoin',sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})

            await misc_helper.sendDataToAPI_compareCommonRc_async({
                APIUrl:'/public_group/adminManageRequest',
                sess:user1Sess,
                data:{
                    values:{
                        [e_part.METHOD]:e_method.UPDATE,
                        [e_part.RECORD_ID]:recordId1,
                        [e_part.MANIPULATE_ARRAY]:{[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID]:{'add':[user2Id]}},
                    },

                },
                expectedErrorRc:0,
                app:app
            })

        })

        it('userType check, admin not allow for join ', async function() {
            data.values[e_part.RECORD_ID]=recordId1

            expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });

        it(`user2 left group1 successfully`, async function() {
            data.values[e_part.RECORD_ID]=recordId1

            expectedErrorRc=0
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})

        });
    })

    describe('admin manage request', async function() {
        // userType check
        before('init var',async function(){
            data.values={}
            data.values[e_part.METHOD]=e_method.UPDATE
            finalUrl='/public_group/adminManageRequest'

            //user2/3 requestJoin group1
            data.values[e_part.RECORD_ID]=recordId1
            expectedErrorRc=0
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:'/public_group/requestJoin',sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:'/public_group/requestJoin',sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        })

        it('userType check, admin not allow for join ', async function() {
            data={
                values:{
                    [e_part.RECORD_ID]:recordId1,
                    [e_part.METHOD]:e_method.UPDATE,
                    [e_part.MANIPULATE_ARRAY]:{[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID]:{'add':[user2Id]}}
                }
            }

            expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('user3 not admin, try to approve/reject user2 ', async function() {
            data={
                values:{
                    [e_part.RECORD_ID]:recordId1,
                    [e_part.METHOD]:e_method.UPDATE,
                    [e_part.MANIPULATE_ARRAY]:{[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID]:{'add':[user2Id]}}
                }
            }
            expectedErrorRc=controllerError.adminManageGroupMember.notAdminCantManageGroup.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('user1 try to approve/reject user2 without MANIPULATE_ARRAY-wait_approve_id', async function() {
            data={
                values:{
                    [e_part.RECORD_ID]:recordId1,
                    [e_part.METHOD]:e_method.UPDATE,
                    [e_part.MANIPULATE_ARRAY]:{[e_field.PUBLIC_GROUP.ADMINS_ID]:{'add':[user2Id]}}
                }
            }
            expectedErrorRc=controllerError.adminManageGroupMember.missField.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('user1 group join rule not permit allow', async function() {
            data={
                values:{
                    [e_part.RECORD_ID]:recordId1,
                    [e_part.METHOD]:e_method.UPDATE,
                    [e_part.RECORD_INFO]:{[e_field.PUBLIC_GROUP.JOIN_IN_RULE]:e_publicGroupJoinInRule.NOONE_ALLOW}
                }
            }
            expectedErrorRc=0
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:'/public_group',sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
            data={
                values:{
                    [e_part.RECORD_ID]:recordId1,
                    [e_part.METHOD]:e_method.UPDATE,
                    [e_part.MANIPULATE_ARRAY]:{[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID]:{'add':[user2Id]}}
                }
            }
            expectedErrorRc=controllerError.adminManageGroupMember.onlyPermitAllowNeedAdminOperator.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

            data={
                values:{
                    [e_part.RECORD_ID]:recordId1,
                    [e_part.METHOD]:e_method.UPDATE,
                    [e_part.RECORD_INFO]:{[e_field.PUBLIC_GROUP.JOIN_IN_RULE]:e_publicGroupJoinInRule.PERMIT_ALLOW}
                }
            }
            expectedErrorRc=0
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:'/public_group',sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });

        it('user1 try to approve/reject not exist userId in wait_approve_id', async function() {
            data={
                values:{
                    [e_part.RECORD_ID]:recordId1,
                    [e_part.METHOD]:e_method.UPDATE,
                    [e_part.MANIPULATE_ARRAY]:{[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID]:{'add':[testData.unExistObjectId]}}
                }
            }
            expectedErrorRc=controllerError.adminManageGroupMember.requestMemberNotExistInWaitApprove.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });

        it('user1  approve user2', async function() {
            data={
                values:{
                    [e_part.RECORD_ID]:recordId1,
                    [e_part.METHOD]:e_method.UPDATE,
                    [e_part.MANIPULATE_ARRAY]:{[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID]:{'add':[user2Id]}}
                }
            }
            expectedErrorRc=0
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('user1  reject user3', async function() {
            data={
                values:{
                    [e_part.RECORD_ID]:recordId1,
                    [e_part.METHOD]:e_method.UPDATE,
                    [e_part.MANIPULATE_ARRAY]:{[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID]:{'remove':[user3Id]}}
                }
            }
            expectedErrorRc=0
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
    })

    describe('admin remove member', async function() {
        // userType check
        before('init var',async function(){
            data.values={}
            data.values[e_part.METHOD]=e_method.UPDATE
            finalUrl='/public_group/adminRemoveMember'

            //user2/3 request join, and user1 approve
            data.values[e_part.RECORD_ID]=recordId1
            expectedErrorRc=0
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:'/public_group/requestJoin',sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:'/public_group/requestJoin',sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
            data={
                values:{
                    [e_part.RECORD_ID]:recordId1,
                    [e_part.METHOD]:e_method.UPDATE,
                    [e_part.MANIPULATE_ARRAY]:{[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID]:{'add':[user2Id,user3Id]}}
                }
            }
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:'/public_group/adminManageRequest',sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        })

        it('userType check, admin not allow for join', async function() {
            data={
                values:{
                    [e_part.RECORD_ID]:recordId1,
                    [e_part.METHOD]:e_method.UPDATE,
                    [e_part.MANIPULATE_ARRAY]:{[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID]:{'add':[user2Id]}}
                }
            }

            expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('user3 not admin, try to remove user2 ', async function() {
            data={
                values:{
                    [e_part.RECORD_ID]:recordId1,
                    [e_part.METHOD]:e_method.UPDATE,
                    [e_part.MANIPULATE_ARRAY]:{[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID]:{'add':[user2Id]}}
                }
            }
            expectedErrorRc=controllerError.adminRemoveMember.notAdminCantRemoveMember.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });


        it('user1 try to approve/reject user2 without MANIPULATE_ARRAY-members_id', async function() {
            data={
                values:{
                    [e_part.RECORD_ID]:recordId1,
                    [e_part.METHOD]:e_method.UPDATE,
                    [e_part.MANIPULATE_ARRAY]:{[e_field.PUBLIC_GROUP.ADMINS_ID]:{'add':[user2Id]}}
                }
            }
            expectedErrorRc=controllerError.adminRemoveMember.missField.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('user1 can only remove', async function() {
            data={
                values:{
                    [e_part.RECORD_ID]:recordId1,
                    [e_part.METHOD]:e_method.UPDATE,
                    [e_part.MANIPULATE_ARRAY]:{[e_field.PUBLIC_GROUP.MEMBERS_ID]:{'add':[user2Id]}}
                }
            }
            expectedErrorRc=controllerError.adminRemoveMember.wrongKeyExist.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})

        });
        // it('user1 can only removea(cant test)', async function() {
        //     data={
        //         values:{
        //             [e_part.RECORD_ID]:recordId1,
        //             [e_part.METHOD]:e_method.UPDATE,
        //             [e_part.MANIPULATE_ARRAY]:{[e_field.PUBLIC_GROUP.MEMBERS_ID]:{'remove':undefined}}
        //         }
        //     }
        //     expectedErrorRc=controllerError.adminRemoveMember.missMandatoryKey.rc
        //     await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        // });
        it('user1 try to remove admin(itself)', async function() {
            data={
                values:{
                    [e_part.RECORD_ID]:recordId1,
                    [e_part.METHOD]:e_method.UPDATE,
                    [e_part.MANIPULATE_ARRAY]:{[e_field.PUBLIC_GROUP.MEMBERS_ID]:{'remove':[user1Id]}}
                }
            }
            expectedErrorRc=controllerError.adminRemoveMember.cantRemoveAdmin.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });

        it('user1 try to remove user3 successful', async function() {
            data={
                values:{
                    [e_part.RECORD_ID]:recordId1,
                    [e_part.METHOD]:e_method.UPDATE,
                    [e_part.MANIPULATE_ARRAY]:{[e_field.PUBLIC_GROUP.MEMBERS_ID]:{'remove':[user3Id]}}
                }
            }
            expectedErrorRc=0
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
    })

    describe('admin add remove admin', async function() {
        // userType check
        before('init var',async function(){
            data.values={}
            data.values[e_part.METHOD]=e_method.UPDATE
            finalUrl='/public_group/creatorAddRemoveAdmin'

            //user2/3 request join, and user1 approve
            data.values[e_part.RECORD_ID]=recordId1
            expectedErrorRc=0
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:'/public_group/requestJoin',sess:user2Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:'/public_group/requestJoin',sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
            data={
                values:{
                    [e_part.RECORD_ID]:recordId1,
                    [e_part.METHOD]:e_method.UPDATE,
                    [e_part.MANIPULATE_ARRAY]:{[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID]:{'add':[user2Id,user3Id]}}
                }
            }
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:'/public_group/adminManageRequest',sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,fieldName:e_field.PUBLIC_GROUP.ADMINS_ID,app:app})
        })

        it('userType check, admin not allow for join', async function() {
            data={
                values:{
                    [e_part.RECORD_ID]:recordId1,
                    [e_part.METHOD]:e_method.UPDATE,
                    [e_part.MANIPULATE_ARRAY]:{[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID]:{'add':[user2Id]}}
                }
            }

            expectedErrorRc=controllerCheckerError.userTypeNotExpected.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:adminRootSess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('user3 not creator, try to remove user2 ', async function() {
            data={
                values:{
                    [e_part.RECORD_ID]:recordId1,
                    [e_part.METHOD]:e_method.UPDATE,
                    [e_part.MANIPULATE_ARRAY]:{[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID]:{'add':[user2Id]}}
                }
            }
            expectedErrorRc=controllerError.creatorAddRemoveAdmin.notCreatorCantAddRemoveAdmin.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user3Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });


        it('user1 try to approve/reject user2 without MANIPULATE_ARRAY-admins_id', async function() {
            data={
                values:{
                    [e_part.RECORD_ID]:recordId1,
                    [e_part.METHOD]:e_method.UPDATE,
                    [e_part.MANIPULATE_ARRAY]:{[e_field.PUBLIC_GROUP.MEMBERS_ID]:{'add':[user2Id]}}
                }
            }
            expectedErrorRc=controllerError.creatorAddRemoveAdmin.missField.rc
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('user1 add user2 as admin', async function() {
            data={
                values:{
                    [e_part.RECORD_ID]:recordId1,
                    [e_part.METHOD]:e_method.UPDATE,
                    [e_part.MANIPULATE_ARRAY]:{[e_field.PUBLIC_GROUP.ADMINS_ID]:{'add':[user2Id]}}
                }
            }
            expectedErrorRc=0
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
        it('user1 remove user2 as admin', async function() {
            data={
                values:{
                    [e_part.RECORD_ID]:recordId1,
                    [e_part.METHOD]:e_method.UPDATE,
                    [e_part.MANIPULATE_ARRAY]:{[e_field.PUBLIC_GROUP.ADMINS_ID]:{'remove':[user2Id]}}
                }
            }
            expectedErrorRc=0
            await misc_helper.sendDataToAPI_compareCommonRc_async({APIUrl:finalUrl,sess:user1Sess,data:data,expectedErrorRc:expectedErrorRc,app:app})
        });
    })
})

