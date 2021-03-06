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
const maxNumber=require('../../../config/globalConfiguration').maxNumber

const baseJSErrorCode=105150
const baseMongoErrorCode=205150

const send_recommend= {
    sender: {
        [otherRuleFiledName.CHINESE_NAME]: '推荐人',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,}, error: {rc: baseJSErrorCode, msg: '推荐人不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '推荐人不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+2, msg: '推荐人必须是objectId'}, mongoError: {rc: baseMongoErrorCode+2, msg: '推荐人必须是objectId'}} //server端使用
    },
    /**     不能直接输入receivers，而是通过CHOOSE_FRIEND，经过转换后得到   **/
    receivers:{
        [otherRuleFiledName.CHINESE_NAME]: '被荐人',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+4, msg: '被荐人不能为空'}, mongoError: {rc: baseMongoErrorCode+4, msg: '被荐人不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'arrayMinLength': {define: 1, error: {rc: baseJSErrorCode+6, msg: '至少推荐给1个用户'}, mongoError: {rc: baseMongoErrorCode+6, msg: '至少推荐给1个用户'}},
        'arrayMaxLength': {define: maxNumber.user_operation.maxRecommendToUser, error: {rc: baseJSErrorCode+8, msg: `最多推荐给${maxNumber.user_operation.maxRecommendToUser}个用户`}, mongoError: {rc: baseMongoErrorCode+8, msg: `最多推荐给${maxNumber.user_operation.maxRecommendToUser}个用户`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+10, msg: '被荐人必须是objectId'}, mongoError: {rc: baseMongoErrorCode+10, msg: '被荐人必须是objectId'}} //server端使用
    },
}

module.exports={
    send_recommend
}