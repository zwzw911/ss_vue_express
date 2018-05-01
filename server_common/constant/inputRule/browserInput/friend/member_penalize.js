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
// const mongoEnum=require('../../../enum/mongo')
const enumValue=require('../../../../constant/genEnum//enumValue')

const searchRange=inputDataRuleType.SearchRange

const baseJSErrorCode=102200
const baseMongoErrorCode=202200


/*                  处罚只能创建                  */
const member_penalize= {


    publicGroupId: {
        [otherRuleFiledName.CHINESE_NAME]: '群',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE], //必须在create，可以在update，的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode, msg: '群不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '群不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+2, msg: '群必须是objectId'}, mongoError: {rc: baseMongoErrorCode+2, msg: '群必须是objectId'}} //server端使用
    },

    memberId: {
        [otherRuleFiledName.CHINESE_NAME]: '成员',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+4, msg: '成员不能为空'}, mongoError: {rc: baseMongoErrorCode+4, msg: '成员不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+6, msg: '成员必须是objectId'}, mongoError: {rc: baseMongoErrorCode+6, msg: '成员必须是objectId'}} //server端使用
    },

    penalizeType: {
        [otherRuleFiledName.CHINESE_NAME]: '处罚类型',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+8, msg: '处罚类型不能为空'}, mongoError: {rc: baseMongoErrorCode+8, msg: '处罚类型不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'enum':{define:Object.values(mongoEnum.PenalizeType.DB),error:{rc:10310},mongoError:{rc:20310,msg:'未知处罚类型'}},//server端使用
        [ruleFiledName.ENUM]:{define:enumValue.PenalizeType,error:{rc:baseJSErrorCode+10,msg:'未知处罚类型'},mongoError:{rc:baseMongoErrorCode+10,msg:'未知处罚类型'}},//server端使用
    },

    duration: {
        [otherRuleFiledName.CHINESE_NAME]: '处罚时间',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.INT,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [otherRuleFiledName.SEARCH_RANGE]:[searchRange.ALL],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+12, msg: '处罚时间不能为空'}, mongoError: {rc: baseMongoErrorCode+12, msg: '处罚时间不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MIN]: {define: 1, error: {rc: baseJSErrorCode+14, msg: '处罚时间最少1天'}, mongoError: {rc: baseMongoErrorCode+14, msg: '处罚时间最少1天'}},
        [ruleFiledName.MAX]: {define: 30, error: {rc: baseJSErrorCode+16, msg: '处罚时间最多30天'}, mongoError: {rc: baseMongoErrorCode+16, msg: '处罚时间最多30天'}},
        // [ruleFiledName.FORMAT]: {define: regex.folderFileName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '文档名必须由1-255个字符组成'}} //server端使用
},





}

module.exports={
    member_penalize,
}