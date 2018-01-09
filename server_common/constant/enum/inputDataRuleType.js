/**
 * Created by ada on 2017-06-09.
 * 各种类型
 */

'use strict'

//input对应的rule(server)
//ruleType 不能使用 Symbol，因为会在rule定义中将value作为key使用，而Symbol值是不能作为key的。{userName:{require:false}}，此处require必须是字符，而不是Symbol。在checkInput，会使用ruleType[require]作为key，从rule中取得对应的rule定义
const ServerRuleType={
    REQUIRE:'require',
    MAX_LENGTH:'maxLength',
    MIN_LENGTH:'minLength',
    EXACT_LENGTH:'exactLength',
    MIN:'min',
    MAX:'max',
    FORMAT:'format',
    // "EQUAL_TO":'equalTo', //可能不需要了
    ENUM:'enum',

    ARRAY_MIN_LENGTH:'arrayMinLength',
    ARRAY_MAX_LENGTH:'arrayMaxLength',
    // ARRAY_EXACT_LENGTH:'arrayExactLength',
}

//采用字符，而不是symbol，否则无法读取key：value对
const ServerDataType={
    INT:'int',
    FLOAT:'float',
    STRING:'string',
    DATE:'date',
    // ARRAY:'array',
    OBJECT:'object',
    FILE:'file',
    FOLDER:'folder',
    NUMBER:'number',
    OBJECT_ID:'objectId',//mongodb的id

    BOOLEAN:'boolean'
}


//rule定义中，除了了ruleType之外的字段
//和ruleType同样的理由而不能使用Symbol
const OtherRuleFiledName={
    CHINESE_NAME:'chineseName',
    // default:'chineseName',
    DATA_TYPE:'type',
    APPLY_RANGE:'apply_range',    //确定字段应用在哪种CRUD的操作上（以便确定该字段是否应该出现在输入中）
}

const ApplyRange={
    CREATE:'create',
    UPDATE_SCALAR:'update_scalar',//适用recordInfo
    UPDATE_ARRAY:'update_array',//适用editSubFiel
}
//input对应的rule(client)，根据server获得，排除（exactLength/Format/eauqlTo): 不在client使用format（正则）
/*
 * client使用iview的Form进行验证（async-validator），所以无需自定cilentRule了
 * */
const RuleFiledName={
    REQUIRE:'require',
    MAX_LENGTH:'maxLength',
    MIN_LENGTH:'minLength',
    ARRAY_MIN_LENGTH:'arrayMinLength',
    ARRAY_MAX_LENGTH:'arrayMaxLength',
    //exactLength:'exactLength',
    MIN:'min',
    MAX:'max',
    ENUM:'enum',
    FORMAT:'format',
     // equalTo:'equalTo',
}

//async-validator使用的数据类型
//因为client端的iview使用async-validator对input的数据进行验证，所以要在inputRule.js中设置对应的sync-validator date type，以便转换
const ClientDataType={
    STRING: 'string',
    NUMBER: 'number',
    BOOLEAN:'boolean',
    HEX:'hex',
    INT:'integer',
    FLOAT: 'float',
    ARRAY: 'array',
    OBJECT: 'object',
    ENUM:'enum',
    DATE:'date',
    URL:'url',
    EMAIL: 'email',

    METHOD: 'method',
    REGEXP: 'regexp',
}

//asyncValidator的ruletype（用在client（vue）代码中）
const ClientRuleType={
    REQUIRE:'required',
    PATTERN:'pattern',
    MIN:'min', //对于字符，指长度的最小值；对于数字，只最小值；对于数组，指最小元素数
    MAX:'max',
    LEN:'len',
    ENUM:'enum',
}

//server端自定义rule type，和mongoose中字段值的rule type的匹配关系
// const serverRuleTypeMatchMongooseRule={
//     [ServerRuleType.REQUIRE]:'required',
//     [ServerRuleType.MIN]:'min',
//     [ServerRuleType.MAX]:'max',
//     [ServerRuleType.MIN_LENGTH]:'minlength',
//     [ServerRuleType.MAX_LENGTH]:'maxlength',
//     [ServerRuleType.FORMAT]:'match',
//     [ServerRuleType.ENUM]:'enum',
// }


let serverRuleTypeMatchMongooseRule={
    require:'required',
    min:'min',
    max:'max',
    minLength:'minlength',
    maxLength:'maxlength',
    format:'match',
    'enum':'enum',
}


/*
const RequireType={
    REQUIRE_ENABLE_CREATE:'create',
    REQUIRE_ENABLE_UPDATE:'update',
    REQUIRE_ENABLE_BOTH:'both',
    REQUIRE_DISABLE_BOTH:'none',
}
*/

module.exports={
    ServerDataType,
    ServerRuleType,
    //clientRule,
    OtherRuleFiledName,
    RuleFiledName,
    ClientDataType,
    ClientRuleType,


    serverRuleTypeMatchMongooseRule,
    ApplyRange,
    // RequireType,
}