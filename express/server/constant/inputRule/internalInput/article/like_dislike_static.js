/**
 * Created by wzhan039 on 2017-06-09.
 *  用户对应的inputRule（浏览器传递到server的数据）
 *  不包括server自动生成的数据，例如cDate等。因为默认程序自动生成的数据是正确的
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex

const like_dislike_static= {
    //
    articleId: {
        'chineseName': '文档',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10290}, mongoError: {rc: 20290, msg: '文档不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        'format': {define: regex.objectId, error: {rc: 10292}, mongoError: {rc: 20292, msg: '文档必须是objectId'}} //server端使用
    },
/*    like: {
     'chineseName': '喜欢',
     'type': serverDataType.BOOLEAN,
     'require': {define: true, error: {rc: 10218}, mongoError: {rc: 20218, msg: '喜欢不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
     // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
     // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
     // 'format': {define: regex.OBJECT_ID, error: {rc: 10005}, mongoError: {rc: 20005, msg: '提交者必须是objectId'}} //server端使用
     },*/
}

module.exports={
    like_dislike_static
}