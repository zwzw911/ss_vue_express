/**
 * Created by wzhan039 on 2017-06-16.
 */
'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex

const tag= {
    name: {
        'chineseName': '标签名称',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10220}, mongoError: {rc: 20220, msg: '标签名称不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'minLength': {define: 2, error: {rc: 10222}, mongoError: {rc: 20222, msg: '标签名称至少2个字符'}},
        'maxLength': {define: 20, error: {rc: 10224}, mongoError: {rc: 20224, msg: '标签名称的长度不能超过20个字符'}},
         'format': {define: regex.tagName, error: {rc: 10226}, mongoError: {rc: 20226, msg: '目录名必须由2-20个字符组成'}} //server端使用
    },
}

module.exports={
    tag
}