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

const browserInputRule=require('../../../../constant/inputRule/browserInput/article/article').article
const internalInputRule=require('../../../../constant/inputRule/internalInput/article/article').article

const serverRuleType=require('../../../../constant/enum/inputDataRuleType').ServerRuleType


// const collections=['department','employee','billType','bill']

const assist=require('../../common/assist')

//根据inputRule的rule设置，对mongoose设置内建validator
const collInputRule=Object.assign({},browserInputRule,internalInputRule)

//gene by server/maintain/generateMongoEnum
const enumValue=require('../enumValue')
/*
* schema definition
* 内置validator的定义放在ruleDefine中
* required(all)/min_max(number)/enum_match_minLength_maxLength()
* */

/*                           department                        */
const collName='article'


/*               直接自定义validator（而不是通过函数产生），为了加快执行速度         */
const tag_arrayMinLengthValidator={
    validator(v){
/*        console.log(`tag is ${JSON.stringify(v)}`)
        console.log(`tag length is ${JSON.stringify(v.length)}`)*/
        if(false===collInputRule['tags'][serverRuleType.REQUIRE]['define']){
            if(0===v.length){
                return true
            }
        }
        return v.length>=collInputRule['tags'][serverRuleType.ARRAY_MIN_LENGTH]['define']
    },
    message:`错误代码${collInputRule['tags'][serverRuleType.ARRAY_MIN_LENGTH]['mongoError']['rc']}:${collInputRule['tags'][serverRuleType.ARRAY_MIN_LENGTH]['mongoError']['msg']}`
}
const tag_arrayMaxLengthValidator={
    validator(v){
        return v.length<=collInputRule['tags'][serverRuleType.ARRAY_MAX_LENGTH]['define']
    },
    message:`错误代码${collInputRule['tags'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['rc']}:${collInputRule['tags'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['msg']}`
}

const image_arrayMaxLengthValidator={
    validator(v){
        return v.length<=collInputRule['articleImagesId'][serverRuleType.ARRAY_MAX_LENGTH]['define']
    },
    message:`错误代码${collInputRule['articleImagesId'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['rc']}:${collInputRule['articleImagesId'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['msg']}`
}

const attachment_arrayMaxLengthValidator={
    validator(v){
        return v.length<=collInputRule['articleAttachmentsId'][serverRuleType.ARRAY_MAX_LENGTH]['define']
    },
    message:`错误代码${collInputRule['articleAttachmentsId'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['rc']}:${collInputRule['articleAttachmentsId'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['msg']}`
}

const comment_arrayMaxLengthValidator={
    validator(v){
        return v.length<=collInputRule['articleCommentsId'][serverRuleType.ARRAY_MAX_LENGTH]['define']
    },
    message:`错误代码${collInputRule['articleCommentsId'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['rc']}:${collInputRule['articleCommentsId'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['msg']}`
}

const collFieldDefine={
    name:{type:String,},
    status:{type:String,}, //enum， 通过setMongooseBuildInValidator从inputRule中获得对应的enum定义
    authorId:{type:mongoose.Schema.Types.ObjectId,ref:"user"}, //
    folderId:{type:mongoose.Schema.Types.ObjectId,ref:"folder"},
    // pureContent:{type:String},
    htmlContent:{type:String},//一般设置成pureContent的2倍大小
    categoryId:{type:mongoose.Schema.Types.ObjectId,ref:"category"},
    tags:{type:[String],validate:[tag_arrayMinLengthValidator,tag_arrayMaxLengthValidator]},
    articleImagesId:{type:[mongoose.Schema.Types.ObjectId],ref:'article_image',validate:[image_arrayMaxLengthValidator]},
    articleAttachmentsId:{type:[mongoose.Schema.Types.ObjectId],ref:'article_attachment',validate:[attachment_arrayMaxLengthValidator]},
    articleCommentsId:{type:[mongoose.Schema.Types.ObjectId],ref:'article_comment',validate:[comment_arrayMaxLengthValidator]},
    readNum:{type:Number, default:0}, //记录文档被读取的次数（冗余字段，也可以从read_article中count得到）
    cDate:{type:Date,default:Date.now},
    uDate:{type:Date,default:Date.now},
    dDate:{type:Date},
}

// console.log(`before: ${JSON.stringify(collFieldDefine)}`)

if(mongoSetting.configuration.setBuildInValidatorFlag){
    assist.setMongooseBuildInValidator(collFieldDefine,collInputRule)
}


// console.log(`after: ${JSON.stringify(collFieldDefine)}`)
// console.log(`after: ${JSON.stringify(collFieldDefine['authorId']['match'])}`)
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

