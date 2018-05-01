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

const baseJSErrorCode=102550
const baseMongoErrorCode=202550

/*        field有enum才需要require        */
const mongoEnum=require('../../../enum/mongoEnum')

const public_group_interaction= {
    creatorId: {
        [otherRuleFiledName.CHINESE_NAME]: '发言者',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode, msg: '发言者不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '发言者不能为空'}},//只有发言被删除的时候，才会
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+2, msg: '发言者必须是objectId'}, mongoError: {rc: baseMongoErrorCode+2, msg: '发言者必须是objectId'}} //server端使用
    },

    deleteById: {
        [otherRuleFiledName.CHINESE_NAME]: '删除者',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false}, error: {rc: baseJSErrorCode+4, msg: '删除者不能为空'}, mongoError: {rc: baseMongoErrorCode+4, msg: '删除者不能为空'}},//只有在删除发言，才会加上发言删除者
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+6, msg: '删除者必须是objectId'}, mongoError: {rc: baseMongoErrorCode+6, msg: '删除者必须是objectId'}} //server端使用
    },




}

module.exports={
    public_group_interaction,
}