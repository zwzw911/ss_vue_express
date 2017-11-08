/**
 * Created by ada on 2017/9/1.
 */
'use strict'
/*                      controller setting                */
const controller_setting=require('../impeach_setting/impeach_setting').setting
const controllerError=require('../impeach_setting/impeach_controllerError').controllerError


/*                      specify: genEnum                */
// const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
// const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
// const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject

/*                      server common                                           */
const server_common_file_require=require('../../../../server_common_file_require')

const nodeEnum=server_common_file_require.nodeEnum
const mongoEnum=server_common_file_require.mongoEnum
const e_impeachAdminAction=mongoEnum.ImpeachAdminAction.DB

const enumValue=require(`../../../constant/genEnum/enumValue`)
// const e_adminPriorityType=mongoEnum.AdminPriorityType.DB
const e_part=nodeEnum.ValidatePart
// const e_env=nodeEnum.Env

/*                      server common：function                                       */
const controllerHelper=server_common_file_require.controllerHelper
// const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
// const misc=server_common_file_require.misc
// const miscConfiguration=server_common_file_require.globalConfiguration.misc
// const maxNumber=server_common_file_require.globalConfiguration.maxNumber
// const fkConfig=server_common_file_require.fkConfig
// const hash=server_common_file_require.crypt.hash

// const currentEnv=server_common_file_require.appSetting.currentEnv
// const e_accountType=server_common_file_require.mongoEnum.AccountType.DB

/*
 * 更新用户资料
 * 1. 需要对比req中的userId和session中的id是否一致
 * */
async function deleteImpeach_async({req:req}){
    // console.log(`deleteImpeach_async in`)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    // console.log(`data.body==============>${JSON.stringify(req.body)}`)
    /*******************************************************************************************/
    /*                                          define variant                                 */
    /*******************************************************************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority}=userInfo
    /*              client数据转换                  */
    let recordId=req.body.values[e_part.RECORD_ID]
    /*******************************************************************************************/
    /*                                       authorization check                               */
    /*******************************************************************************************/
    //作者本身才能删除举报
    let condition={}
    condition['_id']=recordId
    condition[e_field.IMPEACH.CREATOR_ID]=userId
    condition['dDate']={$exists:false}
    // console.log(`condition of delete ==========>${JSON.stringify(condition)}`)
    tmpResult=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel[collName],condition:condition})
    // console.log(`tmpResult ==========>${JSON.stringify(tmpResult)}`)
    if(tmpResult.length!==1){
        return Promise.reject(controllerError.notCreatorCantDeleteImpeach)
    }
    //举报必须没有admin参与，否则无法删除
    condition={}
    condition[e_field.IMPEACH_ACTION.IMPEACH_ID]=recordId
    condition[e_field.IMPEACH_ACTION.ACTION]={'$in':enumValue.ImpeachAdminAction}
    tmpResult=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel[e_coll.IMPEACH_ACTION],condition:condition})
    if(tmpResult.length>0){
        return Promise.reject(controllerError.impeachAlreadyHandledByAdmin)
    }
    /*******************************************************************************************/
    /*                                       state         check                               */
    /*******************************************************************************************/
    //未进入处理流程的impeach才能被删除


    /*******************************************************************************************/
    /*                                  db operation                                           */
    /*******************************************************************************************/
    //未被提交过的impeach会被连同action一起删除（因为为提交的impeach无保存价值）
    //物理删除impeach
    await common_operation_model.findByIdAndRemove_async({dbModel:e_dbModel[collName],id:recordId})
    //物理删除impeach_action
    await common_operation_model.deleteMany_async({dbModel:e_dbModel.impeach_action,condition:{[e_field.IMPEACH_ACTION.IMPEACH_ID]:recordId}})
    return Promise.resolve({rc:0})

}

module.exports={
    deleteImpeach_async,
}