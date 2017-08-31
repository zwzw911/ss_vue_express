/**
 * Created by ada on 2017-06-09.
 *  用户对应的inputRule（浏览器传递到server的数据）
 *  不包括server自动生成的数据，例如cDate等。因为默认程序自动生成的数据是正确的
 */

'use strict'

const serverDataType=require('../../../enum/inputDataRuleType').ServerDataType
const regex=require('../../../regex/regex').regex

/*        field有enum才需要require        */
// const mongoEnum=require('../../../enum/mongo')
const enumValue=require('../../../../model/mongo/structure/enumValue')

const resource_profile= {
    name: {
        'chineseName': '资源配置名称',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 11100}, mongoError: {rc: 21100, msg: '资源配置名称不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'minLength': {define: 2, error: {rc: 11102}, mongoError: {rc: 21102, msg: '资源配置名称至少2个字符'}},
        'maxLength': {define: 50, error: {rc: 11104}, mongoError: {rc: 21104, msg: '资源配置名称的长度不能超过50个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },
    range: {
        'chineseName': '资源配置范围',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 11106}, mongoError: {rc: 21106, msg: '资源配置范围不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'enum':{define:enumValue.ResourceProfileRange,error:{rc:11107},mongoError:{rc:21107,msg:'资源配置范围的类型不正确'}},//server端使用
    },
    type: {
        'chineseName': '资源配置类型',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 11108}, mongoError: {rc: 21108, msg: '资源配置类型不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'enum':{define:enumValue.ResourceProfileType,error:{rc:11109},mongoError:{rc:21109,msg:'资源配置类型的值类型不正确'}},//server端使用
    },
    maxFileNum: {
        'chineseName': '最大文件数量',
        'type': serverDataType.NUMBER,
        'require': {define: true, error: {rc: 11110}, mongoError: {rc: 21110, msg: '最大文件数量不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'max': {define: 1000*1000, error: {rc: 10071}, mongoError: {rc: 20071, msg: '容量最多1000M'}},
        // 'minLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 30002, msg: '分类名至少1个字符'}},
        // 'maxLength': {define: 50, error: {rc: 10004}, mongoError: {rc: 30004, msg: '分类名的长度不能超过50个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },
    totalFileSizeInMb: {
        'chineseName': '最大存储空间',
        'type': serverDataType.NUMBER,
        'require': {define: true, error: {rc: 11112}, mongoError: {rc: 21112, msg: '最大存储空间不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'min': {define: 1, error: {rc: 10314}, mongoError: {rc: 20314, msg: '处罚时间最少1天'}},
        // 'max': {define: 1000*1000, error: {rc: 10071}, mongoError: {rc: 20071, msg: '容量最多1000M'}},
        // 'minLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 30002, msg: '分类名至少1个字符'}},
        // 'maxLength': {define: 50, error: {rc: 10004}, mongoError: {rc: 30004, msg: '分类名的长度不能超过50个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },

}

module.exports={
    resource_profile
}