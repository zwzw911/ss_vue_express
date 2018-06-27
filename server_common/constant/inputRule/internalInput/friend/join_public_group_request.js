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


const enumValue=require('../../../../constant/genEnum/enumValue')

/*              获得 某些设置值            */
// const maxNumber=require('../../../config/globalConfiguration').userGroupFriend.max

const baseJSErrorCode=102850
const baseMongoErrorCode=202850

const join_public_group_request= {
    creatorId: {
        [otherRuleFiledName.CHINESE_NAME]: '请求人',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,}, error: {rc: baseJSErrorCode, msg: '请求人不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '请求人不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 1, error: {rc: baseJSErrorCode+2, msg: '朋友分组名至少1个字符'}, mongoError: {rc: baseMongoErrorCode+2, msg: '朋友分组名至少1个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: baseJSErrorCode+4, msg: '朋友分组名的长度不能超过20个字符'}, mongoError: {rc: baseMongoErrorCode+4, msg: '朋友分组名的长度不能超过20个字符'}},
        // [ruleFiledName.FORMAT]: {define: regex.folderFileName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '文档名必须由1-255个字符组成'}} //server端使用
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+2, msg: '请求人必须是objectId'}, mongoError: {rc: baseMongoErrorCode+2, msg: '请求人必须是objectId'}} //server端使用
    },
    /**     根据不同的url，产生不同的值     **/
    handleResult:{
        [otherRuleFiledName.CHINESE_NAME]: '请求处理结果',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:true}, error: {rc: baseJSErrorCode+4, msg: '请求处理结果不能为空'}, mongoError: {rc: baseMongoErrorCode+4, msg: '请求处理结果不能为空'}},//
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'arrayMaxLength': {define: maxNumber.friend.maxFriendsNumberPerGroup, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含${maxNumber.friend.maxFriendsNumberPerGroup}个好友`}},
        [ruleFiledName.ENUM]: {define: enumValue.JoinPublicGroupHandleResult, error: {rc: baseJSErrorCode+6, msg: '请求处理结果未定义'}, mongoError: {rc: baseMongoErrorCode+6, msg: '请求处理结果未定义'}} //server端使用
    },
}

module.exports={
    join_public_group_request
}