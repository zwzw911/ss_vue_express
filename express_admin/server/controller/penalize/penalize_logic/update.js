/**
 * Created by ada on 2017/9/1.
 */
'use strict'
/*                      controller setting                */
const controller_setting=require('../impeach_state_setting/impeach_state_setting').setting
const controllerError=require('../impeach_state_setting/impeach_state_controllerError').controllerError

/*                      specify: genEnum                */
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
// const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
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

const e_hashType=nodeRuntimeEnum.HashType

const e_accountType=mongoEnum.AccountType.DB
const e_docStatus=mongoEnum.DocStatus.DB
const e_adminUserType=mongoEnum.AdminUserType.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB

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


/*
 * 更新用户资料
 * 1. 需要对比req中的userId和session中的id是否一致
 * */
async function updateUser_async(req){
    // console.log(`updateUser_async in`)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    /*******************************************************************************************/
    /*                                          define variant                                 */
    /*******************************************************************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let userId=userInfo.userId

    let docValue=req.body.values[e_part.RECORD_INFO]
    let userToBeUpdateId=req.body.values[e_part.RECORD_ID]
    /*******************************************************************************************/
    /*                                     参数转为server格式                                  */
    /*******************************************************************************************/

    // console.log(`befreo dataConvert`)
    dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    // console.log(`fkConfig[e_coll.USER] ${JSON.stringify(fkConfig[e_coll.USER])}`)
    dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])
    /*******************************************************************************************/
    /*                                       authorization check                               */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                                       resource check                                    */
    /*******************************************************************************************/



    // let tmpResult=await common_operation_model.findById({dbModel:dbModel[e_coll.USER],id:objectId})
    // let userId=tmpResult.msg[e_field.USER.]
    /*******************************************************************************************/
    /*                                     specific priority check                             */
    /*******************************************************************************************/
    let hasCreatePriority=await controllerChecker.ifAdminUserHasExpectedPriority_async({userId:userId,arr_expectedPriority:[e_adminPriorityType.UPDATE_ADMIN_USER]})
    if(false===hasCreatePriority){
        return Promise.reject(controllerError.currentUserHasNotPriorityToUpdateUser)
    }
    /*              如果是root，则只有root可以修改自己（specific）              */
    let userToBeUpdate=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.admin_user,id:userToBeUpdateId})
    if(e_adminUserType.ROOT===userToBeUpdate[e_field.ADMIN_USER.USER_TYPE]){
        if(userToBeUpdate['_id']!==userId){
            return Promise.reject(controllerError.onlyRootCanUpdateRoot)
        }

    }
    /*******************************************************************************************/
    /*                                    fk value是否存在                                     */
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


    /*******************************************************************************************/
    /*                                  删除value重复的field                                   */
    /*******************************************************************************************/
// console.log(`befreo check ${JSON.stringify(docValue)}`)
    //查找对应的记录（docStatus必须是done，且不为删除）
    let condition={_id:userId,docStatus:e_docStatus.DONE,dDate:{$exists:false}}
    tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.admin_user,condition:condition})
    // console.log(`tmpResult====》 ${JSON.stringify(tmpResult)}`)
    // console.log(`condition====》 ${JSON.stringify(condition)}`)
    // console.log(`null===tmpResult.msg====》 ${JSON.stringify(null===tmpResult.msg)}`)
    if(0===tmpResult.length){return Promise.reject(controllerError.userNotExist)}
    let originUserInfo=tmpResult[0]
    //如果传入了password，hash后覆盖原始值
    if(e_field.ADMIN_USER.PASSWORD in docValue){
        let sugarTmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.admin_sugar,condition:{ userId:originUserInfo.id}})
        if(null===sugarTmpResult){
            return Promise.reject(controllerError.userNoMatchSugar)
        }
        // console.log(`sugarTmpResult=====> ${JSON.stringify(sugarTmpResult)}`)
        let sugar=sugarTmpResult[0]['sugar']
//console.log(`sugar=====> ${JSON.stringify(sugar)}`)
//         console.log(`password value =====> ${JSON.stringify(docValue[e_field.USER.PASSWORD])}`)
//         console.log(`mix value =====> ${docValue[e_field.USER.PASSWORD]}${sugar}`)
        let hashPasswordTmpResult=hash(`${docValue[e_field.ADMIN_USER.PASSWORD]}${sugar}`,e_hashType.SHA256)
        if(hashPasswordTmpResult.rc>0){
            return Promise.reject(hashPasswordTmpResult)
        }
        // console.log(`hash password is ====>${hashPassword}`)
        docValue[e_field.ADMIN_USER.PASSWORD]=hashPasswordTmpResult.msg
        // console.log(` after hash password====> ${JSON.stringify(docValue)}`)

    }
    // console.log(`updateUser after compare with origin value ${JSON.stringify(docValue)}`)
    // console.log(`originUserInfo value ${JSON.stringify(originUserInfo)}`)
    for(let singleFieldName in docValue){
        if(docValue[singleFieldName]===originUserInfo[singleFieldName]){
            delete docValue[singleFieldName]
        }
    }

    // console.log(`updateUser after compare with origin value ${JSON.stringify(docValue)}`)


    if(0===Object.keys(docValue).length){
        return {rc:0}
    }
    // console.log(`after check =========>${JSON.stringify(docValue)}`)
    // console.log(`collName =========>${JSON.stringify(collName)}`)
    /*******************************************************************************************/
    /*                                  field value duplicate check                            */
    /*******************************************************************************************/
    if(undefined!==e_uniqueField[collName] && e_uniqueField[collName].length>0) {
	    let additionalCheckCondition={[e_field.ADMIN_USER.DOC_STATUS]:e_docStatus.DONE}
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue,additionalCheckCondition:additionalCheckCondition})
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
    /*                         添加internal field，然后检查                                    */
    /*******************************************************************************************/



    /*    /!*              如果有更改account，需要几率下来         *!/
     if(undefined!==docValue[e_field.USER.ACCOUNT]){

     }*/

    await common_operation_model.update_returnRecord_async({dbModel:e_dbModel[e_coll.ADMIN_USER],id:userId,values:docValue})
    return Promise.resolve({rc:0})

}

module.exports={
    updateUser_async,
}