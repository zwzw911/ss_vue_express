/**
 * Created by wzhan039 on 2017-06-09.
 *  用户对应的inputRule（浏览器传递到server的数据）
 *  不包括server自动生成的数据，例如cDate等。因为默认程序自动生成的数据是正确的
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex


/*        field有enum才需要require        */
const mongoEnum=require('../../../enum/mongoStore')

const public_group= {
    name: {
        'chineseName': '群名称',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10000}, mongoError: {rc: 30000, msg: '群名称不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'minLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 30002, msg: '群名称至少1个字符'}},
        'maxLength': {define: 50, error: {rc: 10004}, mongoError: {rc: 30004, msg: '群名称的长度不能超过20个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },


    membersId: {
        'chineseName': '群成员',
        'type': [serverDataType.OBJECT_ID],
        'require': {define: false, error: {rc: 10000}, mongoError: {rc: 20000, msg: '群成员不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        'format': {define: regex.objectId, error: {rc: 10005}, mongoError: {rc: 20005, msg: '群成员必须是objectId'}} //server端使用
    },

    adminsId: {
        'chineseName': '群管理员',
        'type': [serverDataType.OBJECT_ID],
        'require': {define: false, error: {rc: 10000}, mongoError: {rc: 20000, msg: '群管理员不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // 'maxLength': {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        'format': {define: regex.objectId, error: {rc: 10005}, mongoError: {rc: 20005, msg: '群管理员必须是objectId'}} //server端使用
    },
    joinInRule: {
        'chineseName': '新成员加入规则',
        'type': serverDataType.ENUM,
        'require': {define: true, error: {rc: 10000}, mongoError: {rc: 20000, msg: '新成员加入规则不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'enum':{define:Object.values(mongoEnum.PublicGroupJoinInRule.DB),error:{rc:10028},mongoError:{rc:20028,msg:'新成员加入规则不正确'}},//server端使用
    },


}

module.exports={
    public_group
}