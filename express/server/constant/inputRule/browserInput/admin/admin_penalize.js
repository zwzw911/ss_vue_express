/**
 * Created by wzhan039 on 2017-06-09.
 *  用户对应的inputRule（浏览器传递到server的数据）
 *  不包括server自动生成的数据，例如cDate等。因为默认程序自动生成的数据是正确的
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex

/*        field有enum才需要require        */
 const mongoEnum=require('../../../enum/mongo')

const admin_penalize= {


    punishedId: {
        'chineseName': '受罚人',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10070}, mongoError: {rc: 20070, msg: '受罚人不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 2, error: {rc: 10002}, mongoError: {rc: 20002, msg: '用户名至少2个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '用户名的长度不能超过20个字符'}},
        'format': {define: regex.objectId, error: {rc: 10072}, mongoError: {rc: 20072, msg: '受罚人格式不正确'}} //server端使用
    },

    //此处是处理用户输入password
    reason: {
        'chineseName': '受罚原因',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10074}, mongoError: {rc: 20074, msg: '受罚原因不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'minLength': {define: 15, error: {rc: 10076}, mongoError: {rc: 20076, msg: '受罚原因至少15个字符'}},
        'maxLength': {define: 1000, error: {rc: 10078}, mongoError: {rc: 20078, msg: '受罚原因的字数不能超过1000个字符'}},
        // 'format': {define: regex.password, error: {rc: 10012}, mongoError: {rc: 20012, msg: '密码必须由6-20个字符组成'}} //server端使用
    },

    //user type
    penalizeType: {
        'chineseName': '受罚类型',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10080}, mongoError: {rc: 20080, msg: '受罚类型不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'enum':{define:Object.values(mongoEnum.PenalizeType.DB),error:{rc:10082},mongoError:{rc:20082,msg:'受罚类型不正确'}},//server端使用
    },

    //user priority
    duration: {
        'chineseName': '受罚时长',
        'type':serverDataType.INT,
        'require': {define: true, error: {rc: 10084}, mongoError: {rc: 20084, msg: '受罚时长不能为空'}},//用户权限初始可以为空，以后ROOT用户进行分配
        'min': {define: 1, error: {rc: 10086}, mongoError: {rc: 20086, msg: '受罚时长至少1天'}},
        'max': {define: 7, error: {rc: 10088}, mongoError: {rc: 20088, msg: '受罚时长最长7天'}},
    },
}

module.exports={
    admin_penalize
 }