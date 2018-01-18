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

const article= {

    authorId: {
        [otherRuleFiledName.CHINESE_NAME]: '作者',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10126}, mongoError: {rc: 20126, msg: '作者不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10128}, mongoError: {rc: 20128, msg: '作者必须是objectId'}} //server端使用
    },

    //虽然mongodb中定义的是array+objectId，但是实际处理时，从client传递的只是objectId，所以定义的时候，只检查objectId
    articleImagesId: {
        [otherRuleFiledName.CHINESE_NAME]: '文档图片',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_SCALAR], //
        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10142}, mongoError: {rc: 20142, msg: '文档图片不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'arrayMinLength': {define: 0, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        'arrayMaxLength': {define: maxNumber.article.imagesNumberPerArticle, error: {rc: 10144}, mongoError: {rc: 20144, msg: `最多插入${maxNumber.article.imagesNumberPerArticle}个图片`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10146}, mongoError: {rc: 20146, msg: '文档图片必须是objectId'}} //server端使用
    },
    //虽然mongodb中定义的是array+objectId，但是实际处理时，从client传递的只是objectId，所以定义的时候，只检查objectId
    articleAttachmentsId: {
        [otherRuleFiledName.CHINESE_NAME]: '文档附件',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_SCALAR], //
        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10148}, mongoError: {rc: 20148, msg: '文档附件不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'arrayMinLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个标签'}},
        'arrayMaxLength': {define: maxNumber.article.attachmentNumberPerArticle, error: {rc: 10150}, mongoError: {rc: 20150, msg: `最多添加${maxNumber.article.attachmentNumberPerArticle}个附件`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10152}, mongoError: {rc: 20152, msg: '文档附件片必须是objectId'}} //server端使用
    },
    //虽然mongodb中定义的是array+objectId，但是实际处理时，从client传递的只是objectId，所以定义的时候，只检查objectId
    articleCommentsId: {
        [otherRuleFiledName.CHINESE_NAME]: '留言',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_SCALAR], //
        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10154}, mongoError: {rc: 20154, msg: '文档留言不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        'arrayMaxLength': {define: maxNumber.article.commentNumberPerArticle, error: {rc: 10156}, mongoError: {rc: 20156, msg: `最多添加${maxNumber.article.commentNumberPerArticle}个留言`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10158}, mongoError: {rc: 20158, msg: '文档留言片必须是objectId'}} //server端使用
    },
}

module.exports={
    article
}