/**
 * Created by wzhan039 on 2080-06-09.
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

const baseJSErrorCode=105100
const baseMongoErrorCode=205100

const send_recommend= {
    articleId: {
        [otherRuleFiledName.CHINESE_NAME]: '文档',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode, msg: '文档不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '文档不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+2, msg: '文档必须是objectId'}, mongoError: {rc: baseMongoErrorCode+2, msg: '文档必须是objectId'}} //server端使用
    },
    receivers:{
        [otherRuleFiledName.CHINESE_NAME]: '被荐人',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+4, msg: '被荐人不能为空'}, mongoError: {rc: baseMongoErrorCode+4, msg: '被荐人不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'arrayMinLength': {define: 1, error: {rc: baseJSErrorCode+6, msg: '至少推荐给1个用户'}, mongoError: {rc: baseMongoErrorCode+6, msg: '至少推荐给1个用户'}},
        'arrayMaxLength': {define: maxNumber.user_operation.maxRecommendToUser, error: {rc: baseJSErrorCode+8, msg: `最多推荐给${maxNumber.user_operation.maxRecommendToUser}个用户`}, mongoError: {rc: baseMongoErrorCode+8, msg: `最多推荐给${maxNumber.user_operation.maxRecommendToUser}个用户`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+10, msg: '被荐人必须是objectId'}, mongoError: {rc: baseMongoErrorCode+10, msg: '被荐人必须是objectId'}} //server端使用
    },
    /*toGroupId:{
        [otherRuleFiledName.CHINESE_NAME]: '被荐朋友组',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false}, error: {rc: 10807, msg: '被荐朋友组不能为空'}, mongoError: {rc: 20807, msg: '被荐朋友组不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'arrayMinLength': {define: 1, error: {rc: 10808, msg: '至少推荐给1个朋友组'}, mongoError: {rc: 20808, msg: '至少推荐给1个朋友组'}},
        'arrayMaxLength': {define: maxNumber.article.tagNumberPerArticle, error: {rc: 10809, msg: `最多推荐给${maxNumber.article.tagNumberPerArticle}个朋友组`}, mongoError: {rc: 20809, msg: `最多推荐给${maxNumber.article.tagNumberPerArticle}个朋友组`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10810, msg: '被荐朋友组必须是objectId'}, mongoError: {rc: 20810, msg: '被荐朋友组必须是objectId'}} //server端使用
    },
    toPublicGroupId:{
        [otherRuleFiledName.CHINESE_NAME]: '被荐群',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false}, error: {rc: 10811, msg: '被荐群不能为空'}, mongoError: {rc: 20811, msg: '被荐群不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'arrayMinLength': {define: 1, error: {rc: 10812, msg: '至少推荐给1个群'}, mongoError: {rc: 20812, msg: '至少推荐给1个群'}},
        'arrayMaxLength': {define: maxNumber.article.tagNumberPerArticle, error: {rc: 10813, msg: `最多推荐给${maxNumber.article.tagNumberPerArticle}个群`}, mongoError: {rc: 20813, msg: `最多推荐给${maxNumber.article.tagNumberPerArticle}个群`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10814, msg: '被荐群必须是objectId'}, mongoError: {rc: 20814, msg: '被荐群必须是objectId'}} //server端使用
    },*/
}

module.exports={
    send_recommend
}