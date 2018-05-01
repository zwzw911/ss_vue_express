/**
 * Created by zhang wei on 2017-06-09.
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
/*              获得 某些设置值            */
const maxNumber=require('../../../config/globalConfiguration').maxNumber

const baseJSErrorCode=102750
const baseMongoErrorCode=202750

const user_public_group= {
    userId: {
        [otherRuleFiledName.CHINESE_NAME]: '用户',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode, msg: '用户不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '用户不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+2, msg: '用户必须是objectId'}, mongoError: {rc: baseMongoErrorCode+2, msg: '用户必须是objectId'}} //server端使用
    },


    currentJoinGroup: {
        [otherRuleFiledName.CHINESE_NAME]: '用户所处群',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+4, msg: '用户所处群不能为空'}, mongoError: {rc: baseMongoErrorCode+4, msg: '用户所处群不能为空'}},//若尚未加入任何群，字段为空
        // 'arrayMinLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '群管理员至少有一个成员'}},
        'arrayMaxLength': {define: maxNumber.friend.maxGroupUserCanJoinIn, error: {rc: baseJSErrorCode+6, msg: `用户最多加入${maxNumber.friend.maxGroupUserCanJoinIn}个群`}, mongoError: {rc: baseMongoErrorCode+6, msg: `用户最多加入${maxNumber.friend.maxGroupUserCanJoinIn}个群`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+8, msg: '用户所处群必须是objectId'}, mongoError: {rc: baseMongoErrorCode+8, msg: '用户所处群必须是objectId'}} //server端使用
    },

}

module.exports={
    user_public_group,
}