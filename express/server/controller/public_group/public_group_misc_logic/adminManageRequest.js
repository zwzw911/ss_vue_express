/**
 * Created by ada on 2017/9/1.
 * 管理员对群成员操作（同意/拒绝 申请；移除成员）
 * 将preCheck和logic结合在一起（简单操作）
 */
'use strict'
const ap=require(`awesomeprint`)

/*                      controller setting                */
const controller_setting=require('../public_group_setting/public_group_setting').setting
const controllerError=require('../public_group_setting/public_group_controllerError').controllerError

/*                      specify: genEnum                */
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject
const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule
const browserInputRule=require('../../../constant/inputRule/browserInputRule').browserInputRule


/*                      server common                                           */
const server_common_file_require=require('../../../../server_common_file_require')
/*                      server common：enum                                       */
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart
const e_method=nodeEnum.Method
const e_hashType=nodeRuntimeEnum.HashType
// const e_part=nodeEnum.ValidatePart

const e_penalizeType=mongoEnum.PenalizeType.DB
const e_penalizeSubType=mongoEnum.PenalizeSubType.DB
const e_accountType=mongoEnum.AccountType.DB
const e_publicGroupJoinInRule=mongoEnum.PublicGroupJoinInRule.DB
const e_adminUserType=mongoEnum.AdminUserType.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB
const e_allUserType=mongoEnum.AllUserType.DB

const e_manipulateOperator=nodeEnum.ManipulateOperator
/*                      server common：function                                       */
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const hash=server_common_file_require.crypt.hash

/*                      server common：other                                       */
const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig

const globalConfiguration=server_common_file_require.globalConfiguration

async function adminManageRequest_async({req}){
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME,tmpResult//,collConfig={},collImageConfig={}

    //checkMethod只检测req的结构，以及req中method的格式和值，以便后续可以直接根据method进行调用
    tmpResult=controllerHelper.checkMethod({req:req})
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }
    //因为method已经检测过，所有要从req.body.values中删除，防止重复检查
    let method=req.body.values[e_part.METHOD]
    delete req.body.values[e_part.METHOD]

    let userLoginCheck,penalizeCheck,expectedPart,optionalPart

    //method只能为update
    if(method!==e_method.UPDATE){
        return Promise.reject(controllerError.notSupportMethod)
    }
    userLoginCheck={
        needCheck:true,
        error:controllerError.notLoginCantUpdatePublicGroup
    }
    penalizeCheck={
        penalizeType:e_penalizeType.NO_PUBLIC_GROUP,
        penalizeSubType:e_penalizeSubType.UPDATE,
        penalizeCheckError:controllerError.inPenalizeCantUpdatePublicGroup
    }

    expectedPart=[e_part.RECORD_ID,e_part.MANIPULATE_ARRAY]
    // ap.inf('bfeore')
    tmpResult=await controllerHelper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
    // ap.inf('after',tmpResult)
    /*      执行逻辑                */
    await requestJoin_logic_async({req:req,expectedPart:expectedPart})
    return Promise.resolve({rc:0})
}

async function requestJoin_logic_async({req,expectedPart}){
    // console.log(`updateUser_async in`)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    /*******************************************************************************************/
    /*                                          define variant                                 */
    /*******************************************************************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let convertedNoSql //为editSubField设置
    let recordInfoNotChange=false,editSubFieldValueNotChange=false //检测是否需要做update
    // console.log(`req============>${JSON.stringify(req)}`)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority}=userInfo
    // console.log(`userInfo============>${JSON.stringify(userInfo)}`)
    let {docValue,recordId,subFieldValue,manipulateArrayValue}=controllerHelper.getPartValue({req:req,arr_expectedPart:expectedPart})

    let groupRecord=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel[collName],id:recordId})
    if(null===groupRecord){
        return Promise.reject(controllerError.adminManageGroupMember.notFindGroup)
    }
    /*******************************************************************************************/
    /*                                     用户类型和权限检测                                  */
    /*******************************************************************************************/
    await controllerChecker.ifExpectedUserType_async({req:req,arr_expectedUserType:[e_allUserType.USER_NORMAL]})
    if(-1===groupRecord[e_field.PUBLIC_GROUP.ADMINS_ID].indexOf(userId)){
        return Promise.reject(controllerError.adminManageGroupMember.notAdminCantManageGroup)
    }
    // ap.inf('admin check done')
    /*******************************************************************************************/
    /*                                     参数过滤                                           */
    /*******************************************************************************************/
    // if(undefined!==docValue){
    //     dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])
    // }
    /*******************************************************************************************/
    /*                                     逻辑检测                                            */
    /*******************************************************************************************/
    let updateFieldsValue={}
    if(undefined===manipulateArrayValue[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID]){
        return Promise.reject(controllerError.adminManageGroupMember.missField)
    }

    //确认rule是批准加入（才能进行）
    if(groupRecord[e_field.PUBLIC_GROUP.JOIN_IN_RULE]!==e_publicGroupJoinInRule.PERMIT_ALLOW){
        return Promise.reject(controllerError.adminManageGroupMember.onlyPermitAllowNeedAdminOperator)
    }

    //add/remove中每个元素必须位于WAIT_APPROVE_ID中
    // ap.inf('manipulateArrayValue[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID]',manipulateArrayValue[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID])
    for(let key in manipulateArrayValue[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID]){
        // ap.inf('key',key)
        for(let singleEle of manipulateArrayValue[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID][key]){
            // ap.inf('singleEle',singleEle)
            if(-1===groupRecord[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID].indexOf(singleEle)){
                return Promise.reject(controllerError.adminManageGroupMember.requestMemberNotExistInWaitApprove)
            }
        }
    }

    //转换成NoSql
    //无论批准拒绝，都要从wait_approve中移除
    updateFieldsValue['$pullAll']={}
    updateFieldsValue['$pullAll'][e_field.PUBLIC_GROUP.WAIT_APPROVE_ID]=[]


    if(undefined!==manipulateArrayValue[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID][e_manipulateOperator.ADD]){
        //只有approve的时候，才初始化
        updateFieldsValue['$addToSet']={}
        updateFieldsValue['$addToSet'][e_field.PUBLIC_GROUP.MEMBERS_ID]=[]

        //member_id是否达到上限
        let defineMaxNumber=globalConfiguration.PublicGroup.max.maxUserPerGroup
        if(groupRecord[e_field.PUBLIC_GROUP.MEMBERS_ID].length+manipulateArrayValue[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID][e_manipulateOperator.ADD].length>=defineMaxNumber){
            return Promise.reject(controllerError.adminManageGroupMember.groupMemberReachMax)
        }
        // ap.inf('manipulateArrayValue[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID][e_manipulateOperator.ADD]',manipulateArrayValue[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID][e_manipulateOperator.ADD])
        // ap.inf('updateFieldsValue[\'$pullAll\'][e_field.PUBLIC_GROUP.WAIT_APPROVE_ID]',updateFieldsValue['$pullAll'][e_field.PUBLIC_GROUP.WAIT_APPROVE_ID])
        updateFieldsValue['$pullAll'][e_field.PUBLIC_GROUP.WAIT_APPROVE_ID]=updateFieldsValue['$pullAll'][e_field.PUBLIC_GROUP.WAIT_APPROVE_ID].concat(manipulateArrayValue[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID][e_manipulateOperator.ADD])
        // ap.inf('updateFieldsValue[\'$pullAll\'][e_field.PUBLIC_GROUP.WAIT_APPROVE_ID]',updateFieldsValue['$pullAll'][e_field.PUBLIC_GROUP.WAIT_APPROVE_ID])
        updateFieldsValue['$addToSet'][e_field.PUBLIC_GROUP.MEMBERS_ID]={'$each':manipulateArrayValue[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID][e_manipulateOperator.ADD]}
    }
    if(undefined!==manipulateArrayValue[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID][e_manipulateOperator.REMOVE]){
        updateFieldsValue['$pullAll'][e_field.PUBLIC_GROUP.WAIT_APPROVE_ID]=updateFieldsValue['$pullAll'][e_field.PUBLIC_GROUP.WAIT_APPROVE_ID].concat(manipulateArrayValue[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID][e_manipulateOperator.REMOVE])
        // updateFieldsValue['$addToSet'][e_field.PUBLIC_GROUP.MEMBERS_ID]={'$each':manipulateArrayValue[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID][e_manipulateOperator.ADD]}
    }

ap.inf('updateFieldsValue',updateFieldsValue)
    /*//1. 当前joinRule是否为全部拒绝
    if(groupRecord[e_field.PUBLIC_GROUP.JOIN_IN_RULE]===e_publicGroupJoinInRule.NOONE_ALLOW){
        return Promise.reject(controllerError.groupNotAllowJoin)
    }
    //2. member_id是否达到上限
    let defineMaxNumber=globalConfiguration.PublicGroup.max.maxUserPerGroup
    if(groupRecord[e_field.PUBLIC_GROUP.MEMBERS_ID].length>=defineMaxNumber){
        return Promise.reject(controllerError.groupMemberReachMax)
    }
    //3. 是否已经在member_id中
    if(-1!==groupRecord[e_field.PUBLIC_GROUP.MEMBERS_ID].indexOf(userId)){
        return Promise.reject(controllerError.alreadyGroupMember)
    }
    //4. 是否已经在wait_approve_id中
    if(-1!==groupRecord[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID].indexOf(userId)){
        return Promise.reject(controllerError.alreadySendRequest)
    }
    //5 根据rule决定加入那个字段
    if(groupRecord[e_field.PUBLIC_GROUP.JOIN_IN_RULE]===e_publicGroupJoinInRule.ANYONE_ALLOW){
        docValue={$addToSet:{[e_field.PUBLIC_GROUP.MEMBERS_ID]:userId}}
    }
    if(groupRecord[e_field.PUBLIC_GROUP.JOIN_IN_RULE]===e_publicGroupJoinInRule.PERMIT_ALLOW){
        docValue={$addToSet:{[e_field.PUBLIC_GROUP.WAIT_APPROVE_ID]:userId}}
    }*/
    /*******************************************************************************************/
    /*                                       authorization check                               */
    /*******************************************************************************************/
    /*******************************************************************************************/
    /*                             value cant be changed                                       */
    /*******************************************************************************************/
    /*******************************************************************************************/
    /*                              edit sub field value check and convert                     */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                              remove not change field                                    */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                          check field number after delete                                */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                                       resource check                                    */
    /*******************************************************************************************/

    // let tmpResult=await common_operation_model.findById({dbModel:dbModel[e_coll.USER],id:objectId})
    // let userId=tmpResult.msg[e_field.USER.]
    /*******************************************************************************************/
    /*                                     specific priority check                             */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                                    fk value是否存在                                     */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                                  enum unique check(enum in array)                       */
    /*******************************************************************************************/


    /*******************************************************************************************/
    /*                                       特定字段的处理（检查）                            */
    /*******************************************************************************************/


    /*******************************************************************************************/
    /*                                  field value duplicate check                            */
    /*******************************************************************************************/


    /*******************************************************************************************/
    /*                         添加internal field，然后检查                                    */
    /*******************************************************************************************/


    /*******************************************************************************************/
    /*                    复合字段unique check（需要internal field完成后）                     */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                                  db operation                                           */
    /*******************************************************************************************/
    // await common_operation_model.update_returnRecord_async({dbModel:e_dbModel[collName],id:recordId,values:docValue})
    let promiseTobeExec=[]

    //普通update操作
    promiseTobeExec.push(common_operation_model.findByIdAndUpdate_returnRecord_async({
        dbModel: e_dbModel[collName],
        id: recordId,
        updateFieldsValue: updateFieldsValue
    }))
    
    //同步执行
    await Promise.all(promiseTobeExec)
    return Promise.resolve({rc:0})


}

module.exports={
    adminManageRequest_async,
}