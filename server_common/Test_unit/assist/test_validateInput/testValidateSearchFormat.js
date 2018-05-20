/**
 * Created by wzhan039 on 2016-11-10.
 * 检测validateFunc中对input的format和value函数进行测试
 */
'use strict'
/*require("babel-polyfill");
 require("babel-core/register")*/
const request=require('supertest')
const assert=require('assert')
const ap=require('awesomeprint')
// const server_common_file_require=require('../../../../express/server_common_file_require')
const testModule=require('../../../function/validateInput/validateSearchFormat')//require('../../../server/function/validateInput/validateFormat');
const validateFormatError=require('../../../constant/error/validateError').validateFormat.searchParams//require('../../../server/constant/error/validateError').va
/*          for generateRandomString test       */
const regex=require('../../../constant/regex/regex').regex
const e_serverDataType=require('../../../constant/enum/inputDataRuleType').ServerDataType
const e_part=require('../../../constant/enum/nodeEnum').ValidatePart
const e_method=require('../../../constant/enum/nodeEnum').Method
const e_coll=require('../../../constant/genEnum/DB_Coll').Coll
const e_field=require('../../../constant/genEnum/DB_field').Field

const inputDataRuleType=require('../../../constant/enum/inputDataRuleType')
const e_searchRange=inputDataRuleType.SearchRange
const e_searchFieldName=inputDataRuleType.SearchFieldName
const e_fieldOp=inputDataRuleType.FieldOp
const e_arrayCompOp=inputDataRuleType.ArrayCompOp
const e_scalarCompOpForDigit=inputDataRuleType.ScalarCompOpForDigit
const e_scalarCompOpForString=inputDataRuleType.ScalarCompOpForString

const genInputDataRuleType=require('../../../constant/genEnum/inputDataRuleTypeValue')
const e_fieldOpArrayValue=genInputDataRuleType.FieldOp
const e_arrayCompOpValue=genInputDataRuleType.ArrayCompOp
const e_scalarCompOpForDigitValue=genInputDataRuleType.ScalarCompOpForDigit
const e_scalarCompOpForStringValue=genInputDataRuleType.ScalarCompOpForString

let allowColl=[e_coll.USER,e_coll.MEMBER_PENALIZE],allowSearchRange=[e_searchRange.ALL]


/***************************************************************************/
/***************   searchParamsNonIdCheck   *******************/
/***************************************************************************/
describe('searchParamsNonIdCheck', async function() {
    
    let searchParams,result
    let func = testModule.searchParamsNonIdCheck

    it(`searchParams must be object: cant be {}`,async function(){
        searchParams={}
        
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.partValueCantEmpty.rc)
        
    })

    it(`searchParams must be object: cant be {}`,async function(){
        searchParams={notExistColl:{}}
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.illegalCollName.rc)
    })

/*    it(`searchParams must be object: cant be {}`,async function(){
        searchParams={notExistColl:{}}
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.illegalCollName.rc)
    })*/
})

/***************************************************************************/
/***************   collValueFormatCheck   *******************/
/***************************************************************************/
describe('collValueFormatCheck', async function() {
    let func = testModule.searchParamsNonIdCheck
    let searchParams,result

    it(`collValue must be object: cant be undefined`,async function(){
        searchParams={
            [e_coll.USER]:undefined
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.collValueMustBeObject.rc)
    })
    it(`collValue must be object: cant be []`,async function(){
        searchParams={
            [e_coll.USER]:[]
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.collValueMustBeObject.rc)

    })

    it(`collValue contain 2 key: cant be 1 key`,async function(){
        searchParams={
            [e_coll.USER]:{key:'value'}
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.collValueContain2Key.rc)

    })

    it(`collValue contain 2 key: 1 key not enum`,async function(){
        searchParams={
            [e_coll.USER]:{
                key1:'value',
                [e_searchFieldName.FIELD_OP]:'test'
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.collValueKeyInvalid.rc)

    })
    it(`collValue contain 2 key: 1 key not enum`,async function(){
        searchParams={
            [e_coll.USER]:{
                [e_searchFieldName.SCALAR_VALUE]:'value',
                [e_searchFieldName.SEARCH_VALUE]:'test'
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.collValueKeyInvalid.rc)

    })
})

/***************************************************************************/
/***************   fieldOpCheck   *******************/
/***************************************************************************/
describe('fieldOpCheck', async function() {
    let func = testModule.searchParamsNonIdCheck
    let searchParams, result

    it(`fieldOp must be exist: cant be undefined`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:undefined,
                [e_searchFieldName.SEARCH_VALUE]:{},
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.fieldOpValueUndefined.rc)

    })
    it(`fieldOp must be enum`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:'anyvalue',
                [e_searchFieldName.SEARCH_VALUE]:{},
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.fieldOpValueInvalid.rc)

    })
})

/***************************************************************************/
/***************   searchValueFormatCheck   *******************/
/***************************************************************************/
describe('searchValueFormatCheck', async function() {
    let func = testModule.searchParamsNonIdCheck
    let searchParams, result

    it(`searchValue must be object: cant be undefined`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:undefined,
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.searchValueMustBeObject.rc)

    })
    it(`searchValue must be object: cant be []`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:[],
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.searchValueMustBeObject.rc)

    })

    it(`searchValue must contain 1 ~ 5 field: cant empty`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{},
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.searchValueFieldNumIncorrect.rc)

    })
    it(`searchValue must contain 1 ~ 5 field: cant exceed 5 field`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{k1:1,k2:2,k3:3,k4:4,k5:5,k6:6},
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.searchValueFieldNumIncorrect.rc)

    })


})

/***************************************************************************/
/***************   searchValueValidationCheck   *******************/
/***************************************************************************/
describe('searchValueValidationCheck', async function() {
    let func = testModule.searchParamsNonIdCheck
    let searchParams, result

    it(`searchValue not exist field: cant undefined`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{k1:1},
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.fieldUndefined.rc)

    })

    it(`searchValue field forbid search`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{[e_field.USER.PHOTO_HASH_NAME]:1},
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.fieldForbidForSearch.rc)

    })
})


/***************************************************************************/
/***************   fieldValueFormatCheck   *******************/
/***************************************************************************/
describe('fieldValueFormatCheck', async function() {
    let func = testModule.searchParamsNonIdCheck
    let searchParams, result

    it(`fieldValue must be object: cant undefined`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:undefined,
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.fieldValueMustBeObject.rc)

    })
    it(`fieldValue must be object: cant []`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:[],
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.fieldValueMustBeObject.rc)
    })

    it(`fieldValue must contain 2 keys`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{},
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.fieldValueMustContain2Key.rc)
    })
    it(`fieldValue must contain 2 keys`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        k1:1,
                        k2:2,
                        k3:3
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.fieldValueMustContain2Key.rc)
    })

    it(`fieldValue key must be enum`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        k1:1,
                        k2:2,
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.fieldValueKeyInvalid.rc)
    })
    it(`fieldValue key must be enum`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ALL],
                        [e_searchFieldName.ARRAY_VALUE]:[{
                            [e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForString.INCLUDE,
                            [e_searchFieldName.SCALAR_VALUE]:'a',
                        }],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,0)
    })
})


/***************************************************************************/
/***************   arrayCompOpCheck   *******************/
/***************************************************************************/
describe('arrayCompOpCheck', async function() {
    let func = testModule.searchParamsNonIdCheck
    let searchParams, result

    it(`arrayCompOp cant undefined: cant undefined`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:undefined,
                        [e_searchFieldName.ARRAY_VALUE]:[{
                            [e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForString.INCLUDE,
                            [e_searchFieldName.SEARCH_VALUE]:['a'],
                        }],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.arrayCompOpUndefined.rc)
    })
    it(`arrayCompOp must be array: cant {}`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:{},
                        [e_searchFieldName.ARRAY_VALUE]:[{
                            [e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForString.INCLUDE,
                            [e_searchFieldName.SEARCH_VALUE]:['a'],
                        }],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.arrayCompOpValueMustBeArray.rc)
    })
    it(`arrayCompOp cant empty: cant []`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[],
                        [e_searchFieldName.ARRAY_VALUE]:[{
                            [e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForString.INCLUDE,
                            [e_searchFieldName.SEARCH_VALUE]:['a'],
                        }],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.arrayCompOpValueEleNumberIncorrect.rc)
    })
    it(`arrayCompOp cant exceed 2 element:`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[1,2,3],
                        [e_searchFieldName.ARRAY_VALUE]:[{
                            [e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForString.INCLUDE,
                            [e_searchFieldName.SEARCH_VALUE]:['a'],
                        }],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.arrayCompOpValueEleNumberIncorrect.rc)
    })
    it(`arrayCompOp element must be enum:`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[1,2],
                        [e_searchFieldName.ARRAY_VALUE]:[{
                            [e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForString.INCLUDE,
                            [e_searchFieldName.SEARCH_VALUE]:['a'],
                        }],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.arrayCompOpInvalid.rc)
    })
    it(`arrayCompOp contain 1 element, must be ALL/ANY:`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.NONE],
                        [e_searchFieldName.ARRAY_VALUE]:[{
                            [e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForString.INCLUDE,
                            [e_searchFieldName.SEARCH_VALUE]:['a'],
                        }],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.arrayCompOp1OpMissMandatoryOp.rc)
    })
    it(`arrayCompOp contain 2 element, must be ALL+NONE/ANY+NONE:`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ALL,e_arrayCompOp.ANY],
                        [e_searchFieldName.ARRAY_VALUE]:[{
                            [e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForString.INCLUDE,
                            [e_searchFieldName.SEARCH_VALUE]:['a'],
                        }],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.arrayCompOp2OpMissMandatoryOp.rc)
    })
    it(`arrayCompOp OK:`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ALL,e_arrayCompOp.NONE],
                        [e_searchFieldName.ARRAY_VALUE]:[{
                            [e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForString.INCLUDE,
                            [e_searchFieldName.SCALAR_VALUE]:'a',
                        }],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,0)
    })
})

/***************************************************************************/
/***************   arrayValueCheck   *******************/
/***************************************************************************/
describe('arrayValueCheck', async function() {
    let func = testModule.searchParamsNonIdCheck
    let searchParams, result

    it(`arrayValue cant undefined: cant undefined`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ALL,e_arrayCompOp.NONE],
                        [e_searchFieldName.ARRAY_VALUE]:undefined,
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.arrayValueUndefined.rc)
    })
    it(`arrayValue must be array: cant {}`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ALL,e_arrayCompOp.NONE],
                        [e_searchFieldName.ARRAY_VALUE]:{},
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.arrayValueMustBeArray.rc)
    })

    it(`arrayValue cant empty when bool_allowSearchAll=false: cant []`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ALL,e_arrayCompOp.NONE],
                        [e_searchFieldName.ARRAY_VALUE]:[],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.arrayValueCantBeEmpty.rc)
    })

    it(`arrayValue cant empty when bool_allowSearchAll=false: cant []`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ALL,e_arrayCompOp.NONE],
                        [e_searchFieldName.ARRAY_VALUE]:[],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.arrayValueCantBeEmpty.rc)
    })

    it(`arrayValue contain more than 5 search element`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ALL,e_arrayCompOp.NONE],
                        [e_searchFieldName.ARRAY_VALUE]:[{},{},{},{},{},{}],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.arrayValueExceedSetting.rc)
    })

    it(`arrayValue search element must be object: cant undefined/null`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ALL,e_arrayCompOp.NONE],
                        [e_searchFieldName.ARRAY_VALUE]:[null],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.arrayValueEleMustBeObject.rc)
    })
    it(`arrayValue search element must contain 2 key`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ALL,e_arrayCompOp.NONE],
                        [e_searchFieldName.ARRAY_VALUE]:[{k1:1}],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.arrayValueEleKeyNumberIncorrect.rc)
    })
    it(`arrayValue search element must contain 2 key`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ALL,e_arrayCompOp.NONE],
                        [e_searchFieldName.ARRAY_VALUE]:[{k1:1,k2:2,k3:3}],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.arrayValueEleKeyNumberIncorrect.rc)
    })
    it(`arrayValue search element must contain 2 key, and each is enum`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ALL,e_arrayCompOp.NONE],
                        [e_searchFieldName.ARRAY_VALUE]:[{k1:1,[e_searchFieldName.SCALAR_VALUE]:2}],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.arrayValueEleKeyNameInvalid.rc)
    })
    it(`arrayValue search element must contain 2 key, and scalarCompOp must be enum`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ALL,e_arrayCompOp.NONE],
                        [e_searchFieldName.ARRAY_VALUE]:[{[e_searchFieldName.SCALAR_COMP_OP]:1,[e_searchFieldName.SCALAR_VALUE]:2}],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.arrayValueEleScalarCompOpInvalid.rc)
    })
    it(`arrayValue search element must contain 2 key, and scalarCompOp must be match field dataType`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ALL,e_arrayCompOp.NONE],
                        [e_searchFieldName.ARRAY_VALUE]:[{[e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForDigit.EQUAL,[e_searchFieldName.SCALAR_VALUE]:2}],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.arrayValueEleScalarCompOpInvalid.rc)
    })
    it(`arrayValue search element must contain 2 key, and scalarCompValue type must match inputRule`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ALL,e_arrayCompOp.NONE],
                        [e_searchFieldName.ARRAY_VALUE]:[{[e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForString.INCLUDE,[e_searchFieldName.SCALAR_VALUE]:2}],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.arrayValueEleScalarValueMisMatch.rc)
    })
})

/***************************************************************************/
/***************   arrayValueDigitLogicCheck   *******************/
/***************************************************************************/
describe('arrayValueDigitLogicCheck', async function() {
    let func = testModule.searchParamsNonIdCheck
    let searchParams, result

    it(`arrayValueStringLogicCheck：arrayValue cant contain duplicate scalarCompOp`, async function () {
        searchParams = {
            [e_coll.MEMBER_PENALIZE]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.MEMBER_PENALIZE.DURATION]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ALL,e_arrayCompOp.NONE],
                        [e_searchFieldName.ARRAY_VALUE]:[
                            {[e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForDigit.GREATER,[e_searchFieldName.SCALAR_VALUE]:1},
                            {[e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForDigit.GREATER,[e_searchFieldName.SCALAR_VALUE]:2},
                        ],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.scalarCompGteLteMaxOne.rc)
    })
    it(`arrayValueStringLogicCheck：arrayValue cant contain duplicate scalarCompOp`, async function () {
        searchParams = {
            [e_coll.MEMBER_PENALIZE]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.MEMBER_PENALIZE.DURATION]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ALL,e_arrayCompOp.NONE],
                        [e_searchFieldName.ARRAY_VALUE]:[
                            {[e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForDigit.GREATER,[e_searchFieldName.SCALAR_VALUE]:1},
                            {[e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForDigit.GREATER_EQUAL,[e_searchFieldName.SCALAR_VALUE]:2},
                        ],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.scalarCompGtGteLtLteCantCoexist.rc)
    })
    it(`arrayValueStringLogicCheck：arrayCompOp=ALL, only 1 eaual allow`, async function () {
        searchParams = {
            [e_coll.MEMBER_PENALIZE]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.MEMBER_PENALIZE.DURATION]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ALL,e_arrayCompOp.NONE],
                        [e_searchFieldName.ARRAY_VALUE]:[
                            {[e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForDigit.EQUAL,[e_searchFieldName.SCALAR_VALUE]:1},
                            {[e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForDigit.EQUAL,[e_searchFieldName.SCALAR_VALUE]:2},
                        ],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.scalarCompEqAtMostOneWhenScalarCompOpALL.rc)
    })
    it(`arrayValueStringLogicCheck：arrayCompOp=ALL, equal cant coexist with other compOp`, async function () {
        searchParams = {
            [e_coll.MEMBER_PENALIZE]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.MEMBER_PENALIZE.DURATION]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ALL,e_arrayCompOp.NONE],
                        [e_searchFieldName.ARRAY_VALUE]:[
                            {[e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForDigit.EQUAL,[e_searchFieldName.SCALAR_VALUE]:1},
                            {[e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForDigit.GREATER,[e_searchFieldName.SCALAR_VALUE]:2},
                        ],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.scalarCompEqCantCoexistWithGteLte.rc)
    })
    it(`arrayValueStringLogicCheck：arrayCompOp=ALL, gt value less than less`, async function () {
        searchParams = {
            [e_coll.MEMBER_PENALIZE]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.MEMBER_PENALIZE.DURATION]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ALL,e_arrayCompOp.NONE],
                        [e_searchFieldName.ARRAY_VALUE]:[
                            {[e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForDigit.LESS_EQUAL,[e_searchFieldName.SCALAR_VALUE]:1},
                            {[e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForDigit.GREATER,[e_searchFieldName.SCALAR_VALUE]:2},
                        ],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.scalarValueGteValueCantGreaterThanLteValue.rc)
    })
})


/***************************************************************************/
/***************   arrayValueStringLogicCheck   *******************/
/***************************************************************************/
describe('arrayValueStringLogicCheck', async function() {
    let func = testModule.searchParamsNonIdCheck
    let searchParams, result

    it(`arrayValueStringLogicCheck：arrayValue cant contain duplicate scalarValue`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ALL,e_arrayCompOp.NONE],
                        [e_searchFieldName.ARRAY_VALUE]:[
                            {[e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForString.INCLUDE,[e_searchFieldName.SCALAR_VALUE]:'zw'},
                            {[e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForString.INCLUDE,[e_searchFieldName.SCALAR_VALUE]:'zw'},
                        ],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.scalarValueForIncludeDuplicate.rc)
    })
    it(`arrayValueStringLogicCheck：when arrayCompOp=ALL, scalarCompOp cant be exact`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ALL,e_arrayCompOp.NONE],
                        [e_searchFieldName.ARRAY_VALUE]:[
                            {[e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForString.INCLUDE,[e_searchFieldName.SCALAR_VALUE]:'zw'},
                            {[e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForString.EXACT,[e_searchFieldName.SCALAR_VALUE]:'zw'},
                        ],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.scalarValueExactCantCoexist.rc)
    })
    it(`arrayValueStringLogicCheck：different scalarCompOp has same scalarValue`, async function () {
        searchParams = {
            [e_coll.USER]: {
                [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
                [e_searchFieldName.SEARCH_VALUE]:{
                    [e_field.USER.NAME]:{
                        [e_searchFieldName.ARRAY_COMP_OP]:[e_arrayCompOp.ANY,e_arrayCompOp.NONE],
                        [e_searchFieldName.ARRAY_VALUE]:[
                            {[e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForString.INCLUDE,[e_searchFieldName.SCALAR_VALUE]:'zw'},
                            {[e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForString.EXACT,[e_searchFieldName.SCALAR_VALUE]:'zw'},
                        ],
                    },
                },
            }
        }
        result=func({arr_allowCollNameForSearch:allowColl,obj_searchParams:searchParams,arr_currentSearchRange:allowSearchRange,bool_allowSearchAll:false})
        assert.deepStrictEqual(result.rc,validateFormatError.arrayValuesScalarValueHasDuplicateEle.rc)
    })
})