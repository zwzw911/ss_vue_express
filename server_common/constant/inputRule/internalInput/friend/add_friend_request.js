/**
 * Created by ada on 2017-12-24.
 *  用户对应的inputRule（后台自动产生的数据）
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
/*        field有enum才需要require        */
// const mongoEnum=require('../../../enum/mongo')
/*              获得 某些设置值            */
// const maxNumber=require('../../../config/globalConfiguration').maxNumber
const maxAddFriendRequest=require('../../../config/globalConfiguration').addFriendRequest.max

const baseJSErrorCode=102150
const baseMongoErrorCode=202150

const add_friend_request= {

    originator: {
        [otherRuleFiledName.CHINESE_NAME]: '发起人',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode, msg: '发起人不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '发起人不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 1, error: {rc: 10412}, mongoError: {rc: 20412, msg: '朋友分组名至少1个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10414}, mongoError: {rc: 20414, msg: '朋友分组名的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+2, msg: '发起人必须是objectId'}, mongoError: {rc: baseMongoErrorCode+2, msg: '发起人必须是objectId'}} //server端使用
    },
/***  status不能由用户输入来确定，而是要通过server内部设置  ***/
/*** 被请求者处理请求时，通过不同的URL来设置status（接受/拒绝 等）    ***/
    status:{
        [otherRuleFiledName.CHINESE_NAME]: '当前请求所处状态',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:true}, error: {rc: baseJSErrorCode+4, msg: '状态不能为空'}, mongoError: {rc: baseMongoErrorCode+4, msg: '状态不能为空'}},//
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'arrayMaxLength': {define: maxNumber.friend.maxFriendsNumberPerGroup, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含${maxNumber.friend.maxFriendsNumberPerGroup}个好友`}},
        [ruleFiledName.ENUM]: {define: enumValue.AddFriendStatus, error: {rc: baseJSErrorCode+6, msg: '状态未定义'}, mongoError: {rc: baseMongoErrorCode+6, msg: '状态未定义'}} //server端使用
    },

    //false；因为不好在internal value中检查
    declineTimes:{
        [otherRuleFiledName.CHINESE_NAME]: '被拒次数',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.INT,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+8, msg: '被拒次数不能为空'}, mongoError: {rc: baseMongoErrorCode+8, msg: '被拒次数不能为空'}},//
        // [ruleFiledName.MIN]: {define: 0, error: {rc: 10770, msg: '源配置有效期最短1天'}, mongoError: {rc: 20770, msg: '源配置有效期最短1天'}},
        [ruleFiledName.MAX]: {define: maxAddFriendRequest.maxDeclineTimes, error: {rc: baseJSErrorCode+10, msg:`拒绝次数最大${maxAddFriendRequest.maxAcceptTimes}次`}, mongoError: {rc: baseMongoErrorCode+10, msg: `拒绝次数最大${maxAddFriendRequest.maxAcceptTimes}次`}},
    },

    acceptTimes:{
        [otherRuleFiledName.CHINESE_NAME]: '同意次数',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.INT,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+12, msg: '同意次数不能为空'}, mongoError: {rc: baseMongoErrorCode+12, msg: '同意次数不能为空'}},//
        // [ruleFiledName.MIN]: {define: 0, error: {rc: 10770, msg: '源配置有效期最短1天'}, mongoError: {rc: 20770, msg: '源配置有效期最短1天'}},
        [ruleFiledName.MAX]: {define: maxAddFriendRequest.maxAcceptTimes, error: {rc: baseJSErrorCode+14, msg: `同意次数最大${maxAddFriendRequest.maxAcceptTimes}次`}, mongoError: {rc: baseMongoErrorCode+14, msg: `同意次数最大${maxAddFriendRequest.maxAcceptTimes}次`}},
    },
}

module.exports={
    add_friend_request,
}