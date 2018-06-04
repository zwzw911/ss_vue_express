/**
 * Created by ada on 2017/9/1.
 */
'use strict'

/******************    内置lib和第三方lib  **************/
const ap=require(`awesomeprint`)

/**************  controller相关常量  ****************/
const controller_setting=require('../user_setting/user_setting').setting
const controllerError=require('../user_setting/user_controllerError').controllerError

/***************  数据库相关常量   ****************/
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject
/***************  rule   ****************/
const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule

const server_common_file_require=require('../../../../server_common_file_require')
/**************  公共常量   ******************/
const mongoEnum=server_common_file_require.mongoEnum
const e_accountType=mongoEnum.AccountType.DB
const e_docStatus=mongoEnum.DocStatus.DB
const e_userType=mongoEnum.UserType.DB
const e_resourceType=mongoEnum.ResourceType.DB

const nodeEnum=server_common_file_require.nodeEnum
const e_env=nodeEnum.Env
const e_part=nodeEnum.ValidatePart

const nodeRuntimeEnum=server_common_file_require.nodeRuntimeEnum
const e_hashType=nodeRuntimeEnum.HashType
const e_inputValueLogicCheckStep=nodeRuntimeEnum.InputValueLogicCheckStep

const e_applyRange=server_common_file_require.inputDataRuleType.ApplyRange



/**************  公共函数   ******************/
const controllerInputValueLogicCheck=server_common_file_require.controllerInputValueLogicCheck
const dataConvert=server_common_file_require.dataConvert
const controllerHelper=server_common_file_require.controllerHelper
const controllerChecker=server_common_file_require.controllerChecker
const common_operation_model=server_common_file_require.common_operation_model
const misc=server_common_file_require.misc
const hash=server_common_file_require.crypt.hash

/*************** 配置信息 *********************/
const currentEnv=server_common_file_require.appSetting.currentEnv
const globalConfiguration=server_common_file_require.globalConfiguration

const regex=server_common_file_require.regex.regex
const user_misc_func=require('./user_misc_func')


//添加内部产生的值（hash password）
//对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）
//对数值逻辑进行判断（外键是否有对应的记录等）
//执行db操作并返回结果
async  function createUser_async({req}){
    // console.log(`create user in`)
    // ap.inf('create use in')
    /*************************************************/
    /************     首先检查captcha     ***********/
    /************************************************/
    await controllerHelper.getCaptchaAndCheck_async({req:req,db:2})


    /*************************************************/
    /************      define variant     ***********/
    /************************************************/
    let collName=e_coll.USER
    let docValue=req.body.values[e_part.RECORD_INFO]
// ap.inf('collName',collName)
// ap.inf('docValue',docValue)
    /**********************************************/
    /********  删除undefined/null字段  ***********/
    /*********************************************/
    dataConvert.constructCreateCriteria(docValue)


    /**********************************************/
    /***********    用户类型检测    **************/
    /*********************************************/
    // ap.inf('efore user input check pass')
    /*******************************************************************************************/
    /******************     CALL FUNCTION:inputValueLogicValidCheck        *********************/
    /*******************************************************************************************/
    let commonParam={docValue:docValue,userId:undefined,collName:collName}
    let stepParam={
        [e_inputValueLogicCheckStep.FK_EXIST_AND_PRIORITY]:{flag:true,optionalParam:undefined},
        [e_inputValueLogicCheckStep.ENUM_DUPLICATE]:{flag:true,optionalParam:undefined},
        //object：coll中，对单个字段进行unique检测，需要的额外查询条件
        [e_inputValueLogicCheckStep.SINGLE_FIELD_VALUE_UNIQUE]:{flag:true,optionalParam:{singleValueUniqueCheckAdditionalCondition:{[e_field.USER.DOC_STATUS]:e_docStatus.DONE}}},
        //数组，元素是字段名。默认对所有dataType===string的字段进行XSS检测，但是可以通过此变量，只选择部分字段
        [e_inputValueLogicCheckStep.XSS]:{flag:true,optionalParam:{expectedXSSFields:{optionalParam:undefined}}},
        //object，对compoundField进行unique检测需要的额外条件，key从model->mongo->compound_unique_field_config.js中获得
        //在internalValue之后执行
        // [e_inputValueLogicCheckStep.COMPOUND_VALUE_UNIQUE]:{flag:true,optionalParam:{compoundFiledValueUniqueCheckAdditionalCheckCondition:undefined}},
        //Object，配置resourceCheck的一些参数,{requiredResource,resourceProfileRange,userId,containerId}
        [e_inputValueLogicCheckStep.RESOURCE_USAGE]:{flag:false,optionalParam:{resourceUsageOption:undefined}},
    }
    await controllerInputValueLogicCheck.inputValueLogicValidCheck_async({commonParam:commonParam,stepParam:stepParam})
// ap.inf('user input check pass')
/*    /!*      因为name是unique，所以要检查用户名是否存在(unique check)     *!/
    if(undefined!==e_uniqueField[collName] &&  e_uniqueField[collName].length>0) {
        let additionalCheckCondition={[e_field.USER.DOC_STATUS]:e_docStatus.DONE}
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue,additionalCheckCondition:additionalCheckCondition})
    }*/
// console.log(`ifFiledInDocValueUnique_async done===>`)

    //如果用户在db中存在，但是创建到一半，则删除用户(然后重新开始流程)
    let tmpResult
    let condition={name:docValue[e_field.USER.NAME]}
    let docStatusTmpResult=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.user,condition:condition})
    if(docStatusTmpResult[0] && e_docStatus.PENDING===docStatusTmpResult[0][e_field.USER.DOC_STATUS]){
        await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.user,condition:condition})
        // onsole.log(`docStatusTmpResult ${JSON.stringify(docStatusTmpResult)}`)
        //删除可能的关联记录
        //sugarI
        await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.sugar,condition:{userId:docStatusTmpResult[0][e_field.USER.ID]}})
        // onsole.log(`docStatusTmpResult ${JSON.stringify(docStatusTmpResult)}`)
        //user_friend_group
        await common_operation_model.deleteOne_returnRecord_async({dbModel:e_dbModel.user_friend_group,condition:{userId:docStatusTmpResult[0][e_field.USER.ID]}})
        // onsole.log(`docStatusTmpResult ${JSON.stringify(docStatusTmpResult)}`)
    }

    /*                  添加内部产生的值（sugar && hash password && acountType）                  */
    // console.log(`before hash is ${JSON.stringify(docValue)}`)
    let internalValue={}
/*    let sugarLength=5 //1~10
    let sugar=misc.generateRandomString(sugarLength)
// console.log(`password =======> ${docValue[e_field.USER.PASSWORD]}`)
// console.log(`sugar =======> ${sugar}`)
    tmpResult=hash(`${docValue[e_field.USER.PASSWORD]}${sugar}`,e_hashType.SHA256)
    // console.log(`hash   ${JSON.stringify(tmpResult)}`)
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }*/
    // console.log(`password ======> ${JSON.stringify(docValue[e_field.USER.PASSWORD])}`)
    let hashResult=controllerHelper.generateSugarAndHashPassword({ifAdminUser:false,ifUser:true,password:docValue[e_field.USER.PASSWORD]})
    if(hashResult.rc>0){return Promise.reject(hashResult)}
    // console.log(`hashresult ======> ${JSON.stringify(hashResult)}`)
    let sugar=hashResult.msg['sugar']
    internalValue[e_field.USER.PASSWORD]=hashResult.msg['hashedPassword']
    internalValue[e_field.USER.DOC_STATUS]=e_docStatus.PENDING

// console.log(`docValue   ${JSON.stringify(docValue)}`)
    let accountValue=docValue[e_field.USER.ACCOUNT]
    if(regex.email.test(accountValue)){
        internalValue[e_field.USER.ACCOUNT_TYPE]=e_accountType.EMAIL
    }
    if(regex.mobilePhone.test(accountValue)){
        internalValue[e_field.USER.ACCOUNT_TYPE]=e_accountType.MOBILE_PHONE
    }

    // docValue[e_field.USER.USED_ACCOUNT]=docValue[e_field.USER.ACCOUNT]
    internalValue[e_field.USER.LAST_ACCOUNT_UPDATE_DATE]=Date.now()
    internalValue[e_field.USER.LAST_SIGN_IN_DATE]=Date.now()
    internalValue[e_field.USER.USER_TYPE]=e_userType.USER_NORMAL
// console.log(`internalValue====>   ${JSON.stringify(internalValue)}`)
    // console.log(`internalValue[e_field.USER.LAST_ACCOUNT_UPDATE_DATE]====>   ${JSON.stringify(internalValue[e_field.USER.LAST_ACCOUNT_UPDATE_DATE])}`)
    /*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           */
    // console.log(`internalValue =======> ${JSON.stringify(internalValue)}`)
    // console.log(`collInputRule =======> ${JSON.stringify(inputRule[e_coll.USER])}`)
    // console.log(`collInternalRule =======> ${JSON.stringify(internalInputRule[e_coll.USER])}`)
    // ap.inf('after interval',internalValue)
    if(e_env.DEV===currentEnv){
        // ap.inf('req.body.values',req.body.values)
        // ap.inf('internalValue',internalValue)
        // ap.inf('collInternalRule',internalInputRule[collName])
        // ap.inf('applyRange',e_applyRange.CREATE)
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInternalRule:internalInputRule[collName],applyRange:e_applyRange.CREATE})
        // console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    Object.assign(docValue,internalValue)
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
    // console.log(`docValue ${JSON.stringify(docValue)}`)
    //用户插入 db
    let userCreateTmpResult= await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.user,value:docValue})


    // console.log(`user created  ==========> ${JSON.stringify(userCreateTmpResult)}`)

    //对关联表sugar进行insert操作
    let sugarValue={userId:userCreateTmpResult._id,sugar:sugar}
    // console.log(`sugarValue ${JSON.stringify(sugarValue)}`)
    await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.sugar,value:sugarValue})
    // ap.inf('sugarValue insert done')


    //对关联表user_friend_group进行insert操作
    let defaultGroupName=globalConfiguration.userGroupFriend.defaultGroupName.enumFormat
    let userFriendGroupValue=[
        {
            [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:userCreateTmpResult._id,
            [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:defaultGroupName.MyFriend,
            [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:[]
        },
        {
            [e_field.USER_FRIEND_GROUP.OWNER_USER_ID]:userCreateTmpResult._id,
            [e_field.USER_FRIEND_GROUP.FRIEND_GROUP_NAME]:defaultGroupName.BlackList,
            [e_field.USER_FRIEND_GROUP.FRIENDS_IN_GROUP]:[]
        }
    ]
    // ap.inf('userFriendGroupValue',userFriendGroupValue)
    await common_operation_model.insertMany_returnRecord_async({dbModel:e_dbModel.user_friend_group,docs:userFriendGroupValue})
    // await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.user_friend_group,value:userFriendGroupValue})
    // console.log(`tmpResult is ${JSON.stringify(tmpResult)}`)

    //对关联表folder进行insert操作
    let folderValue={authorId:userCreateTmpResult._id,name:'我的文档',[e_field.FOLDER.LEVEL]:1}
    // console.log(`sugarValue ${JSON.stringify(sugarValue)}`)
    await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.folder,value:folderValue})

    //对关联表user_resource_profile进行insert操作,插入默认资源设置
    let userResourceProfile=[]
    // console.log(`e_iniSettingObject.resource_profile.DEFAULT==========>${JSON.stringify(e_iniSettingObject.resource_profile.DEFAULT)}`)
    //从数据库读，而不是文件中获得(获得一致性)
    condition={[e_field.RESOURCE_PROFILE.RESOURCE_TYPE]:e_resourceType.BASIC}
    // ap.inf('condition',condition)
    let allBasicResourceProfile=await common_operation_model.find_returnRecords_async({dbModel:e_dbModel.resource_profile,condition:condition})
    // ap.inf('user profile',allBasicResourceProfile)
    for(let defaultResourceProfile of allBasicResourceProfile){
        // for(let resourceProfileId)
        // console.log(`defaultResourceProfile==========>${JSON.stringify(defaultResourceProfile)}`)
        let defaultResourceProfileId=defaultResourceProfile['id']
        let tmp={}
        tmp[e_field.USER_RESOURCE_PROFILE.USER_ID]=userCreateTmpResult._id
        tmp[e_field.USER_RESOURCE_PROFILE.RESOURCE_PROFILE_ID]=defaultResourceProfileId
        tmp[e_field.USER_RESOURCE_PROFILE.DURATION]=0
        tmp[e_field.USER_RESOURCE_PROFILE.START_DATE]=Date.now()
        tmp[e_field.USER_RESOURCE_PROFILE.END_DATE]=new Date('2099')
        userResourceProfile.push(tmp)
        // ap.inf('folder result',tmp)
    }
    await common_operation_model.insertMany_returnRecord_async({dbModel:e_dbModel.user_resource_profile,docs:userResourceProfile})

    //对关联表user_resource_static进行insert操作，为article_image和article_attachment插入fileNum和size为0 的记录
    let userResourceStaticValue=[
        {
            [e_field.USER_RESOURCE_STATIC.USER_ID]:userCreateTmpResult._id,
            [e_field.USER_RESOURCE_STATIC.RESOURCE_TYPE]:e_resourceType.ARTICLE_IMAGE,
            [e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_NUM]:0,
            [e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_SIZE_IN_MB]:0,
        },
        {
            [e_field.USER_RESOURCE_STATIC.USER_ID]:userCreateTmpResult._id,
            [e_field.USER_RESOURCE_STATIC.RESOURCE_TYPE]:e_resourceType.ARTICLE_ATTACHMENT,
            [e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_NUM]:0,
            [e_field.USER_RESOURCE_STATIC.UPLOADED_FILE_SIZE_IN_MB]:0,
        },
        ]
    // console.log(`sugarValue ${JSON.stringify(sugarValue)}`)
    await common_operation_model.insertMany_returnRecord_async({dbModel:e_dbModel.user_resource_static,docs:userResourceStaticValue})




// return false
    //最终置user['docStatus']为DONE，且设置lastSignInDate
    await common_operation_model.findByIdAndUpdate_returnRecord_async({dbModel:e_dbModel.user,id:userCreateTmpResult._id,updateFieldsValue:{'docStatus':e_docStatus.DONE,'lastSignInDate':Date.now()}})
    /*    if(tmpResult.rc>0){
     return Promise.reject(tmpResult)
     }*/

    return Promise.resolve({rc:0})
}

module.exports={
    createUser_async,
}