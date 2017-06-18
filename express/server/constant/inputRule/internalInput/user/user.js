/**
 * Created by wzhan039 on 2017-06-09.
 *  server自动生成的数据，例如cDate等，可能也需要验证，防止程序错误
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex

const user= {

    //转换过的password，最终要存入db
    password: {
        'chineseName': '密码',
        'type':serverDataType.STRING,
        'require': {define: true, error: {rc: 10000},mongoError:{rc:20000,msg:'密码不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        /*            'minLength':{define:6,error:{rc:10002},mongoError:{rc:20002,msg:'密码至少6个字符'}},
         'maxLength':{define:20,error:{rc:10004},mongoError:{rc:20004,msg:'密码的长度不能超过20个字符'}},*/
        'format':{define:regex.sha1Hash,error:{rc:10005},mongoError:{rc:20005,msg:'密码必须由40个字符组成'}} //加密密码只在server端使用
    },
}

module.exports={
    user,
}