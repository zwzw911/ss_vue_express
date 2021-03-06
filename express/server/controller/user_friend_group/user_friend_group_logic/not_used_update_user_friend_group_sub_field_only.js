/**
 * Created by ada on 2017/12/22.
 */
'use strict'
/*                      controller setting                */
const controller_setting=require('../user_friend_group_setting/user_friend_group_setting').setting
const controllerError=require('../user_friend_group_setting/user_friend_group_controllerError').controllerError

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
const inputDataRuleType=server_common_file_require.inputDataRuleType

const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart
const e_partValueToVarName=nodeEnum.PartValueToVarName
const e_subField=nodeEnum.SubField

const e_hashType=nodeRuntimeEnum.HashType

const e_accountType=mongoEnum.AccountType.DB
const e_docStatus=mongoEnum.DocStatus.DB
const e_adminUserType=mongoEnum.AdminUserType.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB
const e_allUserType=mongoEnum.AllUserType.DB

const e_serverDataType=inputDataRuleType.ServerDataType
const e_serverRuleType=inputDataRuleType.ServerRuleType

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
const fkConfig=server_common_file_require.fkConfig.fkConfig

async function updateUserFriendGroup_async({req,expectedPart}){
    // console.log(`updateUser_async in`)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    /*******************************************************************************************/
    /*                                          define variant                                 */
    /*******************************************************************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let convertedNoSql //为editSubField设置
    // console.log(`req============>${JSON.stringify(req)}`)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority}=userInfo
    // console.log(`userInfo============>${JSON.stringify(userInfo)}`)
    let {docValue,recordId,subFieldValue}=controllerHelper.getPartValue({req:req,arr_expectedPart:expectedPart})
    // let docValue=req.body.values[e_part.RECORD_INFO]
    // let recordId=req.body.values[e_part.RECORD_ID]
    // console.log(`docValue============>${JSON.stringify(docValue)}`)
    // console.log(`recordId============>${JSON.stringify(recordId)}`)
    /*******************************************************************************************/
    /*                                     editSubField                                       */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                                     用户类型和权限检测                                  */
    /*******************************************************************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})

    /*******************************************************************************************/
    /*                                     参数过滤                                           */
    /*******************************************************************************************/
    // dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])
    // console.log(`docValue after constructUpdateCriteria============>${JSON.stringify(docValue)}`)

    /*******************************************************************************************/
    /*                                       authorization check                               */
    /*******************************************************************************************/
    //当前用户必须是user_group的创建人，且user_group未被删除
    tmpResult=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
        dbModel:e_dbModel.user_friend_group,
        recordId:recordId,
        ownerFieldsName:[e_field.USER_FRIEND_GROUP.OWNER_USER_ID],
        userId:userId,
        additionalCondition:undefined
    })
    if(false===tmpResult){
        return Promise.reject(controllerError.notUserGroupOwnerCantUpdate)
    }
    let originalDoc=misc.objectDeepCopy(tmpResult)
    /*******************************************************************************************/
    /*                          delete field cant be update from client                        */
    /*******************************************************************************************/
    //CREATE是client输入，但是update时候，无法更改，所以需要删除。同时还需要合并editSubField的field值
/*    let notAllowUpdateFields=[]
    if(controller_setting.FIELD_NAME_OF_SUB_FIELD.length>0){
        notAllowUpdateFields=notAllowUpdateFields.concat(controller_setting.FIELD_NAME_OF_SUB_FIELD)
    }
    for(let singleNotAllowUpdateField of notAllowUpdateFields){
        delete docValue[singleNotAllowUpdateField]
    }*/
    /*******************************************************************************************/
    /*                              edit sub field value check and convert                     */
    /*******************************************************************************************/
    // if(undefined!==subFieldValue){
        //对eleArray中的值进行检测:1.fk是否存在，2. To如果存在，满足数量要求否 3. （额外）其中每个记录，用户是否有权操作
        for(let singleFieldName in subFieldValue){
            let singleSubFieldValue=subFieldValue[singleFieldName] //subFieldValue中，单个字段的值
            //检查eleArray的值
            await controllerHelper.checkEditSubFieldEleArray_async({
                singleEditSubFieldValue:singleSubFieldValue,
                eleAdditionalCondition:undefined,
                collName:e_coll.USER_FRIEND_GROUP,
                fieldName:singleFieldName,
                // fkRecordOwnerFieldName:e_field.USER_FRIEND_GROUP.OWNER_USER_ID,
                userId:userId,
                // error:fromToError,
            })
        }
        //转换成nosql
        convertedNoSql=await dataConvert.convertEditSubFieldValueToNoSql({editSubFieldValue:subFieldValue})

        //从convertedNoSql中的key，查询id是否valid(convertedNoSql合并了form/to的id，检查更快)
        //检查from/to的值
        let fromToError={
            fromToRecordIdNotExists:controllerError.fromToRecordIdNotExists,
            notOwnFromToRecordId:controllerError.notOwnFromToRecordId,
        }
        await controllerHelper.checkEditSubFieldFromTo_async({
            convertedNoSql:convertedNoSql,
            fromToAdditionCondition:undefined, //验证from/to的id对应doc是否valid，是否需要额外的条件
            collName:e_coll.USER_FRIEND_GROUP,
            recordOwnerFieldName:e_field.USER_FRIEND_GROUP.OWNER_USER_ID,//验证from/to的id对应doc是否为当前用户所有
            userId:userId,
            error:fromToError,
        })
    // }

    /*******************************************************************************************/
    /*                              remove not change field                                    */
    /*******************************************************************************************/
    // controllerHelper.deleteNotChangedValue({inputValue:docValue,originalValue:originalDoc})
    /*******************************************************************************************/
    /*                          check field number after delete                                */
    /*******************************************************************************************/
    //如果删除完 值没有变化 和 不能更改的字段后，docValue为空，则无需任何修改，直接返回0
    if(undefined===convertedNoSql){
        return {rc:0}
    }
    /*******************************************************************************************/
    /*                                       resource check                                    */
    /*******************************************************************************************/

    // let tmpResult=await common_operation_model.findById({dbModel:dbModel[e_coll.USER],id:objectId})
    // let userId=tmpResult.msg[e_field.USER.]
    /*******************************************************************************************/
    /*                                     specific priority check                             */
    /*******************************************************************************************/

    /*******************************************************************************************/
    /*                                    fk value是否存在                                     */
    /*******************************************************************************************/
    //在fkConfig中定义的外键检查(fkConfig中设置查询条件)
/*    if(undefined!==fkConfig[collName]){
        await controllerChecker.ifFkValueExist_async({docValue:docValue,collFkConfig:fkConfig[collName],collFieldChineseName:e_chineseName[collName]})
    }*/
    //自定义外键的检查
    /*******************************************************************************************/
    /*                                  enum unique check(enum in array)                       */
    /*******************************************************************************************/
    // console.log(`browserInputRule[collName]==========> ${JSON.stringify(browserInputRule[collName])}`)
    // console.log(`docValue==========> ${JSON.stringify(docValue)}`)
/*    tmpResult=controllerChecker.ifEnumHasDuplicateValue({collValue:docValue,collRule:browserInputRule[collName]})
    // console.log(`duplicate check result ==========> ${JSON.stringify(tmpResult)}`)
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }*/

    /*******************************************************************************************/
    /*                                       特定字段的处理（检查）                            */
    /*******************************************************************************************/
   /* let XssCheckField=[e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]
    await controllerHelper.inputFieldValueXSSCheck({docValue:docValue,collName:collName,expectedXSSCheckField:XssCheckField})*/


    /*******************************************************************************************/
    /*                                  field value duplicate check                            */
    /*******************************************************************************************/
/*    if(undefined!==e_uniqueField[collName] && e_uniqueField[collName].length>0) {
        let additionalCheckCondition
        // additionalCheckCondition={[e_field.ADMIN_USER.DOC_STATUS]:e_docStatus.DONE}
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue,additionalCheckCondition:additionalCheckCondition})
    }*/

    /*******************************************************************************************/
    /*                         添加internal field，然后检查                                    */
    /*******************************************************************************************/
/*    let internalValue={}
    if(e_env.DEV===currentEnv && Object.keys(internalValue).length>0){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[collName],collInternalRule:internalInputRule[e_coll.ARTICLE]})
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }*/
    //因为internalValue只是进行了转换，而不是新增，所以无需ObjectDeepCopy
    // Object.assign(docValue,internalValue)
    /*******************************************************************************************/
    /*                                          unique check                                   */
    /*******************************************************************************************/
/*    if(undefined!==e_uniqueField[collName] && e_uniqueField[collName].length>0) {
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue})
        //await controllerHelper.ifFiledInDocValueUnique_async({collName: collName, docValue: docValue,e_uniqueField:e_uniqueField,e_chineseName:e_chineseName})
    }*/
    /*******************************************************************************************/
    /*                    复合字段unique check（需要internal field完成后）                     */
    /*******************************************************************************************/
/*    //根据compound_unique_field_config中的设置，进行唯一查询
    //如果不唯一，返回已经存在的记录，以便进一步处理
    let compoundUniqueCheckResult=await controllerChecker.ifCompoundFiledUnique_returnExistRecord_async({collName:collName,docValue:docValue})
    // console.log(`compound field check result===================>${JSON.stringify(compoundUniqueCheckResult)}`)
    //复合字段唯一返回true或者已有的doc
    //有重复值，且重复记录数为1（大于1，已经直接reject）
    if(true!==compoundUniqueCheckResult){
        if(undefined!==docValue[e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]){
            return Promise.reject(controllerError.groupNameAlreadyExistCantUpdate)
        }

    }*/
    /*******************************************************************************************/
    /*                                  db operation                                           */
    /*******************************************************************************************/
    let promiseTobeExec=[]
    //edit_sub_field对应的nosql，转换成db操作
    if(undefined!==convertedNoSql){
        for(let singleRecordId in convertedNoSql){
            promiseTobeExec.push(common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel[collName],id:singleRecordId,updateFieldsValue:convertedNoSql[singleRecordId]}))
        }

    }
   /* //普通update操作
    promiseTobeExec.push(common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel[collName],id:recordId,updateFieldsValue:docValue}))
*/
    //同步执行
    await Promise.all(promiseTobeExec)
    return Promise.resolve({rc:0})


}

module.exports={
    updateUserFriendGroup_async,
}