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

const admin_user= {
    name: {
        'chineseName': '用户名',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10000}, mongoError: {rc: 20000, msg: '用户名不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'minLength': {define: 2, error: {rc: 10002}, mongoError: {rc: 20002, msg: '用户名至少2个字符'}},
        'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '用户名的长度不能超过20个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },


    //此处是处理用户输入password
    password: {
        'chineseName': '密码',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10006}, mongoError: {rc: 20006, msg: '密码不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'minLength': {define: 6, error: {rc: 10008}, mongoError: {rc: 20008, msg: '密码至少6个字符'}},
        'maxLength': {define: 20, error: {rc: 10010}, mongoError: {rc: 20010, msg: '密码的长度不能超过20个字符'}},
        'format': {define: regex.password, error: {rc: 10012}, mongoError: {rc: 20012, msg: '密码必须由6-20个字符组成'}} //server端使用
    },

    //user type
    userType: {
        'chineseName': '管理员类型',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10014}, mongoError: {rc: 20014, msg: '管理员类型不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'enum':{define:Object.values(mongoEnum.AdminUserType.DB),error:{rc:10016},mongoError:{rc:20016,msg:'管理员类型不正确'}},//server端使用
    },

    //user priority
    userPriority: {
        'chineseName': '用户权限',
        'type': [serverDataType.STRING],
        'require': {define: false, error: {rc: 10018}, mongoError: {rc: 20018, msg: '用户权限不能为空'}},//用户权限初始可以为空，以后ROOT用户进行分配
        'enum':{define:Object.values(mongoEnum.AdminPriorityType.DB),error:{rc:10020},mongoError:{rc:20020,msg:'用户权限不正确'}},//server端使用
         // 'arrayMinLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '至少设置1个权限'}},
        'arrayMaxLength': {define: Object.values(mongoEnum.AdminPriorityType.DB).length, error: {rc: 10021}, mongoError: {rc: 20021, msg: `最多拥有${Object.values(mongoEnum.AdminPriorityType.DB).length}个权限`}},
    },
}

module.exports={
    admin_user
}