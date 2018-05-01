/**
 * Created by wzhan039 on 2017-06-09.
 *  server自动生成的数据，例如cDate等，可能也需要验证，防止程序错误
 */

'use strict'

const inputDataRuleType=require('../../../enum/inputDataRuleType')
const serverDataType=inputDataRuleType.ServerDataType
const ruleFiledName=inputDataRuleType.RuleFiledName
const otherRuleFiledName=inputDataRuleType.OtherRuleFiledName
const applyRange=inputDataRuleType.ApplyRange

const regex=require('../../../regex/regex').regex
const enumValue=require('../../../../constant/genEnum/enumValue')

const baseJSErrorCode=100050
const baseMongoErrorCode=200050

const admin_user= {

    //转换过的password，最终要存入db
    password: {
        [otherRuleFiledName.CHINESE_NAME]: '密码',
        [otherRuleFiledName.DATA_TYPE]:serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode,msg:'密码不能为空'},mongoError:{rc:baseMongoErrorCode,msg:'密码不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        /*            [ruleFiledName.MIN_LENGTH]:{define:6,error:{rc:10002},mongoError:{rc:20002,msg:'密码至少6个字符'}},
         [ruleFiledName.MAX_LENGTH]:{define:20,error:{rc:10004},mongoError:{rc:20004,msg:'密码的长度不能超过20个字符'}},*/
        [ruleFiledName.FORMAT]:{define:regex.sha512,error:{rc:baseJSErrorCode+2,msg:'密码必须由128个字符组成'},mongoError:{rc:baseMongoErrorCode+2,msg:'密码必须由128个字符组成'}} //加密密码只在server端使用
    },
    /*              维护事务一致性             */
    docStatus:{
        [otherRuleFiledName.CHINESE_NAME]: 'document状态',
        [otherRuleFiledName.DATA_TYPE]:serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE], //确定账号是否完成，所以只有create
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+4,msg:'document状态不能为空'},mongoError:{rc:baseMongoErrorCode+4,msg:'document状态不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        /*            [ruleFiledName.MIN_LENGTH]:{define:6,error:{rc:10002},mongoError:{rc:20002,msg:'密码至少6个字符'}},
         [ruleFiledName.MAX_LENGTH]:{define:20,error:{rc:10004},mongoError:{rc:20004,msg:'密码的长度不能超过20个字符'}},*/
        [ruleFiledName.ENUM]:{define:enumValue.DocStatus,error:{rc:baseJSErrorCode+6,msg:'document状态不是预定义的值'},mongoError:{rc:baseMongoErrorCode+6,msg:'document状态不是预定义的值'}} //加密密码采用sha256，减少CPU负荷
    },
    lastAccountUpdateDate:{
        [otherRuleFiledName.CHINESE_NAME]: '账号更改日期',
        [otherRuleFiledName.DATA_TYPE]:serverDataType.DATE,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:true}, error: {rc: baseJSErrorCode+8,msg:'账号更改日期不能为空'},mongoError:{rc:baseMongoErrorCode+8,msg:'账号更改日期不能为空'}},//注册的时候，就必须把account插入

    },

    lastSignInDate:{
        [otherRuleFiledName.CHINESE_NAME]: '上次登录时间',
        [otherRuleFiledName.DATA_TYPE]:serverDataType.DATE,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:true}, error: {rc: baseJSErrorCode+10,msg:'上次登录时间不能为空'},mongoError:{rc:baseMongoErrorCode+10,msg:'上次登录时间不能为空'}},//注册的时候，就必须把account插入
    },
}

module.exports={
    admin_user,
}