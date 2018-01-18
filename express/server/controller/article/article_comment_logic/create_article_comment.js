/**
 * Created by wzhan039 on 2017/10/26.
 */
'use strict'


/*                      controller setting                */
const controller_setting=require('../article_comment_setting/article_comment_setting').setting
const controllerError=require('../article_comment_setting/article_comment_controllerError').controllerError

/*                      specify: genEnum                */
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_fieldChineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
const enumValue=require(`../../../constant/genEnum/enumValue`)

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
// const e=server_common_file_require.enum
const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart

// const e_hashType=nodeRuntimeEnum.

const e_articleStatus=mongoEnum.ArticleStatus.DB
const e_docStatus=mongoEnum.DocStatus.DB
const e_impeachType=mongoEnum.ImpeachType.DB
const e_impeachUserAction=mongoEnum.ImpeachUserAction.DB
const e_impeachState=mongoEnum.ImpeachState.DB

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

/*              新article无任何输入，所有的值都是内部产生                */
async  function createArticleComment_async({req}){
    /*******************************************************************************************/
    /*                                          define variant                                 */
    /*******************************************************************************************/
    let tmpResult
    let collName=controller_setting.MAIN_HANDLED_COLL_NAME
    /*    let docValue={
     [e_field.IMPEACH.TITLE]:'新举报',
     [e_field.IMPEACH.CONTENT]:'对文档/评论的内容进行举报',
     }*/
    let docValue=req.body.values[e_part.RECORD_INFO]
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    // console.log(`userInfo===> ${JSON.stringify(userInfo)}`)
    let {userId,userCollName,userType,userPriority}=userInfo
// console.log(`userId ====>${userId}`)

    /*******************************************************************************************/
    /*                                          传入数据过滤                                   */
    /*******************************************************************************************/
    dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])

    /*******************************************************************************************/
    /*                                  fk value是否存在                                       */
    /*******************************************************************************************/
    await controllerChecker.ifFkValueExist_async({docValue:docValue,collFkConfig:fkConfig[collName],collFieldChineseName:e_fieldChineseName[collName]})
    // console.log(`fk value check done=========>`)
    /*******************************************************************************************/
    /*                                 article不为delete，且状态为 公开？                      */
    /*******************************************************************************************/


// console.log(`docValue is ====>${JSON.stringify(docValue)}`)
    /*******************************************************************************************/
    /*                         添加internal field，然后检查                                    */
    /*******************************************************************************************/
    let internalValue={}
    internalValue[e_field.ARTICLE_COMMENT.AUTHOR_ID]=userId
    if(e_env.DEV===currentEnv && Object.keys(internalValue).length>0){
        // console.log(`before newDocValue====>${JSON.stringify(internalValue)}`)
        // let newDocValue=dataConvert.addSubFieldKeyValue(internalValue)
        // console.log(`newDocValue====>${JSON.stringify(newDocValue)}`)
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[e_coll.ARTICLE],collInternalRule:internalInputRule[collName],method:req.body.values[e_part.METHOD]})
// console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    Object.assign(docValue,internalValue)
    console.log(`internal check done=========>`)
    /*******************************************************************************************/
    /*                 因为name是unique，所以要检查用户名是否存在(unique check)                */
    /*******************************************************************************************/
    if(undefined!==e_uniqueField[collName] &&  e_uniqueField[collName].length>0) {
        // let additionalCheckCondition={[e_field.ADMIN_USER.DOC_STATUS]:e_docStatus.DONE}
        // await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue,additionalCheckCondition:additionalCheckCondition})
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue})
    }
    /*******************************************************************************************/
    /*                                  db operation                                           */
    /*******************************************************************************************/
    tmpResult= await common_operation_model.create_returnRecord_async({dbModel:e_dbModel[collName],value:docValue})
    // console.log(`create result is ====>${JSON.stringify(tmpResult)}`)
    // console.log(`db op done=========>`)
    return Promise.resolve({rc:0,msg:tmpResult})
}

module.exports={
    createArticleComment_async,
}