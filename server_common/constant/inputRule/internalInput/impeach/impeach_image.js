/**
 * Created by wzhan039 on 2017-06-16.
 *  用户对应的inputRule（浏览器传递到server的数据）
 *  不包括server自动生成的数据，例如cDate等。因为默认程序自动生成的数据是正确的
 */

'use strict'

const inputDataRuleType=require('../../../enum/inputDataRuleType')
const serverDataType=inputDataRuleType.ServerDataType
const ruleFiledName=inputDataRuleType.RuleFiledName
const otherRuleFiledName=inputDataRuleType.OtherRuleFiledName
const applyRange=inputDataRuleType.ApplyRange

const regex=require('../../../regex/regex').regex


/*              upload file define          */
const uploadFileDefine=require('../../../config/globalConfiguration').uploadFileDefine
const e_uploadFileDefinitionFieldName=require(`../../../../constant/enum/nodeEnum`).UploadFileDefinitionFieldName

const impeach_image= {
    name: {
        [otherRuleFiledName.CHINESE_NAME]: '举报图片名称',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10610, msg: '举报图片名称不能为空'}, mongoError: {rc: 20610, msg: '举报图片名称不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 4, error: {rc: 10612}, mongoError: {rc: 20612, msg: '举报图片名称至少4个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 255, error: {rc: 10614}, mongoError: {rc: 20614, msg: '举报图片名的长度不能超过255个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.imageName, error: {rc: 10616, msg: '举报图片名必须由4-255个字符组成'}, mongoError: {rc: 20616, msg: '举报图片名必须由4-255个字符组成'}} //server端使用
    },
    hashName: {
        [otherRuleFiledName.CHINESE_NAME]: '举报图片名称',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10618, msg: '举报图片名称不能为空'}, mongoError: {rc: 20618, msg: '举报图片名称不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 4, error: {rc: 10002}, mongoError: {rc: 30002, msg: '文档图片名称至少4个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 255, error: {rc: 10004}, mongoError: {rc: 30004, msg: '文档名的长度不能超过255个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.md5Image, error: {rc: 10620, msg: 'hash名必须由35~36个字符组成'}, mongoError: {rc: 20620, msg: 'hash名必须由35~36个字符组成'}} //server端使用
    },
    pathId: {
        [otherRuleFiledName.CHINESE_NAME]: '存储路径',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10622, msg: '存储路径不能为空'}, mongoError: {rc: 20622, msg: '存储路径不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10624, msg: '存储路径必须是objectId'}, mongoError: {rc: 20624, msg: '存储路径必须是objectId'}} //server端使用
    },
    // in byte
    sizeInMb:{
        [otherRuleFiledName.CHINESE_NAME]: '图片大小',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.INT,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10626, msg: '图片大小不能为空'}, mongoError: {rc: 20626, msg: '图片大小不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // 'min': {define: 1, error: {rc: 10002}, mongoError: {rc: 20002, msg: '图片大小至少6个字符'}},
        'max': {define: uploadFileDefine.impeach.image[e_uploadFileDefinitionFieldName.MAX_SIZE_IN_MB], error: {rc: 10628, msg: `图片大小不能超过${uploadFileDefine.impeach.image.maxSizeInMB}MB`}, mongoError: {rc: 20628, msg: `图片大小不能超过${uploadFileDefine.impeach.image.maxSizeInMB}MB`}},
        // [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10005}, mongoError: {rc: 20005, msg: '存储路径必须是objectId'}} //server端使用
    },
    authorId: {
        [otherRuleFiledName.CHINESE_NAME]: '图片上传者',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10630, msg: '图片上传者不能为空'}, mongoError: {rc: 20630, msg: '图片上传者不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10002}, mongoError: {rc: 20002, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10004}, mongoError: {rc: 20004, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10632, msg: '图片上传者必须是objectId'}, mongoError: {rc: 20632, msg: '图片上传者必须是objectId'}} //server端使用
    },



}

module.exports={
    impeach_image
}