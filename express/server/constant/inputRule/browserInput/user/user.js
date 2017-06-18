/**
 * Created by wzhan039 on 2017-06-09.
 *  用户对应的inputRule（浏览器传递到server的数据）
 *  不包括server自动生成的数据，例如cDate等。因为默认程序自动生成的数据是正确的
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex

const user= {
    name: {
        'chineseName': '用户名',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10000}, mongoError: {rc: 30000, msg: '用户名不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'minLength': {define: 2, error: {rc: 10002}, mongoError: {rc: 30002, msg: '用户名至少2个字符'}},
        'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 30004, msg: '用户名的长度不能超过20个字符'}},
        'format': {define: regex.userName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '用户名必须由2-10个字符组成'}} //server端使用
    },
    account: {
        'chineseName': '账号',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10000}, mongoError: {rc: 20000, msg: '用户名不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'minLength': {define: 2, error: {rc: 10002}, mongoError: {rc: 20002, msg: '用户名至少2个字符'}},
        'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '用户名的长度不能超过20个字符'}},
        'format': {define: regex.userName, error: {rc: 10005}, mongoError: {rc: 20005, msg: '用户名必须由2-10个字符组成'}} //server端使用
    },

    //此处是处理用户输入password
    password: {
        'chineseName': '密码',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10000}, mongoError: {rc: 20000, msg: '密码不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        'format': {define: regex.password, error: {rc: 10005}, mongoError: {rc: 20005, msg: '密码必须由6-20个字符组成'}} //server端使用
    },
}

module.exports={
    user
}