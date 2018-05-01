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
/*              获得 某些设置值            */
const maxNumber=require('../../../config/globalConfiguration').maxNumber

const baseJSErrorCode=101000
const baseMongoErrorCode=201000

const article= {

    authorId: {
        [otherRuleFiledName.CHINESE_NAME]: '作者',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: baseJSErrorCode+50, msg: '作者不能为空'}, mongoError: {rc: baseMongoErrorCode+50, msg: '作者不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+52, msg: '作者必须是objectId'}, mongoError: {rc: baseMongoErrorCode+52, msg: '作者必须是objectId'}} //server端使用
    },

    //虽然mongodb中定义的是array+objectId，但是实际处理时，从client传递的只是objectId，所以定义的时候，只检查objectId
    articleImagesId: {
        [otherRuleFiledName.CHINESE_NAME]: '文档图片',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_SCALAR], //
        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+54, msg: '文档图片不能为空'}, mongoError: {rc: baseMongoErrorCode+54, msg: '文档图片不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        'arrayMaxLength': {define: maxNumber.article.imagesNumberPerArticle, error: {rc: baseJSErrorCode+56, msg: `最多插入${maxNumber.article.imagesNumberPerArticle}个图片`}, mongoError: {rc: baseMongoErrorCode+56, msg: `最多插入${maxNumber.article.imagesNumberPerArticle}个图片`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+58, msg: '文档图片必须是objectId'}, mongoError: {rc: baseMongoErrorCode+58, msg: '文档图片必须是objectId'}} //server端使用
    },
    //虽然mongodb中定义的是array+objectId，但是实际处理时，从client传递的只是objectId，所以定义的时候，只检查objectId
    articleAttachmentsId: {
        [otherRuleFiledName.CHINESE_NAME]: '文档附件',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_SCALAR], //
        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+60, msg: '文档附件不能为空'}, mongoError: {rc: baseMongoErrorCode+60, msg: '文档附件不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'arrayMinLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        'arrayMaxLength': {define: maxNumber.article.attachmentNumberPerArticle, error: {rc: baseJSErrorCode+62, msg: `最多添加${maxNumber.article.attachmentNumberPerArticle}个附件`}, mongoError: {rc: baseMongoErrorCode+62, msg: `最多添加${maxNumber.article.attachmentNumberPerArticle}个附件`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+64, msg: '文档附件片必须是objectId'}, mongoError: {rc: baseMongoErrorCode+64, msg: '文档附件片必须是objectId'}} //server端使用
    },
    //虽然mongodb中定义的是array+objectId，但是实际处理时，从client传递的只是objectId，所以定义的时候，只检查objectId
    articleCommentsId: {
        [otherRuleFiledName.CHINESE_NAME]: '留言',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_SCALAR], //
        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+66, msg: '文档留言不能为空'}, mongoError: {rc: baseMongoErrorCode+66, msg: '文档留言不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        'arrayMaxLength': {define: maxNumber.article.commentNumberPerArticle, error: {rc: baseJSErrorCode+68, msg: `最多添加${maxNumber.article.commentNumberPerArticle}个留言`}, mongoError: {rc: baseMongoErrorCode+68, msg: `最多添加${maxNumber.article.commentNumberPerArticle}个留言`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: baseJSErrorCode+70, msg: '文档留言片必须是objectId'}, mongoError: {rc: baseMongoErrorCode+70, msg: '文档留言片必须是objectId'}} //server端使用
    },
    attachmentsNum:{
        [otherRuleFiledName.CHINESE_NAME]: '文档附件总数',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.NUMBER],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_SCALAR], //
        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+72, msg: '文档附件总数不能为空'}, mongoError: {rc: 20159, msg: '附件总数不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MAX]:{define:maxNumber.article.attachmentNumberPerArticle, error: {rc: baseJSErrorCode+74, msg: `文档附件总数不能超过${maxNumber.article.attachmentNumberPerArticle}个`}, mongoError: {rc: 20154, msg: '附件总数不能为空'}},
    },
    attachmentsSizeInMb:{
        [otherRuleFiledName.CHINESE_NAME]: '文档附件总大小',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.NUMBER],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_SCALAR], //
        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+76, msg: '文档附件总大小不能为空'}, mongoError: {rc: 20159, msg: '附件总数不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MAX]:{define:maxNumber.article.attachmentSizeInMb, error: {rc: baseJSErrorCode+78, msg: `文档附件总大小不能超过${maxNumber.article.attachmentSizeInMb}Mb`}, mongoError: {rc: 20154, msg: '附件总数不能为空'}},
    },
    imagesNum:{
        [otherRuleFiledName.CHINESE_NAME]: '文档图片总数',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.NUMBER],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_SCALAR], //
        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+80, msg: '文档图片总数不能为空'}, mongoError: {rc: 20159, msg: '附件总数不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MAX]:{define:maxNumber.article.imagesNumberPerArticle, error: {rc: baseJSErrorCode+82, msg: `文档图片总数不能超过${maxNumber.article.imagesNumberPerArticle}个`}, mongoError: {rc: 20154, msg: '附件总数不能为空'}},
    },
    imagesSizeInMb:{
        [otherRuleFiledName.CHINESE_NAME]: '文档图片总大小',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.NUMBER],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_SCALAR], //
        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_SCALAR]:false}, error: {rc: baseJSErrorCode+84, msg: '文档图片总大小不能为空'}, mongoError: {rc: 20159, msg: '附件总数不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MAX]:{define:maxNumber.article.imageSizeInMb, error: {rc: baseJSErrorCode+88, msg: `文档图片总大小不能超过${maxNumber.article.imageSizeInMb}Mb`}, mongoError: {rc: 20154, msg: '附件总数不能为空'}},
    },
}

module.exports={
    article
}