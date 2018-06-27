/**
 * Created by 张伟 on 2018/6/24.
 * 如果公共群的加入规则是 需要批准才能加入，那么需要将 请求加入的 信息放入此表，以便管理员 操作
 */
'use strict'

const mongoose=require('mongoose');

const regex=require('../../../../constant/regex/regex').regex
const connectedDb=require('../../common/connection').dbSS;

//使用ES6的promise
//mongoose.Promise=Promise
//mongoose.Promise = Promise
const mongoSetting=require('../../common/configuration')

const browserInputRule=require('../../../../constant/inputRule/browserInput/friend/join_public_group_request').join_public_group_request
const internalInputRule=require('../../../../constant/inputRule/internalInput/friend/join_public_group_request').join_public_group_request
//根据inputRule的rule设置，对mongoose设置内建validator
let collInputRule={}
if(undefined!==browserInputRule) {
    Object.assign(collInputRule,browserInputRule)
}
if(undefined!==internalInputRule){
    Object.assign(collInputRule,internalInputRule)
}

const serverRuleType=require('../../../../constant/enum/inputDataRuleType').ServerRuleType


// const collections=['department','employee','billType','bill']

const assist=require('../../common/assist')


//gene by server/maintain/generateMongoEnum
// const enumValue=require('../enumValue')

// console.log(`${JSON.stringify(enumValue)}`)
/*
* schema definition
* 内置validator的定义放在ruleDefine中
* required(all)/min_max(number)/enum_match_minLength_maxLength()
* */

/*                           join_public_group_request                        */
const collName='join_public_group_request'
const collFieldDefine={
    creatorId:{type:mongoose.Schema.Types.ObjectId,ref:"user"}, //请求发起人
    publicGroupId:{type:mongoose.Schema.Types.ObjectId,ref:"public_group"},
    handleResult:{type:String},//enum: untreated/accept/decline
    cDate:{type:Date,default:Date.now},
    uDate:{type:Date,default:Date.now},
    dDate:{type:Date},
}

// console.log(`${collName} before: ${JSON.stringify(collFieldDefine)}`)

if(mongoSetting.configuration.setBuildInValidatorFlag){
    assist.setMongooseBuildInValidator(collFieldDefine,collInputRule)
}


const collSchema=new mongoose.Schema(
    collFieldDefine,
    mongoSetting.schemaOptions
)




/*      mongoose使用新的方式设置model，没有的话会导致populate报错       */
mongoose.model(collName,collSchema)
const collModel=connectedDb.model(collName,collSchema)


module.exports={
    collSchema,
    collModel,
    //以下export，为了mongoValidate
    // collections,
    collFieldDefine,
} //
