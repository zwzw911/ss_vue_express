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
const enumValue=require('../../../../model/mongo/structure/enumValue')

/*              获得 某些设置值            */
const maxNumber=require('../../../config/globalConfiguration').maxNumber

const public_group= {
    name: {
        'chineseName': '群名称',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10330}, mongoError: {rc: 20330, msg: '群名称不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'minLength': {define: 1, error: {rc: 10332}, mongoError: {rc: 20332, msg: '群名称至少1个字符'}},
        'maxLength': {define: 50, error: {rc: 10334}, mongoError: {rc: 20334, msg: '群名称的长度不能超过20个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },


    memberId: {
        'chineseName': '群成员',
        'type': [serverDataType.OBJECT_ID],
        'require': {define: false, error: {rc: 10336}, mongoError: {rc: 20336, msg: '群成员不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'arrayMinLength': {define: 1, error: {rc: 10338}, mongoError: {rc: 20338, msg: '群至少有一个成员'}},
        'arrayMaxLength': {define: maxNumber.friend.maxMemberNumberPerPublicGroup, error: {rc: 10340}, mongoError: {rc: 20340, msg: `群最多有${maxNumber.friend.maxMemberNumberPerPublicGroup}个成员`}},
        'format': {define: regex.objectId, error: {rc: 10342}, mongoError: {rc: 20342, msg: '群成员必须是objectId'}} //server端使用
    },

    adminId: {
        'chineseName': '群管理员',
        'type': [serverDataType.OBJECT_ID],
        'require': {define: true, error: {rc: 10344}, mongoError: {rc: 20344, msg: '群管理员不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'arrayMinLength': {define: 1, error: {rc: 10346}, mongoError: {rc: 20346, msg: '群管理员至少有一个成员'}},
        'arrayMaxLength': {define: maxNumber.friend.maxAdministratorPerPublicGroup, error: {rc: 10348}, mongoError: {rc: 20348, msg: `群最多有${maxNumber.friend.maxAdministratorPerPublicGroup}个群管理员`}},
        'format': {define: regex.objectId, error: {rc: 10350}, mongoError: {rc: 20350, msg: '群管理员必须是objectId'}} //server端使用
    },
    joinInRule: {
        'chineseName': '新成员加入规则',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10352}, mongoError: {rc: 20352, msg: '新成员加入规则不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'enum':{define:Object.values(mongoEnum.PublicGroupJoinInRule.DB),error:{rc:10354},mongoError:{rc:20354,msg:'新成员加入规则不正确'}},//server端使用
        'enum':{define:enumValue.PublicGroupJoinInRule,error:{rc:10354},mongoError:{rc:20354,msg:'新成员加入规则不正确'}},//server端使用
    },


}

module.exports={
    public_group
}