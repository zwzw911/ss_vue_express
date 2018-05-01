/**
 * Created by wzhan039 on 2017-06-09.
 *  用户对应的inputRule（浏览器传递到server的数据）
 *  不包括server自动生成的数据，例如cDate等。因为默认程序自动生成的数据是正确的
 */

'use strict'

const inputDataRuleType=require('../../../enum/inputDataRuleType')
const serverDataType=inputDataRuleType.ServerDataType
const ruleFiledName=inputDataRuleType.RuleFiledName
const otherRuleFiledName=inputDataRuleType.OtherRuleFiledName
const applyRange=inputDataRuleType.ApplyRange

const regex=require('../../../regex/regex').regex

/*        field有enum才需要require        */
 // const mongoEnum=require('../../../enum/mongo')
//const enumValue=require('../../../../model/mongo/structure/enumValue')
const enumValue=require('../../../../constant/genEnum/enumValue')

const baseJSErrorCode=100100
const baseMongoErrorCode=200100

const admin_user= {
    name: {
        [otherRuleFiledName.CHINESE_NAME]: '用户名',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //必须在create，可以在update，的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode, msg: '用户名不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '用户名不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 2, error: {rc: 10002}, mongoError: {rc: 20002, msg: '用户名至少2个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '用户名的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.userName, error: {rc: baseJSErrorCode+2, msg: '用户名必须由2-20个字符组成'}, mongoError: {rc: baseMongoErrorCode+2, msg: '用户名必须由2-20个字符组成'}}
    },


    //此处是处理用户输入password
    password: {
        [otherRuleFiledName.CHINESE_NAME]: '密码',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //必须在create，可以在update，的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+4, msg: '密码不能为空'}, mongoError: {rc: 20006, msg: '密码不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10008}, mongoError: {rc: 20008, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10010}, mongoError: {rc: 20010, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.password, error: {rc: baseJSErrorCode+6, msg: '密码必须由6-20个字符组成'}, mongoError: {rc: baseJSErrorCode+6, msg: '密码必须由6-20个字符组成'}} //server端使用
    },

    //user type
    userType: {
        [otherRuleFiledName.CHINESE_NAME]: '管理员类型',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //必须在create，可以在update，的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+8, msg: '管理员类型不能为空'}, mongoError: {rc: baseJSErrorCode+8, msg: '管理员类型不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.ENUM]:{define:enumValue.AdminUserType,error:{rc:baseJSErrorCode+10,msg:'管理员类型不正确'},mongoError:{rc:baseJSErrorCode+10,msg:'管理员类型不正确'}},//server端使用
    },

    //user priority
    userPriority: {
        [otherRuleFiledName.CHINESE_NAME]: '用户权限',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.STRING],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //可以在create，可以在update，的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+12, msg: '用户权限不能为空'}, mongoError: {rc: baseJSErrorCode+12, msg: '用户权限不能为空'}},//用户权限初始可以为空，以后ROOT用户进行分配
        [ruleFiledName.ENUM]:{define:enumValue.AdminPriorityType,error:{rc:baseJSErrorCode+14,msg:'用户权限不正确'},mongoError:{rc:baseJSErrorCode+14,msg:'用户权限不正确'}},//server端使用
         // 'arrayMinLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个权限'}},
        //至少包含1个权限
        [ruleFiledName.ARRAY_MIN_LENGTH]: {define: 1, error: {rc: baseJSErrorCode+16, msg: `至少拥有1个权限`}, mongoError: {rc: baseJSErrorCode+16, msg: `至少拥有1个权限`}},
        //最多包含所有权限
        [ruleFiledName.ARRAY_MAX_LENGTH]: {define: enumValue.AdminPriorityType.length, error: {rc: baseJSErrorCode+18, msg: `最多拥有${enumValue.AdminPriorityType.length}个权限`}, mongoError: {rc: baseJSErrorCode+18, msg: `最多拥有${enumValue.AdminPriorityType.length}个权限`}},
    },
}

module.exports={
    admin_user
}