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

const store_path= {
     usedSize: {
        'chineseName': '已使用容量',
        'type': serverDataType.NUMBER,
        'require': {define: true, error: {rc: 10075}, mongoError: {rc: 20075, msg: '已使用容量不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'min': {define: 1, error: {rc: 10314}, mongoError: {rc: 20314, msg: '处罚时间最少1天'}},
        // 'max': {define: 30, error: {rc: 10316}, mongoError: {rc: 20316, msg: '处罚时间最多30天'}},
        // 'minLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 30002, msg: '分类名至少1个字符'}},
        // 'maxLength': {define: 50, error: {rc: 10004}, mongoError: {rc: 30004, msg: '分类名的长度不能超过50个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },
    status: {
        'chineseName': '存储路径状态',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10076}, mongoError: {rc: 20076, msg: '存储路径状态不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'enum':{define:enumValue.StorePathStatus,error:{rc:10077},mongoError:{rc:20077,msg:'存储路径状态不正确'}},//server端使用
        // 'min': {define: 1, error: {rc: 10314}, mongoError: {rc: 20314, msg: '处罚时间最少1天'}},
        // 'max': {define: 30, error: {rc: 10316}, mongoError: {rc: 20316, msg: '处罚时间最多30天'}},
        // 'minLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 30002, msg: '分类名至少1个字符'}},
        // 'maxLength': {define: 50, error: {rc: 10004}, mongoError: {rc: 30004, msg: '分类名的长度不能超过50个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },
}

module.exports={
    store_path
}