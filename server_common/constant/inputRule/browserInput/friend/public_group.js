/**
 * Created by wzhan039 on 2017-06-09.
 *  用户对应的inputRule（浏览器传递到server的数据）
 *  不包括server自动生成的数据，例如cDate等。因为默认程序自动生成的数据是正确的
 */

'use strict'
const inputDataRuleType=require('../../../enum/inputDataRuleType')
const serverDataType=inputDataRuleType.ServerDataType
const ruleFiledName=inputDataRuleType.RuleFiledName
const otherRuleFiledName=inputDataRuleType.OtherRuleFiledName
const applyRange=inputDataRuleType.ApplyRange
// const requireType=inputDataRuleType.RequireType

const regex=require('../../../regex/regex').regex
/*        field有enum才需要require        */
// const mongoEnum=require('../../../enum/mongo')
const enumValue=require('../../../../constant/genEnum//enumValue')

/*              获得 某些设置值            */
const maxNumber=require('../../../config/globalConfiguration').maxNumber

const public_group= {
    name: {
        [otherRuleFiledName.CHINESE_NAME]: '群名称',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR], //只能在create和update的recordInfo中出现

        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10330}, mongoError: {rc: 20330, msg: '群名称不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.MIN_LENGTH]: {define: 1, error: {rc: 10332}, mongoError: {rc: 20332, msg: '群名称至少1个字符'}},
        [ruleFiledName.MAX_LENGTH]: {define: 50, error: {rc: 10334}, mongoError: {rc: 20334, msg: '群名称的长度不能超过20个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },


    membersId: {
        [otherRuleFiledName.CHINESE_NAME]: '群成员',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_ARRAY],

        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_ARRAY]:false}, error: {rc: 10336}, mongoError: {rc: 20336, msg: '群成员不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.ARRAY_MIN_LENGTH]: {define: 1, error: {rc: 10338}, mongoError: {rc: 20338, msg: '群至少有一个成员'}},
        [ruleFiledName.ARRAY_MAX_LENGTH]: {define: maxNumber.friend.maxMemberNumberPerPublicGroup, error: {rc: 10340}, mongoError: {rc: 20340, msg: `群最多有${maxNumber.friend.maxMemberNumberPerPublicGroup}个成员`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10342}, mongoError: {rc: 20342, msg: '群成员必须是objectId'}} //server端使用
    },

    adminsId: {
        [otherRuleFiledName.CHINESE_NAME]: '群管理员',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_ARRAY],

        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_ARRAY]:false}, error: {rc: 10344}, mongoError: {rc: 20344, msg: '群管理员不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.ARRAY_MIN_LENGTH]: {define: 1, error: {rc: 10346}, mongoError: {rc: 20346, msg: '群管理员至少有一个成员'}},
        [ruleFiledName.ARRAY_MAX_LENGTH]: {define: maxNumber.friend.maxAdministratorPerPublicGroup, error: {rc: 10348}, mongoError: {rc: 20348, msg: `群最多有${maxNumber.friend.maxAdministratorPerPublicGroup}个群管理员`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10350}, mongoError: {rc: 20350, msg: '群管理员必须是objectId'}} //server端使用
    },
    joinInRule: {
        [otherRuleFiledName.CHINESE_NAME]: '新成员加入规则',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],

        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10352}, mongoError: {rc: 20352, msg: '新成员加入规则不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'enum':{define:Object.values(mongoEnum.PublicGroupJoinInRule.DB),error:{rc:10354},mongoError:{rc:20354,msg:'新成员加入规则不正确'}},//server端使用
        [ruleFiledName.ENUM]:{define:enumValue.PublicGroupJoinInRule,error:{rc:10354},mongoError:{rc:20354,msg:'新成员加入规则不正确'}},//server端使用
    },
    waitApproveId: {
        [otherRuleFiledName.CHINESE_NAME]: '等待批准加入',
        [otherRuleFiledName.DATA_TYPE]: [serverDataType.OBJECT_ID],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_ARRAY],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_ARRAY]:false,}, error: {rc: 10360}, mongoError: {rc: 20360, msg: '等待批准加入不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 1, error: {rc: 10002}, mongoError: {rc: 30002, msg: '朋友分组名至少1个字符'}},
        [ruleFiledName.ARRAY_MAX_LENGTH]: {define: maxNumber.friend.maxMemberNumberPerPublicGroup, error: {rc: 10361}, mongoError: {rc: 30361, msg: `等待批准加入的名单长度不能超过${maxNumber.friend.maxMemberNumberPerPublicGroup}`}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10362}, mongoError: {rc: 20362, msg: '等待批准加入必须是objectId'}} //server端使用
    },
}

/*const public_group= {
    name: {
         [otherRuleFiledName.CHINESE_NAME]: '群名称',
        [otherRuleFiledName.TYPE]: serverDataType.STRING,
        [ruleFiledName.REQUIRE]: {define: true, error: {rc: 10330}, mongoError: {rc: 20330, msg: '群名称不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'minLength': {define: 1, error: {rc: 10332}, mongoError: {rc: 20332, msg: '群名称至少1个字符'}},
        'maxLength': {define: 50, error: {rc: 10334}, mongoError: {rc: 20334, msg: '群名称的长度不能超过20个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },


    membersId: {
         [otherRuleFiledName.CHINESE_NAME]: '群成员',
        [otherRuleFiledName.TYPE]: [serverDataType.OBJECT_ID],
        [ruleFiledName.REQUIRE]: {define: false, error: {rc: 10336}, mongoError: {rc: 20336, msg: '群成员不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'arrayMinLength': {define: 1, error: {rc: 10338}, mongoError: {rc: 20338, msg: '群至少有一个成员'}},
        'arrayMaxLength': {define: maxNumber.friend.maxMemberNumberPerPublicGroup, error: {rc: 10340}, mongoError: {rc: 20340, msg: `群最多有${maxNumber.friend.maxMemberNumberPerPublicGroup}个成员`}},
        'format': {define: regex.objectId, error: {rc: 10342}, mongoError: {rc: 20342, msg: '群成员必须是objectId'}} //server端使用
    },

    adminsId: {
         [otherRuleFiledName.CHINESE_NAME]: '群管理员',
        [otherRuleFiledName.TYPE]: [serverDataType.OBJECT_ID],
        [ruleFiledName.REQUIRE]: {define: false, error: {rc: 10344}, mongoError: {rc: 20344, msg: '群管理员不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'arrayMinLength': {define: 1, error: {rc: 10346}, mongoError: {rc: 20346, msg: '群管理员至少有一个成员'}},
        'arrayMaxLength': {define: maxNumber.friend.maxAdministratorPerPublicGroup, error: {rc: 10348}, mongoError: {rc: 20348, msg: `群最多有${maxNumber.friend.maxAdministratorPerPublicGroup}个群管理员`}},
        'format': {define: regex.objectId, error: {rc: 10350}, mongoError: {rc: 20350, msg: '群管理员必须是objectId'}} //server端使用
    },
    joinInRule: {
         [otherRuleFiledName.CHINESE_NAME]: '新成员加入规则',
        [otherRuleFiledName.TYPE]: serverDataType.STRING,
        [ruleFiledName.REQUIRE]: {define: true, error: {rc: 10352}, mongoError: {rc: 20352, msg: '新成员加入规则不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'enum':{define:Object.values(mongoEnum.PublicGroupJoinInRule.DB),error:{rc:10354},mongoError:{rc:20354,msg:'新成员加入规则不正确'}},//server端使用
        'enum':{define:enumValue.PublicGroupJoinInRule,error:{rc:10354},mongoError:{rc:20354,msg:'新成员加入规则不正确'}},//server端使用
    },


}*/

module.exports={
    public_group
}