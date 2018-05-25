/**
 * Created by ada on 2017/9/1.
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)
/**************  controller相关常量  ****************/
const controllerError=require('../user_setting/user_controllerError').controllerError
/***************  数据库相关常量   ****************/
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
// const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject


const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共常量   ******************/
const nodeEnum=server_common_file_require.nodeEnum
const e_part=nodeEnum.ValidatePart
const e_env=nodeEnum.Env

const mongoEnum=server_common_file_require.mongoEnum
const e_docStatus=mongoEnum.DocStatus.DB

const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const e_hashType=nodeRuntimeEnum.HashType
const e_inputValueLogicCheckStep=nodeRuntimeEnum.InputValueLogicCheckStep
/**************  公共函数   ******************/
const inputValueLogicValidCheck_async=server_common_file_require.controllerInputValueLogicCheck.inputValueLogicValidCheck_async
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const hash=server_common_file_require.crypt.hash
/*************** 配置信息 *********************/
const maxNumber=server_common_file_require.globalConfiguration.maxNumber
const fkConfig=server_common_file_require.fkConfig
const miscConfiguration=server_common_file_require.globalConfiguration.misc
const currentEnv=server_common_file_require.appSetting.currentEnv
// const e_accountType=server_common_file_require.mongoEnum.AccountType.DB

/*
 * 更新用户资料
 * 1. 需要对比req中的userId和session中的id是否一致
 * */
async function updateUser_async({req}){
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult,collName=e_coll.USER
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    let docValue=req.body.values[e_part.RECORD_INFO]
    /********************************************************/
    /***  剔除需要通过单独函数来update的字段（password） ***/
    /********************************************************/
    delete docValue[e_field.USER.PASSWORD]
    delete docValue[e_field.USER.PHOTO_DATA_URL]
    /**********************************************/
    /********  删除null/undefined的字段  *********/
    /*********************************************/
    dataConvert.constructUpdateCriteria(docValue)

    // let tmpResult=await common_operation_model.findById({dbModel:dbModel[e_coll.USER],id:objectId})
    // let userId=tmpResult.msg[e_field.USER.]




    /**********************************************/
    /********  删除值不变的字段（可选）  *********/
    /*********************************************/
    //查找对应的记录（docStatus必须是done且未被删除）
    // let condition={_id:userId,docStatus:e_docStatus.DONE,dDate:{$exists:false}}
    tmpResult=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.user,id:userId})
    if(null===tmpResult){return Promise.reject(controllerError.userNotExist)}
    let originUserInfo=tmpResult
    for(let singleFieldName in docValue){
        if(docValue[singleFieldName]===originUserInfo[singleFieldName]){
            delete docValue[singleFieldName]
        }
    }
    if(0===Object.keys(docValue).length){
        return {rc:0}
    }

    let commonParam={docValue:docValue,userId:userId,collName:collName}
    let stepParam={
        [e_inputValueLogicCheckStep.FK_EXIST_AND_PRIORITY]:{flag:true,optionalParam:undefined},
        [e_inputValueLogicCheckStep.ENUM_DUPLICATE]:{flag:true,optionalParam:undefined},
        //object：coll中，对单个字段进行unique检测，需要的额外查询条件
        //在注册完毕，且不是自己的用户中查找，是否有重复的字段值
        [e_inputValueLogicCheckStep.SINGLE_FIELD_VALUE_UNIQUE]:{flag:true,optionalParam:{singleValueUniqueCheckAdditionalCondition:{[e_field.USER.DOC_STATUS]:e_docStatus.DONE,[e_field.USER.ID]:{'$not':userId}}}},
        //数组，元素是字段名。默认对所有dataType===string的字段进行XSS检测，但是可以通过此变量，只选择部分字段
        [e_inputValueLogicCheckStep.XSS]:{flag:true,optionalParam:{expectedXSSFields:{optionalParam:undefined}}},
        //object，对compoundField进行unique检测需要的额外条件，key从model->mongo->compound_unique_field_config.js中获得
        [e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]:{flag:true,optionalParam:{compoundFiledValueUniqueCheckAdditionalCheckCondition:undefined}},
        //Object，配置resourceCheck的一些参数,{requiredResource,resourceProfileRange,userId,containerId}
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:false,optionalParam:{resourceUsageOption:undefined}},
    }
    /*******************************************************************************************/
    /******************     CALL FUNCTION:inputValueLogicValidCheck        *********************/
    /*******************************************************************************************/
    await inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})
    /*              如果有unique字段，需要预先检查unique            */
/*    if(undefined!==e_uniqueField[collName] && e_uniqueField[collName].length>0) {

	    let additionalCheckCondition={[e_field.USER.DOC_STATUS]:e_docStatus.DONE,[e_field.USER.ID]:{'$not':userId}}
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue,additionalCheckCondition:additionalCheckCondition})
    }*/
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