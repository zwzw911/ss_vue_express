/**
 * Created by ada on 2017/9/1.
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')

/**************  controller相关常量  ****************/
const controller_setting=require('../articleLikeDislike_setting/likeDislike_setting').setting
const controllerError=require('../articleLikeDislike_setting/likeDislike_controllerError').controllerError

/***************  数据库相关常量   ****************/
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
// const enumValue=require(`./express/server/constant/genEnum/enumValue`)

const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject

/**************      rule             *************/
const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule
const browserInputRule=require('../../../constant/inputRule/browserInputRule').browserInputRule


/*                      server common                                           */
const server_common_file_require=require('../../../../server_common_file_require')
/****************  公共常量 ********************/
const nodeEnum=server_common_file_require.nodeEnum
const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const mongoEnum=server_common_file_require.mongoEnum

const e_inputValueLogicCheckStep=nodeRuntimeEnum.InputValueLogicCheckStep

const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart
const e_resourceFieldName=nodeEnum.ResourceFieldName
// const e_hashType=nodeRuntimeEnum.

const e_accountType=mongoEnum.AccountType.DB
const e_docStatus=mongoEnum.DocStatus.DB
const e_impeachType=mongoEnum.ImpeachType.DB
const e_impeachUserAction=mongoEnum.ImpeachUserAction.DB
const e_impeachState=mongoEnum.ImpeachState.DB
const e_allUserType=mongoEnum.AllUserType.DB
const e_resourceRange=mongoEnum.ResourceRange.DB

/**************  公共函数   ******************/
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const hash=server_common_file_require.crypt.hash
const controllerInputValueLogicCheck=server_common_file_require.controllerInputValueLogicCheck

/*************** 配置信息 *********************/
const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig

async function like_async({req,applyRange}){
    return await createLikeDisLike_async({req:req,like:true,applyRange:applyRange})
}
async function dislike_async({req,applyRange}){
    return await createLikeDisLike_async({req:req,like:false,applyRange:applyRange})
}
//添加内部产生的值（hash password）
//对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）
//对数值逻辑进行判断（外键是否有对应的记录等）
//执行db操作并返回结果
async  function createLikeDisLike_async({req,like,applyRange}){
    // console.log(`create impeach in`)
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME
/*    let docValue={
        [e_field.IMPEACH.TITLE]:'新举报',
        [e_field.IMPEACH.CONTENT]:'对文档/评论的内容进行举报',
    }*/
    let docValue=req.body.values[e_part.SINGLE_FIELD]
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
// console.log(`docValue===> ${JSON.stringify(docValue)}`)
// console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    /**********************************************/
    /********  删除null/undefined的字段  *********/
    /*********************************************/
    // ap.inf('before constructCreateCriteria',docValue)
    dataConvert.constructCreateCriteria(docValue)
    /**********************************************/
    /***********    用户类型检测    **************/
    /*********************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})



    /**********************************************/
    /**  CALL FUNCTION:inputValueLogicValidCheck **/
    /**********************************************/
    let commonParam={docValue:docValue,userId:userId,collName:collName}
    // ap.inf('userId',userId)
    let stepParam={
        [e_inputValueLogicCheckStep.FK_EXIST_AND_PRIORITY]:{flag:true,optionalParam:undefined},
        [e_inputValueLogicCheckStep.ENUM_DUPLICATE]:{flag:true,optionalParam:undefined},
        //object：coll中，对单个字段进行unique检测，需要的额外查询条件
        [e_inputValueLogicCheckStep.SINGLE_FIELD_VALUE_UNIQUE]:{flag:true,optionalParam:{singleValueUniqueCheckAdditionalCondition:undefined}},
        //数组，元素是字段名。默认对所有dataType===string的字段进行XSS检测，但是可以通过此变量，只选择部分字段
        [e_inputValueLogicCheckStep.XSS]:{flag:true,optionalParam:{expectedXSSFields:undefined}},
        //object，对compoundField进行unique检测需要的额外条件，key从model->mongo->compound_unique_field_config.js中获得
        //在internalValue之后执行
        // [e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]:{flag:true,optionalParam:{compoundFiledValueUniqueCheckAdditionalCheckCondition:undefined}},
        //Object，配置resourceCheck的一些参数,{requiredResource,resourceProfileRange,userId,containerId}
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:false,optionalParam:{resourceUsageOption:{requiredResource:{[e_resourceFieldName.USED_NUM]:1},resourceProfileRange:[e_resourceRange.FOLDER_NUM],userId:userId,containerId:undefined}}},
    }
    await controllerInputValueLogicCheck.inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})

    /**********************************************/
    /***********    逻辑操作       **************/
    /*********************************************/
    await businessLogic_async({docValue:docValue,like:like,collName:collName,userId:userId,applyRange:applyRange})
    /**     无返回记录，所以无需加密objectId **/
    return Promise.resolve({rc:0})

}
/*************************************************************/
/***************   业务处理    *******************************/
/*************************************************************/
async function businessLogic_async({docValue,like,collName,userId,applyRange}){
    /*************************************************/
    /**        添加internal field，然后检查        **/
    /*************************************************/
    // console.log(`before hash is ${JSON.stringify(docValue)}`)
    let internalValue={}
    internalValue[e_field.ARTICLE_LIKE_DISLIKE.AUTHOR_ID] = userId
    internalValue[e_field.ARTICLE_LIKE_DISLIKE.LIKE] = like
    /*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           */
    if(e_env.DEV===currentEnv){
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


    /******************************************************/
    /**                  db operation                   **/
    /******************************************************/
    await common_operation_model.create_returnRecord_async({dbModel: e_dbModel[collName], value: docValue})
    // console.log(`create result is ====>${JSON.stringify(tmpResult)}`)
    /*          对关联db进行操作               */
    let fieldToBePlus1
    if(true===docValue[e_field.ARTICLE_LIKE_DISLIKE.LIKE]){
        fieldToBePlus1=e_field.LIKE_DISLIKE_STATIC.LIKE_TOTAL_NUM
    }else{
        fieldToBePlus1=e_field.LIKE_DISLIKE_STATIC.DISLIKE_TOTAL_NUM
    }
    let articleId=docValue[e_field.ARTICLE_LIKE_DISLIKE.ARTICLE_ID]
    let articleLikeDisLikeStatic=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel.like_dislike_static,condition:{[e_field.LIKE_DISLIKE_STATIC.ARTICLE_ID]:articleId}})
    //article没有对应的统计数据，新建记录
    if(0===articleLikeDisLikeStatic.length){
        let newStaticDocValue={
            [e_field.LIKE_DISLIKE_STATIC.ARTICLE_ID]:articleId,
            [fieldToBePlus1]:1
        }
        await common_operation_model.create_returnRecord_async({dbModel: e_dbModel.like_dislike_static, value: newStaticDocValue})
    }else{
        let staticId=articleLikeDisLikeStatic[0]['_id']
        await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.like_dislike_static,id:staticId,updateFieldsValue:{$inc:{[fieldToBePlus1]:1}}})
    }


    return Promise.resolve()
}
module.exports={
    like_async,
    dislike_async,
}