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

const browserInputRule=require('../../../../constant/inputRule/browserInput/user/user_resource_profile').user_resource_profile
// const internalInputRule=require('../../../../constant/inputRule/internalInput/user/user').user
//根据inputRule的rule设置，对mongoose设置内建validator
// const collInputRule=Object.assign({},browserInputRule,internalInputRule)
const collInputRule=browserInputRule

const serverRuleType=require('../../../../constant/enum/inputDataRuleType').ServerRuleType


// const collections=['department','employee','billType','bill']

const assist=require('../../common/assist')



// const store_path=require('../admin/store_path')
/*
* schema definition
* 内置validator的定义放在ruleDefine中
* required(all)/min_max(number)/enum_match_minLength_maxLength()
* */

const collName='user_resource_profile'
const collFieldDefine={
    userId:{type:mongoose.Schema.Types.ObjectId},
    resource_profile_id:{type:mongoose.Schema.Types.ObjectId},
    duration:{type:Number},
    //isActive: boolean   //当前的resource_profile是否还有效
    startDate:{type:Date},//需要根据用户当前已有的同resourceProfile决定，而不是创建时间
    endDate:{type:Date}, //冗余字段，startDate+duration

    cDate:{type:Date,default:Date.now},
    // uDate:{type:Date,default:Date.now},
    // dDate:{type:Date},

}

// console.log(`${__filename}:before: ${JSON.stringify(collFieldDefine)}`)

if(mongoSetting.configuration.setBuildInValidatorFlag){
    assist.setMongooseBuildInValidator(collFieldDefine,collInputRule)
}


/*console.log(`${__filename}:after=======>${JSON.stringify(collFieldDefine['userId'])}`)
console.log(`${__filename}:after=======>${JSON.stringify(collFieldDefine['resource_profile_id'])}`)
console.log(`${__filename}:after=======>${JSON.stringify(collFieldDefine['duration'])}`)
console.log(`${__filename}:after=======>${JSON.stringify(collFieldDefine['cDate'])}`)
console.log(`${__filename}:after=======>${JSON.stringify(collFieldDefine)}`)*/
const collSchema=new mongoose.Schema(
    collFieldDefine,
    mongoSetting.schemaOptions
)

collSchema.virtual('isActive').get(function(){

    if(0===this.duration){
        return true
    }else{
        return (this.cDate.getTime()+this.duration*86400000)>Date.now()
    }

})

/*      mongoose使用新的方式设置model，没有的话会导致populate报错       */
mongoose.model(collName,collSchema)
const collModel=connectedDb.model(collName,collSchema)


module.exports={
    collSchema,
    collModel,
    collFieldDefine,
} //

