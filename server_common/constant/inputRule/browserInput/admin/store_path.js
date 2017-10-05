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
const enumValue=require('../../../../constant/genEnum//enumValue')

const store_path= {
    name: {
        'chineseName': '存储路径名称',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10060}, mongoError: {rc: 20060, msg: '存储路径名称不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'minLength': {define: 2, error: {rc: 10062}, mongoError: {rc: 20062, msg: '存储路径名称至少1个字符'}},
        'maxLength': {define: 50, error: {rc: 10064}, mongoError: {rc: 20064, msg: '存储路径名称的长度不能超过50个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },
    path: {
        'chineseName': '存储路径',
        'type': serverDataType.FOLDER,
        'require': {define: true, error: {rc: 10066}, mongoError: {rc: 20066, msg: '存储路径不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'minLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 30002, msg: '分类名至少1个字符'}},
        // 'maxLength': {define: 50, error: {rc: 10004}, mongoError: {rc: 30004, msg: '分类名的长度不能超过50个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },
    usage: {
        'chineseName': '用途',
        'type': serverDataType.STRING,
        'require': {define: true, error: {rc: 10068}, mongoError: {rc: 20068, msg: '存储路径用途不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'enum':{define:enumValue.StorePathUsage,error:{rc:10069},mongoError:{rc:20069,msg:'储路径用途的类型不正确'}},//server端使用
        // 'minLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 30002, msg: '分类名至少1个字符'}},
        // 'maxLength': {define: 50, error: {rc: 10004}, mongoError: {rc: 30004, msg: '分类名的长度不能超过50个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },
    sizeInKb: {
        'chineseName': '容量',
        'type': serverDataType.NUMBER,
        'require': {define: true, error: {rc: 10070}, mongoError: {rc: 20070, msg: '容量不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'min': {define: 1, error: {rc: 10314}, mongoError: {rc: 20314, msg: '处罚时间最少1天'}},
        'max': {define: 1000*1000, error: {rc: 10071}, mongoError: {rc: 20071, msg: '容量最多1000M'}},
        // 'minLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 30002, msg: '分类名至少1个字符'}},
        // 'maxLength': {define: 50, error: {rc: 10004}, mongoError: {rc: 30004, msg: '分类名的长度不能超过50个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },
    lowThreshold: {
        'chineseName': '容量下限值',
        'type': serverDataType.NUMBER,
        'require': {define: true, error: {rc: 10072}, mongoError: {rc: 20072, msg: '容量下限值不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'min': {define: 50, error: {rc: 10073}, mongoError: {rc: 20073, msg: '容量下限值至少50%'}},
        'max': {define: 80, error: {rc: 10074}, mongoError: {rc: 20074, msg: '容量门限报警值最多95%'}},
        // 'minLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 30002, msg: '分类名至少1个字符'}},
        // 'maxLength': {define: 50, error: {rc: 10004}, mongoError: {rc: 30004, msg: '分类名的长度不能超过50个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },
    highThreshold: {
        'chineseName': '容量上限值',
        'type': serverDataType.NUMBER,
        'require': {define: true, error: {rc: 10075}, mongoError: {rc: 20075, msg: '容量上限值不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        'min': {define: 60, error: {rc: 10076}, mongoError: {rc: 20076, msg: '容量上限值至少60%'}},
        'max': {define: 95, error: {rc: 10077}, mongoError: {rc: 20077, msg: '容量上限值最多95%'}},
        // 'minLength': {define: 1, error: {rc: 10002}, mongoError: {rc: 30002, msg: '分类名至少1个字符'}},
        // 'maxLength': {define: 50, error: {rc: 10004}, mongoError: {rc: 30004, msg: '分类名的长度不能超过50个字符'}},
        // 'format': {define: regex.folderName, error: {rc: 10005}, mongoError: {rc: 30005, msg: '目录名必须由12-255个字符组成'}} //server端使用
    },
}

module.exports={
    store_path
}