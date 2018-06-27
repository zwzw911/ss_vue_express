/**
 * Created by ada on 2017/9/1.
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')

/**************  controller相关常量  ****************/
const controller_setting=require('../join_public_group_request_setting/join_public_group_request_setting').setting
const controllerError=require('../join_public_group_request_setting/join_public_group_request_controllerError').controllerError

/**************      rule             *************/
const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule
const browserInputRule=require('../../../constant/inputRule/browserInputRule').browserInputRule

/***************  数据库相关常量   ****************/
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
const enumValue=require(`../../../constant/genEnum/enumValue`)

const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject
const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共函数   ******************/
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const crypt=server_common_file_require.crypt
const controllerInputValueLogicCheck=server_common_file_require.controllerInputValueLogicCheck
/****************  公共常量 ********************/
const nodeEnum=server_common_file_require.nodeEnum
const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart
const e_resourceFieldName=nodeEnum.ResourceFieldName

const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const e_inputValueLogicCheckStep=nodeRuntimeEnum.InputValueLogicCheckStep

const mongoEnum=server_common_file_require.mongoEnum
const e_accountType=mongoEnum.AccountType.DB
const e_docStatus=mongoEnum.DocStatus.DB
const e_impeachType=mongoEnum.ImpeachType.DB
const e_impeachUserAction=mongoEnum.ImpeachUserAction.DB
const e_impeachState=mongoEnum.ImpeachState.DB
const e_addFriendStatus=mongoEnum.AddFriendStatus.DB
const e_allUserType=mongoEnum.AllUserType.DB
const e_resourceRange=mongoEnum.ResourceRange.DB
const e_articleStatus=mongoEnum.ArticleStatus.DB
const e_documentStatus=mongoEnum.DocumentStatus.DB
// const e_impeachType=mongoEnum.ImpeachType.DB

// const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange

/****************  特有常量 ********************/
const e_joinPublicGroupHandleResult=mongoEnum.JoinPublicGroupHandleResult.DB
const e_publicGroupJoinInRule=mongoEnum.PublicGroupJoinInRule.DB

/*************** 配置信息 *********************/
const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig

//添加内部产生的值（hash password）
//对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）
//对数值逻辑进行判断（外键是否有对应的记录等）
//执行db操作并返回结果
async  function createJoinPublicGroupRequest_async({req,applyRange}){
    // console.log(`createJoinPublicGroupRequest_async in`)
    // ap.wrn('createJoinPublicGroupRequest_async in')
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult,condition,createdRecord
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME
/*    let docValue={
        [e_field.IMPEACH.TITLE]:'新举报',
        [e_field.IMPEACH.CONTENT]:'对文档/评论的内容进行举报',
    }*/
    let docValue=req.body.values[e_part.RECORD_INFO]
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
// console.log(`docValue===> ${JSON.stringify(docValue)}`)
// console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    /**********************************************/
    /***********    用户类型检测    **************/
    /*********************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})

    /**********************************************/
    /********  删除null/undefined的字段  *********/
    /*********************************************/
    dataConvert.constructCreateCriteria(docValue)

/*    /!*******************************************************************************************!/
    /!*                                  fk value是否存在                                       *!/
    /!*******************************************************************************************!/
    //在fkConfig中定义的外键检查;外键对应的impeach是没有删除，且没有结束的impeach（fkConfig中设置查询条件）
    if(undefined!==fkConfig[collName]) {
        await controllerChecker.ifFkValueExist_async({
            docValue: docValue,
            collFkConfig: fkConfig[collName],
            collFieldChineseName: e_chineseName[collName]
        })
    }*/



    /**********************************************/
    /***********    用户权限检测(create无需权限检测)    **************/
    /*********************************************/
/*    //当前用户必须是impeach的创建人
    let originalDoc
    if(userType===e_allUserType.USER_NORMAL){
        originalDoc=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
            dbModel:e_dbModel.impeach,
            recordId:docValue[e_field.IMPEACH_COMMENT.IMPEACH_ID],
            ownerFieldsName:[e_field.IMPEACH.CREATOR_ID],
            userId:userId,
            additionalCondition:undefined,
        })
        if(false===originalDoc){
            return Promise.reject(controllerError.create.notImpeachCreatorCantCreateComment)
        }
    }*/
    // ap.wrn('owner check done')


    // ap.wrn('special check done')
    /**********************************************/
    /**  CALL FUNCTION:inputValueLogicValidCheck **/
    /**********************************************/
    let commonParam={docValue:docValue,userId:userId,collName:collName}
    // ap.inf('userId',userId)
    let stepParam={
        //fk: impeach的state不能为NEW,EDITING或者DONE
        [e_inputValueLogicCheckStep.FK_EXIST_AND_PRIORITY]:{flag:true,optionalParam:undefined},
        [e_inputValueLogicCheckStep.ENUM_DUPLICATE]:{flag:true,optionalParam:undefined},
        //object：coll中，对单个字段进行unique检测，需要的额外查询条件
        [e_inputValueLogicCheckStep.SINGLE_FIELD_VALUE_UNIQUE]:{flag:true,optionalParam:{singleValueUniqueCheckAdditionalCondition:undefined}},
        //数组，元素是字段名。默认对所有dataType===string的字段进行XSS检测，但是可以通过此变量，只选择部分字段
        [e_inputValueLogicCheckStep.XSS]:{flag:true,optionalParam:{expectedXSSFields:undefined}},
        //object，对compoundField进行unique检测需要的额外条件，key从model->mongo->compound_unique_field_config.js中获得
        //在internalValue之后执行
        // [e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]:{flag:true,optionalParam:{compoundFiledValueUniqueCheckAdditionalCheckCondition:undefined}},
        //Object，配置resourceCheck的一些参数,{requiredResource,resourceProfileRange,userId,containerId}
        /**   判断 撤销/编辑中/提交但未被处理 的举报数是否超出预订范围 **/
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:true,optionalParam:{resourceUsageOption:{requiredResource:{[e_resourceFieldName.USED_NUM]:1},resourceProfileRange:[e_resourceRange.MAX_DECLINE_JOIN_REQUEST],userId:userId,containerId:docValue[e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID]}}},
    }
    await controllerInputValueLogicCheck.inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})
// ap.wrn('inputValueLogicValidCheck_async done')
    /**********************************************/
    /***********      特定检查      **************/
    /*********************************************/
    //是否已经加入了群
    let publicGroup=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.public_group,id:docValue[e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID]})
    if(-1!==publicGroup[e_field.PUBLIC_GROUP.MEMBERS_ID].indexOf(userId)){
        return Promise.reject(controllerError.create.alreadyInPublicGroup)
    }
    // ap.wrn('special chekc 0 done')
    //是否已经有入群请求，但是没有被处理
    condition={
        [e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID]:docValue[e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID],
        [e_field.JOIN_PUBLIC_GROUP_REQUEST.CREATOR_ID]:userId,
        [e_field.JOIN_PUBLIC_GROUP_REQUEST.HANDLE_RESULT]:e_joinPublicGroupHandleResult.UNTREATED,
    }
    let  existRequest=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel.join_public_group_request,condition:condition})
    // ap.wrn()
    if(existRequest.length>0){
        return Promise.reject(controllerError.create.requestAlreadyExist)
    }
    // ap.wrn('special chekc 1 done')
    //查找group的join rule
    let publicGroupJoinRecord=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.public_group,id:docValue[e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID]})
    let publicGroupJoinRule=publicGroupJoinRecord[e_field.PUBLIC_GROUP.JOIN_IN_RULE]
    //如果可以直接加入，则直接更新public_group的member字段
    let updateValues={
        "push":{
            [e_field.PUBLIC_GROUP.MEMBERS_ID]:userId
        }
    }
    if(publicGroupJoinRule===e_publicGroupJoinInRule.ANYONE_ALLOW){
        await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.public_group,id:docValue[e_field.JOIN_PUBLIC_GROUP_REQUEST.PUBLIC_GROUP_ID],updateFieldsValue:updateValues})
        return Promise.resolve({rc:0,msg:'成功加入群'})
    }
    if(e_publicGroupJoinInRule.NOONE_ALLOW===publicGroupJoinRule){
        return Promise.reject(controllerError.create.publicGroupNotAllowJoin)
    }
    // ap.wrn('special chekc 2 done')
    //否则，在join_public_group_request中加入记录

    // ap.wrn('inputValueLogicValidCheck_async done')
    /**     db操作(批准才能加入)        **/
    if(e_publicGroupJoinInRule.PERMIT_ALLOW===publicGroupJoinRule){
        createdRecord=await businessLogic_async({docValue:docValue,collName:collName,userId:userId,applyRange:applyRange})
    }



  /*  // ap.wrn('createdRecord done',createdRecord)
    /!*********************************************!/
    /!**********      删除指定字段       *********!/
    /!*********************************************!/
    controllerHelper.deleteFieldInRecord({record:createdRecord,fieldsToBeDeleted:undefined})
    /!*********************************************!/
    /!**********      加密 敏感数据       *********!/
    /!*********************************************!/
    controllerHelper.cryptRecordValue({record:createdRecord,salt:tempSalt,collName:collName})*/

    // ap.inf('createdRecord done',createdRecord)
    return Promise.resolve({rc:0,msg:'入群请求已经发送，等待群管理员处理'})


}

async function businessLogic_async({docValue,collName,userId,applyRange}){
    /*****************************************************/
    /****            添加internal field，然后检查      ***/
    /******************************************************/
    // console.log(`before hash is ${JSON.stringify(docValue)}`)
    let internalValue={}
    internalValue[e_field.JOIN_PUBLIC_GROUP_REQUEST.CREATOR_ID]=userId
    internalValue[e_field.JOIN_PUBLIC_GROUP_REQUEST.HANDLE_RESULT]=e_joinPublicGroupHandleResult.UNTREATED

    /*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           */
    if(e_env.DEV===currentEnv){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInternalRule:internalInputRule[collName],applyRange:applyRange})
        // console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    if(undefined===docValue){
        docValue=internalValue
    }else{
        Object.assign(docValue,internalValue)
    }
// console.log(`========================>internal check  done<--------------------------`)
    /*******************************************************************************************/
    /**                   复合字段unique check（需要internal field完成后）                    **/
    /*******************************************************************************************/
    if(undefined!==docValue){
        let compoundFiledValueUniqueCheckAdditionalCheckCondition
        await controllerInputValueLogicCheck.ifCompoundFiledValueUnique_returnExistRecord_async({
            collName:collName,
            docValue:docValue,
            additionalCheckCondition:compoundFiledValueUniqueCheckAdditionalCheckCondition,
        })
    }
    /*******************************************************************************************/
    /**                                 db operation                                          **/
    /*******************************************************************************************/
    //new impeach插入db
    let createdRecord= await common_operation_model.create_returnRecord_async({dbModel:e_dbModel[collName],value:docValue})

    return Promise.resolve(createdRecord.toObject())
}
module.exports={
    createJoinPublicGroupRequest_async,
}