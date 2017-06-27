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

const member_penalize= {


    publicGroupId: {
        'chineseName': '群',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10300}, mongoError: {rc: 20300, msg: '群不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'format': {define: regex.objectId, error: {rc: 10302}, mongoError: {rc: 20302, msg: '群必须是objectId'}} //server端使用
    },

    membersIdId: {
        'chineseName': '成员',
        'type': serverDataType.OBJECT_ID,
        'require': {define: true, error: {rc: 10304}, mongoError: {rc: 20304, msg: '成员不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'format': {define: regex.objectId, error: {rc: 10306}, mongoError: {rc: 20306, msg: '成员必须是objectId'}} //server端使用
    },

    penalizeType: {
        'chineseName': '处罚类型',
        'type': serverDataType.ENUM,
        'require': {define: true, error: {rc: 10308}, mongoError: {rc: 20308, msg: '处罚类型不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'enum':{define:Object.values(mongoEnum.PenalizeType.DB),error:{rc:10310},mongoError:{rc:20310,msg:'未知处罚类型'}},//server端使用
    },

    duration: {
        'chineseName': '处罚时间',
        'type': serverDataType.INT,
        'require': {define: true, error: {rc: 10312}, mongoError: {rc: 20312, msg: '处罚时间不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'min': {define: 1, error: {rc: 10314}, mongoError: {rc: 20314, msg: '处罚时间最少1天'}},
        'max': {define: 30, error: {rc: 10316}, mongoError: {rc: 20316, msg: '处罚时间最多30天'}},
        // 'format': {define: regex.folderFileName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '文档名必须由1-255个字符组成'}} //server端使用
},





}

module.exports={
    member_penalize,
}