/**
 * Created by wzhan039 on 2017-06-12.
 */
'use strict'
const assert=require('assert')
const testModule=require('../../../function/validateInput/validateHelper');
// var miscError=require('../../server/define/error/nodeError').nodeError.assistError
const validateHelperError=require('../../../constant/error/validateError').validateRule
/*          for generateRandomString test       */
const regex=require('../../../constant/regex/regex').regex
const serverDataType=require('../../../constant/enum/inputDataRuleType').ServerDataType
//var randomStringTypeEnum=require('../../server/define/enum/node').node.randomStringType
const moment=require('moment')


/*          数据类型的检测         */
describe('validateEventFormat', function() {
    let func=testModule.dataTypeCheck
    let result,value,tmp

    function formatDate(v){
        return moment(v).format('YYYY-MM-DD HH:mm:ss')
    }
    /*          isSetValue             */
    it(`value undefined`,function(done){
        assert.deepStrictEqual(func.isSetValue(undefined),false)
        done()
    })
    it(`value null`,function(done){
        assert.deepStrictEqual(func.isSetValue(null),false)
        done()
    })

    /*          isEmpty             */
    it(`value empty string`,function(done){
        assert.deepStrictEqual(func.isEmpty(""),true)
        done()
    })
    it(`value blank string`,function(done){
        assert.deepStrictEqual(func.isEmpty("       "),true)
        done()
    })
    it(`value empty array`,function(done){
        assert.deepStrictEqual(func.isEmpty([]),true)
        done()
    })
    it(`value empty object`,function(done){
        assert.deepStrictEqual(func.isEmpty({}),true)
        done()
    })
    it(`value not empty array`,function(done){
        assert.deepStrictEqual(func.isEmpty([1]),false)
        done()
    })
    it(`value not empty object`,function(done){
        assert.deepStrictEqual(func.isEmpty({a:1}),false)
        done()
    })

    /*          isString             */
    it(`value empty string`,function(done){
        assert.deepStrictEqual(func.isString(''),true)
        done()
    })
    it(`value blank string`,function(done){
        assert.deepStrictEqual(func.isString('     '),true)
        done()
    })
    it(`value int not string`,function(done){
        assert.deepStrictEqual(func.isString(123),false)
        done()
    })
    it(`value empty array not string`,function(done){
        assert.deepStrictEqual(func.isString([]),false)
        done()
    })
    it(`value empty object not string`,function(done){
        assert.deepStrictEqual(func.isString({}),false)
        done()
    })
    it(`value null not string`,function(done){
        assert.deepStrictEqual(func.isString(null),false)
        done()
    })
    it(`value undefined not string`,function(done){
        assert.deepStrictEqual(func.isString(undefined),false)
        done()
    })

    /*          isArray             */
    it(`value object not array`,function(done){
        assert.deepStrictEqual(func.isArray({}),false)
        done()
    })
    it(`value null not array`,function(done){
        assert.deepStrictEqual(func.isArray(null),false)
        done()
    })
    it(`value empty array is array`,function(done){
        assert.deepStrictEqual(func.isArray([]),true)
        done()
    })
    it(`value array with ele null is array`,function(done){
        assert.deepStrictEqual(func.isArray([null]),true)
        done()
    })

    /*          isObject          */
    it(`value  is object`,function(done){
        assert.deepStrictEqual(func.isObject({}),true)
        done()
    })
    it(`value  is array, not object`,function(done){
        assert.deepStrictEqual(func.isObject([]),false)
        done()
    })
    it(`value  is int, not object`,function(done){
        assert.deepStrictEqual(func.isObject(1),false)
        done()
    })
    it(`value  is null, not object`,function(done){
        assert.deepStrictEqual(func.isObject(null),false)
        done()
    })
    it(`value  is undefined, not object`,function(done){
        assert.deepStrictEqual(func.isObject(undefined),false)
        done()
    })
    it(`value  is date, not object`,function(done){
        assert.deepStrictEqual(func.isObject(Date.now()),false)
        done()
    })
    
    /*              idDate          */
    it(`value  is year in string`,function(done){
        assert.deepStrictEqual(formatDate(func.isDate('2016')),'2016-01-01 08:00:00')
        done()
    })
    it(`value date 2016-02-30`,function(done){
        assert.deepStrictEqual(formatDate(func.isDate('2016-02-30')),'2016-03-01 08:00:00')
        done()
    })
    it(`value date 2016-02-02 25:30`,function(done){
        assert.deepStrictEqual(func.isDate('2016-02-02 25:30'),false)
        done()
    })
    it(`value date 2016-02-02 23:30`,function(done){
        assert.deepStrictEqual(formatDate(func.isDate('2016-02-02 23:30')),'2016-02-02 23:30:00')
        done()
    })
    it(`value date 2016-02-02 23:30`,function(done){
        assert.deepStrictEqual(formatDate(func.isDate('2016-02-02 23:30')),'2016-02-02 23:30:00')
        done()
    })
    it(`value date 2016/02/02`,function(done){
        assert.deepStrictEqual(formatDate(func.isDate('2016/02/02')),'2016-02-02 00:00:00')
        done()
    })

    /*      isInt           */
    it(`value int with . convert to int`,function(done){
        assert.deepStrictEqual(func.isInt(123456789.0),123456789)
        done()
    })
    it(`value int with .1 fail convert to int`,function(done){
        assert.deepStrictEqual(func.isInt(123456789.1),false)
        done()
    })
    it(`value string with .0 fail convert to int`,function(done){
        assert.deepStrictEqual(func.isInt('123456789.0'),false)
        done()
    })
    it(`value string with .1 fail convert to int`,function(done){
        assert.deepStrictEqual(func.isInt('123456789.1'),false)
        done()
    })
    it(`value long int fail convert to int`,function(done){
        assert.deepStrictEqual(func.isInt(123456789123456789123456789123456789123456789123456789),false)
        done()
    })
    it(`value string with letter fail convert to int`,function(done){
        assert.deepStrictEqual(func.isInt('123a'),false)
        done()
    })
    it(`value array with ele int fail convert to int`,function(done){
        assert.deepStrictEqual(func.isInt([1]),false)
        done()
    })
    it(`value negative int`,function(done){
        assert.deepStrictEqual(func.isInt(-123),-123)
        done()
    })

    /*      isNumber           */
    it(`value array not number`,function(done){
        assert.deepStrictEqual(func.isNumber([]),false)
        done()
    })
    it(`value object not number`,function(done){
        assert.deepStrictEqual(func.isNumber({}),false)
        done()
    })
    it(`value empty string`,function(done){
        assert.deepStrictEqual(func.isNumber(''),false)
        done()
    })
    it(`value float with .`,function(done){
        assert.deepStrictEqual(func.isNumber(123456789.0),true)
        done()
    })
    it(`value string float with .`,function(done){
        assert.deepStrictEqual(func.isNumber('123456789.0'),true)
        done()
    })
    it(`value long number.`,function(done){
        assert.deepStrictEqual(func.isNumber(123456789123456789123456789123456789123456789123456789),true)
        done()
    })
    it(`value string long number.`,function(done){
        assert.deepStrictEqual(func.isNumber('123456789123456789123456789123456789123456789123456789'),true)
        done()
    })
    it(`value string negative long number.`,function(done){
        assert.deepStrictEqual(func.isNumber('-123456789123456789123456789123456789123456789123456789'),true)
        done()
    })

    /*          isFloat         */
    it(`value number with .0.`,function(done){
        assert.deepStrictEqual(func.isFloat(123456789.0),123456789)
        done()
    })
    it(`value string number with .0.`,function(done){
        assert.deepStrictEqual(func.isFloat('123456789.0'),123456789)
        done()
    })
    it(`value string negative  number with `,function(done){
        assert.deepStrictEqual(func.isFloat('-0.123456789'),-0.123456789)
        done()
    })
    it(`value invalid number with 2 . `,function(done){
        assert.deepStrictEqual(func.isFloat('-0.1.1'),false)
        done()
    })
    it(`value negative number with . `,function(done){
        assert.deepStrictEqual(func.isFloat(-123456789123456789123456789123456789123456789123456789.0),-123456789123456789123456789123456789123456789123456789.0)
        done()
    })
    it(`value array cant convert to float `,function(done){
        assert.deepStrictEqual(func.isFloat([1]),false)
        done()
    })
    /*          isStrictInt     */
    it(`isStrictInt: empty array not int `,function(done){
        assert.deepStrictEqual(func.isStrictInt([]),false)
        done()
    })
    it(`isStrictInt: empty object not int `,function(done){
        assert.deepStrictEqual(func.isStrictInt({}),false)
        done()
    })
    it(`isStrictInt: undefined not int `,function(done){
        assert.deepStrictEqual(func.isStrictInt(undefined),false)
        done()
    })
    it(`isStrictInt: null not int `,function(done){
        assert.deepStrictEqual(func.isStrictInt(null),false)
        done()
    })
    it(`isStrictInt: empty string not int `,function(done){
        assert.deepStrictEqual(func.isStrictInt(''),false)
        done()
    })
    it(`isStrictInt: blank string not int `,function(done){
        assert.deepStrictEqual(func.isStrictInt('      '),false)
        done()
    })
    it(`isStrictInt: string not int `,function(done){
        assert.deepStrictEqual(func.isStrictInt('1'),false)
        done()
    })
    it(`isStrictInt: string not int `,function(done){
        assert.deepStrictEqual(func.isStrictInt('1'),false)
        done()
    })
    it(`isStrictInt: decimal with .0 is int `,function(done){
        assert.deepStrictEqual(func.isStrictInt(1.0),true)
        done()
    })
    it(`isStrictInt: decimal with not 0 is not int `,function(done){
        assert.deepStrictEqual(func.isStrictInt(1.1),false)
        done()
    })
    it(`isStrictInt: large number is not int `,function(done){
        assert.deepStrictEqual(func.isStrictInt(999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999),false)
        done()
    })
    it(`isStrictInt: large negative number is not int `,function(done){
        assert.deepStrictEqual(func.isStrictInt(-999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999),false)
        done()
    })
    /*          isStrictFloat     */
    it(`isStrictFloat: empty array not float `,function(done){
        assert.deepStrictEqual(func.isStrictFloat([]),false)
        done()
    })
    it(`isStrictFloat: empty object not float `,function(done){
        assert.deepStrictEqual(func.isStrictFloat({}),false)
        done()
    })
    it(`isStrictFloat: undefined not float `,function(done){
        assert.deepStrictEqual(func.isStrictFloat(undefined),false)
        done()
    })
    it(`isStrictFloat: null not float `,function(done){
        assert.deepStrictEqual(func.isStrictFloat(null),false)
        done()
    })
    it(`isStrictFloat: empty string not float `,function(done){
        assert.deepStrictEqual(func.isStrictFloat(''),false)
        done()
    })
    it(`isStrictFloat: blank string not float `,function(done){
        assert.deepStrictEqual(func.isStrictFloat('      '),false)
        done()
    })
    it(`isStrictFloat: string not float `,function(done){
        assert.deepStrictEqual(func.isStrictFloat('1'),false)
        done()
    })
    it(`isStrictFloat: decimal with 0 is float `,function(done){
        assert.deepStrictEqual(func.isStrictFloat(1.0),true)
        done()
    })
    it(`isStrictFloat: decimal with not 0 is float `,function(done){
        assert.deepStrictEqual(func.isStrictFloat(1.1),true)
        done()
    })
    it(`isStrictInt: large number is float `,function(done){
        assert.deepStrictEqual(func.isStrictFloat(999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999),true)
        done()
    })
    it(`isStrictInt: large negative number is float `,function(done){
        assert.deepStrictEqual(func.isStrictFloat(-999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999),true)
        done()
    })
    it(`isStrictInt: small number is float `,function(done){
        assert.deepStrictEqual(func.isStrictFloat(0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),true)
        done()
    })
    it(`isStrictInt: small negative number is float `,function(done){
        assert.deepStrictEqual(func.isStrictFloat(-0.000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001),true)
        done()
    })
    /*          isStrictNumber     */
    it(`isStrictNumber: empty array not number `,function(done){
        assert.deepStrictEqual(func.isStrictNumber([]),false)
        done()
    })
    it(`isStrictNumber: empty object not number `,function(done){
        assert.deepStrictEqual(func.isStrictNumber({}),false)
        done()
    })
    it(`isStrictNumber: undefined not number `,function(done){
        assert.deepStrictEqual(func.isStrictNumber(undefined),false)
        done()
    })
    it(`isStrictNumber: null not number `,function(done){
        assert.deepStrictEqual(func.isStrictNumber(null),false)
        done()
    })
    it(`isStrictNumber: empty string not number `,function(done){
        assert.deepStrictEqual(func.isStrictNumber(''),false)
        done()
    })
    it(`isStrictNumber: blank string not number `,function(done){
        assert.deepStrictEqual(func.isStrictNumber('      '),false)
        done()
    })
    it(`isStrictFloat: string not number `,function(done){
        assert.deepStrictEqual(func.isStrictNumber('1'),false)
        done()
    })
    it(`isStrictFloat: with 0 is number `,function(done){
        assert.deepStrictEqual(func.isStrictNumber(1.0),true)
        done()
    })
    it(`isStrictFloat: with not 0 is number `,function(done){
        assert.deepStrictEqual(func.isStrictNumber(1.01),true)
        done()
    })
    /*      isPositive        */
    it(`large negative number  `,function(done){
        assert.deepStrictEqual(func.isPositive(-123456789123456789123456789123456789123456789123456789),false)
        done()
    })
    it(`small negative number  `,function(done){
        assert.deepStrictEqual(func.isPositive(-0.1),false)
        done()
    })
    //执行isPositive之前，需要确保输入值是个数值
/*    it(`invalid number cant test positive`,function(done){
        assert.deepStrictEqual(func.isPositive([1]),false)
        done()
    })*/
    it(`positive number`,function(done){
        assert.deepStrictEqual(func.isPositive('0.1'),true)
        done()
    })

    /*      isFolder        */
/*    it(`folder value incorrect  `,function(done){
        assert.deepStrictEqual(func.isFolder(-1),false)
        done()
    })*/
    it(`folder value not folder  `,function(done){
        assert.deepStrictEqual(func.isFolder('c:/Windows/win.ini'),false)
        done()
    })
    it(`folder value is folder  `,function(done){
        assert.deepStrictEqual(func.isFolder('c:/Windows'),true)
        done()
    })
    /*      isFile        */
/*    it(`value incorrect  `,function(done){
        assert.deepStrictEqual(func.isFile(-1),false)
        done()
    })*/
    it(`value not file  `,function(done){
        assert.deepStrictEqual(func.isFile('c:/Windows/'),false)
        done()
    })
    it(` value is file  `,function(done){
        assert.deepStrictEqual(func.isFile('c:/Windows/win.ini'),true)
        done()
    })
})


/***************************************************************************/
/*******     辅助函数，根据预定义dataType，检测value是否合格      **********/
/***************************************************************************/
describe('valueTypeCheck:format', function() {
    let func=testModule.valueTypeCheck
    let value,tmpDataType,result,tmp

    it(`unknown data type`,function(done){
        value='randomString'
        tmpDataType='noEnumDataType'
        assert.deepStrictEqual(func(value,tmpDataType),validateHelperError.unknownDataType)
        done();
    })
    it(`data type int`,function(done){
        value='randomString'
        tmpDataType='noEnumDataType'
        assert.deepStrictEqual(func(value,tmpDataType),validateHelperError.unknownDataType)
        done();
    })
})

describe('valueMatchRuleDefineCheck', function() {
    let func=testModule.valueMatchRuleDefineCheck
    let value,result,tmp


    /*          exceedMin/MaxLength exactLength(common part)         */
    it(`object not allow to test length`,function(done){
        value={}
        assert.deepStrictEqual(func.exceedMinLength(value,1),false)
        done();
    })
    it(`date not allow to test length`,function(done){
        value=Date.now()
        assert.deepStrictEqual(func.exceedMinLength(value,1),false)
        done();
    })

    it(`float: min/max/exact`,function(done){
        value=123.0 //js内部会当作123处理
        assert.deepStrictEqual(func.exceedMinLength(value,3),false)
        assert.deepStrictEqual(func.exceedMinLength(value,6),true)
        assert.deepStrictEqual(func.exceedMaxLength(value,2),true)
        assert.deepStrictEqual(func.exceedMaxLength(value,3),false)
        assert.deepStrictEqual(func.exactLength(value,3),true)
        assert.deepStrictEqual(func.exactLength(value,5),false)
        done();
    })
    it(`string: min/max/exact`,function(done){
        value='123.0'
        assert.deepStrictEqual(func.exceedMinLength(value,5),false)
        assert.deepStrictEqual(func.exceedMinLength(value,6),true)
        assert.deepStrictEqual(func.exceedMaxLength(value,5),false)
        assert.deepStrictEqual(func.exceedMaxLength(value,4),true)
        assert.deepStrictEqual(func.exactLength(value,5),true)
        assert.deepStrictEqual(func.exactLength(value,4),false)
        done();
    })
    it(`int: min/max/exact`,function(done){
        value=123
        assert.deepStrictEqual(func.exceedMinLength(value,3),false)
        assert.deepStrictEqual(func.exceedMinLength(value,4),true)
        assert.deepStrictEqual(func.exceedMaxLength(value,2),true)
        assert.deepStrictEqual(func.exceedMaxLength(value,3),false)
        assert.deepStrictEqual(func.exactLength(value,3),true)
        assert.deepStrictEqual(func.exactLength(value,4),false)
        done();
    })
    it(`array: min/max/exact`,function(done){
        value=[1,2,3]
        assert.deepStrictEqual(func.exceedMinLength(value,3),false)
        assert.deepStrictEqual(func.exceedMinLength(value,4),true)
        assert.deepStrictEqual(func.exceedMaxLength(value,2),true)
        assert.deepStrictEqual(func.exceedMaxLength(value,3),false)
        assert.deepStrictEqual(func.exactLength(value,3),true)
        assert.deepStrictEqual(func.exactLength(value,4),false)
        done();
    })

    /*          max/min         */
    it(`number min/max`,function(done){
        value=1234.0
        assert.deepStrictEqual(func.exceedMax(value,1235),false)
        assert.deepStrictEqual(func.exceedMax(value,1233),true)
        assert.deepStrictEqual(func.exceedMin(value,1233),false)
        assert.deepStrictEqual(func.exceedMin(value,1236),true)
        done();
    })
    /*          file/folder exist         */
    it(`number min/max`,function(done){
        value="C:/Windows/"
        assert.deepStrictEqual(func.isFileFolderExist(value),true)
        value="C:/Windows/win.ini"
        assert.deepStrictEqual(func.isFileFolderExist(value),true)
        value="C:/Windowssssssss/"
        assert.deepStrictEqual(func.isFileFolderExist(value),false)
        value="C:/Windows/win.inisssss"
        assert.deepStrictEqual(func.isFileFolderExist(value),false)
        done();
    })
})


/*describe('convertClientSearchValueToServerFormat', function() {
    let func=testModule.convertClientSearchValueToServerFormat
    let fkAdditionalFieldsConfig={
        //冗余字段（nested）的名称：具体冗余那几个字段
        //parentBillType:此字段为外键，需要冗余字段
        //relatedColl：外键对应的coll
        //nestedPrefix： 冗余字段一般放在nested结构中
        //荣誉字段是nested结构，分成2种格式，字符和数组，只是为了方便操作。 forSelect，根据外键find到document后，需要返回值的字段；forSetValue：需要设置value的冗余字段（一般是nested结构）
        parentBillType:{relatedColl:"billType",nestedPrefix:'parentBillTypeFields',forSelect:'name title',forSetValue:['name title']}

    }
    let value

    //输入查询参数转换成mongo的查询参数
    it(`convert search params to condition`,function(done){
        value={name:['val1','val2'],parentBillType:[{name:'val3'},{name:'val4'}]}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig),'{"$or":[{"name":{"$in":["val1","val2"]}},{"parentBillType.name":{"$in":["val3","val4"]}}]}')
        done();
    })
    it(`convert search params to condition`,function(done){
        value={name:['val1','val2'],parentBillType:[{name:'val3',title:'MIT'},{name:'val4'}]}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig),'{"$or":[{"name":{"$in":["val1","val2"]}},{"parentBillType.name":{"$in":["val3","val4"]}},{"parentBillType.title":{"$in":["MIT"]}}]}')
        done();
    })
})*/
