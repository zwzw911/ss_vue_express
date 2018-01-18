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

/*              获得 某些设置值            */
const maxNumber=require('../../../config/globalConfiguration').maxNumber

const article= {
    name: {
        [otherRuleFiledName.CHINESE_NAME]: '文档名',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //必须在create，可以在update，的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10100}, mongoError: {rc: 20000, msg: '文档名不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 1, error: {rc: 10102}, mongoError: {rc: 20102, msg: '文档名至少1个字符'}},
        [ruleFiledName.MAX_LENGTH]: {define: 50, error: {rc: 10104}, mongoError: {rc: 20104, msg: '文档名的长度不能超过50个字符'}},
        // [ruleFiledName.FORMAT]: {define: regex.fileName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '文档名必须由1-255个字符组成'}} //server端使用
    },
    status: {
        [otherRuleFiledName.CHINESE_NAME]: '文档状态',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //必须在create，可以在update，的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10106}, mongoError: {rc: 20106, msg: '文档状态不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.ENUM]:{define:enumValue.ArticleStatus,error:{rc:10108},mongoError:{rc:20108,msg:'文档状态不正确'}},//server端使用

    },

    folderId: {
        [otherRuleFiledName.CHINESE_NAME]: '文档目录',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //必须在create，可以在update，的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10110}, mongoError: {rc: 20110, msg: '文档目录不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.ARRAY_MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10112}, mongoError: {rc: 20112, msg: '文档目录必须是objectId'}} //server端使用
    },
/*    pureContent: {
        [otherRuleFiledName.CHINESE_NAME]: '文本内容',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [ruleFiledName.REQUIRE]: {define: true, error: {rc: 10114}, mongoError: {rc: 20114, msg: '文本内容不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MIN_LENGTH]: {define: 1, error: {rc: 10116}, mongoError: {rc: 20116, msg: '文本内容至少1个字符'}},
        [ruleFiledName.ARRAY_MAX_LENGTH]: {define: 10000, error: {rc: 10118}, mongoError: {rc: 20118, msg: '文本内容的长度不能超过10000个字符'}},
        // [ruleFiledName.FORMAT]: {define: regex.folderFileName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '文档名必须由1-255个字符组成'}} //server端使用
    },*/
    htmlContent: {
        [otherRuleFiledName.CHINESE_NAME]: '文档内容',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //必须在create，可以在update，的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10114}, mongoError: {rc: 20114, msg: '文档内容不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MIN_LENGTH]: {define: 15, error: {rc: 10116}, mongoError: {rc: 20116, msg: '文档内容至少15个字符'}},
        [ruleFiledName.MAX_LENGTH]: {define: 50000, error: {rc: 10118}, mongoError: {rc: 20118, msg: '文档内容的长度不能超过50000个字符'}},
        // [ruleFiledName.FORMAT]: {define: regex.folderFileName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '文档名必须由1-255个字符组成'}} //server端使用
    },
    //输入的时候是字符
    tags: {
        [otherRuleFiledName.CHINESE_NAME]: '文档标签',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.STRING],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //必须在create，可以在update，的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10120}, mongoError: {rc: 20120, msg: '文档标签不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.ARRAY_MIN_LENGTH]: {define: 1, error: {rc: 10122}, mongoError: {rc: 20122, msg: '至少设置1个标签'}},
        [ruleFiledName.ARRAY_MAX_LENGTH]: {define: maxNumber.article.tagNumberPerArticle, error: {rc: 10123}, mongoError: {rc: 20123, msg: `最多设置${maxNumber.article.tagNumberPerArticle}标签`}},
        [ruleFiledName.MIN_LENGTH]: {define: 2, error: {rc: 10123}, mongoError: {rc: 20123, msg: '文档标签至少2个字符'}},
        [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10124}, mongoError: {rc: 20124, msg: '文档标签的长度不能超过20个字符'}},
        // [ruleFiledName.FORMAT]: {define: regex.tagName, error: {rc: 10124}, mongoError: {rc: 20124, msg: '文档标签必须是objectId'}} //server端使用
    },
    categoryId: {
        [otherRuleFiledName.CHINESE_NAME]: '分类',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //必须在create，可以在update，的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10130}, mongoError: {rc: 20130, msg: '文档分类不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10132}, mongoError: {rc: 20132, msg: '文档分类必须是objectId'}} //server端使用
    },
}

module.exports={
    article
}