/**
 * Created by wzhan039 on 2017-06-09.
 *  server自动生成的数据，例如cDate等，可能也需要验证，防止程序错误
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex
const enumValue=require('../../../../constant/genEnum/enumValue')

const admin_user= {

    //转换过的password，最终要存入db
    password: {
        'chineseName': '密码',
        'type':serverDataType.STRING,
        'require': {define: true, error: {rc: 10022},mongoError:{rc:20022,msg:'密码不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        /*            'minLength':{define:6,error:{rc:10002},mongoError:{rc:20002,msg:'密码至少6个字符'}},
         'maxLength':{define:20,error:{rc:10004},mongoError:{rc:20004,msg:'密码的长度不能超过20个字符'}},*/
        'format':{define:regex.sha512,error:{rc:10024},mongoError:{rc:20024,msg:'密码必须由128个字符组成'}} //加密密码只在server端使用
    },
    /*              维护事务一致性             */
    docStatus:{
        'chineseName': 'document状态',
        'type':serverDataType.STRING,
        'require': {define: true, error: {rc: 10025},mongoError:{rc:20025,msg:'document状态不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        /*            'minLength':{define:6,error:{rc:10002},mongoError:{rc:20002,msg:'密码至少6个字符'}},
         'maxLength':{define:20,error:{rc:10004},mongoError:{rc:20004,msg:'密码的长度不能超过20个字符'}},*/
        'enum':{define:enumValue.DocStatus,error:{rc:10026},mongoError:{rc:20026,msg:'document状态不是预定义的值'}} //加密密码采用sha256，减少CPU负荷
    },
    lastAccountUpdateDate:{
        'chineseName': '账号更改日期',
        'type':serverDataType.DATE,
        'require': {define: true, error: {rc: 10027},mongoError:{rc:20027,msg:'账号更改日期不能为空'}},//注册的时候，就必须把account插入

    },

    lastSignInDate:{
        'chineseName': '上次登录时间',
        'type':serverDataType.DATE,
        'require': {define: true, error: {rc: 10028},mongoError:{rc:20028,msg:'上次登录时间不能为空'}},//注册的时候，就必须把account插入
    },
}

module.exports={
    admin_user,
}