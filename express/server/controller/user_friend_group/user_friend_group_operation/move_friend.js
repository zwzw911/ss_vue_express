/**
 * Created by 张伟 on 2018/7/3.
 * 在不同的组间移动朋友
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)

/**************  controller相关常量  ****************/
const controller_setting=require('../user_friend_group_setting/user_friend_group_setting').setting
const controllerError=require('../user_friend_group_setting/user_friend_group_controllerError').controllerError

/***************  数据库相关常量   ****************/
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject

/***************  rule   ****************/
const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule
const browserInputRule=require('../../../constant/inputRule/browserInputRule').browserInputRule



const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共常量   ******************/
const nodeEnum=server_common_file_require.nodeEnum
const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart

const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const e_hashType=nodeRuntimeEnum.HashType
const e_inputValueLogicCheckStep=nodeRuntimeEnum.InputValueLogicCheckStep

const mongoEnum=server_common_file_require.mongoEnum
const e_accountType=mongoEnum.AccountType.DB
const e_docStatus=mongoEnum.DocStatus.DB
const e_articleStatus=mongoEnum.ArticleStatus.DB
const e_adminUserType=mongoEnum.AdminUserType.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB
const e_allUserType=mongoEnum.AllUserType.DB
const e_resourceRange=mongoEnum.ResourceRange.DB
const e_impeachState=mongoEnum.ImpeachState.DB
const e_documentStatus=mongoEnum.DocumentStatus.DB
/**************  公共函数   ******************/
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const controllerInputValueLogicCheck=server_common_file_require.controllerInputValueLogicCheck
const misc=server_common_file_require.misc
const crypt=server_common_file_require.crypt
const array=server_common_file_require.array

/*************** 配置信息 *********************/
const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig
const globalConfiguration=server_common_file_require.globalConfiguration



async function moveFriends_async({req,applyRange}) {
    // console.log(`updateUser_async in`)
    // ap.print('expectedPart',expectedPart)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    /*************************************************/
    /************      define variant     ***********/
    /************************************************/
    let tmpResult, collName = controller_setting.MAIN_HANDLED_COLL_NAME
    let convertedNoSql //为editSubField设置
    let recordInfoNotChange = false, editSubFieldValueNotChange = false //检测是否需要做update
    // console.log(`req============>${JSON.stringify(req)}`)
    let userInfo = await controllerHelper.getLoginUserInfo_async({req: req})
    let {userId, userCollName, userType, userPriority, tempSalt} = userInfo
    // console.log(`userInfo============>${JSON.stringify(userInfo)}`)
    // let {docValue,recordId,subFieldValue}=controllerHelper.getPartValue({req:req,arr_expectedPart:expectedPart})
    // let docValue = req.body.values[e_part.RECORD_INFO]
    // let recordId = req.body.values[e_part.RECORD_ID]
    let subFieldValue = req.body.values[e_part.EDIT_SUB_FIELD]
    // console.log(`docValue============>${JSON.stringify(docValue)}`)
    // console.log(`recordId============>${JSON.stringify(recordId)}`)
})
/*******************************************************************************************/
/*                              edit sub field value check and convert                     */
/*******************************************************************************************/
// ap.print('subFieldValue',subFieldValue)
if(undefined!==subFieldValue){
    // ap.print('start checkEditSubFieldEleArray_async')
    // ap.print('subFieldValue',subFieldValue)
    //对eleArray中的值进行检测:1.fk是否存在，2. To如果存在，满足数量要求否 3. （额外）其中每个记录，用户是否有权操作
    for(let singleFieldName in subFieldValue){
        let singleSubFieldValue=subFieldValue[singleFieldName] //subFieldValue中，单个字段的值
        // ap.print('singleSubFieldValue',singleSubFieldValue)
        // ap.print('singleFieldName',singleFieldName)
        // ap.print('userId',userId)
        //检查eleArray的值
        // try{
        await controllerHelper.checkEditSubFieldEleArray_async({
            singleEditSubFieldValue:singleSubFieldValue,
            eleAdditionalCondition:undefined,
            collName:e_coll.USER_FRIEND_GROUP,
            fieldName:singleFieldName,
            // fkRecordOwnerFieldName:e_field.USER_FRIEND_GROUP.OWNER_USER_ID,
            userId:userId,
            // error:fromToError,
        })
        // }
        // catch(e){
        //     ap('e',e)
        // }

    }
    // {singleEditSubFieldValue,eleAdditionalCondition,collName,fieldName,userId}
    // ap.print('checkEditSubFieldEleArray_async')
    //转换成nosql
    convertedNoSql=await dataConvert.convertEditSubFieldValueToNoSql({editSubFieldValue:subFieldValue})
    // ap.print('convertedNoSql',convertedNoSql)
    //从convertedNoSql中的key，查询id是否valid(convertedNoSql合并了form/to的id，检查更快)
    //检查from/to的值
    let fromToError={
        fromToRecordIdNotExists:controllerError.fromToRecordIdNotExists,
        notOwnFromToRecordId:controllerError.notOwnFromToRecordId,
    }
    // ap.print('checkEditSubFieldFromTo_async in')
    await controllerHelper.checkEditSubFieldFromTo_async({
        convertedNoSql:convertedNoSql,
        fromToAdditionCondition:undefined, //验证from/to的id对应doc是否valid，是否需要额外的条件
        collName:e_coll.USER_FRIEND_GROUP,
        recordOwnerFieldName:e_field.USER_FRIEND_GROUP.OWNER_USER_ID,//验证from/to的id对应doc是否为当前用户所有
        userId:userId,
        error:fromToError,
    })

    // ap.print('checkEditSubFieldFromTo_async')
}

controllerHelper.deleteNotChangedValue({inputValue:docValue,originalValue:originalDoc})
//如果editSubFieldValue不存在；或者存在，但是转换后的nosql为空。那么说明editSub不需要做update
if(undefined===subFieldValue || undefined===convertedNoSql){
    editSubFieldValueNotChange=true
}
if(true===recordInfoNotChange && true===editSubFieldValueNotChange){
    return Promise.resolve({rc:0})
}

//edit_sub_field对应的nosql，转换成db操作
if(false===editSubFieldValueNotChange){
    for(let singleRecordId in convertedNoSql){
        promiseTobeExec.push(common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel[collName],id:singleRecordId,updateFieldsValue:convertedNoSql[singleRecordId]}))
    }

}

module.exports={
    moveFriends_async,
}