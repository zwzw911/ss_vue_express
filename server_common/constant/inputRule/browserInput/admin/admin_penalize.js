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
//const enumValue=require('../../../../model/mongo/structure/enumValue')
const enumValue=require('../../../../constant/genEnum/enumValue')

const admin_penalize= {
    punishedId: {
        [otherRuleFiledName.CHINESE_NAME]: '受罚人',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE], //只能在create的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10080}, mongoError: {rc: 20080, msg: '受罚人不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 2, error: {rc: 10002}, mongoError: {rc: 20002, msg: '用户名至少2个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '用户名的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10081}, mongoError: {rc: 20081, msg: '受罚人格式不正确'}} //server端使用
    },

    reason: {
        [otherRuleFiledName.CHINESE_NAME]: '受罚原因',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE], //只能在create的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10082}, mongoError: {rc: 20082, msg: '受罚原因不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MIN_LENGTH]: {define: 15, error: {rc: 10083}, mongoError: {rc: 20083, msg: '受罚原因至少15个字符'}},
        [ruleFiledName.MAX_LENGTH]: {define: 1000, error: {rc: 10084}, mongoError: {rc: 20084, msg: '受罚原因的字数不能超过1000个字符'}},
        // [ruleFiledName.FORMAT]: {define: regex.password, error: {rc: 10012}, mongoError: {rc: 20012, msg: '密码必须由6-20个字符组成'}} //server端使用
    },

    //user type
    penalizeType: {
        [otherRuleFiledName.CHINESE_NAME]: '受罚类型',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE], //只能在create的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10085}, mongoError: {rc: 20085, msg: '受罚类型不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.ENUM]:{define:enumValue.PenalizeType,error:{rc:10086},mongoError:{rc:20086,msg:'受罚类型不正确'}},//server端使用
    },
    penalizeSubType: {
        [otherRuleFiledName.CHINESE_NAME]: '受罚子类型',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE], //只能在create的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10087}, mongoError: {rc: 20087, msg: '受罚子类型不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.ENUM]:{define:enumValue.PenalizeSubType,error:{rc:10088},mongoError:{rc:20088,msg:'受罚子类型不正确'}},//server端使用
    },
    //user priority
    duration: {
        [otherRuleFiledName.CHINESE_NAME]: '受罚时长',
        [otherRuleFiledName.DATA_TYPE]:serverDataType.INT,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE], //只能在create的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10089}, mongoError: {rc: 20089, msg: '受罚时长不能为空'}},//用户权限初始可以为空，以后ROOT用户进行分配
        [ruleFiledName.MIN]: {define: 0, error: {rc: 10090}, mongoError: {rc: 20090, msg: '受罚时长至少1天'}},
        [ruleFiledName.MAX]: {define: 30, error: {rc: 10091}, mongoError: {rc: 20091, msg: '受罚时长最长30天'}},
    },
    //撤销理由，只在delete的时候才使用，create的时候要在code中删除
    revokeReason:{
        [otherRuleFiledName.CHINESE_NAME]: '撤销原因',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.DELETE], //只能在update的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.DELETE]:true}, error: {rc: 10092}, mongoError: {rc: 20092, msg: '撤销原因不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MIN_LENGTH]: {define: 15, error: {rc: 10093}, mongoError: {rc: 20093, msg: '撤销原因至少15个字符'}},
        [ruleFiledName.MAX_LENGTH]: {define: 1000, error: {rc: 10094}, mongoError: {rc: 20094, msg: '撤销原因原因的字数不能超过1000个字符'}},
    },
}

module.exports={
    admin_penalize
 }