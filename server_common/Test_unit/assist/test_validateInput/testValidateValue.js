/**
 * Created by Ada on 2017/1/24.
 */
'use strict'
//require("babel-polyfill");
//require("babel-core/register")
const assert=require('assert')
const testModule=require('../../../function/validateInput/validateValue');
//const miscError=require('../../server/define/error/nodeError').nodeError.assistError
const validateValueError=require('../../../constant/error/validateError').validateValue
const validateHelperError=require('../../../constant/error/validateError').validateRule
/*          for generateRandomString test       */
const regex=require('../../../constant/regex/regex').regex
// const regex=require('../define/regex/regex').regex
const e_serverDataType=require('../../../constant/enum/inputDataRuleType').ServerDataType
const e_serverRuleType=require('../../../constant/enum/inputDataRuleType').ServerRuleType
// const inputRule=require('../../../server/constant/inputRule/clientInput').inputRule



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
            'require': {define: false, error: {rc: 10049},mongoError:{rc:20049,msg:'父类别不能为空'}},
            'min':{define:18,error:{rc:10050},mongoError:{rc:20050,msg:'年龄不能小于18'}},
            'max':{define:100,error:{rc:10051},mongoError:{rc:20051,msg:'年龄不能超过100'}},
        },
        rembuiser:{
            'chineseName':'报销人',
            'type':[e_serverDataType.OBJECT_ID],
            'require': {define: false, error: {rc: 10052},mongoError:{rc:20052,msg:'报销人不能为空'}},
            'format':{define:regex.objectId,error:{rc:10053},mongoError:{rc:20053,msg:'报销人的id格式不正确'}},//format == mongodb_match
            arrayMinLength:{define:1,error:{rc:10054},mongoError:{rc:20054,msg:'报销人的数量未达到最小数量'}},
            arrayMaxLength:{define:2,error:{rc:10055},mongoError:{rc:20055,msg:'报销人的数量超过最大数量'}},
        },
        inOutEnum:{
            'chineseName': '支取数组类型',
            //'default':'male',
            'type':[e_serverDataType.STRING],
            'require': {define: false, error: {rc: 10056},mongoError:{rc:20056,msg:'支取类型不能为空'}},
            'enum':{define:['in','out'],error:{rc:10057},mongoError:{rc:20057,msg:'支取类型不正确'}},
            arrayMinLength:{define:0,error:{rc:10058},mongoError:{rc:20058,msg:'支取类型的数量未达到最小数量'}},
            arrayMaxLength:{define:2,error:{rc:10059},mongoError:{rc:20059,msg:'支取类型的数量超过最大数量'}},
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

/*                  create是update超集             */
describe('validateCreateRecorderValue', function() {
    let funcCreate=testModule.validateCreateRecorderValue
    let rule=rules.billType
    let value
    //1, create时，rule中为require的字段，value中没有
    it(`miss required field name`,function(done){
        value={age:10}
        assert.deepStrictEqual(funcCreate(value,rule).name.rc,rule.name.require.error.rc)
        done()
    })
    //2, requied field的值是null
    it(`required field name value is null`,function(done){
        value={name:null}
        assert.deepStrictEqual(funcCreate(value,rule).name.rc,rule.name.require.error.rc)
        done()
    })
    //3, required field的值是undefined
    it(`required field name value is undefined`,function(done){
        value={name:undefined}
        assert.deepStrictEqual(funcCreate(value,rule).name.rc,rule.name.require.error.rc)
        done()
    })
    //4. required field的值是空字符串
    it(`required field name value is empty string`,function(done){
        value={name:""}
        assert.deepStrictEqual(funcCreate(value,rule).name.rc,rule.name.require.error.rc)
        done()
    })
    //5. required field的值是空字符串
    it(`required field name value is blank string`,function(done){
        value={name:"      "}
        assert.deepStrictEqual(funcCreate(value,rule).name.rc,rule.name.require.error.rc)
        done()
    })

    //6, data type为array+objectId，但是其中值类型不符合要求
    it(`data type is array, the ele value type not string: rembuiser must be objectId`,function(done){
        value={name:"asdf",rembuiser:[1]}
        assert.deepStrictEqual(funcCreate(value,rule).rembuiser.rc,validateValueError.CUDTypeWrong.rc)
        done()
    })
    it(`data type is array, the ele value not match regex: rembuiser must be objectId`,function(done){
        value={name:"asdf",rembuiser:[1]}
        assert.deepStrictEqual(funcCreate(value,rule).rembuiser.rc,validateValueError.CUDTypeWrong.rc)
        done()
    })
    it(`data type is array, the ele value is objectId`,function(done){
        value={name:"asdf",rembuiser:['asdf']}
        assert.deepStrictEqual(funcCreate(value,rule).rembuiser.rc,rule.rembuiser.format.error.rc)
        done()
    })
    //6, data type为array+objectId，值符合要求
    it(`data type is array, the ele value invalid: rembuiser must be objectId`,function(done){
        value={name:"asdf",rembuiser:['58c0c32486e5a6d02657303f']}
        assert.deepStrictEqual(funcCreate(value,rule).rembuiser.rc,0)
        done()
    })
    //6, data type为array+objectId，但是值类型不正确
    it(`data type is array, value is not array`,function(done){
        value={name:"asdf",rembuiser:1}
        assert.deepStrictEqual(funcCreate(value,rule).rembuiser.rc,validateValueError.CUDTypeWrong.rc)
        done()
    })
    //6, data type为array+objectId，min length未达到
    it(`data type is array, value is not array`,function(done){
        value={name:"asdf",rembuiser:[]}
        assert.deepStrictEqual(funcCreate(value,rule).rembuiser.rc,rule.rembuiser.arrayMinLength.error.rc)
        done()
    })
    //6, data type为array+objectId，超出max length
    it(`data type is array, value is not array`,function(done){
        value={name:"asdf",rembuiser:[1,2,3]}
        assert.deepStrictEqual(funcCreate(value,rule).rembuiser.rc,rule.rembuiser.arrayMaxLength.error.rc)
        done()
    })

    //6, data type为enum，但是对应的值类型不正确
    it(`data type is array+enum, value is not array`,function(done){
        value={name:"asdf",inOutEnum:[1]}
        assert.deepStrictEqual(funcCreate(value,rule).inOutEnum.rc,validateValueError.CUDTypeWrong.rc)
        done()
    })
    //6, data type为enum，但是对应的值不在范围内
    it(`data type is array, value is not array`,function(done){
        value={name:"asdf",inOutEnum:['any']}
        assert.deepStrictEqual(funcCreate(value,rule).inOutEnum.rc,rule.inOutEnum.enum.error.rc)
        done()
    })

    //6, type为array，且ARRAY_MIX_LENGTH为0， 此时，对应的值为空可以pass
    it(`data type is array, value is not array`,function(done){
        value={name:"asdf",inOutEnum:[]}
        assert.deepStrictEqual(funcCreate(value,rule).inOutEnum.rc,0)
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


/*              目的是测试validateSingleRecorderFieldValue，但是必须通过validateCreateRecorderValue调用       */
describe('validateSingleRecorderFieldValue', function() {
    let funcCreate=testModule.validateCreateRecorderValue
    let funcUpdate=testModule.validateUpdateRecorderValue
    // let funcUpdate=testModule.validateUpdateRecorderValue
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    let rule,value,tmpDataType,result,tmp

    rule={
        mandatoryField1:{
            chineseName:'必填字段1',
            'require': {define: true, error: {rc: 10020},mongoError:{rc:20020,msg:'必填字段1不能为空'}},
            type:e_serverDataType.STRING,
            'minLength':{define:2,error:{rc:10021},mongoError:{rc:20021,msg:'必填字段1名至少2个字符'}},
            'maxLength':{define:10,error:{rc:10022},mongoError:{rc:20022,msg:'必填字段1名最多20个字符'}},
        },
        optionalField1:{
            chineseName:'可选字段1',
            'require': {define: false, error: {rc: 10025},mongoError:{rc:20025,msg:'可选字段1不能为空'}},
            type:e_serverDataType.INT,
            'min':{define:1,error:{rc:10026},mongoError:{rc:20026,msg:'可选字段1名至少2个字符'}},
            'max':{define:100,error:{rc:10027},mongoError:{rc:20027,msg:'可选字段1名最多20个字符'}},
            format:{define:regex.pageNum,error:{rc:10028},mongoError:{rc:20028,msg:'页数必须由1-4个数字组成'}}
        },
        typeUnknownField:{
            chineseName:'类型未知字段1',
            'require': {define: false, error: {rc: 10030},mongoError:{rc:20030,msg:'可选字段1不能为空'}},
            type:'unknown',
        },
        typeObjectId:{
            chineseName:'字段objectId',
            'require': {define: false, error: {rc: 10040},mongoError:{rc:20040,msg:'可选字段1不能为空'}},
            type:e_serverDataType.OBJECT_ID,
            'format':{define:regex.objectId,error:{rc:10041},mongoError:{rc:20041,msg:'所属部门的id格式不正确'}},
        },
        enumField:{
            chineseName:'枚举字段',
            'require': {define: false, error: {rc: 10050},mongoError:{rc:20050,msg:'可选字段1不能为空'}},
            type:e_serverDataType.STRING,
            'enum':{define:['male','female'],error:{rc:10051},mongoError:{rc:20051,msg:'性别不正确'}},
        },
    }

    //1, create: require=true的字段输入为null
    it(`create:required field value is null`,function(done){
        value={mandatoryField1:null}
        assert.deepStrictEqual(funcCreate(value,rule).mandatoryField1.rc,rule.mandatoryField1.require.error.rc)
        done()
    })
    //2, update: require=true的字段输入为null
    it(`update:required field value is null`,function(done){
        value={mandatoryField1:null}
        assert.deepStrictEqual(funcUpdate(value,rule).mandatoryField1.rc,rule.mandatoryField1.require.error.rc)
        done()
    })
    //3, update: require=false的字段输入为null，不报错
    it(`create:optional field value is null is OK`,function(done){
        value={optionalField1:null}
        assert.deepStrictEqual(funcUpdate(value,rule).optionalField1.rc,0)
        done()
    })
    //4. type unknown field
    it(`update: field data type unknown`,function(done){
        value={typeUnknownField:1}
        assert.deepStrictEqual(funcUpdate(value,rule).typeUnknownField.rc,validateHelperError.unknownDataType.rc)
        done()
    })
    //5.  create:field value类型错误
    it(`create: field data type wrong`,function(done){
        value={mandatoryField1:1}
        assert.deepStrictEqual(funcCreate(value,rule).mandatoryField1.rc,validateValueError.CUDTypeWrong.rc)
        done()
    })
    //5.  update: field value类型错误
    it(`update: field data type wrong`,function(done){
        value={optionalField1:[1]}
        assert.deepStrictEqual(funcUpdate(value,rule).optionalField1.rc,validateValueError.CUDTypeWrong.rc)
        done()
    })
    //5.  update: field value类型错误
    it(`update: field data type wrong:not string`,function(done){
        value={typeObjectId:1}
        assert.deepStrictEqual(funcUpdate(value,rule).typeObjectId.rc,validateValueError.CUDTypeWrong.rc)
        done()
    })
    it(`update: field data not match object`,function(done){
        value={typeObjectId:'asdf'}
        assert.deepStrictEqual(funcUpdate(value,rule).typeObjectId.rc,rule.typeObjectId.format.error.rc)
        done()
    })
    //5.  update: format check
    it(`update: field data type format wrong`,function(done){
        value={optionalField1:111111}
        assert.deepStrictEqual(funcUpdate(value,rule).optionalField1.rc,rule.optionalField1.format.error.rc)
        done()
    })
    //5.  update: format check,for int, match format, not match min
    it(`update: field data type format,the field value is not match min`,function(done){
        value={optionalField1:0}
        assert.deepStrictEqual(funcUpdate(value,rule).optionalField1.rc,rule.optionalField1.min.error.rc)
        done()
    })
    //5.  update: format check,for int, match format, not match max
    it(`update: field data type format,the field value is not match max`,function(done){
        value={optionalField1:999}
        assert.deepStrictEqual(funcUpdate(value,rule).optionalField1.rc,rule.optionalField1.max.error.rc)
        done()
    })

    //5.  update: format check, match format ok
    it(`update: field data type format,the field value is not match max`,function(done){
        value={optionalField1:99}
        assert.deepStrictEqual(funcUpdate(value,rule).optionalField1.rc,0)
        done()
    })

    //5.  create: format check, match format ok
    it(`create: field data type format,the field value is not match max`,function(done){
        value={mandatoryField1:'12345678901'}
        assert.deepStrictEqual(funcCreate(value,rule).mandatoryField1.rc,rule.mandatoryField1.maxLength.error.rc)
        done()
    })

    //5.  create: 检查minLength属性
    it(`create: field data type ,field value length exceed minLength`,function(done){
        value={mandatoryField1:'1'}
        assert.deepStrictEqual(funcCreate(value,rule).mandatoryField1.rc,rule.mandatoryField1.minLength.error.rc)
        done()
    })

    //5.  update: enum value invalid
    it(`update: field data type ,field value is invalid value`,function(done){
        value={enumField:'any'}
        assert.deepStrictEqual(funcUpdate(value,rule).enumField.rc,rule.enumField.enum.error.rc)
        done()
    })

    //5.  update: enum value valid
    it(`update: field data type ,field value is invalid value`,function(done){
        value={enumField:'male'}
        assert.deepStrictEqual(funcUpdate(value,rule).enumField.rc,0)
        done()
    })
})




/*                  searchParams check              */
describe('validateSingleRecorderFieldValue', function() {
    let func=testModule.validateSearchParamsValue
    let value,result,tmp



    rules.billType.test={}
    rules.billType.test['type']='test'
    rules.billType.test['require']={define:false,error: {rc: 10049},mongoError:{rc:20049,msg:'test不能为空'}}


    rules.billType.formatField={
        chineseName:'可选字段1',
        'require': {define: false, error: {rc: 10025},mongoError:{rc:20025,msg:'可选字段1不能为空'}},
        type:e_serverDataType.INT,
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
})


describe('validateFilterFieldValue', function() {
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
})

/***************************************************************************/
/***************   editSubField   *******************/
/***************************************************************************/
describe('validateEditSubFieldValue', function() {
    let func = testModule.validateEditSubFieldValue
    let result, value, rule={f1:{
        'type': [e_serverDataType.OBJECT_ID],
        // 'arrayMaxLength': {define: 100, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含100个好友`}},
    }}

    it(`editSubField rule data type not array`,function(done){
        rule={f1:{
            'type': e_serverDataType.INT,
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
            'type': [e_serverDataType.OBJECT_ID],
            // 'arrayMaxLength': {define: 100, error: {rc: 10422}, mongoError: {rc: 20422, msg: `好友分组最多包含100个好友`}},
        }}
        assert.deepStrictEqual(func({inputValue:value,browseInputRule:rule}).rc,validateValueError.arrayMaxLengthUndefined.rc)
        rule={f1:{
            'type': [e_serverDataType.OBJECT_ID],
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
                'type': [e_serverDataType.INT],
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

