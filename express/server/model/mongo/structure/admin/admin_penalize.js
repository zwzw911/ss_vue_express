/**
 * Created by wzhan039 on 2017-06-22.
 *
 * 定义用户信息
 */

'use strict'
const mongoose=require('mongoose');
// const fs=require('fs')
const regex=require('../../../../constant/regex/regex').regex
const connectedDb=require('../../common/connection_admin').dbAdmin;

//使用ES6的promise
//mongoose.Promise=Promise
//mongoose.Promise = Promise
const mongoSetting=require('../../common/configuration')

const browserInputRule=require('../../../../constant/inputRule/browserInput/admin/admin_penalize').admin_penalize
const internalInputRule=require('../../../../constant/inputRule/internalInput/admin/admin_penalize').admin_penalize
//根据inputRule的rule设置，对mongoose设置内建validator
const collInputRule=Object.assign({},browserInputRule,internalInputRule)

const serverRuleType=require('../../../../constant/enum/inputDataRuleType').ServerRuleType


// const collections=['department','employee','billType','bill']

const assist=require('../../common/assist')


//gene by server/maintain/generateMongoEnum
const enumValue=require('../enumValue')

/*
* schema definition
* 内置validator的定义放在ruleDefine中
* required(all)/min_max(number)/enum_match_minLength_maxLength()
* */

/*                           department                        */
const collName='admin_penalize'

/*const serPriority_arrayMaxLength={
    validator(v){
        return v.length<collInputRule['userPriority'][serverRuleType.ARRAY_MAX_LENGTH]['define']

        // return v.length<=collInputRule['articleCommentsId'][serverRuleType.ARRAY_MAX_LENGTH]['define']
    },
    message:`错误代码${collInputRule['userPriority'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['rc']}:${collInputRule['userPriority'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['msg']}`
}
const userPriority_Enum={
    validator(v){
        let enumDefine=collInputRule['userPriority'][serverRuleType.ENUM]['define']
        for(let singleValue of v){
            if(-1===enumDefine.indexOf(singleValue)){
                return false
            }
        }
        return true

        // return v.length<=collInputRule['articleCommentsId'][serverRuleType.ARRAY_MAX_LENGTH]['define']
    },
    message:`错误代码${collInputRule['userPriority'][serverRuleType.ENUM]['mongoError']['rc']}:${collInputRule['userPriority'][serverRuleType.ENUM]['mongoError']['msg']}`
}*/

const collFieldDefine={
    creatorId:{type:mongoose.Schema.Types.ObjectId,ref:"admin_users"},
    punishedId:{type:mongoose.Schema.Types.ObjectId,ref:"users"},
    reason:{type:String},
    penalizeType:{type:String,}, //enum只能支持string，不支持Number
    duration:{type:Number},
    cDate:{type:Date,default:Date.now},
    uDate:{type:Date,default:Date.now},
    dDate:{type:Date},
}

console.log(`before: ${JSON.stringify(collFieldDefine)}`)

if(mongoSetting.configuration.setBuildInValidatorFlag){
    assist.setMongooseBuildInValidator(collFieldDefine,collInputRule)
}


console.log(`after: ${JSON.stringify(collFieldDefine)}`)
/*
* 根据define/validateRule/validateRule的rule设置schema的rule
* */
//validateInput中的rule，在mongoose中对应的validator

//console.log(fieldDefine['department']['parentDepartment'])
/*                          将inputRule中的rule定义转换成mongoose内置validator                          */



// fs.writeFile('mongodb.txt',JSON.stringify(fieldDefine))
// console.log(fieldDefine['department']['name'])
//console.log(fieldDefine['employee']['gender']['enum'])
// console.log(JSON.stringify(fieldDefine['department']))
// console.log(JSON.stringify(fieldDefine['employee']))
// console.log(JSON.stringify(fieldDefine['billType']))

const collSchema=new mongoose.Schema(
    collFieldDefine,
    mongoSetting.schemaOptions
)

/*const departmentSchema=new mongoose.Schema(
    fieldDefine['department'],
    schemaOptions
)

const employeeSchema=new mongoose.Schema(
    fieldDefine['employee'],
    schemaOptions
)
const billTypeSchema=new mongoose.Schema(
    fieldDefine['billType'],
    schemaOptions
)

const billSchema=new mongoose.Schema(
    fieldDefine['bill'],
    schemaOptions
)
/!*          hook            *!/
billSchema.pre('save',function(next){
    // console.log(`bill pre save in`)
    // console.log(`document is ${JSON.stringify(this)}`)
    if(this.billTypeFields.inOut==='out'){
        // console.log(`out enter`)
        this.amount=-Math.abs(this.amount)
        // console.log(`out amount is ${this.amount}`)
    }
    if(this.billTypeFields.inOut==='in'){
        console.log(`in enter`)
    }
    next()
})
//findOneAndUpdate中的this指的不是document，而是query
billSchema.pre('findOneAndUpdate',function(next){
    // console.log(`enter findOneAndUpdate`)
    this.update({},{"billTypeFields.inOut":"in"},{"$set":{"amount":-1}})
    next()
})*/



const collModel=connectedDb.model(collName,collSchema)
/*const departmentModel=dbFinance.model('departments',departmentSchema)
const employeeModel=dbFinance.model('employees',employeeSchema)
const billTypeModel=dbFinance.model('billTypes',billTypeSchema)
const billModel=dbFinance.model('bills',billSchema)*/

//console.log(billModel)
module.exports={
    collSchema,
    collModel,
    //以下export，为了mongoValidate
    // collections,
    collFieldDefine,
} //

