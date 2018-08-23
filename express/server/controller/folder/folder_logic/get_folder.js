/**
 * Created by 张伟 on 2018/4/24.
 */
'use strict'

/******************    内置lib和第三方lib  **************/
const ap=require('awesomeprint')

/**************  controller相关常量  ****************/
const controllerError=require('../folder_setting/folder_controllerError').controllerError
const controllerSetting=require('../folder_setting/folder_setting').setting

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
/****************  公共常量 ********************/
const mongoEnum=server_common_file_require.mongoEnum
const e_allUserType=mongoEnum.AllUserType.DB

const e_hashType=server_common_file_require.nodeRuntimeEnum.HashType

const nodeEnum=server_common_file_require.nodeEnum
const e_part=nodeEnum.ValidatePart
const e_env=nodeEnum.Env

/*************** app配置 *********************/
const currentEnv=server_common_file_require.appSetting.currentEnv
const regex=server_common_file_require.regex


/*************************************************************/
/***************        获得所有一级目录      ****************/
/*************************************************************/
async function getRootFolder_async({req}){
    // ap.inf('getRootFolder_async in')
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult,condition,option
    // ap.inf('controller_setting.MAIN_HANDLED_COLL_NAME',controllerSetting)
    let collName=controllerSetting.MAIN_HANDLED_COLL_NAME
    // ap.inf('collName',collName)
    // let docValue=req.body.values[e_part.RECORD_INFO]
    // ap.inf('docValue',docValue)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // ap.inf('userInfo',userInfo)
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo

    /**********************************************/
    /***********    用户类型检测    **************/
    /*********************************************/
    //普通用户
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})

    /*********************************************/
    /**********        获得数据         *********/
    /*********************************************/
    // ap.wrn('before businessLogic_async  ')
    let getRecord=await businessLogic_async({userId:userId,folderId:undefined})
// ap.wrn('root result ',getRecord)
    /*********************************************/
    /********        删除指定字段         *******/
    /*********************************************/
    // ap.inf('getRecord',getRecord)
    for(let singleEle of getRecord['folder']){
        controllerHelper.keepFieldInRecord({record:singleEle,fieldsToBeKeep:['id','name','childNum']})//
    }
    // ap.wrn('keepFieldInRecord ',getRecord)
    /*********************************************/
    /**********      加密 敏感数据       *********/
    /*********************************************/
    // ap.inf('before ecftypr getRecord[\'folder\']',getRecord['folder'])
    // ap.inf('tempSalt',tempSalt)
    for(let singleEle of getRecord['folder']){
        // getRecord['folder'][idx]=getRecord['folder'][idx].toObject()
        controllerHelper.cryptRecordValue({record:singleEle,salt:tempSalt,collName:collName})
    }
    // ap.inf('after ecftypr getRecord[\'folder\']',getRecord['folder'])
    //顶级目录没有文档
    // for(let singleEle of getRecord['article']){
    //     // getRecord['article'][idx]=getRecord['article'][idx].toObject()
    //     controllerHelper.cryptRecordValue({record:singleEle,salt:tempSalt,collName:collName})
    // }

    return Promise.resolve({rc:0,msg:getRecord})
}

/*************************************************************/
/***************        获得指定目录下所有目录和文档      ****************/
/*************************************************************/
async function getNonRootFolder_async({req}){
    // ap.inf('getNonRootFolder_async in')
    /********************************************************/
    /*************      define variant        ***************/
    /********************************************************/
    let tmpResult,condition,option
    // ap.inf('controller_setting.MAIN_HANDLED_COLL_NAME',controllerSetting)
    let collName=controllerSetting.MAIN_HANDLED_COLL_NAME
    // ap.inf('collName',collName)
    // let docValue=req.body.values[e_part.RECORD_INFO]
    // ap.inf('docValue',docValue)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // ap.inf('userInfo',userInfo)
    let {userId,userCollName,userType,userPriority,tempSalt}=userInfo
    // ap.inf('req.params',req.params)
    let recordId=req.params.folderId


    /**********************************************/
    /***********    用户类型检测    **************/
    /*********************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})
    // ap.inf('ifExpectedUserType_async done')
/*    /!*********************************************!/
    /!************    解密recordId    ************!/
    /!*********************************************!/
    recordId=crypt.decryptSingleFieldValue({fieldValue:recordId,salt:tempSalt})
    if(false===regex.objectId.test(recordId)){
        return Promise.reject(controllerError.get.inValidFolderId)
    }*/
    /**********************************************/
    /***********    用户权限检测    **************/
    /*********************************************/
    if(userType===e_allUserType.USER_NORMAL){
        let result=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
            dbModel:e_dbModel.folder,
            recordId:recordId,
            ownerFieldsName:[e_field.FOLDER.AUTHOR_ID],
            userId:userId,
            additionalCondition:undefined,
        })
        // ap.inf('ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async result',result)
        if(false===result){
            return Promise.reject(controllerError.get.notAuthorCantGetFolder)
        }
    }
    // ap.inf('ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async done')
    /*********************************************/
    /**********        获得数据         *********/
    /*********************************************/
    let getRecord=await businessLogic_async({userId:userId,folderId:recordId})
// ap.wrn('folder result is',getRecord)
//     return Promise.resolve({rc:0,msg:getRecord})
    /*********************************************/
    /********        删除指定字段         *******/
    /*********************************************/
    // ap.inf('getRecord',getRecord)
    if(undefined!==getRecord['folder']){
        for(let singleEle of getRecord['folder']){
            controllerHelper.keepFieldInRecord({record:singleEle,fieldsToBeKeep:['id','name','childNum',e_field.FOLDER.LEVEL]})
        }
    }
    // ap.wrn('after keep folder getRecord',getRecord)
    if(undefined!==getRecord['article']){
        for(let singleEle of getRecord['article']){
            ap.inf('article singleEle',singleEle)
            controllerHelper.keepFieldInRecord({record:singleEle,fieldsToBeKeep:['id','name']})
        }
    }
    // ap.wrn('after keep article getRecord',getRecord)
    /*********************************************/
    /**********      加密 敏感数据       *********/
    /*********************************************/
    // ap.inf('before ecftypr getRecord[\'folder\']',getRecord['folder'])
    // ap.inf('tempSalt',tempSalt)
    if(undefined!==getRecord['folder']){
        for(let singleEle of getRecord['folder']){
            // getRecord['folder'][idx]=getRecord['folder'][idx].toObject()
            controllerHelper.cryptRecordValue({record:singleEle,salt:tempSalt,collName:e_coll.FOLDER})
        }
    }
    ap.wrn('after folder crypt',getRecord)
    // ap.inf('after ecftypr getRecord[\'folder\']',getRecord['folder'])
    if(undefined!==getRecord['article']){
        for(let singleEle of getRecord['article']){
            ap.wrn('singleEle',singleEle)
            // getRecord['article'][idx]=getRecord['article'][idx].toObject()
            controllerHelper.cryptRecordValue({record:singleEle,salt:tempSalt,collName:e_coll.ARTICLE})
        }
    }
    ap.wrn('after article crypt',getRecord)

    return Promise.resolve({rc:0,msg:getRecord})
}

/**************************************/
/*** 读取目录下的内容（目录和文档） ***/
/**************************************/
async function businessLogic_async({folderId,userId}){
    // ap.inf('businessLogic_async in')
    const mongoose=require('mongoose');//用于转换objectId，以便aggreate使用
    let parentFolderId,folderResult,articleResult,childArticleResult,childFolderResult
    //使用aggregate，则objectId必须是mongoose格式
    let folderCondition={},articleCondition={},childFolderCondition={},childArticleCondition={}

    childFolderCondition[e_field.FOLDER.AUTHOR_ID]=mongoose.Types.ObjectId(userId)
    childFolderCondition['dDate']={"$exists":false}
    folderCondition[e_field.FOLDER.AUTHOR_ID]=mongoose.Types.ObjectId(userId)
    folderCondition['dDate']={"$exists":false}

    childArticleCondition[e_field.FOLDER.AUTHOR_ID]=mongoose.Types.ObjectId(userId)
    childArticleCondition['dDate']={"$exists":false}
    //顶级目录的查询条件
    if(undefined===folderId){
        folderCondition[e_field.FOLDER.PARENT_FOLDER_ID]={"$exists":false}

        //获得所有顶级目录的id，加入查询条件
        folderResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.folder,condition:folderCondition})
        // ap.wrn('top folder Result',folderResult)
        /**     转换成object   **/
        if(folderResult.length>0){
            for(let idx in folderResult) {
                // ap.inf('folder indx',idx)
                folderResult[idx] = folderResult[idx].toObject()
                folderResult[idx]['childNum']=0
                // ap.wrn('before typeof',typeof folderResult[idx][e_field.FOLDER.AUTHOR_ID])
                // folderResult[idx][e_field.FOLDER.AUTHOR_ID]=mongoose.Types.ObjectId(userId)
                // ap.wrn('after typeof',typeof folderResult[idx][e_field.FOLDER.AUTHOR_ID])
            }
        }
        childFolderCondition[e_field.FOLDER.PARENT_FOLDER_ID]={"$in":[]}
        childArticleCondition[e_field.ARTICLE.FOLDER_ID]={"$in":[]}
        //查询所有folder下的folder/article数量
        if(folderResult.length>0){
            for(let singleFolder of folderResult){
                childFolderCondition[e_field.FOLDER.PARENT_FOLDER_ID]['$in'].push(mongoose.Types.ObjectId(singleFolder['id']))
                childArticleCondition[e_field.ARTICLE.FOLDER_ID]['$in'].push(mongoose.Types.ObjectId(singleFolder['id']))
            }
        }
        // childFolderCondition[e_field.FOLDER.AUTHOR_ID]={"$in":[]}
        // ap.wrn('childFolderCondition',childFolderCondition)
        // ap.wrn('childArticleCondition',childArticleCondition)
    }
    //非顶级目录
    else{
        folderCondition[e_field.FOLDER.PARENT_FOLDER_ID]=mongoose.Types.ObjectId(folderId)
        //获得所有目录的id，加入查询条件
        folderResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.folder,condition:folderCondition})
        // ap.wrn('folderResult',folderResult)
        /**     转换成object   **/
        if(folderResult.length>0){
            for(let idx in folderResult) {
                // ap.inf('folder indx',idx)
                folderResult[idx] = folderResult[idx].toObject()
                folderResult[idx]['childNum']=0
            }
        }
        childFolderCondition[e_field.FOLDER.PARENT_FOLDER_ID]={"$in":[]}
        childArticleCondition[e_field.ARTICLE.FOLDER_ID]={"$in":[]}
        //查询所有folder下的folder/article数量
        if(folderResult.length>0){
            for(let singleFolder of folderResult){
                childFolderCondition[e_field.FOLDER.PARENT_FOLDER_ID]['$in'].push(mongoose.Types.ObjectId(singleFolder['id']))
                childArticleCondition[e_field.ARTICLE.FOLDER_ID]['$in'].push(mongoose.Types.ObjectId(singleFolder['id']))
            }
        }
// ap.wrn('childFolderCondition',childFolderCondition)
//         ap.wrn('childArticleCondition',childArticleCondition)
        // childFolderCondition[e_field.FOLDER.PARENT_FOLDER_ID]=mongoose.Types.ObjectId(folderId)
        articleCondition[e_field.ARTICLE.AUTHOR_ID]=userId
        articleCondition[e_field.ARTICLE.FOLDER_ID]=folderId
        // ap.wrn('articleCondition',articleCondition)
        articleResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.article,condition:articleCondition})
        /**     转换成object   **/
        if(articleResult.length>0){
            for(let idx in articleResult) {
                // ap.inf('folder indx',idx)
                articleResult[idx] = articleResult[idx].toObject()
                // folderResult[idx]['childNum']=0
            }
        }
    }

    //folderId undefined，说明只能读取最高级的目录（且无文档）
    // if(undefined===folderId){
    //     childFolderCondition[e_field.FOLDER.PARENT_FOLDER_ID]={"$exists":false}

        //获得所有folder的信息

        // ap.wrn('childFolderCondition',childFolderCondition)
        //folder还要获悉是否有文档或者目录，以便决定是否可以点开
        let childFolderAggregateParams=[
            {
                '$match':childFolderCondition,
            },
            {
                '$project':{
                    'name':1,
                    'id':1,
                    [e_field.FOLDER.PARENT_FOLDER_ID]:1,
                },
            },
            {
                '$group':{
                    // _id:{'id':'$_id','name':'$name',},
                    _id:`$${e_field.FOLDER.PARENT_FOLDER_ID}`,
                    'childNum':{$sum:1}
                }
            },
            {
                '$project':{
                    // _id:0,
                    'childNum':1
                }
            },

        ]
        // ap.inf('childFolderAggregateParams',childFolderAggregateParams)
        // ap.inf('before folderResult')
        childFolderResult=await e_dbModel.folder.aggregate(childFolderAggregateParams)
        // ap.wrn('childFolderResult',childFolderResult)

        //将数组转换成对象，方便通过ids索引childNum
        let folderChildNum={}
        if(childFolderResult.length>0){
            for(let singleEle of childFolderResult){
                folderChildNum[singleEle['_id'].toString()]=singleEle['childNum']
                // ap.wrn('folderChildNum',folderChildNum)
            }
        }
        // ap.inf('converted folderChildNum',folderChildNum)
        //将childNum放入folder数组中
        if(folderResult.length>0){
            for(let singleEle of folderResult){
                let folderId=singleEle['_id']
                if(undefined!==folderChildNum[folderId]){
                    singleEle['childNum']+=folderChildNum[folderId]
                }
            }
        }

        //统计每个顶级目录下文档数
        // childArticleCondition[e_field.ARTICLE.FOLDER_ID]={'$in':childFolderCondition}
        let childArticleAggregateParams=[
            {
                '$match':childArticleCondition,
            },
            {
                '$project':{
                    'name':1,
                    'id':1,
                    [e_field.ARTICLE.FOLDER_ID]:1,
                },
            },
            {
                '$group':{
                    // _id:{'id':'$_id','name':'$name',},
                    _id:`$${e_field.ARTICLE.FOLDER_ID}`,
                    'childNum':{$sum:1}
                }
            },
            {
                '$project':{
                    // _id:0,
                    'childNum':1
                }
            },
            // },
        ]
        // ap.wrn('childArticleAggregateParams',childArticleAggregateParams)
        // ap.inf('before folderResult')
        childArticleResult=await e_dbModel.article.aggregate(childArticleAggregateParams)
        // ap.wrn('childArticleResult',childArticleResult)

        //将数组转换成对象，方便通过id所以childNum
        let articleChildNum={}
        if(childArticleResult.length>0){
            for(let singleEle of childArticleResult){
                // ap.wrn('singleEle',singleEle)
                // ap.wrn('singleEle',singleEle)
                articleChildNum[singleEle['_id'].toString()]=singleEle['childNum']
                // ap.wrn('folderChildNum',folderChildNum)
            }
        }
        // ap.wrn('converted articleChildNum',articleChildNum)
        //将childNum放入folder数组中
        if(folderResult.length>0){
            for(let singleEle of folderResult){
                let folderId=singleEle['_id']
                if(undefined!==articleChildNum[folderId]){
                    singleEle['childNum']+=articleChildNum[folderId]
                }
            }
        }
        // ap.wrn('new folderResult',folderResult)
        //顶级目录只有folder，没有article
        return Promise.resolve({folder:folderResult,article:articleResult})

//     else{
//         childFolderCondition[e_field.FOLDER.PARENT_FOLDER_ID]=mongoose.Types.ObjectId(folderId)
//         childArticleCondition[e_field.ARTICLE.FOLDER_ID]=mongoose.Types.ObjectId(folderId)
// // ap.wrn('childArticleCondition',childArticleCondition)
//         folderResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.folder,condition:childFolderCondition})
//         childArticleResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.article,condition:childArticleCondition})
//         // ap.inf('childArticleResult',childArticleResult)
//         /*****  转换格式 *******/
//         if(folderResult.length>0){
//             for(let idx in folderResult) {
//                 folderResult[idx] = folderResult[idx].toObject()
//             }
//         }
//         // ap.inf('folderResult after ovject',folderResult)
//         if(childArticleResult.length>0){
//             for(let idx in childArticleResult) {
//                 childArticleResult[idx] = childArticleResult[idx].toObject()
//             }
//         }
//
//         return Promise.resolve({folder:folderResult,article:childArticleResult})
//     }




// ap.inf('childFolderCondition',childFolderCondition)

    //
    // ap.inf('childArticleResult',childFolderCondition)


}
module.exports={
    getRootFolder_async,
    getNonRootFolder_async,
}