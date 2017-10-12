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
const valueTypeCheck=function(test){


    test.expect(9)



    value='0'
    tmpDataType=serverDataType.INT
    result=func(value,tmpDataType)
    test.equal(result,0,'data type int check failed');

    value='1.1'
    tmpDataType=serverDataType.FLOAT
    result=func(value,tmpDataType)
    test.equal(result,1.1,'data type float check failed');

    value='randomString'
    tmpDataType=serverDataType.STRING
    result=func(value,tmpDataType)
    test.equal(result,true,'data type string check failed');



    value=new Date('2016').getTime()
    tmpDataType=serverDataType.DATE
    result=func(value,tmpDataType)
    test.equal(result.toLocaleString(),new Date(value).toLocaleString(),'data type date check failed');

    value=[]
    tmpDataType=serverDataType.ARRAY
    result=func(value,tmpDataType)
    test.equal(result,true,'data type array check failed');

    value={}
    tmpDataType=serverDataType.OBJECT
    result=func(value,tmpDataType)
    test.equal(result,true,'data type object check failed');

    value='C:/Windows/System32/drivers/etc/hosts'
    tmpDataType=serverDataType.FILE
    result=func(value,tmpDataType)
    test.equal(result,true,'data type file check failed');

    value='C:/Program Files'
    tmpDataType=serverDataType.FOLDER
    result=func(value,tmpDataType)
    test.equal(result,true,'data type folder check failed');

    test.done()

}

const valueMatchRuleDefineCheck=function(test){
    let func=testModule.valueMatchRuleDefineCheck
    test.expect(35)

    let value,result,tmp


    /*          exceedMaxLength         */
    value=123.0
    result=func.exceedMaxLength(value,2)
    test.equal(result,true,'exceedMaxLength: float(number) length exceed failed')
    value=123.0
    result=func.exceedMaxLength(value,5)
    test.equal(result,false,'exceedMaxLength: float(number) length failed')
    value=123
    result=func.exceedMaxLength(value,2)
    test.equal(result,true,'exceedMaxLength: int(number) length exceed failed')
    value=123
    result=func.exceedMaxLength(value,3)
    test.equal(result,false,'exceedMaxLength: int(number) length failed')
    value='123.0'
    result=func.exceedMaxLength(value,4)
    test.equal(result,true,'exceedMaxLength: float(string) length exceed failed')
    value='123.0'
    result=func.exceedMaxLength(value,5)
    test.equal(result,false,'exceedMaxLength: float(string) length failed')
    value=[1]
    result=func.exceedMaxLength(value,0)
    test.equal(result,true,'exceedMaxLength: array length exceed failed')
    value=[1]
    result=func.exceedMaxLength(value,1)
    test.equal(result,false,'exceedMaxLength: array length exceed failed')
    value={}
    result=func.exceedMaxLength(value,0)
    test.equal(result,false,'exceedMaxLength: object length failed')

    /*          exceedMinLength         */
    value=123.0
    result=func.exceedMinLength(value,4)
    test.equal(result,true,'exceedMinLength: float(number) length exceed failed')
    value=123.0
    result=func.exceedMinLength(value,2)
    test.equal(result,false,'exceedMinLength: float(number) length failed')
    value=123
    result=func.exceedMinLength(value,4)
    test.equal(result,true,'exceedMinLength: int(number) length exceed failed')
    value=123
    result=func.exceedMinLength(value,3)
    test.equal(result,false,'exceedMinLength: int(number) length failed')
    value='123.0'
    result=func.exceedMinLength(value,6)
    test.equal(result,true,'exceedMinLength: float(string) length exceed failed')
    value='123.0'
    result=func.exceedMinLength(value,5)
    test.equal(result,false,'exceedMinLength: float(string) length failed')
    value=[1]
    result=func.exceedMinLength(value,2)
    test.equal(result,true,'exceedMinLength: array length exceed failed')
    value=[1]
    result=func.exceedMinLength(value,1)
    test.equal(result,false,'exceedMinLength: array length exceed failed')
    value={}
    result=func.exceedMinLength(value,0)
    test.equal(result,false,'exceedMinLength: object length failed')

    /*          exactLength         */
    value=123.0
    result=func.exactLength(value,3)    //js自动去掉小数点为0的位数（123.0实际为123）
    test.equal(result,true,'exactLength: float(number) length exact failed')
    value=123.0
    result=func.exactLength(value,6)
    test.equal(result,false,'exactLength: float(number) length failed')
    value=123
    result=func.exactLength(value,3)
    test.equal(result,true,'exactLength: int(number) length exact failed')
    value=123
    result=func.exactLength(value,4)
    test.equal(result,false,'exactLength: int(number) length failed')
    value='123.0'
    result=func.exactLength(value,5)
    test.equal(result,true,'exactLength: float(string) length exact failed')
    value='123.0'
    result=func.exactLength(value,4)
    test.equal(result,false,'exactLength: float(string) length failed')
    value=[1]
    result=func.exactLength(value,1)
    test.equal(result,true,'exactLength: array length exact failed')
    value=[1]
    result=func.exactLength(value,0)
    test.equal(result,false,'exactLength: array length exact failed')
    value={}
    result=func.exactLength(value,0)
    test.equal(result,false,'exactLength: object length failed')

/*    /!*          equalTo         *!/
    value=null
    result=func.equalTo(value,null)
    test.equal(result,true,'equalTo: null equal failed')
    value=undefined
    result=func.equalTo(value,undefined)
    test.equal(result,true,'equalTo: undefined equal failed')
    value={a:1}
    result=func.equalTo(value,{a:1})
    test.equal(result,false,'equalTo: object equal failed')
    value={a:1}
    tmp=value
    result=func.equalTo(value,tmp)
    test.equal(result,true,'equalTo: object reference equal failed')
    value=new Date('2016-02-02')
    tmp=new Date('2016-02-02')
    result=func.equalTo(value,tmp)
    test.equal(result,true,'equalTo: date equal failed')*/

    /*          exceedMax           */
    value=1234.0
    result=func.exceedMax(value,1235)
    test.equal(result,false,'exceedMax: exceedMax failed')
    value=1236.0
    result=func.exceedMax(value,1235)
    test.equal(result,true,'exceedMax: exceedMax failed')

    /*          exceedMin           */
    value=1234.0
    result=func.exceedMin(value,1235)
    test.equal(result,true,'exceedMin: exceedMin failed')
    value=1236.0
    result=func.exceedMin(value,1235)
    test.equal(result,false,'exceedMin: exceedMin failed')

    /*          ifFileFolderExist           */
    value='C:/Program Files'
    result=func.isFileFolderExist(value)
    test.equal(result,true,'isFileFolderExist: existed folder check failed')
    value='C:/Program Filessssss'
    result=func.isFileFolderExist(value)
    test.equal(result,false,'isFileFolderExist: not existed folder check failed')
    value='C:/Windows/System32/drivers/etc/hosts'
    result=func.isFileFolderExist(value)
    test.equal(result,true,'isFileFolderExist: existed file check failed')
    value='C:/Windows/System32/drivers/etc/hostssssss'
    result=func.isFileFolderExist(value)
    test.equal(result,false,'isFileFolderExist: not existed file check failed')

    test.done()
}


const convertClientSearchValueToServerFormat=function(test){
    test.expect(2)
    let func=testModule.convertClientSearchValueToServerFormat
    var fkAdditionalFieldsConfig={

            //冗余字段（nested）的名称：具体冗余那几个字段
            //parentBillType:此字段为外键，需要冗余字段
            //relatedColl：外键对应的coll
            //nestedPrefix： 冗余字段一般放在nested结构中
            //荣誉字段是nested结构，分成2种格式，字符和数组，只是为了方便操作。 forSelect，根据外键find到document后，需要返回值的字段；forSetValue：需要设置value的冗余字段（一般是nested结构）
            parentBillType:{relatedColl:"billType",nestedPrefix:'parentBillTypeFields',forSelect:'name title',forSetValue:['name title']}

    }
    let value={name:['val1','val2'],parentBillType:[{name:'val3'},{name:'val4'}]}
    let result=func(value,fkAdditionalFieldsConfig)
    // console.log(JSON.stringify(result))
    test.equal(JSON.stringify(result),'{"$or":[{"name":{"$in":["val1","val2"]}},{"parentBillType.name":{"$in":["val3","val4"]}}]}','format server msg failed')

    value={name:['val1','val2'],parentBillType:[{name:'val3',title:'MIT'},{name:'val4'}]}
    result=func(value,fkAdditionalFieldsConfig)
    // console.log(JSON.stringify(result))
    test.equal(JSON.stringify(result),'{"$or":[{"name":{"$in":["val1","val2"]}},{"parentBillType.name":{"$in":["val3","val4"]}},{"parentBillType.title":{"$in":["MIT"]}}]}','format server msg failed')

    test.done()
}




exports.validate={
     // dataTypeCheck,//数据类型检测
     // valueTypeCheck,
     // valueMatchRuleDefineCheck,
}