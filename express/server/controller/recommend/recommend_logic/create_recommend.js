/**
 * Created by wzhan039 on 2017/10/26.
 */
'use strict'
/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')
const lodash=require('lodash')
/**************  controller相关常量  ****************/
const controller_setting=require('../recommend_setting/recommend_setting').setting
const controllerError=require('../recommend_setting/recommend_controllerError').controllerError

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
async  function createRecommend_async({req,applyRange}){
    // console.log(`createRecommend_async in`)
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
    let chooseFriend=req.body.values[e_part.CHOOSE_FRIEND]

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
        [e_inputValueLogicCheckStep.FK_EXIST_AND_PRIORITY]:{flag:true,optionalParam:undefined},
        [e_inputValueLogicCheckStep.ENUM_DUPLICATE]:{flag:false,optionalParam:undefined},
        //object：coll中，对单个字段进行unique检测，需要的额外查询条件
        [e_inputValueLogicCheckStep.SINGLE_FIELD_VALUE_UNIQUE]:{flag:false,optionalParam:{singleValueUniqueCheckAdditionalCondition:undefined}},
        //数组，元素是字段名。默认对所有dataType===string的字段进行XSS检测，但是可以通过此变量，只选择部分字段
        [e_inputValueLogicCheckStep.XSS]:{flag:false,optionalParam:{expectedXSSFields:undefined}},
        //object，对compoundField进行unique检测需要的额外条件，key从model->mongo->compound_unique_field_config.js中获得
        //在internalValue之后执行
        // [e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]:{flag:true,optionalParam:{compoundFiledValueUniqueCheckAdditionalCheckCondition:undefined}},
        //Object，配置resourceCheck的一些参数,{requiredResource,resourceProfileRange,userId,containerId}
        /*** 已经分享的文档数量 ***/
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:true,optionalParam:{resourceUsageOption:{requiredResource:{[e_resourceFieldName.USED_NUM]:1},resourceProfileRange:[e_resourceRange.MAX_SEND_RECOMMENDS,],userId:userId,containerId:undefined}}},
    }
    // ap.inf('stepParam',stepParam)
    await controllerInputValueLogicCheck.inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})

    // ap.inf('inputValueLogicValidCheck_async done')
    /**********************************************/
    /**                    特殊检测              **/
    /**********************************************/
    //1. article 的状态必须是FINISH
    let article=await common_operation_model.findById_returnRecord_async({dbModel:e_dbModel.article,id:docValue[e_field.SEND_RECOMMEND.ARTICLE_ID]})
    // ap.inf('article',article)
    if(article[e_field.ARTICLE.STATUS]!==e_articleStatus.FINISHED){
        return Promise.reject(controllerError.logic.post.articleStatusNotFinish)
    }
    // ap.inf('article status done')

    /*************************************************************/
    /***************   业务处理    *******************************/
    /*************************************************************/
    let createdRecord=await businessLogic_async({docValue:docValue,collName:collName,chooseFriend:chooseFriend,userId:userId,applyRange:applyRange})
// ap.inf('createdRecord',createdRecord)
    /*********************************************/
    /**********      保留指定字段       *********/
    /*********************************************/
    // controllerHelper.deleteFieldInRecord({record:createdRecord,fieldsToBeDeleted:undefined})
    controllerHelper.keepFieldInRecord({record:createdRecord,fieldsToBeKeep:[e_field.ARTICLE.ID]})
    /*********************************************/
    /**********      加密 敏感数据       *********/
    /*********************************************/
    controllerHelper.encryptSingleRecord({record:createdRecord,salt:tempSalt,collName:collName})

    // ap.inf('businessLogic_async done')
    return Promise.resolve({rc:0,msg:createdRecord})

    // return Promise.resolve({rc:0,msg:tmpResult})
}




/*************************************************************/
/***************   业务处理    *******************************/
/*************************************************************/
async function businessLogic_async({docValue,collName,chooseFriend,userId,applyRange}){
    /*******************************************************************************************/
    /*                         添加internal field，然后检查                                    */
    /*******************************************************************************************/
    let internalValue={}
    /**********************************************/
    /**              特殊处理，将chooseFriend 转换成receivers                  **/
    /**********************************************/
    let receivers=await controllerHelper.getFriendThroughPartChooseFriend_async({chooseFriend:chooseFriend,userId:userId})

    // dataConvert.convertDocumentToObject({src:receivers})
    // ap.wrn('receivers',receivers)
    // ap.wrn('docValue',docValue)
    if(receivers.length>0){
        // ap.wrn('userId',userId)
        // ap.wrn('receivers',receivers)
        /**********************************************/
        /**              特殊检测（在inputValueLogicValidCheck前执行，尽可能减少receivers中的数据量）                  **/
        /**********************************************/
        //1. receivers中不能包含发送者（不能自己分享给自己）
        if(-1!==receivers.indexOf(userId)){
            return Promise.reject(controllerError.logic.post.cantSendRecommendToSelf)
        }
        // ap.inf('self check done')
        //2. 如果以前分享过此文档，检测以前的记录中的receviers是否还是在当前的记录中存在（不能为同一个用户多次分享同一文档）
        let condition={
            [e_field.SEND_RECOMMEND.ARTICLE_ID]:docValue[e_field.SEND_RECOMMEND.ARTICLE_ID]
        }
        // ap.wrn('condition',condition)
        let sendedRecommends=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.send_recommend,condition:condition})
        // sendedRecommends=sendedRecommends.toObject()
        // ap.inf('sendedRecommends',sendedRecommends)
        //记录已经接受过当前分享文档的用户
        let recommendArticleReceivers=[]
        if(sendedRecommends.length>0){
            for(let singleExistRecommend of sendedRecommends){

                //需要把记录中的数组的元素 从 object 变成 字符，以便lodash操作
                recommendArticleReceivers=recommendArticleReceivers.concat(singleExistRecommend[e_field.SEND_RECOMMEND.RECEIVERS])
                // singleExistRecommend=JSON.parse(JSON.stringify(singleExistRecommend))

                // ap.inf('after difference receivers',receivers)
            }
        }
        //此文档已经分享给某些用户了，判断这些用户是否在当前请求中存在
        if(recommendArticleReceivers.length>0){
            recommendArticleReceivers=misc.objectDeepCopy(recommendArticleReceivers)
            // ap.inf('recommendArticleReceivers',recommendArticleReceivers)
            // ap.inf('typeof recommendArticleReceivers[0]',typeof recommendArticleReceivers[0] )
            // ap.inf('receivers',receivers)
            // ap.inf('typeof receivers[0]',typeof receivers[0] )
            // ap.inf('lodash.intersection(receivers,recommendArticleReceivers)',lodash.intersection(receivers,recommendArticleReceivers))
            if(0<lodash.intersection(receivers,recommendArticleReceivers).length){
                return Promise.reject(controllerError.logic.post.receiversHasAlreadyGetRecommend)
            }
        }

    }
    internalValue[e_field.SEND_RECOMMEND.SENDER]=userId
    internalValue[e_field.SEND_RECOMMEND.RECEIVERS]=receivers
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
    let createdRecord= await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.send_recommend,value:docValue})
    createdRecord=createdRecord.toObject()
    /*******************************************************************************************/
    /*****                            related db op                                     *****/
    /*******************************************************************************************/
    //1. recommend(而不是article) push到所有receivers的unRead字段中
    let condition={
        [e_field.RECEIVE_RECOMMEND.RECEIVER]:{$in:createdRecord[e_field.SEND_RECOMMEND.RECEIVERS]},
        // '$addToSet':{[e_field.RECEIVE_RECOMMEND.UNREAD_RECOMMENDS]:createdRecord[e_field.SEND_RECOMMEND.ID]},
    }

    let updateValues={
        '$addToSet':{[e_field.RECEIVE_RECOMMEND.UNREAD_RECOMMENDS]:createdRecord[e_field.SEND_RECOMMEND.ID]},
        $inc:{[e_field.RECEIVE_RECOMMEND.UNREAD_RECOMMENDS_NUM]:1}
        // $addToSet:{[e_field.RECEIVE_RECOMMEND.UNREAD_RECOMMENDS]:dataConvert.convertToObjectId("5bfa6da684fdd7e1a2d85c12")},
        // [e_field.RECEIVE_RECOMMEND.UNREAD_RECOMMENDS]:"5bfa6da684fdd7e1a2d85c12"
    }
    // ap.inf('receive condition:',condition)
    // ap.inf('receive updateValues:',updateValues)
    await common_operation_model.updateManyDirect_returnRecord_async({dbModel:e_dbModel.receive_recommend,condition:condition,values:updateValues})
    //2. 查找所有receivers中unReadCommend size>200的记录，然后pop一个记录(不活跃用户，不能使得unReadComment超出)
    //globalConfiguration.maxNumber.user_operation.maxUnReadReceiveRecommends是全局统一，所以无需放在user profile中
    condition={
        [e_field.RECEIVE_RECOMMEND.RECEIVER]:{$in:createdRecord[e_field.SEND_RECOMMEND.RECEIVERS]},
        [e_field.RECEIVE_RECOMMEND.UNREAD_RECOMMENDS_NUM]:{$gt:globalConfiguration.maxNumber.user_operation.maxUnReadReceiveRecommends}
    }
    updateValues={
        $pop:{[e_field.RECEIVE_RECOMMEND.UNREAD_RECOMMENDS]:-1},//pop第一个元素
        '$inc':{[e_field.RECEIVE_RECOMMEND.UNREAD_RECOMMENDS_NUM]:-1},//计数器减1
    }

    /*let matchResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.receive_recommend,condition:condition})
    if(matchResult.length>0){
        ap.inf('matchResult',matchResult)*/
    await common_operation_model.updateManyDirect_returnRecord_async({dbModel:e_dbModel.receive_recommend,condition:condition,values:updateValues})
    // }
    /*updateValues={
            [e_field.RECEIVE_RECOMMEND.UNREAD_RECOMMENDS]:{$pop:-1}
    }
    await common_operation_model.updateDirect_returnRecord_async({dbModel:e_dbModel.receive_recommend,condition:condition,values:updateValues})*/
    return Promise.resolve(createdRecord)
}


module.exports={
    createRecommend_async,
}