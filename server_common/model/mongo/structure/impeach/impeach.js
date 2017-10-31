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

const browserInputRule=require('../../../../constant/inputRule/browserInput/impeach/impeach').impeach
const internalInputRule=require('../../../../constant/inputRule/internalInput/impeach/impeach').impeach

const serverRuleType=require('../../../../constant/enum/inputDataRuleType').ServerRuleType


// const collections=['department','employee','billType','bill']

const assist=require('../../common/assist')

//根据inputRule的rule设置，对mongoose设置内建validator
const collInputRule=Object.assign({},browserInputRule,internalInputRule)


//gene by server/maintain/generateMongoEnum
//const enumValue=require('../enumValue')
/*
* schema definition
* 内置validator的定义放在ruleDefine中
* required(all)/min_max(number)/enum_match_minLength_maxLength()
* */

/*                           department                        */
const collName='impeach'

/*               直接自定义validator（而不是通过函数产生），为了加快执行速度         */
const impeachImage_arrayMaxLengthValidator={
    validator(v){
        return v.length<=collInputRule['impeachImagesId'][serverRuleType.ARRAY_MAX_LENGTH]['define']
    },
    message:`错误代码${collInputRule['impeachImagesId'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['rc']}:${collInputRule['impeachImagesId'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['msg']}`
}
const impeachAttachment_arrayMaxLengthValidator={
    validator(v){
        return v.length<=collInputRule['impeachAttachmentsId'][serverRuleType.ARRAY_MAX_LENGTH]['define']
    },
    message:`错误代码${collInputRule['impeachAttachmentsId'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['rc']}:${collInputRule['impeachAttachmentsId'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['msg']}`
}
const impeachComment_arrayMaxLengthValidator={
    validator(v){
        return v.length<=collInputRule['impeachCommentsId'][serverRuleType.ARRAY_MAX_LENGTH]['define']
    },
    message:`错误代码${collInputRule['impeachCommentsId'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['rc']}:${collInputRule['impeachCommentsId'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['msg']}`
}

const collFieldDefine={
    title:{type:String,},
    content:{type:String},
    impeachImagesId:{type:[mongoose.Schema.Types.ObjectId],ref:'impeach_image',validate:[impeachImage_arrayMaxLengthValidator]},
    impeachAttachmentsId:{type:[mongoose.Schema.Types.ObjectId],ref:'impeach_attachment',validate:[impeachAttachment_arrayMaxLengthValidator]},
    impeachCommentsId:{type:[mongoose.Schema.Types.ObjectId],ref:'impeach_comment',validate:[impeachComment_arrayMaxLengthValidator]},
    impeachType:{type:String,},//enum:enumValue.ImpeachType，article/comment
    impeachedArticleId:{type:mongoose.Schema.Types.ObjectId,ref:"article"}, //
    impeachedCommentId:{type:mongoose.Schema.Types.ObjectId,ref:"article_comment"}, //举报的文档评论
    impeachedUserId:{type:mongoose.Schema.Types.ObjectId,ref:"user"}, //
    creatorId:{type:mongoose.Schema.Types.ObjectId,ref:"user"}, //
    currentState:{type:String},//enum
    currentAdminOwnerId:{type:mongoose.Schema.Types.ObjectId,ref:"admin_user"},//只有adminUser开始处理时，才会被设置Admin;如无设置，隐式说明当前owner是creatorId
    // impeachStatus:{type:String,}, //enum:enumValue.ImpeachStatus       enum， 通过setMongooseBuildInValidator从inputRule中获得对应的enum定义
    cDate:{type:Date,default:Date.now},
    // uDate:{type:Date,default:Date.now},
    dDate:{type:Date}, //用户可以撤销举报
}

// console.log(`before: ${JSON.stringify(collFieldDefine)}`)

if(mongoSetting.configuration.setBuildInValidatorFlag){
    assist.setMongooseBuildInValidator(collFieldDefine,collInputRule)
}


// console.log(`after: ${JSON.stringify(collFieldDefine)}`)
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
/*          复合unique index，一个用户对一个object只能impeach一次          */
collSchema.index({creatorId: 1, impeachedArticleId: 1}, {unique: true});
collSchema.index({creatorId: 1, impeachedCommentId: 1}, {unique: true});
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

