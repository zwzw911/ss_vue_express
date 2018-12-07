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
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')

/********************  rule   ********************/
const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule
const browserInputRule=require('../../../constant/inputRule/browserInputRule').browserInputRule



const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共常量   ******************/
const mongoEnum=server_common_file_require.mongoEnum
const e_docStatus=mongoEnum.DocStatus.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB
const e_adminUserType=mongoEnum.AdminUserType.DB
const e_allUserType=mongoEnum.AllUserType.DB

const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const e_hashType=nodeRuntimeEnum.HashType
const e_inputValueLogicCheckStep=nodeRuntimeEnum.InputValueLogicCheckStep

const nodeEnum=server_common_file_require.nodeEnum
const e_part=nodeEnum.ValidatePart
const e_env=nodeEnum.Env

/**************  公共函数   ******************/
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const arr=server_common_file_require.array
const crypt=server_common_file_require.crypt
const controllerInputValueLogicCheck=server_common_file_require.controllerInputValueLogicCheck
/*************** 配置信息 *********************/
const currentEnv=server_common_file_require.appSetting.currentEnv
const miscConfiguration=server_common_file_require.globalConfiguration.misc
const maxNumber=server_common_file_require.globalConfiguration.maxNumber
const fkConfig=server_common_file_require.fkConfig

/*
 * 更新用户资料
 * 1. 需要对比req中的userId和session中的id是否一致
 * */
async function updateUser_async({req,applyRange}){
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority}=userInfo
    let docValue=req.body.values[e_part.RECORD_INFO]
    let recordId=req.body.values[e_part.RECORD_ID] //有权限的用户可以更新其他人的信息
    /**********************************************/
    /***********    用户类型检测    **************/
    /*********************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.ADMIN_NORMAL,e_allUserType.ADMIN_ROOT]})
    /**********************************************/
    /******    当前用户是否有创建用户的权限   ****/
    /*********************************************/
    // ap.wrn('userPriority',userPriority)
    // ap.wrn('[e_adminPriorityType.UPDATE_ADMIN_USER]',[e_adminPriorityType.UPDATE_ADMIN_USER])
    // ap.wrn('docValue[e_field.ADMIN_USER.USER_PRIORITY]',docValue[e_field.ADMIN_USER.USER_PRIORITY])
    let hasCreatePriority=await controllerChecker.ifAdminUserHasExpectedPriority_async({userPriority:userPriority,arr_expectedPriority:[e_adminPriorityType.UPDATE_ADMIN_USER]})
    if(false===hasCreatePriority){
        return Promise.reject(controllerError.update.currentUserHasNotPriorityToUpdateUser)
    }
    /**********************************************/
    /********  删除null/undefined的字段  *********/
    /*********************************************/
    dataConvert.constructUpdateCriteria(docValue)

/*    /!************************************************!/
    /!******   传入的敏感数据（objectId）解密   ******!/
    /!************************************************!/
    // controllerHelper.decryptRecordValue({record:docValue,collName:collName})
    recordId=crypt.encryptSingleValue({fieldValue:recordId})*/

    /*              如果是root，则只有root可以修改自己（specific）              */
    let userToBeUpdate=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.admin_user,id:recordId})
    // console.log(`userToBeUpdate=========>${JSON.stringify(userToBeUpdate)}`)
    if(e_adminUserType.ADMIN_ROOT===userToBeUpdate[e_field.ADMIN_USER.USER_TYPE]){
        if(userToBeUpdate['_id']!==userId){
            return Promise.reject(controllerError.update.onlyRootCanUpdateRoot)
        }
    }
    // ap.wrn('bdfore call runc')
    /************************************************/
    /*** CALL FUNCTION:inputValueLogicValidCheck ****/
    /************************************************/
    let commonParam={docValue:docValue,userId:userId,collName:collName}
    let stepParam={
        [e_inputValueLogicCheckStep.FK_EXIST_AND_PRIORITY]:{flag:true,optionalParam:undefined},
        [e_inputValueLogicCheckStep.ENUM_DUPLICATE]:{flag:true,optionalParam:undefined},
        //object：coll中，对单个字段进行unique检测，需要的额外查询条件
        //在注册完毕，且不是当前要更新的用户
        [e_inputValueLogicCheckStep.SINGLE_FIELD_VALUE_UNIQUE]:{flag:true,optionalParam:{singleValueUniqueCheckAdditionalCondition:{[e_field.ADMIN_USER.DOC_STATUS]:e_docStatus.DONE,'_id':{'$nin':[recordId]}}}},
        //数组，元素是字段名。默认对所有dataType===string的字段进行XSS检测，但是可以通过此变量，只选择部分字段
        [e_inputValueLogicCheckStep.XSS]:{flag:true,optionalParam:{expectedXSSFields:undefined}},
        //object，对compoundField进行unique检测需要的额外条件，key从model->mongo->compound_unique_field_config.js中获得
        //在internalValue之后执行
        // [e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]:{flag:true,optionalParam:{compoundFiledValueUniqueCheckAdditionalCheckCondition:undefined}},
        //Object，配置resourceCheck的一些参数,{requiredResource,resourceProfileRange,userId,containerId}
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:false,optionalParam:{resourceUsageOption:undefined}},
    }

    await controllerInputValueLogicCheck.inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})
    // ap.wrn('after call runc')
    /*              检测enum+array的字段是否有重复值       */
    // console.log(`browserInputRule[collName]==========> ${JSON.stringify(browserInputRule[collName])}`)
    // console.log(`docValue==========> ${JSON.stringify(docValue)}`)
    // console.log(`docValue ==========> ${JSON.stringify(docValue)}`)
    // console.log(`collName ==========> ${JSON.stringify(collName)}`)
    // console.log(`browserInputRule[collName] ==========> ${JSON.stringify(browserInputRule[collName])}`)
/*    tmpResult=controllerChecker.ifEnumHasDuplicateValue({collValue:docValue,collRule:browserInputRule[collName]})
    // console.log(`duplicate check result ==========> ${JSON.stringify(tmpResult)}`)
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }*/
    /*******************************************************************************************/
    /*                                       特定字段的处理（检查）                            */
    /*******************************************************************************************/
    //更新的用户的权限必须来自当前login用户的权限（是login用户权限的子集）
    // console.log(`update admin======>parent pri ${JSON.stringify(userPriority)}`)
    // console.log(`update admin======>child pri ${JSON.stringify(docValue[e_field.ADMIN_USER.USER_PRIORITY])}`)
    if(undefined!==docValue[e_field.ADMIN_USER.USER_PRIORITY]){
        //权限在预订范围内

        if(false===arr.ifArrayEleContainInArray({expectedArray:userPriority,toBeCheckArray:docValue[e_field.ADMIN_USER.USER_PRIORITY]})){
            return Promise.reject(controllerError.update.updatePriorityNotInheritedFromParent)
        }
        //权限不能重复(权限为enum。重复检测已经包含在inputValueLogicValidCheck_async中)
/*        if(false===arr.ifArrayHasDuplicate(docValue[e_field.ADMIN_USER.USER_PRIORITY])){
            return Promise.reject(controllerError.updateUserPriorityCantDuplicate)
        }*/
    }



    /**********************************************/
    /********  删除值不变的字段（可选）  *********/
    /*********************************************/
    //查找对应的记录（docStatus必须是done，且不为删除）
    // let condition={_id:userId,docStatus:e_docStatus.DONE,dDate:{$exists:false}}
    tmpResult=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.admin_user,id:recordId})
    if(null===tmpResult){return Promise.reject(controllerError.update.userNotExist)}
    let originUserInfo=tmpResult
    //如果传入了password，hash后覆盖原始值------->password单独API处理
/*    if(e_field.ADMIN_USER.PASSWORD in docValue){
        let sugarTmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.admin_sugar,condition:{ userId:originUserInfo.id}})
        if(null===sugarTmpResult){
            return Promise.reject(controllerError.userNoMatchSugar)
        }
        // console.log(`sugarTmpResult=====> ${JSON.stringify(sugarTmpResult)}`)
        let sugar=sugarTmpResult[0]['sugar']
//console.log(`sugar=====> ${JSON.stringify(sugar)}`)
//         console.log(`password value =====> ${JSON.stringify(docValue[e_field.USER.PASSWORD])}`)
//         console.log(`mix value =====> ${docValue[e_field.USER.PASSWORD]}${sugar}`)
        let hashPasswordTmpResult=hash(`${docValue[e_field.ADMIN_USER.PASSWORD]}${sugar}`,e_hashType.SHA512)
        if(hashPasswordTmpResult.rc>0){
            return Promise.reject(hashPasswordTmpResult)
        }
        // console.log(`hash password is ====>${hashPassword}`)
        docValue[e_field.ADMIN_USER.PASSWORD]=hashPasswordTmpResult.msg
        // console.log(` after hash password====> ${JSON.stringify(docValue)}`)
    }*/
    // console.log(`updateUser after compare with origin value ${JSON.stringify(docValue)}`)
    // console.log(`originUserInfo value ${JSON.stringify(originUserInfo)}`)
    for(let singleFieldName in docValue){
        if(docValue[singleFieldName]===originUserInfo[singleFieldName]){
            delete docValue[singleFieldName]
        }
    }
    if(0===Object.keys(docValue).length){
        return {rc:0}
    }



    /*              如果是更新account，需要判断用户更改账号的次数达到了最大值（防止用户无限制更改账号）
     1. 检测account是否存在usedAccount中，存在，不做任何操作
     2. 如果不存在，usedAccount的长度是否达到最大，达到最大，将第一个元素删除，并将old的account push入数组
     3.
     */
    if(true===e_field.ADMIN_USER.ACCOUNT in docValue){
        // console.log(`USED_ACCOUNT CHECK IN`)
        // console.log(`originUserInfo=======》${JSON.stringify(originUserInfo)}`)
        // console.log(`docValue=======》${JSON.stringify(docValue)}`)
        let originalUsedAccount=originUserInfo[e_field.ADMIN_USER.USED_ACCOUNT]
        let toBeUpdateAccountValue=docValue[e_field.ADMIN_USER.ACCOUNT]
        // console.log(`originalUsedAccount=======》${JSON.stringify(originalUsedAccount)}`)
        // console.log(`toBeUpdateAccountValue=======》${JSON.stringify(toBeUpdateAccountValue)}`)
        //要更新的account没有在历史记录中
        if(-1===originalUsedAccount.indexOf(toBeUpdateAccountValue)){
            //检测历史记录的长度
            while (originalUsedAccount.length>=maxNumber.user.maxUsedAccountNum){
                originalUsedAccount.shift()
            }
            // console.log(`=======>not used`)
            //检查更改账号的间隔
            if(e_env.PROD===currentEnv){
                let duration=(Date.now()-originUserInfo[e_field.ADMIN_USER.LAST_ACCOUNT_UPDATE_DATE])/1000/60
                // console.log(`duration=======>${duration}`)
                if(duration<miscConfiguration.user.accountMinimumChangeDurationInHours){
                    return Promise.reject(controllerError.accountCantChange)
                }
            }

            originalUsedAccount.push(toBeUpdateAccountValue)
            // console.log(`originalUsedAccount=======>${JSON.stringify(originalUsedAccount)}`)
            docValue[e_field.ADMIN_USER.USED_ACCOUNT]=originalUsedAccount
            // console.log(`docValue=======>${JSON.stringify(docValue)}`)
            //添加最近一次更改账号的时间
            docValue[e_field.ADMIN_USER.LAST_ACCOUNT_UPDATE_DATE]=Date.now()
            // console.log(`docValue=======>not used`)
        }

        // console.log(`.USER.USED_ACCOUNT======>${JSON.stringify(docValue)}`)
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


    /*    /!*              如果有更改account，需要几率下来         *!/
     if(undefined!==docValue[e_field.USER.ACCOUNT]){

     }*/

    await common_operation_model.update_returnRecord_async({dbModel:e_dbModel[e_coll.ADMIN_USER],id:userId,values:docValue})
    return Promise.resolve({rc:0})

}

module.exports={
    updateUser_async,
}