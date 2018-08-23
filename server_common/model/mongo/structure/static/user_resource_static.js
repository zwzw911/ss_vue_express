/**
 * Created by wzhan039 on 2017-12-06.
 *
 * 统计用户分类（article image or attachment）总资源，简化查询（不用每次都group）
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

const collName='user_resource_static'
const collFieldDefine={
    userId:{type:mongoose.Schema.Types.ObjectId},
    resourceRange:{type:String}, //统计的范围(现在是WHOLE_FILE_RESOURCE_PER_PERSON，合并article image/attachment，便于操作)
    uploadedFileNum:{type:Number},
    uploadedFileSizeInMb:{type:Number},
    //isActive: boolean   //当前的resource_profile是否还有效
    dailyCheckDate:{type:Date},//此记录最后一次通过daily检测的时间，可以控制daily检测的频率，防止每次daily check都把所有数据进行检测
    dailyUpdateDate:{type:Date},//此记录最后一次通过daily检测，发现group得到的数据和db中数据不一致，而发生update的时间
    cDate:{type:Date,default:Date.now}, //用户创建时需要创建
    uDate:{type:Date,default:Date.now}, //最后一次更新的时间
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
    // console.log(`id=======>${this._id}`)
    // console.log(`userId=======>${this.userId}`)
    // console.log(`resource_profile_id=======>${this.resource_profile_id}`)
    // console.log(`duration=======>${this.duration}`)
    // // console.log(`doc=======>${JSON.stringify(this)}`)
    // console.log(`cDate=======>${this.cDate}`)
    // console.log(`cDate to now=======>${this.cDate.getTime()+this.duration*24*60*60*1000}`)
    // console.log(`now  =======>${Date.now()}`)
    // console.log(`result===>${(this.cDate.getTime()+this.duration*24*60*1000)<(Date.now())}`)
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

