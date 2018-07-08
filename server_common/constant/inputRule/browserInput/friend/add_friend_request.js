/**
 * Created by ada on 2017-12-24.
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
const enumValue=require('../../../../constant/genEnum/enumValue')
/*              获得 某些设置值            */
// const maxNumber=require('../../../config/globalConfiguration').maxNumber

const baseJSErrorCode=102100
const baseMongoErrorCode=202100

const add_friend_request= {
    receiver: {
        [otherRuleFiledName.CHINESE_NAME]: '添加的好友',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode, msg: '添加好友不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '添加好友不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 1, error: {rc: 10412}, mongoError: {rc: 20412, msg: '朋友分组名至少1个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10414}, mongoError: {rc: 20414, msg: '朋友分组名的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+2, msg: '好友必须是objectId'}, mongoError: {rc: baseMongoErrorCode+2, msg: '好友必须是objectId'}} //server端使用
    },
    message: {
        [otherRuleFiledName.CHINESE_NAME]: '附加信息',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.S,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,}, error: {rc: baseJSErrorCode+4, msg: '附加信息不能为空'}, mongoError: {rc: baseMongoErrorCode+4, msg: '附加信息不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MIN_LENGTH]: {define: 5, error: {rc: baseJSErrorCode+6, msg: '附加信息至少5个字符'}, mongoError: {rc: baseMongoErrorCode+6, msg: '附加信息至少5个字符'}},
        [ruleFiledName.MAX_LENGTH]: {define: 50, error: {rc: baseJSErrorCode+8, msg: '附加信息的长度不能超过50个字符'}, mongoError: {rc: baseMongoErrorCode+8, msg: '附加信息的长度不能超过50个字符'}},
        // [ruleFiledName.FORMAT]: {define: regex.folderFileName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '文档名必须由1-255个字符组成'}} //server端使用
        // [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+2, msg: '好友必须是objectId'}, mongoError: {rc: baseMongoErrorCode+2, msg: '好友必须是objectId'}} //server端使用
    },

/*    status:{
        [otherRuleFiledName.CHINESE_NAME]: '当前请求所处状态',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_SCALAR]:true}, error: {rc: baseJSErrorCode+4, msg: '状态不能为空'}, mongoError: {rc: baseMongoErrorCode+4, msg: '状态不能为空'}},//
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'arrayMaxLength': {define: maxNumber.friend.maxFriendsNumberPerGroup, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含${maxNumber.friend.maxFriendsNumberPerGroup}个好友`}},
        [ruleFiledName.ENUM]: {define: enumValue.AddFriendStatus, error: {rc: baseJSErrorCode+6, msg: '状态未定义'}, mongoError: {rc: baseMongoErrorCode+6, msg: '状态未定义'}} //server端使用
    },*/


}

module.exports={
    add_friend_request,
}