/**
 * Created by wzhan039 on 2016-11-10.
 * 检测validateFunc中对input的format和value函数进行测试
 */
'use strict'
/*require("babel-polyfill");
 require("babel-core/register")*/
const request=require('supertest')
const assert=require('assert')

// const server_common_file_require=require('../../../../express/server_common_file_require')
const testModule=require('../../../function/validateInput/validateFormat')//require('../../../server/function/validateInput/validateFormat');
const validateFormatError=require('../../../constant/error/validateError').validateFormat//require('../../../server/constant/error/validateError').va
/*          for generateRandomString test       */
const regex=require('../../../constant/regex/regex').regex
const e_serverDataType=require('../../../constant/enum/inputDataRuleType').ServerDataType
const e_part=require('../../../constant/enum/nodeEnum').ValidatePart
const e_method=require('../../../constant/enum/nodeEnum').Method

let rules ={
    billType:{
        name:{
            'chineseName': '单据类别',
            'type':e_serverDataType.STRING,
            'require': {define: true, error: {rc: 10041},mongoError:{rc:20041,msg:'单据类别不能为空'}},
            'minLength':{define:2,error:{rc:10042},mongoError:{rc:20042,msg:'单据类别至少2个字符'}},
            'maxLength':{define:40,error:{rc:10044},mongoError:{rc:20044,msg:'单据类别的长度不能超过40个字符'}},
        },
        inOut:{
            'chineseName': '支取类型',
            //'default':'male',
            'type':e_serverDataType.STRING,
            'require': {define: false, error: {rc: 10045},mongoError:{rc:20045,msg:'支取类型不能为空'}},
            'enum':{define:['in','out'],error:{rc:10046},mongoError:{rc:20046,msg:'支取类型不正确'}},
        },
        parentBillType:{
            'chineseName':'父类别',
            'type':e_serverDataType.OBJECT_ID,
            'require': {define: false, error: {rc: 10047},mongoError:{rc:20047,msg:'父类别不能为空'}},
            'format':{define:regex.objectId,error:{rc:10048},mongoError:{rc:20048,msg:'父类别的id格式不正确'}},//format == mongodb_match
        },
        age:{
            'chineseName':'年龄',
            'type':e_serverDataType.NUMBER,
            'require': {define: false, error: {rc: 10047},mongoError:{rc:20047,msg:'父类别不能为空'}},
            // 'format':{define:regex.objectId,error:{rc:10048},mongoError:{rc:20048,msg:'父类别的id格式不正确'}},//format == mongodb_match
        }
    }
}

//console.log(`test rule is ${JSON.stringify(rules.billType.age.type.toString())}`)
let fkAdditionalFieldsConfig =
    {
        //冗余字段（nested）的名称：具体冗余那几个字段
        //parentBillType:此字段为外键，需要冗余字段
        //relatedColl：外键对应的coll
        //nestedPrefix： 冗余字段一般放在nested结构中
        //荣誉字段是nested结构，分成2种格式，字符和数组，只是为了方便操作。 forSelect，根据外键find到document后，需要返回值的字段；forSetValue：需要设置value的冗余字段（一般是nested结构）
        parentBillType: {
            relatedColl: 'billType',
            relatedFields:['name','age'],//那些字段是允许作为搜索值
            // nestedPrefix: 'parentBillTypeFields',
            // forSelect: 'name age',
            // forSetValue: ['name', 'age']
        },
        notExistFiled:{
            relatedColl: 'billType',
            relatedFields:['name','age'],//那些字段是允许作为搜索值
        },
    }


/***************************************************************************/
/***************   validateReqBody   *******************/
/***************************************************************************/
describe('validateReqBody:format', function() {
    let func = testModule.validateReqBody
    let reqBody,result

    it(`inputValue must be object: cant be undefined`,function(done){
        assert.deepStrictEqual(func(reqBody).rc,validateFormatError.valuesUndefined.rc)
        done();
    })
    it(`inputValue must be object: cant be []`,function(done){
        reqBody=[]
        assert.deepStrictEqual(func(reqBody).rc,validateFormatError.reqBodyMustBeObject.rc)
        done();
    })
    it(`inputValue must be object: cant be null`,function(done){
        reqBody=null
        assert.deepStrictEqual(func(reqBody).rc,validateFormatError.valuesUndefined.rc)
        done();
    })
    it(`inputValue must be object: cant be [1]`,function(done){
        reqBody=[1]
        assert.deepStrictEqual(func(reqBody).rc,validateFormatError.reqBodyMustBeObject.rc)
        done();
    })
    it(`inputValue must be object: cant be ""`,function(done){
        reqBody=""
        assert.deepStrictEqual(func(reqBody).rc,validateFormatError.reqBodyMustBeObject.rc)
        done();
    })
})

describe('validateReqBody:values', function() {
    let func = testModule.validateReqBody
    let reqBody, result
    it(`inputValue must be object: values not exist`,function(done){
        reqBody={notValues:{}}
        assert.deepStrictEqual(func(reqBody).rc,validateFormatError.valuesUndefined.rc)
        done();
    })
    it(`inputValue must be object: values undefined`,function(done){
        reqBody={values:undefined}
        assert.deepStrictEqual(func(reqBody).rc,validateFormatError.valuesUndefined.rc)
        done();
    })
    it(`inputValue must be object: values null`,function(done){
        reqBody={values:null}
        assert.deepStrictEqual(func(reqBody).rc,validateFormatError.valuesUndefined.rc)
        done();
    })
    it(`inputValue must be object: values not object`,function(done){
        reqBody={values:[]}
        assert.deepStrictEqual(func(reqBody).rc,validateFormatError.valueMustBeObject.rc)
        done();
    })
})



/***************************************************************************/
/***************   e_partFormat   *******************/
/***************************************************************************/
describe('validate part', function() {
    let func=testModule.validatePartFormat
    let inputValue,expectPart
    // test.expect(12)


    it(`inputValue part exceed expectPart`,function(done){
        inputValue={[e_part.METHOD]:e_method.CREATE}
        expectPart=[]
        assert.deepStrictEqual(func(inputValue,expectPart).rc,validateFormatError.inputValuePartNumNotExpected.rc)
        done();
    })
    it(`expectPart unknown`,function(done){
        inputValue={[e_part.METHOD]:e_method.CREATE}
        expectPart=['unknownPart']
        assert.deepStrictEqual(func(inputValue,expectPart).rc,validateFormatError.inputValueExceptedPartNotValid.rc)
        done();
    })
    it(`miss part define in expectPart`,function(done){
        inputValue={[e_part.METHOD]:e_method.CREATE}
        expectPart=[e_part.RECORD_ID]
        assert.deepStrictEqual(func(inputValue,expectPart).rc,validateFormatError.inputValuePartNotMatch.rc)
        done();
    })


    it(`part:currentPage value is not int`,function(done){
        inputValue={[e_part.CURRENT_PAGE]:1.1}
        expectPart=[e_part.CURRENT_PAGE]
        assert.deepStrictEqual(func(inputValue,expectPart).rc,validateFormatError.inputValuePartCurrentPageValueFormatWrong.rc)
        done();
    })

    it(`part:recorderId value is null`,function(done){
        inputValue={[e_part.RECORD_ID]:null}
        expectPart=[e_part.RECORD_ID]
        assert.deepStrictEqual(func(inputValue,expectPart).rc,validateFormatError.inputValuePartRecordIdValueFormatWrong.rc)
        done();
    })
    it(`part:recorderId value is not string`,function(done){
        inputValue={[e_part.RECORD_ID]:1.1}
        expectPart=[e_part.RECORD_ID]
        assert.deepStrictEqual(func(inputValue,expectPart).rc,validateFormatError.inputValuePartRecordIdValueFormatWrong.rc)
        done();
    })
    it(`part:recorderId value is string, but not objectId`,function(done){
        inputValue={[e_part.RECORD_ID]:'1.1'}
        expectPart=[e_part.RECORD_ID]
        assert.deepStrictEqual(func(inputValue,expectPart).rc,validateFormatError.inputValuePartRecordIdValueFormatWrong.rc)
        done();
    })
    it(`part:recorderId value is undefined, not objectId`,function(done){
        inputValue={[e_part.RECORD_ID]:undefined}
        expectPart=[e_part.RECORD_ID]
        assert.deepStrictEqual(func(inputValue,expectPart).rc,validateFormatError.inputValuePartRecordIdValueFormatWrong.rc)
        done();
    })

    it(`part:recorderInfo value is not object`,function(done){
        inputValue={[e_part.RECORD_INFO]:'1.1'}
        expectPart=[e_part.RECORD_INFO]
        assert.deepStrictEqual(func(inputValue,expectPart).rc,validateFormatError.inputValuePartRecordInfoValueFormatWrong.rc)
        done();
    })

    it(`part:searchParams value is not object`,function(done){
        inputValue={[e_part.SEARCH_PARAMS]:'1.1'}
        expectPart=[e_part.SEARCH_PARAMS]
        assert.deepStrictEqual(func(inputValue,expectPart).rc,validateFormatError.inputValuePartSearchParamsValueFormatWrong.rc)
        done();
    })

    it(`part:recIdArr value is not array`,function(done){
        inputValue={[e_part.RECORD_ID_ARRAY]:'1.1'}
        expectPart=[e_part.RECORD_ID_ARRAY]
        assert.deepStrictEqual(func(inputValue,expectPart).rc,validateFormatError.inputValuePartRecIdArrValueFormatWrong.rc)
        done();
    })

    it(`part:singleField value is not object`,function(done){
        inputValue={[e_part.SINGLE_FIELD]:'1.1'}
        expectPart=[e_part.SINGLE_FIELD]
        assert.deepStrictEqual(func(inputValue,expectPart).rc,validateFormatError.inputValuePartSingleFieldValueFormatWrong.rc)
        done();
    })

    it(`part:'all 5 part check success'`,function(done){
        inputValue={'currentPage':1,'recordInfo':{},'searchParams':{},[e_part.RECORD_ID_ARRAY]:[],[e_part.SINGLE_FIELD]:{}}
        expectPart=[e_part.CURRENT_PAGE,e_part.RECORD_INFO,e_part.SEARCH_PARAMS,e_part.RECORD_ID_ARRAY,e_part.SINGLE_FIELD]
        assert.deepStrictEqual(func(inputValue,expectPart).rc,0)
        done();
    })

})


/***************************************************************************/
/***************  validateRecorderInfoFormat   *******************/
/***************************************************************************/
describe('validateCURecordInfoFormat', function() {
    let func=testModule.validateCURecordInfoFormat
    let value,rules


    it(`recordInfo empty object`,function(done){
        rules={field1:{}}//只是为了检测是否有对应的rule存在
        value={}
        assert.deepStrictEqual(func(value,rules).rc,validateFormatError.recordInfoCantEmpty.rc)
        done();
    })

    it(`recordInfo has more fields than rule`,function(done){
        rules={name:{}}//只是为了检测是否有对应的rule存在
        value={name:{value:'a'},age:{value:10}}
        assert.deepStrictEqual(func(value,rules).rc,validateFormatError.recordInfoFieldNumExceed.rc)
        done();
    })

    it(`recordInfo has fields not define in rule`,function(done){
        rules={name:{}}//只是为了检测是否有对应的rule存在
        value={age:{value:10}}
        assert.deepStrictEqual(func(value,rules).rc,validateFormatError.recordInfoFiledRuleNotDefine.rc)
        done();
    })

    it(`recordInfo:field value allow to be object`,function(done){
        rules={name:{
            type:e_serverDataType.OBJECT
        }}//只是为了检测是否有对应的rule存在
        value={name:{value:10}}
        assert.deepStrictEqual(func(value,rules).rc,0)
        done();
    })
})




/***************************************************************************/
/***************  validateRecorderInfoFormat   *******************/
/***************************************************************************/
describe('validateSingleFieldFormat', function() {
    let func = testModule.validateSingleFieldFormat
    let sigleField, rules, result

    it(`singleField is empty object`,function(done){
        rules={age:{}}//只是为了检测是否有对应的rule存在
        sigleField={}
        assert.deepStrictEqual(func(sigleField,rules).rc,validateFormatError.singleFieldMustOnlyOneField.rc)
        done();
    })
    it(`singleField key cant be id`,function(done){
        rules={name:{}}//只是为了检测是否有对应的rule存在
        sigleField={id:'asdf'}
        assert.deepStrictEqual(func(sigleField,rules).rc,validateFormatError.singleFieldCantContainId.rc)
        done();
    })
    it(`singleField key cant be undefined`,function(done){
        rules={name:{}}//只是为了检测是否有对应的rule存在
        sigleField={name:undefined}
        assert.deepStrictEqual(func(sigleField,rules).rc,validateFormatError.singleFieldValueCantUndefined.rc)
        done();
    })
    it(`singleField key no match rule`,function(done){
        rules={age:{}}//只是为了检测是否有对应的rule存在
        sigleField={name:1}
        assert.deepStrictEqual(func(sigleField,rules).rc,validateFormatError.singleFiledRuleNotDefine.rc)
        done();
    })

    it(`singleField key can be null`,function(done){
        rules={name:{}}//只是为了检测是否有对应的rule存在
        sigleField={name:null}
        assert.deepStrictEqual(func(sigleField,rules).rc,0)
        done();
    })
    it(`singleField value not object`,function(done){
        rules={age:{}}//只是为了检测是否有对应的rule存在
        sigleField={age:10}
        assert.deepStrictEqual(func(sigleField,rules).rc,0)
        done();
    })
})

/***************************************************************************/
/***************  part: searchParamsFormat   *******************/
/***************************************************************************/
describe('validateSearchParamsFormat', function() {
    let func = testModule.validateSearchParamsFormat
    //let error = miscError.validateFunc.validateInputSearchFormat

    // let searchSetting=require('../../server/config/global/globalSettingRule').searchSetting
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    let value,  maxSearchKeyNum=5

    it(`collName not exist in rules`,function(done){
        value={}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'notExistCollName',rules).rc,validateFormatError.searchParamsCollNoRelatedRule.rc)
        done();
    })
    it(`searchParams is {}`,function(done){
        value={}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,0)
        done()
    })
    it(`searchParams contain more fields than rules`,function(done){
        value={'field1':[{value:1}],'field2':[{value:1}],'field3':[{value:1}],'field4':[{value:1}],'field5':[{value:1}],'field6':[{value:1}],'field7':[{value:1}]}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,validateFormatError.searchParamsFieldsExceed.rc)
        done()
    })
    it(`searchParams filed not match in rules`,function(done){
        value={'field1':'anyValue'}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,validateFormatError.searchParamsFieldNoRelatedRule.rc)
        done()
    })

    it(`searchParams filed value cant be undefined`,function(done){
        value={'name':undefined}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,validateFormatError.searchParamsFiledValueCantEmpty.rc)
        done()
    })
    it(`searchParams filed value cant be null`,function(done){
        value={'name':null}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,validateFormatError.searchParamsFiledValueCantEmpty.rc)
        done()
    })
    it(`searchParams filed value cant be []`,function(done){
        value={'name':[]}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,validateFormatError.searchParamsFiledValueCantEmpty.rc)
        done()
    })
    it(`searchParams filed value cant be ""`,function(done){
        value={'name':""}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,validateFormatError.searchParamsFiledValueCantEmpty.rc)
        done()
    })

    it(`searchParams filed is fkField, the value should be object`,function(done){
        value={'parentBillType':1}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,validateFormatError.searchParamsFKFiledValueMustBeObject.rc)
        done()
    })

    it(`searchParams filed is fkField which defined in fkConfig, but not defined in rules`,function(done){
        value={'notExistFiled':{'notExistFiled':1}}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,validateFormatError.searchParamsFKNoRelatedRule.rc)
        done()
    })
    it(`searchParams filed is fkField which defined in fkConfig, but the related field is not in rules`,function(done){
        value={'parentBillType':{'notExistFiled':1}}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,validateFormatError.searchParamsFKRelatedFieldInvalid.rc)
        done()
    })
    it(`searchParams filed is fkField which defined in fkConfig, but the related field is not in fdConfig related fields`,function(done){
        value={'parentBillType':{'parentBillType':1}}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,validateFormatError.searchParamsFKRelatedFieldInvalid.rc)
        done()
    })
    it(`searchParams filed is fkField which defined in fkConfig, but the value is undefined`,function(done){
        value={'parentBillType':{'name':undefined}}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,validateFormatError.searchParamsFKFiledValueCantEmpty.rc)
        done()
    })
    it(`searchParams filed is fkField which defined in fkConfig, but the value is null`,function(done){
        value={'parentBillType':{'name':null}}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,validateFormatError.searchParamsFKFiledValueCantEmpty.rc)
        done()
    })

    it(`searchParams correct value`,function(done){
        value={
            name:[{value:'zw'},{value:'zw1'},{value:'zw2'}],
            parentBillType:{
                name:[{value:'zw'}],
                age:[{value:12,compOp:'gt'}]
            }
        }
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,0)
        done()
    })

})
/***************************************************************************/
/***************   singleSearchParams   *******************/
/***************************************************************************/
describe('validateSingleSearchParamsFormat', function() {
    // test.expect(2)
    let func = testModule.validateSingleSearchParamsFormat
    //let error = miscError.validateFunc.validateInputSearchFormat

    // let searchSetting=require('../../server/config/global/globalSettingRule').searchSetting
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    let singleSearchField,value
    let collRule=rules['billType']

    /*              对象的value必须是数组           */
    it(`singleSearchField is {}, not array`,function(done){
        singleSearchField={name:{}}
        assert.deepStrictEqual(func(singleSearchField['name'],collRule['name']).rc,validateFormatError.singleSearchParamsValueMustBeArray.rc)
        done();
    })
    it(`singleSearchField is null, not array`,function(done){
        singleSearchField={name:null}
        assert.deepStrictEqual(func(singleSearchField['name'],collRule['name']).rc,validateFormatError.singleSearchParamsValueMustBeArray.rc)
        done();
    })

    it(`singleSearchField is empty []`,function(done){
        singleSearchField={name:[]}
        assert.deepStrictEqual(func(singleSearchField['name'],collRule['name']).rc,validateFormatError.singleSearchParamsValueCantEmpty.rc)
        done();
    })

    it(`singleSearchField array length exceed defined`,function(done){
        singleSearchField = {name:[1, 2, 3, 4, 5, 6]}
        assert.deepStrictEqual(func(singleSearchField['name'],collRule['name']).rc,validateFormatError.singleSearchParamsValueLengthExceed.rc)
        done();
    })

    it(`singleSearchField array element is int, but should be  object`,function(done){
        singleSearchField = {name: [1]}
        assert.deepStrictEqual(func(singleSearchField['name'],collRule['name']).rc,validateFormatError.singleSearchParamsElementMustBeObject.rc)
        done();
    })
    it(`singleSearchField array element is string, but should be object`,function(done){
        singleSearchField = {name: ['']}
        assert.deepStrictEqual(func(singleSearchField['name'],collRule['name']).rc,validateFormatError.singleSearchParamsElementMustBeObject.rc)
        done();
    })
    it(`singleSearchField array element must be object`,function(done){
        singleSearchField = {name: [null]}
        assert.deepStrictEqual(func(singleSearchField['name'],collRule['name']).rc,validateFormatError.singleSearchParamsElementMustBeObject.rc)
        done();
    })

    /*              必须包含value这个key                                        */
    it(`singleSearchField array element must be object,and key number not exceed 2(value and comp)`,function(done){
        singleSearchField = {name: [{key1: 1, key2: 2, key3: 3}]}
        assert.deepStrictEqual(func(singleSearchField['name'],collRule['name']).rc,validateFormatError.singleSearchParamsElementKeysLengthExceed.rc)
        done();
    })

    it(`singleSearchField array element must be object,and contain key which name is value`,function(done){
        singleSearchField = {name: [{'notExistKey': 'zw'}]}
        assert.deepStrictEqual(func(singleSearchField['name'],collRule['name']).rc,validateFormatError.singleSearchParamsElementContainUnexpectKey.rc)
        done();
    })

    /*              类型为数字或者日期的字段，必须有compOp                      */
    it(`singleSearchField array element is number, must contain compOp`,function(done){
        singleSearchField = {age: [{value: 12}]}
        assert.deepStrictEqual(func(singleSearchField['age'],collRule['age']).rc,validateFormatError.singleSearchParamsElementMissKeyCompOp.rc)
        done();
    })
    it(`singleSearchField array element is number, compOp undefined`,function(done){
        singleSearchField = {age: [{'value': 12, 'compOp': 'notExist'}]}
        assert.deepStrictEqual(func(singleSearchField['age'],collRule['age']).rc,validateFormatError.singleSearchParamsElementCompOpWrong.rc)
        done();
    })
    //成功的输入
    it(`singleSearchField array element is number, compOp undefined`,function(done){
        let values = {
            name: [{value: 'zw'}, {value: 'zw1'}, {value: 'zw2'}],
            parentBillType: {
                name: [{value: 'zw'}],
                age: [{value: 12, compOp: 'gt'}]
            }
        }
        assert.deepStrictEqual(func(values.name,collRule['name']).rc,0)
        assert.deepStrictEqual(func(values.parentBillType.name,collRule['parentBillType']).rc,0)
        assert.deepStrictEqual(func(values.parentBillType.age,collRule['parentBillType']).rc,0)
        done();
    })

})

/*                  filterFieldValue    {field1:keyword} or {billType:{name:keyword}}
*   被测试的值，是part FILTER_FILED的值
*
* */
describe('validateFilterFieldValueFormat', function() {
    let func=testModule.validateFilterFieldValueFormat
    let value


    it(`filter field value not object`,function(done){
        value = []
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,validateFormatError.filterFieldValueMustBeObject.rc)
        done();
    })
    //2 value的field数量不为1
    it(`filter field value key must be 1`,function(done){
        value={name:{value:'a'},age:{value:10}}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,validateFormatError.filterFieldValueFieldNumMustHasOnly1Field.rc)
        done()
    })
    //3 value的field数量不为1
    it(`filter field value key must be 1`,function(done){
        value={}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,validateFormatError.filterFieldValueFieldNumMustHasOnly1Field.rc)
        done()
    })
    //4  value不能为空
    it(`filter field value must only be number or date`,function(done){
        value={name:null}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,validateFormatError.filterFieldValueNotSet.rc)
        done()
    })
    //5 key未在rule中定义
    it(`filter field value key no match rule in rules`,function(done){
        value={id:{value:10}}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,validateFormatError.filterFieldValueFieldNotInRule.rc)
        done()
    })
    //6  value必须是字符数字，对象
    it(`filter field value must only be number or date`,function(done){
        value={name:[]}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,validateFormatError.filterFieldValueTypeWrong.rc)
        done()
    })
    //7  正确的值
    it(`filter field value must only be number or date`,function(done){
        value={name:1}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,0)
        done()
    })

    /*                  外键                          */
    //8  fk的value必须是对象（存储对应的field：value）
    it(`filter field value key is fk, then the value must be object`,function(done){
        value={parentBillType:1}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,validateFormatError.filterFieldValueFKFieldMustBeObject.rc)
        done()
    })
    //9 外键value的field数量不为1
    it(`filter field value key is fk, then the value must be object`,function(done){
        value={parentBillType:{name:'a',age:10}}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,validateFormatError.filterFieldValueFKFieldMustHasOnly1Field.rc)
        done()
    })
    //10 value是object，但其中key未在fkConfig中定义
    it(`filter field value key is fk, but not configure in fkConfig`,function(done){
        value={parentBillType:{'any':1}}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,validateFormatError.filterFieldValueFKFieldRealtedFKNotDefine.rc)
        done()
    })
    //11 fk field未在rule中
    it(`filter field value key is fk, but not configure in fkConfig`,function(done){
        let rulesCopy=JSON.parse(JSON.stringify(rules))
        delete rulesCopy.billType.name
        value={parentBillType:{'name':1}}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rulesCopy).rc,validateFormatError.filterFieldValueFKFieldNoRelateField.rc)
        done()
    })
    //12 最终的值必须是字符/数字/日期
    it(`filter field value key, the value must be string/number/date`,function(done){
        value={parentBillType:{age:{}}}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,validateFormatError.filterFieldValueTypeWrong.rc)
        done()
    })
    //13 正确格式
    it(`filter field value key, the value must be string/number/date`,function(done){
        value={name:1}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).rc,0)
        done()
    })
})


/***************************************************************************/
/***************   editSubField   *******************/
/***************************************************************************/
describe('validateEditSubFieldFormat', function() {
    let func=testModule.validateEditSubFieldFormat
    let value
    let rule={}
    //1     value is undefined
    it(`edit sub field value is undefined, not object`,function(done){
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateFormatError.editSubFieldMustBeObject.rc)
        done()
    })
    //2      value is array
    it(`edit sub field value is array, not object`,function(done){
        value=[]
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateFormatError.editSubFieldMustBeObject.rc)
        done()
    })
    //1     field no related rule
    it(`edit sub field field no related rule`,function(done){
        value={f1:undefined}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateFormatError.editSubFieldNoRelatedRule.rc)
        done()
    })
    //1     field value not object
    it(`edit sub field field value not object`,function(done){
        value={f1:[]}
        rule={f1:{}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateFormatError.editSubFieldDataTypeIncorrect.rc)
        done()
    })
    //3      key number less than 2
    it(`edit sub field value key number must 2`,function(done){
        value={f1:{}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateFormatError.editSubFieldKeyNumberWrong.rc)
        done()
    })
    //4      key number larger than 3
    it(`edit sub field value key number must 2`,function(done){
        value={f1:{k1:1,k2:2,k3:3,k4:4}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateFormatError.editSubFieldKeyNumberWrong.rc)
        done()
    })
    //5      key not validate
    it(`edit sub field value key not predefined`,function(done){
        value={f1:{from:undefined,to:undefined,k3:undefined}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateFormatError.editSubFieldKeyNameWrong.rc)
        done()
    })
    //5      key eleArray must exist
    it(`edit sub field value eleArray must exist`,function(done){
        value={f1:{from:undefined,to:undefined}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateFormatError.eleArrayNotDefine.rc)
        done()
    })
    //无法测试，被上面的case覆盖
/*    //6      只有2个key，那么from/to 2者有其1
    it(`edit sub field value key number is 2, from or to exist`,function(done){
        value={f1:{from:undefined,eleArray:1}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateFormatError.editSubFieldFromOrToExistOne.rc)
        done()
    })*/
    //7    right result
    it(`right result`,function(done){
        value={f1:{from:undefined,eleArray:1}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,0)
        done()
    })

})

/***************************************************************************/
/***************   manipulateArray   *******************/
/***************************************************************************/
describe('validateManipulateArrayFormat', function() {
    let func=testModule.validateManipulateArrayFormat
    let value
    let rule={}
    //1     value is undefined
    it(`manipulateArray value is undefined, not object`,function(done){
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateFormatError.manipulateArray.manipulateArrayMustBeObject.rc)
        done()
    })
    //2      value is array
    it(`manipulateArray value is array, not object`,function(done){
        value=[]
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateFormatError.manipulateArray.manipulateArrayMustBeObject.rc)
        done()
    })
    //1     field no related rule
    it(`manipulateArray field no related rule`,function(done){
        value={f1:undefined}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateFormatError.manipulateArray.manipulateArrayNoRelatedRule.rc)
        done()
    })
    //1     field value not object
    it(`manipulateArray field value not object`,function(done){
        value={f1:[]}
        rule={f1:{}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateFormatError.manipulateArray.manipulateArrayFieldValueMustBeObject.rc)
        done()
    })
    //3      key number less than 2
    it(`manipulateArray value key number cant empty`,function(done){
        value={f1:{}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateFormatError.manipulateArray.manipulateArrayFieldKeyNumberWrong.rc)
        done()
    })
    //4      key number larger than 3
    it(`manipulateArray value key number must 2`,function(done){
        value={f1:{k1:1,k2:2,k3:3,k4:4}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateFormatError.manipulateArray.manipulateArrayFieldKeyNumberWrong.rc)
        done()
    })
    //5      key not validate
    it(`manipulateArray key not predefined`,function(done){
        value={f1:{k3:undefined}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateFormatError.manipulateArray.manipulateArrayFieldKeyNameWrong.rc)
        done()
    })
    //7    right result
    it(`right result`,function(done){
        value={f1:{remove:[1]}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,0)
        done()
    })

})


/***************************************************************************/
/***************   EventFormat   *******************/
/***************************************************************************/
//被测value是part EVENT的值
describe('validateEventFormat', function() {
    let func = testModule.validateEventFormat
    let value

    //1     value is undefined
    it(`event value is undefined, should be object`,function(done){
        assert.deepStrictEqual(func(value).rc,validateFormatError.eventMustBeObject.rc)
        done()
    })
    //2      value is array
    it(`event value is undefined, should be object`,function(done){
        value=[]
        assert.deepStrictEqual(func(value).rc,validateFormatError.eventMustBeObject.rc)
        done()
    })
    //3      key number less than 4
    it(`event value key number less than 4`,function(done){
        value={k1:undefined}
        assert.deepStrictEqual(func(value).rc,validateFormatError.eventKeyNumberWrong.rc)
        done()
    })
    //4      key number larger than 5
    it(`event value key number more than 5`,function(done){
        value={k1:undefined,k2:undefined,k3:undefined,k4:undefined,k5:undefined,k6:undefined,}
        assert.deepStrictEqual(func(value).rc,validateFormatError.eventKeyNumberWrong.rc)
        done()
    })
    //5      key not validate
    it(`event value key not defined`,function(done){
        value={k1:undefined,k2:undefined,k3:undefined,k4:undefined,k5:undefined}
        assert.deepStrictEqual(func(value).rc,validateFormatError.eventFieldKeyNameWrong.rc)
        done()
    })
    //6      4个key时，只有targetId 可以不存在
    it(`event value key number is 4, miss mandatory field`,function(done){
        value={eventId:undefined,sourceId:undefined,targetId:undefined,status:undefined}
        assert.deepStrictEqual(func(value).rc,validateFormatError.eventMandatoryKeyNotExist.rc)
        done()
    })
    //7     right result
    it(`event value key number is 4, miss mandatory field`,function(done){
        value={eventId:undefined,sourceId:undefined,cDate:undefined,status:undefined}
        assert.deepStrictEqual(func(value).rc,0)
        done()
    })
    //7     right result
    it(`event value key number is 4, miss mandatory field`,function(done){
        value={eventId:undefined,sourceId:undefined,targetId:undefined,cDate:undefined,status:undefined}
        assert.deepStrictEqual(func(value).rc,0)
        done()
    })
})

