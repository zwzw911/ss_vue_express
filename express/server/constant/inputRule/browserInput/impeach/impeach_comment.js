/**
 * Created by wzhan039 on 2017-06-09.
 *  用户对应的inputRule（浏览器传递到server的数据）
 *  不包括server自动生成的数据，例如cDate等。因为默认程序自动生成的数据是正确的
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex


/*/!*        field有enum才需要require        *!/
const mongoEnum=require('../../../enum/mongo')*/

const impeach_comment= {
    impeachId: {
        'chineseName': '举报',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10560}, mongoError: {rc: 20560, msg: '举报不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        'format': {define: regex.objectId, error: {rc: 10562}, mongoError: {rc: 20562, msg: '举报必须是objectId'}} //server端使用
    },
    content: {
        'chineseName': '评论内容',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10564}, mongoError: {rc: 20564, msg: '评论内容不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'minLength': {define: 15, error: {rc: 10566}, mongoError: {rc: 20566, msg: '评论内容至少15个字符'}},
        'maxLength': {define: 140, error: {rc: 10568}, mongoError: {rc: 20568, msg: '评论内容不能超过140个字符'}},
        // 'format': {define: regex.folderFileName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '评论内容必须由1-255个字符组成'}} //server端使用
    },


}

module.exports={
    impeach_comment
}