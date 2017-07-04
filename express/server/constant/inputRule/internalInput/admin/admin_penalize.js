/**
 * Created by wzhan039 on 2017-06-09.
 *  用户对应的inputRule（浏览器传递到server的数据）
 *  不包括server自动生成的数据，例如cDate等。因为默认程序自动生成的数据是正确的
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex

/*        field有enum才需要require        */
 // const mongoEnum=require('../../../enum/mongo')

const admin_penalize= {
    creatorId: {
        'chineseName': '处罚人',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10090}, mongoError: {rc: 20090, msg: '处罚人不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 2, error: {rc: 10002}, mongoError: {rc: 20002, msg: '用户名至少2个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '用户名的长度不能超过20个字符'}},
        'format': {define: regex.objectId, error: {rc: 10092}, mongoError: {rc: 20092, msg: '处罚人格式不正确'}} //server端使用
    },


}

module.exports={
    admin_penalize,
}