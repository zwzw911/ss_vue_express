/**
 * Created by wzhan039 on 2017/10/26.
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')

/**************  controller相关常量  ****************/
const controller_setting=require('../article_setting/article_setting').setting
const controllerError=require('../article_setting/article_controllerError').controllerError

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
const e_accountType=mongoEnum.AccountType.DB
const e_docStatus=mongoEnum.DocStatus.DB
const e_impeachType=mongoEnum.ImpeachType.DB
const e_impeachUserAction=mongoEnum.ImpeachUserAction.DB
const e_impeachState=mongoEnum.ImpeachState.DB
const e_addFriendStatus=mongoEnum.AddFriendStatus.DB
const e_allUserType=mongoEnum.AllUserType.DB
const e_resourceRange=mongoEnum.ResourceRange.DB
const e_articleStatus=mongoEnum.ArticleStatus.DB

const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange

/*************** 配置信息 *********************/
const regex=server_common_file_require.regex.regex
const currentEnv=server_common_file_require.appSetting.currentEnv
const fkConfig=server_common_file_require.fkConfig.fkConfig


/*              新article无任何输入，所有的值都是内部产生                */
async  function createArticle_async({req}){
    // console.log(`createArticle_async in`)
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME
    /*    let docValue={
     [e_field.IMPEACH.TITLE]:'新举报',
     [e_field.IMPEACH.CONTENT]:'对文档/评论的内容进行举报',
     }*/
    // let docValue=req.body.values[e_part.RECORD_INFO]
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
// console.log(`userId ====>${userId}`)

    /*******************************************************************************************/
    /*                                          create default value                           */
    /*******************************************************************************************/
    let docValue={}
    docValue[e_field.ARTICLE.NAME]="新建文档"

    docValue[e_field.ARTICLE.STATUS]=e_articleStatus.EDITING
    //查找默认目录
/*    tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.folder,condition:{authorId:userId,name:'我的文档'}})
    if(tmpResult.length===0){
        return Promise.reject(controllerError.create.userNoDefaultFolder)
    }*/
    /**         无需默认目录，默认不放在任何目录下       **/
    docValue[e_field.ARTICLE.FOLDER_ID]=tmpResult[0]['id']
    docValue[e_field.ARTICLE.CATEGORY_ID]=e_iniSettingObject.category.other
    docValue[e_field.ARTICLE.HTML_CONTENT]=`<i>请在此输入文档内容......</i>`


    /*************************************************************/
    /***************   业务处理    *******************************/
    /*************************************************************/
    let createdRecord=await businessLogic_async({docValue:docValue,collName:collName,userId:userId,applyRange:applyRange})
// ap.inf('createdRecord',createdRecord)
    /*********************************************/
    /**********      删除指定字段       *********/
    /*********************************************/
    controllerHelper.deleteFieldInRecord({record:createdRecord,fieldsToBeDeleted:undefined})
    /*********************************************/
    /**********      加密 敏感数据       *********/
    /*********************************************/
    controllerHelper.cryptRecordValue({record:createdRecord,salt:tempSalt,collName:collName})

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
    internalValue[e_field.ARTICLE.AUTHOR_ID]=userId
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
    let createdRecord= await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.article,value:docValue})

    return Promise.resolve(createdRecord.toObject())
}


module.exports={
    createArticle_async,
}