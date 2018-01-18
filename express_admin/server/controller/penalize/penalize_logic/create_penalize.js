/**
 * Created by ada on 2017/9/1.
 */
'use strict'


/*                      controller setting                */
const controller_setting=require('../penalize_setting/penalize_setting').setting
const controllerError=require('../penalize_setting/penalize_controllerError').controllerError

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

const e_docStatus=mongoEnum.DocStatus.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB
const e_allUserType=mongoEnum.AllUserType.DB

/*                      server common：function                                       */
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc

/*                      server common：other                                       */
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig


//添加内部产生的值（hash password）
//对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）
//对数值逻辑进行判断（外键是否有对应的记录等）
//执行db操作并返回结果
async  function createPenalize_async(req){
    // console.log(` createPenalize_async in`)
    /*******************************************************************************************/
    /*                                          define variant                                 */
    /*******************************************************************************************/
    let tmpResult
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let docValue=req.body.values[e_part.RECORD_INFO]
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority}=userInfo
// console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
// console.log(`userId===> ${JSON.stringify(userId)}`)
    /*******************************************************************************************/
    /*                                     参数转为server格式                                  */
    /*******************************************************************************************/
    //dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    dataConvert.constructCreateCriteria(docValue)
    // console.log(`before delete revoke reson`)
    delete docValue[e_field.ADMIN_PENALIZE.REVOKE_REASON] //创建处罚的时候，必须没有处罚原因
    // console.log(`delete revoke reson`)
    /*******************************************************************************************/
    /*                                       authorization check                               */
    /*******************************************************************************************/
    //检测当前用户是否为adminUser
    await controllerChecker.ifExpectedUserType_async({req:req,arr_expectedUserType:[e_allUserType.ADMIN_ROOT,e_allUserType.ADMIN_NORMAL]})
    //当前adminUser是否有权限实施（create）处罚
    let hasCreatePriority=await controllerChecker.ifAdminUserHasExpectedPriority_async({userPriority:userPriority,arr_expectedPriority:[e_adminPriorityType.PENALIZE_USER]})
    // console.log(`hasCreatePriority===>${JSON.stringify(hasCreatePriority)}`)
    if(false===hasCreatePriority){
        return Promise.reject(controllerError.currentUserHasNotPriorityToCreatePenalize)
    }
    /*******************************************************************************************/
    /*                                  fk value是否存在                                       */
    /*******************************************************************************************/
    // console.log(`docValue===> ${JSON.stringify(docValue)}`)
    // console.log(`fkConfig[collName]===> ${JSON.stringify(fkConfig[collName])}`)
    // console.log(`e_chineseName[collName]===> ${JSON.stringify(e_chineseName[collName])}`)
    await controllerChecker.ifFkValueExist_async({docValue:docValue,collFkConfig:fkConfig[collName],collFieldChineseName:e_chineseName[collName]})
    /*******************************************************************************************/
    /*                            logic priority check                                         */
    /*******************************************************************************************/
    //检查用户valid的处罚记录(处罚的用户，处罚类型)，有的话，直接返回（只能有一个有效记录）
    // valid的条件
/*    let condition={
        // "$or":[{'dDate':{'$exists':false}},{'isExpire':false}],
        "$or":[{[e_field.ADMIN_PENALIZE.DURATION]:0},{'endDate':{'$gt':Date.now()}}],
        //未被删除，同时也未到期或者duration=0（永久未到期），才能视为valid的penalize
        'dDate':{'$exists':false},
        // [e_field.ADMIN_PENALIZE.END_DATE]:{'$lt':Date.now()},
        [e_field.ADMIN_PENALIZE.PUNISHED_ID]:docValue[e_field.ADMIN_PENALIZE.PUNISHED_ID],
        [e_field.ADMIN_PENALIZE.PENALIZE_TYPE]:docValue[e_field.ADMIN_PENALIZE.PENALIZE_TYPE],
        [e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE]:docValue[e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE],
    }*///,,
    // console.log(`docValue+++++++++>${JSON.stringify(docValue)}`)
    tmpResult=await controllerChecker.ifPenalizeOngoing_async({userId:docValue[e_field.ADMIN_PENALIZE.PUNISHED_ID],penalizeType:docValue[e_field.ADMIN_PENALIZE.PENALIZE_TYPE],penalizeSubType:docValue[e_field.ADMIN_PENALIZE.PENALIZE_SUB_TYPE]})
    // console.log(`valid penalize result+++++++++>${JSON.stringify(tmpResult)}`)
    if(true===tmpResult){
        return Promise.reject(controllerError.currentUserHasValidPenalizeRecord)
    }
    /*******************************************************************************************/
    /*                                       resource check                                    */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                                  enum unique check(enum in array)                       */
    /*******************************************************************************************/
    // console.log(`browserInputRule[collName]==========> ${JSON.stringify(browserInputRule[collName])}`)
    // console.log(`docValue==========> ${JSON.stringify(docValue)}`)
    tmpResult=controllerChecker.ifEnumHasDuplicateValue({collValue:docValue,collRule:browserInputRule[collName]})
    // console.log(`duplicate check result ==========> ${JSON.stringify(tmpResult)}`)
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }
// console.log(`createUser_async docValue===> ${JSON.stringify(docValue)}`)

    /*******************************************************************************************/
    /*                 因为name是unique，所以要检查用户名是否存在(unique check)                */
    /*******************************************************************************************/
    if(undefined!==e_uniqueField[collName] &&  e_uniqueField[collName].length>0) {
        let additionalCheckCondition={[e_field.ADMIN_USER.DOC_STATUS]:e_docStatus.DONE}
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue,additionalCheckCondition:additionalCheckCondition})
    }
// console.log(`ifFieldInDocValueUnique_async done===>`)
    /*******************************************************************************************/
    /*                                       特定字段的处理（检查）                            */
    /*******************************************************************************************/
    /*******************************************************************************************/
    /*                         添加internal field，然后检查                                    */
    /*******************************************************************************************/
    // console.log(`before hash is ${JSON.stringify(docValue)}`)
    let internalValue={}
    internalValue[e_field.ADMIN_PENALIZE.CREATOR_ID]=userId
    if(0!==docValue[e_field.ADMIN_PENALIZE.DURATION]){
        internalValue[e_field.ADMIN_PENALIZE.END_DATE]=Date.now()+docValue[e_field.ADMIN_PENALIZE.DURATION]*24*3600*1000
    }
    //处罚100年
    if(0===docValue[e_field.ADMIN_PENALIZE.DURATION]){
        internalValue[e_field.ADMIN_PENALIZE.END_DATE]=Date.now()+docValue[e_field.ADMIN_PENALIZE.DURATION]*36500*24*3600*1000
    }
    if(e_env.DEV===currentEnv){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[collName],collInternalRule:internalInputRule[collName],method:req.body.values[e_part.METHOD]})
        // console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    Object.assign(docValue,internalValue)
    // console.log(`internal check  is ${JSON.stringify(docValue)}`)
    // let currentColl=e_coll.USER_SUGAR
    // console.log(`value to be insert is ${JSON.stringify(docValue)}`)
    // let doc=new dbModel[currentColl](values[e_part.RECORD_INFO])


    // console.log(`docValue ${JSON.stringify(docValue)}`)
    //用户插入 db
    let userCreateTmpResult= await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.admin_penalize,value:docValue})
    // console.log(`user created  ==========> ${JSON.stringify(userCreateTmpResult)}`)
    return Promise.resolve({rc:0,msg:userCreateTmpResult})
}

module.exports={
    createPenalize_async,
}