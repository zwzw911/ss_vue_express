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

/*              获得 某些设置值            */
const maxNumber=require('../../../config/globalConfiguration').maxNumber
/*/!*        field有enum才需要require        *!/
const mongoEnum=require('../../../enum/mongo')*/
const baseJSErrorCode=105450
const baseMongoErrorCode=205450

const collection= {
    creatorId:{
        [otherRuleFiledName.CHINESE_NAME]: '收藏夹创建人',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,}, error: {rc: baseJSErrorCode, msg: '收藏夹创建人不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '收藏夹创建人不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+2, msg: '收藏夹创建人必须是objectId'}, mongoError: {rc: baseMongoErrorCode+2, msg: '收藏夹创建人必须是objectId'}} //server端使用
    },
//只能有一个父目录，所以无需update父目录
    parentId: {
        [otherRuleFiledName.CHINESE_NAME]: '父级收藏夹',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,}, error: {rc: baseJSErrorCode+4, msg: '父级收藏夹不能为空'}, mongoError: {rc: baseMongoErrorCode+4, msg: '父级收藏夹不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 1, error: {rc: baseJSErrorCode+2, msg: '收藏夹名至少1个字符'}, mongoError: {rc: baseMongoErrorCode+2, msg: '收藏夹名至少1个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 50, error: {rc: baseJSErrorCode+4, msg: '收藏夹名的字符数不能超过50个字符'}, mongoError: {rc: baseMongoErrorCode+4, msg: '收藏夹名的字符数不能超过50个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+6,msg:'父级收藏夹必须是objectId'}, mongoError: {rc: baseMongoErrorCode+6, msg: '父级收藏夹必须是objectId'}} //server端使用
    },
    articleNum:{
        [otherRuleFiledName.CHINESE_NAME]: '收藏文档的数量',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.NUMBER,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_ARRAY]:false}, error: {rc: baseJSErrorCode+8, msg: '收藏夹中文档数量不能为空'}, mongoError: {rc: baseMongoErrorCode+8, msg: '收藏夹中文档数量不能为空'}},//
    },
    topicNum:{
        [otherRuleFiledName.CHINESE_NAME]: '收藏主题的数量',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.NUMBER,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_ARRAY]:false}, error: {rc: baseJSErrorCode+10, msg: '收藏夹中主题数量不能为空'}, mongoError: {rc: baseMongoErrorCode+10, msg: '收藏夹中主题数量不能为空'}},//
    },
}

module.exports={
    collection
}