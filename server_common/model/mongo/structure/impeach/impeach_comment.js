/**
 * Created by wzhan039 on 2017-06-10.
 *
 * 定义用户信息
 */

'use strict'
const mongoose=require('mongoose');
// const fs=require('fs')
const regex=require('../../../../constant/regex/regex').regex
const connectedDb=require('../../common/connection').dbSS;

//使用ES6的promise
//mongoose.Promise=Promise
//mongoose.Promise = Promise
const mongoSetting=require('../../common/configuration')

const browserInputRule=require('../../../../constant/inputRule/browserInput/impeach/impeach_comment').impeach_comment
const internalInputRule=require('../../../../constant/inputRule/internalInput/impeach/impeach_comment').impeach_comment
//根据inputRule的rule设置，对mongoose设置内建validator
const collInputRule=Object.assign({},browserInputRule,internalInputRule)


const serverRuleType=require('../../../../constant/enum/inputDataRuleType').ServerRuleType


// const collections=['department','employee','billType','bill']

const assist=require('../../common/assist')



/*
* schema definition
* 内置validator的定义放在ruleDefine中
* required(all)/min_max(number)/enum_match_minLength_maxLength()
* */

/*                           department                        */
const collName='impeach_comment'

/*               直接自定义validator（而不是通过函数产生），为了加快执行速度         */
const impeachCommentImage_arrayMaxLengthValidator={
    validator(v){
        return v.length<=collInputRule['impeachImagesId'][serverRuleType.ARRAY_MAX_LENGTH]['define']
    },
    message:`错误代码${collInputRule['impeachImagesId'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['rc']}:${collInputRule['impeachImagesId'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['msg']}`
}
const impeachCommentAttachment_arrayMaxLengthValidator={
    validator(v){
        return v.length<=collInputRule['impeachAttachmentsId'][serverRuleType.ARRAY_MAX_LENGTH]['define']
    },
    message:`错误代码${collInputRule['impeachAttachmentsId'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['rc']}:${collInputRule['impeachAttachmentsId'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['msg']}`
}

/**         举报的后续处理         **/
/**     comment单独使用一个表，是为了使用impeachId串联起整个impeach **/
const collFieldDefine={
    authorId:{type:mongoose.Schema.Types.ObjectId,ref:"user"}, //普通用户发起
    adminAuthorId:{type:mongoose.Schema.Types.ObjectId,ref:"adminUser"},//管理员发起
    impeachId:{type:mongoose.Schema.Types.ObjectId,ref:"impeach"},//对应哪个举报
    content:{type:String,},
    impeachImagesId:{type:[mongoose.Schema.Types.ObjectId],ref:'impeach_image',validate:[impeachCommentImage_arrayMaxLengthValidator]},
    impeachAttachmentsId:{type:[mongoose.Schema.Types.ObjectId],ref:'impeach_attachment',validate:[impeachCommentAttachment_arrayMaxLengthValidator]},

    imagesNum:{type:Number, default:0},//记录图片总数
    imagesSizeInMb:{type:Number, default:0},//记录图片总大小

    documentStatus:{type:String},//enum
    cDate:{type:Date,default:Date.now},
    //uDate:{type:Date,default:Date.now},//评论无法更改
    // dDate:{type:Date},  //只能由admin删除
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

