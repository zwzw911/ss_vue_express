/**
 * Created by Ada on 2017/1/24.
 */
'use strict'
//require("babel-polyfill");
//require("babel-core/register")
const ap=require('awesomeprint')
const assert=require('assert')
const testModule=require('../../../function/validateInput/validateValue');
//const miscError=require('../../server/define/error/nodeError').nodeError.assistError
const validateValueError=require('../../../constant/error/validateError').validateValue
const validateHelperError=require('../../../constant/error/validateError').validateRule
/*          for generateRandomString test       */
const regex=require('../../../constant/regex/regex').regex
// const regex=require('../define/regex/regex').regex

const inputDataRuleType=require('../../../constant/enum/inputDataRuleType')
const e_serverDataType=inputDataRuleType.ServerDataType
const e_serverRuleType=inputDataRuleType.ServerRuleType
const e_otherRuleFiledName=inputDataRuleType.OtherRuleFiledName
const e_ruleFiledName=inputDataRuleType.RuleFiledName
const e_applyRange=inputDataRuleType.ApplyRange
// const e_requireType=inputDataRuleType.RequireType
// const inputRule=require('../../../server/constant/inputRule/clientInput').inputRule

const e_manipulateOperator=require('../../../constant/enum/nodeEnum').ManipulateOperator

let rules ={
    billType:{
        name:{
            'chineseName': '单据类别',
            [e_otherRuleFiledName.DATA_TYPE]:e_serverDataType.STRING,
            [e_otherRuleFiledName.APPLY_RANGE]:[e_applyRange.CREATE,e_applyRange.UPDATE_SCALAR],
            'require': {define: {[e_applyRange.CREATE]:true,[e_applyRange.UPDATE_SCALAR]:false}, error: {rc: 10041},mongoError:{rc:20041,msg:'单据类别不能为空'}},
            'minLength':{define:2,error:{rc:10042},mongoError:{rc:20042,msg:'单据类别至少2个字符'}},
            'maxLength':{define:10,error:{rc:10044},mongoError:{rc:20044,msg:'单据类别的长度不能超过40个字符'}},
        },
        inOut:{
            'chineseName': '支取类型',
            //'default':'male',
            [e_otherRuleFiledName.DATA_TYPE]:e_serverDataType.STRING,
            [e_otherRuleFiledName.APPLY_RANGE]:[e_applyRange.CREATE,e_applyRange.UPDATE_SCALAR],
            'require': {define: {[e_applyRange.CREATE]:true,[e_applyRange.UPDATE_SCALAR]:false}, error: {rc: 10045},mongoError:{rc:20045,msg:'支取类型不能为空'}},
            'enum':{define:['in','out'],error:{rc:10046},mongoError:{rc:20046,msg:'支取类型不正确'}},
        },
        parentBillType:{
            'chineseName':'父类别',
            [e_otherRuleFiledName.DATA_TYPE]:e_serverDataType.OBJECT_ID,
            [e_otherRuleFiledName.APPLY_RANGE]:[e_applyRange.CREATE,e_applyRange.UPDATE_SCALAR],
            'require': {define: {[e_applyRange.CREATE]:true,[e_applyRange.UPDATE_SCALAR]:false}, error: {rc: 10047},mongoError:{rc:20047,msg:'父类别不能为空'}},
            'format':{define:regex.objectId,error:{rc:10048},mongoError:{rc:20048,msg:'父类别的id格式不正确'}},//format == mongodb_match
        },
        age:{
            'chineseName':'年龄',
            [e_otherRuleFiledName.DATA_TYPE]:e_serverDataType.NUMBER,
            [e_otherRuleFiledName.APPLY_RANGE]:[e_applyRange.CREATE,e_applyRange.UPDATE_SCALAR],
            'require': {define: {[e_applyRange.CREATE]:true,[e_applyRange.UPDATE_SCALAR]:false}, error: {rc: 10049},mongoError:{rc:20049,msg:'父类别不能为空'}},
            'min':{define:18,error:{rc:10050},mongoError:{rc:20050,msg:'年龄不能小于18'}},
            'max':{define:100,error:{rc:10051},mongoError:{rc:20051,msg:'年龄不能超过100'}},
        },
        rembuiser:{
            'chineseName':'报销人',
            [e_otherRuleFiledName.DATA_TYPE]:[e_serverDataType.OBJECT_ID],
            [e_otherRuleFiledName.APPLY_RANGE]:[e_applyRange.CREATE],
            'require': {define: {[e_applyRange.CREATE]:true}, error: {rc: 10052},mongoError:{rc:20052,msg:'报销人不能为空'}},
            'format':{define:regex.objectId,error:{rc:10053},mongoError:{rc:20053,msg:'报销人的id格式不正确'}},//format == mongodb_match
            arrayMinLength:{define:1,error:{rc:10054},mongoError:{rc:20054,msg:'报销人的数量未达到最小数量'}},
            arrayMaxLength:{define:2,error:{rc:10055},mongoError:{rc:20055,msg:'报销人的数量超过最大数量'}},
        },
        inOutEnum:{
            'chineseName': '支取数组类型',
            //'default':'male',
            [e_otherRuleFiledName.DATA_TYPE]:[e_serverDataType.STRING],
            [e_otherRuleFiledName.APPLY_RANGE]:[e_applyRange.CREATE],
            'require': {define: {[e_applyRange.CREATE]:true}, error: {rc: 10056},mongoError:{rc:20056,msg:'支取类型不能为空'}},
            'enum':{define:['in','out'],error:{rc:10057},mongoError:{rc:20057,msg:'支取类型不正确'}},
            arrayMinLength:{define:0,error:{rc:10058},mongoError:{rc:20058,msg:'支取类型的数量未达到最小数量'}},
            arrayMaxLength:{define:2,error:{rc:10059},mongoError:{rc:20059,msg:'支取类型的数量超过最大数量'}},
        },
        test1:{
            'chineseName': '支取数组类型',
            //'default':'male',
            [e_otherRuleFiledName.DATA_TYPE]:e_serverDataType.INT,
            [e_otherRuleFiledName.APPLY_RANGE]:[e_applyRange.CREATE],
            'require': {define: {[e_applyRange.CREATE]:true}, error: {rc: 10056},mongoError:{rc:20056,msg:'支取类型不能为空'}},
            'unknownRule':{define:0,error:{rc:10060},mongoError:{rc:20058,msg:'支取类型的数量未达到最小数量'}}
        },
    }
}

//console.log(`test rule is ${JSON.stringify(rules.billType.age.type.toString())}`)
let fkConfig =
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
        }
    }

/*                  validateRecorderValue包含了create和update，对应recordInfo             */
describe('validateScalarInputValue', function() {
    let func=testModule.validateScalarInputValue
    let rule=rules.billType
    let value,expectRc,result

    /*             validateRecorderValue                 */
    //1, 使用rule中没有定义的applyRange
    it(`use not defined applyRange`,function(done){
        value={name:'10'}
        expectRc=validateValueError.fieldValueShouldNotExistSinceNoRelateApplyRange({fieldName:'name',applyRange:e_applyRange.UPDATE_ARRAY}).rc
        result=func({inputValue:value,collRule:rule,p_applyRange:e_applyRange.UPDATE_ARRAY})
        assert.deepStrictEqual(result.name.rc,expectRc)
        done()
    })
    //2, create时，rule中为require的字段，value中没有
    it(`miss required field name`,function(done){
        value={age:10}
        expectRc=rule.name.require.error.rc
        result=func({inputValue:value,collRule:rule,p_applyRange:e_applyRange.CREATE})
        assert.deepStrictEqual(result.name.rc,expectRc)
        done()
    })
    //3, requied field的值是null
    it(`required field name value is null`,function(done){
        value={name:null}
        expectRc=rule.name.require.error.rc
        result=func({inputValue:value,collRule:rule,p_applyRange:e_applyRange.CREATE})
        assert.deepStrictEqual(result.name.rc,expectRc)
        done()
    })
    //4, required field的值是undefined
    it(`required field name value is undefined`,function(done){
        value={name:undefined}
        expectRc=rule.name.require.error.rc
        result=func({inputValue:value,collRule:rule,p_applyRange:e_applyRange.CREATE})
        assert.deepStrictEqual(result.name.rc,expectRc)
        done()
    })



    /*          rule dataType类型是数组            */
    //1. 传入的数据不是数组
    it(`dataType not defined array`,function(done){
        value={rembuiser:1}
        expectRc=validateValueError.CUDTypeWrong.rc
        result=func({inputValue:value,collRule:rule,p_applyRange:e_applyRange.CREATE})
        assert.deepStrictEqual(result.rembuiser.rc,expectRc)
        done()
    })
    it(`array length less than arrar_min_length`,function(done){
        value={rembuiser:[]}
        expectRc=rule.rembuiser.arrayMinLength.error.rc
        result=func({inputValue:value,collRule:rule,p_applyRange:e_applyRange.CREATE})
        assert.deepStrictEqual(result.rembuiser.rc,expectRc)
        done()
    })
    it(`array length larger than arrar_max_length`,function(done){
        value={rembuiser:[1,2,3]}
        expectRc=rule.rembuiser.arrayMaxLength.error.rc
        result=func({inputValue:value,collRule:rule,p_applyRange:e_applyRange.CREATE})
        assert.deepStrictEqual(result.rembuiser.rc,expectRc)
        done()
    })
    it(`array ele data type cant be null/undefined`,function(done){
        value={rembuiser:[null,undefined]}
        expectRc=validateValueError.CUDTypeWrong.rc
        result=func({inputValue:value,collRule:rule,p_applyRange:e_applyRange.CREATE})
        assert.deepStrictEqual(result.rembuiser.rc,expectRc)
        done()
    })


    /*              validateSingleRecorderFieldValue            */
    //数据类型检查（如果是数组，则对数组元素进行检查）
    //[ObjectId]
    it(`data type is array && ObjectId, but the ele value type is int`,function(done){
        value={name:"asdf",rembuiser:[1]}
        expectRc=validateValueError.CUDTypeWrong.rc
        result=func({inputValue:value,collRule:rule,p_applyRange:e_applyRange.CREATE})
        // ap.inf('result',result)
        assert.deepStrictEqual(result.rembuiser.rc,expectRc)
        // assert.deepStrictEqual(func(value,rule).rc,validateValueError.CUDTypeWrong.rc)
        done()
    })
    it(`data type is array && ObjectId, but the ele value type is object`,function(done){
        value={name:"asdf",rembuiser:[{a:1}]}
        expectRc=validateValueError.CUDTypeWrong.rc
        result=func({inputValue:value,collRule:rule,p_applyRange:e_applyRange.CREATE})
        // ap.inf('result',result)
        assert.deepStrictEqual(result.rembuiser.rc,expectRc)
        // assert.deepStrictEqual(func(value,rule).rc,validateValueError.CUDTypeWrong.rc)
        done()
    })
    it(`data type is array && ObjectId, the ele value type is objectId`,function(done){
        value={name:"asdf",rembuiser:['58c0c32486e5a6d02657303f']}
        expectRc=0
        result=func({inputValue:value,collRule:rule,p_applyRange:e_applyRange.CREATE})
        // ap.inf('result',result)
        assert.deepStrictEqual(result.rembuiser.rc,expectRc)
        // assert.deepStrictEqual(func(value,rule).rc,validateValueError.CUDTypeWrong.rc)
        done()
    })

    //[enum]
    it(`data type is array && enumString, but field value type is string`,function(done){
        value={name:"asdf",rembuiser:['58c0c32486e5a6d02657303f'],inOutEnum:'1'}
        expectRc=validateValueError.CUDTypeWrong.rc
        result=func({inputValue:value,collRule:rule,p_applyRange:e_applyRange.CREATE})
        // ap.inf('result',result)
        assert.deepStrictEqual(result.inOutEnum.rc,expectRc)
        // assert.deepStrictEqual(func(value,rule).rc,validateValueError.CUDTypeWrong.rc)
        done()
    })
    it(`data type is array && enumString, but ele value type is int`,function(done){
        value={name:"asdf",rembuiser:['58c0c32486e5a6d02657303f'],inOutEnum:[1]}
        expectRc=validateValueError.CUDTypeWrong.rc
        result=func({inputValue:value,collRule:rule,p_applyRange:e_applyRange.CREATE})
        // ap.inf('result',result)
        assert.deepStrictEqual(result.inOutEnum.rc,expectRc)
        // assert.deepStrictEqual(func(value,rule).rc,validateValueError.CUDTypeWrong.rc)
        done()
    })
    it(`data type is array && enumString, but ele value invalid`,function(done){
        value={name:"asdf",rembuiser:['58c0c32486e5a6d02657303f'],inOutEnum:['any']}
        expectRc=rule.inOutEnum.enum.error.rc
        result=func({inputValue:value,collRule:rule,p_applyRange:e_applyRange.CREATE})
        // ap.inf('result',result)
        assert.deepStrictEqual(result.inOutEnum.rc,expectRc)
        // assert.deepStrictEqual(func(value,rule).rc,validateValueError.CUDTypeWrong.rc)
        done()
    })

    /*              other rule              */
    it(`format check`,function(done){
        value={name:"asdf",rembuiser:['asdfasdfsadfasdfasdf']}
        // expectRc=rule.rembuiser.format.error.rc
        expectRc=validateValueError.CUDTypeWrong.rc
        result=func({inputValue:value,collRule:rule,p_applyRange:e_applyRange.CREATE})
        // ap.inf('result',result)
        assert.deepStrictEqual(result.rembuiser.rc,expectRc)
        // assert.deepStrictEqual(func(value,rule).rc,validateValueError.CUDTypeWrong.rc)
        done()
    })

    it(`maxLength check`,function(done){
        value={name:"asdfasdf12345"}
        expectRc=rule.name.maxLength.error.rc
        result=func({inputValue:value,collRule:rule,p_applyRange:e_applyRange.CREATE})
        // ap.inf('result',result)
        assert.deepStrictEqual(result.name.rc,expectRc)
        // assert.deepStrictEqual(func(value,rule).rc,validateValueError.CUDTypeWrong.rc)
        done()
    })

    it(`minLength check with space`,function(done){
        value={name:"      "}
        expectRc=rule.name.minLength.error.rc
        result=func({inputValue:value,collRule:rule,p_applyRange:e_applyRange.CREATE})
        assert.deepStrictEqual(result.name.rc,expectRc)
        done()
    })
    it(`minLength check with empty string`,function(done){
        value={name:""}
        expectRc=rule.name.minLength.error.rc
        result=func({inputValue:value,collRule:rule,p_applyRange:e_applyRange.CREATE})
        assert.deepStrictEqual(result.name.rc,expectRc)
        done()
    })
    it(`minLength check`,function(done){
        value={name:"1"}
        expectRc=rule.name.minLength.error.rc
        result=func({inputValue:value,collRule:rule,p_applyRange:e_applyRange.CREATE})
        // ap.inf('result',result)
        assert.deepStrictEqual(result.name.rc,expectRc)
        done()
    })

    it(`min check`,function(done){
        value={age:1}
        expectRc=rule.age.min.error.rc
        result=func({inputValue:value,collRule:rule,p_applyRange:e_applyRange.CREATE})
        // ap.inf('result',result)
        assert.deepStrictEqual(result.age.rc,expectRc)
        done()
    })

    it(`max check`,function(done){
        value={age:101}
        expectRc=rule.age.max.error.rc
        result=func({inputValue:value,collRule:rule,p_applyRange:e_applyRange.CREATE})
        // ap.inf('result',result)
        assert.deepStrictEqual(result.age.rc,expectRc)
        done()
    })

    it(`unknown rule check`,function(done){
        value={test1:101}
        expectRc=0//rule.test1.max.error.rc
        result=func({inputValue:value,collRule:rule,p_applyRange:e_applyRange.CREATE})
        // ap.inf('result',result)
        assert.deepStrictEqual(result.test1.rc,expectRc)
        done()
    })

})

/*                  recorder id是简单part，直接在validateFormat中检测          */


/*                  recorder id arr           */
describe('validateRecIdArr', function() {
    let func=testModule.validateRecIdArr
    let maxLength=2,value

    //1, 数组长度为0
    it(`recIdArr length is 0`,function(done){
        value=[]
        assert.deepStrictEqual(func(value,maxLength).rc,validateValueError.recIdArrValueCantEmpty.rc)
        done()
    })
    //2. 数组长度超出定义
    it(`recIdArr length exceed maxLength`,function(done){
        value=[1,2,3]
        assert.deepStrictEqual(func(value,maxLength).rc,validateValueError.recIdArrValueExceedMax.rc)
        done()
    })
    //3, objectId格式不正确（null）
    it(`recIdArr ele data type is null, not string`,function(done){
        value=[null]
        assert.deepStrictEqual(func(value,maxLength).rc,validateValueError.recIdArrValueEleShouldString.rc)
        done()
    })
    //3, objectId格式不正确（undefined）
    it(`recIdArr ele data type is undefined, not string`,function(done){
        value=[undefined]
        assert.deepStrictEqual(func(value,maxLength).rc,validateValueError.recIdArrValueEleShouldString.rc)
        done()
    })
    //3, objectId格式不正确（int）
    it(`recIdArr ele data type is int, not string`,function(done){
        value=[10]
        assert.deepStrictEqual(func(value,maxLength).rc,validateValueError.recIdArrValueEleShouldString.rc)
        done()
    })
    //3, objectId格式不正确（object）
    it(`recIdArr ele data type is object, not string`,function(done){
        value=[{}]
        assert.deepStrictEqual(func(value,maxLength).rc,validateValueError.recIdArrValueEleShouldString.rc)
        done()
    })
    //3, objectId格式正确（objectId）
    it(`recIdArr ele data type is objectId`,function(done){
        value=['58c0c32486e5a6d02657303f','58c0c32486e5a6d02657303f']
        assert.deepStrictEqual(func(value,maxLength).rc,0)
        done()
    })
})


/*              value的值默认不是undefined或者null       */
describe('validateSingleRecorderFieldValue', function() {
    let func=testModule.validateSingleRecorderFieldValue
    // let func=testModule.validateSingleRecorderFieldValue
    // let func=testModule.validateUpdateRecorderValue
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    let rule,value,tmpDataType,result,tmp,fieldRule

    rule={
        mandatoryField1:{
            chineseName:'必填字段1',
            'require': {define: true, error: {rc: 10020},mongoError:{rc:20020,msg:'必填字段1不能为空'}},
            [e_otherRuleFiledName.DATA_TYPE]:e_serverDataType.STRING,
            'minLength':{define:2,error:{rc:10021},mongoError:{rc:20021,msg:'必填字段1名至少2个字符'}},
            'maxLength':{define:10,error:{rc:10022},mongoError:{rc:20022,msg:'必填字段1名最多20个字符'}},
        },
        optionalField1:{
            chineseName:'可选字段1',
            'require': {define: false, error: {rc: 10025},mongoError:{rc:20025,msg:'可选字段1不能为空'}},
            [e_otherRuleFiledName.DATA_TYPE]:e_serverDataType.INT,
            'min':{define:1,error:{rc:10026},mongoError:{rc:20026,msg:'可选字段1名至少2个字符'}},
            'max':{define:100,error:{rc:10027},mongoError:{rc:20027,msg:'可选字段1名最多20个字符'}},
            format:{define:regex.pageNum,error:{rc:10028},mongoError:{rc:20028,msg:'页数必须由1-4个数字组成'}}
        },
        typeUnknownField:{
            chineseName:'类型未知字段1',
            'require': {define: false, error: {rc: 10030},mongoError:{rc:20030,msg:'可选字段1不能为空'}},
            [e_otherRuleFiledName.DATA_TYPE]:'unknown',
        },
        typeObjectId:{
            chineseName:'字段objectId',
            'require': {define: false, error: {rc: 10040},mongoError:{rc:20040,msg:'可选字段1不能为空'}},
            [e_otherRuleFiledName.DATA_TYPE]:e_serverDataType.OBJECT_ID,
            'format':{define:regex.objectId,error:{rc:10041},mongoError:{rc:20041,msg:'所属部门的id格式不正确'}},
        },
        enumField:{
            chineseName:'枚举字段',
            'require': {define: false, error: {rc: 10050},mongoError:{rc:20050,msg:'可选字段1不能为空'}},
            [e_otherRuleFiledName.DATA_TYPE]:e_serverDataType.STRING,
            'enum':{define:['male','female'],error:{rc:10051},mongoError:{rc:20051,msg:'性别不正确'}},
        },
    }

    //1, create: require=true的字段输入为null
   /* it(`create:required field value is null`,function(done){
        value={mandatoryField1:null}
        ap.inf('func(value,rule)',func(value,rule))
        assert.deepStrictEqual(func(value,rule).rc,rule.mandatoryField1.require.error.rc)
        done()
    })
    //2, update: require=true的字段输入为null
    it(`update:required field value is null`,function(done){
        value={mandatoryField1:null}
        assert.deepStrictEqual(func(value,rule).rc,rule.mandatoryField1.require.error.rc)
        done()
    })
    //3, update: require=false的字段输入为null，不报错
    it(`create:optional field value is null is OK`,function(done){
        value={optionalField1:null}
        assert.deepStrictEqual(func(value,rule).rc,0)
        done()
    })*/
    //4. type unknown field
/*    it(`update: field data type unknown`,function(done){
        value={typeUnknownField:1}
        assert.deepStrictEqual(func(value,rule).rc,validateHelperError.unknownDataType.rc)
        done()
    })*/
    //5.  create:field value类型错误
    it(`create: field data type wrong`,function(done){
        value={mandatoryField1:1}
        fieldRule=rule.mandatoryField1
        assert.deepStrictEqual(func({fieldValue:Object.values(value)[0],fieldRule:rule[Object.keys(value)[0]],applyRange:e_applyRange.CREATE}).rc,validateValueError.CUDTypeWrong.rc)
        done()
    })
    //5.  update: field value类型错误
    it(`update: field data type wrong`,function(done){
        value={optionalField1:[1]}
        assert.deepStrictEqual(func({fieldValue:Object.values(value)[0],fieldRule:rule[Object.keys(value)[0]],applyRange:e_applyRange.UPDATE_SCALAR}).rc,validateValueError.CUDTypeWrong.rc)
        done()
    })
    //5.  update: field value类型错误
    it(`update: field data type wrong:not string`,function(done){
        value={typeObjectId:1}
        assert.deepStrictEqual(func({fieldValue:Object.values(value)[0],fieldRule:rule[Object.keys(value)[0]],applyRange:e_applyRange.UPDATE_SCALAR}).rc,validateValueError.CUDTypeWrong.rc)
        done()
    })
    it(`update: field data not match object`,function(done){
        value={typeObjectId:'asdf'}
        assert.deepStrictEqual(func({fieldValue:Object.values(value)[0],fieldRule:rule[Object.keys(value)[0]],applyRange:e_applyRange.UPDATE_SCALAR}).rc,rule.typeObjectId.format.error.rc)
        done()
    })
    //5.  update: format check
    it(`update: field data type correct, but format wrong`,function(done){
        value={optionalField1:111111}
        assert.deepStrictEqual(func({fieldValue:Object.values(value)[0],fieldRule:rule[Object.keys(value)[0]],applyRange:e_applyRange.UPDATE_SCALAR}).rc,rule.optionalField1.format.error.rc)
        done()
    })
    it(`update: field value null allow`,function(done){
        value={optionalField1:null}
        assert.deepStrictEqual(func({fieldValue:Object.values(value)[0],fieldRule:rule[Object.keys(value)[0]],applyRange:e_applyRange.UPDATE_SCALAR}).rc,0)
        done()
    })
/*    it(`update: mandatory field value null allow`,function(done){
        value={optionalField1:null}
        assert.deepStrictEqual(func({fieldValue:Object.values(value)[0],fieldRule:rule[Object.keys(value)[0]],applyRange:e_applyRange.UPDATE_SCALAR}).rc,0)
        done()
    })*/
    //5.  update: format check,for int, match format, not match min
    it(`update: field data type format,the field value is not match min`,function(done){
        value={optionalField1:0}
        // fieldRule=rule.optionalField1
        // ap.inf('Object.values(value)',Object.values(value))
        assert.deepStrictEqual(func({fieldValue:Object.values(value)[0],fieldRule:rule[Object.keys(value)[0]],applyRange:e_applyRange.UPDATE_SCALAR}).rc,rule.optionalField1.min.error.rc)
        done()
    })
    //5.  update: format check,for int, match format, not match max
    it(`update: field data type format,the field value is not match max`,function(done){
        value={optionalField1:999}
        assert.deepStrictEqual(func({fieldValue:Object.values(value)[0],fieldRule:rule[Object.keys(value)[0]],applyRange:e_applyRange.UPDATE_SCALAR}).rc,rule.optionalField1.max.error.rc)
        done()
    })

    //5.  update: format check, match format ok
    it(`update: field data type format,the field value is not match max`,function(done){
        value={optionalField1:99}
        assert.deepStrictEqual(func({fieldValue:Object.values(value)[0],fieldRule:rule[Object.keys(value)[0]],applyRange:e_applyRange.UPDATE_SCALAR}).rc,0)
        done()
    })

    //5.  create: format check, match format ok
    it(`create: field data type format,the field value is not match max`,function(done){
        value={mandatoryField1:'12345678901'}
        assert.deepStrictEqual(func({fieldValue:Object.values(value)[0],fieldRule:rule[Object.keys(value)[0]],applyRange:e_applyRange.CREATE}).rc,rule.mandatoryField1.maxLength.error.rc)
        done()
    })

    //5.  create: 检查minLength属性
    it(`create: field data type ,field value length exceed minLength`,function(done){
        value={mandatoryField1:'1'}
        assert.deepStrictEqual(func({fieldValue:Object.values(value)[0],fieldRule:rule[Object.keys(value)[0]],applyRange:e_applyRange.CREATE}).rc,rule.mandatoryField1.minLength.error.rc)
        done()
    })

    //5.  update: enum value invalid
    it(`update: field data type ,field value is invalid value`,function(done){
        value={enumField:'any'}
        assert.deepStrictEqual(func({fieldValue:Object.values(value)[0],fieldRule:rule[Object.keys(value)[0]],applyRange:e_applyRange.UPDATE_SCALAR}).rc,rule.enumField.enum.error.rc)
        done()
    })

    //5.  update: enum value valid
    it(`update: field data type ,field value is invalid value`,function(done){
        value={enumField:'male'}
        assert.deepStrictEqual(func({fieldValue:Object.values(value)[0],fieldRule:rule[Object.keys(value)[0]],applyRange:e_applyRange.UPDATE_SCALAR}).rc,0)
        done()
    })
})



// searchParamValue 的check已经由文件validateSearchFormat下的2个函数arrayValueStringLogicCheck/arrayValueDigitLogicCheck 完成
/*                  searchParams check              */
/*describe('validateSearchParamsValue', function() {
    let func=testModule.validateSearchParamsValue
    let value,result,tmp



    rules.billType.test={}
    rules.billType.test['type']='test'
    rules.billType.test['require']={define:false,error: {rc: 10049},mongoError:{rc:20049,msg:'test不能为空'}}


    rules.billType.formatField={
        chineseName:'可选字段1',
        'require': {define: false, error: {rc: 10025},mongoError:{rc:20025,msg:'可选字段1不能为空'}},
        [e_otherRuleFiledName.DATA_TYPE]:e_serverDataType.INT,
        'min':{define:1,error:{rc:10026},mongoError:{rc:20026,msg:'可选字段1名至少2个字符'}},
        'max':{define:100,error:{rc:10027},mongoError:{rc:20027,msg:'可选字段1名最多20个字符'}},
        format:{define:regex.pageNum,error:{rc:10028},mongoError:{rc:20028,msg:'页数必须由1-4个数字组成'}}
    }
    //console.log(`test rule is ${JSON.stringify(rules.billType.age.type.toString())}`)
    let fkAdditionalFieldsConfig=
        {
            //冗余字段（nested）的名称：具体冗余那几个字段
            //parentBillType:此字段为外键，需要冗余字段
            //relatedColl：外键对应的coll
            //nestedPrefix： 冗余字段一般放在nested结构中
            //荣誉字段是nested结构，分成2种格式，字符和数组，只是为了方便操作。 forSelect，根据外键find到document后，需要返回值的字段；forSetValue：需要设置value的冗余字段（一般是nested结构）
            parentBillType:{relatedColl:'billType',nestedPrefix:'parentBillTypeFields',forSelect:'name age',forSetValue:['name','age']}
        }

    //search value:field value is null, return error
    it(`search field is fk, value is null, return error`,function(done){
        value={'parentBillType':{name:[{value:null}]}}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).parentBillType.name.rc,validateValueError.SValueEmpty.rc)
        done()
    })

    //search value exceed maxLength, delete, and return rc:0
    it(`search field is fk, value is null, return rc:0 directly`,function(done){
        value={'name':[{value:'012345678901234567890012'}]}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).name.rc,0)
        done()
    })

    //search value field is fk, which value exceed maxLength, delete, and return rc:0
    it(`search field is fk, value exceed maxLength, delete, return rc:0 directly`,function(done){
        value={'parentBillType':{name:[{value:'012345678901234567890012'}]}}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).parentBillType.name.rc,0)
        done()
    })

    //search field value is undefined（stop search）
    it(`search field value undefined( stop search)`,function(done){
        value={'age':[{value:undefined}]}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).age.rc,validateValueError.SValueEmpty.rc)
        done()
    })
    it(`search field value null( stop search)`,function(done){
        value={'age':[{value:null}]}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).age.rc,validateValueError.SValueEmpty.rc)
        done()
    })
    it(`search field value empty string( stop search)`,function(done){
        value={'name':[{value:""}]}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).name.rc,validateValueError.SValueEmpty.rc)
        done()
    })
    it(`search field value blank string( stop search)`,function(done){
        value={'name':[{value:"     "}]}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).name.rc,validateValueError.SValueEmpty.rc)
        done()
    })
    //search value is [], should return error
    it(`search value is empty array`,function(done){
        value={'age':{value:[]}}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).age.rc,validateValueError.SValueEmpty.rc)
        done()
    })



    //unknown search field
    it(`search field not defined in rule(should failed, due to rule check should in format check)`,function(done){
        value={'test':[{value:'a'}]}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).test.rc,validateHelperError.unknownDataType.rc)
        done()
    })

    //wrong search field data type
    it(`search field data type wrong`,function(done){
        value={'age':[{value:'a'}]}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).age.rc,validateValueError.STypeWrong.rc)
        done()
    })

    //wrong search field rule check:format
    it(`search field data type wrong, format check`,function(done){
        value={'formatField':[{value:12345}]}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).formatField.rc,rules.billType.formatField.format.error.rc)
        done()
    })

    //wrong search field data type:enum
    it(`search field field rule check:enum`,function(done){
        value={'inOut':[{value:'notEnum'}]}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).inOut.rc,rules.billType.inOut.enum.error.rc)
        done()
    })

    //minLength不检查
    it(`search field value minLength not check`,function(done){
        value={'parentBillType':{
            name:[{value:'a'}]
        }}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).parentBillType.name.rc,0)
        done()
    })

    //min不检查
    it(`search field value min not check`,function(done){
        value={'parentBillType':{
            name:[{value:'a'}],
            age:[{value:101,compOp:'gt'}]
        }}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).parentBillType.age.rc,0)
        done()
    })

    //max不再检查
    it(`search field value min not check`,function(done){
        value={'parentBillType':{
            name:[{value:'a'}],
            age:[{value:1,compOp:'gt'}]
        }}
        assert.deepStrictEqual(func(value,fkAdditionalFieldsConfig,'billType',rules).parentBillType.age.rc,0)
        done()
    })
})*/

/**     暂时不需要       **/
/*describe('validateFilterFieldValue', function() {
    let func=testModule.validateFilterFieldValue
    let value,result,collName='billType'

//1 普通字段，字符，超出maxLength
    it(`filter field value exceed maxLength`,function(done){
        value={name:'123456789012345687901234567890123456879012345678901234568790'}
        assert.deepStrictEqual(func(value,fkConfig,collName,rules).rc,validateValueError.filterFieldValueOutRange.rc)
        done()
    })

    //2 普通字段type不对(因为和searchParams复用一个函数检测，所以返回值是STypeWrong)
    it(`filter field value exceed maxLength `,function(done){
        value={name:1}
        assert.deepStrictEqual(func(value,fkConfig,collName,rules).rc,validateValueError.STypeWrong.rc)
        done()
    })
    //3 外键字段，字符，超出maxLength
    it(`filter field is fk, which value exceed maxLength`,function(done){
        value={parentBillType:{name:'123456789012345687901234567890123456879012345678901234568790'}}
        assert.deepStrictEqual(func(value,fkConfig,collName,rules).rc,validateValueError.filterFieldValueOutRange.rc)
        done()
    })
    //4 外键字段type不对(因为和searchParams复用一个函数检测，所以返回值是STypeWrong)
    it(`filter field value exceed maxLength `,function(done){
        value={parentBillType:{name:1}}
        assert.deepStrictEqual(func(value,fkConfig,collName,rules).rc,validateValueError.STypeWrong.rc)
        done()
    })
})*/

/***************************************************************************/
/***************   editSubField   *******************/
/***************************************************************************/
describe('validateEditSubFieldValue', function() {
    let func = testModule.validateEditSubFieldValue
    let result, value, rule={f1:{
        [e_otherRuleFiledName.DATA_TYPE]: [e_serverDataType.OBJECT_ID],
        // 'arrayMaxLength': {define: 100, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含100个好友`}},
    }}

    it(`editSubField rule data type not array`,function(done){
        rule={f1:{
            [e_otherRuleFiledName.DATA_TYPE]: e_serverDataType.INT,
            'arrayMaxLength': {define: 2, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含2个好友`}},
            // [e_serverRuleType.MIN]:{define: 2, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含2个好友`}},
            // [e_serverRuleType.MAX]:{define: 4, error: {rc: 104232}, mongoError: {rc: 20423, msg: `好友分组最多包含2个好友`}},
        }}

        value={f1:{eleArray:[3]}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateValueError.fieldDataTypeNotArray.rc)
        // value={f1:{eleArray:[5]}}
        // assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,rule.f1[e_serverRuleType.MAX][`error`][`rc`])
        done()
    })

    //1 field rule not define arrayMaxLength
    it(`editSubField field rule not define arrayMaxLength`,function(done){
        value={f1:{from:1,eleArray:[]}}
        rule={f1:{
            [e_otherRuleFiledName.DATA_TYPE]: [e_serverDataType.OBJECT_ID],
            // 'arrayMaxLength': {define: 100, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含100个好友`}},
        }}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateValueError.arrayMaxLengthUndefined.rc)
        rule={f1:{
            [e_otherRuleFiledName.DATA_TYPE]: [e_serverDataType.OBJECT_ID],
            'arrayMaxLength': {define: 2, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含2个好友`}},
        }}
        done()
    })

//1 from not objectId
    it(`editSubField from value undefined must be objectId `,function(done){
        value={f1:{from:undefined}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateValueError.fromMustBeObjectId.rc)
        done()
    })
    it(`editSubField from value number must be objectId `,function(done){
        value={f1:{from:123456789012345678901234}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateValueError.fromMustBeObjectId.rc)
        done()
    })
    //2 to not objectId
    it(`editSubField to undefined must be objectId `,function(done){
        value={f1:{to:undefined}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateValueError.toMustBeObjectId.rc)
        done()
    })
    it(`editSubField to number must be objectId `,function(done){
        value={f1:{to:123456789012345678901234}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateValueError.toMustBeObjectId.rc)
        done()
    })


    //3 eleArray not array
    it(`editSubField key eleArray must be array`,function(done){
        value={f1:{eleArray:undefined}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateValueError.eleArrayMustBeArray.rc)
        done()
    })

    //4 eleArray not array
    it(`editSubField key eleArray must be array`,function(done){
        value={f1:{eleArray:{}}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateValueError.eleArrayMustBeArray.rc)
        done()
    })
    //6 eleArray不能为空
    it(`editSubField key eleArray cant be empty array`,function(done){
        value={f1:{eleArray:[]}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateValueError.eleArrayCantEmpty.rc)
        done()
    })
    // eleArray元素数量超过maxArrayMax
    it(`editSubField key eleArray length exceed maxArrayMax`,function(done){
        value={f1:{eleArray:[1,2,3]}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateValueError.eleArrayEleNumExceed.rc)
        done()
    })
    //5 eleArray中每个元素必须和rule中匹配
    it(`editSubField key eleArray element must match rule type`,function(done){
        value={f1:{eleArray:[1]}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateValueError.eleArrayDataTypeWrong.rc)
        done()
    })


    //7 right result
    it(`editSubField key eleArray cant be empty array`,function(done){
        value={f1:{eleArray:['58c0c32486e5a6d02657303f']}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,0)

        done()
    })


    it(`editSubField key eleArray element not match rule`,function(done){

        rule={f1:{
                [e_otherRuleFiledName.DATA_TYPE]: [e_serverDataType.INT],
                'arrayMaxLength': {define: 2, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含2个好友`}},
                [e_serverRuleType.MIN]:{define: 2, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含2个好友`}},
                [e_serverRuleType.MAX]:{define: 4, error: {rc: 104232}, mongoError: {rc: 20423, msg: `好友分组最多包含2个好友`}},
            }}

        value={f1:{eleArray:[1]}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,rule.f1[e_serverRuleType.MIN][`error`][`rc`])
        value={f1:{eleArray:[5]}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,rule.f1[e_serverRuleType.MAX][`error`][`rc`])
        done()
    })


})



/***************************************************************************/
/***************   validateManipulateArrayValue   *******************/
/***************************************************************************/
describe('validateManipulateArrayValue', function() {
    let func = testModule.validateManipulateArrayValue


    let result, value, rule={f1:{
            [e_otherRuleFiledName.DATA_TYPE]: [e_serverDataType.OBJECT_ID],
            // 'arrayMaxLength': {define: 100, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含100个好友`}},
        }}

    it(`manipulateArray rule data type not array`,function(done){
        rule={f1:{
                [e_otherRuleFiledName.DATA_TYPE]: e_serverDataType.INT,
                'arrayMaxLength': {define: 2, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含2个好友`}},
                // [e_serverRuleType.MIN]:{define: 2, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含2个好友`}},
                // [e_serverRuleType.MAX]:{define: 4, error: {rc: 104232}, mongoError: {rc: 20423, msg: `好友分组最多包含2个好友`}},
            }}

        value={f1:{[e_manipulateOperator.ADD]:[3]}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateValueError.manipulateArray.fieldDataTypeNotArray.rc)
        // value={f1:{eleArray:[5]}}
        // assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,rule.f1[e_serverRuleType.MAX][`error`][`rc`])
        done()
    })

    //1 field rule not define arrayMaxLength
    it(`manipulateArray field rule not define arrayMaxLength`,function(done){
        value={f1:{[e_manipulateOperator.ADD]:[1],[e_manipulateOperator.REMOVE]:[]}}
        rule={f1:{
                [e_otherRuleFiledName.DATA_TYPE]: [e_serverDataType.OBJECT_ID],
                // 'arrayMaxLength': {define: 100, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含100个好友`}},
            }}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateValueError.manipulateArray.arrayMaxLengthUndefined.rc)
        rule={f1:{
                [e_otherRuleFiledName.DATA_TYPE]: [e_serverDataType.OBJECT_ID],
                'arrayMaxLength': {define: 2, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含2个好友`}},
            }}
        done()
    })

/*
//1 from not objectId
    it(`manipulateArray from value undefined must be objectId `,function(done){
        value={f1:{from:undefined}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateValueError.fromMustBeObjectId.rc)
        done()
    })
    it(`manipulateArray from value number must be objectId `,function(done){
        value={f1:{from:123456789012345678901234}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateValueError.fromMustBeObjectId.rc)
        done()
    })
    //2 to not objectId
    it(`manipulateArray to undefined must be objectId `,function(done){
        value={f1:{to:undefined}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateValueError.toMustBeObjectId.rc)
        done()
    })
    it(`manipulateArray to number must be objectId `,function(done){
        value={f1:{to:123456789012345678901234}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateValueError.toMustBeObjectId.rc)
        done()
    })
*/


    //3 key value not array
    it(`manipulateArray key value must be array`,function(done){
        value={f1:{[e_manipulateOperator.REMOVE]:undefined}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateValueError.manipulateArray.fieldKeyValueMustBeArray.rc)
        done()
    })

    //4 key value not array
    it(`manipulateArray key eleArray must be array`,function(done){
        value={f1:{[e_manipulateOperator.REMOVE]:{}}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateValueError.manipulateArray.fieldKeyValueMustBeArray.rc)
        done()
    })
    //6 key value 不能空
    it(`manipulateArray key eleArray cant be empty array`,function(done){
        value={f1:{[e_manipulateOperator.REMOVE]:[]}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateValueError.manipulateArray.fieldKeyValueCantEmpty.rc)
        done()
    })
    // key value 元素数量超过maxArrayMax
    it(`manipulateArray key value length exceed maxArrayMax`,function(done){
        value={f1:{[e_manipulateOperator.ADD]:[1,2,3]}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateValueError.manipulateArray.fieldKeyValueNumExceed.rc)
        done()
    })
    //5 eleArray中每个元素类型必须和rule中匹配
    it(`manipulateArray key value element data type must match rule type`,function(done){
        value={f1:{[e_manipulateOperator.ADD]:[1]}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateValueError.manipulateArray.fieldKeyValueDataTypeWrong.rc)
        done()
    })
    it(`manipulateArray key eleArray element not match rule`,function(done){

        rule={f1:{
                [e_otherRuleFiledName.DATA_TYPE]: [e_serverDataType.INT],
                'arrayMaxLength': {define: 2, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含2个好友`}},
                [e_serverRuleType.MIN]:{define: 2, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含2个好友`}},
                [e_serverRuleType.MAX]:{define: 4, error: {rc: 104232}, mongoError: {rc: 20423, msg: `好友分组最多包含2个好友`}},
            }}

        value={f1:{[e_manipulateOperator.ADD]:[1]}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,rule.f1[e_serverRuleType.MIN][`error`][`rc`])
        value={f1:{[e_manipulateOperator.ADD]:[5]}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,rule.f1[e_serverRuleType.MAX][`error`][`rc`])
        done()
    })

    //7 right result
    it(`manipulateArray key eleArray cant be empty array`,function(done){
        rule={f1:{
                [e_otherRuleFiledName.DATA_TYPE]: [e_serverDataType.OBJECT_ID],
                'arrayMaxLength': {define: 2, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含2个好友`}},
                [e_serverRuleType.MIN]:{define: 2, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含2个好友`}},
                [e_serverRuleType.MAX]:{define: 4, error: {rc: 104232}, mongoError: {rc: 20423, msg: `好友分组最多包含2个好友`}},
            }}
        value={f1:{[e_manipulateOperator.ADD]:['58c0c32486e5a6d02657303f']}}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,0)

        done()
    })





})