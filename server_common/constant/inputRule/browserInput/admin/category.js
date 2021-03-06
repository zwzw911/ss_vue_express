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

const baseJSErrorCode=100200
const baseMongoErrorCode=200200

const category= {
    name: {
        [otherRuleFiledName.CHINESE_NAME]: '分类名称',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //必须在create，可以在update，的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode, msg: '分类名不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '分类名不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MIN_LENGTH]: {define: 2, error: {rc: baseJSErrorCode+2, msg: '分类名至少2个字符'}, mongoError: {rc: baseMongoErrorCode+2, msg: '分类名至少2个字符'}},
        [ruleFiledName.MAX_LENGTH]: {define: 50, error: {rc: baseJSErrorCode+4, msg: '分类名的长度不能超过50个字符'}, mongoError: {rc:baseMongoErrorCode+4, msg: '分类名的长度不能超过50个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },


    //上级分类为空，说明当前分类为root分类
    parentCategoryId: {
        [otherRuleFiledName.CHINESE_NAME]: '上级分类',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+6, msg: '上级分类不能为空'}, mongoError: {rc: baseMongoErrorCode+6, msg: '上级分类不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+8, msg: '上级分类必须是objectId'}, mongoError: {rc: baseMongoErrorCode+8, msg: '上级分类必须是objectId'}} //server端使用
    },
}

module.exports={
    category
}