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

const baseJSErrorCode=101000
const baseMongoErrorCode=201000

const article= {
    name: {
        [otherRuleFiledName.CHINESE_NAME]: '文档标题',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //必须在create，可以在update，的recordInfo中出现
        [otherRuleFiledName.PLACE_HOLDER]:['文档标题，至多50个字符'],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode, msg: '文档名不能为空'}, mongoError: {rc: baseMongoErrorCode, msg: '文档名不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 1, error: {rc: 10102}, mongoError: {rc: 20102, msg: '文档名至少1个字符'}},
        [ruleFiledName.MAX_LENGTH]: {define: 50, error: {rc: baseJSErrorCode+2, msg: '文档名的长度不能超过50个字符'}, mongoError: {rc: baseMongoErrorCode+2, msg: '文档名的长度不能超过50个字符'}},
        // [ruleFiledName.FORMAT]: {define: regex.fileName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '文档名必须由1-255个字符组成'}} //server端使用
    },
    status: {
        [otherRuleFiledName.CHINESE_NAME]: '文档状态',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //必须在create，可以在update，的recordInfo中出现
        [otherRuleFiledName.PLACE_HOLDER]:['文档状态'],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+4, msg: '文档状态不能为空'}, mongoError: {rc: baseMongoErrorCode+4, msg: '文档状态不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.ENUM]:{define:enumValue.ArticleStatus,error:{rc:baseJSErrorCode+6,msg:'文档状态不正确'},mongoError:{rc:baseMongoErrorCode+6,msg:'文档状态不正确'}},//server端使用

    },
//folderId可以为空，表示文档不处于任何目录下
    folderId: {
        [otherRuleFiledName.CHINESE_NAME]: '文档目录',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //必须在create，可以在update，的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+8, msg: '文档目录不能为空'}, mongoError: {rc: baseMongoErrorCode+2+8, msg: '文档目录不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息

        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.ARRAY_MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+10, msg: '文档目录必须是objectId'}, mongoError: {rc: baseMongoErrorCode+10, msg: '文档目录必须是objectId'}} //server端使用
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
        [otherRuleFiledName.PLACE_HOLDER]:['文档内容'],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+12, msg: '文档内容不能为空'}, mongoError: {rc: baseMongoErrorCode+12, msg: '文档内容不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MIN_LENGTH]: {define: 15, error: {rc: baseJSErrorCode+14, msg: '文档内容至少15个字符'}, mongoError: {rc: baseMongoErrorCode+14, msg: '文档内容至少15个字符'}},
        [ruleFiledName.MAX_LENGTH]: {define: 50000, error: {rc: baseJSErrorCode+16, msg: '文档内容的长度不能超过50000个字符'}, mongoError: {rc: baseMongoErrorCode+16, msg: '文档内容的长度不能超过50000个字符'}},
        // [ruleFiledName.FORMAT]: {define: regex.folderFileName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '文档名必须由1-255个字符组成'}} //server端使用
    },
    //输入的时候是字符
    tags: {
        [otherRuleFiledName.CHINESE_NAME]: '文档标签',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.STRING],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //必须在create，可以在update，的recordInfo中出现
        [otherRuleFiledName.PLACE_HOLDER]:['文档标签，2至20个字符'],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+18, msg: '文档标签不能为空'}, mongoError: {rc: baseMongoErrorCode+18, msg: '文档标签不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.ARRAY_MIN_LENGTH]: {define: 1, error: {rc: 10122}, mongoError: {rc: 20122, msg: '至少设置1个标签'}},
        [ruleFiledName.ARRAY_MAX_LENGTH]: {define: maxNumber.article.tagNumberPerArticle, error: {rc: baseJSErrorCode+20, msg: `最多设置${maxNumber.article.tagNumberPerArticle}标签`}, mongoError: {rc: baseMongoErrorCode+20, msg: `最多设置${maxNumber.article.tagNumberPerArticle}标签`}},
        [ruleFiledName.MIN_LENGTH]: {define: 2, error: {rc: baseJSErrorCode+22, msg: '文档标签至少2个字符'}, mongoError: {rc: baseMongoErrorCode+22, msg: '文档标签至少2个字符'}},
        [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: baseJSErrorCode+24, msg: '文档标签的长度不能超过20个字符'}, mongoError: {rc: baseMongoErrorCode+24, msg: '文档标签的长度不能超过20个字符'}},
        // [ruleFiledName.FORMAT]: {define: regex.tagName, error: {rc: 10124}, mongoError: {rc: 20124, msg: '文档标签必须是objectId'}} //server端使用
    },
    //分类可以为空
    categoryId: {
        [otherRuleFiledName.CHINESE_NAME]: '分类',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //必须在create，可以在update，的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+26, msg: '文档分类不能为空'}, mongoError: {rc: baseMongoErrorCode+26, msg: '文档分类不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+28, msg: '文档分类必须是objectId'}, mongoError: {rc: baseMongoErrorCode+28, msg: '文档分类必须是objectId'}} //server端使用
    },
    allowComment: {
        [otherRuleFiledName.CHINESE_NAME]: '允许评论',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.BOOLEAN,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //必须在create，可以在update，的recordInfo中出现
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+28, msg: '文档分类不能为空'}, mongoError: {rc: baseMongoErrorCode+28, msg: '允许评论不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+30, msg: '文档分类必须是objectId'}, mongoError: {rc: baseMongoErrorCode+30, msg: '允许评论必须是boolean'}} //server端使用
    },
}

module.exports={
    article
}