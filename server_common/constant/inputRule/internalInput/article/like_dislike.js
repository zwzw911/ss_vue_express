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

const baseJSErrorCode=101350
const baseMongoErrorCode=201350

const like_dislike= {
    //
    authorId: {
        [otherRuleFiledName.CHINESE_NAME]: '提交者',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode, msg: '提交者不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '提交者不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+2, msg: '提交者必须是objectId'}, mongoError: {rc: baseMongoErrorCode+2, msg: '提交者必须是objectId'}} //server端使用
    },
    like: {
        [otherRuleFiledName.CHINESE_NAME]: '喜欢',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.BOOLEAN,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE], //必须在create，的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+4, msg: '喜欢不能为空'}, mongoError: {rc: baseMongoErrorCode+4, msg: '喜欢不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        // [ruleFiledName.FORMAT]: {define: regex.OBJECT_ID, error: {rc: 10005}, mongoError: {rc: 20005, msg: '提交者必须是objectId'}} //server端使用
    },

}

module.exports={
    like_dislike
}