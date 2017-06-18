/**
 * Created by wzhan039 on 2017-06-14.
* search中的字段：根据业务要求，从inputRule（client/server中选取
 * 而不是直接全部包括，因为有些字段是不适合查找的，例如用户的密码等
 * 只有client侧，无server侧
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../regex/regex').regex

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
    /*salt: {
        'chineseName': '盐',
        'type': serverDataType.string,
        //require=false：client无需此字段，server通过函数（必须有salt来sha密码）保证由此字段
        'require': {define: false, error: {rc: 10000}, mongoError: {rc: 20000, msg: '盐不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'minLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '盐至少1个字符'}},
        'maxLength': {define: 10, error: {rc: 10004}, mongoError: {rc: 20004, msg: '盐的长度不能超过10个字符'}},
        'format': {define: regex.salt, error: {rc: 10005}, mongoError: {rc: 20005, msg: '盐必须由1-10个字符组成'}} //server端使用
    },
    //password会经过转换（所以不存入db）
    password: {
        'chineseName': '密码',
        'type': serverDataType.string,
        'require': {define: true, error: {rc: 10000}, mongoError: {rc: 20000, msg: '密码不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        'format': {define: regex.password, error: {rc: 10005}, mongoError: {rc: 20005, msg: '密码必须由6-20个字符组成'}} //server端使用
    },*/
}