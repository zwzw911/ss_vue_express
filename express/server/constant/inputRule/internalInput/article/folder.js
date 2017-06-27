/**
 * Created by wzhan039 on 2017-06-16.
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex

const folder= {
    authorId: {
        'chineseName': '创建人',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10202}, mongoError: {rc: 20202, msg: '创建人名不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 2, error: {rc: 10002}, mongoError: {rc: 20002, msg: '创建人户名至少2个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '用户名的长度不能超过20个字符'}},
        'format': {define: regex.objectId, error: {rc: 10204}, mongoError: {rc: 20204, msg: '创建人必须是objectId'}} //server端使用
    },
}

module.exports={
    folder
}