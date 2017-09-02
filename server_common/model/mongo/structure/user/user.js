/**
 * Created by wzhan039 on 2017-06-10.
 *
 * 定义用户信息
 */

'use strict'
const mongoose=require('mongoose');
const fs=require('fs')
const regex=require('../../../../constant/regex/regex').regex
const connectedDb=require('../../common/connection').dbSS;

//使用ES6的promise
//mongoose.Promise=Promise
//mongoose.Promise = Promise
const mongoSetting=require('../../common/configuration')

const browserInputRule=require('../../../../constant/inputRule/browserInput/user/user').user
const internalInputRule=require('../../../../constant/inputRule/internalInput/user/user').user

const serverRuleType=require('../../../../constant/enum/inputDataRuleType').ServerRuleType


// const collections=['department','employee','billType','bill']

const assist=require('../../common/assist')

//根据inputRule的rule设置，对mongoose设置内建validator
const collInputRule=Object.assign({},browserInputRule,internalInputRule)

// const store_path=require('../admin/store_path')
/*
* schema definition
* 内置validator的定义放在ruleDefine中
* required(all)/min_max(number)/enum_match_minLength_maxLength()
* */

const collName='user'
const collFieldDefine={
        name:{type:String,unique:true},
        account:{type:String,unique:true}, //email或者手机号
        accountType:{type:String}, //到底是email还是手机号
    usedAccount:{type:[{type:String}]},//记录曾经使用过的account
    lastAccountUpdateDate:{type:Date},//最近一次修改account的时间
        password:{type:String}, //加密后的密码
        docStatus:{type:String},//实现 事务 的一致性
    userType:{type:String},//enum: 用户类型
        /*  理论上浏览器只会执行一次http请求，但是如果用户数多，会对每个用户执行http    */
        photoPathId:{type:mongoose.Schema.Types.ObjectId,ref:'store_path'},//
        photoHashName:{type:String},//md5
        photoSize:{type:Number},//kb，头像以文件格式存储
/*        头像size较小，采用base64Url。 好处：减少http请求；坏处：增加前后端处理复杂度
        * 例如： 评论：3人各自做2次评论。
        * 如果是图片，要发起3次http请求；
        * 如果是baseUrl：需要将用户信息单独提取（而不是直接为每个评论直接读取用户信息），分成评论和用户信息，然后在client组合。只有一次http，但是处理比较复杂
        * */
        // photoDataUrl:{type:String},
    lastSignInDate:{type:Date},
        cDate:{type:Date,default:Date.now},
        uDate:{type:Date,default:Date.now},
        dDate:{type:Date},
}

// console.log(`${__filename}:before: ${JSON.stringify(collFieldDefine)}`)

if(mongoSetting.configuration.setBuildInValidatorFlag){
    assist.setMongooseBuildInValidator(collFieldDefine,collInputRule)
}


// console.log(`${__filename}:after: ${JSON.stringify(collFieldDefine)}`)
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

/*      mongoose使用新的方式设置model，没有的话会导致populate报错       */
mongoose.model(collName,collSchema)
const collModel=connectedDb.model(collName,collSchema)
// const collModel=mongoose.model(collName,collSchema)
/*const departmentModel=dbFinance.model('departments',departmentSchema)
const employeeModel=dbFinance.model('employees',employeeSchema)
const billTypeModel=dbFinance.model('billTypes',billTypeSchema)
const billModel=dbFinance.model('bills',billSchema)*/

//console.log(billModel)
module.exports={
    collSchema,
/*        department:departmentSchema,
        employee:employeeSchema,
        billType:billTypeSchema,
        bill:billSchema*/

    collModel,
/*        department:departmentModel,
        employee:employeeModel,
        billType:billTypeModel,
        bill:billModel,*/

    //以下export，为了mongoValidate
    // collections,
    collFieldDefine,
} //

