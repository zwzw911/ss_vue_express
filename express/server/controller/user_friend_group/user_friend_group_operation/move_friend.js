/**
 * Created by 张伟 on 2018/7/3.
 * 在不同的组间移动朋友
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)
const lodash=require('lodash')
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
const e_subField=nodeEnum.SubField


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

    // ap.wrn('moveFriends_async in')
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
    ap.wrn('subFieldValue',subFieldValue)
    // console.log(`docValue============>${JSON.stringify(docValue)}`)
    // console.log(`recordId============>${JSON.stringify(recordId)}`)
    // ap.wrn('subFieldValue',subFieldValue)
    /************************************************/
    /*****************  用户类型检测     ************/
    /************************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})
    // ap.wrn('ifExpectedUserType_async done')
    // ap.wrn('subFieldValue',subFieldValue)

    /************************************************/
    /*****************  eitSubField检测     ************/
    /************************************************/
    for(let singleFieldName in subFieldValue){
        // if(userType===e_allUserType.USER_NORMAL){
            /**        检查eleArray中数据是否合格        **/
            await controllerHelper.checkEditSubFieldEleArray_async({
                singleEditSubFieldValue:subFieldValue[singleFieldName],
                eleAdditionalCondition:undefined,
                collName:e_coll.USER_FRIEND_GROUP,
                fieldName:singleFieldName,
                // fkRecordOwnerFieldName:e_field.USER_FRIEND_GROUP.OWNER_USER_ID,
                userId:userId,
                // error:fromToError,
            })
        // }
    }

    /************************************************/
    /******   特殊检测 ：eleArray中的元素，  ********/
    /** 是否已经是好友（防止通过只设置to来实现添加好友的功能） *******/
    /************************************************/
    tmpResult=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.user_friend_group,id:subFieldValue[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP][e_subField.FROM]})
    //null由后续代码检测
    //判断是否eleArray中，所有好友都是from记录中的好友
    if(null!==tmpResult){
        let intersection=lodash.intersection(
            JSON.parse(JSON.stringify(tmpResult[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP])),
            subFieldValue[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP][e_subField.ELE_ARRAY])
        if(intersection.length!==subFieldValue[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP][e_subField.ELE_ARRAY].length){
            return Promise.reject(controllerError.moveFriend.cantMoveNonFriend)
        }

    }






    // ap.wrn('checkEditSubFieldEleArray_async done')
    //转换成nosql
    convertedNoSql=await dataConvert.convertEditSubFieldValueToNoSql({editSubFieldValue:subFieldValue})
    // ap.wrn('convertedNoSql',convertedNoSql)
    //从convertedNoSql中的key，查询id是否valid(convertedNoSql合并了form/to的id，检查更快)
    /************************************************/
    /******        authorization check       *******/
    /************************************************/
    //from/to 对应的记录的拥有者是否为当前用户
    let fromToError={
        fromToRecordIdNotExists:controllerError.moveFriend.fromToRecordIdNotExists,
        notOwnFromToRecordId:controllerError.moveFriend.notOwnFromToRecordId,
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

        // ap.wrn('checkEditSubFieldFromTo_async done')
    // }

    // controllerHelper.deleteNotChangedValue({inputValue:docValue,originalValue:originalDoc})
//如果editSubFieldValue不存在；或者存在，但是转换后的nosql为空。那么说明editSub不需要做update
    if(undefined===subFieldValue || undefined===convertedNoSql){
        // editSubFieldValueNotChange=true
        return Promise.resolve({rc:0})
    }
    // if(true===editSubFieldValueNotChange){
    //
    // }
    /**     只需要控制好友总数，每个group中好友数量不限        **/
    /*/!***        数量的判断       **!/
//如果是移动或者添加，判断to对应的recordId中，是否会超出限制
    if(undefined!==subFieldValue[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]){
        let fieldName=[e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]
        if(undefined!==subFieldValue[fieldName][e_subField.ELE_ARRAY] && subFieldValue[fieldName][e_subField.ELE_ARRAY].length>0 && undefined!==subFieldValue[fieldName][e_subField.TO]){
            let optionalParam={
                resourceUsageOption:{
                    requiredResource:{[e_resourceFieldName.USED_NUM]:subFieldValue[fieldName][e_subField.ELE_ARRAY]},
                    resourceProfileRange:[e_resourceRange.MAX_FR,],
                    userId:userId,
                    containerId:subFieldValue[fieldName][e_subField.TO]
                }
            }
            // if(undefined!==stepParam[e_inputValueLogicCheckStep.RESOURCE_USAGE]['optionalParam']){
            let resourceUsageOption=optionalParam['resourceUsageOption']
            // ap.wrn('stepParam[e_inputValueLogicCheckStep.RESOURCE_USAGE][\'optionalParam\'][\'resourceUsageOption\']',stepParam[e_inputValueLogicCheckStep.RESOURCE_USAGE]['optionalParam']['resourceUsageOption'])
            await controllerInputValueLogicCheck.ifEnoughResource_async({
                requiredResource:resourceUsageOption.requiredResource,//{num:xx,sizeInMb;yy,filesAbsPath:[]}
                resourceProfileRange:resourceUsageOption.resourceProfileRange,
                userId:userId,
                containerId:resourceUsageOption.containerId,
                // filesAbsPath:resourceUsageOption.filesAbsPath,
            })
        }
    }*/

    /**         edit_sub_field对应的nosql，转换成db操作        **/
    let promiseTobeExec=[]
    // if(false===editSubFieldValueNotChange){
    for(let singleRecordId in convertedNoSql){
        promiseTobeExec.push(common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel[collName],id:singleRecordId,updateFieldsValue:convertedNoSql[singleRecordId]}))
    }
    // }
    // ap.wrn('promiseTobeExec',promiseTobeExec)
    if(promiseTobeExec.length>0){
        await Promise.all(promiseTobeExec)
    }

    return Promise.resolve({rc:0})
}


module.exports={
    moveFriends_async,
}