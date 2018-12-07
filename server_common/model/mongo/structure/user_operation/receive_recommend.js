/**
 * Created by 张伟 on 2018-11-19.
 *
 * 用户接收的分享文档
 * 创建用户时，自动初始化；sendRecommend时，自动分解请求，并设置receiveRecommend中对应的记录
 *
 */

'use strict'
const ap=require('awesomeprint')
const mongoose=require('mongoose');
const fs=require('fs')
const regex=require('../../../../constant/regex/regex').regex
const connectedDb=require('../../common/connection').dbSS;

//使用ES6的promise
//mongoose.Promise=Promise
//mongoose.Promise = Promise
const mongoSetting=require('../../common/configuration')

// const browserInputRule=require('../../../../constant/inputRule/browserInput/user_operation/receiveRecommend').recommend
const internalInputRule=require('../../../../constant/inputRule/internalInput/user_operation/receive_recommend').receive_recommend
//根据inputRule的rule设置，对mongoose设置内建validator
const collInputRule=Object.assign({},internalInputRule)

const serverRuleType=require('../../../../constant/enum/inputDataRuleType').ServerRuleType


// const collections=['department','employee','billType','bill']

const assist=require('../../common/assist')



/*
* schema definition
* 内置validator的定义放在ruleDefine中
* required(all)/min_max(number)/enum_match_minLength_maxLength()
* */

const collName='receive_recommend'

/**               直接自定义validator（而不是通过函数产生），为了加快执行速度         **/
//未读和已读使用同一validator
//无需检测最小，因为最小就是空数组
/*const recommendArticle_arrayMinLengthValidator={
    validator(v){
        // console.log(`validateo ius ${JSON.stringify(collInputRule['toUserId'])}`)
        if(false===collInputRule['unreadArticle'][serverRuleType.REQUIRE]['define']){
            if(undefined===v){
                return true
            }
            if(0===v.length){
                return true
            }
        }
        return v.length>=collInputRule['unreadArticle'][serverRuleType.ARRAY_MIN_LENGTH]['define']
    },
    message:`错误代码${collInputRule['unreadArticle'][serverRuleType.ARRAY_MIN_LENGTH]['mongoError']['rc']}:${collInputRule['unreadArticle'][serverRuleType.ARRAY_MIN_LENGTH]['mongoError']['msg']}`
}*/
/*const recommendArticle_arrayMaxLengthValidator= {
    validator(v){
        //没有输入数组，也通过
        if(undefined===v){
            return true
        }
        return v.length <= collInputRule['readRecommends'][serverRuleType.ARRAY_MAX_LENGTH]['define']
    },
    message: `错误代码${collInputRule['readRecommends'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['rc']}:${collInputRule['unreadRecommends'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['msg']}`

}*/

/*const toGroupId_arrayMinLengthValidator={
    validator(v){
        if(false===collInputRule['toGroupId'][serverRuleType.REQUIRE]['define']){
            if(0===v.length){
                return true
            }
        }
        return v.length>=collInputRule['toGroupId'][serverRuleType.ARRAY_MIN_LENGTH]['define']
    },
    message:`错误代码${collInputRule['toGroupId'][serverRuleType.ARRAY_MIN_LENGTH]['mongoError']['rc']}:${collInputRule['toGroupId'][serverRuleType.ARRAY_MIN_LENGTH]['mongoError']['msg']}`
}
const toGroupId_arrayMaxLengthValidator= {
    validator(v){
        return v.length <= collInputRule['toGroupId'][serverRuleType.ARRAY_MAX_LENGTH]['define']
    },
    message: `错误代码${collInputRule['toGroupId'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['rc']}:${collInputRule['toGroupId'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['msg']}`

}

const toPublicGroupId_arrayMinLengthValidator={
    validator(v){
        if(false===collInputRule['toPublicGroupId'][serverRuleType.REQUIRE]['define']){
            if(0===v.length){
                return true
            }
        }
        return v.length>=collInputRule['toPublicGroupId'][serverRuleType.ARRAY_MIN_LENGTH]['define']
    },
    message:`错误代码${collInputRule['toPublicGroupId'][serverRuleType.ARRAY_MIN_LENGTH]['mongoError']['rc']}:${collInputRule['toPublicGroupId'][serverRuleType.ARRAY_MIN_LENGTH]['mongoError']['msg']}`
}
const toPublicGroupId_arrayMaxLengthValidator= {
    validator(v){
        return v.length <= collInputRule['toPublicGroupId'][serverRuleType.ARRAY_MAX_LENGTH]['define']
    },
    message: `错误代码${collInputRule['toPublicGroupId'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['rc']}:${collInputRule['toPublicGroupId'][serverRuleType.ARRAY_MAX_LENGTH]['mongoError']['msg']}`

}*/

//1. 如果unreadRecommends有数据，而readRecommends为空数组，说明是不活跃用户，unreadRecommends达到上限后，当作队列，最早的删除，以便容纳最新的
//2. 如果unreadRecommends和readRecommends都有数据，说明活跃，检测unreadRecommends+readRecommends是否达到上限，是的话，当用户登录点击未读时，报错，提示删除部分已读
const collFieldDefine={
    receiver:{type:mongoose.Schema.Types.ObjectId,ref:"user"},//接受人
    //他人分享的，但是未点击的文档
    //虽然有最大长度，但是要通过代码进行FIFO操作，所以不检查最大长度了
    unreadRecommends:[{type:mongoose.Schema.Types.ObjectId,ref:"send_recommend"}],
    //$size只支持精确匹配；virtual只能获得结果，不能作为查询条件。因此，为了范围查询字段，添加额外字段，记录数组的长度
    unreadRecommendsNum:{type:Number,default:0},
    //他人分享的，已经点击的文档
    //因为是internal操作，且BAISC/ADVANCE的值不一样，所以最大长度通过user_profile决定，无需通过rule判断
    readRecommends:[{type:mongoose.Schema.Types.ObjectId,ref:"send_recommend"}],
    //$size只支持精确匹配；virtual只能获得结果，不能作为查询条件。因此，为了范围查询字段，添加额外字段，记录数组的长度
    readRecommendsNum:{type:Number,default:0},
    cDate:{type:Date,default:Date.now},
    uDate:{type:Date,default:Date.now},
    dDate:{type:Date},
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
/***        只能作为查询结果，不能作为查询条件       ***/
/*collSchema.virtual('unreadRecommendsNum').get(function(){
    ap.inf('virtual unreadRecommendsNum ',this.unreadRecommends)
    ap.inf('virtual unreadRecommendsNum result',this.unreadRecommends.length)
    return this.unreadRecommends.length
    /!*    if(0===this.duration){
            return true
        }else{
            return (this.cDate.getTime()+this.duration*86400000)>Date.now()
        }*!/

})

collSchema.virtual('readRecommendsNum').get(function(){
    return this.readRecommends.length
    /!*    if(0===this.duration){
            return true
        }else{
            return (this.cDate.getTime()+this.duration*86400000)>Date.now()
        }*!/
})*/
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

