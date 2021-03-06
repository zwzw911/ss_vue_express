/**
 * Created by ada on 2017/9/1.
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')
/**************  controller相关常量  ****************/
const controller_setting=require('../admin_setting/admin_setting').setting
const controllerError=require('../admin_setting/admin_user_controllerError').controllerError

/***************  数据库相关常量   ****************/
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
// const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject

/********************  rule   ********************/
const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule
const browserInputRule=require('../../../constant/inputRule/browserInputRule').browserInputRule

const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共常量   ******************/
const mongoEnum=server_common_file_require.mongoEnum
const e_accountType=mongoEnum.AccountType.DB
const e_docStatus=mongoEnum.DocStatus.DB
const e_adminUserType=mongoEnum.AdminUserType.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB
const e_allUserType=mongoEnum.AllUserType.DB

const nodeEnum=server_common_file_require.nodeEnum
const e_env=nodeEnum.Env
const e_part=server_common_file_require.nodeEnum.ValidatePart

const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const e_hashType=nodeRuntimeEnum.HashType
const e_inputValueLogicCheckStep=nodeRuntimeEnum.InputValueLogicCheckStep

const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange

/**************  公共函数   ******************/
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const controllerInputValueLogicCheck=server_common_file_require.controllerInputValueLogicCheck

const misc=server_common_file_require.misc
const arr=server_common_file_require.array

const hash=server_common_file_require.crypt.hash
/*************** 配置信息 *********************/
const currentEnv=server_common_file_require.appSetting.currentEnv

const regex=server_common_file_require.regex.regex

//添加内部产生的值（hash password）
//对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）
//对数值逻辑进行判断（外键是否有对应的记录等）
//执行db操作并返回结果
async  function createUser_async({req,applyRange}){
    // ap.wrn('createUser_async in')
    /*************************************************/
    /************     首先检查captcha     ***********/
    /************************************************/
    await controllerHelper.getCaptchaAndCheck_async({req:req,db:8})
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let docValue=req.body.values[e_part.RECORD_INFO]
    // ap.wrn('docValue',docValue)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    /**********************************************/
    /********  删除null/undefined的字段  *********/
    /*********************************************/
    dataConvert.constructCreateCriteria(docValue)

    /*********************************************/
    /*************    用户类型检测    ************/
    /*********************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.ADMIN_ROOT,e_allUserType.ADMIN_NORMAL]})
    // ap.wrn('userType',userType)
    // ap.wrn('e_allUserType.ADMIN_ROOT',e_allUserType.ADMIN_ROOT)
    /*              不能通过API创建ROOT           */
    if(e_adminUserType.ADMIN_ROOT===docValue[e_field.ADMIN_USER.USER_TYPE]){
        return Promise.reject(controllerError.create.cantCreateRootUserByAPI)
    }
    /*              当前用户是否有创建用户的权限      */
    let hasCreatePriority=await controllerChecker.ifAdminUserHasExpectedPriority_async({userPriority:userPriority,arr_expectedPriority:[e_adminPriorityType.CREATE_ADMIN_USER]})
    if(false===hasCreatePriority){
        return Promise.reject(controllerError.create.currentUserHasNotPriorityToCreateUser)
    }
    // ap.wrn('ifAdminUserHasExpectedPriority_async done')
    /************************************************/
    /*** CALL FUNCTION:inputValueLogicValidCheck ****/
    /************************************************/
    let commonParam={docValue:docValue,userId:userId,collName:collName}
    let stepParam={
        [e_inputValueLogicCheckStep.FK_EXIST_AND_PRIORITY]:{flag:true,optionalParam:undefined},
        [e_inputValueLogicCheckStep.ENUM_DUPLICATE]:{flag:true,optionalParam:undefined},
        //object：coll中，对单个字段进行unique检测，需要的额外查询条件
        [e_inputValueLogicCheckStep.SINGLE_FIELD_VALUE_UNIQUE]:{flag:true,optionalParam:{singleValueUniqueCheckAdditionalCondition:{[e_field.ADMIN_USER.DOC_STATUS]:e_docStatus.DONE}}},
        //数组，元素是字段名。默认对所有dataType===string的字段进行XSS检测，但是可以通过此变量，只选择部分字段
        [e_inputValueLogicCheckStep.XSS]:{flag:true,optionalParam:{expectedXSSFields:undefined}},
        //object，对compoundField进行unique检测需要的额外条件，key从model->mongo->compound_unique_field_config.js中获得
        //在internalValue之后执行
        // [e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]:{flag:true,optionalParam:{compoundFiledValueUniqueCheckAdditionalCheckCondition:undefined}},
        //Object，配置resourceCheck的一些参数,{requiredResource,resourceProfileRange,userId,containerId}
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:false,optionalParam:{resourceUsageOption:undefined}},
    }
    // ap.wrn('before inputValueLogicValidCheck_async')
    await controllerInputValueLogicCheck.inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})
    // ap.wrn('inputValueLogicValidCheck_async done')
// console.log(`ifFieldInDocValueUnique_async done===>`)
    /*******************************************************************************************/
    /*                                       特定字段的处理（检查）                            */
    /*******************************************************************************************/
    //创建的用户的权限必须来自当前login用户的权限（是login用户权限的子集）
    // console.log(`create admin======>parent pri ${JSON.stringify(userPriority)}`)
    // console.log(`create admin======>child pri ${JSON.stringify(docValue[e_field.ADMIN_USER.USER_PRIORITY])}`)
    // ap.inf('docValue[e_field.ADMIN_USER.USER_PRIORITY]',docValue[e_field.ADMIN_USER.USER_PRIORITY])

    if(undefined!==docValue[e_field.ADMIN_USER.USER_PRIORITY]){
// ap.wrn('userPriority',userPriority)
//         ap.wrn('docValue[e_field.ADMIN_USER.USER_PRIORITY]',docValue[e_field.ADMIN_USER.USER_PRIORITY])
        //权限在预订范围内
        if(false===arr.ifArrayEleContainInArray({expectedArray:userPriority,toBeCheckArray:docValue[e_field.ADMIN_USER.USER_PRIORITY]})){
            return Promise.reject(controllerError.create.createUserPriorityNotInheritedFromParent)
        }

    }
    // ap.wrn('precheck done')




    //如果用户在db中存在，但是创建到一半，则删除用户(然后重新开始流程)

    let condition={name:docValue[e_field.ADMIN_USER.NAME]}
    let docStatusTmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.admin_user,condition:condition})
    // ap.wrn('docStatusTmpResult',docStatusTmpResult)
    if(undefined!== docStatusTmpResult[0] && e_docStatus.PENDING===docStatusTmpResult[0][e_field.ADMIN_USER.DOC_STATUS]){
        await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.admin_user,condition:condition})
        // onsole.log(`docStatusTmpResult ${JSON.stringify(docStatusTmpResult)}`)
        //删除可能的关联记录
        //sugar
        await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.admin_sugar,condition:{userId:docStatusTmpResult[0][e_field.ADMIN_USER.ID]}})
        // onsole.log(`docStatusTmpResult ${JSON.stringify(docStatusTmpResult)}`)
        //user_friend_group
        // await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.user_friend_group,condition:{userId:docStatusTmpResult[0][e_field.USER.ID]}})
        // onsole.log(`docStatusTmpResult ${JSON.stringify(docStatusTmpResult)}`)
    }
    // ap.wrn('precheck done')

    /*************************************************************/
    /***************   业务处理    *******************************/
    /*************************************************************/
    let createdRecord=await businessLogic_async({docValue:docValue,collName:collName,userId:userId,applyRange:applyRange})
    // ap.wrn('businessLogic_async done')
    /*********************************************/
    /**********      删除指定字段       *********/
    /*********************************************/
    controllerHelper.deleteFieldInRecord({record:createdRecord,fieldsToBeDeleted:undefined})
    /*********************************************/
    /**********      加密 敏感数据       *********/
    /*********************************************/
    controllerHelper.encryptSingleRecord({record:createdRecord,salt:tempSalt,collName:collName})

    // ap.inf('businessLogic_async done')
    return Promise.resolve({rc:0,msg:'创建成功'})
    /*                  添加内部产生的值（sugar && hash password && acountType）                  */
    // console.log(`before hash is ${JSON.stringify(docValue)}`)

}

/*************************************************************/
/***************   业务处理    *******************************/
/*************************************************************/
async function businessLogic_async({docValue,collName,userId,applyRange}){
    let internalValue={}

    let hashResult=controllerHelper.generateSugarAndHashPassword({ifAdminUser:true,ifUser:false,password:docValue[e_field.ADMIN_USER.PASSWORD]})
    // console.log(`hashResult is ${JSON.stringify(hashResult)}`)
    if(hashResult.rc>0){return Promise.reject(hashResult)}
    let sugar=hashResult.msg['sugar']
    internalValue[e_field.ADMIN_USER.PASSWORD]=hashResult.msg['hashedPassword']
    internalValue[e_field.ADMIN_USER.DOC_STATUS]=e_docStatus.PENDING

// console.log(`docValue   ${JSON.stringify(docValue)}`)
    /*    let accountValue=docValue[e_field.ADMIN_USER.ACCOUNT]
        if(regex.email.test(accountValue)){
            internalValue[e_field.ADMIN_USER.ACCOUNT_TYPE]=e_accountType.EMAIL
        }
        if(regex.mobilePhone.test(accountValue)){
            internalValue[e_field.ADMIN_USER.ACCOUNT_TYPE]=e_accountType.MOBILE_PHONE
        }*/

    // docValue[e_field.USER.USED_ACCOUNT]=docValue[e_field.USER.ACCOUNT]
    internalValue[e_field.ADMIN_USER.LAST_ACCOUNT_UPDATE_DATE]=Date.now()
    internalValue[e_field.ADMIN_USER.LAST_SIGN_IN_DATE]=Date.now()
// console.log(`internalValue====>   ${JSON.stringify(internalValue)}`)
    // console.log(`internalValue[e_field.USER.LAST_ACCOUNT_UPDATE_DATE]====>   ${JSON.stringify(internalValue[e_field.USER.LAST_ACCOUNT_UPDATE_DATE])}`)
    /*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           */
    // console.log(`internalValue =======> ${JSON.stringify(internalValue)}`)
    // console.log(`collInputRule =======> ${JSON.stringify(inputRule[e_coll.USER])}`)
    // console.log(`collInternalRule =======> ${JSON.stringify(internalInputRule[e_coll.USER])}`)
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
    /*******************************************************************************************/
    /******************          compound field value unique check                  ************/
    /*******************************************************************************************/
    if(undefined!==docValue){
        let compoundFiledValueUniqueCheckAdditionalCheckCondition
        await controllerInputValueLogicCheck.ifCompoundFiledValueUnique_returnExistRecord_async({
            collName:collName,
            docValue:docValue,
            additionalCheckCondition:compoundFiledValueUniqueCheckAdditionalCheckCondition,
        })
    }


    // console.log(`docValue ${JSON.stringify(docValue)}`)
    //用户插入 db
    let userCreateTmpResult= await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.admin_user,value:docValue})


    // console.log(`user created  ==========> ${JSON.stringify(userCreateTmpResult)}`)

    //对关联表sugar进行insert操作
    let sugarValue={userId:userCreateTmpResult._id,sugar:sugar}
    // console.log(`sugarValue ${JSON.stringify(sugarValue)}`)
    await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.admin_sugar,value:sugarValue})
    // console.log(`tmpResult is ${JSON.stringify(tmpResult)}`)



// return false
    //最终置user['docStatus']为DONE，且设置lastSignInDate
    let createdRecord=await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.admin_user,id:userCreateTmpResult._id,updateFieldsValue:{'docStatus':e_docStatus.DONE,'lastSignInDate':Date.now()}})
    /*    if(tmpResult.rc>0){
     return Promise.reject(tmpResult)
     }*/

    return Promise.resolve(createdRecord.toObject())
}
module.exports={
    createUser_async,
}