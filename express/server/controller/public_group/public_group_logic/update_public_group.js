/**
 * Created by ada on 2017/9/1.
 * 为了保持logic的简洁性，此update只对群的名称和joinRule进行修改（admin和member的修改另起炉灶）
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)

/**************  controller相关常量  ****************/
const controller_setting=require('../public_group_setting/public_group_setting').setting
const controllerError=require('../public_group_setting/public_group_controllerError').controllerError

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

/**     update只能处理name和joinRule，member通过join_public_group处理，adminId通过其他函数处理  **/
async function updatePublicGroup_async({req,applyRange}){
    // console.log(`updateUser_async in`)
    // ap.print('expectedPart',expectedPart)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    /*************************************************/
    /************      define variant     ***********/
    /************************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let convertedNoSql //为editSubField设置
    let recordInfoNotChange=false,editSubFieldValueNotChange=false //检测是否需要做update
    // console.log(`req============>${JSON.stringify(req)}`)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    // console.log(`userInfo============>${JSON.stringify(userInfo)}`)
    // let {docValue,recordId,subFieldValue}=controllerHelper.getPartValue({req:req,arr_expectedPart:expectedPart})
    let docValue=req.body.values[e_part.RECORD_INFO]
    let recordId=req.body.values[e_part.RECORD_ID]
    // let docValue=req.body.values[e_part.RECORD_INFO]
    // let recordId=req.body.values[e_part.RECORD_ID]
    // console.log(`docValue============>${JSON.stringify(docValue)}`)
    // console.log(`recordId============>${JSON.stringify(recordId)}`)
    /*******************************************************************************************/
    /*                                     editSubField                                       */
    /*******************************************************************************************/

    /************************************************/
    /*****************  用户类型检测     ************/
    /************************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})

    /**********************************************/
    /********  删除undefined/null字段  ***********/
    /*********************************************/
    dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])

/*    /!************************************************!/
    /!*****************  特殊处理(只能处理name和joinRule)     ************!/
    /!************************************************!/
    if(false===array.ifArrayEleAllInSpecificArray({sourceArray:Object.keys(docValue),specificArray:[e_field.PUBLIC_GROUP.NAME,e_field.PUBLIC_GROUP.JOIN_IN_RULE]})){
        return Promise.reject(controllerError.update)
    }*/

    /**********************************************/
    /***********    用户权限检测    **************/
    /*********************************************/
    //当前用户必须是public_group的admin，且public_group未被删除
    let originalDoc
    if(userType===e_allUserType.USER_NORMAL){
        originalDoc=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
            dbModel:e_dbModel.public_group,
            recordId:recordId,
            ownerFieldsName:[e_field.PUBLIC_GROUP.ADMINS_ID],
            userId:userId,
            additionalCondition:{'dDate':{'$exists':false}},
        })
        if(false===originalDoc){
            return Promise.reject(controllerError.update.notUserGroupAdminCantUpdate)
        }
    }
    /**********************************************/
    /*********    是否未做任何更改    ************/
    /*********************************************/
    controllerHelper.deleteNotChangedValue({inputValue:docValue,originalValue:originalDoc})
    //如果删除完 值没有变化 和 不能更改的字段后，docValue为空，则无需任何修改，直接返回0
    if(0===Object.keys(docValue).length){
        return {rc:0}
    }

    /************************************************/
    /*** CALL FUNCTION:inputValueLogicValidCheck ****/
    /************************************************/
    let commonParam={docValue:docValue,userId:userId,collName:collName}
    // ap.inf('commonParam',commonParam)
    let stepParam={
        /********  ********/
        [e_inputValueLogicCheckStep.FK_EXIST_AND_PRIORITY]:{flag:true,optionalParam:undefined},
        [e_inputValueLogicCheckStep.ENUM_DUPLICATE]:{flag:true,optionalParam:undefined},
        //object：coll中，对单个字段进行unique检测，需要的额外查询条件
        [e_inputValueLogicCheckStep.SINGLE_FIELD_VALUE_UNIQUE]:{flag:true,optionalParam:{singleValueUniqueCheckAdditionalCondition:undefined}},
        //数组，元素是字段名。默认对所有dataType===string的字段进行XSS检测，但是可以通过此变量，只选择部分字段
        [e_inputValueLogicCheckStep.XSS]:{flag:true,optionalParam:{expectedXSSFields:undefined}},
        //object，对compoundField进行unique检测需要的额外条件，key从model->mongo->compound_unique_field_config.js中获得
        //[e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]:{flag:true,optionalParam:{compoundFiledValueUniqueCheckAdditionalCheckCondition:undefined}},
        //Object，配置resourceCheck的一些参数,{requiredResource,resourceProfileRange,userId,containerId}
        /*****  无需对资源进行检查，因为都是更新操作  ******/
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:false,optionalParam:{resourceUsageOption:{requiredResource:undefined,resourceProfileRange:undefined,userId:undefined,containerId:undefined}}},
    }

    // ap.inf('stepParam',stepParam)
    await controllerInputValueLogicCheck.inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})

    /*********************************************/
    /**********          业务处理        *********/
    /*********************************************/
    let updatedRecord=await businessLogic_async({docValue:docValue,collName:collName,recordId:recordId,applyRange:applyRange})

    /*********************************************/
    /**********      加密 敏感数据       *********/
    /*********************************************/
    controllerHelper.cryptRecordValue({record:updatedRecord,salt:tempSalt,collName:collName})
    /*********************************************/
    /**********      删除指定字段       *********/
    /*********************************************/
    controllerHelper.deleteFieldInRecord({record:updatedRecord,fieldsToBeDeleted:undefined})

    //无需返回更新后记录，只需返回操作结果
    return Promise.resolve({rc:0,msg:updatedRecord})
    // let originalDoc=misc.objectDeepCopy(tmpResult)
    /*******************************************************************************************/
    /*                          检测是否有不合格的update字段(可有可无) (通过applyRange控制)                        */
    /*******************************************************************************************/
    //为了逻辑简单，只对group name和joinRule进行修改
/**    let allowUpdateField=[e_field.PUBLIC_GROUP.NAME,e_field.PUBLIC_GROUP.JOIN_IN_RULE]
    for(let singleAllowUpdateField of allowUpdateField){
        if(-1===allowUpdateField.indexOf(singleAllowUpdateField)){
            return Promise.reject(controllerError.notAllowUpdateField)
        }
    } **/
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
/*    if(undefined!==docValue){
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
    }*/
    // ap.print('value cant be changed done')
    /*******************************************************************************************/
    /*                              edit sub field value check and convert                     */
    /*******************************************************************************************/
    /*if(undefined!==subFieldValue){
        // ap.print('start checkEditSubFieldEleArray_async')
        // ap.print('subFieldValue',subFieldValue)
        //对eleArray中的值进行检测:1.fk是否存在，2. To如果存在，满足数量要求否 3. （额外）其中每个记录，用户是否有权操作
        for(let singleFieldName in subFieldValue){
            let singleSubFieldValue=subFieldValue[singleFieldName] //subFieldValue中，单个字段的值
            // ap.print('singleSubFieldValue',singleSubFieldValue)
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
    }*/

    /*******************************************************************************************/
    /*                              remove not change field                                    */
    /*******************************************************************************************/
    // controllerHelper.deleteNotChangedValue({inputValue:docValue,originalValue:originalDoc})
    /*******************************************************************************************/
    /*                          check field number after delete                                */
    /*******************************************************************************************/
    //如果删除完 值没有变化 和 不能更改的字段后，docValue为空，则无需任何修改，直接返回0
    //如果recordInfo不存在；或者存在，但是删除完未变化的字段后为空
  /**  if(undefined===docValue || 0===Object.keys(docValue).length){
        recordInfoNotChange=true
    }
    //如果editSubFieldValue不存在；或者存在，但是转换后的nosql为空。那么说明editSub不需要做update
    if(undefined===subFieldValue || undefined===convertedNoSql){
        editSubFieldValueNotChange=true
    }
    if(true===recordInfoNotChange && true===editSubFieldValueNotChange){
        return Promise.resolve({rc:0})
    }**/

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
    /*if(undefined!==fkConfig[collName] && undefined!==docValue){
        await controllerChecker.ifFkValueExist_async({docValue:docValue,collFkConfig:fkConfig[collName],collFieldChineseName:e_chineseName[collName]})
    }
    // ap.print('fkexist    check done')
    //自定义外键的检查
    /!*******************************************************************************************!/
    /!*                                  enum unique check(enum in array)                       *!/
    /!*******************************************************************************************!/
    // console.log(`browserInputRule[collName]==========> ${JSON.stringify(browserInputRule[collName])}`)
    // console.log(`docValue==========> ${JSON.stringify(docValue)}`)
    tmpResult=controllerChecker.ifEnumHasDuplicateValue({collValue:docValue,collRule:browserInputRule[collName]})
    // console.log(`duplicate check result ==========> ${JSON.stringify(tmpResult)}`)
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }

    /!*******************************************************************************************!/
    /!*                                       特定字段的处理（检查）                            *!/
    /!*******************************************************************************************!/
    if(undefined!==docValue){
        let XssCheckField=[e_field.PUBLIC_GROUP.NAME]
        await controllerHelper.inputFieldValueXSSCheck({docValue:docValue,collName:collName,expectedXSSCheckField:XssCheckField})

    }

    // ap.print('special check done')
    /!*******************************************************************************************!/
    /!*                                  field value duplicate check                            *!/
    /!*******************************************************************************************!/
    if(undefined!==e_uniqueField[collName] && e_uniqueField[collName].length>0) {
        let additionalCheckCondition
        // additionalCheckCondition={[e_field.ADMIN_USER.DOC_STATUS]:e_docStatus.DONE}
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue,additionalCheckCondition:additionalCheckCondition})
    }*/

    // ap.print('duplicate check done')
    /*******************************************************************************************/
    /*                         添加internal field，然后检查                                    */
    /*******************************************************************************************/



}

/*************************************************************/
/***************   业务处理    *******************************/
/*************************************************************/
async function businessLogic_async({docValue,collName,recordId,applyRange}) {
    /******************************************/
    /**    添加internal field，然后检查     **/
    /******************************************/
    let internalValue={}
    if(e_env.DEV===currentEnv && Object.keys(internalValue).length>0){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInternalRule:internalInputRule[collName],applyRange:applyRange})
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    //因为internalValue只是进行了转换，而不是新增，所以无需ObjectDeepCopy
    if(undefined===docValue){
        docValue=internalValue
    }else{
        Object.assign(docValue,internalValue)
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

/*    /!*******************************************************************************************!/
    /!*                                  db operation                                           *!/
    /!*******************************************************************************************!/
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
    return Promise.resolve({rc:0})*/

    /***         数据库操作(只对name和joinRule操作，其他字段通过其他函数执行)            ***/
    let updatedRecord=await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel[collName],id:recordId,updateFieldsValue:docValue})
    return Promise.resolve(updatedRecord.toObject())
}

module.exports={
    updatePublicGroup_async,
}