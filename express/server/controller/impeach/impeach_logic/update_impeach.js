/**
 * Created by ada on 2017/9/1.
 *
 * 用户为提交的时候，可以进行update的操作
 */
'use strict'
/*                      controller setting                */
const controller_setting=require('../impeach_setting/impeach_setting').setting
const controllerError=require('../impeach_setting/impeach_controllerError').controllerError

/*                      specify: genEnum                */
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
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

const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart

const e_hashType=nodeRuntimeEnum.HashType

const e_accountType=mongoEnum.AccountType.DB
const e_docStatus=mongoEnum.DocStatus.DB
const e_adminUserType=mongoEnum.AdminUserType.DB
const e_adminPriorityType=mongoEnum.AdminPriorityType.DB
const e_resourceType=mongoEnum.ResourceType.DB
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

async function updateImpeach_async({req}){
    console.log(`updateUser_async in`)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    /*******************************************************************************************/
    /*                                          define variant                                 */
    /*******************************************************************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME
    // console.log(`req============>${JSON.stringify(req)}`)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority}=userInfo
    // console.log(`userInfo============>${JSON.stringify(userInfo)}`)
    let docValue=req.body.values[e_part.RECORD_INFO]
    let recordId=req.body.values[e_part.RECORD_ID]
    // console.log(`docValue============>${JSON.stringify(docValue)}`)
    // console.log(`recordId============>${JSON.stringify(recordId)}`)
    /*******************************************************************************************/
    /*                                     参数过滤                                           */
    /*******************************************************************************************/
    dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])
    // console.log(`docValue after constructUpdateCriteria============>${JSON.stringify(docValue)}`)
    /*******************************************************************************************/
    /*                          delete field cant be update from client                        */
    /*******************************************************************************************/
    //以下字段，CREATE是client输入，但是update时候，无法更改，所以需要删除
    let notAllowUpdateFields=[e_field.IMPEACH.IMPEACHED_ARTICLE_ID,e_field.IMPEACH.IMPEACHED_COMMENT_ID,e_field.IMPEACH.CURRENT_STATE]
    for(let singleNotAllowUpdateField of notAllowUpdateFields){
        delete docValue[singleNotAllowUpdateField]
    }
    /*******************************************************************************************/
    /*                                       authorization check                               */
    /*******************************************************************************************/
    //当前要改更的举报是当前用户所创
/*    let condition={}
    condition['_id']=recordId
    condition[e_field.IMPEACH.CREATOR_ID]=userId
    condition['dDate']={$exists:false}
    // console.log(`condition============>${JSON.stringify(condition)}`)
    tmpResult=await  common_operation_model.find_returnRecords_async({dbModel:e_dbModel[collName],condition:condition})
// console.log(`tmpResult============>${JSON.stringify(tmpResult)}`)
    if(tmpResult.length!==1){
        return Promise.reject(controllerError.notAuthorized)
    }
    let originalDoc=misc.objectDeepCopy({},tmpResult[0])*/

    //当前用户必须是impeach comment的创建人，且impeach comment未被删除
    tmpResult=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({dbModel:e_dbModel[collName],recordId:recordId,ownerFieldName:e_field.IMPEACH.CREATOR_ID,ownerFieldValue:userId,additionalCondition:undefined})
    if(false===tmpResult){
        return Promise.reject(controllerError.notAuthorized)
    }
    let originalDoc=misc.objectDeepCopy(tmpResult)
    /*******************************************************************************************/
    /*                              remove not change field                                    */
    /*******************************************************************************************/
    controllerHelper.deleteNotChangedValue({inputValue:docValue,originalValue:originalDoc})
    /*******************************************************************************************/
    /*                          check field number after delete                                */
    /*******************************************************************************************/
    //如果删除完 值没有变化 和 不能更改的字段后，docValue为空，则无需任何修改，直接返回0
    if(0===Object.keys(docValue).length){
        return {rc:0}
    }
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
    //在fkConfig中定义的外键检查(外键对应的coll固定)
    await controllerChecker.ifFkValueExist_async({docValue:docValue,collFkConfig:fkConfig[collName],collFieldChineseName:e_chineseName[collName]})
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
    let XssCheckField=[e_field.IMPEACH.TITLE,e_field.IMPEACH.CONTENT]
    await controllerHelper.inputFieldValueXSSCheck({docValue:docValue,collName:collName,expectedXSSCheckField:XssCheckField})

    //如果content存在，图片检测
    if(undefined!==docValue[e_field.IMPEACH.CONTENT]){
        let content=docValue[e_field.IMPEACH.CONTENT]
        await controllerHelper.contentXSSCheck_async({content:content,error:controllerError.inputSanityFailed})

        let collConfig={
            collName:e_coll.IMPEACH,  //存储内容（包含图片DOM）的coll名字
            fkFieldName:e_field.IMPEACH.IMPEACH_IMAGES_ID,//coll中，存储图片objectId的字段名
            contentFieldName:e_field.IMPEACH.CONTENT, //coll中，存储内容的字段名
            ownerFieldName:e_field.IMPEACH.CREATOR_ID,// coll中，作者的字段名
        }
        let collImageConfig={
            collName:e_coll.IMPEACH_IMAGE,//实际存储图片的coll名
            fkFieldName:e_field.IMPEACH_IMAGE.REFERENCE_ID, //字段名，记录图片存储在那个coll中
            sizeFieldName:e_field.IMPEACH_IMAGE.SIZE_IN_MB,//字段名，记录图片的size存储在那个field中，以便需要的话，对user_resource_static更新
            imageHashFieldName:e_field.IMPEACH_IMAGE.HASH_NAME, //记录图片hash名字的字段名
            storePathPopulateOpt:[{path:e_field.IMPEACH_IMAGE.PATH_ID,select:e_field.STORE_PATH.PATH}], //需要storePath，以便执行fs.unlink
        }
        docValue[e_field.IMPEACH.CONTENT]=await controllerHelper.contentDbDeleteNotExistImage_async({
            content:content,
            recordId:recordId,
            collConfig:collConfig,
            collImageConfig:collImageConfig,
            resourceType:e_resourceType.IMPEACH_COMMENT_IMAGE,//设置user_resource_static中resourceType字段，如果undefined，说明无需设置user_resource_static
        })
    }

    //impeachType是否为预定义的一种

/*    if(-1===Object.values(enumValue.ImpeachType).indexOf(impeachType)){
        return Promise.reject(controllerError.unknownImpeachType)
    }*/
    //
    // console.log(`docValue XXXXXXXXXXXXX=================>${JSON.stringify(docValue)}`)
/*    if(undefined===docValue[e_field.IMPEACH.IMPEACHED_ARTICLE_ID] && undefined===docValue[e_field.IMPEACH.IMPEACHED_COMMENT_ID]){
        return Promise.reject(controllerError.noImpeachedObject)
    }
    if(undefined!==docValue[e_field.IMPEACH.IMPEACHED_ARTICLE_ID] && undefined!==docValue[e_field.IMPEACH.IMPEACHED_COMMENT_ID]){
        return Promise.reject(controllerError.noImpeachedObject)
    }*/
    /*******************************************************************************************/
    /*                                  field value duplicate check                            */
    /*******************************************************************************************/
    if(undefined!==e_uniqueField[collName] && e_uniqueField[collName].length>0) {
        let additionalCheckCondition={[e_field.ADMIN_USER.DOC_STATUS]:e_docStatus.DONE}
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue,additionalCheckCondition:additionalCheckCondition})
    }

    /*******************************************************************************************/
    /*                         添加internal field，然后检查                                    */
    /*******************************************************************************************/
    let internalValue={}
    if(e_env.DEV===currentEnv && Object.keys(internalValue).length>0){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[collName],collInternalRule:internalInputRule[e_coll.ARTICLE]})
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    //因为internalValue只是进行了转换，而不是新增，所以无需ObjectDeepCopy
    Object.assign(docValue,internalValue)
    /*******************************************************************************************/
    /*                                          unique check                                   */
    /*******************************************************************************************/
    if(undefined!==e_uniqueField[collName] && e_uniqueField[collName].length>0) {
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue})
        //await controllerHelper.ifFiledInDocValueUnique_async({collName: collName, docValue: docValue,e_uniqueField:e_uniqueField,e_chineseName:e_chineseName})
    }

    /*******************************************************************************************/
    /*                                  db operation                                           */
    /*******************************************************************************************/
    // await common_operation_model.update_returnRecord_async({dbModel:e_dbModel[collName],id:recordId,values:docValue})
    await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel[collName],id:recordId,updateFieldsValue:docValue})
    return Promise.resolve({rc:0})


}

module.exports={
    updateImpeach_async,
}