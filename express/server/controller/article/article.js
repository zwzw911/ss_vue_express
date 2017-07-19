/**
 * Created by Ada on 2017/7/9.
 */
'use strict'



const express = require('express');
//var app=express()
const router = express.Router();

const e_userState=require('../../constant/enum/node').UserState
const e_part=require('../../constant/enum/node').ValidatePart

// const e_hashType=require('../../constant/enum/node_runtime').HashType

const e_env=require('../../constant/enum/node').Env
const e_docStatus=require('../../constant/enum/mongo').DocStatus.DB
const e_accountType=require('../../constant/enum/mongo').AccountType.DB

const currentEnv=require('../../constant/config/appSetting').currentEnv

const dbModel=require('../../model/mongo/dbModel')
const fkConfig=require('../../model/mongo/fkConfig').fkConfig

const e_coll=require('../../constant/enum/DB_Coll').Coll
const e_field=require('../../constant/enum/DB_field').Field
const e_inputFieldCheckType=require('../../constant/enum/node').InputFieldCheckType

const helper=require('../helper')
const common_operation=require('../../model/mongo/operation/common_operation')
// const hash=require('../../function/assist/crypt').hash
// const generateRandomString=require('../../function/assist/misc').generateRandomString


const genFinalReturnResult=require('../../function/assist/misc').genFinalReturnResult
const dataConvert=require('../dataConvert')
const validateCreateRecorderValue=require('../../function/validateInput/validateValue').validateCreateRecorderValue

// const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule
const internalInputRule=require('../../constant/inputRule/internalInputRule').internalInputRule
// const inputRule=require('../../constant/inputRule/inputRule').inputRule

const mongoError=require('../../constant/error/mongo/mongoError').error

const regex=require('../../constant/regex/regex').regex




const userError={
    nameAlreadyExists:{rc:50100,msg:`用户名已经存在`},
    accountAlreadyExists:{rc:50102,msg:`账号已经存在`},
    fieldNotSupport:{rc:50104,msg:`字段名称不正确`},
    /*              login               */
    loginMandatoryFieldNotExist(fieldName){return {rc:50106,msg:`缺少字段${fieldName}`}},
    accountNotExist:{rc:50108,msg:`用户不存在`},
    accountPasswordNotMatch:{rc:50110,msg:`用户或者密码不正确`},
}

//检查用户状态
//检查输入参数中part的格式和值
//检查输入参数是否正确
//添加内部产生的值（hash password）
//对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）
//对数值逻辑进行判断（外键是否有对应的记录等）
//执行db操作并返回结果
async  function createUser(req){
    //预先检查 sess/format/value
    let result=helper.preCheck({
        req:req,
        expectUserState:e_userState.NO_SESS,
        expectPart:[e_part.RECORD_INFO],
        recordInfoBaseRule:e_inputFieldCheckType.BASE_INPUT_RULE,
        collName:e_coll.USER
    })
    if(result.rc>0){
        return Promise.reject(result)
    }


/*                      logic                               */
    let docValue=req.body.values[e_part.RECORD_INFO]
    // console.log(`docValue ${JSON.stringify(docValue)}`)


    /*      因为name是unique，所以要检查用户名是否存在(unique check)     */
    // let field=e_field.USER.NAME
    let condition={name:docValue[e_field.USER.NAME]['value']} //,dDate:{$exists:0}   重复性检查包含已经删除的用户
    let docStatusResult=await common_operation.find({dbModel:dbModel.user,condition:condition})

    if(docStatusResult.rc>0){
        return Promise.reject(docStatusResult)
    }
    // console.log(`docStatusResult ${JSON.stringify(docStatusResult)}`)
    // console.log(`docStatusResult.msg[0] ${JSON.stringify(docStatusResult.msg[0])}`)
    // let existRecord=docStatusResult.msg[0]
    //因为coll有外键，所有还要进一步检查重复的记录的状态是否为done
    if(docStatusResult.msg[0] && e_docStatus.DONE===docStatusResult.msg[0][e_field.USER.DOC_STATUS]){
        // console.log(`inini`)
        return Promise.reject(mongoError.common.uniqueFieldValue(e_coll.USER,e_field.USER.NAME,docValue[e_field.USER.NAME]['value']))
    }

    //如果用户在db中存在，但是创建到一半，则删除用户(然后重新开始流程)
    if(docStatusResult.msg[0] && e_docStatus.PENDING===docStatusResult.msg[0][e_field.USER.DOC_STATUS]){
        result=await common_operation.deleteOne({dbModel:dbModel.user,condition:condition})
        // onsole.log(`docStatusResult ${JSON.stringify(docStatusResult)}`)
        if(result.rc>0){
            return Promise.reject(result)
        }
        //删除可能的关联记录
        //sugar
        result=await common_operation.deleteOne({dbModel:dbModel.sugar,condition:{userId:docStatusResult.msg[0][e_field.USER.ID]}})
        // onsole.log(`docStatusResult ${JSON.stringify(docStatusResult)}`)
        if(result.rc>0){
            return Promise.reject(result)
        }
        //user_friend_group
        result=await common_operation.deleteOne({dbModel:dbModel.user_friend_group,condition:{userId:docStatusResult.msg[0][e_field.USER.ID]}})
        // onsole.log(`docStatusResult ${JSON.stringify(docStatusResult)}`)
        if(result.rc>0){
            return Promise.reject(result)
        }
    }


    /*                  添加内部产生的值（sugar && hash password && acountType）                  */
    // console.log(`before hash is ${JSON.stringify(docValue)}`)
    let sugarLength=5 //1~10
    let sugar=generateRandomString(sugarLength)
    // console.log(`sugar init ${sugar}`)
    result=hash(`${docValue[e_field.USER.PASSWORD]['value']}${sugar}`,e_hashType.SHA256)
    // console.log(`hash   ${JSON.stringify(result)}`)
    if(result.rc>0){
        return Promise.reject(result)
    }
    docValue[e_field.USER.PASSWORD]['value']=result.msg
    docValue[e_field.USER.DOC_STATUS]={'value':e_docStatus.PENDING}

    // console.log(`docValue   ${JSON.stringify(docValue)}`)
    let accountValue=docValue[e_field.USER.ACCOUNT]['value']
    if(regex.email.test(accountValue)){
        docValue[e_field.USER.ACCOUNT_TYPE]={'value':e_accountType.EMAIL}
    }
    if(regex.mobilePhone.test(accountValue)){
        docValue[e_field.USER.ACCOUNT_TYPE]={'value':e_accountType.MOBILE_PHONE}
    }

    // console.log(`docValue   ${JSON.stringify(docValue)}`)

    /*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           */
    if(e_env.DEV===currentEnv){
        // let collInputRule=Object.assign({},user_browserInputRule,user_internalInputRule)
        console.log(`internal check value=============> ${JSON.stringify(docValue)}`)
        // console.log(`internal check rule=============> ${JSON.stringify(internalInputRule[e_coll.USER])}`)
        result=validateCreateRecorderValue(docValue,internalInputRule[e_coll.USER])
        console.log(`internal check=============> ${JSON.stringify(result)}`)
        // result=helper.validatePartValue({req:req,exceptedPart:exceptedPart,coll:e_coll.USER,inputRule:user_internalInputRule,method:e_method.CREATE})
        // console.log(`docValue   ${JSON.stringify(docValue)}`)
        // return console.log(`internal check  ${JSON.stringify(result)}`)
        if(result.rc>0){
            return Promise.reject(result)
        }
    }

    console.log(`internal check  is ${JSON.stringify(docValue)}`)
    // let currentColl=e_coll.USER_SUGAR
    // console.log(`value to be insert is ${JSON.stringify(docValue)}`)
    // let doc=new dbModel[currentColl](values[e_part.RECORD_INFO])

    /*              参数转为server格式            */
    dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    dataConvert.constructCreateCriteria(docValue)
    // console.log(`docValue ${JSON.stringify(docValue)}`)
    //用户插入 db
    let userCreateResult= await common_operation.create({dbModel:dbModel.user,value:docValue})
    if(userCreateResult.rc>0){
        return Promise.reject(userCreateResult)
    }

    console.log(`user created  ${JSON.stringify(userCreateResult)}`)

    //对关联表sugar进行insert操作
    let sugarValue={userId:userCreateResult.msg._id,sugar:sugar}
    // console.log(`sugarValue ${JSON.stringify(sugarValue)}`)
    result= await common_operation.create({dbModel:dbModel.sugar,value:sugarValue})
    // console.log(`result is ${JSON.stringify(result)}`)
    if(result.rc>0){
        return Promise.reject(result)
    }

    //对关联表user_friend_group进行insert操作
    let userFriendGroupValue={userId:userCreateResult.msg._id,name:'我的朋友',friendsInGroup:[]}
    // console.log(`sugarValue ${JSON.stringify(sugarValue)}`)
    result= await common_operation.create({dbModel:dbModel.user_friend_group,value:userFriendGroupValue})
    // console.log(`result is ${JSON.stringify(result)}`)
    if(result.rc>0){
        return Promise.reject(result)
    }

// return false
    //最终置user['docStatus']为DONE
    result= await common_operation.findByIdAndUpdate({dbModel:dbModel.user,id:userCreateResult.msg._id,updateFieldsValue:{'docStatus':e_docStatus.DONE}})
    if(result.rc>0){
        return Promise.reject(result)
    }

    return Promise.resolve({rc:0})
}


/*                      检查用户名/账号的唯一性                           */
async  function  uniqueCheck(req) {
    // console.log(`unique check is ${JSON.stringify(req.body.values)} `)


    let result=helper.preCheck({
        req:req,
        expectUserState:e_userState.NO_SESS,
        expectPart:[e_part.SINGLE_FIELD],
        collName:e_coll.USER
    })
    // console.log(`precheck result is ${JSON.stringify(result)}`)
    if(result.rc>0){
        return Promise.reject(result)
    }


/*                  logic               */
    let docValue = req.body.values[e_part.SINGLE_FIELD]
// console.log(`docValue ${JSON.stringify(docValue)}`)

    //读取字段名，进行不同的操作（userUnique或者passowrd格式）
    let fieldName=Object.keys(docValue)[0]
    let condition
    let uniqueCheckResult
    switch (fieldName){
        case e_field.USER.NAME:
            condition = {name: docValue[e_field.USER.NAME]['value']} //,dDate:{$exists:0}   重复性检查包含已经删除的用户
            uniqueCheckResult = await common_operation.find({dbModel: dbModel.user, condition: condition})

            if (uniqueCheckResult.rc > 0) {
                return Promise.reject(uniqueCheckResult)
            }

            if(uniqueCheckResult.msg.length>0){
                return Promise.reject(userError.nameAlreadyExists)
            }
            break;
        case e_field.USER.ACCOUNT:
            condition = {account: docValue[e_field.USER.ACCOUNT]['value']} //,dDate:{$exists:0}   重复性检查包含已经删除的用户
            uniqueCheckResult = await common_operation.find({dbModel: dbModel.user, condition: condition})

            if (uniqueCheckResult.rc > 0) {
                return Promise.reject(uniqueCheckResult)
            }

            if(uniqueCheckResult.msg.length>0){
                return Promise.reject(userError.accountAlreadyExists)
            }
            break;
        default:
            return Promise.reject(userError.fieldNotSupport)

    }

    return Promise.resolve({rc:0})

}


async function login(req){

    //预先检查 sess/format/value
    let userSugarResult;
    let result = helper.preCheck({
        req: req,
        expectUserState: e_userState.NO_SESS,
        expectPart: [e_part.RECORD_INFO],
        recordInfoBaseRule: e_inputFieldCheckType.BASE_INPUT,
        collName: e_coll.USER
    })
    if (result.rc > 0) {
        return Promise.reject(result)
    }

    /*              略有不同，需要确定字段有且只有账号和密码                */
    // let usedColl=e_coll.USER
    let docValue = req.body.values[e_part.RECORD_INFO]
    let expectedField = [e_field.USER.ACCOUNT, e_field.USER.PASSWORD]
    for (let singleInputFieldName of expectedField) {
        if (false === singleInputFieldName in docValue) {
            return Promise.reject(userError.loginMandatoryFieldNotExist(singleInputFieldName))
        }
    }

//    读取sugar，并和输入的password进行运算，得到的结果进行比较
    let condition={account:docValue[e_field.USER.ACCOUNT]['value']}
    let userResult = await common_operation.find({dbModel: dbModel.user,condition:condition})
    if(userResult.rc>0){
        return Promise.reject(userResult)
    }
    if(0===userResult.rc && 0===userResult.msg.length){
        return Promise.reject(userError.accountNotExist)
    }
    // console.log(`userResult ${JSON.stringify(userResult)}`)
    condition={userId:userResult.msg[0]['id']}
    let sugarResult = await common_operation.find({dbModel: dbModel.sugar,condition:condition})
    if(sugarResult.rc>0){
        return Promise.reject(sugarResult)
    }
    // console.log(`sugarResult ${JSON.stringify(sugarResult)}`)

    let encryptPassword=hash(`${docValue[e_field.USER.PASSWORD]['value']}${sugarResult.msg[0][e_field.SUGAR.SUGAR]}`,e_hashType.SHA256)
    // console.log(`encryptPassword ${JSON.stringify(encryptPassword)}`)
    if(encryptPassword.rc>0){
        return Promise.reject(encryptPassword)
    }

    if(userResult.msg[0][e_field.USER.PASSWORD]!==encryptPassword['msg']){
        return Promise.reject(userError.accountPasswordNotMatch)
    }

    /*
    *  需要设置session
    * */
    return Promise.resolve({rc:0})
}

router.post('/register',function(req,res,next){

    createUser(req).then(
        (v)=>{
            console.log(`create   register   success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`create   register    fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})

router.post('/register/uniqueCheck',function(req,res,next){

    uniqueCheck(req).then(
        (v)=>{
            console.log(`unique check  success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`unique check  fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})

router.post('/login',function(req,res,next){

    login(req).then(
        (v)=>{
            console.log(`login  success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`login  fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})

module.exports=router