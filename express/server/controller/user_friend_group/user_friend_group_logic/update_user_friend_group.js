/**
 * Created by ada on 2017/9/1.
 */
'use strict'
const ap=require('awesomeprint')
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
const globalConfiguration=server_common_file_require.globalConfiguration

async function updateUserFriendGroup_async({req,expectedPart}){
    // console.log(`updateUser_async in`)
    // ap.print('expectedPart',expectedPart)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    /*******************************************************************************************/
    /*                                          define variant                                 */
    /*******************************************************************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let convertedNoSql //为editSubField设置
    let recordInfoNotChange=false,editSubFieldValueNotChange=false //检测是否需要做update
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
    if(undefined!==docValue){
        dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])
    }
    // console.log(`docValue after constructUpdateCriteria============>${JSON.stringify(docValue)}`)

    /*******************************************************************************************/
    /*                                       authorization check                               */
    /*******************************************************************************************/
    //当前用户必须是user_group的创建人，且user_group未被删除
    tmpResult=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({dbModel:e_dbModel.user_friend_group,recordId:recordId,ownerFieldName:e_field.USER_FRIEND_GROUP.OWNER_USER_ID,userId:userId,additionalCondition:undefined})
    if(false===tmpResult){
        return Promise.reject(controllerError.notUserGroupOwnerCantUpdate)
    }
    let originalDoc=misc.objectDeepCopy(tmpResult)
   /* /!*******************************************************************************************!/
    /!*                          delete field cant be update from client                        *!/
    /!*******************************************************************************************!/
    //以下字段，CREATE是client输入，但是update时候，无法更改，所以不能存在
    let forbidUpdateFields=[]
    for(let singleForbidUpdateField of forbidUpdateFields){
        if(undefined!==docValue && undefined!== docValue[singleForbidUpdateField]){
            return Promise.reject(controllerError.forbidUpdateFieldExist(singleForbidUpdateField))
        }
        if(undefined!==subFieldValue && undefined!== subFieldValue[singleForbidUpdateField]){
            return Promise.reject(controllerError.forbidUpdateFieldExist(singleForbidUpdateField))
        }
    }*/
    /*******************************************************************************************/
    /*                 check non-require, but mandatory field for update                       */
    /*******************************************************************************************/
    //以下字段，虽然定义是非required，但是在update的时候必须存在
/*    let mandatoryUpdateFields=[e_field.ADD_FRIEND.STATUS]
    for(let singleMandatoryUpdateField of mandatoryUpdateFields){
        if(undefined=== docValue[singleMandatoryUpdateField]){
            return Promise.reject(controllerError.mandatoryFieldNotExist)
        }
    }*/
    /*******************************************************************************************/
    /*                             value cant be changed                                       */
    /*******************************************************************************************/
    if(undefined!==docValue){
        let defaultGroupName=globalConfiguration.userGroupFriend.defaultGroupName.enumFormat
        let notAllowChangeField={
            [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:[defaultGroupName.MyFriend,defaultGroupName.BlackList]
        }
        for(let singleNotAllowChangeField in notAllowChangeField){
            //如果要更改的字段处于notAllowChangeField中，且有值，其值位是默认值
            if(undefined!==originalDoc[singleNotAllowChangeField] && -1!==notAllowChangeField[singleNotAllowChangeField].indexOf(originalDoc[singleNotAllowChangeField])){
                return Promise.reject(controllerError.notAllowUpdateDefaultRecord)
            }
        }
    }
    // ap.print('value cant be changed done')
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
    // ap.print('fkexist    check done1')
    /*******************************************************************************************/
    /*                              remove not change field                                    */
    /*******************************************************************************************/
    controllerHelper.deleteNotChangedValue({inputValue:docValue,originalValue:originalDoc})
    /*******************************************************************************************/
    /*                          check field number after delete                                */
    /*******************************************************************************************/
    //如果删除完 值没有变化 和 不能更改的字段后，docValue为空，则无需任何修改，直接返回0
    //如果recordInfo不存在；或者存在，但是删除完未变化的字段后为空
    if(undefined===docValue || 0===Object.keys(docValue).length){
        recordInfoNotChange=true
    }
    //如果editSubFieldValue不存在；或者存在，但是转换后的nosql为空。那么说明editSub不需要做update
    if(undefined===subFieldValue || undefined===convertedNoSql){
        editSubFieldValueNotChange=true
    }
    if(true===recordInfoNotChange && true===editSubFieldValueNotChange){
        return Promise.resolve({rc:0})
    }
    // ap.print('not chaget done')
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
    // ap.print('fkConfig[collName]',fkConfig[collName])
    if(undefined!==fkConfig[collName] && undefined!==docValue){
        await controllerChecker.ifFkValueExist_async({docValue:docValue,collFkConfig:fkConfig[collName],collFieldChineseName:e_chineseName[collName]})
    }
    // ap.print('fkexist    check done')
    //自定义外键的检查
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
    /*                                       特定字段的处理（检查）                            */
    /*******************************************************************************************/
    if(undefined!==docValue){
        let XssCheckField=[e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]
        await controllerHelper.inputFieldValueXSSCheck({docValue:docValue,collName:collName,expectedXSSCheckField:XssCheckField})

    }

    // ap.print('special check done')
    /*******************************************************************************************/
    /*                                  field value duplicate check                            */
    /*******************************************************************************************/
    if(undefined!==e_uniqueField[collName] && e_uniqueField[collName].length>0) {
        let additionalCheckCondition
        // additionalCheckCondition={[e_field.ADMIN_USER.DOC_STATUS]:e_docStatus.DONE}
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue,additionalCheckCondition:additionalCheckCondition})
    }

    // ap.print('duplicate check done')
    /*******************************************************************************************/
    /*                         添加internal field，然后检查                                    */
    /*******************************************************************************************/
    let internalValue={}
    if(e_env.DEV===currentEnv && Object.keys(internalValue).length>0){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[collName],collInternalRule:internalInputRule[collName],method:req.body.values[e_part.METHOD]})
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    //因为internalValue只是进行了转换，而不是新增，所以无需ObjectDeepCopy
    if(undefined!==docValue){
        Object.assign(docValue,internalValue)
    }

// ap.print('internal check done')
    /*******************************************************************************************/
    /*                    复合字段unique check（需要internal field完成后）                     */
    /*******************************************************************************************/
    //根据compound_unique_field_config中的设置，进行唯一查询
    //如果不唯一，返回已经存在的记录，以便进一步处理
    if(undefined!==docValue){
        //复合字段的定义中，一个字段不能从client传入，需要手工构造；
        let docValueTobeCheck=Object.assign({},{[e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:userId},docValue)
        let compoundUniqueCheckResult=await controllerChecker.ifCompoundFiledUnique_returnExistRecord_async({collName:collName,docValue:docValueTobeCheck})
        // console.log(`compound field check result===================>${JSON.stringify(compoundUniqueCheckResult)}`)
        //复合字段唯一返回true或者已有的doc
        //有重复值，且重复记录数为1（大于1，已经直接reject）
        if(true!==compoundUniqueCheckResult){
            if(undefined!==docValue[e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]){
                return Promise.reject(controllerError.groupNameAlreadyExistCantUpdate)
            }
        }
    }

    /*******************************************************************************************/
    /*                                  db operation                                           */
    /*******************************************************************************************/
    let promiseTobeExec=[]
    //edit_sub_field对应的nosql，转换成db操作
    if(false===editSubFieldValueNotChange){
        for(let singleRecordId in convertedNoSql){
            promiseTobeExec.push(common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel[collName],id:singleRecordId,updateFieldsValue:convertedNoSql[singleRecordId]}))
        }

    }
    if(false===recordInfoNotChange){
        //普通update操作
        promiseTobeExec.push(common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel[collName],id:recordId,updateFieldsValue:docValue}))
    }


    //同步执行
    await Promise.all(promiseTobeExec)
    return Promise.resolve({rc:0})


}

module.exports={
    updateUserFriendGroup_async,
}