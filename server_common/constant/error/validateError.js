/**
 * Created by Ada on 2017/1/23.
 */
'use strict'


const validateRule={
    //valueTypeCheck
    unknownDataType:{rc:40000,msg:'未知数据类型'},

    //ruleFormatCheck
    ruleMustBeObject:{rc:40002,msg:'rule定义必须是对象'},
    mandatoryFiledNotExist:{rc:40004,msg:'字段必需存在'},
    chineseNameNotString:{rc:40006,msg:'chineseName字段必须是字符串'},
    chineseNameEmpty:{rc:40008,msg:'chineseName字段不能为空'},

    needMin:{rc:40010,msg:'type为int时，必需包含Min属性'},
    needMax:{rc:40012,msg:'type为int时，必需包含Max属性'},
    needMaxLength:{rc:40014,msg:'type为string或者number时，必需包含maxLength属性'},
    needFormat:{rc:40016,msg:'type为objectId是，必须包含format属性'},


    lengthDefineNotInt:{rc:40018,msg:'length定义不是整数'},
    lengthDefineMustLargeThanZero:{rc:40020,msg:'length的定义必须大于0'},
    maxDefineNotInt:{rc:40022,msg:'max的定义不是整数'},
    minDefineNotInt:{rc:40024,msg:'min的定义不是整数'},
    requireDefineNotBoolean:{rc:40026,msg:'require的定义不是布尔值'},
    enumDefineNotArray:{rc:40028,msg:'enum的定义不是数组'},
    enumDefineLengthMustLargerThanZero:{rc:40030,msg:'enum的定义数组不能为空'},
    ruleDefineNotDefine:{rc:40032,msg:'define字段没有定义'},
    errorFieldNotDefine:{rc:40034,msg:'error字段不存在'},
    rcFieldNotDefine:{rc:40036,msg:'rc字段不存在'},
    ruleDefineWrong:function(collName,fieldName,ruleName){return {rc:40038,msg:`${collName}的字段${fieldName}中的rule ${ruleName}的define值不正确`}},
}

const validateFormat={
    reqBodyMustBeObject:{rc:40100,msg:{client:`输入值格式错误`,server:`传入参数必须是对象`}},
    valuesUndefined:{rc:40101,msg:{client:'输入值格式错误',server:'输入值不能为空(未定义)'}},
    valueMustBeObject:{rc:40102,msg:{client:`输入值格式错误`,server:`输入值必须是对象`}},

    inputValuePartNumNotExpected:{rc:40104,msg:{client:`输入值格式错误`,server:`输入参数中，输入值中字段数量和定义的不一致`}},
    inputValueExceptedPartNotValid:{rc:40106,msg:{client:`输入值格式错误`,server:`期望进行检查的参数不存在`}},
    inputValuePartNotMatch:{rc:40108,msg:{client:`输入值格式错误`,server:`输入参数中，某个参数并非期望的参数`}},
    inputValuePartSearchParamsValueFormatWrong:{rc:40110,msg:{client:`输入值格式错误`,server:`输入参数中，searchParams的值必须为object`}},
    inputValuePartRecordInfoValueFormatWrong:{rc:40111,msg:{client:`输入值格式错误`,server:`输入参数中，recordInfo的值必须为object`}},
    inputValuePartSingleFieldValueFormatWrong:{rc:40112,msg:{client:`输入值格式错误`,server:`输入参数中，singleField的值必须为object`}},
    inputValuePartMethodValueFormatWrong:{rc:40113,msg:{client:`输入值格式错误`,server:`输入参数中，method的值必须为字符`}},
    inputValuePartCurrentPageValueFormatWrong:{rc:40114,msg:{client:`输入值格式错误`,server:`输入参数中，currentPage的值必须为整数`}},
    inputValuePartCurrentCollValueFormatWrong:{rc:40116,msg:{client:`输入值格式错误`,server:`输入参数中，currentColl的值必须为字符串`}},
    inputValuePartRecordIdValueFormatWrong:{rc:40118,msg:{client:`输入值格式错误`,server:`输入参数中，recordId的值不正确`}},//必须为字符，且为objectId
    inputValuePartFilterFieldValueFormatWrong:{rc:40120,msg:{client:`输入值格式错误`,server:`输入参数中，FilterFieldValue的值必须为对象`}},
    inputValuePartRecIdArrValueFormatWrong:{rc:40122,msg:{client:`输入值格式错误`,server:`输入参数中，recIdArr的值必须为数组`}},
    inputValuePartEventValueFormatWrong:{rc:40122,msg:{client:`输入值格式错误`,server:`输入参数中，event的值必须为对象`}},
    inputValuePartUndefinedPart:{rc:40124,msg:{client:`输入值格式错误`,server:`输入参数中，part未定义`}},

    recordInfoCantEmpty:{rc:40126,msg:{client:'输入值格式错误',server:'recorderInfo不能为空'}},//在validatePart已经检测为object，次数检测为空object
    recordInfoFieldNumExceed:{rc:40128,msg:{client:'输入值格式错误',server:'recorderInfo中的字段数量超出定义的数量'}},//inputValue中的字段数量超出rule中定义的字段数量
    recordInfoValueMustBeObject:{rc:40130,msg:{client:'输入值格式错误',server:'recorderInfo的值必须是object'}},
    recordInfoHasDuplicateField:{rc:40132,msg:{client:'参数格式不正确',server:'参数中的有重复字段'}},
    recordInfoFiledRuleNotDefine:{rc:40134,msg:{client:'输入值格式错误',server:'待检测的输入值字段没有对应的检测规则'}},
    recordInfoSubObjectMustHasOnly1Field:{rc:40136,msg:{client:'输入值格式错误',server:'recorderInfo的值（object），每个子object必须只包含一个key'}}, //{field1:{value:'xxx'}}
    recordInfoSubObjectFiledNameWrong:{rc:40138,msg:{client:'输入值格式错误',server:'recorderInfo的值（object），每个子object的key必须是value'}}, //{field:{value;xxxx}}
    //recordInfoIncludeSkipFiled:{rc:69711,msg:'不能包含需要略过的字段'},

    filterFieldValueMustBeObject:{rc:40140,msg:{client:'输入值格式错误',server:'filterFieldValue的值必须是object'}},//
    filterFieldValueFieldNumMustHasOnly1Field:{rc:40142,msg:{client:'输入值格式错误',server:'filterFieldValue中的字段数量只能为1'}},//只能包含id或者_id一个field
    filterFieldValueNotSet:{rc:40144,msg:{client:'输入值格式错误',server:'filterFieldValue中的键未赋值'}},//字段名称不再rule中
    filterFieldValueFieldNotInRule:{rc:40146,msg:{client:'输入值格式错误',server:'filterFieldValue中，字段未在rule中定义'}},//字段名称不再rule中
    filterFieldValueFKFieldMustBeObject:{rc:40148,msg:{client:'输入值格式错误',server:'filterFieldValue中，如果是外键，值必须为object'}},
    filterFieldValueFKFieldMustHasOnly1Field:{rc:40150,msg:{client:'输入值格式错误',server:'filterFieldValue中，如果是外键，值（为object）中，必须只包含一个object'}},//如果是对象，则此对象的key不是外键对应的字段
    filterFieldValueFKFieldRealtedFKNotDefine:{rc:40152,msg:{client:'输入值格式错误',server:'filterFieldValue中，设定的关联外键字段未在fkonfig的relatedFields中定义'}},//value是object，但是其中的key不在fkConfig
    filterFieldValueFKFieldNoRelateField:{rc:40154,msg:{client:'输入值格式错误',server:'filterFieldValue中，外键的定义不正确'}},//如果是对象，则此对象的key不是外键对应的字段
    filterFieldValueFKFieldValueNotSet:{rc:40158,msg:{client:'输入值格式错误',server:'filterFieldValue中，外键对应的外键字段值没有赋值'}},
    filterFieldValueTypeWrong:{rc:40160,msg:{client:'输入值格式错误',server:'filterFieldValue中的字段的值类型不正确'}},//只能是字符/数字/对象（外键）


    //searchParams(独立的部分，可以在S中进行检查)
    searchParamsCollNoRelatedRule:{rc:40162,msg:{client:'输入值格式错误',server:'查询参数中的指定的表没有对应rule'}},//输入值的字段数超过rule中定义的字段数
    searchParamsFieldsExceed:{rc:40164,msg:{client:'输入值格式错误',server:'查询参数中包含的字段数过大'}},//输入值的字段数超过rule中定义的字段数
    searchParamsFieldNoRelatedRule:{rc:40166,msg:{client:`输入值格式错误`,server:`查询参数的键无对应的rule`}},//？？有些字段虽然是server生成的，但是也可通过client查询
    searchParamsFiledValueCantEmpty:{rc:40168,msg:{client:`输入值格式错误`,server:`查询参数的普通字段（的查询参数）不能为空`}},
    // searchParamsFiledValueMustBeArray:{rc:69633,msg:{client:`输入值格式错误`,server:`查询参数的普通字段（的查询参数）必须是数组`}},
    searchParamsFKFiledValueMustBeObject:{rc:40170,msg:{client:`输入值格式错误`,server:`查询参数的外键字段的对应的值必须是对象`}},//外键是对象，里面是对应的字段，已经字段对应的数组
    //{fkField:{relatedField:[{value;asdf,compOP:'gt'}]}}
    searchParamsFKNoRelatedRule:{rc:40172,msg:{client:`输入值格式错误`,server:`查询参数的外键无对应的rule`}},
    searchParamsFKRelatedFieldInvalid:{rc:40174,msg:{client:`输入值格式错误`,server:`查询参数的外键对应的字段不允许`}}, //fkField:{inValida_field:[{value;111}]}。 inValida_field未在fkconfig的relatedFields中定义
    searchParamsFKFiledValueCantEmpty:{rc:40176,msg:{client:`输入值格式错误`,server:`查询参数的外键字段（的查询参数）不能为空`}},


    //search->validateSingleSearchParamsFormat
    singleSearchParamsValueMustBeArray:{rc:40178,msg:{client:`查询值格式不正确`,server:`查询参数的字段（的搜索值）必须是数组`}},
    singleSearchParamsValueCantEmpty:{rc:40180,msg:{client:`查询值格式不正确`,server:`查询参数的字段（的搜索值）不能为空数组`}},
    singleSearchParamsValueLengthExceed:{rc:40182,msg:{client:`查询值格式不正确`,server:`查询参数的键值中的值数量过多`}},
    singleSearchParamsElementMustBeObject:{rc:40184,msg:{client:`查询值格式不正确`,server:`查询参数的键值中的单个查询条件必须是对象`}},
    singleSearchParamsElementKeysLengthExceed:{rc:40186,msg:{client:`查询值格式不正确`,server:`查询参数的键值中的查询元素的键数量超出`}},//一般是value和compOp
    singleSearchParamsElementContainUnexpectKey:{rc:40188,msg:{client:`查询值格式不正确`,server:`查询参数中，查询元素的键不是预定的`}},
    singleSearchParamsElementMissKeyValue:{rc:40190,msg:{client:`查询值格式不正确`,server:`查询参数中，必须包含value`}},
    singleSearchParamsElementMissKeyCompOp:{rc:40192,msg:{client:`查询值格式不正确`,server:`查询参数中，字段类型为数字或者日期，必须包含操作符`}},
    singleSearchParamsElementCantContainCompOp:{rc:40194,msg:{client:`查询值格式不正确`,server:`查询参数中，字段类型非数字或者日期，不能包含操作符`}},
    singleSearchParamsElementCompOpWrong:{rc:40196,msg:{client:`查询值格式不正确`,server:`查询参数中，操作符不是预定义的符号之一`}},


    editSubFieldMustBeObject:{rc:40198,msg:{client:`输入值格式不正确`,server:`更新子字段的值必须是object`}},
    editSubFieldKeyNumberWrong:{rc:40200,msg:{client:`输入值格式不正确`,server:`更新子字段中键值的数量不正确`}},
    editSubFieldKeyNameWrong:{rc:40202,msg:{client:`输入值格式不正确`,server:`更新子字段中键值的名称不是预定义`}},
    editSubFieldFromOrToExistOne:{rc:40204,msg:{client:`输入值格式不正确`,server:`更新子字段中from或者to字段，必须2者选1`}},


    eventMustBeObject:{rc:40206,msg:{client:`输入值格式不正确`,server:`事件必须是object`}},
    eventKeyNumberWrong:{rc:40208,msg:{client:`输入值格式不正确`,server:`事件中键值的数量不正确`}},
    eventMandatoryKeyNotExist:{rc:40210,msg:{client:`输入值格式不正确`,server:`事件中必选键不存在`}},
    eventFieldKeyNameWrong:{rc:40212,msg:{client:`输入值格式不正确`,server:`事件中键值的名称不是预定义`}},

    singleFieldMustOnlyOneField:{rc:40220,msg:{client:`输入值格式不正确`,server:`单个字段中只能包含一个字段`}},
    singleFieldValueCantUndefined:{rc:40221,msg:{client:`输入值格式不正确`,server:`单个字段中值不能为undefined`}},
    singleFieldCantContainId:{rc:40222,msg:{client:`输入值格式不正确`,server:`单个字段中不能包含主键`}},
    singleFiledRuleNotDefine:{rc:40224,msg:{client:'输入值格式错误',server:'待检测的输入值字段没有对应的rule'}},
/*    singleFiledRValueMustBeObject:{rc:40226,msg:{client:'输入值格式错误',server:'singleField的值必须是object'}},
    singleFiledValueMustContainOneKey:{rc:40228,msg:{client:'输入值格式错误',server:'singleField的值(object)必须只有一个键'}},
    singleFiledValuesKeyNameWrong:{rc:40230,msg:{client:'输入值格式错误',server:'singleField的值(object)的键名必须是value'}},*/
}

const validateValue={
    //validateCreateUpdateInputValue
    CUDObjectIdEmpty:{rc:40300,msg:'objectId不能为空'},
    CUDObjectIdWrong:{rc:40302,msg:'objectId的格式不正确'},
    mandatoryFieldMiss(fieldName){
        return {rc:40304,msg:`缺少必填字段${fieldName}`}//create的时候，某些必填字段没有填入
    },
    CUDTypeWrong:{rc:40306,msg:'值的数据类型不正确'},



    SValueEmpty:{rc:40308,msg:'查询值为空'},
    STypeWrong:{rc:40310,msg:'类型不正确'},
    // SRangeOutRange:{rc:69718,msg:'查询值超出范围'},
    filterFieldValueOutRange:{rc:40312,msg:'查询值超出范围'},//超出min/max/MaxLength，则可以skip查询过程，直接放回空数组给client
    /*      delete          */
    // deleteValueFieldNumWrong:{rc:69720,msg:'输入键值数量不正确'},
    // deleteValueFieldNameWrong:{rc:69722,msg:'输入键值名称不正确'},
    //deleteValueFieldValueWrong:{rc:69710,msg:'输入键值不正确'},//必须是mongodb objectid
    /*          static          */
    staticTypeWrong:{rc:40314,msg:'类型不正确'},

    /*          currentColl         */
    undefinedCurrentColl:{rc:40316,msg:'未定义的coll'},
    /*          currentPage         */
    invalidCurrentPage:{rc:40318,msg:'页码超出范围'},

    /*          recIdArray          */
    recIdArrValueCantEmpty:{rc:40320,msg:'recIdArr不能为空'},
    recIdArrValueExceedMax:{rc:40322,msg:'recIdArr超出最大长度'},//一般根据paganition.pageSize
    recIdArrValueEleShouldString:{rc:40324,msg:'recIdArr中每个元素必须是字符'},
    recIdArrValueEleShouldObjectId:{rc:40326,msg:'recIdArr中每个元素必须是objectId'},
    /*              validateEditSubFieldValue           */
    fromMustBeObjectId:{rc:40328,msg:'from的值必须是objectId'},
    toMustBeObjectId:{rc:40330,msg:'to的值必须是objectId'},
    eleArrayNotDefine:{rc:40332,msg:'eleArray必须有值'},
    eleArrayMustBeArray:{rc:40334,msg:'eleArray必须是数组'},
    eleArrayCantEmpty:{rc:40336,msg:'eleArray不能为空'},
    eleArrayMustContainObjectId:{rc:40340,msg:'eleArray中元素必须是objectId'},
    /*              validateEventValue          */
    valueNotSet(fieldName){return {rc:40342,msg:`${fieldName}的值未定义`}},
    eventIdNotValid:{rc:40344,msg:`事件未定义`},
    sourceIdMustBeObjectId:{rc:40346,msg:'sourceId的值必须是objectId'},
    targetIdMustBeObjectId:{rc:40348,msg:'targetId的值必须是objectId'},
    eventStatusNotValid:{rc:40350,msg:'事件状态的值不正确'},

    //
    unknownRuleType:{rc:40352,msg:'未知rule类型'},

    /*              method              */
    methodValueUndefined:{rc:40240,msg:{client:'输入值格式错误',server:'method的值不是预定义的值之一'}},
}


module.exports={
    validateRule,
    validateFormat,
    validateValue,

}