/**
 * Created by wzhan039 on 2016-11-10.
 * 检测validateFunc中对input的format和value函数进行测试
 */
'use strict'
/*require("babel-polyfill");
 require("babel-core/register")*/
const testModule=require('../../../server/function/validateInput/validateFormat');
const validateFormatError=require('../../../server/constant/error/validateError').validateError.validateFormat
/*          for generateRandomString test       */
const regex=require('../../../server/constant/regex/regex').regex
const serverDataType=require('../../../server/constant/enum/inputDataRuleType').ServerDataType
const validatePart=require('../../../server/constant/enum/node').ValidatePart

let rules ={
    billType:{
        name:{
            'chineseName': '单据类别',
            'type':serverDataType.STRING,
            'require': {define: true, error: {rc: 10041},mongoError:{rc:20041,msg:'单据类别不能为空'}},
            'minLength':{define:2,error:{rc:10042},mongoError:{rc:20042,msg:'单据类别至少2个字符'}},
            'maxLength':{define:40,error:{rc:10044},mongoError:{rc:20044,msg:'单据类别的长度不能超过40个字符'}},
        },
        inOut:{
            'chineseName': '支取类型',
            //'default':'male',
            'type':serverDataType.STRING,
            'require': {define: false, error: {rc: 10045},mongoError:{rc:20045,msg:'支取类型不能为空'}},
            'enum':{define:['in','out'],error:{rc:10046},mongoError:{rc:20046,msg:'支取类型不正确'}},
        },
        parentBillType:{
            'chineseName':'父类别',
            'type':serverDataType.OBJECT_ID,
            'require': {define: false, error: {rc: 10047},mongoError:{rc:20047,msg:'父类别不能为空'}},
            'format':{define:regex.objectId,error:{rc:10048},mongoError:{rc:20048,msg:'父类别的id格式不正确'}},//format == mongodb_match
        },
        age:{
            'chineseName':'年龄',
            'type':serverDataType.NUMBER,
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
const validateReqBody=function(test) {
    let func = testModule.validateReqBody
    let reqBody,result
    test.expect(6)

    //1. inputValue undefined
    result=func(reqBody)
    test.equal(result.rc,validateFormatError.valuesUndefined.rc,'inputValue must be object')
    //1. inputValue is not object
    reqBody=[]
    // exceptPart=[]
    result=func(reqBody)
    test.equal(result.rc,validateFormatError.valuesUndefined.rc,'inputValue must be object')
    reqBody=null
    // exceptPart=[]
    result=func(reqBody)
    test.equal(result.rc,validateFormatError.valuesUndefined.rc,'inputValue must be object')

    reqBody={notValues:{}}
    // exceptPart=[]
    result=func(reqBody)
    test.equal(result.rc,validateFormatError.valuesUndefined.rc,'inputValue must be object')

    reqBody={values:[]}
    // exceptPart=[]
    result=func(reqBody)
    test.equal(result.rc,validateFormatError.valueMustBeObject.rc,'inputValue must be object')

    reqBody={values:undefined}
    // exceptPart=[]
    result=func(reqBody)
    test.equal(result.rc,validateFormatError.valueMustBeObject.rc,'inputValue must be object')
    test.done()
}


/***************************************************************************/
/***************   validatePartFormat   *******************/
/***************************************************************************/
const validatePartFormat=function(test){
    let func=testModule.validatePartFormat
    let inputValue,result,exceptPart
    test.expect(11)



    // func=testModule.validatePartFormat

    //1 inputValue part exceed ecxeptPart
    inputValue={'unkonwnPart1':{},'unkonwnPart2':{}}
    exceptPart=[validatePart.CURRENT_PAGE]
    result=func(inputValue,exceptPart)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.inputValuePartNumExceed.rc,'part number exceed exceptPart')

    //2 undefined part
    inputValue={'currentColl':''}
    exceptPart=['unkonwnPart']
    result=func(inputValue,exceptPart)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.inputValueExceptedPartNotValid.rc,'unknown part')

    //3. inputValue has part not define in exceptPart
    inputValue={'currentColl':"test"}
    exceptPart=[validatePart.CURRENT_PAGE]
    result=func(inputValue,exceptPart)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.inputValuePartNotMatch.rc,'miss part define in exceptPart')


   /* //4. currentColl必须是string
    inputValue={'currentColl':1}
    exceptPart=[validatePart.CURRENT_COLL]
    result=func(inputValue,exceptPart)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.inputValuePartCurrentCollValueFormatWrong.rc,'currentColl part value is not string')*/
    //5. currentPage必须是整数
    inputValue={'currentPage':1.1}
    exceptPart=[validatePart.CURRENT_PAGE]
    result=func(inputValue,exceptPart)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.inputValuePartCurrentPageValueFormatWrong.rc,'currentPage part value is not int')
    //6. recorderId必须是字符
    inputValue={'recordId':1.1}
    exceptPart=[validatePart.RECORD_ID]
    result=func(inputValue,exceptPart)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.inputValuePartRecordIdValueFormatWrong.rc,'recorderId part value is not string')
    //7. recorderId必须是objectId
    inputValue={'recordId':'asdf'}
    exceptPart=[validatePart.RECORD_ID]
    result=func(inputValue,exceptPart)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,0,'recorderId part value is not string')

    //8. recorderInfo必须是object
    inputValue={'recordInfo':1.1}
    exceptPart=[validatePart.RECORD_INFO]
    result=func(inputValue,exceptPart)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.inputValuePartRecordInfoValueFormatWrong.rc,'recorderInfo part value is not object')
    //9. searchParams必须是object
    inputValue={'searchParams':1}
    exceptPart=[validatePart.SEARCH_PARAMS]
    result=func(inputValue,exceptPart)
    // console.log(`result searchParams is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.inputValuePartSearchParamsValueFormatWrong.rc,'searchParams part value is not object')


    //110. all part correct
    inputValue={'currentPage':1,'recordInfo':{},'searchParams':{}}
    exceptPart=[validatePart.CURRENT_PAGE,validatePart.RECORD_INFO,validatePart.SEARCH_PARAMS]
    result=func(inputValue,exceptPart)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,0,'all 4 part check fail')


    //11 recIdArr必须是数组
    inputValue={'recIdArr':''}
    exceptPart=[validatePart.RECORD_ID_ARRAY]
    result=func(inputValue,exceptPart)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.inputValuePartRecIdArrValueFormatWrong.rc,'recIdArr not array')
    //12 recIdArr必须是数组
    inputValue={'recIdArr':[]}
    exceptPart=[validatePart.RECORD_ID_ARRAY]
    result=func(inputValue,exceptPart)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,0,'recIdArr is array')

    test.done()
}

/*/!***************************************************************************!/
/!***************   validateCreateUpdateInputFormat   *******************!/
/!***************************************************************************!/
const validateCreateUpdateInputFormat=function(test){
    let func=testModule.validateCUDInputFormat
    let values,result
    test.expect(7)

    values=null
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartFormatWrong.rc,'values must be object')
    values=[]
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartFormatWrong.rc,'values must be object')

    values={currentPage:1,currentColl:'test'}
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartMiss.rc,'values must contain recorderInfo')

    values={'recorderInfo':null,currentPage:1}
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartRecorderInfoValueFormatWrong.rc,' recorderInfo must be object')

    values={'recorderInfo':{},currentColl:'tret'}
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartMiss.rc,'values must contain currentPage')

    values={'recorderInfo':{},'currentPage':'test'}
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartCurrentPageValueFormatWrong.rc,'currentPage must be int')

    values={'recorderInfo':{},'currentPage':1}
    result=func(values)
    test.equal(result.rc,0)

    test.done()
}*/
/***************************************************************************/
/***************  validateRecorderInfoFormat   *******************/
/***************************************************************************/
const validateRecorderInfoFormat=function(test){
    let func=testModule.validateCURecordInfoFormat
    let value,rules,result

    //标号5，实际5（dup key无法测试）
    test.expect(8)

    rules={field1:{}}//只是为了检测是否有对应的rule存在

    //1. create/update的时候，输入值没有任何字段
     value={}
     result=func(value,rules)
     // console.log(`resul is ${JSON.stringify(result)}`)
     test.equal(result.rc,validateFormatError.recordInfoCantEmpty.rc,'create/update recorder, inputValue fields in empty')

    //2 value的field数量超过rule定义的field数量
    rules={name:{}}
    value={name:{value:'a'},age:{value:10}}
    result=func(value,rules)
    test.equal(result.rc,validateFormatError.recordInfoFieldNumExceed.rc,"value fields number exceed rule fields number")

    //3. 重复key无法测试
    //3. value中字段没有在rule中定义
    rules={name:{}}
    value={age:{value:10}}
    result=func(value,rules)
    // console.log(`error0 is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.recordInfoFiledRuleNotDefine.rc,"value field not defined in  rule")


    //4. 键值不是对象
    rules={field1:{}}
    value={field1:1}
    result=func(value,rules)
    test.equal(result.rc,validateFormatError.recordInfoValueMustBeObject.rc,'recorder field value should be object')
    //5. 键值为空对象
    rules={field1:{}}
    value={field1:{}}
    result=func(value,rules)
    test.equal(result.rc,validateFormatError.recordInfoSubObjectMustHasOnly1Field.rc,'recorder field value should be object, and only contain 1 key')

    //6. 键值包含多余field
    rules={field1:{}}
    value={field1:{value:1,'anyKey':2}}
    result=func(value,rules)
    test.equal(result.rc,validateFormatError.recordInfoSubObjectMustHasOnly1Field.rc,'recorder field value should be object, and only contain 1 key')

    //7. 键值的field不是value
    rules={field1:{}}
    value={field1:{'anyKey':2}}
    result=func(value,rules)
    test.equal(result.rc,validateFormatError.recordInfoSubObjectFiledNameWrong.rc,'recorder field value should be object, and only contain value')


    //8. corrent case
    rules={field1:{}}
    value={'field1':{value:''}}
    result=func(value,rules)
    test.equal(result.rc,0,'correct value check fail')

    test.done()
}

/*                  filterFieldValue    {field1:keyword} or {billType:{name:keyword}}              */
//
const validateFilterFieldValueFormat=function (test){
    let func=testModule.validateFilterFieldValueFormat
    let value,result

    test.expect(13)

    //1 value必须是object
    value=[]
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    test.equal(result.rc,validateFormatError.filterFieldValueMustBeObject.rc,"filter field value must be object")

    //2 value的field数量不为1
     value={name:{value:'a'},age:{value:10}}
     result=func(value,fkAdditionalFieldsConfig,'billType',rules)
     test.equal(result.rc,validateFormatError.filterFieldValueFieldNumMustHasOnly1Field.rc,"filter field value fields number not 1")

    //3 value的field数量不为1
    value={}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    test.equal(result.rc,validateFormatError.filterFieldValueFieldNumMustHasOnly1Field.rc,"filter field value fields number not 1")

     //4 key未在rule中定义
     value={id:{value:10}}
     result=func(value,fkAdditionalFieldsConfig,'billType',rules)
     // console.log(`error0 is ${JSON.stringify(result)}`)
     test.equal(result.rc,validateFormatError.filterFieldValueFieldNotInRule.rc,"field defined in rule")

    //5  value必须是字符数字，对象
    value={name:[]}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    // console.log(`error0 is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.filterFieldValueTypeWrong.rc," field  value should be number/string/object")
    //6  value必须是字符数字，对象
    value={name:null}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    // console.log(`error1 is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.filterFieldValueNotSet.rc," field  value should be number/string/object")
    //7  value必须是字符数字，对象
    value={name:1}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,0," field  value should be number/string/object")



    //8  fk的value必须是对象（存储对应的field：value）
    value={parentBillType:1}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    // console.log(`error1 is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.filterFieldValueFKFieldMustBeObject.rc," fk field  value should be object")
    //9 value的field数量不为1
    value={parentBillType:{name:'a',age:10}}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    test.equal(result.rc,validateFormatError.filterFieldValueFKFieldMustHasOnly1Field.rc,"fk  field value fields number not 1")

    //10 value是object，但其中key未在fkConfig中定义
    value={parentBillType:{'any':1}}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    // console.log(`error0 is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.filterFieldValueFKFieldRealtedFKNotDefine.rc," non fk field with value object")

    //11 fk field未在rule中
    delete rules.billType.name
     value={parentBillType:{'name':1}}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
/*    console.log(`rules is ${JSON.stringify(rules)}`)
     console.log(`error0 is ${JSON.stringify(result)}`)*/
     test.equal(result.rc,validateFormatError.filterFieldValueFKFieldNoRelateField.rc," field fk field not in forSetValue")
    rules.billType.name={}



     //12 最终的值必须是字符/数字/日期
     value={parentBillType:{age:{}}}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
     // console.log(`error0 is ${JSON.stringify(result)}`)
     test.equal(result.rc,validateFormatError.filterFieldValueTypeWrong.rc," fk field value must be number/string")

    //13 正确格式
    value={name:1}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    // console.log(`error0 is ${JSON.stringify(result)}`)
    test.equal(result.rc,0," correct format")


    test.done()
}

/*/!***************************************************************************!/
/!***************   validateSearchInputFormat
 * 当search的是或，验证输入的整体格式（是否包含seachParams/currentpage等）*******************!/
/!***************************************************************************!/
const validateSearchInputFormat=function(test){
    let func=testModule.validateSearchInputFormat
    let values,result
    test.expect(8)

    //1. 输入必须是object
    values=null
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartFormatWrong.rc,'values must be object')
    //2. 输入必须是object
    values=[]
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartFormatWrong.rc,'values must be object')

    //3.输入必须的object的key数量必须和exceptParts一致（2个：searchparams和currentpage）
    values={}
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartNumNotExcepted.rc,'values must contain 2 keys')

    //4.输入必须的object的key数量必须和exceptParts一致（2个：searchparams和currentpage）
    values={'any1':null,'any2':"null",'any3':null}
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartNumNotExcepted.rc,'values must contain 2 keys')

    //5 未定义字段
    values={'searchParams':{},'any':null}
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartMiss.rc,' any not expect part')

    //6. searchPamrs必须为object
    values={'searchParams':null,'currentPage':1}
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartSearchParamsValueFormatWrong.rc,' SearchParams must be object')

    //7. currentPage必须是整数
    values={'searchParams':{},'currentPage':'test'}
    result=func(values)
    test.equal(result.rc,validateFormatError.inputValuePartCurrentPageValueFormatWrong.rc,'currentPage must be int')

    //8 整体格式正常
    values={'searchParams':{},'currentPage':1}
    result=func(values)
    test.equal(result.rc,0)

    test.done()
}*/








/***************************************************************************/
/***************  part: earchParamsFormat   *******************/
/***************************************************************************/
/*     外键parentBillType需要指明要连接的外表字段，例如name和age     */
/*searchaParams:{
    name:[{value:'name1'},{value:'name2'}],
        age:[{value:18,compOp:'gt'},{value:20,compOp:'eq'}],
        parentBillType:
    {
        name:[{value:'asdf'},{value:'fda'}],
            age:[{value:12, compOp:'gt'}, {value:24, compOp:'lt'}]
    }
}*/
const validateSearchParamsFormat=function(test){
    test.expect(12)

    let func = testModule.validateSearchParamsFormat
    //let error = miscError.validateFunc.validateInputSearchFormat

    // let searchSetting=require('../../server/config/global/globalSettingRule').searchSetting
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    let value, result, tmp


    //1, no any search fields
    value={}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,0,'search input field zero')

    //2. inputRule中没有指定的coll的rule
    value={'field1':[{value:1}]}
    result=func(value,fkAdditionalFieldsConfig,'unknownColl',rules)
    test.equal(result.rc,validateFormatError.searchParamsCollNoRelatedRule.rc,'searchParams: coll no related rules')

    //2, search field is not defined in rule
    value={'field1':[{value:1}],'field2':[{value:1}],'field3':[{value:1}],'field4':[{value:1}],'field5':[{value:1}],'field6':[{value:1}],'field7':[{value:1}]}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.searchParamsFieldsExceed.rc,'search input fields exceed')

    //3, search field is not defined in rule
    value={'undefined':[{value:1}]}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,validateFormatError.searchParamsFieldNoRelatedRule.rc,'search input fields undefined')

    /*              对象的key必须在rule中定义           */
    value = {'notExistField': ['a']}
    result = func(value, fkAdditionalFieldsConfig, 'billType', rules)
    //console.log(result)
    test.equal(result.rc, validateFormatError.searchParamsFieldNoRelatedRule.rc, 'search input value key not exist check fail')
    /*              字段的值不能为空           */
    value = {'name': null}
    result = func(value, fkAdditionalFieldsConfig, 'billType', rules)
    //console.log(result)
    test.equal(result.rc, validateFormatError.searchParamsFiledValueCantEmpty.rc, 'search input value filed value empty check fail')

    /*              外键的关联字段必须是对象（key为field）           */
    value={'parentBillType':1}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    //console.log(result)
    test.equal(result.rc,validateFormatError.searchParamsFKFiledValueMustBeObject.rc,'search input value FK key not object check fail')
    /*              外键的关联字段必须在rule中定义           */
    value={'notExistFiled':{'notExistFiled':1}}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    //console.log(result)
    test.equal(result.rc,validateFormatError.searchParamsFKNoRelatedRule.rc,'search input value FK key not exist check fail')
    value={'parentBillType':{'notExistFiled':1}}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    //console.log(result)
    test.equal(result.rc,validateFormatError.searchParamsFKRelatedFieldInvalid.rc,'search input value FK key not exist check fail')
    /*              外键的关联字段未在fkconfig的relatedFields中定义          */
    value={'parentBillType':{'parentBillType':1}}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    //console.log(result)
    test.equal(result.rc,validateFormatError.searchParamsFKRelatedFieldInvalid.rc,'search input value FK key related field not allow check fail')
    /*              外键的冗余字段不能为空           */
    value={'parentBillType':{'name':null}}
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    //console.log(result)
    test.equal(result.rc,validateFormatError.searchParamsFKFiledValueCantEmpty.rc,'search input value FK key not exist check fail')


    /*          正确的值（当前函数+子函数subvalidateInputSearchFormat）          */
    value={
        name:[{value:'zw'},{value:'zw1'},{value:'zw2'}],
        parentBillType:{
            name:[{value:'zw'}],
            age:[{value:12,compOp:'gt'}]
        }
    }
    result=func(value,fkAdditionalFieldsConfig,'billType',rules)
    // console.log(`result is ${JSON.stringify(result)}`)
    test.equal(result.rc,0,'search input value success check fail')


    test.done()
}

/***************************************************************************/
/***************   singleSearchParams   *******************/
/***************************************************************************/
const validateSingleSearchParamsFormat=function(test){
    test.expect(14)
    // test.expect(2)
    let func = testModule.validateSingleSearchParamsFormat
    //let error = miscError.validateFunc.validateInputSearchFormat

    // let searchSetting=require('../../server/config/global/globalSettingRule').searchSetting
    //let preFunc=testModule.validate._private.checkRuleBaseOnRuleDefine
    let value, result, tmp




    /*              对象的value必须是数组           */
    //1
    value={name:'1234'}
    result=func(value.name,rules.billType.name)
    //console.log(result)
    test.equal(result.rc,validateFormatError.singleSearchParamsValueMustBeArray.rc,'field value is string check fail')
    value={name:null}
    result=func(value.name,rules.billType.name)
    //console.log(result)
    test.equal(result.rc,validateFormatError.singleSearchParamsValueMustBeArray.rc,'field value is null check fail')

    /*              对象的value必须是非空数组           */
    //3
    value={name:[]}
    result=func(value.name,rules.billType.name)
    //console.log(result)
    test.equal(result.rc,validateFormatError.singleSearchParamsValueCantEmpty.rc,'field value is [] check fail')

    /*              对象的value为数组，且长度不能超过预定值           */
    //4
    value={name:[1,2,3,4,5,6]}
    result=func(value.name,rules.billType.name)
    //console.log(result)
    test.equal(result.rc,validateFormatError.singleSearchParamsValueLengthExceed.rc,'search input value is [1,2,3,4,5,6] check fail')

    /*              对象的value的元素为对象           */
    //5
    value={name:[1]}
    result=func(value.name,rules.billType.name)
    test.equal(result.rc,validateFormatError.singleSearchParamsElementMustBeObject.rc,'search input value has non object element check fail')
    value={name:['']}
    result=func(value.name,rules.billType.name)
    test.equal(result.rc,validateFormatError.singleSearchParamsElementMustBeObject.rc,'search input value has "" element check fail')
    value={name:[null]}
    result=func(value.name,rules.billType.name)
    test.equal(result.rc,validateFormatError.singleSearchParamsElementMustBeObject.rc,'search input value has null element check fail')
    /*              对象的value的元素为对象，且key的数量不超过2           */
    value={name:[{key1:1,key2:2,key3:3}]}
    result=func(value.name,rules.billType.name)
    test.equal(result.rc,validateFormatError.singleSearchParamsElementKeysLengthExceed.rc,'search input value element key num exceed 2 check fail')


    /*              必须包含value这个key                                        */
    //9
    value={name:[{'notExistKey':'zw'}]}
    result=func(value.name,rules.billType.name)
    test.equal(result.rc,validateFormatError.singleSearchParamsElementContainUnexpectKey.rc,'search input value element key must contain key value check fail')



    /*              类型为数字或者日期的字段，必须有compOp                      */
    //10
    value={age:[{value:12}]}
    result=func(value.age,rules.billType.age)
    // console.log(`reslu is ${JSON.stringify(rules.billType.age)}`)
    test.equal(result.rc,validateFormatError.singleSearchParamsElementMissKeyCompOp.rc,'search input value is int not compOp check fail')

    value={age:[{'value':12,'compOp':'notExist'}]}
    result=func(value.age,rules.billType.age)
    test.equal(result.rc,validateFormatError.singleSearchParamsElementCompOpWrong.rc,'search input value is int with wrong compOp check fail')



    //成功的输入
    //12
    value={
        name:[{value:'zw'},{value:'zw1'},{value:'zw2'}],
        parentBillType:{
            name:[{value:'zw'}],
            age:[{value:12,compOp:'gt'}]
        }
    }
    result=func(value.name,rules.billType.name)
    test.equal(result.rc,0,'search input value success:name check fail')
    result=func(value.parentBillType.name,rules.billType.name)
    test.equal(result.rc,0,'search input value success:parentBillType.name check fail')
    result=func(value.parentBillType.age,rules.billType.age)
    test.equal(result.rc,0,'search input value success:parentBillType.age check fail')

    test.done()
}

/***************************************************************************/
/***************   editSubField   *******************/
/***************************************************************************/
const validateEditSubFieldFormat=function(test){
    test.expect(7)
    let func=testModule.validateEditSubFieldFormat
    let result,value

    //1     value is undefined
    // value=[]
    result=func(value)
    test.equal(result.rc,validateFormatError.editSubFieldMustBeObject.rc,'subField is undefined,not object check fail')
    //2      value is array
    value=[]
    result=func(value)
    test.equal(result.rc,validateFormatError.editSubFieldMustBeObject.rc,'subField is [],not object check fail')

    //3      key number smaller than 2
    value={k1:undefined}
    result=func(value)
    test.equal(result.rc,validateFormatError.editSubFieldKeyNumberWrong.rc,'subField key number is 1, check fail')
    //4      key number larger than 3
    value={k1:undefined,k2:undefined,k3:undefined,k4:undefined,}
    result=func(value)
    test.equal(result.rc,validateFormatError.editSubFieldKeyNumberWrong.rc,'subField key number is 14, check fail')

    //5      key not validate
    value={k1:undefined,k2:undefined,k3:undefined}
    result=func(value)
    test.equal(result.rc,validateFormatError.editSubFieldKeyNameWrong.rc,'subField key not validate, check fail')

    //6      from/to 2选1
    value={from:undefined,to:undefined}
    result=func(value)
    // console.log(result)
    test.equal(result.rc,validateFormatError.editSubFieldFromOrToExistOne.rc,'subField key not validate, check fail')

    //7     right result
    value={from:undefined,eleArray:undefined}
    result=func(value)
    // console.log(result)
    test.equal(result.rc,0,'subField key not validate, check fail')

    test.done()
}

/***************************************************************************/
/***************   EventFormat   *******************/
/***************************************************************************/
const validateEventFormat=function(test) {
    test.expect(8)
    let func = testModule.validateEventFormat
    let result, value

    //1     value is undefined
    // value=[]
    result=func(value)
    test.equal(result.rc,validateFormatError.eventMustBeObject.rc,'event is undefined,not object check fail')
    //2      value is array
    value=[]
    result=func(value)
    test.equal(result.rc,validateFormatError.eventMustBeObject.rc,'event is [],not object check fail')

    //3      key number smaller than 4
    value={k1:undefined}
    result=func(value)
    test.equal(result.rc,validateFormatError.eventKeyNumberWrong.rc,'event key number is 1, check fail')
    //4      key number larger than 5
    value={k1:undefined,k2:undefined,k3:undefined,k4:undefined,k5:undefined,k6:undefined,}
    result=func(value)
    test.equal(result.rc,validateFormatError.eventKeyNumberWrong.rc,'event key number is 6, check fail')

    //5      key not validate
    value={k1:undefined,k2:undefined,k3:undefined,k4:undefined,k5:undefined}
    result=func(value)
    test.equal(result.rc,validateFormatError.eventFieldKeyNameWrong.rc,'event key invalidate, check fail')

    //6      4个key时，只有targetId 可以不存在
    value={eventId:undefined,sourceId:undefined,targetId:undefined,status:undefined}
    result=func(value)
    // console.log(result)
    test.equal(result.rc,validateFormatError.eventMandatoryKeyNotExist.rc,'event key miss nabdatory field, check fail')

    //7     right result
    value={eventId:undefined,sourceId:undefined,cDate:undefined,status:undefined}
    result=func(value)
    // console.log(result)
    test.equal(result.rc,0,'event key no targetId, check fail')
    //7     right result
    value={eventId:undefined,sourceId:undefined,targetId:undefined,cDate:undefined,status:undefined}
    result=func(value)
    // console.log(result)
    test.equal(result.rc,0,'event contain all 5 keys, check fail')

    test.done()
}

exports.validate={
    validateReqBody,
    validatePartFormat,
    validateRecorderInfoFormat, //create/update的时候的recorderInfo
    validateFilterFieldValueFormat,  //part：filterFieldValue，
    validateSingleSearchParamsFormat,
    validateSearchParamsFormat,
    validateEditSubFieldFormat,
    validateEventFormat
}