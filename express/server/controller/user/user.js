/**
 * Created by Ada on 2017/7/9.
 * url：
 *  1. /user，根据method的不同，调用不同的函数进行对应的处理
 *  2. /user/unique: 用户注册的时候，对应用户名/账号进行唯一性检查
 */
'use strict'



const express = require('express');
//var app=express()
const router = express.Router();

const e_userState=require('../../constant/enum/node').UserState
const e_part=require('../../constant/enum/node').ValidatePart
const e_method=require('../../constant/enum/node').Method
// const e_coll=require('../../constant/enum/node').Coll
// const e_method=require('../../constant/enum/node').Method

const e_hashType=require('../../constant/enum/node_runtime').HashType

const e_env=require('../../constant/enum/node').Env
const e_docStatus=require('../../constant/enum/mongo').DocStatus.DB
const e_accountType=require('../../constant/enum/mongo').AccountType.DB

const currentEnv=require('../../constant/config/appSetting').currentEnv

const dbModel=require('../../model/mongo/dbModel')
const fkConfig=require('../../model/mongo/fkConfig').fkConfig

const e_coll=require('../../constant/enum/DB_Coll').Coll
const e_field=require('../../constant/enum/DB_field').Field
const e_uniqueField=require('../../constant/enum/DB_uniqueField').UniqueField
// const e_inputFieldCheckType=require('../../constant/enum/node').InputFieldCheckType

const helper=require('../helper')
const common_operation=require('../../model/mongo/operation/common_operation')
const hash=require('../../function/assist/crypt').hash
const generateRandomString=require('../../function/assist/misc').generateRandomString
const genFinalReturnResult=require('../../function/assist/misc').genFinalReturnResult
const ifUserLogin=require('../../function/assist/misc').ifUserLogin
const dataConvert=require('../dataConvert')
const validateCreateRecorderValue=require('../../function/validateInput/validateValue').validateCreateRecorderValue

// const browserInputRule=require('../../constant/inputRule/browserInputRule').browserInputRule
const internalInputRule=require('../../constant/inputRule/internalInputRule').internalInputRule
// const inputRule=require('../../constant/inputRule/inputRule').inputRule

const mongoError=require('../../constant/error/mongo/mongoError').error

const regex=require('../../constant/regex/regex').regex




const userError={
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
}


//对CRUD（输入参数带有method）操作调用对应的函数
async function dispatcher(req){
    //检查格式
    // console.log(`req is ${JSON.stringify(req.cookies)}`)
    // console.log(`dispatcher in`)
    // console.log(`req.body.values ${JSON.stringify(req.body.values)}`)
    let expectUserState,expectedPart,collName=e_coll.USER,result

    //dispatcher只检测req的结构，以及req中method的格式和值，以便后续可以直接根据method进行调用
    result=helper.dispatcherPreCheck({req:req})
    if(result.rc>0){
        return Promise.reject(result)
    }


    //因为method已经检测过，所有要从req.body.values中删除，防止重复检查
    let method=req.body.values[e_part.METHOD]
    delete req.body.values[e_part.METHOD]


    switch (method){
        case e_method.CREATE: //create
            // console.log(`create in`)
            //首先检查method是否存在，且格式/值是否正确。不同的method可能对应不同的参数配置

            expectedPart=[e_part.RECORD_INFO]//无需method
            //因为dispatch而已经检查过req的总体结构，所以无需再次检查，而直接检查partValueFormat+partValueCheck
            // result=helper.CRUDPreCheck({req:req,expectUserState:expectUserState,expectedPart:expectedPart,collName:collName,method:method})
            result=helper.CRUDPreCheck({req:req,expectedPart:expectedPart,collName:collName,method:method})
            // console.log(`create preCheck result ${JSON.stringify(result)}`)
            if(result.rc>0){
                return Promise.reject(result)
            }


            result=await createUser_async(req)
            // console.log(`create  result ${JSON.stringify(result)}`)
            break;
        case e_method.SEARCH:// search
            break;
        case e_method.UPDATE: //update

            // console.log(`req.session update is ${JSON.stringify(req.session)}`)
            expectedPart=[e_part.RECORD_INFO]//无需method
            //因为dispatch而已经检查过req的总体结构，所以无需再次检查，而直接检查sess+partValueFormat+partValueCheck
            result=helper.CRUDPreCheck({req:req,expectUserState:expectUserState,expectedPart:expectedPart,collName:collName,method:method})
            // console.log(`create preCheck result ${JSON.stringify(result)}`)
            if(result.rc>0){
                return Promise.reject(result)
            }

            // expectUserState=e_userState.LOGIN
            //检查是否登录（以便从session中获得对应的userId）
            if(false===ifUserLogin(req)){
                // console.log(`user login=======`)
                return Promise.reject(userError.notLogin)
            }
            // console.log(`req.session indisp ${JSON.stringify(req.session)}`)
            result=await updateUser_async(req)
            break;
        case e_method.DELETE: //delete
            break;
        case e_method.MATCH: //match(login_async)
            // console.log(`req.session login is ${JSON.stringify(req.session)}`)
            expectUserState=e_userState.NO_SESS
            expectedPart=[e_part.RECORD_INFO]
            result=helper.CRUDPreCheck({req:req,expectUserState:expectUserState,expectedPart:expectedPart,collName:collName,method:method})
            // console.log(`match CRUDPreCheck ${JSON.stringify(result)}`)
            if(result.rc>0){
                return Promise.reject(result)
            }
            result=await login_async(req)
            // console.log(`match result ${JSON.stringify(result)}`)
    }
    
    return Promise.resolve(result)
}

//添加内部产生的值（hash password）
//对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）
//对数值逻辑进行判断（外键是否有对应的记录等）
//执行db操作并返回结果
async  function createUser_async(req){
/*                      logic                               */
    let docValue=req.body.values[e_part.RECORD_INFO]
    console.log(`docValue ${JSON.stringify(docValue)}`)


    /*      因为name是unique，所以要检查用户名是否存在(unique check)     */
    // let field=e_field.USER.NAME
    for(let singleFieldName in docValue){
        if(-1!==e_uniqueField[e_coll.USER].indexOf(singleFieldName)){
            // console.log(`ifExist in=============`)
            let ifExist=await helper.ifFieldValueExistInColl_async({dbModel:dbModel[e_coll.USER],fieldName:singleFieldName,fieldValue:docValue[singleFieldName]['value']})
            // console.log(`ifExist ${JSON.stringify(ifExist)}`)
            if(true===ifExist.msg){
                switch (singleFieldName) {
                    case e_field.USER.NAME:
                        return Promise.reject(userError.nameAlreadyExists)
                    case e_field.USER.ACCOUNT:
                        return Promise.reject(userError.accountAlreadyExists)
                }
            }
        }
    }
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

    let result
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

    docValue[e_field.USER.USED_ACCOUNT]=docValue[e_field.USER.ACCOUNT]
    docValue[e_field.USER.LAST_ACCOUNT_UPDATE_DATE]=Date.now()
    // console.log(`docValue   ${JSON.stringify(docValue)}`)

    /*              对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）           */
    if(e_env.DEV===currentEnv){
        // let collInputRule=Object.assign({},user_browserInputRule,user_internalInputRule)
        // console.log(`internal check value=============> ${JSON.stringify(docValue)}`)
        // console.log(`internal check rule=============> ${JSON.stringify(internalInputRule[e_coll.USER])}`)
        result=validateCreateRecorderValue(docValue,internalInputRule[e_coll.USER])
        // console.log(`internal check=============> ${JSON.stringify(result)}`)
        // result=helper.validatePartValue({req:req,exceptedPart:exceptedPart,coll:e_coll.USER,inputRule:user_internalInputRule,method:e_method.CREATE})
        // console.log(`docValue   ${JSON.stringify(docValue)}`)
        // return console.log(`internal check  ${JSON.stringify(result)}`)
        if(result.rc>0){
            return Promise.reject(result)
        }
    }

    // console.log(`internal check  is ${JSON.stringify(docValue)}`)
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

    // console.log(`user created  ${JSON.stringify(userCreateResult)}`)

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


/*
* 更新用户资料
* 1. 需要对比req中的userId和session中的id是否一致
* */
async function updateUser_async(req){
    // console.log(`req.session ${JSON.stringify(req.session)}`)
    /*                  要更改的记录的owner是否为发出req的用户本身                            */
    let result
    let docValue=req.body.values[e_part.RECORD_INFO]
    let userId=req.session.userId

    // let result=await common_operation.findById({dbModel:dbModel[e_coll.USER],id:objectId})
    // let userId=result.msg[e_field.USER.]

    if(undefined===req.session.userId){
        return Promise.reject(userError.notLogin)
    }
    
    if(req.session.userId!==userId){
        return Promise.reject(userError.cantUpdateOwnProfile)
    }

    /*              剔除value没有变化的field            */
    // console.log(`befreo check ${JSON.stringify(docValue)}`)
    result=await common_operation.findById({dbModel:dbModel.user,id:req.session.userId})
    if(null===result.msg){return Promise.reject(userError.userNotExist)}
    let originUserInfo=result.msg
    for(let singleFieldName in docValue){
        if(docValue[singleFieldName]['value']===originUserInfo[singleFieldName]){
            delete docValue[singleFieldName]
        }
    }
    if(0===Object.keys(docValue).length){
        return {rc:0}
    }
    // console.log(`after check ${JSON.stringify(docValue)}`)

    /*              如果有unique字段，需要预先检查unique            */
    for(let singleFieldName in docValue){
        if(-1!==e_uniqueField[e_coll.USER].indexOf(singleFieldName)){
            let ifExist=await helper.ifFieldValueExistInColl_async({dbModel:dbModel.user,fieldName:singleFieldName,fieldValue:docValue[singleFieldName]['value']})
// console.log(`singleFieldName: ${singleFieldName}===fieldValue: ${docValue[singleFieldName]['value']}===ifExist ${ifExist}`)
            if(true===ifExist.msg){
                return Promise.reject(userError[singleFieldName+'AlreadyExists'])
            }
        }
    }
    /*              执行update操作                  */
    dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    dataConvert.constructUpdateCriteria(docValue,fkConfig[e_coll.USER])

    /*              如果有更改account，需要几率下来         */
    if(undefined!==docValue[e_field.USER.ACCOUNT]){

    }

    result=await common_operation.update({dbModel:dbModel[e_coll.USER],id:userId,values:docValue})
    return Promise.resolve(result)

}

async function login_async(req){
    /*                              logic                                   */
    /*              略有不同，需要确定字段有且只有账号和密码                */
    // let usedColl=e_coll.USER
    let docValue = req.body.values[e_part.RECORD_INFO]
    let expectedField = [e_field.USER.ACCOUNT, e_field.USER.PASSWORD]
    if(Object.keys(docValue).length!==expectedField.length){
        return Promise.reject(userError.loginFieldNumNotExpected)
    }
    for (let singleInputFieldName of expectedField) {
        if (false === singleInputFieldName in docValue) {
            return Promise.reject(userError.loginMandatoryFieldNotExist(singleInputFieldName))
        }
    }

//    读取sugar，并和输入的password进行运算，得到的结果进行比较
    let condition={account:docValue[e_field.USER.ACCOUNT]['value']}
    let userResult = await common_operation.find({dbModel: dbModel.user,condition:condition})
    // if(userResult.rc>0){
    //     return Promise.reject(userResult)
    // }
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

    // console.log(`user/pwd  ${docValue[e_field.USER.ACCOUNT]['value']}///${encryptPassword.msg}`)
    if(userResult.msg[0][e_field.USER.PASSWORD]!==encryptPassword['msg']){
        return Promise.reject(userError.accountPasswordNotMatch)
    }

    /*
    *  需要设置session
    * */
    // console.log(`userResult.msg[0]['id'] ${JSON.stringify(userResult.msg[0]['id'])}`)
    req.session.userId=userResult.msg[0]['id']

    return Promise.resolve({rc:0})
}



/*                      检查用户名/账号的唯一性                           */
async  function  uniqueCheck_async(req) {
    // console.log(`unique check is ${JSON.stringify(req.body.values)} `)


    let result=helper.nonCRUDreCheck({
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
    let fieldValue=Object.values(docValue)[0]['value']
    // let condition
    // let uniqueCheck_asyncResult
// console.log(`fieldName ${fieldName}`)
//     console.log(`fieldValue ${fieldValue}`)
//     console.log(`e_uniqueField[e_coll] ${JSON.stringify(e_uniqueField[e_coll.USER])}`)
    if(-1===e_uniqueField[e_coll.USER].indexOf(fieldName)){
        return Promise.reject(userError.fieldNotSupport)
    }
// console.log(`indexof check done`)
    let ifAlreadyExist=await helper.ifFieldValueExistInColl_async({dbModel:dbModel[e_coll.USER],fieldName:fieldName,fieldValue:fieldValue})
    // console.log(`ifAlreadyExist ${ifAlreadyExist}`)
    if(true===ifAlreadyExist.msg){
        switch (fieldName) {
            case e_field.USER.NAME:
                return Promise.reject(userError.nameAlreadyExists)
            case e_field.USER.ACCOUNT:
                return Promise.reject(userError.accountAlreadyExists)
        }
    }


    return Promise.resolve({rc:0})

}


/*        通过method，判断是CRUDM中的那个操作
*   C: register
*   M: match(login)
* */
router.post('/',function(req,res,next){

    dispatcher(req).then(
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

router.post('/uniqueCheck_async',function(req,res,next){

    uniqueCheck_async(req).then(
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

/*router.post('/login_async',function(req,res,next){

    login_async(req).then(
        (v)=>{
            console.log(`login_async  success, result:  ${JSON.stringify(v)}`)
            return res.json(v)
        },
        (err)=>{
            console.log(`login_async  fail: ${JSON.stringify(err)}`)
            return res.json(genFinalReturnResult(err))

        }
    )
})*/

module.exports={router,userError}