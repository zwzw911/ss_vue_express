/**
 * Created by wzhan039 on 2080-06-09.
 *  用户对应的inputRule（浏览器传递到server的数据）
 *  不包括server自动生成的数据，例如cDate等。因为默认程序自动生成的数据是正确的
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex


/*/!*        field有enum才需要require        *!/
const mongoEnum=require('../../../enum/mongo')*/
const maxNumber=require('../../../config/globalConfiguration').maxNumber

const recommend= {
    articleId: {
        'chineseName': '文档',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10800}, mongoError: {rc: 20800, msg: '文档不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        'format': {define: regex.objectId, error: {rc: 10802}, mongoError: {rc: 20802, msg: '文档必须是objectId'}} //server端使用
    },
    toUserId:{
        'chineseName': '被荐人',
        'type': [serverDataType.OBJECT_ID],
        'require': {define: false, error: {rc: 10803}, mongoError: {rc: 20803, msg: '被荐人不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'arrayMinLength': {define: 1, error: {rc: 10804}, mongoError: {rc: 20804, msg: '至少推荐给1个用户'}},
        'arrayMaxLength': {define: maxNumber.article.tagNumberPerArticle, error: {rc: 10805}, mongoError: {rc: 20805, msg: `最多推荐给${maxNumber.article.tagNumberPerArticle}个用户`}},
        'format': {define: regex.objectId, error: {rc: 10806}, mongoError: {rc: 20806, msg: '被荐人必须是objectId'}} //server端使用
    },
    toGroupId:{
        'chineseName': '被荐朋友组',
        'type': [serverDataType.OBJECT_ID],
        'require': {define: false, error: {rc: 10807}, mongoError: {rc: 20807, msg: '被荐朋友组不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'arrayMinLength': {define: 1, error: {rc: 10808}, mongoError: {rc: 20808, msg: '至少推荐给1个朋友组'}},
        'arrayMaxLength': {define: maxNumber.article.tagNumberPerArticle, error: {rc: 10809}, mongoError: {rc: 20809, msg: `最多推荐给${maxNumber.article.tagNumberPerArticle}个朋友组`}},
        'format': {define: regex.objectId, error: {rc: 10810}, mongoError: {rc: 20810, msg: '被荐朋友组必须是objectId'}} //server端使用
    },
    toPublicGroupId:{
        'chineseName': '被荐群',
        'type': [serverDataType.OBJECT_ID],
        'require': {define: false, error: {rc: 10811}, mongoError: {rc: 20811, msg: '被荐群不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'arrayMinLength': {define: 1, error: {rc: 10812}, mongoError: {rc: 20812, msg: '至少推荐给1个群'}},
        'arrayMaxLength': {define: maxNumber.article.tagNumberPerArticle, error: {rc: 10813}, mongoError: {rc: 20813, msg: `最多推荐给${maxNumber.article.tagNumberPerArticle}个群`}},
        'format': {define: regex.objectId, error: {rc: 10814}, mongoError: {rc: 20814, msg: '被荐群必须是objectId'}} //server端使用
    },
}

module.exports={
    recommend
}