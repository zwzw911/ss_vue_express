/**
 * Created by 张伟 on 2017/10/26.
 * 创建新的collection，只能传入name
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')
const lodash=require('lodash')
/**************  controller相关常量  ****************/
const controller_setting=require('../collection_setting/collection_setting').setting
const controllerError=require('../collection_setting/collection_controllerError').controllerError

/**************      rule             *************/
const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule
const browserInputRule=require('../../../constant/inputRule/browserInputRule').browserInputRule

/***************  数据库相关常量   ****************/
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
const enumValue=require(`../../../constant/genEnum/enumValue`)

const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject
const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共函数   ******************/
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const crypt=server_common_file_require.crypt
const controllerInputValueLogicCheck=server_common_file_require.controllerInputValueLogicCheck
/****************  公共常量 ********************/
const nodeEnum=server_common_file_require.nodeEnum
const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart
const e_resourceFieldName=nodeEnum.ResourceFieldName

const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const e_inputValueLogicCheckStep=nodeRuntimeEnum.InputValueLogicCheckStep

const mongoEnum=server_common_file_require.mongoEnum
const e_articleAllowComment=mongoEnum.ArticleAllowComment.DB
const e_allUserType=mongoEnum.AllUserType.DB
const e_resourceRange=mongoEnum.ResourceRange.DB
const e_articleStatus=mongoEnum.ArticleStatus.DB

const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange

/*************** 配置信息 *********************/
const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig
const globalConfiguration=server_common_file_require.globalConfiguration

/*              新article无任何输入，所有的值都是内部产生                */
async  function createCollection_async({req,applyRange}){
    console.log(`createCollection_async in`)
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult
    let condition
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME
    /*    let docValue={
     [e_field.IMPEACH.TITLE]:'新举报',
     [e_field.IMPEACH.CONTENT]:'对文档/评论的内容进行举报',
     }*/
    let docValue=req.body.values[e_part.RECORD_INFO]
    // let chooseFriend=req.body.values[e_part.CHOOSE_FRIEND]

    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
// console.log(`userId ====>${userId}`)
//     ap.inf('chooseFriend',chooseFriend)
    /**********************************************/
    /***********    用户类型检测    **************/
    /*********************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})
    // ap.inf('用户类型检测 done')


    /**********************************************/
    /**  CALL FUNCTION:inputValueLogicValidCheck **/
    /**********************************************/
    let commonParam={docValue:docValue,userId:userId,collName:collName}
    // ap.inf('commonParam',commonParam)
    let stepParam={
        [e_inputValueLogicCheckStep.FK_EXIST_AND_PRIORITY]:{flag:false,optionalParam:undefined},//parentId内部设置，无需检查
        [e_inputValueLogicCheckStep.ENUM_DUPLICATE]:{flag:false,optionalParam:undefined},
        //object：coll中，对单个字段进行unique检测，需要的额外查询条件
        [e_inputValueLogicCheckStep.SINGLE_FIELD_VALUE_UNIQUE]:{flag:false,optionalParam:{singleValueUniqueCheckAdditionalCondition:undefined}},//collection集可以重名
        //数组，元素是字段名。默认对所有dataType===string的字段进行XSS检测，但是可以通过此变量，只选择部分字段
        [e_inputValueLogicCheckStep.XSS]:{flag:true,optionalParam:{expectedXSSFields:undefined}},//name需要检测xss
        //object，对compoundField进行unique检测需要的额外条件，key从model->mongo->compound_unique_field_config.js中获得
        //在internalValue之后执行
        // [e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]:{flag:true,optionalParam:{compoundFiledValueUniqueCheckAdditionalCheckCondition:undefined}},
        //Object，配置resourceCheck的一些参数,{requiredResource,resourceProfileRange,userId,containerId}
        /*** 已经创建的收藏夹数量 ***/
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:true,optionalParam:{resourceUsageOption:{requiredResource:{[e_resourceFieldName.USED_NUM]:1},resourceProfileRange:[e_resourceRange.MAX_COLLECTION_PER_USER,],userId:userId,containerId:undefined}}},
    }
    // ap.inf('stepParam',stepParam)
    await controllerInputValueLogicCheck.inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})

    // ap.inf('inputValueLogicValidCheck_async done')
    /**********************************************/
    /**                    特殊检测（放在bussiness logic中树立）              **/
    /**********************************************/
/*    //1. 用户自己创建的收藏夹只能有一层，即父目录只能是创建用户时，创建的收藏夹
    let parentCollection=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.collection,id:docValue[e_field.COLLECTION.PARENT_ID]})
    // ap.inf('article',article)
    if(undefined!==parentCollection[e_field.COLLECTION.PARENT_ID]){
        return Promise.reject(controllerError.logic.post.parentCollectionIncorrect)
    }*/
    // ap.inf('article status done')

    /*************************************************************/
    /***************   业务处理    *******************************/
    /*************************************************************/
    let createdRecord=await businessLogic_async({docValue:docValue,collName:collName,userId:userId,applyRange:applyRange})
// ap.inf('createdRecord',createdRecord)
    /*********************************************/
    /**********      保留指定字段       *********/
    /*********************************************/
    // controllerHelper.deleteFieldInRecord({record:createdRecord,fieldsToBeDeleted:undefined})
    //无需保留parentid，因为新建的收藏夹都是同一个parentId
    controllerHelper.keepFieldInRecord({record:createdRecord,fieldsToBeKeep:[e_field.COLLECTION.ID,e_field.COLLECTION.NAME]})
    // ap.wrn('after keep',createdRecord)
    /*********************************************/
    /**********      加密 敏感数据       *********/
    /*********************************************/
    controllerHelper.encryptSingleRecord({record:createdRecord,salt:tempSalt,collName:collName})
    // ap.wrn('after encrypte',createdRecord)
    // ap.inf('businessLogic_async done')
    return Promise.resolve({rc:0,msg:createdRecord})

    // return Promise.resolve({rc:0,msg:tmpResult})
}




/*************************************************************/
/***************   业务处理    *******************************/
/*************************************************************/
async function businessLogic_async({docValue,collName,userId,applyRange}){
    /*******************************************************************************************/
    /*                         添加internal field，然后检查                                    */
    /*******************************************************************************************/
    let internalValue={}
    let condition={
        [e_field.COLLECTION.CREATOR_ID]:userId,
        [e_field.COLLECTION.PARENT_ID]:{$exists:false},
        'dData':{$exists:false},
    }
    let tmpResult=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel.collection,condition:condition})
    // ap.wrn('tmpResult',tmpResult)
    if(tmpResult.length!==1){
        return Promise.reject(controllerError.logic.post.cantFindTopParentCollectionId)
    }
    internalValue[e_field.COLLECTION.CREATOR_ID]=userId
    internalValue[e_field.COLLECTION.PARENT_ID]=tmpResult[0]['_id'].toString()
    // internalValue[e_field.COLLECTION.RECEIVERS]=receivers
// ap.wrn('internalValue',internalValue)
    if(e_env.DEV===currentEnv && Object.keys(internalValue).length>0){
        // console.log(`before newDocValue====>${JSON.stringify(internalValue)}`)
        // let newDocValue=dataConvert.addSubFieldKeyValue(internalValue)
        // console.log(`newDocValue====>${JSON.stringify(newDocValue)}`)
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInternalRule:internalInputRule[collName],applyRange:applyRange})
// console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
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

    /*******************************************************************************************/
    /*****                            db operation                                         *****/
    /*******************************************************************************************/
    // ap.wrn('docValue',docValue)
    let createdRecord= await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.collection,value:docValue})
    // ap.wrn('createdRecord',createdRecord)
    // createdRecord=createdRecord.toObject()
    /**     如果是create，需要使用返回值       **/
    createdRecord=dataConvert.convertDocumentToObject({src:createdRecord})
// ap.wrn('Object.keys(createdRecord)',Object.keys(createdRecord))
    return Promise.resolve(createdRecord)
}


module.exports={
    createCollection_async,
}