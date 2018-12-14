/**
 * Created by Ada on 2017/1/23.
 */
'use strict'

//40000～40100
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

//40100～40400
const validateFormat={
    reqBodyMustBeObject:{rc:40100,msg:{client:`输入值格式错误`,server:`传入参数必须是对象`}},
    valuesUndefined:{rc:40101,msg:{client:'输入值格式错误',server:'输入值不能为空(未定义)'}},
    valueMustBeObject:{rc:40102,msg:{client:`输入值格式错误`,server:`输入值必须是对象`}},

    inputValuePartNumNotExpected:{rc:40104,msg:{client:`输入值格式错误`,server:`输入参数中，输入值中字段数量和定义的不一致`}},
    inputValueExceptedPartNotValid:{rc:40106,msg:{client:`输入值格式错误`,server:`期望进行检查的参数不存在`}},
    inputValuePartNotMatch:{rc:40108,msg:{client:`输入值格式错误`,server:`输入参数中，某个参数并非期望的参数`}},
    // inputValuePartSearchParamsValueFormatWrong:{rc:40110,msg:{client:`输入值格式错误`,server:`输入参数中，searchParams的值必须为object`}},
    inputValuePartRecordInfoValueFormatWrong:{rc:40111,msg:{client:`输入值格式错误`,server:`输入参数中，recordInfo的值必须为object`}},
    inputValuePartSingleFieldValueFormatWrong:{rc:40112,msg:{client:`输入值格式错误`,server:`输入参数中，singleField的值必须为object`}},
    inputValuePartMethodValueFormatWrong:{rc:40113,msg:{client:`输入值格式错误`,server:`输入参数中，method的值必须为字符`}},
    inputValuePartCurrentPageValueFormatWrong:{rc:40114,msg:{client:`输入值格式错误`,server:`输入参数中，currentPage的值必须为整数`}},
    inputValuePartCurrentCollValueFormatWrong:{rc:40115,msg:{client:`输入值格式错误`,server:`输入参数中，currentColl的值必须为字符串`}},
    inputValuePartManipulateArrayValueFormatWrong:{rc:40116,msg:{client:`输入值格式错误`,server:`输入参数中，manipulate array的值必须为对象`}},
    inputValuePartRecordIdCryptedValueFormatWrong:{rc:40118,msg:{client:`输入值格式错误`,server:`输入参数中，加密的recordId值不正确`}},//必须为字符，
    inputValuePartRecordIdDecryptedValueFormatWrong:{rc:40119,msg:{client:`输入值格式错误`,server:`输入参数中，解密后的recordId的值不正确`}},//必须为字符，且为objectId
    inputValuePartFilterFieldValueFormatWrong:{rc:40120,msg:{client:`输入值格式错误`,server:`输入参数中，FilterFieldValue的值必须为对象`}},
    inputValuePartRecIdArrValueFormatWrong:{rc:40121,msg:{client:`输入值格式错误`,server:`输入参数中，recIdArr的值必须为数组`}},
    inputValuePartEventValueFormatWrong:{rc:40122,msg:{client:`输入值格式错误`,server:`输入参数中，event的值必须为对象`}},
    inputValuePartEditSubFieldValueFormatWrong:{rc:40123,msg:{client:`输入值格式错误`,server:`输入参数中，editSubField的值必须为对象`}},
    // inputValuePartEditSubFieldCryptedValueFormatWrong:{rc:40123,msg:{client:`输入值格式错误`,server:`输入参数中，editSubField的值必须为对象`}},
    // inputValuePartEditSubFieldDecryptedValueFormatWrong:{rc:40124,msg:{client:`输入值格式错误`,server:`输入参数中，editSubField的值必须为对象`}},
    //inputValuePartDataUrlValueFormatWrong:{rc:40124,msg:{client:`输入值格式错误`,server:`输入参数中，dataUrl的值必须为字符`}},
    inputValuePartUndefinedPart:{rc:40125,msg:{client:`输入值格式错误`,server:`输入参数中，part未定义`}},

    recordInfoCantEmpty:{rc:40126,msg:{client:'输入值格式错误',server:'recorderInfo不能为空'}},//在validatePart已经检测为object，次数检测为空object
    recordInfoFieldNumExceed:{rc:40128,msg:{client:'输入值格式错误',server:'recorderInfo中的字段数量超出定义的数量'}},//inputValue中的字段数量超出rule中定义的字段数量
    recordInfoValueMustBeObject:{rc:40130,msg:{client:'输入值格式错误',server:'recorderInfo的值必须是object'}},
    recordInfoHasDuplicateField:{rc:40132,msg:{client:'参数格式不正确',server:'参数中的有重复字段'}},
    recordInfoFiledRuleNotDefine:{rc:40134,msg:{client:'输入值格式错误',server:'待检测的输入值字段没有对应的检测规则'}},
    recordInfoIdForbid:{rc:40134,msg:{client:'输入值格式错误',server:'不能传入字段：id'}},
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
    editSubFieldNoRelatedRule:{rc:40199,msg:{client:`输入值格式不正确`,server:`更新子字段的没有对应的rule`}},
    editSubFieldDataTypeIncorrect:{rc:40200,msg:{client:`输入值格式不正确`,server:`更新子字段的字段值必须是array或者mix`}},
    editSubFieldKeyNumberWrong:{rc:40201,msg:{client:`输入值格式不正确`,server:`更新子字段中键值的数量不正确`}},
    editSubFieldKeyNameWrong:{rc:40202,msg:{client:`输入值格式不正确`,server:`更新子字段中键值的名称不是预定义`}},
    eleArrayNotDefine:{rc:40203,msg:'eleArray必须有值'},
    editSubFieldFromOrToExistOne:{rc:40204,msg:{client:`输入值格式不正确`,server:`更新子字段中from或者to字段，必须2者选1`}},


    eventMustBeObject:{rc:40206,msg:{client:`输入值格式不正确`,server:`事件必须是object`}},
    eventKeyNumberWrong:{rc:40208,msg:{client:`输入值格式不正确`,server:`事件中键值的数量不正确`}},
    eventMandatoryKeyNotExist:{rc:40210,msg:{client:`输入值格式不正确`,server:`事件中必选键不存在`}},
    eventFieldKeyNameWrong:{rc:40212,msg:{client:`输入值格式不正确`,server:`事件中键值的名称不是预定义`}},

    singleFieldMustOnlyOneField:{rc:40220,msg:{client:`输入值格式不正确`,server:`单个字段中只能包含一个字段`}},
    singleFieldValueCantUndefined:{rc:40221,msg:{client:`输入值格式不正确`,server:`单个字段中值不能为undefined`}},
    singleFieldCantContainId:{rc:40222,msg:{client:`输入值格式不正确`,server:`单个字段中不能包含主键`}},
    singleFiledRuleNotDefine:{rc:40224,msg:{client:'输入值格式错误',server:'待检测的输入值字段没有对应的rule'}},

    manipulateArray:{
        manipulateArrayMustBeObject:{rc:40226,msg:{client:`输入值格式不正确`,server:`必须是object`}},
        manipulateArrayNoRelatedRule:{rc:40228,msg:{client:`输入值格式不正确`,server:`字段的没有对应的rule`}},
        manipulateArrayFieldValueMustBeObject:{rc:40230,msg:{client:`输入值格式不正确`,server:`字段的值必须是对象`}},
        manipulateArrayFieldKeyNumberWrong:{rc:40232,msg:{client:`输入值格式不正确`,server:`字段中键值的数量不正确`}},
        manipulateArrayFieldKeyNameWrong:{rc:40234,msg:{client:`输入值格式不正确`,server:`字段中键值的名称不是预定义`}},
    },

    searchParams:{
        /*      validateFormat->validatePartValueFormat       */
        partValueFormatWrong:{rc:40240,msg:{client:`查询值格式错误`,server:`查询参数中，searchParams的值必须为对象`}},

        /*      searchParamsNonIdCheck_async        */
        partValueCantEmpty:{rc:40242,msg:{client:`查询值格式错误`,server:`searchParams不能为空对象`}},
        illegalCollName:{rc:40244,msg:{client:`查询值格式错误`,server:`searchParams中包含禁止collName`}},
        searchValueDataTypeUnknownOrNotSupport:{rc:40245,msg:{client:`查询值格式错误`,server:`searchParams中的查询的字段值的数据类型位置或者不支持（当前支持数字，字符，日期）`}},

        /*          collValueFormatCheck_async          */
        collValueMustBeObject:{rc:40246,msg:{client:`查询值格式错误`,server:`searchParams中coll的值，必须是对象`}},
        collValueContain2Key:{rc:40247,msg:{client:`查询值格式错误`,server:`searchParams中coll的值，只能包含2个key`}},
        collValueKeyInvalid:{rc:40247,msg:{client:`查询值格式错误`,server:`searchParams中coll的值，key名称无效`}},

        /*      fieldOpCheck_async      */
        fieldOpValueUndefined:{rc:40256,msg:{client:`查询值格式错误`,server:`searchParams中coll的fieldOp没有赋值`}},
        fieldOpValueInvalid:{rc:40258,msg:{client:`查询值格式错误`,server:`searchParams中coll的fieldOp的值是数组，其中有元素无效`}},
        /*      searchValueFormatCheck_async      */
        searchValueMustBeObject:{rc:40256,msg:{client:`查询值格式错误`,server:`searchParams中coll的searchValue必须是object`}},
        searchValueFieldNumIncorrect:{rc:40256,msg:{client:`查询值格式错误`,server:`searchParams中coll的searchValue包含的查询字段数不正确`}},
        /*          searchValueValidationCheck_async          */
        fieldUndefined:{rc:40247,msg:{client:`查询值格式错误`,server:`searchParams中coll的searchValue的field，未在rule中定义`}},
        fieldForbidForSearch:{rc:40248,msg:{client:`查询值格式错误`,server:`searchParams中coll的searchValue的field，被禁止用作查询之用`}},
        currentSearchRangeForbid:{rc:40250,msg:{client:`查询值格式错误`,server:`searchParams中coll的searchValue的field，当前searchRange不符合rule中定义的searchRange`}},

        /*      fieldValueFormatCheck_async       */
        fieldValueMustBeObject:{rc:40252,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的值，必须是对象`}},
        fieldValueMustContain2Key:{rc:40254,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的值，必须包含2个key`}},
        fieldValueKeyInvalid:{rc:40255,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的值的key无效`}},

        /*      arrayCompOpCheck_async      */
        arrayCompOpUndefined:{rc:40262,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayCompOp没有赋值`}},
        arrayCompOpValueMustBeArray:{rc:40264,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayCompOp的值必须是数组`}},
        // arrayCompOpValueEleNumIncorrect:{rc:40254,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayCompOp，必须包含2个key`}},
        arrayCompOpValueEleNumberIncorrect:{rc:40265,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayCompOp的值是数组，其中只能包含1或者2个元素`}},
        arrayCompOpInvalid:{rc:40266,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayCompOp的值无效`}},
        arrayCompOp1OpMissMandatoryOp:{rc:40260,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayCompOp的值是数组，长度为1，但是没有包含必须的操作符(ALL或者ANY)`}},
        arrayCompOp2OpMissMandatoryOp:{rc:40261,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayCompOp的值是数组，长度为2，但是没有包含必须的操作符([ALL,NONE]或者[ANY,NONE])`}},
        /*      arrayValueCheck_async       */
        arrayValueUndefined:{rc:40266,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayValue没有赋值`}},
        arrayValueMustBeArray:{rc:40268,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayValue必须是数组`}},
        arrayValueCantBeEmpty:{rc:40270,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayValue必须是数组`}},
        arrayValueExceedSetting:{rc:40272,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayValue是数组，其中查询值的数量超过定义的最大数量`}},
        arrayValueEleMustBeObject:{rc:40274,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayValue是数组，其中每个查询值必须是对象`}},
        arrayValueEleKeyNumberIncorrect:{rc:40276,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayValue是数组，其中每个查询值必须有2个key`}},
        arrayValueEleKeyNameInvalid:{rc:40278,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayValue是数组，其中查询值的key无效`}},

        arrayValueEleScalarCompOpInvalid:{rc:40280,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayValue是数组，其中查询值的key scalarCompOp不符合field的数据类型`}},
        arrayValueEleScalarCompOpMisMatch:{rc:40282,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayValue是数组，其中查询值的key scalarCompOp没有field的数据类型对应的设定`}},
        arrayValueEleScalarValueMisMatch:{rc:40284,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayValue是数组，其中查询值的key scalarValue的类型不等于field的数据类型`}},

        arrayValuesScalarValueHasDuplicateEle:{rc:40285,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayValue是数组，其中不同的scalarCompOp含有重复的scalarValue，这是毫无意义的`}},

        /*      arrayValueDigitLogicCheck_async         */
        scalarCompCanOnlyOneWhenNOT:{rc:40285,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayComp包含NOT，那么arrayValue中所有元素只能包含相同那个的scalarCompOp`}},
        scalarCompGteLteMaxOne:{rc:40286,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayValue是数组，其中查询值的key scalarValue中gt/lt/gte/lte的数量大于1（多个gt/lt/gte/lte无意义）`}},
        scalarCompGtGteLtLteCantCoexist:{rc:40286,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayValue是数组，其中查询值的key scalarValue中gt/gte，lt/lte不能共存（共存无意义）`}},
        scalarCompEqAtMostOneWhenScalarCompOpALL:{rc:40286,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayValue是数组，其中查询值的key arrayComp为ALL时，EQUAL至多一个（多个无意义）`}},
        scalarCompEqCantCoexistWithGteLte:{rc:40288,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayValue是数组，其中查询值的key arrayComp为ALL时，arrayComp的EQUAL不能和gte/lte共存`}},
        scalarValueGteValueCantGreaterThanLteValue:{rc:40290,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayValue是数组，其中查询值的key arrayComp为ALL时，如果gt(e)和lt(e)同时存在，gt(e)的值不能大于等于lt(e)的值，否则查询结果为空`}},

        /*      arrayValueNonDigitLogicCheck_async      */
        scalarValueForExactDuplicate:{rc:40292,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayValue是数组，其中查询值的key arrayValue对应的字段类型为string，查询exact有重复`}},
        scalarValueForIncludeDuplicate:{rc:40294,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayValue是数组，其中查询值的key arrayValue对应的字段类型为string，查询include有重复`}},
        scalarValueForExcludeDuplicate:{rc:40296,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayValue是数组，其中查询值的key arrayValue对应的字段类型为string，查询exclude有重复`}},
        scalarValueExactCantCoexist:{rc:40298,msg:{client:`查询值格式错误`,server:`searchParams中coll的field的arrayValue是数组，其中查询值的key arrayValue对应的字段类型为string，arrayCompOp为ALL(and)，exact不能和include/exclude共存`}},
    },
/*    singleFiledRValueMustBeObject:{rc:40226,msg:{client:'输入值格式错误',server:'singleField的值必须是object'}},
    singleFiledValueMustContainOneKey:{rc:40228,msg:{client:'输入值格式错误',server:'singleField的值(object)必须只有一个键'}},
    singleFiledValuesKeyNameWrong:{rc:40230,msg:{client:'输入值格式错误',server:'singleField的值(object)的键名必须是value'}},*/
    validateChooseFriendFormat:{
        //整体验证错（不是object）
        partValueFormatWrong:{rc:40300,msg:{client:`查询值格式错误`,server:`查询参数中，searchParams的值必须为对象`}},

        keyNumIncorrect:{rc:40301,msg:{client:`选择的好友不正确`,server:`选择的好友参数中，键值的数量不正确，必须是1个或者2个`}},
        keyNameNotPredefined:{rc:40302,msg:{client:`选择的好友不正确`,server:`选择的好友参数中，键名不是预订义`}},
        keyNameAllFriendsAlreadyExists:{rc:40304,msg:{client:`选择的好友不正确`,server:`选择的好友参数中，allFriends已经存在，不能再包含其他键名`}},
        keyNameFriendsOrGroupMustBeArray:{rc:40306,msg:{client:`选择的好友不正确`,server:`选择的好友参数中，friendGroups或者friends必须是数组`}},
        exceedMaxFriendGroups:{rc:40308,msg:{client:`选择的好友不正确`,server:`传入的好友分组的数量超过最大数量`}},
        exceedMaxFriends:{rc:40310,msg:{client:`选择的好友不正确`,server:`传入的好友数量超过最大数量`}},
    },
}

//40400～40600
const validateValue={
    //validateRecorderValue
    fieldValueShouldNotExistSinceNoRelateApplyRange({fieldName,applyRange}) {return {rc:40400,msg:{client:'输入多余字段',server:`字段${fieldName}的require定义中，没有对applyRange：${applyRange}定义，说明此字段不能输入`}}},
    //validateCreateUpdateInputValue

    CUDObjectIdWrong:{rc:40402,msg:'objectId的格式不正确'},
    mandatoryFieldMiss(fieldName){
        return {rc:40404,msg:`缺少必填字段${fieldName}`}//create的时候，某些必填字段没有填入
    },
    CUDTypeWrong:{rc:40406,msg:'值的数据类型不正确'},



    SValueEmpty:{rc:40408,msg:'查询值为空'},
    STypeWrong:{rc:40410,msg:'类型不正确'},
    // SRangeOutRange:{rc:69718,msg:'查询值超出范围'},
    filterFieldValueOutRange:{rc:40412,msg:'查询值超出范围'},//超出min/max/MaxLength，则可以skip查询过程，直接放回空数组给client
    /*      delete          */
    // deleteValueFieldNumWrong:{rc:69720,msg:'输入键值数量不正确'},
    // deleteValueFieldNameWrong:{rc:69722,msg:'输入键值名称不正确'},
    //deleteValueFieldValueWrong:{rc:69710,msg:'输入键值不正确'},//必须是mongodb objectid
    /*          static          */
    staticTypeWrong:{rc:40414,msg:'类型不正确'},

    /*          currentColl         */
    undefinedCurrentColl:{rc:40416,msg:'未定义的coll'},
    /*          currentPage         */
    invalidCurrentPage:{rc:40418,msg:'页码超出范围'},

    /*          recIdArray          */
    recIdArrValueCantEmpty:{rc:40420,msg:'recIdArr不能为空'},
    recIdArrValueExceedMax:{rc:40422,msg:'recIdArr超出最大长度'},//一般根据paganition.pageSize
    recIdArrValueEleShouldString:{rc:40424,msg:'recIdArr中每个元素必须是字符'},
    recIdArrValueEleShouldObjectId:{rc:40426,msg:'recIdArr中每个元素必须是objectId'},
    /*              validateEditSubFieldValue           */
    fieldDataTypeNotArray:{rc:40427,msg:{client:`内部错误`,server:`rule中字段的数据类型不是数组`}},
    arrayMaxLengthUndefined:{rc:40428,msg:{client:`内部错误`,server:`rule中没有定义arrayMaxLength属性`}},
    fromMustBeObjectId:{rc:40429,msg:'from的值必须是objectId'},
    toMustBeObjectId:{rc:40430,msg:'to的值必须是objectId'},

    eleArrayMustBeArray:{rc:40434,msg:'eleArray必须是数组'},
    eleArrayCantEmpty:{rc:40436,msg:'eleArray不能为空'},
    eleArrayEleNumExceed:{rc:40437,msg:'eleArray中元素过多'},
    eleArrayDataTypeWrong:{rc:40438,msg:'eleArray中元素格式不正确'},
    /*              validateEventValue          */
    valueNotSet(fieldName){return {rc:40442,msg:`${fieldName}的值未定义`}},
    eventIdNotValid:{rc:40444,msg:`事件未定义`},
    sourceIdMustBeObjectId:{rc:40446,msg:'sourceId的值必须是objectId'},
    targetIdMustBeObjectId:{rc:40448,msg:'targetId的值必须是objectId'},
    eventStatusNotValid:{rc:40450,msg:'事件状态的值不正确'},

    //
    unknownRuleType:{rc:40452,msg:'未知rule类型'},

    /*              method              */
    methodValueUndefined:{rc:40454,msg:{client:'输入值格式错误',server:'method的值不是预定义的值之一'}},

    /*              validateManipulateArrayValue           */
    manipulateArray:{
        fieldDataTypeNotArray:{rc:40460,msg:{client:`内部错误`,server:`rule中字段的数据类型不是数组`}},
        arrayMaxLengthUndefined:{rc:40462,msg:{client:`内部错误`,server:`rule中没有定义arrayMaxLength属性`}},
        fieldKeyValueMustBeArray:{rc:40464,msg:{client:`输入错误`,server:`add/remove的值必须是数组`}},
        fieldKeyValueCantEmpty:{rc:40466,msg:{client:`输入错误`,server:`add/remove的值不能为空数组`}},
        fieldKeyValueNumExceed:{rc:40468,msg:{client:`输入错误`,server:`add/remove的值超出最大定义`}},
        fieldKeyValueDataTypeWrong:{rc:40470,msg:{client:`输入错误`,server:`add/remove的值数据类型不正确`}},
    },
    /*              captcha                      */
    captcha:{
        valueTypeIncorrect:{rc:40480,msg:{client:`图片字符错误`,server:`captcha的值必须是字符`}},
        valueLengthIncorrect:{rc:40482,msg:{client:`图片字符错误`,server:`captcha的长度必须是4`}},
        // valueIncorrect:{rc:40482,msg:{client:`图片字符错误`,server:`captcha的值不正确`}},

    },
    /*              SMS                      */
    SMS:{
        valueTypeIncorrect:{rc:40490,msg:{client:`验证码错误`,server:`验证码的值必须是字符`}},
        valueLengthIncorrect:{rc:40492,msg:{client:`验证码错误`,server:`验证码的长度必须是6`}},
        valueIncorrect:{rc:40496,msg:{client:`验证码错误`,server:`验证码的值的格式不正确`}},
    },
    /*              dataUrl                      */
    dataUrl:{
        valueIncorrect:{rc:40498,msg:{client:`图片格式错误`,server:`图片的dataUrl不正确`}},
    },

    validateChooseFriendValue:{
        chooseFriendFieldValueArrayEleInvalidObjectId(fieldName){
            return {rc:40626,msg:{client:`参数错误`,server:`chooseFriend中，字段${fieldName}是数组objectId，其中有元素，格式不是objectId`}}
        },

    },
}

//40600～40700
const validatePartObjectIdEncrypted={
    common:{
        fieldNotMatchApplyRange:{rc:40600,msg:{client:`参数错误`,server:'字段不允许在当前applyRange时输入'}},
    },
    validateEditSubField:{
        editSubFromIsInvalidEncryptedObjectId:{rc:40602,msg:{client:`参数错误`,server:'editSub中，key from的类型为objectId的字段，加密值的格式不正确'}},
        editSubToIsInvalidEncryptedObjectId:{rc:40604,msg:{client:`参数错误`,server:'editSub中，key to的类型为objectId的字段，加密值的格式不正确'}},
        editSubEleArrayLengthExceed:{rc:40606,msg:{client:`参数错误`,server:'editSub中，key eleArray的长度超过rule中定义的最大长度'}},
        editSubEleArrayIsInvalidEncryptedObjectId:{rc:40608,msg:{client:`参数错误`,server:'editSub中，key eleArray中，类型为objectId的字段，加密值的格式不正确'}},
    },
    validateManipulateArray:{
        manipulateArraySubKeyLengthExceed(subKeyName){
            return {rc:40610,msg:{client:`参数错误`,server:`manipulateArray中，subKey ${subKeyName} 的长度超过rule中定义的最大长度`}}
        },
        manipulateArraySubKeyContainInvalidEncryptedObjectId(subKeyName){
            return {rc:40612,msg:{client:`参数错误`,server:`manipulateArray中，subKey ${subKeyName}，类型为objectId的字段，加密值的格式不正确`}}
        },
        // manipulateArraySubParRemoveContainInvalidObjectId:{rc:checkerBaseErrorCode+60,msg:{client:`参数错误`,server:'manipulateArray中，remove中，类型为objectId的字段，值的格式不正确'}},
    },
    validateRecordId:{
        recordIdIsInvalidEncryptedObjectId:{rc:40614,msg:{client:`参数错误`,server:'加密的recordId的格式不正确'}},
    },
    validateSingleField:{
        singleFieldLengthExceed:{rc:40616,msg:{client:`参数错误`,server:'singleField的长度超过rule中定义的最大长度'}},
        singleFieldArrayValueIsInvalidEncryptedObjectId:{rc:40618,msg:{client:`参数错误`,server:'single field的值是array，其中元素的类型为objectId的字段，但是加密值的格式不正确'}},
        singleFieldIsInvalidEncryptedObjectId:{rc:40620,msg:{client:`参数错误`,server:'single field的值的类型为objectId，但是加密值的格式不正确'}},
    },
    validateRecordInfo:{
        recordInfoFieldValueLengthExceed(fieldName){
            return {rc:40622,msg:{client:`参数错误`,server:`recordInfo中，字段${fieldName}的长度超过rule中定义的最大长度`}}
        },
        recordInfoFieldValueArrayEleInvalidEncryptedObjectId(fieldName){
            return {rc:40624,msg:{client:`参数错误`,server:`recordInfo中，字段${fieldName}是数组objectId，其中有元素，加密值的格式不正确`}}
        },
        recordInfoFieldValueInvalidEncryptedObjectId(fieldName){
            return {rc:40624,msg:{client:`参数错误`,server:`recordInfo中，字段${fieldName}是objectId，但其加密值的格式不正确`}}
        },
    },
    validateChooseFriend:{
        chooseFriendFieldValueArrayEleInvalidEncryptedObjectId(fieldName){
            return {rc:40626,msg:{client:`参数错误`,server:`chooseFriend中，字段${fieldName}是数组objectId，其中有元素，加密值的格式不正确`}}
        },
    },

/*    ifObjectIdCrypted:{


        // singleFieldValueContainInvalidObjectId:{rc:checkerBaseErrorCode+55,msg:{client:`参数错误`,server:'singleField中，类型为objectId，值的格式不正确'}},
        recordInfoContainInvalidObjectId:{rc:checkerBaseErrorCode+56,msg:{client:`参数错误`,server:'recordInfo中，类型为objectId的字段，值的格式不正确'}},




        // unSupportPart:{rc:checkerBaseErrorCode+58,msg:{client:`内部错误，请联系`,server:'recordInfo中，类型为objectId的字段，值的格式不正确'}}
    },*/
}

module.exports={
    validateRule,
    validateFormat,
    validateValue,

    validatePartObjectIdEncrypted,//检测part中，如果数据类型是objectId，那么判断是否加密了
}