/**
 * Created by 张伟 on 2018/11/28.
 * 读取 自己 的 未读 分享文档 列表。无需传入任何参数
 */
'use strict'

/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')
const moment=require('moment')
/**************  controller相关常量  ****************/
const controllerError=require('../recommend_setting/recommend_controllerError').controllerError
const controllerSetting=require('../recommend_setting/recommend_setting').setting

/***************  数据库相关常量   ****************/
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')


const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共函数   ******************/
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const miscConfiguration=server_common_file_require.globalConfiguration.misc
const maxNumber=server_common_file_require.globalConfiguration.maxNumber
const fkConfig=server_common_file_require.fkConfig
const crypt=server_common_file_require.crypt
const controllerInputValueLogicCheck=server_common_file_require.controllerInputValueLogicCheck
/****************  公共常量 ********************/
const mongoEnum=server_common_file_require.mongoEnum
const e_allUserType=mongoEnum.AllUserType.DB
const e_articleStatus=mongoEnum.ArticleStatus.DB
const e_resourceRange=mongoEnum.ResourceRange.DB

const e_hashType=server_common_file_require.nodeRuntimeEnum.HashType

const nodeEnum=server_common_file_require.nodeEnum
const e_part=nodeEnum.ValidatePart
const e_env=nodeEnum.Env
const e_resourceFieldName=nodeEnum.ResourceFieldName

/*************** app配置 *********************/
const currentEnv=server_common_file_require.appSetting.currentEnv
const regex=server_common_file_require.regex

const maxNum=server_common_file_require.globalConfiguration.maxNumber

/**     接收人读取（点击）未读分享文档（需要同完成未读->已读，打开文档交给另外的url完成）**/
async function updateReceiveRecommendAsRead_async({req}){
    return await updateReceiveRecommend_async({req:req})
}
/*async function getUnreadReceiveRecommend_async({req}){
    return await getAllReceiveRecommend_async({req:req,type:'unread'})
}*/

async function updateReceiveRecommend_async({req}){
    // ap.inf('updateReceiveRecommend_async in')
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult,condition,option
    // ap.inf('controller_setting.MAIN_HANDLED_COLL_NAME',controllerSetting)
    let collName=e_coll.RECEIVE_RECOMMEND
    // ap.inf('collName',collName)
    // let docValue=req.body.values[e_part.RECORD_INFO]
    // ap.inf('docValue',docValue)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // ap.inf('userInfo',userInfo)
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    let unreadRecommendId=req.body.values[e_part.RECORD_ID]

// ap.inf('unreadRecommendId',unreadRecommendId)
    /************************************************/
    /*************        用户类型检测    **********/
    /************************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})
    // ap.inf('ifExpectedUserType_async done',docValue)
    /*    /!************************************************!/
        /!******   传入的敏感数据（recordId）解密，recordInfo中的objectId在dispatch中解密   ******!/
        /!************************************************!/
        // controllerHelper.decryptRecordValue({record:docValue,collName:collName})
        recordId=crypt.decryptSingleValue({fieldValue:recordId,salt:tempSalt})
        if(false===regex.objectId.test(recordId)){
            return Promise.reject(controllerError.update.inValidFolderId)
        }*/
    // ap.inf('ifExpectedUserType_async done')
    /**********************************************/
    /***    用户权限检测(兼检查记录是否存在)   ***/
    /***    recordId处于数组字段（而不是id字段），所以内联代码（而不是函数）   ***/
    /*********************************************/
    let originalDoc
    if(userType===e_allUserType.USER_NORMAL){
        let condition={
            [e_field.RECEIVE_RECOMMEND.RECEIVER]:userId,
            [e_field.RECEIVE_RECOMMEND.UNREAD_RECOMMENDS]:unreadRecommendId,
        }
        // ap.wrn('condition',condition)
        tmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.receive_recommend,condition:condition,})
        // ap.inf('tmpResult',tmpResult)
        //recommend不存在
        if(tmpResult.length===0){
            return Promise.reject(controllerError.logic.put.noFindReceivedRecommend)
        }
        //重复接收到未读分享文档
        if(tmpResult.length>1){
            return Promise.reject(controllerError.logic.put.multiReceivedRecommend)
        }
        originalDoc=tmpResult[0]
/*        originalDoc=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
            dbModel:e_dbModel.receive_recommend,
            recordId:recordId,
            ownerFieldsName:[e_field.RECEIVE_RECOMMEND.],
            userId:userId,
            additionalCondition:undefined,
        })
        // ap.inf('originalDoc',originalDoc)
        if(false===originalDoc){
            return Promise.reject(controllerError.update.notAuthorCantUpdateFolder)
        }*/
    }

// ap.wrn('originalDoc',originalDoc)
    /**********************************************/
    /**  CALL FUNCTION:inputValueLogicValidCheck **/
    /**********************************************/
    /*let commonParam={docValue:undefined,userId:userId,collName:collName}
    ap.inf('commonParam',commonParam)
    let stepParam={
        [e_inputValueLogicCheckStep.FK_EXIST_AND_PRIORITY]:{flag:false,optionalParam:undefined},//通过权限检查完成此功能
        [e_inputValueLogicCheckStep.ENUM_DUPLICATE]:{flag:false,optionalParam:undefined},
        //object：coll中，对单个字段进行unique检测，undefined需要的额外查询条件
        [e_inputValueLogicCheckStep.SINGLE_FIELD_VALUE_UNIQUE]:{flag:false,optionalParam:{singleValueUniqueCheckAdditionalCondition:undefined}},
        //数组，元素是字段名。默认对所有dataType===string的字段进行XSS检测，但是可以通过此变量，只选择部分字段
        [e_inputValueLogicCheckStep.XSS]:{flag:false,optionalParam:{expectedXSSFields:undefined}},
        //object，对compoundField进行unique检测需要的额外条件，key从model->mongo->compound_unique_field_config.js中获得
        //在internalValue之后执行
        // [e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]:{flag:true,optionalParam:{compoundFiledValueUniqueCheckAdditionalCheckCondition:undefined}},
        //Object，配置resourceCheck的一些参数,{requiredResource,resourceProfileRange,userId,containerId}
        /!*** 已经分享的文档数量 ***!/
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:true,optionalParam:{resourceUsageOption:{requiredResource:{[e_resourceFieldName.USED_NUM]:1},resourceProfileRange:[e_resourceRange.MAX_READ_RECEIVE_RECOMMENDS,],userId:userId,containerId:undefined}}},
    }
    ap.inf('stepParam',stepParam)*/
    let optionalParam={resourceUsageOption:{requiredResource:{[e_resourceFieldName.USED_NUM]:1},resourceProfileRange:[e_resourceRange.MAX_READ_RECEIVE_RECOMMENDS,],userId:userId,containerId:undefined}}
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
    // }

    // ap.wrn('inputValueLogicValidCheck_async done')







    /*********************************************/
    /**********        操作数据         *********/
    /**********        recommend从unread移动到read         *********/
    /*********************************************/
    let getRecord=await businessLogic_async({recordId:originalDoc['id'],unreadRecommendId:unreadRecommendId})
// ap.inf('getRecord',getRecord)


//无需返回结果，只要告知操作完成
    return Promise.resolve({rc:0})
}



/**************************************/
/***    读取接收到的分享文档列表    ***/
/**************************************/
async function businessLogic_async({recordId,unreadRecommendId}){


    let updateFieldsValue={
        '$addToSet':{[e_field.RECEIVE_RECOMMEND.READ_RECOMMENDS]:unreadRecommendId},
        '$pull':{[e_field.RECEIVE_RECOMMEND.UNREAD_RECOMMENDS]:unreadRecommendId},
        '$inc':{
            [e_field.RECEIVE_RECOMMEND.READ_RECOMMENDS_NUM]:1,
            [e_field.RECEIVE_RECOMMEND.UNREAD_RECOMMENDS_NUM]:-1,
        }

    }
    // ap.inf('updateFieldsValue',updateFieldsValue)
    // ap.inf('recordId',recordId)
    let result=await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.receive_recommend,id:recordId,updateFieldsValue:updateFieldsValue})

    // let result=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.receive_recommend,condition:condition,options:options,populateOpt:populateOpt})
    // ap.inf('populate result',result)
// result=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.receive_recommend,id:result[0]["id"],populateOpt:populateOpt})
//     dataConvert.to
    dataConvert.convertDocumentToObject({src:result})
    return Promise.resolve(result)

}


/*/!**************************************!/
/!***      读取文档的统计信息       ***!/
/!**************************************!/
async function static_async({articleId}){
    let condition={
        [e_field.ARTICLE_LIKE_DISLIKE.ARTICLE_ID]:articleId,
        [e_field.ARTICLE_LIKE_DISLIKE.LIKE]:true,
    }
    let likeCount=await common_operation_model.count_async({dbModel:e_dbModel.article_like_dislike,condition:condition})
    condition={
        [e_field.ARTICLE_LIKE_DISLIKE.ARTICLE_ID]:articleId,
        [e_field.ARTICLE_LIKE_DISLIKE.LIKE]:false,
    }
    let dislikeCount=await common_operation_model.count_async({dbModel:e_dbModel.article_like_dislike,condition:condition})
    return Promise.resolve({like:likeCount,dislike:dislikeCount})
}*/
module.exports={
    updateReceiveRecommendAsRead_async
}