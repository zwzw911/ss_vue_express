/**
 * Created by ada on 2017/9/1.
 */
'use strict'

// const controllerError=require('./user_controllerError').controllerError

/*                      specify: genEnum                */
const e_uniqueField=require('../../../constant/genEnum/DB_uniqueField').UniqueField
// const e_chineseName=require('../../../constant/genEnum/inputRule_field_chineseName').ChineseName
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field
const e_dbModel=require('../../../constant/genEnum/dbModel')
const e_iniSettingObject=require('../../../constant/genEnum/initSettingObject').iniSettingObject
/*                      specify: inputRule                */
const inputRule=require('../../../constant/inputRule/inputRule').inputRule
const internalInputRule=require('../../../constant/inputRule/internalInputRule').internalInputRule

/*                      server common                                           */
const server_common_file_include=require('../../../../server_common_file_require')
const nodeEnum=server_common_file_include.nodeEnum
/*                      server common：function                                       */
const dataConvert=server_common_file_include.dataConvert
const controllerHelper=server_common_file_include.controllerHelper
const controllerChecker=server_common_file_include.controllerChecker
const common_operation_model=server_common_file_include.common_operation_model
const misc=server_common_file_include.misc
const hash=server_common_file_include.crypt.hash
/*                      server common：enum                                       */
const e_accountType=server_common_file_include.mongoEnum.AccountType.DB
const e_docStatus=server_common_file_include.mongoEnum.DocStatus.DB
const e_env=nodeEnum.Env
const e_part=server_common_file_include.nodeEnum.ValidatePart
const e_hashType=server_common_file_include.nodeRuntimeEnum.HashType
/*                      server common：other                                       */
const regex=server_common_file_include.regex.regex
const currentEnv=server_common_file_include.appSetting.currentEnv


//添加内部产生的值（hash password）
//对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）
//对数值逻辑进行判断（外键是否有对应的记录等）
//执行db操作并返回结果
async  function createUser_async(req){
    // console.log(`create user in`)
    let collName=e_coll.USER
    /*                      logic                               */
    let docValue=req.body.values[e_part.RECORD_INFO]
// console.log(`docValue===> ${JSON.stringify(docValue)}`)

    /*              参数转为server格式            */
    dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    dataConvert.constructCreateCriteria(docValue)
// console.log(`createUser_async docValue===> ${JSON.stringify(docValue)}`)
    /*      因为name是unique，所以要检查用户名是否存在(unique check)     */
    if(undefined!==e_uniqueField[collName] &&  e_uniqueField[collName].length>0) {
        let additionalCheckCondition={[e_field.USER.DOC_STATUS]:e_docStatus.DONE}
        await controllerChecker.ifFieldInDocValueUnique_async({collName: collName, docValue: docValue,additionalCheckCondition:additionalCheckCondition})
    }
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
// console.log(`internalValue====>   ${JSON.stringify(internalValue)}`)
    // console.log(`internalValue[e_field.USER.LAST_ACCOUNT_UPDATE_DATE]====>   ${JSON.stringify(internalValue[e_field.USER.LAST_ACCOUNT_UPDATE_DATE])}`)
    /*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           */
    // console.log(`internalValue =======> ${JSON.stringify(internalValue)}`)
    // console.log(`collInputRule =======> ${JSON.stringify(inputRule[e_coll.USER])}`)
    // console.log(`collInternalRule =======> ${JSON.stringify(internalInputRule[e_coll.USER])}`)
    if(e_env.DEV===currentEnv){
        let tmpResult=controllerHelper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[e_coll.USER],collInternalRule:internalInputRule[e_coll.USER]})
        // console.log(`internalValue check result====>   ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }
    Object.assign(docValue,internalValue)
    // console.log(`internal check  is ${JSON.stringify(docValue)}`)
    // let currentColl=e_coll.USER_SUGAR
    // console.log(`value to be insert is ${JSON.stringify(docValue)}`)
    // let doc=new dbModel[currentColl](values[e_part.RECORD_INFO])


    // console.log(`docValue ${JSON.stringify(docValue)}`)
    //用户插入 db
    let userCreateTmpResult= await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.user,value:docValue})


    // console.log(`user created  ==========> ${JSON.stringify(userCreateTmpResult)}`)

    //对关联表sugar进行insert操作
    let sugarValue={userId:userCreateTmpResult._id,sugar:sugar}
    // console.log(`sugarValue ${JSON.stringify(sugarValue)}`)
    await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.sugar,value:sugarValue})
    // console.log(`tmpResult is ${JSON.stringify(tmpResult)}`)


    //对关联表user_friend_group进行insert操作
    let userFriendGroupValue={userId:userCreateTmpResult._id,name:'我的朋友',friendsInGroup:[]}
    // console.log(`sugarValue ${JSON.stringify(sugarValue)}`)
    await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.user_friend_group,value:userFriendGroupValue})
    // console.log(`tmpResult is ${JSON.stringify(tmpResult)}`)

    //对关联表folder进行insert操作
    let folderValue={authorId:userCreateTmpResult._id,name:'我的文档'}
    // console.log(`sugarValue ${JSON.stringify(sugarValue)}`)
    await common_operation_model.create_returnRecord_async({dbModel:e_dbModel.folder,value:folderValue})

    let userResourceProfile=[]
    // console.log(`e_iniSettingObject.resource_profile.DEFAULT==========>${JSON.stringify(e_iniSettingObject.resource_profile.DEFAULT)}`)
    for(let defaultResourceProfile of Object.values(e_iniSettingObject.resource_profile.DEFAULT)){
        // for(let resourceProfileId)
        // console.log(`defaultResourceProfile==========>${JSON.stringify(defaultResourceProfile)}`)
        let tmp={}
        tmp[e_field.USER_RESOURCE_PROFILE.USER_ID]=userCreateTmpResult._id
// console.log(`defaultResourceProfile==========>${JSON.stringify(defaultResourceProfile)}`)
        tmp[e_field.USER_RESOURCE_PROFILE.RESOURCE_PROFILE_ID]=defaultResourceProfile
        tmp[e_field.USER_RESOURCE_PROFILE.DURATION]=0
        userResourceProfile.push(tmp)
    }
    /*    /!*                  以下是测试数据                         *!/
     for(let defaultResourceProfile of Object.values(e_iniSettingObject.resource_profile.ADVANCED)){
     // for(let resourceProfileId)
     // console.log(`defaultResourceProfile==========>${JSON.stringify(defaultResourceProfile)}`)
     let tmp={}
     tmp[e_field.USER_RESOURCE_PROFILE.USER_ID]=userCreateTmpResult.msg._id
     // console.log(`defaultResourceProfile==========>${JSON.stringify(defaultResourceProfile)}`)
     tmp[e_field.USER_RESOURCE_PROFILE.RESOURCE_PROFILE_ID]=defaultResourceProfile
     tmp[e_field.USER_RESOURCE_PROFILE.DURATION]=30
     userResourceProfile.push(tmp)
     }*/


    // console.log(`userResourceProfile ${JSON.stringify(userResourceProfile)}`)
    await common_operation_model.insertMany_returnRecord_async({dbModel:e_dbModel.user_resource_profile,docs:userResourceProfile})


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