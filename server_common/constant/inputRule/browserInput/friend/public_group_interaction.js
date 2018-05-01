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
const mongoEnum=require('../../../enum/mongoEnum')

const baseJSErrorCode=102500
const baseMongoErrorCode=202500

const public_group_interaction= {


    publicGroupId: {
        [otherRuleFiledName.CHINESE_NAME]: '群',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode, msg: '群不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '群不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+2, msg: '群必须是objectId'}, mongoError: {rc: baseMongoErrorCode+2, msg: '群必须是objectId'}} //server端使用
    },

    content: {
        [otherRuleFiledName.CHINESE_NAME]: '群发言内容',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+4, msg: '群发言内容不能为空'}, mongoError: {rc: baseMongoErrorCode+4, msg: '群发言内容不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MIN_LENGTH]: {define: 15, error: {rc: baseJSErrorCode+6, msg: '群发言内容至少15个字符'}, mongoError: {rc: baseMongoErrorCode+6, msg: '群发言内容至少15个字符'}},
        [ruleFiledName.MAX_LENGTH]: {define: 1000, error: {rc: baseJSErrorCode+8, msg: '群发言内容的长度不能超过1000个字符'}, mongoError: {rc: baseMongoErrorCode+8, msg: '群发言内容的长度不能超过1000个字符'}},
        // [ruleFiledName.FORMAT]: {define: regex.folderFileName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '文档名必须由1-255个字符组成'}} //server端使用
    },










}

module.exports={
    public_group_interaction,
}