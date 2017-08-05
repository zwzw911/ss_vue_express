/**
 * Created by Ada on 2017/7/9.
 * url：
 *  1. /user，根据method的不同，调用不同的函数进行对应的处理
 *  2. /user/unique: 用户注册的时候，对应用户名/账号进行唯一性检查
 */
'use strict'




const fs=require('fs')

const e_userState=require('../../constant/enum/node').UserState
const e_part=require('../../constant/enum/node').ValidatePart
const e_method=require('../../constant/enum/node').Method
const e_randomStringType=require('../../constant/enum/node').RandomStringType
// const e_method=require('../../constant/enum/node').Method

const e_hashType=require('../../constant/enum/node_runtime').HashType

const e_env=require('../../constant/enum/node').Env
const e_docStatus=require('../../constant/enum/mongo').DocStatus.DB
const e_accountType=require('../../constant/enum/mongo').AccountType.DB
const e_storePathUsage=require('../../constant/enum/mongo').StorePathUsage.DB

const currentEnv=require('../../constant/config/appSetting').currentEnv

const dbModel=require('../../model/mongo/dbModel')
const fkConfig=require('../../model/mongo/fkConfig').fkConfig

const e_coll=require('../../constant/enum/DB_Coll').Coll
const e_field=require('../../constant/enum/DB_field').Field
const e_uniqueField=require('../../constant/enum/DB_uniqueField').UniqueField
const e_fileSizeUnit=require('../../constant/enum/node_runtime').FileSizeUnit
// const e_inputFieldCheckType=require('../../constant/enum/node').InputFieldCheckType

const e_storePatUsage=require('../../constant/enum/mongo').StorePathUsage.DB

const helper=require('../helper')
const common_operation_model=require('../../model/mongo/operation/common_operation_model')
const common_operation_document=require('../../model/mongo/operation/common_operation_document')
const hash=require('../../function/assist/crypt').hash
const generateRandomString=require('../../function/assist/misc').generateRandomString
const convertFileSize=require('../../function/assist/misc').convertFileSize
const objectDeepCopy=require('../../function/assist/misc').objectDeepCopy
const sendVerificationCodeByEmail_async=require('../../function/assist/misc').sendVerificationCodeByEmail_async

const populateSingleDoc_async=require('../../model/mongo/operation/helper').populateSingleDoc_async

const ifUserLogin=require('../../function/assist/misc').ifUserLogin
const dataConvert=require('../dataConvert')
const validateCreateRecorderValue=require('../../function/validateInput/validateValue').validateCreateRecorderValue
const validateUpdateRecorderValue=require('../../function/validateInput/validateValue').validateUpdateRecorderValue
const validateCURecordInfoFormat=require('../../function/validateInput/validateFormat').validateCURecordInfoFormat
// const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule
const internalInputRule=require('../../constant/inputRule/internalInputRule').internalInputRule
const inputRule=require('../../constant/inputRule/inputRule').inputRule  //用于dev模式下对inputValue进行格式检查

const mongoError=require('../../constant/error/mongo/mongoError').error

const regex=require('../../constant/regex/regex').regex

const maxNumber=require('../../constant/config/globalConfiguration').maxNumber
const miscConfiguration=require('../../constant/config/globalConfiguration').miscConfiguration

const mailAccount=require('../../constant/config/globalConfiguration').mailAccount


const mongoConfiguration=require('../../model/mongo/common/configuration')
/*         upload user photo         */
const gmImage=require('../../function/assist/gmImage')
const userPhotoConfiguration=require('../../constant/config/globalConfiguration').uploadFileDefine.user_thumb
const e_gmGetter=require('../../constant/enum/node_runtime').GmGetter
const e_gmCommand=require('../../constant/enum/node_runtime').GmCommand
const uploadFile=require('../../function/assist/upload')

/*         generate captcha         */
const captchaIntervalConfiguration=require('../../constant/config/globalConfiguration').intervalCheckConfiguration.captcha


const handleSystemError=require('../../function/assist/system').handleSystemError
const systemError=require('../../constant/error/systemError').systemError

const controllerError={
    /*              common                          */

    nameAlreadyExists:{rc:50100,msg:`用户名已经存在`}, //key名字必须固定为 field+AlreadyExists
    accountAlreadyExists:{rc:50102,msg:`账号已经存在`},
    fieldNotSupport:{rc:50104,msg:`字段名称不正确`},
    /*              login_async               */
    loginMandatoryFieldNotExist(fieldName){return {rc:50106,msg:`缺少字段${fieldName}`}},
    loginFieldNumNotExpected:{rc:50107,msg:`输入字段字段数量不正确`},
    accountNotExist:{rc:50108,msg:`用户或者密码不正确`},//不能泄露具体信息
    accountPasswordNotMatch:{rc:50110,msg:`用户或者密码不正确`},

    /*              updateUser_async            */
    notLogin:{rc:50112,msg:`尚未登录，无法执行用户信息更改`},
    cantUpdateOwnProfile:{rc:50114,msg:`只能更改自己的信息`},
    userNotExist:{rc:50116,msg:`用户信息不存在`},//update的时候，无法根据req.session.userId找到对应的记录
    userNoMatchSugar:{rc:50118,msg:`用户信息不完整，请联系管理员`},
    accountCantChange:{rc:50120,msg:`更改账号过于频繁，请明天再试`},

    /*              retrievePassword_async          */
    accountNotUnique:{rc:50122,msg:`账号错误，请联系管理员`},

    /*              upload user photo               */
    imageSizeInvalid:{rc:50130,msg:`头像的宽度或者高度超出最大值`},


    /*              captcha                          */
    intervalBetween2CaptchaTooShort:{rc:50132,msg:`请求过于频繁，请稍候再试`},
    captchaReqNumInDurationExceed:{rc:50134,msg:`请求次数过多，请稍候再试`},

}


//对CRUD（输入参数带有method）操作调用对应的函数
async function dispatcher_async(req){
    //检查格式
    // console.log(`req is ${JSON.stringify(req.cookies)}`)
    console.log(`dispatcher in`)
    // console.log(`req.body.values ${JSON.stringify(req.body.values)}`)
    let collName=e_coll.USER,tmpResult

    //dispatcher只检测req的结构，以及req中method的格式和值，以便后续可以直接根据method进行调用
    tmpResult=helper.checkMethod({req:req})
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }


    //因为method已经检测过，所有要从req.body.values中删除，防止重复检查
    let method=req.body.values[e_part.METHOD]
    delete req.body.values[e_part.METHOD]

    let userLoginCheck,penalizeCheck,expectedPart
    switch (method){
        case e_method.CREATE: //create
            // console.log(`create in`)

            userLoginCheck={
                needCheck:false,
                // error:controllerError.userNotLoginCantCreateComment
            }
            penalizeCheck={
/*                penalizeType:e_penalizeType.NO_ARTICLE,
                penalizeSubType:e_penalizeSubType.CREATE,
                penalizeCheckError:controllerError.userInPenalizeNoCommentCreate*/
            }
            expectedPart=[e_part.RECORD_INFO]
            // console.log(`before precheck done=====.`)
            await helper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
// console.log(`precheck done=====.`)

            tmpResult=await createUser_async(req)
            // console.log(`create  tmpResult ${JSON.stringify(tmpResult)}`)
            break;
        case e_method.SEARCH:// search
            break;
        case e_method.UPDATE: //update
            userLoginCheck={
                needCheck:false,
                // error:controllerError.userNotLoginCantCreateComment
            }
            penalizeCheck={
                /*                penalizeType:e_penalizeType.NO_ARTICLE,
                                penalizeSubType:e_penalizeSubType.CREATE,
                                penalizeCheckError:controllerError.userInPenalizeNoCommentCreate*/
            }
            expectedPart=[e_part.RECORD_INFO]
            // console.log(`before precheck done=====.`)
            await helper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
            // console.log(`req.session indisp ${JSON.stringify(req.session)}`)
            tmpResult=await updateUser_async(req)
            break;
        case e_method.DELETE: //delete
            break;
        case e_method.MATCH: //match(login_async)
            userLoginCheck={
                needCheck:false,
                // error:controllerError.userNotLoginCantCreateComment
            }
            penalizeCheck={
                /*                penalizeType:e_penalizeType.NO_ARTICLE,
                                penalizeSubType:e_penalizeSubType.CREATE,
                                penalizeCheckError:controllerError.userInPenalizeNoCommentCreate*/
            }
            expectedPart=[e_part.RECORD_INFO]
            // console.log(`before precheck done=====.`)
            await helper.preCheck_async({req:req,collName:collName,method:method,userLoginCheck:userLoginCheck,penalizeCheck:penalizeCheck,expectedPart:expectedPart})
            tmpResult=await login_async(req)
            break;
        default:
            console.log(`======>ERR:Wont in cause method check before`)
            // console.log(`match tmpResult ${JSON.stringify(tmpResult)}`)
    }
    
    return Promise.resolve(tmpResult)
}

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
console.log(`docValue===> ${JSON.stringify(docValue)}`)
    /*      因为name是unique，所以要检查用户名是否存在(unique check)     */
    if(undefined!==e_uniqueField[collName] &&  e_uniqueField[collName].length>0) {
        await helper.ifFiledInDocValueUnique_async({collName: collName, docValue: docValue})
    }


    //如果用户在db中存在，但是创建到一半，则删除用户(然后重新开始流程)
    let tmpResult
    let condition={name:docValue[e_field.USER.NAME]}
    let docStatusTmpResult=await common_operation_model.find({dbModel:dbModel.user,condition:condition})
    if(docStatusTmpResult.msg[0] && e_docStatus.PENDING===docStatusTmpResult.msg[0][e_field.USER.DOC_STATUS]){
        tmpResult=await common_operation_model.deleteOne({dbModel:dbModel.user,condition:condition})
        // onsole.log(`docStatusTmpResult ${JSON.stringify(docStatusTmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
        //删除可能的关联记录
        //sugar
        tmpResult=await common_operation_model.deleteOne({dbModel:dbModel.sugar,condition:{userId:docStatusTmpResult.msg[0][e_field.USER.ID]}})
        // onsole.log(`docStatusTmpResult ${JSON.stringify(docStatusTmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
        //user_friend_group
        tmpResult=await common_operation_model.deleteOne({dbModel:dbModel.user_friend_group,condition:{userId:docStatusTmpResult.msg[0][e_field.USER.ID]}})
        // onsole.log(`docStatusTmpResult ${JSON.stringify(docStatusTmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }
    }


    /*                  添加内部产生的值（sugar && hash password && acountType）                  */
    // console.log(`before hash is ${JSON.stringify(docValue)}`)
    let internalValue={}
    let sugarLength=5 //1~10
    let sugar=generateRandomString(sugarLength)
// console.log(`password =======> ${docValue[e_field.USER.PASSWORD]}`)
// console.log(`sugar =======> ${sugar}`)
    tmpResult=hash(`${docValue[e_field.USER.PASSWORD]}${sugar}`,e_hashType.SHA256)
    // console.log(`hash   ${JSON.stringify(tmpResult)}`)
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }
    internalValue[e_field.USER.PASSWORD]=tmpResult.msg
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
    if(e_env.DEV===currentEnv){
        let tmpResult=helper.checkInternalValue({internalValue:internalValue,collInputRule:inputRule[e_coll.USER],collInternalRule:internalInputRule[e_coll.USER]})
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
    let userCreateTmpResult= await common_operation_model.create({dbModel:dbModel.user,value:docValue})
    if(userCreateTmpResult.rc>0){
        return Promise.reject(userCreateTmpResult)
    }

    // console.log(`user created  ${JSON.stringify(userCreateTmpResult)}`)

    //对关联表sugar进行insert操作
    let sugarValue={userId:userCreateTmpResult.msg._id,sugar:sugar}
    // console.log(`sugarValue ${JSON.stringify(sugarValue)}`)
    tmpResult= await common_operation_model.create({dbModel:dbModel.sugar,value:sugarValue})
    // console.log(`tmpResult is ${JSON.stringify(tmpResult)}`)
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }

    //对关联表user_friend_group进行insert操作
    let userFriendGroupValue={userId:userCreateTmpResult.msg._id,name:'我的朋友',friendsInGroup:[]}
    // console.log(`sugarValue ${JSON.stringify(sugarValue)}`)
    await common_operation_model.create({dbModel:dbModel.user_friend_group,value:userFriendGroupValue})
    // console.log(`tmpResult is ${JSON.stringify(tmpResult)}`)

    //对关联表folder进行insert操作
    let folderValue={authorId:userCreateTmpResult.msg._id,name:'我的文档'}
    // console.log(`sugarValue ${JSON.stringify(sugarValue)}`)
     await common_operation_model.create({dbModel:dbModel.folder,value:folderValue})

// return false
    //最终置user['docStatus']为DONE，且设置lastSignInDate
    tmpResult= await common_operation_model.findByIdAndUpdate({dbModel:dbModel.user,id:userCreateTmpResult.msg._id,updateFieldsValue:{'docStatus':e_docStatus.DONE,'lastSignInDate':Date.now()}})
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }

    return Promise.resolve({rc:0})
}


/*
* 更新用户资料
* 1. 需要对比req中的userId和session中的id是否一致
* */
async function updateUser_async(req){
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    /*                  要更改的记录的owner是否为发出req的用户本身                            */
    let tmpResult,collName=e_coll.USER
    let userId=req.session.userId
    if(undefined===req.session.userId){
        return Promise.reject(controllerError.notLogin)
    }

    if(req.session.userId!==userId){
        return Promise.reject(controllerError.cantUpdateOwnProfile)
    }

    /*              client数据转换                  */
    let docValue=req.body.values[e_part.RECORD_INFO]
    dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    dataConvert.constructUpdateCriteria(docValue,fkConfig[e_coll.USER])

    // let tmpResult=await common_operation_model.findById({dbModel:dbModel[e_coll.USER],id:objectId})
    // let userId=tmpResult.msg[e_field.USER.]



    /*              剔除value没有变化的field            */
    // console.log(`befreo check ${JSON.stringify(docValue)}`)
    //查找对应的记录（docStatus必须是done）
    let condition={_id:req.session.userId,docStatus:e_docStatus.DONE}
    tmpResult=await common_operation_model.find({dbModel:dbModel.user,condition:condition})
    // console.log(`tmpResult====》 ${JSON.stringify(tmpResult)}`)
    // console.log(`condition====》 ${JSON.stringify(condition)}`)
    // console.log(`null===tmpResult.msg====》 ${JSON.stringify(null===tmpResult.msg)}`)
    if(0===tmpResult.msg.length){return Promise.reject(controllerError.userNotExist)}
    let originUserInfo=tmpResult.msg[0]
    //如果传入了password，hash后覆盖原始值
    if(e_field.USER.PASSWORD in docValue){
        let sugarTmpResult=await common_operation_model.find({dbModel:dbModel.sugar,condition:{ userId:originUserInfo.id}})
        if(null===sugarTmpResult.msg){
            return Promise.reject(controllerError.userNoMatchSugar)
        }
        // console.log(`sugarTmpResult=====> ${JSON.stringify(sugarTmpResult)}`)
        let sugar=sugarTmpResult.msg[0]['sugar']
// console.log(`sugar=====> ${JSON.stringify(sugar)}`)
//         console.log(`password value =====> ${JSON.stringify(docValue[e_field.USER.PASSWORD])}`)
//         console.log(`mix value =====> ${docValue[e_field.USER.PASSWORD]}${sugar}`)
        let hashPasswordtmpResult=hash(`${docValue[e_field.USER.PASSWORD]}${sugar}`,e_hashType.SHA256)
        if(hashPasswordtmpResult.rc>0){
            return Promise.reject(hashPasswordtmpResult)
        }
        // console.log(`hash password is ====>${hashPassword}`)
        docValue[e_field.USER.PASSWORD]=hashPasswordtmpResult.msg
        // console.log(` after hash password====> ${JSON.stringify(docValue)}`)

    }
    // console.log(`updateUser after compare with origin value ${JSON.stringify(docValue)}`)
    // console.log(`originUserInfo value ${JSON.stringify(originUserInfo)}`)
    for(let singleFieldName in docValue){
        if(docValue[singleFieldName]===originUserInfo[singleFieldName]){
            delete docValue[singleFieldName]
        }
    }

    // console.log(`updateUser after compare with origin value ${JSON.stringify(docValue)}`)


    if(0===Object.keys(docValue).length){
        return {rc:0}
    }
    console.log(`after check =========>${JSON.stringify(docValue)}`)
    console.log(`collName =========>${JSON.stringify(collName)}`)
    /*              如果有unique字段，需要预先检查unique            */
    if(undefined!==e_uniqueField[collName] && e_uniqueField[collName].length>0) {
        await helper.ifFiledInDocValueUnique_async({collName: collName, docValue: docValue})
    }
    /*if(undefined!==e_uniqueField[e_coll.USER]) {
        for (let singleFieldName in docValue) {
            if (-1 !== e_uniqueField[e_coll.USER].indexOf(singleFieldName)) {
                let ifExist = await helper.ifFieldValueExistInColl_async({
                    dbModel: dbModel.user,
                    fieldName: singleFieldName,
                    fieldValue: docValue[singleFieldName]
                })
// console.log(`singleFieldName: ${singleFieldName}===fieldValue: ${docValue[singleFieldName]}===ifExist ${ifExist}`)
                if (true === ifExist.msg) {
                    return Promise.reject(controllerError[singleFieldName + 'AlreadyExists'])
                }
            }
        }
    }*/

    /*              如果是更新account，
    1. 检测account是否存在usedAccount中，存在，不做任何操作
    2. 如果不存在，usedAccount的长度是否达到最大，达到最大，将第一个元素删除，并将old的account push入数组
    3.
    */
    if(true===e_field.USER.ACCOUNT in docValue){
        // console.log(`USED_ACCOUNT CHECK IN`)
        // console.log(`originUserInfo=======》${JSON.stringify(originUserInfo)}`)
        // console.log(`docValue=======》${JSON.stringify(docValue)}`)
        let originalUsedAccount=originUserInfo[e_field.USER.USED_ACCOUNT]
        let toBeUpdateAccountValue=docValue[e_field.USER.ACCOUNT]
        // console.log(`originalUsedAccount=======》${JSON.stringify(originalUsedAccount)}`)
        // console.log(`toBeUpdateAccountValue=======》${JSON.stringify(toBeUpdateAccountValue)}`)
        //要更新的account没有在历史记录中
        if(-1===originalUsedAccount.indexOf(toBeUpdateAccountValue)){
            //检测历史记录的长度
            while (originalUsedAccount.length>=maxNumber.user.maxUsedAccountNum){
                originalUsedAccount.shift()
            }
            // console.log(`=======>not used`)
            //检查更改账号的间隔
            if(e_env.PROD===currentEnv){
                let duration=(Date.now()-originUserInfo[e_field.USER.LAST_ACCOUNT_UPDATE_DATE])/1000/60
                // console.log(`duration=======>${duration}`)
                if(duration<miscConfiguration.user.accountMinimumChangeDurationInHours){
                    return Promise.reject(controllerError.accountCantChange)
                }
            }

            originalUsedAccount.push(toBeUpdateAccountValue)
            // console.log(`originalUsedAccount=======>${JSON.stringify(originalUsedAccount)}`)
            docValue[e_field.USER.USED_ACCOUNT]=originalUsedAccount
            // console.log(`docValue=======>${JSON.stringify(docValue)}`)
            //添加最近一次更改账号的时间
            docValue[e_field.USER.LAST_ACCOUNT_UPDATE_DATE]=Date.now()
            // console.log(`docValue=======>not used`)
        }

        // console.log(`.USER.USED_ACCOUNT======>${JSON.stringify(docValue)}`)
    }





/*    /!*              如果有更改account，需要几率下来         *!/
    if(undefined!==docValue[e_field.USER.ACCOUNT]){

    }*/

    tmpResult=await common_operation_model.update({dbModel:dbModel[e_coll.USER],id:userId,values:docValue})
    return Promise.resolve({rc:0})

}

async function login_async(req){
    /*                              logic                                   */
    /*              略有不同，需要确定字段有且只有账号和密码                */
    // let usedColl=e_coll.USER
    let docValue = req.body.values[e_part.RECORD_INFO]
    /*              参数转为server格式            */
    dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    // dataConvert.constructCreateCriteria(docValue)

    let expectedField = [e_field.USER.ACCOUNT, e_field.USER.PASSWORD]
    if(Object.keys(docValue).length!==expectedField.length){
        return Promise.reject(controllerError.loginFieldNumNotExpected)
    }
    for (let singleInputFieldName of expectedField) {
        if (false === singleInputFieldName in docValue) {
            return Promise.reject(controllerError.loginMandatoryFieldNotExist(singleInputFieldName))
        }
    }

//    读取sugar，并和输入的password进行运算，得到的结果进行比较
    let condition={account:docValue[e_field.USER.ACCOUNT]}
    let userTmpResult = await common_operation_model.find({dbModel: dbModel.user,condition:condition})
    // if(userTmpResult.rc>0){
    //     return Promise.reject(userTmpResult)
    // }
    if(0===userTmpResult.rc && 0===userTmpResult.msg.length){
        return Promise.reject(controllerError.accountNotExist)
    }
    // console.log(`userTmpResult ${JSON.stringify(userTmpResult)}`)
    condition={userId:userTmpResult.msg[0]['id']}
    let sugarTmpResult = await common_operation_model.find({dbModel: dbModel.sugar,condition:condition})
    if(sugarTmpResult.rc>0){
        return Promise.reject(sugarTmpResult)
    }
// console.log(`password ====> ${JSON.stringify(docValue[e_field.USER.PASSWORD])}`)
// console.log(`sugar====> ${JSON.stringify(sugarTmpResult.msg[0][e_field.SUGAR.SUGAR])}`)

    let encryptPassword=hash(`${docValue[e_field.USER.PASSWORD]}${sugarTmpResult.msg[0][e_field.SUGAR.SUGAR]}`,e_hashType.SHA256)
// console.log(`encryptPassword======> ${JSON.stringify(encryptPassword)}`)
    if(encryptPassword.rc>0){
        return Promise.reject(encryptPassword)
    }

    // console.log(`user/pwd  ${docValue[e_field.USER.ACCOUNT]}///${encryptPassword.msg}`)
    if(userTmpResult.msg[0][e_field.USER.PASSWORD]!==encryptPassword['msg']){
        return Promise.reject(controllerError.accountPasswordNotMatch)
    }

    /*
    *  需要设置session，并设lastSignInDate为当前日期
    * */
    // console.log(`userTmpResult.msg[0]['id'] ${JSON.stringify(userTmpResult.msg[0]['id'])}`)
    req.session.userId=userTmpResult.msg[0]['id']
    await common_operation_model.findByIdAndUpdate({dbModel:dbModel.user,id:userTmpResult.msg[0]['id'],updateFieldsValue:{'lastSignInDate':Date.now()}})
    return Promise.resolve({rc:0})
}



/*                      检查用户名/账号的唯一性                           */
async  function  uniqueCheck_async(req) {
    // console.log(`unique check is ${JSON.stringify(req.body.values)} `)

let collName=e_coll.USER
    let tmpResult=helper.nonCRUDreCheck({
        req:req,
        expectUserState:e_userState.NO_SESS,
        expectPart:[e_part.SINGLE_FIELD],
        collName:e_coll.USER
    })
    // console.log(`precheck tmpResult is ${JSON.stringify(tmpResult)}`)
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }


    /*                  logic               */
    let docValue = req.body.values[e_part.SINGLE_FIELD]
    /*              参数转为server格式（SINGLE_FIELD和RECORD_INFO格式一致）            */
    dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    // dataConvert.constructCreateCriteria(docValue)
// console.log(`docValue ${JSON.stringify(docValue)}`)

    //读取字段名，进行不同的操作（userUnique或者passowrd格式,只支持一个field）
    let fieldName=Object.keys(docValue)[0]
    // let fieldValue=Object.values(docValue)[0]
    // let condition
    // let uniqueCheck_asynctmpResult
// console.log(`fieldName ${fieldName}`)
//     console.log(`fieldValue ${fieldValue}`)
//     console.log(`e_uniqueField[e_coll] ${JSON.stringify(e_uniqueField[e_coll.USER])}`)
    if(-1===e_uniqueField[e_coll.USER].indexOf(fieldName)){
        return Promise.reject(controllerError.fieldNotSupport)
    }
// console.log(`indexof check done`)
    if(undefined!==e_uniqueField[collName] &&  e_uniqueField[collName].length>0) {
        await helper.ifFiledInDocValueUnique_async({collName: collName, docValue: docValue})
    }


    return Promise.resolve({rc:0})

}

async function retrievePassword_async(req){
    //新产生的密码,账号对应的记录
    let tmpResult,newPwd,userId,newPwdType=e_randomStringType.NORMAL

    let condition={},condition1={}  //for account/ usedAccount
    /*          格式/值检查        */
    tmpResult=helper.nonCRUDreCheck({
        req:req,
        expectUserState:e_userState.NO_SESS,
        expectPart:[e_part.SINGLE_FIELD],
        collName:e_coll.USER
    })
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }


    /*                  logic               */
    let docValue = req.body.values[e_part.SINGLE_FIELD]
    /*              参数转为server格式（SINGLE_FIELD和RECORD_INFO格式一致）            */
    dataConvert.convertCreateUpdateValueToServerFormat(docValue)
// console.log(`docValue ${JSON.stringify(docValue)}`)

    //读取字段名，进行不同的操作（userUnique或者password格式）
    let fieldName=Object.keys(docValue)[0]
    let fieldValue=Object.values(docValue)[0]


    condition[e_field.USER.ACCOUNT]=fieldValue
    condition[e_field.USER.DOC_STATUS]=e_docStatus.DONE
    tmpResult=await common_operation_model.find({dbModel:dbModel.user,condition:condition})
    // console.log(`retrieve ped: find current account=====>${JSON.stringify(tmpResult)}`)
    if(tmpResult.msg.length>1){
        return Promise.reject(controllerError.accountNotUnique)
    }
    if(tmpResult.msg.length===1){
        userId=tmpResult.msg[0]['id']
        newPwd=generateRandomString(6,newPwdType)
    }
    //继续在usedAccount中查找
    if(tmpResult.msg.length===0){
        condition1[e_field.USER.USED_ACCOUNT]=fieldValue
        condition1[e_field.USER.DOC_STATUS]=e_docStatus.DONE
        tmpResult=await common_operation_model.find({dbModel:dbModel.user,condition:condition1})
        // console.log(`retrieve ped: find used account=====>${JSON.stringify(tmpResult)}`)
        switch (tmpResult.msg.length){
            case 0:
                return {rc:0}
            case 1:
                userId=tmpResult.msg[0]['id']
                newPwd=generateRandomString(6,newPwdType)
                break
            default:
                return Promise.reject(controllerError.accountNotUnique)
        }
    }
    // console.log(`retrieve ped: ready to hash new pwd ${JSON.stringify(newPwd)}`)
    // console.log(`userId ${JSON.stringify(userId)}`)
    //hash密码，保存到db，并发送给用户，并返回通知
    tmpResult=hash(newPwd,e_hashType.SHA256)
    if(tmpResult.rc>0){return Promise.reject(tmpResult)}

    let hashedPassword=tmpResult.msg
    // console.log(`hashedPassword ${JSON.stringify(hashedPassword)}`)
    tmpResult=await common_operation_model.findByIdAndUpdate({dbModel:dbModel.user,id:userId,updateFieldsValue:{'password':hashedPassword}})
    // console.log(`update pwd tmpResult ${JSON.stringify(tmpResult)}`)
    if(regex.email.test(fieldValue)){
        //通过mail发送新密码
        let message={}
        message['from']=mailAccount.qq
        message['to']=mailAccount.qq  //fieldValue
        message['subject']='iShare重置密码'
        message['text']= `iShare为您重新设置了密码：${newPwd}。\r\n此邮件为自动发送，请勿回复。`
        message['html']=`<p>iShare为您重新设置了密码：${newPwd}。</p><p>此邮件为自动发送，请勿回复。</p>`
        tmpResult=await sendVerificationCodeByEmail_async(message)
        return Promise.resolve(tmpResult)
    }
    if(regex.mobilePhone.test(fieldValue)){
        //通过手机发送新密码

    }


}


async function uploadPhoto_async(req){
    /*             检查用户是否在更新 自己 的头像           */
    let userId=req.session.userId
    if(undefined===req.session.userId){
        return Promise.reject(controllerError.notLogin)
    }
    if(req.session.userId!==userId){
        return Promise.reject(controllerError.cantUpdateOwnProfile)
    }

    
    let tmpResult,uploadedFileSizeInKb
    /*              上传文件到临时目录           */
    tmpResult=await common_operation_model.find({dbModel:dbModel.store_path,condition:{usage:e_storePathUsage.UPLOAD_TMP}})
    let uploadOption={
        // maxFilesSize:2097152,
        maxFilesSize:userPhotoConfiguration.size,//300k   头像文件大小100k
        maxFileNumPerTrans:1,//每次只能上传一个头像文件
        // maxFields:1,
        name:'file',
        uploadDir:tmpResult.msg[0][e_field.STORE_PATH.PATH]
    }
    //检查上传参数设置的是否正确
    tmpResult=uploadFile.checkOption(uploadOption)
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }
    //读取上传的文件，获得文件信息
    tmpResult=await uploadFile.formParse_async(req,uploadOption)
    // console.log(`formParse===${JSON.stringify(tmpResult)}`)

    let {originalFilename,path,size}=tmpResult.msg[0]
    // console.log(`originalFilename===${originalFilename}`)
    // console.log(`path===${path}`)
    // console.log(`size===${size}`)
    tmpResult=convertFileSize({num:size,newUnit:e_fileSizeUnit.KB})
    if(tmpResult.rc>0){
        return Promise.reject(tmpResult)
    }
    uploadedFileSizeInKb=tmpResult.msg
    // console.log(`uploadedFileSizeInKb===${uploadedFileSizeInKb}`)

    //检查size(width&&height)不符合，直接返回错误（而不是试图转换）,因为在client已经确保了height和width的正确
    let inst=gmImage.initImage(path)
    // console.log(`inst ====>${JSON.stringify(inst)}`)
    tmpResult=await gmImage.getImageProperty_async(inst,e_gmGetter.SIZE)
    // console.log(`rm size ====>${JSON.stringify(tmpResult)}`)
    if(tmpResult.msg.width>userPhotoConfiguration.maxWidth || tmpResult.msg.height>userPhotoConfiguration.maxHeight){
        fs.unlinkSync(path)
        return Promise.reject(controllerError.imageSizeInvalid)
    }

    /*              选择存储路径               */
    //读取所有avaliable的存储路径，挑选usedSize最小的那个
    let choosenStorePathRecord
    tmpResult=await helper.chooseStorePath_async({usage:e_storePathUsage.USER_PHOTO})
    // console.log(`choosen tmpResult ====> ${JSON.stringify(tmpResult)}`)
    choosenStorePathRecord=objectDeepCopy(tmpResult.msg)
// console.log(`choosen store path recorder ====> ${JSON.stringify(choosenStorePathRecord)}`)


    /*              将文件从临时目录转移（转换）到选择的路径                */
    //保存到指定位置
    // console.log(`originalFilename ==== ${originalFilename}`)
    let md5NameWithoutSuffix=hash(originalFilename,e_hashType.MD5)
    let finalFileName=`${md5NameWithoutSuffix.msg}.${userPhotoConfiguration.imageType[0].toLowerCase()}`
    // console.log(`finalFileName ==== ${finalFileName}`)
    let finalPath=choosenStorePathRecord.path+finalFileName
    // console.log(`path ==== ${path}`)
    // console.log(`finalPath ==== ${finalPath}`)
    //格式不同，直接转换到指定位置
    tmpResult=await gmImage.getImageProperty_async(inst,e_gmGetter.FORMAT)
    // console.log(`tmpResult ==== ${JSON.stringify(tmpResult)}`)
    if(-1===userPhotoConfiguration.imageType.indexOf(tmpResult.msg)){
        // console.log(`path ==== ${path}`)
        await gmImage.gmCommand_async(inst,e_gmCommand.CONVERT_FILE_TYPE,finalPath)
        let newInst=gmImage.initImage(finalPath)
        tmpResult=await  gmImage.getImageProperty_async(newInst,e_gmGetter.FILE_SIZE)
        let tmpSize=tmpResult.msg.sizeNum,tmpUnit=tmpResult.msg.sizeUnit

        tmpResult=convertFileSize({num:tmpSize,unit:tmpUnit,newUnit:e_fileSizeUnit.KB})
        uploadedFileSizeInKb=tmpResult.msg
        fs.unlinkSync(path)
    }
    //格式符合，移动指定位置
    else{
        fs.renameSync(path,finalPath)
    }
    // console.log(`final size========>${JSON.stringify(uploadedFileSizeInKb)}`)



    /*          获得原始user记录，来对比原始文件size和当前文件size，并获得原始文件地址来删除文件，         */
    //获得2个数据：populateUserRec（原始用户数据），sizeToBeAddInDB（新文件和就文件的size差值）
    // console.log(`userId===>${JSON.stringify(userId)}`)
    let oldPhotoFile,originalUserInfo,originalStorePath
    tmpResult=await common_operation_model.findById({dbModel:dbModel.user,id:userId})
    originalUserInfo=objectDeepCopy(tmpResult.msg)
    // console.log(`originalUserInfo=======> ${JSON.stringify(originalUserInfo)}`)
    // mongoose 4.11.4 has issue about populate
/*
    // console.log(`user info===>${JSON.stringify(tmpResult)}`)
    let populateUserRec=await populateSingleDoc_async(originalUserInfo,mongoConfiguration.populateOpt[e_coll.USER],mongoConfiguration.populatedFields[e_coll.USER])
    oldPhotoFile=populateUserRec.msg[e_field.STORE_PATH.PATH]+populateUserRec.msg[e_field.USER.PHOTO_HASH_NAME]
    console.log(`populated User info===>${JSON.stringify(populateUserRec)}`)
    */
    //有原始的头像，那么要先删除
    if(undefined!==originalUserInfo[e_field.USER.PHOTO_PATH_ID]){
        console.log(`photoPathId===>${JSON.stringify(originalUserInfo['photoPathId'])}`)
        tmpResult=await common_operation_model.findById({dbModel:dbModel.store_path,id:originalUserInfo['photoPathId']})
        originalStorePath=objectDeepCopy(tmpResult.msg)
        console.log(`originalStorePath===>${JSON.stringify(originalStorePath)}`)
        oldPhotoFile=originalStorePath[e_field.STORE_PATH.PATH]+originalUserInfo[e_field.USER.PHOTO_HASH_NAME]
        console.log(`oldPhotoFile===>${JSON.stringify(oldPhotoFile)}`)
        fs.unlinkSync(oldPhotoFile)
    }


    /*                  更新db                    */
    //如果原来的存储目录存在，且选择的存储目录和原来的存储目录不一致，那么，首先在原始存储路径的usedSize减去originalFileSize，然后在新存储路径的usedSize加上uploadFileSize
    if(undefined!==originalUserInfo[e_field.USER.PHOTO_PATH_ID] && originalUserInfo[e_field.USER.PHOTO_PATH_ID]!==choosenStorePathRecord['_id']){
        // console.log(`in====>`)
        let updateValues={usedSize:originalStorePath[e_field.STORE_PATH.USED_SIZE]-originalUserInfo[e_field.USER.PHOTO_SIZE]}
        //如果有原始storePath，那么删除后要重新计算，是否可以再次使用
        helper.setStorePathStatus({originalStorePathRecord:originalStorePath,updateValue:updateValues})
        // console.log(`new update Values========>${JSON.stringify(updateValues)}`)
        await common_operation_model.findByIdAndUpdate({dbModel:dbModel.store_path,id:originalUserInfo[e_field.USER.PHOTO_PATH_ID],updateFieldsValue:updateValues})
        updateValues={usedSize:choosenStorePathRecord[e_field.STORE_PATH.USED_SIZE]+uploadedFileSizeInKb}
        //新选择的storePath，是否超出了门限
        helper.setStorePathStatus({originalStorePathRecord:originalStorePath,updateValue:updateValues})
        await common_operation_model.findByIdAndUpdate({dbModel:dbModel.store_path,id:choosenStorePathRecord['_id'],updateFieldsValue:updateValues})
    }
    //如果原先没有存储路径或者选择的存储目录和原来的存储目录一致，那么只要更新原始存储路径的usedSize
    if(undefined===originalUserInfo[e_field.USER.PHOTO_PATH_ID] || originalUserInfo[e_field.USER.PHOTO_PATH_ID]===choosenStorePathRecord['_id']){
        // console.log(`update just choosen store path`)
        // console.log(`in1====>`)
        let originalPhotoSize=(undefined===originalUserInfo[e_field.USER.PHOTO_SIZE])? 0:originalUserInfo[e_field.USER.PHOTO_SIZE]
        let updateValues={usedSize:choosenStorePathRecord[e_field.STORE_PATH.USED_SIZE]-originalPhotoSize+uploadedFileSizeInKb}
        //新选择的storePath，是否超出了门限
        helper.setStorePathStatus({originalStorePathRecord:choosenStorePathRecord,updateValue:updateValues})
        // console.log(`new update Values========>${JSON.stringify(updateValues)}`)
        // console.log(`updateValues===>${JSON.stringify(updateValues)}`)
        // console.log(`id===>${JSON.stringify(choosenStorePathRecord['_id'])}`)
        await common_operation_model.findByIdAndUpdate({dbModel:dbModel.store_path,id:choosenStorePathRecord['_id'],updateFieldsValue:updateValues})
    }
    //最后更新user的PHOTO_PATH_ID/PHOTO_HASH_NAME/PHOTO_SIZE
    // console.log(`finalFileName===>${JSON.stringify(finalFileName)}`)
    // console.log(`uploadedFileSizeInKb===>${JSON.stringify(uploadedFileSizeInKb)}`)
    // console.log(`choosenStorePathRecord['_id']===>${JSON.stringify(choosenStorePathRecord['_id'])}`)
    let  updateFieldsValueForModel={photoHashName:finalFileName,photoSize:uploadedFileSizeInKb,photoPathId:choosenStorePathRecord['_id']}//实际update
// console.log(`updateFieldsValueForModel===>${JSON.stringify(updateFieldsValueForModel)}`)
    if(e_env.DEV===currentEnv){
        let newDocValue=dataConvert.addSubFieldKeyValue(updateFieldsValueForModel)
        // console.log(`newDocValue===>${JSON.stringify(newDocValue)}`)
        tmpResult=validateCURecordInfoFormat(newDocValue,inputRule[e_coll.USER])
        if(tmpResult.rc>0){
            // console.log(`internal check value=============> ${JSON.stringify(docValue)}`)
            return Promise.reject(tmpResult)
        }
        tmpResult=validateUpdateRecorderValue(newDocValue,internalInputRule[e_coll.USER])
        // console.log(`internal check=============> ${JSON.stringify(tmpResult)}`)
        // tmpResult=helper.validatePartValue({req:req,exceptedPart:exceptedPart,coll:e_coll.USER,inputRule:user_internalInputRule,method:e_method.CREATE})
        // console.log(`updateFieldsValue   ${JSON.stringify(updateFieldsValue)}`)
        // console.log(`internalInputRule   ${JSON.stringify(internalInputRule[e_coll.USER][e_field.USER.PHOTO_DATA_URL])}`)
        // console.log(`internal check  tmpResult   ${JSON.stringify(internalInputRule[e_coll.USER][e_field.USER.PHOTO_DATA_URL]['format']['define'].test(finalFileName))}`)
        // console.log(`internal check  ${JSON.stringify(tmpResult)}`)
        if(tmpResult.rc>0){
            return Promise.reject(tmpResult)
        }

    }

    //存储到db中


    await common_operation_model.findByIdAndUpdate({dbModel:dbModel.user,id:userId,updateFieldsValue:updateFieldsValueForModel})
    // console.log(`type ====>${JSON.stringify(type)}`)

    return Promise.resolve({rc:0})
}

/*          产生captcha           */
// @captcha:
//      firstTime:session中，第一次产生captcha的时间,
//      lastTime：session中，最近一次产生的时间，
//      firstTimeInDuration: duration中，第一次captcha的时间
//      numberInDuration:在定义的时间段中，产生的次数
async function generateCaptcha_async(req){
    //第一次产生，记录产生时间
    if(undefined===req.session.captcha ){
        // console.log(`captcha not generate captcha`)
        req.session.captcha={firstTime:Date.now(),lastTime:Date.now(),numberInDuration:1,firstTimeInDuration:Date.now()}

    }
    // else if(undefined===req.session.captcha.firstTime){
    //     req.session.captcha.firstTime=Date.now()
    // }
    else{
        // req.session.captcha.numberInDuration+=1
        //2次间隔是否大于预定义
        if(captchaIntervalConfiguration.expireTimeBetween2Req>(Date.now()-req.session.captcha.lastTime)){
            return Promise.reject(controllerError.intervalBetween2CaptchaTooShort)
        }
        //单位时间内请求次数是否达到门限值
        //没有进入duration，则设置duration的第一次时间
        if(undefined===req.session.captcha.firstTimeInDuration){
            req.session.captcha.lastTime=Date.now()
            req.session.captcha.firstTimeInDuration=Date.now()
            req.session.captcha.numberInDuration=1
        }else{
            //1. duration已经超出，重新开始周期
            if((Date.now()-req.session.captcha.firstTimeInDuration)>captchaIntervalConfiguration.duration*1000){
                req.session.captcha.lastTime=Date.now()
                req.session.captcha.firstTimeInDuration=Date.now()
                req.session.captcha.numberInDuration=1
            }else{
                //   duration没有超出，比较次数是否超出定义
                //次数超出，报错
                if((req.session.captcha.numberInDuration+1)>=captchaIntervalConfiguration.numberInDuration){
                    return Promise.reject(controllerError.captchaReqNumInDurationExceed)
                }else{
                    //次数没有超出，number+1
                    req.session.captcha.lastTime=Date.now()
                    req.session.captcha.numberInDuration+=1
                }
            }
        }
    }

    let captchaString=generateRandomString()
    req.session.captcha.captcha=captchaString

    //产生dataURL并返回
    return Promise.resolve({rc:0,msg:captchaString})

}





module.exports={
    dispatcher_async,
    login_async,
    uniqueCheck_async,
    retrievePassword_async,
    uploadPhoto_async,
    generateCaptcha_async,
    controllerError
}