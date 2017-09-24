/**
 * Created by ada on 2017/9/1.
 */
'use strict'

const controllerError=require('../admin_setting/admin_user_controllerError').controllerError

const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
// const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject


const server_common_file_require=require('../../../../server_common_file_require')
const nodeEnum=server_common_file_require.nodeEnum
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const miscConfiguration=server_common_file_require.globalConfiguration.misc
const maxNumber=server_common_file_require.globalConfiguration.maxNumber
const fkConfig=server_common_file_require.fkConfig
const hash=server_common_file_require.crypt.hash

const e_docStatus=server_common_file_require.mongoEnum.DocStatus.DB
const e_hashType=server_common_file_require.nodeRuntimeEnum.HashType
const e_part=server_common_file_require.nodeEnum.ValidatePart
const e_env=nodeEnum.Env

const currentEnv=server_common_file_require.appSetting.currentEnv
// const e_accountType=server_common_file_require.mongoEnum.AccountType.DB

/*
 * 更新用户资料
 * 1. 需要对比req中的userId和session中的id是否一致
 * */
async function updateUser_async(req){
    // console.log(`updateUser_async in`)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    /*                  要更改的记录的owner是否为发出req的用户本身                            */
    let tmpResult,collName=e_coll.USER
// console.log()
    if(undefined===req.session.userId){
        return Promise.reject(controllerError.notLogin)
    }

/*    if(req.session.userId!==userId){
        return Promise.reject(controllerError.cantUpdateOwnProfile)
    }*/
    let userId=req.session.userId
    /*              client数据转换                  */
    let docValue=req.body.values[e_part.RECORD_INFO]
    // console.log(`befreo dataConvert`)
    dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    // console.log(`fkConfig[e_coll.USER] ${JSON.stringify(fkConfig[e_coll.USER])}`)
    dataConvert.constructUpdateCriteria(docValue,fkConfig[e_coll.USER])

    // let tmpResult=await common_operation_model.findById({dbModel:dbModel[e_coll.USER],id:objectId})
    // let userId=tmpResult.msg[e_field.USER.]



    /*              剔除value没有变化的field            */
// console.log(`befreo check ${JSON.stringify(docValue)}`)
    //查找对应的记录（docStatus必须是done）
    let condition={_id:req.session.userId,docStatus:e_docStatus.DONE}
    tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user,condition:condition})
    // console.log(`tmpResult====》 ${JSON.stringify(tmpResult)}`)
    // console.log(`condition====》 ${JSON.stringify(condition)}`)
    // console.log(`null===tmpResult.msg====》 ${JSON.stringify(null===tmpResult.msg)}`)
    if(0===tmpResult.length){return Promise.reject(controllerError.userNotExist)}
    let originUserInfo=tmpResult[0]
    //如果传入了password，hash后覆盖原始值
    if(e_field.USER.PASSWORD in docValue){
        let sugarTmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.sugar,condition:{ userId:originUserInfo.id}})
        if(null===sugarTmpResult){
            return Promise.reject(controllerError.userNoMatchSugar)
        }
        // console.log(`sugarTmpResult=====> ${JSON.stringify(sugarTmpResult)}`)
        let sugar=sugarTmpResult[0]['sugar']
//console.log(`sugar=====> ${JSON.stringify(sugar)}`)
//         console.log(`password value =====> ${JSON.stringify(docValue[e_field.USER.PASSWORD])}`)
//         console.log(`mix value =====> ${docValue[e_field.USER.PASSWORD]}${sugar}`)
        let hashPasswordTmpResult=hash(`${docValue[e_field.USER.PASSWORD]}${sugar}`,e_hashType.SHA256)
        if(hashPasswordTmpResult.rc>0){
            return Promise.reject(hashPasswordTmpResult)
        }
        // console.log(`hash password is ====>${hashPassword}`)
        docValue[e_field.USER.PASSWORD]=hashPasswordTmpResult.msg
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
    /*              如果有unique字段，需要预先检查unique            */
    if(undefined!==e_uniqueField[collName] && e_uniqueField[collName].length>0) {
	    let additionalCheckCondition={[e_field.USER.DOC_STATUS]:e_docStatus.DONE}
        await controllerHelper.ifFiledInDocValueUnique_async({collName: collName, docValue: docValue,additionalCheckCondition:additionalCheckCondition})
    }
    /*if(undefined!==e_uniqueField[e_coll.USER]) {
     for (let singleFieldName in docValue) {
     if (-1 !== e_uniqueField[e_coll.USER].indexOf(singleFieldName)) {
     let ifExist = await helper.ifFieldValueExistInColl_async({
     dbModel: dbModel.user,
     fieldName: singleFieldName,
     fieldValue: docValue[singleFieldName]
     })
     // console.log(`singleFieldName: ${singleFieldName}===fieldValue: ${docValue[singleFieldName]}===ifExist ${ifExist}`)
     if (true === ifExist.msg) {
     return Promise.reject(controllerError[singleFieldName + 'AlreadyExists'])
     }
     }
     }
     }*/

    /*              如果是更新account，需要判断用户更改账号的次数达到了最大值（防止用户无限制更改账号）
     1. 检测account是否存在usedAccount中，存在，不做任何操作
     2. 如果不存在，usedAccount的长度是否达到最大，达到最大，将第一个元素删除，并将old的account push入数组
     3.
     */
    if(true===e_field.USER.ACCOUNT in docValue){
        // console.log(`USED_ACCOUNT CHECK IN`)
        // console.log(`originUserInfo=======》${JSON.stringify(originUserInfo)}`)
        // console.log(`docValue=======》${JSON.stringify(docValue)}`)
        let originalUsedAccount=originUserInfo[e_field.USER.USED_ACCOUNT]
        let toBeUpdateAccountValue=docValue[e_field.USER.ACCOUNT]
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
                let duration=(Date.now()-originUserInfo[e_field.USER.LAST_ACCOUNT_UPDATE_DATE])/1000/60
                // console.log(`duration=======>${duration}`)
                if(duration<miscConfiguration.user.accountMinimumChangeDurationInHours){
                    return Promise.reject(controllerError.accountCantChange)
                }
            }

            originalUsedAccount.push(toBeUpdateAccountValue)
            // console.log(`originalUsedAccount=======>${JSON.stringify(originalUsedAccount)}`)
            docValue[e_field.USER.USED_ACCOUNT]=originalUsedAccount
            // console.log(`docValue=======>${JSON.stringify(docValue)}`)
            //添加最近一次更改账号的时间
            docValue[e_field.USER.LAST_ACCOUNT_UPDATE_DATE]=Date.now()
            // console.log(`docValue=======>not used`)
        }

        // console.log(`.USER.USED_ACCOUNT======>${JSON.stringify(docValue)}`)
    }





    /*    /!*              如果有更改account，需要几率下来         *!/
     if(undefined!==docValue[e_field.USER.ACCOUNT]){

     }*/

    await common_operation_model.update_returnRecord_async({dbModel:e_dbModel[e_coll.USER],id:userId,values:docValue})
    return Promise.resolve({rc:0})

}

module.exports={
    updateUser_async,
}