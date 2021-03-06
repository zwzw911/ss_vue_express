/**
 * Created by ada on 2017/9/1.
 */
'use strict'
const ap=require(`awesomeprint`)

/*                      controller setting                */
const controller_setting=require('../impeach_setting/impeach_setting').setting
const controllerError=require('../impeach_setting/impeach_controllerError').controllerError

/*                      specify: genEnum                */
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
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
const e_allUserType=mongoEnum.AllUserType.DB
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

const globalConfiguration=server_common_file_require.globalConfiguration

async function updateImpeach_async({req,expectedPart}){
    // console.log(`updateUser_async in`)
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    /*******************************************************************************************/
    /*                                          define variant                                 */
    /*******************************************************************************************/
    let tmpResult,collName=controller_setting.MAIN_HANDLED_COLL_NAME
    let convertedNoSql //为editSubField设置
    let recordInfoNotChange=false,editSubFieldValueNotChange=false //检测是否需要做update
    // console.log(`req============>${JSON.stringify(req)}`)
    let userInfo=await controllerHelper.getLoginUserInfo_async({req:req})
    let {userId,userCollName,userType,userPriority}=userInfo
    // console.log(`userInfo============>${JSON.stringify(userInfo)}`)
    let {docValue,recordId,subFieldValue}=controllerHelper.getPartValue({req:req,arr_expectedPart:expectedPart})
    // console.log(`docValue============>${JSON.stringify(docValue)}`)
    // console.log(`recordId============>${JSON.stringify(recordId)}`)
    /*******************************************************************************************/
    /*                                     用户类型和权限检测                                  */
    /*******************************************************************************************/
    await controllerChecker.ifExpectedUserType_async({currentUserType:userType,arr_expectedUserType:[e_allUserType.USER_NORMAL]})

    let hasCreatePriority=await controllerChecker.ifAdminUserHasExpectedPriority_async({userPriority:userPriority,arr_expectedPriority:[e_adminPriorityType.CREATE_ADMIN_USER]})
    if(false===hasCreatePriority){
        return Promise.reject(controllerError.currentUserHasNotPriorityToCreateUser)
    }
    /*******************************************************************************************/
    /*                                     参数过滤                                           */
    /*******************************************************************************************/
    if(undefined!==docValue){
        dataConvert.constructUpdateCriteria(docValue,fkConfig[collName])
    }
    // console.log(`docValue after constructUpdateCriteria============>${JSON.stringify(docValue)}`)

    /*******************************************************************************************/
    /*                                       authorization check                               */
    /*******************************************************************************************/
    //当前用户必须是impeach comment的创建人，且impeach comment未被删除
    tmpResult=await controllerChecker.ifCurrentUserTheOwnerOfCurrentRecord_yesReturnRecord_async({
        dbModel:e_dbModel.impeach_comment,
        recordId:recordId,
        ownerFieldsName:[e_field.IMPEACH_COMMENT.AUTHOR_ID],
        userId:userId,
        additionalCondition:undefined
    })
    if(false===tmpResult){
        return Promise.reject(controllerError.notImpeachCreatorCantUpdateComment)
    }
    let originalDoc=misc.objectDeepCopy(tmpResult)

    /*******************************************************************************************/
    /*                             value cant be changed                                       */
    /*******************************************************************************************/
    if(undefined!==docValue) {
        let defaultGroupName = globalConfiguration.userGroupFriend.defaultGroupName.enumFormat
        let notAllowChangeField = {
            [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]: [defaultGroupName.MyFriend, defaultGroupName.BlackList]
        }
        for (let singleNotAllowChangeField in notAllowChangeField) {
            //如果要更改的字段处于notAllowChangeField中，且有值，其值位是默认值
            if (undefined !== originalDoc[singleNotAllowChangeField] && -1 !== notAllowChangeField[singleNotAllowChangeField].indexOf(originalDoc[singleNotAllowChangeField])) {
                return Promise.reject(controllerError.notAllowUpdateDefaultRecord)
            }
        }
    }
    /*******************************************************************************************/
    /*                              edit sub field value check and convert                     */
    /*******************************************************************************************/
    if(undefined!==subFieldValue){
        //对eleArray中的值进行检测:1.fk是否存在，2. To如果存在，满足数量要求否 3. （额外）其中每个记录，用户是否有权操作
        for(let singleFieldName in subFieldValue){
            let singleSubFieldValue=subFieldValue[singleFieldName] //subFieldValue中，单个字段的值
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
        //转换成nosql
        convertedNoSql=await dataConvert.convertEditSubFieldValueToNoSql({editSubFieldValue:subFieldValue})

        //从convertedNoSql中的key，查询id是否valid(convertedNoSql合并了form/to的id，检查更快)
        //检查from/to的值
        let fromToError={
            fromToRecordIdNotExists:controllerError.fromToRecordIdNotExists,
            notOwnFromToRecordId:controllerError.notOwnFromToRecordId,
        }
        await controllerHelper.checkEditSubFieldFromTo_async({
            convertedNoSql:convertedNoSql,
            fromToAdditionCondition:undefined, //验证from/to的id对应doc是否valid，是否需要额外的条件
            collName:e_coll.USER_FRIEND_GROUP,
            recordOwnerFieldName:e_field.USER_FRIEND_GROUP.OWNER_USER_ID,//验证from/to的id对应doc是否为当前用户所有
            userId:userId,
            error:fromToError,
        })
    }
    /*******************************************************************************************/
    /*                              remove not change field                                    */
    /*******************************************************************************************/
    controllerHelper.deleteNotChangedValue({inputValue:docValue,originalValue:originalDoc})
    /*******************************************************************************************/
    /*                          check field number after delete                                */
    /*******************************************************************************************/
    //如果删除完 值没有变化 和 不能更改的字段后，docValue为空，则无需任何修改，直接返回0
    //如果recordInfo不存在；或者存在，但是删除完未变化的字段后为空
    if(undefined===docValue || 0===Object.keys(docValue).length){
        recordInfoNotChange=true
    }
    //如果editSubFieldValue不存在；或者存在，但是转换后的nosql为空。那么说明editSub不需要做update
    if(undefined===subFieldValue || undefined===convertedNoSql){
        editSubFieldValueNotChange=true
    }
    if(true===recordInfoNotChange && true===editSubFieldValueNotChange){
        return Promise.resolve({rc:0})
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
    //在fkConfig中定义的外键检查(fkConfig中设置查询条件)
    if(undefined!==fkConfig[collName] && undefined!==docValue){
        await controllerChecker.ifFkValueExist_async({docValue:docValue,collFkConfig:fkConfig[collName],collFieldChineseName:e_chineseName[collName]})
    }
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
    if(undefined!==docValue){
        let XssCheckField=[e_field.IMPEACH.TITLE,e_field.IMPEACH.CONTENT]
        await controllerHelper.inputFieldValueXSSCheck({docValue:docValue,collName:collName,expectedXSSCheckField:XssCheckField})

        //如果content存在，XSS和图片检测
        if(undefined!==docValue[e_field.IMPEACH.CONTENT]){
            let content=docValue[e_field.IMPEACH.CONTENT]
            // let content=docValue[e_field.IMPEACH.CONTENT]
            // await controllerHelper.contentXSSCheck_async({content:content,fieldName:e_field.IMPEACH.CONTENT})

            let collConfig={
                collName:e_coll.IMPEACH,  //存储内容（包含图片DOM）的coll名字
                fkFieldName:e_field.IMPEACH.IMPEACH_IMAGES_ID,//coll中，存储图片objectId的字段名
                contentFieldName:e_field.IMPEACH.CONTENT, //coll中，存储内容的字段名
                ownerFieldName:e_field.IMPEACH.CREATOR_ID,// coll中，作者的字段名
            }
            let collImageConfig={
                collName:e_coll.IMPEACH_IMAGE,//实际存储图片的coll名
                fkFieldName:e_field.IMPEACH_IMAGE.REFERENCE_ID, //字段名，记录图片存储在那个coll中
                imageHashFieldName:e_field.IMPEACH_IMAGE.HASH_NAME //记录图片hash名字的字段名
            }
            let {content,deletedFileNum,deletedFileSize}=await controllerHelper.contentDbDeleteNotExistImage_async({
                content:content,
                recordId:recordId,
                collConfig:collConfig,
                collImageConfig:collImageConfig,
            })
            docValue[e_field.IMPEACH.CONTENT]=content
        }
    }

    /*******************************************************************************************/
    /*                                  field value duplicate check                            */
    /*******************************************************************************************/
    if(undefined!==e_uniqueField[collName] && e_uniqueField[collName].length>0) {
        // let additionalCheckCondition={[e_field.ADMIN_USER.DOC_STATUS]:e_docStatus.DONE}
        let additionalCheckCondition
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue,additionalCheckCondition:additionalCheckCondition})
    }

    /*******************************************************************************************/
    /*                         添加internal field，然后检查                                    */
    /*******************************************************************************************/
    let internalValue={}
    if(e_env.DEV===currentEnv && Object.keys(internalValue).length>0){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[collName],collInternalRule:internalInputRule[collName],method:req.body.values[e_part.METHOD]})
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    //因为internalValue只是进行了转换，而不是新增，所以无需ObjectDeepCopy
    if(undefined!==docValue){
        Object.assign(docValue,internalValue)
    }

    /*******************************************************************************************/
    /*                    复合字段unique check（需要internal field完成后）                     */
    /*******************************************************************************************/
    //根据compound_unique_field_config中的设置，进行唯一查询
    //如果不唯一，返回已经存在的记录，以便进一步处理
    if(undefined!==docValue) {
        //复合字段的定义中，一个字段不能从client传入，需要手工构造；
        let docValueTobeCheck=Object.assign({},{[e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:userId},docValue)
        let compoundUniqueCheckResult = await controllerChecker.ifCompoundFiledUnique_returnExistRecord_async({
            collName: collName,
            docValue: docValueTobeCheck
        })
        // console.log(`compound field check result===================>${JSON.stringify(compoundUniqueCheckResult)}`)
        //复合字段唯一返回true或者已有的doc
        //有重复值，且重复记录数为1（大于1，已经直接reject）
        if (true !== compoundUniqueCheckResult && undefined!==compoundUniqueCheckResult) {
            if (undefined !== docValue[e_field.IMPEACH.IMPEACHED_ARTICLE_ID]) {
                return Promise.reject(controllerError.articleAlreadyImpeached)
            }
            if (undefined !== docValue[e_field.IMPEACH.IMPEACHED_COMMENT_ID]) {
                return Promise.reject(controllerError.articleCommentAlreadyImpeached)
            }
        }
        if (true === recordInfoNotChange && true === editSubFieldValue) {
            return Promise.resolve({rc: 0})
        }
    }
    /*******************************************************************************************/
    /*                                  db operation                                           */
    /*******************************************************************************************/
    // await common_operation_model.update_returnRecord_async({dbModel:e_dbModel[collName],id:recordId,values:docValue})
    let promiseTobeExec=[]
    //edit_sub_field对应的nosql，转换成db操作
    if(false===editSubFieldValueNotChange){
        for(let singleRecordId in convertedNoSql){
            promiseTobeExec.push(common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel[collName],id:singleRecordId,updateFieldsValue:convertedNoSql[singleRecordId]}))
        }
    }
    if(false===recordInfoNotChange) {
        //普通update操作
        promiseTobeExec.push(common_operation_model.findByIdAndUpdate_returnRecord_async({
            dbModel: e_dbModel[collName],
            id: recordId,
            updateFieldsValue: docValue
        }))
    }
    //同步执行
    await Promise.all(promiseTobeExec)
    return Promise.resolve({rc:0})


}

module.exports={
    updateImpeach_async,
}