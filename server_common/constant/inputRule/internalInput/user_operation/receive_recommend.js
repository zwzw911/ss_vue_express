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

const baseJSErrorCode=105250
const baseMongoErrorCode=205250

const receive_recommend= {
    receiver: {
        [otherRuleFiledName.CHINESE_NAME]: '接收人',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,}, error: {rc: baseJSErrorCode, msg: '接收人不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '接收人不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+2, msg: '接收人必须是objectId'}, mongoError: {rc: baseMongoErrorCode+2, msg: '接收人必须是objectId'}} //server端使用
    },
    unreadRecommends:{
        [otherRuleFiledName.CHINESE_NAME]: '未读的分享文档',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_ARRAY],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_ARRAY]:true}, error: {rc: baseJSErrorCode+4, msg: '未读的分享文档不能为空'}, mongoError: {rc: baseMongoErrorCode+4, msg: '未读的分享文档不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'arrayMinLength': {define: 1, error: {rc: 10804, msg: '至少推荐给1个用户'}, mongoError: {rc: 20804, msg: '至少推荐给1个用户'}},
        //虽然有最大长度，但是要通过代码进行FIFO操作，所以不检查最大长度了
        // [ruleFiledName.ARRAY_MAX_LENGTH]: {define: maxNumber.user_operation.maxUnReadReceiveRecommends, error: {rc: baseJSErrorCode+6, msg: `最多保存${maxNumber.user_operation.maxReceiveRecommends}篇未读的分享文档`}, mongoError: {rc: baseMongoErrorCode+6, msg: `最多保存${maxNumber.user_operation.maxReceiveRecommends}篇未读的分享文档`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+8, msg: '未读的分享文档必须是objectId'}, mongoError: {rc: baseMongoErrorCode+8, msg: '未读的分享文档必须是objectId'}} //server端使用
    },
    unreadRecommendsNum:{
        [otherRuleFiledName.CHINESE_NAME]: '未读的分享文档数量',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.NUMBER,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_ARRAY],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_ARRAY]:false}, error: {rc: baseJSErrorCode+10, msg: '未读的分享文档数量不能为空'}, mongoError: {rc: baseMongoErrorCode+10, msg: '未读的分享文档数量不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'arrayMinLength': {define: 1, error: {rc: 10804, msg: '至少推荐给1个用户'}, mongoError: {rc: 20804, msg: '至少推荐给1个用户'}},
        // [ruleFiledName.ARRAY_MAX_LENGTH]: {define: maxNumber.user_operation.maxUnReadReceiveRecommends, error: {rc: baseJSErrorCode+6, msg: `最多保存${maxNumber.user_operation.maxReceiveRecommends}篇未读的分享文档`}, mongoError: {rc: baseMongoErrorCode+6, msg: `最多保存${maxNumber.user_operation.maxReceiveRecommends}篇未读的分享文档`}},
        // [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+8, msg: '未读的分享文档必须是objectId'}, mongoError: {rc: baseMongoErrorCode+8, msg: '未读的分享文档必须是objectId'}} //server端使用
    },
    readRecommends:{
        [otherRuleFiledName.CHINESE_NAME]: '已读的分享文档',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_ARRAY],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_ARRAY]:true}, error: {rc: baseJSErrorCode+12, msg: '已读的分享文档不能为空'}, mongoError: {rc: baseMongoErrorCode+12, msg: '已读的分享文档不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'arrayMinLength': {define: 1, error: {rc: 10804, msg: '至少推荐给1个用户'}, mongoError: {rc: 20804, msg: '至少推荐给1个用户'}},
        //因为是internal操作，且BAISC/ADVANCE的值不一样，所以最大长度通过user_profile决定，无需通过rule判断
        // [ruleFiledName.ARRAY_MAX_LENGTH]: {define: maxNumber.user_operation.maxReadReceiveRecommends, error: {rc: baseJSErrorCode+12, msg: `最多保存${maxNumber.user_operation.maxReceiveRecommends}篇已读的分享文档`}, mongoError: {rc: baseMongoErrorCode+12, msg: `最多保存${maxNumber.user_operation.maxReceiveRecommends}篇已读的分享文档户`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+14, msg: '已读的分享文档必须是objectId'}, mongoError: {rc: baseMongoErrorCode+14, msg: '已读的分享文档必须是objectId'}} //server端使用
    },
    readRecommendsNum:{
        [otherRuleFiledName.CHINESE_NAME]: '已读的分享文档数量',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.NUMBER,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_ARRAY],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_ARRAY]:false}, error: {rc: baseJSErrorCode+16, msg: '已读的分享文档数量不能为空'}, mongoError: {rc: baseMongoErrorCode+16, msg: '已读的分享文档数量不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'arrayMinLength': {define: 1, error: {rc: 10804, msg: '至少推荐给1个用户'}, mongoError: {rc: 20804, msg: '至少推荐给1个用户'}},
        // [ruleFiledName.ARRAY_MAX_LENGTH]: {define: maxNumber.user_operation.maxUnReadReceiveRecommends, error: {rc: baseJSErrorCode+6, msg: `最多保存${maxNumber.user_operation.maxReceiveRecommends}篇未读的分享文档`}, mongoError: {rc: baseMongoErrorCode+6, msg: `最多保存${maxNumber.user_operation.maxReceiveRecommends}篇未读的分享文档`}},
        // [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+8, msg: '未读的分享文档必须是objectId'}, mongoError: {rc: baseMongoErrorCode+8, msg: '未读的分享文档必须是objectId'}} //server端使用
    },
}

module.exports={
    receive_recommend
}