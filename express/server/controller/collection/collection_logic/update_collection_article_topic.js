/**
 * Created by ada on 2018/12/21.
 * 只能添加/移动/删除 collection的article或者topic（collection中的文档）
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)

/**************  controller相关常量  ****************/
const controller_setting=require('../collection_setting/collection_setting').setting
const controllerError=require('../collection_setting/collection_controllerError').controllerError

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
const e_resourceFieldName=nodeEnum.ResourceFieldName

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

/**************  公共函数   ******************/
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const controllerInputValueLogicCheck=server_common_file_require.controllerInputValueLogicCheck
const misc=server_common_file_require.misc
const crypt=server_common_file_require.crypt

/*************** 配置信息 *********************/
const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig

async function updateCollectionArticleTopic_async({req,applyRange}){

    /*************************************************/
    /************      define variant     ***********/
    /************************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME
    // console.log(`req============>${JSON.stringify(req)}`)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    // console.log(`userInfo============>${JSON.stringify(userInfo)}`)
    let subFieldValue = req.body.values[e_part.EDIT_SUB_FIELD]
    // console.log(`docValue============>${JSON.stringify(docValue)}`)
    // console.log(`recordId============>${JSON.stringify(recordId)}`)
    /**********************************************/
    /*********    特殊检测        ************/
    /*********************************************/
    //recordInfo只能包含一个到2个字段
/*    if(1>Object.keys(docValue).length || 2<Object.keys(docValue).length){
        return Promise.reject(controllerError.put.onlyUpdateName)
    }*/
 /*   if(undefined===docValue[e_field.COLLECTION.ARTICLES_ID] && ){
        return Promise.reject(controllerError.put.onlyUpdateName)
    }*/

    /************************************************/
    /*****************  用户类型检测     ************/
    /************************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})

    /**********************************************/
    /********  删除undefined/null字段  ***********/
    /*********************************************/
    // dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])
    // console.log(`docValue after constructUpdateCriteria============>${JSON.stringify(docValue)}`)
    /**********************************************/
    /***********    用户权限检测    **************/
    /*********************************************/
    for(let singleFieldName in subFieldValue){
        // if(userType===e_allUserType.USER_NORMAL){
        /**        检查eleArray中数据是否合格        **/
        await controllerHelper.checkEditSubFieldEleArray_async({
            singleEditSubFieldValue:subFieldValue[singleFieldName],
            eleAdditionalCondition:undefined,
            collName:e_coll.COLLECTION,
            fieldName:singleFieldName,
            // fkRecordOwnerFieldName:e_field.USER_FRIEND_GROUP.OWNER_USER_ID,
            userId:userId,
            // error:fromToError,
        })
        // }
    }

    let convertedNoSql=await dataConvert.convertEditSubFieldValueToNoSql({editSubFieldValue:subFieldValue})
    /************************************************/
    /******        authorization check       *******/
    /************************************************/
    //from/to 对应的记录的拥有者是否为当前用户
    let fromToError={
        fromToRecordIdNotExists:controllerError.logic.put.fromToRecordIdNotExists,
        notOwnFromToRecordId:controllerError.logic.put.notOwnFromToRecordId,
    }
    // ap.print('checkEditSubFieldFromTo_async in')
    await controllerHelper.checkEditSubFieldFromTo_async({
        convertedNoSql:convertedNoSql,
        fromToAdditionCondition:undefined, //验证from/to的id对应doc是否valid，是否需要额外的条件
        collName:e_coll.COLLECTION,
        recordOwnerFieldName:e_field.COLLECTION.CREATOR_ID,//验证from/to的id对应doc是否为当前用户所有
        userId:userId,
        error:fromToError,
    })

//如果editSubFieldValue不存在；或者存在，但是转换后的nosql为空。那么说明editSub不需要做update
    if(undefined===subFieldValue || undefined===convertedNoSql){
        // editSubFieldValueNotChange=true
        return Promise.resolve({rc:0})
    }

    /************************************************/
    /******   特殊检测 ：eleArray中的元素，  ********/
    /** 判断eleArray中的文档或者主题，状态是否为finished（new/edit不能收藏） *******/
    /************************************************/
    let condition={}
    if(undefined!==subFieldValue[e_field.COLLECTION.ARTICLES_ID]){
        condition={
            '_id':{'$in':subFieldValue[e_field.COLLECTION.ARTICLES_ID][e_subField.ELE_ARRAY]}
        }
        //读取elearray中所有article
        tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.article,condition:condition})
        //判断是否eleArray中，所有好友都是from记录中的好友
        if(tmpResult.length>0){
            for(let singleArticle of tmpResult){
                if(singleArticle[e_field.ARTICLE.STATUS]!==e_articleStatus.FINISHED){
                    return Promise.reject(controllerError.logic.put.articleStatusNotFinished)
                }
            }

        }
    }
    // ap.wrn('done')
    /**     topic无状态需要进行检查      **/
/*    if(undefined!==subFieldValue[e_field.COLLECTION.TOPICS_ID]){
        condition={
            '_id':{'$in':subFieldValue[e_field.COLLECTION.TOPICS_ID][e_subField.ELE_ARRAY]}
        }
        //读取elearray中所有topic
        tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.topic,condition:condition})
        //判断是否eleArray中，所有好友都是from记录中的好友
        if(tmpResult.length>0){
            for(let singleArticle of tmpResult){
                if(singleArticle[e_field.TOPIC.]!==e_articleStatus.FINISHED){
                    return Promise.reject(controllerError.put.articleStatusNotFinished)
                }
            }

        }
    } */
    /**************************************************************************/
    /**     如果是添加，判断ele_array中，是否已经收藏了      **/
    /**************************************************************************/
    let fieldNames=[e_field.COLLECTION.ARTICLES_ID,e_field.COLLECTION.TOPICS_ID]
    for(let fieldName of fieldNames){
        if(undefined!==subFieldValue[fieldName]){
            if(undefined!==subFieldValue[fieldName][e_subField.TO] && undefined===subFieldValue[fieldName][e_subField.FROM]){
                let condition={
                    [e_field.COLLECTION.CREATOR_ID]:userId,
                    [fieldName]:{$in:subFieldValue[fieldName][e_subField.ELE_ARRAY]},
                    'dDate':{$exists:false},
                }
                // ap.wrn('condition',condition)
                tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.collection,condition:condition})
                // ap.wrn('tmpResult',tmpResult)
                if(tmpResult.length>0){
                    return Promise.reject(controllerError.logic.put.alreadyCollect)
                }
            }

        }
    }


    /**************************************************************************/
    /**     如果是移动或者添加，判断to对应的recordId中，是否会超出限制      **/
    /**************************************************************************/
    if(undefined!==subFieldValue[e_field.COLLECTION.ARTICLES_ID]){
        // ap.wrn('article in')
        let fieldName=e_field.COLLECTION.ARTICLES_ID
        if(undefined!==subFieldValue[fieldName][e_subField.ELE_ARRAY] && subFieldValue[fieldName][e_subField.ELE_ARRAY].length>0 && undefined!==subFieldValue[fieldName][e_subField.TO]){
            let optionalParam={
                resourceUsageOption:{
                    requiredResource:{[e_resourceFieldName.USED_NUM]:subFieldValue[fieldName][e_subField.ELE_ARRAY].length},
                    resourceProfileRange:[e_resourceRange.MAX_ARTICLE_PER_COLLECTION],
                    userId:userId,
                    containerId:subFieldValue[fieldName][e_subField.TO]
                }
            }
            // ap.wrn('optionalParam',optionalParam)
            // if(undefined!==stepParam[e_inputValueLogicCheckStep.RESOURCE_USAGE]['optionalParam']){
            let resourceUsageOption=optionalParam['resourceUsageOption']
            // ap.wrn('resourceUsageOption',resourceUsageOption)
            // ap.wrn('stepParam[e_inputValueLogicCheckStep.RESOURCE_USAGE][\'optionalParam\'][\'resourceUsageOption\']',stepParam[e_inputValueLogicCheckStep.RESOURCE_USAGE]['optionalParam']['resourceUsageOption'])
            await controllerInputValueLogicCheck.ifEnoughResource_async({
                requiredResource:resourceUsageOption.requiredResource,//{num:xx,sizeInMb;yy,filesAbsPath:[]}
                resourceProfileRange:resourceUsageOption.resourceProfileRange,
                userId:userId,
                containerId:resourceUsageOption.containerId,
                // filesAbsPath:resourceUsageOption.filesAbsPath,
            })
        }
    }
    // ap.wrn('aricle sdone')
    if(undefined!==subFieldValue[e_field.COLLECTION.TOPICS_ID]){
        let fieldName=e_field.COLLECTION.TOPICS_ID
        if(undefined!==subFieldValue[fieldName][e_subField.ELE_ARRAY] && subFieldValue[fieldName][e_subField.ELE_ARRAY].length>0 && undefined!==subFieldValue[fieldName][e_subField.TO]){
            let optionalParam={
                resourceUsageOption:{
                    requiredResource:{[e_resourceFieldName.USED_NUM]:subFieldValue[fieldName][e_subField.ELE_ARRAY].length},
                    resourceProfileRange:[e_resourceRange.MAX_TOPIC_PER_COLLECTION,],
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
    }

    /**     editSubValue无需使用inputValueLogicValidCheck**/
    // ap.inf('special doen')
    /*/!************************************************!/
    /!*** CALL FUNCTION:inputValueLogicValidCheck ****!/
    /!************************************************!/
    let commonParam={docValue:docValue,userId:userId,collName:collName}
    // ap.inf('commonParam',commonParam)
    let stepParam={
        /!******** fk需要检查folder是否为自己 ********!/
        [e_inputValueLogicCheckStep.FK_EXIST_AND_PRIORITY]:{flag:true,optionalParam:undefined},
        [e_inputValueLogicCheckStep.ENUM_DUPLICATE]:{flag:true,optionalParam:undefined},
        //object：coll中，对单个字段进行unique检测，需要的额外查询条件
        [e_inputValueLogicCheckStep.SINGLE_FIELD_VALUE_UNIQUE]:{flag:true,optionalParam:{singleValueUniqueCheckAdditionalCondition:undefined}},
        //数组，元素是字段名。默认对所有dataType===string的字段进行XSS检测，但是可以通过此变量，只选择部分字段
        [e_inputValueLogicCheckStep.XSS]:{flag:true,optionalParam:{expectedXSSFields:undefined}},
        //object，对compoundField进行unique检测需要的额外条件，key从model->mongo->compound_unique_field_config.js中获得
        //[e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]:{flag:true,optionalParam:{compoundFiledValueUniqueCheckAdditionalCheckCondition:undefined}},
        //Object，配置resourceCheck的一些参数,{requiredResource,resourceProfileRange,userId,containerId}
        /!*****  资源检测在之前已经调用函数处理过了  ******!/
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:false,optionalParam:{resourceUsageOption:{requiredResource:undefined}}},
    }

    // ap.inf('stepParam',stepParam)
    await controllerInputValueLogicCheck.inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})
    // ap.inf('inputValueLogicValidCheck_async done')*/

    //更改数量数据，直接写入covertSql
    let field=[
        {contentFieldName:e_field.COLLECTION.ARTICLES_ID,numFieldName:e_field.COLLECTION.ARTICLE_NUM},
        {contentFieldName:e_field.COLLECTION.TOPICS_ID,numFieldName:e_field.COLLECTION.TOPIC_NUM},
    ]
    for(let single of field){
        let singleFieldName=single['contentFieldName'],singleNumFieldName=single['numFieldName']
        //对某个字段进行了操作
        if(undefined!==subFieldValue[singleFieldName]){
            let eleArrayNum=subFieldValue[singleFieldName][e_subField.ELE_ARRAY].length
            //此字段有移入记录
            if(undefined!==subFieldValue[singleFieldName][e_subField.TO]){
                if(undefined!==convertedNoSql[subFieldValue[singleFieldName][e_subField.TO]]){
                    convertedNoSql[subFieldValue[singleFieldName][e_subField.TO]]["$inc"]={[singleNumFieldName]:eleArrayNum}
                }
            }
            //此字段有移出记录
            if(undefined!==subFieldValue[singleFieldName][e_subField.FROM]){
                if(undefined!==convertedNoSql[subFieldValue[singleFieldName][e_subField.FROM]]){
                    convertedNoSql[subFieldValue[singleFieldName][e_subField.FROM]]["$inc"]={[singleNumFieldName]:-eleArrayNum}
                }
            }
        }
    }
    /*********************************************/
    /**********          业务处理        *********/
    /*********************************************/
    /**         edit_sub_field对应的nosql，转换成db操作        **/
    ap.wrn('convertedNoSql',convertedNoSql)
    let promiseTobeExec=[]
    // if(false===editSubFieldValueNotChange){
    for(let singleRecordId in convertedNoSql){
        promiseTobeExec.push(common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel[collName],id:singleRecordId,updateFieldsValue:convertedNoSql[singleRecordId]}))
    }


    if(promiseTobeExec.length>0){
        await Promise.all(promiseTobeExec)
    }

    return Promise.resolve({rc:0})
    // let updatedRecord=await businessLogic_async({docValue:docValue,collName:collName,recordId:recordId,applyRange:applyRange})

    /*********************************************/
    /**********      加密 敏感数据       *********/
    /*********************************************/
    // controllerHelper.encryptSingleRecord({record:updatedRecord,salt:tempSalt,collName:collName})
    /*********************************************/
    /**********      删除指定字段       *********/
    /*********************************************/
    // controllerHelper.deleteFieldInRecord({record:updatedRecord,fieldsToBeDeleted:undefined})

    //无需返回更新后记录，只需返回操作结果
    // return Promise.resolve({rc:0})



}

/*************************************************************/
/***************   业务处理    *******************************/
/*************************************************************/
/*async function businessLogic_async({docValue,collName,recordId,applyRange}){
    let internalValue={}

    if(e_env.DEV===currentEnv && Object.keys(internalValue).length>0){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInternalRule:internalInputRule[collName],applyRange:applyRange})
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    if(undefined===docValue){
        docValue=internalValue
    }else{
        Object.assign(docValue,internalValue)
    }
    /!*******************************************************************************************!/
    /!******************          compound field value unique check                  ************!/
    /!*******************************************************************************************!/
    if(undefined!==docValue){
        let compoundFiledValueUniqueCheckAdditionalCheckCondition
        await controllerInputValueLogicCheck.ifCompoundFiledValueUnique_returnExistRecord_async({
            collName:collName,
            docValue:docValue,
            additionalCheckCondition:compoundFiledValueUniqueCheckAdditionalCheckCondition,
        })
    }
    /!***         数据库操作            ***!/
    let updatedRecord=await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel[collName],id:recordId,updateFieldsValue:docValue})
    return Promise.resolve(updatedRecord.toObject())
}*/


module.exports={
    updateCollectionArticleTopic_async,
}