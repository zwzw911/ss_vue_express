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

const dbModel=require('../../model/mongo/dbModel').DbModel
const fkConfig=require('../../model/mongo/fkConfig').fkConfig

const helper=require('../helper')
const common_operation=require('../../model/mongo/operation/common_operation')
const hash=require('../../function/assist/crypt').hash

const checkUserState=require('../../function/assist/misc').checkUserState
const genFinalReturnResult=require('../../function/assist/misc').genFinalReturnResult



const browserInputRule=require('../../constant/inputRule/browserInput/user/user').user
const internalInputRule=require('../../constant/inputRule/internalInput/user/user').user

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
    result=helper.validatePartValue({req:req,exceptedPart:exceptedPart,coll:e_coll.USER,inputRule:browserInputRule,method:e_method.CREATE})
    if(result.rc>0){
        return Promise.reject(result)
    }

    let docValue=req.body.values[e_part.RECORD_INFO]
    //添加内部产生的值（hash password）
    // console.log(`before hash is ${JSON.stringify(docValue)}`)
    result=hash(docValue['password']['value'],e_hashType.SHA512)
    if(result.rc>0){
        return Promise.reject(result)
    }
    docValue['password']['value']=result.msg
    // console.log(`after hash is ${JSON.stringify(docValue)}`)
    //产生doc
    let currentColl=e_coll.USER_SUGAR
    console.log(`value to be insert is ${JSON.stringify(docValue)}`)
    // let doc=new dbModel[currentColl](values[e_part.RECORD_INFO])
    //对数值逻辑进行判断（外键是否有对应的记录等）
    result=await helper.checkIfFkExist_async(docValue,fkConfig[currentColl])
    if(result.rc>0){
        return Promise.reject(result)
    }

    //对db进行操作
    // common_operation.create({dbModel:dbModel,value:value})
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