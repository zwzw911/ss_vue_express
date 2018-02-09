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


/*/!*        field有enum才需要require        *!/
const mongoEnum=require('../../../enum/mongo')*/

const impeach_comment= {
    impeachId: {
        [otherRuleFiledName.CHINESE_NAME]: '举报',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10560, msg: '举报不能为空'}, mongoError: {rc: 20560, msg: '举报不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10562, msg: '举报必须是objectId'}, mongoError: {rc: 20562, msg: '举报必须是objectId'}} //server端使用
    },
    content: {
        [otherRuleFiledName.CHINESE_NAME]: '评论内容',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10564, msg: '评论内容不能为空'}, mongoError: {rc: 20564, msg: '评论内容不能为空'}},//create的时候是server内定的，所以设为false
        [ruleFiledName.MIN_LENGTH]: {define: 15, error: {rc: 10566, msg: '评论内容至少15个字符'}, mongoError: {rc: 20566, msg: '评论内容至少15个字符'}},
        [ruleFiledName.MAX_LENGTH]: {define: 140, error: {rc: 10568, msg: '评论内容不能超过140个字符'}, mongoError: {rc: 20568, msg: '评论内容不能超过140个字符'}},
        // [ruleFiledName.FORMAT]: {define: regex.folderFileName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '评论内容必须由1-255个字符组成'}} //server端使用
    },


}

module.exports={
    impeach_comment
}