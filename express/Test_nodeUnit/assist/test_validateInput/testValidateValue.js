/**
 * Created by Ada on 2017/1/24.
 */
'use strict'
//require("babel-polyfill");
//require("babel-core/register")
const testModule=require('../../../server/function/validateInput/validateValue');
//const miscError=require('../../server/define/error/nodeError').nodeError.assistError
const validateValueError=require('../../../server/constant/error/validateError').validateError.validateValue
const validateHelperError=require('../../../server/constant/error/validateError').validateError.validateRule
/*          for generateRandomString test       */
const regex=require('../../../server/constant/regex/regex').regex
// const regex=require('../define/regex/regex').regex
const e_serverDataType=require('../../../server/constant/enum/inputDataRuleType').ServerDataType
const e_serverRuleType=require('../../../server/constant/enum/inputDataRuleType').ServerRuleType
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
            'require': {define: false, error: {rc: 10047},mongoError:{rc:20047,msg:'父类别不能为空'}},
            // 'format':{define:regex.objectId,error:{rc:10048},mongoError:{rc:20048,msg:'父类别的id格式不正确'}},//format == mongodb_match
        },
        rembuiser:{
            'chineseName':'报销人',
            'type':[e_serverDataType.OBJECT_ID],
            'require': {define: false, error: {rc: 10047},mongoError:{rc:20047,msg:'报销人不能为空'}},
            'format':{define:regex.objectId,error:{rc:10048},mongoError:{rc:20048,msg:'报销人的id格式不正确'}},//format == mongodb_match
            arrayMinLength:{define:1,error:{rc:10049},mongoError:{rc:20049,msg:'报销人的数量未达到最小数量'}},
            arrayMaxLength:{define:2,error:{rc:10050},mongoError:{rc:20050,msg:'报销人的数量超过最大数量'}},
        },
        inOutEnum:{
            'chineseName': '支取数组类型',
            //'default':'male',
            'type':[e_serverDataType.STRING],
            'require': {define: false, error: {rc: 10051},mongoError:{rc:20051,msg:'支取类型不能为空'}},
            'enum':{define:['in','out'],error:{rc:10052},mongoError:{rc:20052,msg:'支取类型不正确'}},
            arrayMinLength:{define:0,error:{rc:10053},mongoError:{rc:20053,msg:'支取类型的数量未达到最小数量'}},
            arrayMaxLength:{define:2,error:{rc:10054},mongoError:{rc:20054,msg:'支取类型的数量超过最大数量'}},
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
const validateCreateRecorderValue=function(test){
    let funcCreate=testModule.validateCreateRecorderValue
    test.expect(10)
    let value,result
    let rule=rules.billType


    //1, create时，rule中为require的字段，value中没有
    value={age:{value:10}}
    result=funcCreate(value,rule)
    // console.log(`error1 is ${JSON.stringify(result)}`)
    test.equal(result.name.rc,rule.name.require.error.rc,"required field not set in value")
    //2, create时，rule中为require的字段，value为null
    value={name:{value:null}}
    result=funcCreate(value,rule)
    // console.log(`error2 is ${JSON.stringify(result)}`)
    test.equal(result.name.rc,rule.name.require.error.rc,"required field is null in value")

    //3, type为array，但是其中值不符合要求
    value={name:{value:'asdf'},rembuiser:{value:[1]}}
    result=funcCreate(value,rule)
    // console.log(`error2 is ${JSON.stringify(result)}`)
    test.equal(result.rembuiser.rc,rule.rembuiser.format.error.rc,"rembuiser must be objectId")

    //4, type为array，但是其中值符合要求
    value={name:{value:'asdf'},rembuiser:{value:['58c0c32486e5a6d02657303f']}}
    result=funcCreate(value,rule)
    // console.log(`error2 is ${JSON.stringify(result)}`)
    test.equal(result.rembuiser.rc,0,"required field is null in value")

    //5.  type为array，但是对应的值不是array
    value={name:{value:'asdf'},rembuiser:{value:1}}
    result=funcCreate(value,rule)
    // console.log(`error2 is ${JSON.stringify(result)}`)
    test.equal(result.rembuiser.rc,validateValueError.CUDTypeWrong.rc,"type is array, but value is not array")

    //6.  type为array，但是对应的值未达到min
    value={name:{value:'asdf'},rembuiser:{value:[]}}
    result=funcCreate(value,rule)
    // console.log(`error2 is ${JSON.stringify(result)}`)
    test.equal(result.rembuiser.rc,rule.rembuiser.arrayMinLength.error.rc,"type is array, but value is not array")

    //7.  type为array，但是对应的值超过max
    value={name:{value:'asdf'},rembuiser:{value:[1,2,3]}}
    result=funcCreate(value,rule)
    // console.log(`error2 is ${JSON.stringify(result)}`)
    test.equal(result.rembuiser.rc,rule.rembuiser.arrayMaxLength.error.rc,"type is array, but value is not array")

    //8.  type为array，但是对应的值类型不正确
    value={name:{value:'asdf'},inOutEnum:{value:[1]}}
    result=funcCreate(value,rule)
    // console.log(`error2 is ${JSON.stringify(result)}`)
    test.equal(result.inOutEnum.rc,validateValueError.CUDTypeWrong.rc,"type is array, but value is not array")

    //9.  type为array，但是对应的值不在范围内
    value={name:{value:'asdf'},inOutEnum:{value:['any']}}
    result=funcCreate(value,rule)
    // console.log(`error2 is ${JSON.stringify(result)}`)
    test.equal(result.inOutEnum.rc,rule.inOutEnum.enum.error.rc,"type is array, but value is not array")

    //10.  type为array，且ARRAY_MIX_LENGTH为0， 此时，对应的值为空可以pass
    value={name:{value:'asdf'},inOutEnum:{value:[]}}
    result=funcCreate(value,rule)
    // console.log(`error2 is ${JSON.stringify(result)}`)
    test.equal(result.inOutEnum.rc,0,"type is array, but value is not array")

    test.done()
}


/*                  recorder id            */
const validateRecorderId=function(test){
    let funcDelete=testModule.validateRecorderId
    test.expect(6)



    //1, objectId格式不正确（null）
    let value=null
    let result=funcDelete(value)
    test.equal(result.rc,validateValueError.CUDObjectIdEmpty.rc,"Recorder Id is null" )
    //2. objectId格式不正确（undefined）
    value=undefined
    result=funcDelete(value)
    test.equal(result.rc,validateValueError.CUDObjectIdEmpty.rc,"objectId is undefined")

    //3, objectId格式不正确（整数）
    value=10
    result=funcDelete(value)
    test.equal(result.rc,validateValueError.CUDObjectIdWrong.rc,"objectId format wrong")
    //4, objectId格式不正确（数组）
    value=[10]
    result=funcDelete(value)
    test.equal(result.rc,validateValueError.CUDObjectIdWrong.rc,"objectId format wrong")
    //5, objectId格式不正确（对象）
    value={}
    result=funcDelete(value)
    test.equal(result.rc,validateValueError.CUDObjectIdEmpty.rc,'objectId format wrong')

    //6. 正常id
    value='58c0c32486e5a6d02657303f'
    result=funcDelete(value)
    // console.log(`error2 is ${JSON.stringify(result)}`)
    test.equal(result.rc,0,"required field is null in value")

    test.done()
}

/*                  recorder id            */
const validateRecIdArr=function(test){
    let funcDelete=testModule.validateRecIdArr
    let maxLength=2
    test.expect(8)

    //1, 数组长度为0
    let value=[]
    let result=funcDelete(value,maxLength)
    test.equal(result.rc,validateValueError.recIdArrValueCantEmpty.rc,"RecIdArr is empty" )
    //2. 数组长度超出定义
    value=[1,2,3]
    result=funcDelete(value,maxLength)
    test.equal(result.rc,validateValueError.recIdArrValueExceedMax.rc,"RecIdArr length exceed max")

    //3, objectId格式不正确（null）
    value=[null]
    result=funcDelete(value,maxLength)
    test.equal(result.rc,validateValueError.recIdArrValueEleShouldString.rc,"RecIdArr ele is null" )
    //4. objectId格式不正确（undefined）
    value=[undefined]
    result=funcDelete(value,maxLength)
    test.equal(result.rc,validateValueError.recIdArrValueEleShouldString.rc,"RecIdArr ele is undefined")

    //5 objectId格式不正确（整数）
    value=[10]
    result=funcDelete(value,maxLength)
    test.equal(result.rc,validateValueError.recIdArrValueEleShouldString.rc,"RecIdArr ele is int")
    //6, objectId格式不正确（对象）
    value=[{}]
    result=funcDelete(value,maxLength)
    test.equal(result.rc,validateValueError.recIdArrValueEleShouldString.rc,'RecIdArr ele is object')

    //7. 正常id
    value=['58c0c32486e5a6d02657303f','58c0c32486e5a6d02657303f']
    result=funcDelete(value,maxLength)
    // console.log(`error2 is ${JSON.stringify(result)}`)
    test.equal(result.rc,0,"RecIdArr ele is objectId")

    //8. 正常id+ 超出数量
    value=['58c0c32486e5a6d02657303f','58c0c32486e5a6d02657303f','58c0c32486e5a6d02657303f']
    result=funcDelete(value,maxLength)
    // console.log(`error2 is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateValueError.recIdArrValueExceedMax.rc,"RecIdArr ele exceed max")

    test.done()
}

/*              目的是测试validateSingleRecorderFieldValue，但是必须通过validateCreateRecorderValue调用       */
const validateSingleRecorderFieldValue=function(test){

    let funcCreate=testModule.validateCreateRecorderValue
    let funcUpdate=testModule.validateUpdateRecorderValue
    // let funcUpdate=testModule.validateUpdateRecorderValue
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    let rule,value,tmpDataType,result,tmp
    // let error={rc:1234,msg:''}

    test.expect(15)
    // test.expect(1)
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


    //2. create: require=true的字段输入为null
    value={mandatoryField1:{value:null}}
    // console.log(`rulke`)
    result=funcCreate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.mandatoryField1.rc,rule.mandatoryField1.require.error.rc,'when create new recorder, the required field value is not set')

    //3. update: require=true的字段输入为null，报require的错（既然填写了字段，就要符合rule的定义）
    value={mandatoryField1:{value:null}}
    result=funcUpdate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.mandatoryField1.rc,rule.mandatoryField1.require.error.rc,'when update recorder, the required true field value is not set')

    //4.  update: require=false的字段输入为null，不报错
    value={optionalField1:{value:null}}
    result=funcUpdate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.optionalField1.rc,0,'when update recorder, the required false field value is not set')

    //5. 不存在的类型
    value={typeUnknownField:{value:1}}
    result=funcUpdate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.typeUnknownField.rc,validateHelperError.unknownDataType.rc,'when update recorder, the field rule type is unknown')
    //6. 检查类型
    value={mandatoryField1:{value:1}}
    result=funcCreate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.mandatoryField1.rc,validateValueError.CUDTypeWrong.rc,'when create recorder, the field value wrong')
    //7  另一个错误类型
    value={optionalField1:{value:[1]}}
    result=funcUpdate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.optionalField1.rc,validateValueError.CUDTypeWrong.rc,'when update recorder, the field value wrong')

    //8  type=objectId
    value={typeObjectId:{value:[1]}}
    result=funcUpdate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.typeObjectId.rc,rule.typeObjectId.format.error.rc,'when update recorder, the field value is not objectId')


    //9. format check:not match
    value={optionalField1:{value:111111}}
    result=funcUpdate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.optionalField1.rc,rule.optionalField1.format.error.rc,'when update recorder, the field value is not match format')
    //10. format check:for int, match format, not match min
    value={optionalField1:{value:0}}
    result=funcUpdate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.optionalField1.rc,rule.optionalField1.min.error.rc,'when update recorder, the field value is not match min')
    //11. format check:for int, match format, not match max
    value={optionalField1:{value:9999}}
    result=funcUpdate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.optionalField1.rc,rule.optionalField1.max.error.rc,'when update recorder, the field value is not match max')
    //12. format check: match format/min.max
    value={optionalField1:{value:99}}
    result=funcUpdate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.optionalField1.rc,0,'when update recorder, the field value  match format/min/max')

    //13. create: 检查maxLength属性
    value={mandatoryField1:{value:'12345678901'}}
    result=funcCreate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.mandatoryField1.rc,rule.mandatoryField1.maxLength.error.rc,'when create new recorder, the field value length exceed maxLength')
    //14. create: 检查minLength属性
    value={mandatoryField1:{value:'1'}}
    result=funcCreate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.mandatoryField1.rc,rule.mandatoryField1.minLength.error.rc,'when create new recorder, the field value length exceed minLength')

    //15. update: not enum
    value={enumField:{value:'any'}}
    result=funcUpdate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.enumField.rc,rule.enumField.enum.error.rc,'when update new recorder, the field value is not enum')
    //16. update: is enum
    value={enumField:{value:'male'}}
    result=funcUpdate(value,rule)
    // console.log(`resul is ${JSON.stringify(result)}`)
    test.equal(result.enumField.rc,0,'when update new recorder, the field value is enum')

    test.done()
}



/*                  searchParams check              */
const validateSearchParamsValue=function(test){

    let func=testModule.validateSearchParamsValue
    //let error=miscError.misc.validateInputSearchValue
    // let rules=require('../../server/define/validateRule/inputRule').inputRule
    // let coll=require('../../server/define/enum/node').coll
    // let searchSetting=require('../../server/config/global/globalSettingRule').searchSetting
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    let value,result,tmp
    rules.billType.age={}
    rules.billType.age['type']=e_serverDataType.INT
    rules.billType.age['max']={define:100,error:{rc:10002},mongoError:{rc:20002,msg:'年龄不能超过100'}}
    rules.billType.age['min']={define:18,error:{rc:10004},mongoError:{rc:20004,msg:'年龄不能小于100'}}

    rules.billType.test={}
    rules.billType.test['type']='test'

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

    test.expect(11)





    //4, search value is empty, delete, and return rc:0
    value={'age':[{value:null}]}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    // console.log(`value is ${JSON.stringify(value)}`)
    // console.log(`result  is ${JSON.stringify(result)}`)
    test.equal(result.age.rc,0,'search input value is empty, directly delete')

    //5, fk search value is empty, delete, and return rc:0
    value={'parentBillType':{name:[{value:null}]}}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    // console.log(`value is ${JSON.stringify(value)}`)
    // console.log(`result  is ${JSON.stringify(result)}`)
    test.equal(result.parentBillType.name.rc,0,'fk search input value is empty, directly delete')

    //6, search value exceed maxLength, delete, and return rc:0
    value={'name':[{value:'012345678901234567890012'}]}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    // console.log(`value is ${JSON.stringify(value)}`)
    // console.log(`result  is ${JSON.stringify(result)}`)
    test.equal(result.name.rc,0,'search input value exceed maxLength, directly delete')

    //7, fk search value exceed maxLength, delete, and return rc:0
    value={'parentBillType':{name:[{value:'012345678901234567890012'}]}}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    // console.log(`value is ${JSON.stringify(value)}`)
    // console.log(`result  is ${JSON.stringify(result)}`)
    test.equal(result.parentBillType.name.rc,0,'fk search input value exceed maxLength, directly delete')

    //8. unkonwn e_serverDataType
    value={'test':[{value:'a'}]}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.test.rc,validateHelperError.unknownDataType.rc,'search input unknown type  check fail')

    //9. e_serverDataType wrong
    value={'age':[{value:'a'}]}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.age.rc,validateValueError.STypeWrong.rc,'search input value type check fail')

    //10. format check wrong
    value={'formatField':[{value:12345}]}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    test.equal(result.formatField.rc,rules.billType.formatField.format.error.rc,'search input value format check fail')

    //11. enum check
    value={'inOut':[{value:'notEnum'}]}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.inOut.rc,rules.billType.inOut.enum.error.rc,'search input value enum check fail')

  //12. minLength不检查
    value={'parentBillType':{
        name:[{value:'a'}]
    }}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.parentBillType.name.rc,0,'search input value parentBillType minLength check fail')



    //13. min不再检查
    value={'parentBillType':{
        name:[{value:'a'}],
        age:[{value:101,compOp:'gt'}]
    }}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.parentBillType.age.rc,0,'search input value parentBillType age 101 check fail')
    //14. max不再检查
    value={'parentBillType':{
        name:[{value:'a'}],
        age:[{value:1,compOp:'gt'}]
    }}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.parentBillType.age.rc,0,'search input value parentBillType age 1 check fail')

    test.done()
}

function validateFilterFieldValue(test){
    let func=testModule.validateFilterFieldValue

    let value,result,collName='billType'
    test.expect(4)

    //1 普通字段，字符，超出maxLength
    value={name:'123456789012345687901234567890123456879012345678901234568790'}
    result=func(value,fkConfig,collName,rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateValueError.filterFieldValueOutRange.rc,'filter field value exceed maxLength check fail')

    //2 普通字段type不对(因为和searchParams复用一个函数检测，所以返回值是STypeWrong)
    value={name:1}
    result=func(value,fkConfig,collName,rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateValueError.STypeWrong.rc,'filter field value exceed maxLength check fail')

//3 外键字段，字符，超出maxLength
    value={parentBillType:{name:'123456789012345687901234567890123456879012345678901234568790'}}
    result=func(value,fkConfig,collName,rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateValueError.filterFieldValueOutRange.rc,'filter field value exceed maxLength check fail')

        //4 外键字段type不对(因为和searchParams复用一个函数检测，所以返回值是STypeWrong)
     value={parentBillType:{name:1}}
     result=func(value,fkConfig,collName,rules)
     // console.log(`result is ${JSON.stringify(result)}`)
     test.equal(result.rc,validateValueError.STypeWrong.rc,'filter field value exceed maxLength check fail')

    test.done()
}


/***************************************************************************/
/***************   editSubField   *******************/
/***************************************************************************/
const validateEditSubFieldValue=function(test) {
    test.expect(7)
    let func = testModule.validateEditSubFieldValue
    let result, value

    //1 from not objectId
    value={from:undefined}
    result=func(value)
    test.equal(result.rc,validateValueError.fromMustBeObjectId.rc,'editSubField key from must be objectId check fail')

    //2 to not objectId
    value={to:undefined}
    result=func(value)
    test.equal(result.rc,validateValueError.toMustBeObjectId.rc,'editSubField key to must be objectId check fail')

    //3 eleArray not array
    value={eleArray:undefined}
    result=func(value)
    test.equal(result.rc,validateValueError.eleArrayNotDefine.rc,'editSubField key eleArray must be array check fail')
    //4 eleArray not array
    value={eleArray:{}}
    result=func(value)
    test.equal(result.rc,validateValueError.eleArrayMustBeArray.rc,'editSubField key eleArray must be array check fail')

    //5 eleArray中每个元素必须是objectId
    value={eleArray:[1,2,3]}
    result=func(value)
    test.equal(result.rc,validateValueError.eleArrayMustContainObjectId.rc,'editSubField key eleArray must be array check fail')
    //6 right result: 空数组
    value={eleArray:[]}
    result=func(value)
    test.equal(result.rc,validateValueError.eleArrayCantEmpty.rc,'editSubField key eleArray cant empty check fail')

    //7 right result
    value={eleArray:['58c0c32486e5a6d02657303f']}
    result=func(value)
    test.equal(result.rc,0,'editSubField key eleArray must contain object id check fail')

    test.done()
}


module.exports={
    validateCreateRecorderValue, //完成公共部分，单个value的验证交给validateSingleRecorderFieldValue
    validateRecorderId, //因为结构简单，所有公共部分和实际单个value的验证一起完成
    validateRecIdArr,//批量处理
    validateSingleRecorderFieldValue,   // 单个value的验证，但是必须通过validateCreateRecorderValue调用
    validateSearchParamsValue,  //检测所有的searchParams，validateStaticSearchParamsValue+validateCurrentCollValue+validateCurrentPageValue
    validateFilterFieldValue,//part: filterFieldValue检测

    validateEditSubFieldValue,
}