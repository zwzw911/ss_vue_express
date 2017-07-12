/**
 * Created by Ada on 2017/7/9.
 */
'use strict'



const express = require('express');
//var app=express()
const router = express.Router();

const e_userState=require('../../constant/enum/node').UserState
const e_part=require('../../constant/enum/node').ValidatePart
const e_coll=require('../../constant/enum/node').Coll
const e_method=require('../../constant/enum/node').Method

const e_hashType=require('../../constant/enum/node_runtime').HashType

const e_env=require('../../constant/enum/node').Env
const e_docStatus=require('../../constant/enum/mongo').DocStatus.DB

const currentEnv=require('../../constant/config/appSetting').currentEnv

const dbModel=require('../../model/mongo/dbModel').DbModel
const fkConfig=require('../../model/mongo/fkConfig').fkConfig

const helper=require('../helper')
const common_operation=require('../../model/mongo/operation/common_operation')
const hash=require('../../function/assist/crypt').hash
const generateRandomString=require('../../function/assist/misc').generateRandomString

const checkUserState=require('../../function/assist/misc').checkUserState
const genFinalReturnResult=require('../../function/assist/misc').genFinalReturnResult
const dataConvert=require('../dataConvert')
const validateCreateRecorderValue=require('../../function/validateInput/validateValue').validateCreateRecorderValue

const user_browserInputRule=require('../../constant/inputRule/browserInput/user/user').user
const user_internalInputRule=require('../../constant/inputRule/internalInput/user/user').user

// const sugar_internalInputRule=require('../../constant/inputRule/browserInput/user/').sugar
const sugar_internalInputRule=require('../../constant/inputRule/internalInput/user/suagr').sugar

const mongoError=require('../../constant/error/mongo/mongoError').error

//检查用户状态
//检查输入参数中part的格式和值
//检查输入参数是否正确
//添加内部产生的值（hash password）
//对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）
//对数值逻辑进行判断（外键是否有对应的记录等）
//执行db操作并返回结果
const logic=async function(req){
    //检查用户状态
    let result=checkUserState(req,e_userState.NO_SESS)
    if(result.rc>0){
        return Promise.reject(result)
    }

    //检查输入参数中part的格式和值
    let exceptedPart=[e_part.RECORD_INFO]
    result=helper.commonCheck(req,exceptedPart)
    if(result.rc>0){
        return Promise.reject(result)
    }

    //检查输入参数是否正确
    result=helper.validatePartValue({req:req,exceptedPart:exceptedPart,coll:e_coll.USER,inputRule:user_browserInputRule,method:e_method.CREATE})
    if(result.rc>0){
        return Promise.reject(result)
    }

    let docValue=req.body.values[e_part.RECORD_INFO]
    // console.log(`docValue ${JSON.stringify(docValue)}`)


    /*      因为name是unique，所以要检查用户名是否存在(unique check)     */
    let condition={name:docValue['name']['value']} //,dDate:{$exists:0}   重复性检查包含已经删除的用户
    let docStatusResult=await common_operation.find({dbModel:dbModel.user,condition:condition})

    if(docStatusResult.rc>0){
        return Promise.reject(docStatusResult)
    }
    // console.log(`docStatusResult ${JSON.stringify(docStatusResult)}`)
    // console.log(`docStatusResult.msg[0] ${JSON.stringify(docStatusResult.msg[0])}`)
    // let existRecord=docStatusResult.msg[0]
    //因为coll有外键，所有还要进一步检查重复的记录的状态是否为done
    if(docStatusResult.msg[0] && e_docStatus.DONE===docStatusResult.msg[0]['docStatus']){
        // console.log(`inini`)
        return Promise.reject(mongoError.common.uniqueFieldValue(e_coll.USER,'name',docValue['name']['value']))
    }

    //如果用户在db中存在，但是创建到一半，则删除用户(然后重新开始流程)
    if(docStatusResult.msg[0] && e_docStatus.PENDING===docStatusResult.msg[0]['docStatus']){
        result=await common_operation.deleteOne({dbModel:dbModel.user,condition:condition})
        // onsole.log(`docStatusResult ${JSON.stringify(docStatusResult)}`)
        if(result.rc>0){
            return Promise.reject(result)
        }
        //删除可能的关联记录
        //sugar
        result=await common_operation.deleteOne({dbModel:dbModel.sugar,condition:{userId:docStatusResult.msg[0]['id']}})
        // onsole.log(`docStatusResult ${JSON.stringify(docStatusResult)}`)
        if(result.rc>0){
            return Promise.reject(result)
        }
        //user_friend_group
        result=await common_operation.deleteOne({dbModel:dbModel.user_friend_group,condition:{userId:docStatusResult.msg[0]['id']}})
        // onsole.log(`docStatusResult ${JSON.stringify(docStatusResult)}`)
        if(result.rc>0){
            return Promise.reject(result)
        }
    }


    //添加内部产生的值（sugar && hash password）
    // console.log(`before hash is ${JSON.stringify(docValue)}`)
    let sugarLength=5 //1~10
    let sugar=generateRandomString(sugarLength)
    // console.log(`sugar init ${sugar}`)
    result=hash(`${docValue['password']['value']}${sugar}`,e_hashType.SHA256)
    // console.log(`hash   ${JSON.stringify(result)}`)
    if(result.rc>0){
        return Promise.reject(result)
    }
    docValue['password']['value']=result.msg
    docValue['docStatus']={'value':e_docStatus.PENDING}



    //对内部产生的值进行检测（开发时使用，上线后为了减低负荷，无需使用）
    if(e_env.DEV===currentEnv){
        let collInputRule=Object.assign({},user_browserInputRule,user_internalInputRule)
        result=validateCreateRecorderValue(docValue,collInputRule)
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

    //参数转为server格式
    dataConvert.convertCreateUpdateValueToServerFormat(docValue)
    dataConvert.constructCreateCriteria(docValue)
    // console.log(`docValue ${JSON.stringify(docValue)}`)
    //用户插入 db
    let userCreateResult= await common_operation.create({dbModel:dbModel.user,value:docValue})
    if(userCreateResult.rc>0){
        return Promise.reject(userCreateResult)
    }

    // return console.log(`user created  ${JSON.stringify(userCreateResult)}`)

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


router.post('/',function(req,res,next){

    logic(req).then(
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

module.exports=router