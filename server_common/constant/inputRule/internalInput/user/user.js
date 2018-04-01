/**
 * Created by wzhan039 on 2017-06-09.
 *  server自动生成的数据，例如cDate等，可能也需要验证，防止程序错误
 */

'use strict'

const inputDataRuleType=require('../../../enum/inputDataRuleType')
const serverDataType=inputDataRuleType.ServerDataType
const ruleFiledName=inputDataRuleType.RuleFiledName
const otherRuleFiledName=inputDataRuleType.OtherRuleFiledName
const applyRange=inputDataRuleType.ApplyRange

const regex=require('../../../regex/regex').regex
const enumValue=require('../../../../constant/genEnum//enumValue')
/*              获得 某些设置值            */
const maxNumber=require('../../../config/globalConfiguration').maxNumber

const searchRange=inputDataRuleType.SearchRange

const user= {

    //根据不同url，自动决定
    userType:{
        [otherRuleFiledName.CHINESE_NAME]: '用户类型',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE], //只能create
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10720, msg: '用户类型不能为空'}, mongoError: {rc: 20720, msg: '用户类型不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        [ruleFiledName.ENUM]:{define:enumValue.UserType,error:{rc:10722,msg:'用户类型不正确'},mongoError:{rc:20722,msg:'用户类型不正确'}},//server端使用
    },


    //转换过的password，最终要存入db
    password: {
        [otherRuleFiledName.CHINESE_NAME]: '密码',
        [otherRuleFiledName.DATA_TYPE]:serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10724,msg:'密码不能为空'},mongoError:{rc:20724,msg:'密码不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        /*            [ruleFiledName.MIN_LENGTH]:{define:6,error:{rc:10002},mongoError:{rc:20002,msg:'密码至少6个字符'}},
         [ruleFiledName.MAX_LENGTH]:{define:20,error:{rc:10004},mongoError:{rc:20004,msg:'密码的长度不能超过20个字符'}},*/
        [ruleFiledName.FORMAT]:{define:/^[0-9a-f]{64}$/,error:{rc:10725,msg:'密码必须由64个字符组成'},mongoError:{rc:20725,msg:'密码必须由64个字符组成'}} //加密密码采用sha256，减少CPU负荷
    },


    photoPathId: {
        [otherRuleFiledName.CHINESE_NAME]: '头像存储路径',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.OBJECT_ID,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10726, msg: '头像存储路径不能为空'}, mongoError: {rc: 20726, msg: '头像存储路径不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10718}, mongoError: {rc: 20718, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10720}, mongoError: {rc: 20720, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.objectId, error: {rc: 10727, msg: '头像存储路径格式不正确'}, mongoError: {rc: 20727, msg: '头像存储路径格式不正确'}} //server端使用
    },

    photoHashName: {
        [otherRuleFiledName.CHINESE_NAME]: '头像hash名',
        [otherRuleFiledName.DATA_TYPE]: serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10728, msg: '头像hash名不能为空'}, mongoError: {rc: 20728, msg: '头像hash名不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        // [ruleFiledName.MIN_LENGTH]: {define: 6, error: {rc: 10718}, mongoError: {rc: 20718, msg: '密码至少6个字符'}},
        // [ruleFiledName.MAX_LENGTH]: {define: 20, error: {rc: 10720}, mongoError: {rc: 20720, msg: '密码的长度不能超过20个字符'}},
        [ruleFiledName.FORMAT]: {define: regex.hashedThumbnail, error: {rc: 10729, msg: '头像hash名由27~28个字符组成'}, mongoError: {rc: 20729, msg: '头像hash名由27~28个字符组成'}} //server端使用. md5
    },

/*    photoDataUrl:{
        [otherRuleFiledName.CHINESE_NAME]: '用户头像',
        [otherRuleFiledName.DATA_TYPE]:serverDataType.STRING,
        [ruleFiledName.REQUIRE]: {define: false, error: {rc: 10728},mongoError:{rc:20728,msg:'用户头像不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        /!*            [ruleFiledName.MIN_LENGTH]:{define:6,error:{rc:10002},mongoError:{rc:20002,msg:'密码至少6个字符'}},
         [ruleFiledName.MAX_LENGTH]:{define:20,error:{rc:10004},mongoError:{rc:20004,msg:'密码的长度不能超过20个字符'}},*!/
        [ruleFiledName.FORMAT]:{define:regex.hashedThumbnail,error:{rc:10729},mongoError:{rc:20729,msg:'用户头像格式不正确'}} //加密密码采用sha256，减少CPU负荷
    },*/
    /*              维护事务一致性             */
    docStatus:{
        [otherRuleFiledName.CHINESE_NAME]: 'document状态',
        [otherRuleFiledName.DATA_TYPE]:serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10730,msg:'document状态不能为空'},mongoError:{rc:20730,msg:'document状态不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        /*            [ruleFiledName.MIN_LENGTH]:{define:6,error:{rc:10002},mongoError:{rc:20002,msg:'密码至少6个字符'}},
         [ruleFiledName.MAX_LENGTH]:{define:20,error:{rc:10004},mongoError:{rc:20004,msg:'密码的长度不能超过20个字符'}},*/
        [ruleFiledName.ENUM]:{define:enumValue.DocStatus,error:{rc:10731,msg:'document状态不是预定义的值'},mongoError:{rc:20731,msg:'document状态不是预定义的值'}} //加密密码采用sha256，减少CPU负荷
    },

    /*                          */
    accountType:{
        [otherRuleFiledName.CHINESE_NAME]: '账号类型',
        [otherRuleFiledName.DATA_TYPE]:serverDataType.STRING,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true}, error: {rc: 10732,msg:'账号类型不能为空'},mongoError:{rc:20732,msg:'账号类型不能为空'}},//mongoError在mongovalidator中，从Object转换成String，因为mongo的validtor只能接受String作为fail的返回信息
        /*            [ruleFiledName.MIN_LENGTH]:{define:6,error:{rc:10002},mongoError:{rc:20002,msg:'密码至少6个字符'}},
         [ruleFiledName.MAX_LENGTH]:{define:20,error:{rc:10004},mongoError:{rc:20004,msg:'密码的长度不能超过20个字符'}},*/
        [ruleFiledName.ENUM]:{define:enumValue.AccountType,error:{rc:10733,msg:'账号类型不是预定义的值'},mongoError:{rc:20733,msg:'账号类型不是预定义的值'}} //加密密码采用sha256，减少CPU负荷
    },

    usedAccount:{
        [otherRuleFiledName.CHINESE_NAME]: '历史账号',
        [otherRuleFiledName.DATA_TYPE]:[serverDataType.STRING],
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10734,msg:'历史账号不能为空'},mongoError:{rc:20734,msg:'历史账号不能为空'}},//注册的时候，就必须把account插入
        'arrayMinLength': {define: 1, error: {rc: 10735, msg: '至少设置1个标签'}, mongoError: {rc: 20135, msg: '至少设置1个标签'}},
        'arrayMaxLength': {define: maxNumber.user.maxUsedAccountNum, error: {rc: 10736, msg: `最多保存${maxNumber.user.maxUsedAccountNum}个历史账号`}, mongoError: {rc: 20736, msg: `最多保存${maxNumber.user.maxUsedAccountNum}个历史账号`}},
    },

    lastAccountUpdateDate:{
        [otherRuleFiledName.CHINESE_NAME]: '账号更改日期',
        [otherRuleFiledName.DATA_TYPE]:serverDataType.DATE,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,[applyRange.UPDATE_SCALAR]:true}, error: {rc: 10737,msg:'账号更改日期不能为空'},mongoError:{rc:20737,msg:'账号更改日期不能为空'}},//注册的时候，就必须把account插入

    },

    lastSignInDate:{
        [otherRuleFiledName.CHINESE_NAME]: '上次登录时间',
        [otherRuleFiledName.DATA_TYPE]:serverDataType.DATE,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,], //主要是通过login来更改此字段，而不是update
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:true,}, error: {rc: 10738,msg:'上次登录时间不能为空'},mongoError:{rc:20738,msg:'上次登录时间不能为空'}},//注册的时候，就必须把account插入
    },

    photoSize:{
        [otherRuleFiledName.CHINESE_NAME]: '头像大小',
        [otherRuleFiledName.DATA_TYPE]:serverDataType.NUMBER,
        [otherRuleFiledName.APPLY_RANGE]:[applyRange.CREATE,applyRange.UPDATE_SCALAR],
        [ruleFiledName.REQUIRE]: {define: {[applyRange.CREATE]:false,[applyRange.UPDATE_SCALAR]:false}, error: {rc: 10739,msg:'头像大小不能为空'},mongoError:{rc:20739,msg:'头像大小不能为空'}},//注册的时候，就必须把account插入
    }
}

module.exports={
    user,
}