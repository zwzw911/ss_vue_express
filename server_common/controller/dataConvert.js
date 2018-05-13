/**
 * Created by ada on 2017-01-25.
 * 在server端执行各种数据的转换处理
 * 1. subGenNativeSearchCondition/genNativeSearchCondition： 根据传入的searchParams，产生对应mongodb的搜索参数
 * 2. convertCreateUpdateValueToServerFormat: 将client端传入的数据field:{value:'xxx'}===> field:'xxx'，以便mongodb使用
 * 2. constructCreateCriteria:对传入的create的参数，删除其中value为null的字段
 * 3. constructUpdateCriteria：对传入的update的参数，将其中value为null的字段，转换成mongodb中unset
 */
"use strict";
const ap=require('awesomeprint')


const  mongoose = require('mongoose') //用于将objectId转换

const dataTypeCheck=require('../function/validateInput/validateHelper').dataTypeCheck

const inputDataRuleType=require('../constant/enum/inputDataRuleType')
const dataType=inputDataRuleType.ServerDataType
const ruleFiledName=inputDataRuleType.RuleFiledName
const otherRuleFiledName=inputDataRuleType.OtherRuleFiledName

const e_searchFieldName=inputDataRuleType.SearchFieldName
const e_fieldOp=inputDataRuleType.FieldOp
const e_arrayCompOp=inputDataRuleType.ArrayCompOp
const e_scalarCompOpForDigit=inputDataRuleType.ScalarCompOpForDigit
const e_scalarCompOpForDigitMatchToMongoOp=inputDataRuleType.ScalarCompOpForDigitMatchToMongoOp
const e_scalarCompOpForString=inputDataRuleType.ScalarCompOpForString

const genInputDataRuleType=require('../constant/genEnum/inputDataRuleTypeValue')
const e_fieldOpArrayValue=genInputDataRuleType.FieldOp
const e_arrayCompOpValue=genInputDataRuleType.ArrayCompOp
const e_scalarCompOpForDigitValue=genInputDataRuleType.ScalarCompOpForDigit
const e_scalarCompOpForStringValue=genInputDataRuleType.ScalarCompOpForString

const e_subField=require(`../constant/enum/nodeEnum`).SubField
const inputRules=require('../constant/inputRule/inputRule').inputRule


/*  对client输入的searchParams进行过滤，而不是直接转化后传给mongo
* */
function santiySearchParams({searchParams}){
    for(let singleCollName in searchParams){
        let collFieldOp=searchParams[singleCollName][e_searchFieldName.FIELD_OP]
        for(let singleFieldName in searchParams[singleCollName][e_searchFieldName.SEARCH_VALUE]){
            let arrayCopmOp=searchParams[singleCollName][e_searchFieldName.SEARCH_VALUE][singleFieldName][e_searchFieldName.ARRAY_COMP_OP]
            let arrayValue=searchParams[singleCollName][e_searchFieldName.SEARCH_VALUE][singleFieldName][e_searchFieldName.ARRAY_VALUE]
            let fieldRuleDefinition=inputRules[singleCollName][singleFieldName]

            for(let idx in arrayValue){
                let tmpResult=ifValueInRange({value:arrayValue[idx][e_searchFieldName.SCALAR_VALUE],fieldRule:fieldRuleDefinition})
                if(false===tmpResult){
                    //1. 如果fieldOp是AND，那么当arrayValue->scalarValue不符合的查询条件，直接delete整个field的查询
                    if(collFieldOp===e_fieldOp.AND){
                        delete searchParams[singleCollName][e_searchFieldName.SEARCH_VALUE][singleFieldName]
                    }
                    //2. 如果fieldOp是OR，那么当arrayValue->scalarValue不符合的查询条件，delete scalarCompOp+scalarValue
                    if(collFieldOp===e_fieldOp.OR){
                        searchParams[singleCollName][e_searchFieldName.SEARCH_VALUE][singleFieldName][e_searchFieldName.ARRAY_VALUE].splice(index, 1)
                    }
                }
            }
        }
    }

}

/* 检测当前value是否在fieldRule定义范围内
* */
function ifValueInRange({value,fieldRule}){
    let fieldDataTypeDefinition=fieldRule[otherRuleFiledName.DATA_TYPE]
    let fieldDataType= dataTypeCheck.isArray(fieldDataTypeDefinition) ? fieldDataTypeDefinition[0]:fieldDataTypeDefinition
    if(fieldDataType===dataType.DATE || fieldDataType===dataType.NUMBER || fieldDataType===dataType.INT || fieldDataType===dataType.FLOAT){
        if(undefined!==fieldRule[ruleFiledName.MIN]){
            if(value<fieldRule[ruleFiledName.MIN]['define']){return false}
        }
        if(undefined!==fieldRule[ruleFiledName.MAX]){
            if(value>fieldRule[ruleFiledName.MAX]['define']){return false}
        }
    }else if(fieldDataType===dataType.STRING ){
        if(undefined!==fieldRule[ruleFiledName.MAX_LENGTH]){
            if(value.length>fieldRule[ruleFiledName.MAX_LENGTH]['define']){return false}
        }
        if(undefined!==fieldRule[ruleFiledName.ENUM]){
            if(-1===fieldRule[ruleFiledName.ENUM]['define'].indexOf(value)){return false}
        }
    }else if(fieldDataType===dataType.OBJECT_ID ){

    }else{

    }

    return true
}

/*  将client传入的searchParams转换成nosql
* */
function convertSearchParamsToNoSQL({searchParams}){
    let result={}
    for(let singleCollName in searchParams){
        let fieldANDFlag=false
        let fieldORFlag=false

        result[singleCollName]={
            // '$and':{},
            // '$or':{},
        }
        switch (searchParams[singleCollName][e_searchFieldName.FIELD_OP]){
            case e_fieldOp.AND:
                result[singleCollName]['$and']=[]
                fieldANDFlag=true
                break
            case e_fieldOp.OR:
                result[singleCollName]['$or']=[]
                fieldORFlag=true
                break
            default:
                ap.err('未知fieldOp')
        }
        // ap.inf('init result',result)
        //判断最高级使用$and还是$or
/*        for(let singleFieldName in searchParams[singleCollName]){
            let fieldSearchParams=searchParams[singleCollName][singleFieldName]
        }*/
        for(let singleFieldName in searchParams[singleCollName][e_searchFieldName.SEARCH_VALUE]){
            let fieldSearchParams=searchParams[singleCollName][e_searchFieldName.SEARCH_VALUE][singleFieldName]
// ap.inf('fieldSearchParams',fieldSearchParams)
            // let fieldOp=fieldSearchParams[e_searchFieldName.FIELD_OP]
            let arrayCompOp=fieldSearchParams[e_searchFieldName.ARRAY_COMP_OP]
            let arrayValue=fieldSearchParams[e_searchFieldName.ARRAY_VALUE]

            let fieldDataTypeDefinition=inputRules[singleCollName][singleFieldName][otherRuleFiledName.DATA_TYPE]
            let fieldDataType= dataTypeCheck.isArray(fieldDataTypeDefinition) ? fieldDataTypeDefinition[0]:fieldDataTypeDefinition

            let fieldExpression
            if(fieldDataType===dataType.STRING || fieldDataType===dataType.OBJECT_ID){
                fieldExpression=convertStringArrayValueToExpression({arrayCompOp:arrayCompOp,fieldName:singleFieldName,arrayValue:arrayValue})
            }else if(fieldDataType===dataType.NUMBER || fieldDataType===dataType.DATE || fieldDataType===dataType.INT || fieldDataType===dataType.FLOAT){
                fieldExpression=convertDigitArrayValueToExpression({arrayCompOp:arrayCompOp,fieldName:singleFieldName,arrayValue:arrayValue})
            }
ap.inf('fieldExpression',fieldExpression)
            if(true===fieldANDFlag){
                if(undefined!==result[singleCollName]['$and']){
                    result[singleCollName]['$and'].push(fieldExpression)
                }
            }
            if(true===fieldORFlag){
                if(undefined!==result[singleCollName]['$or']){
                    result[singleCollName]['$or'].push(fieldExpression)
                }
            }
        }
    }
    return result
}

/*  将arrayValue的值转换成表达式
[{scalarCompOp:'gt',scalarValue:10},{scalarCompOp:'lt',scalarValue:100}]  ======>{$or/$and:[{field:{"$gt":10}},{field:{"$lt":100}]
[{scalarCompOp:'include',scalarValue:'zw'},{scalarCompOp:'exclude',scalarValue:'zw110'}]  ======>{$or/$and:{"$gt":10,"$lt":100}}
* */
function convertDigitArrayValueToExpression({arrayCompOp,fieldName,arrayValue}){
    let result={},finalResult={}
    // let needNotFlag= !(true===fieldNOTFlag && e_arrayCompOp.NONE===arrayCompOp) //如果field级别有NOT，且scalar级别有NONE，则互相抵消

    for(let singleEle of arrayValue){
        let scalarCompOp=singleEle[e_searchFieldName.SCALAR_COMP_OP]
        let scalarValue=singleEle[e_searchFieldName.SCALAR_VALUE]

        switch (scalarCompOp){
            case e_scalarCompOpForDigit.EQUAL:
                if(undefined===result['$in']){
                    result['$in']=[]
                }
                result['$in'].push(scalarValue)
                break;
            case e_scalarCompOpForDigit.UNEQUAL:
                if(undefined===result['$nin']){
                    result['$nin']=[]
                }
                result['$nin'].push(scalarValue)
                break;
            case e_scalarCompOpForDigit.LESS_EQUAL:
                result['$lte']=scalarValue
                break;
            case e_scalarCompOpForDigit.LESS:
                result['$lt']=scalarValue
                break;
            case e_scalarCompOpForDigit.GREATER_EQUAL:
                result['$gte']=scalarValue
                break;
            case e_scalarCompOpForDigit.GREATER:
                result['$gt']=scalarValue
                break;
        }
    }

    // {"$in":[12]}  ======>  {"$eq":12}
    if(undefined!==result['$in'] && result['$in'].length===1){
        result["$eq"]=result["$in"][0]
        delete result["$in"]
    }
    // {"$in":[12]}  ======>  {"$eq":12}
    if(undefined!==result['$nin'] && result['$nin'].length===1){
        result["$ne"]=result["$nin"][0]
        delete["$nin"]
    }

    ap.inf('digit result',result)
    let fieldANDORCompOp,fieldNOTCompOp
    for(let singleArrayCompOp of arrayCompOp){
        if(e_arrayCompOp.ANY===singleArrayCompOp){
            fieldANDORCompOp="$or"
        }else if(e_arrayCompOp.ALL===singleArrayCompOp){
            fieldANDORCompOp="$and"
        }

        if(e_arrayCompOp.NONE===singleArrayCompOp){
            fieldNOTCompOp="$not"
        }
    }
    /*switch (arrayCompOp){
        case e_arrayCompOp.NONE:
            fieldEleCompOp="$not"
            break
        case e_arrayCompOp.ALL:
            fieldEleCompOp="$and"
            break
        case e_arrayCompOp.ANY:
            fieldEleCompOp="$or"
            break
        default:
            ap.err('未知arrayCompOp')
    }
    finalResult[fieldEleCompOp]=[]*/
    for(let compOp in result){
        // let eleSql={}
        if(undefined===finalResult[fieldANDORCompOp]){
            finalResult[fieldANDORCompOp]=[]
        }
        if(undefined!==fieldANDORCompOp){
            if(undefined!==fieldNOTCompOp ){
                finalResult[fieldANDORCompOp].push({
                    [fieldName]:{[fieldNOTCompOp]:{[compOp]:result[compOp]}}
                })
            }else{
                finalResult[fieldANDORCompOp].push({
                    [fieldName]:{[compOp]:result[compOp]}
                })
            }

        }


    }


    ap.inf('digit finalResult',finalResult)
    return finalResult
}

/*  将arrayValue的值转换成表达式
[{scalarCompOp:'gt',scalarValue:10},{scalarCompOp:'lt',scalarValue:100}]  ======>{$or/$and:{"$gt":10,"$lt":100}}
[{scalarCompOp:'include',scalarValue:'zw'},{scalarCompOp:'exclude',scalarValue:'zw110'}]  ======>{$or/$and:{"$gt":10,"$lt":100}}
* */
function convertStringArrayValueToExpression({arrayCompOp,fieldName,arrayValue}){
    let result={},finalResult={}
    for(let singleEle of arrayValue){
        let scalarCompOp=singleEle[e_searchFieldName.SCALAR_COMP_OP]
        let scalarValue=singleEle[e_searchFieldName.SCALAR_VALUE]

        let searchString
        switch (scalarCompOp){
            case e_scalarCompOpForString.EXACT:
                if(undefined===result['$in']){
                    result['$in']=[]
                }
                searchString=scalarValue
                result['$in'].push(scalarValue)
                break;
            case e_scalarCompOpForString.INCLUDE:
                if(undefined===result['$in']){
                    result['$in']=[]
                }
                searchString=new RegExp(scalarValue,'i')
                // ap.inf('searchString',searchString.toString())
                result['$in'].push(searchString)
                break;
            case e_scalarCompOpForString.EXCLUDE:
                if(undefined===result['$nin']){
                    result['$nin']=[]
                }
                result['$nin'].push(new RegExp(scalarValue,'i'))
                break;

        }
    }
    let fieldANDORCompOp,fieldNOTCompOp
    for(let singleArrayCompOp of arrayCompOp){
        if(e_arrayCompOp.ANY===singleArrayCompOp){
            fieldANDORCompOp="$or"
        }else if(e_arrayCompOp.ALL===singleArrayCompOp){
            fieldANDORCompOp="$and"
        }

        if(e_arrayCompOp.NONE===singleArrayCompOp){
            fieldNOTCompOp="$not"
        }
    }
    /*switch (arrayCompOp){
        case e_arrayCompOp.NONE:
            fieldEleCompOp="$not"
            break
        case e_arrayCompOp.ALL:
            fieldEleCompOp="$and"
            break
        case e_arrayCompOp.ANY:
            fieldEleCompOp="$or"
            break
        default:
            ap.err('未知arrayCompOp')
    }
    finalResult[fieldEleCompOp]=[]*/

    ap.inf('string result',result)
    for(let compOp in result){
        // let eleSql={}
        if(undefined===finalResult[fieldANDORCompOp]){
            finalResult[fieldANDORCompOp]=[]
        }
        if(undefined!==fieldANDORCompOp){
            if(undefined!==fieldNOTCompOp ){
                finalResult[fieldANDORCompOp].push({
                    [fieldName]:{[fieldNOTCompOp]:{[compOp]:result[compOp]}}
                })
            }else{
                finalResult[fieldANDORCompOp].push({
                    [fieldName]:{[compOp]:result[compOp]}
                })
            }

        }


    }
    ap.inf('string finalResult',finalResult)
    return finalResult
}


/*将前端传入的search value转换成mongodb对应的select condition（如此方便在mongodb中直接使用，来进行调试）。
 *  返回一个object {field；{condition}}
 * 分成2个函数，好处是层次清楚：
 *       主函数负责把输入拆解成field:[{value:xx,compOp:'gt'},{value:yyy,compOp:'lt'}]的格式，
 *       子函数负责处理元素中所有的值，并转换成对应的condition
 * 输入参数：
 *           1.inputSearch
 *           name:[{value:'name1'},{value:'name2'}],
 age:[{value:18,compOp:'gt'},{value:20,compOp:'eq'}],
 parentBillType:
 {
 name:[{value:'asdf'},{value:'fda'}],
 age:[{value:12, compOp:'gt'}, {value:24, compOp:'lt'}]
 }
 }
 *           client传入的搜索参数，以coll为单位。因为使用独立的函数进行处理，所以可以和validateInput的输入参数不一致.如此可以简化对格式的检查步骤
 *           2. fkAdditionalFieldsConfig：：{parentBillType:{relatedColl:billtye, forSetValue:['name']}}
 *           搜索参数，如果有外键，从中获得外键对应的coll.field，查询得知对应inputRule。以coll为单位
 *           3. collName
 *           当前对哪一个coll进行搜索
 * */
const genNativeSearchCondition=function(clientSearchParams,collInputRule,collFkConfig){
    //所有的查询条件都是 或
    let fieldsType={} //{name:dataType.string,age:dataType.int}  普通字段，只有一个key，外键：可能有一个以上的key
    let result={}
// console.log(`dataTypeCheck.isEmpty(clientSearchParams) is ${JSON.stringify(dataTypeCheck.isEmpty(clientSearchParams))}`)
    //有search参数传入，则进行转换
    if(false===dataTypeCheck.isEmpty(clientSearchParams)){
        result={'$or':[]}
        for(let singleField in clientSearchParams){

            //普通字段
            if(false===singleField in collFkConfig){
                //普通的外键的变量分开（外键的必须在冗余字段的for中定义，否则会重复使用）
                let fieldValue,fieldRule,fieldValueType,fieldCondition,fieldResult={}
                fieldValue=clientSearchParams[singleField]
                fieldRule=collInputRule[singleField]
                /*            fieldValueType=fieldRule['type']
                 if(dataType.string===fieldValueType){
                 fieldValue=new RegExp(fieldValue,'i')
                 }*/
                fieldCondition=subGenNativeSearchCondition(fieldValue,fieldRule)
                fieldResult[singleField]=fieldCondition
                result['$or'].push(fieldResult)
            }
            //外键字段
            if(collFkConfig[singleField]){
                let fkConfig=collFkConfig[singleField]
                for(let fkRedundantField in clientSearchParams[singleField]){
                    //每个外键字段的变量要重新定义，否则fieldResult会重复push
                    let fieldValue,fieldRule,fieldValueType,fieldCondition,fieldResult={}
                    fieldValue=clientSearchParams[singleField][fkRedundantField]
                    fieldRule=inputRules[fkConfig['relatedColl']][fkRedundantField]
                    // console.log(`rules is ${JSON.stringify(rules)}`)
                    // console.log(`field rule is ${JSON.stringify(fieldRule)}`)
                    /*                console.log(`field value is ${JSON.stringify(fieldValue)}`)
                     fieldValueType=fieldRule['type']
                     console.log(fieldValueType)
                     // console.log(`field type is ${fieldRule['type']}`)
                     if(dataType.string===fieldValueType){
                     fieldValue=new RegExp(fieldValue,'i')
                     }
                     console.log(fieldValue)*/
                    fieldCondition=subGenNativeSearchCondition(fieldValue,fieldRule)
                    //外键对应的冗余父字段.子字段
                    fieldResult[`${fkConfig['nestedPrefix']}.${fkRedundantField}`]=fieldCondition
                    //使用冗余字段进行查找
                    result['$or'].push(fieldResult)
                }
            }
        }
    }

    return result
}

//放回field对应的condition（不包含fieldname，需要在主函数中自己组装）
//fieldValue是数组，其中每个元素是object：   name:[{value:‘name1’},{value:’name2’}]
function subGenNativeSearchCondition(fieldValue,fieldRule){
    let fieldDataType=fieldRule.type
    //保存最终的查询条件
    let conditionResult={}
    //如果是字符，那么把所有的值都放到$in中
    // console.log(`fieldValue is ${JSON.stringify(fieldValue)}`)
    if(dataType.string===fieldDataType){
        let inArray=[]
        for(let singleElement of fieldValue){
            // console.log(`singleElement value is ${JSON.stringify(singleElement['value'])}`)
            let value
            //是字符，且是枚举值，则查询值为整个匹配查找；否则是包含查找
            if(true==='enum' in fieldRule){
                value=singleElement['value']
            }else{
                value=new RegExp(singleElement['value'],'i')
            }

            // console.log(`value is ${JSON.stringify(value)}`)
            inArray.push(value)
        }
        // console.log(`inArray is ${JSON.stringify(inArray)}`)
        conditionResult['$in']=inArray
        // console.log(`conditionResult is ${JSON.stringify(conditionResult)}`)
    }
    //如果是数值，需要3个数组gt/lt/eq进行判别
    if(dataType.date===fieldDataType || dataType.number===fieldDataType || dataType.float===fieldDataType || dataType.int===fieldDataType){
        //存储所有数值
        let gtArray=[],ltArray=[],eqArray=[]
        for(let singleElement of fieldValue){
            let valueToBePush=singleElement['value']
            if(dataType.date===fieldDataType){
                console.log(`date  orig is ${valueToBePush}`)
                valueToBePush=new Date(valueToBePush)
                console.log(`date  converted is ${valueToBePush}`)
            }
            // console.log(`singleElement is ${JSON.stringify(singleElement)}`)
            switch (singleElement['compOp']){
                case compOp.gt:
                    gtArray.push(valueToBePush)
                    break
                case compOp.lt:
                    ltArray.push(valueToBePush)
                    break
                case compOp.eq:
                    ltArray.push(valueToBePush)
                    break
            }
        }
        /*        console.log(gtArray)
         console.log(ltArray)
         console.log(eqArray)*/
        //如果是gt/lt，只取出最小/最大值
        if(false===dataTypeCheck.isEmpty(gtArray)){
            conditionResult['$gt']=Math.min.apply(null,gtArray)
        }
        if(false===dataTypeCheck.isEmpty(ltArray)){
            conditionResult['$lt']=Math.min.apply(null,ltArray)
        }
        //如果eq，则放在$in中
        if(false===dataTypeCheck.isEmpty(eqArray)){
            conditionResult['$in']=eqArray
        }
    }
    return conditionResult
}
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

//前端传入的数据是{filed:{value:'xxx'}}的格式，需要转换成普通的key:value mongoose能辨认的格式{filed:'xxx'}
const convertCreateUpdateValueToServerFormat=function(values){
/*    let result={}
     for(let key in values){
     if(values[key]['value'] || null===values[key]['value'] ){
     result[key]=values[key]['value']
     }
     }
     return result*/
    for(let key in values){
        //value值存在（包含null)
        if(undefined!==values[key]['value'] || null===values[key]['value'] ){
            values[key]=values[key]['value']
        }
    }
}

//对create传入的参数进行检测，如果设置为null或者空值（空对象，空数组，空字符串），就认为无需传入db而直接删除
const constructCreateCriteria=function(formattedValues){
    for(let key in formattedValues){
        if(formattedValues[key]===null || dataTypeCheck.isEmpty(formattedValues[key])){
            delete formattedValues[key]
            // continue
        }
    }

}

//对update传入的参数进行检测，如果设置为null或者空对象/数字/字符，就认为对应的field是要删除的，放入$unset中（如果此field是外键，还要把对应的冗余字段$unset掉）
//formattedValues: 经过convertClientValueToServerFormat处理的输入条件
const constructUpdateCriteria=function(formattedValues){
    // console.log(`fkconfig is ${JSON.stringify(singleCollFKConfig)}`)
    for(let key in formattedValues){
        if(formattedValues[key]===null || dataTypeCheck.isEmpty(formattedValues[key])){
            //{field1:null,field2:xxx}======>{'$unset':{field1;any},field2:xxx}
            //如果没有$unset字段，则新建一个
            if(undefined===formattedValues['$unset']){
                formattedValues['$unset']={}
            }
            //把null值字段放入$unset字段
            formattedValues['$unset'][key]=1
            delete formattedValues[key]
            //检查当前键是否有对应的外键设置，有的话删除对应的冗余字段
/*            if(true=== key in singleCollFKConfig){
                let redundancyField=singleCollFKConfig[key]['nestedPrefix']
                formattedValues['$unset'][redundancyField]=1
            }*/
        }
    }
    //console.log(`constructUpdateCriteria result is ${JSON.stringify(formattedValues)}`)

}

//将mongosse的document转换成object，并删除不需要在client显示的字段
const convertToClient=function(document,skipFields){
    let clientDoc=document.toObject()
    for(let fieldName of skipFields){
        delete  clientDoc[fieldName]
    }
    return clientDoc
}

//为了实现validateCreateRecorderValue/validateUpdateRecorderValue的验证，需要将{field:val}=====》{field:{value:val}}
/*const addSubFieldKeyValue=function(obj){
    let newValue={}
    for(let fieldName in obj){
        // newValue[fieldName]={'value':obj[fieldName]}
        newValue[fieldName]=obj[fieldName]
    }

    return newValue
}*/

function convertToObjectId(str){
    return mongoose.Types.ObjectId(str)
}


/*  将editSubField的整个part值，转换成NOSQL语句（使用findByIdAndUpdate）
* @editSubFieldValue: 整个part的值
*
* return: undefined或者Object，以form/to的id为key，其下根据from/to设置$addToSet或者$pullAll
* //其下2个key：fromNoSql/toNoSql，都是object，键为from/to对应的objectId，值为$addToSet或者$pullAll(2者只能选一个)
* result:{
*   id1:{
*       $addToSet:{
*           field1:{
*               $each:[]
*           },
*           field2:{
*               $each:[]
*           }
*       },
*   }
*   id2:{
*       $pullAll:{
*           field1:[],
*           field2:[],
*       },
*   }
* }
* */
function convertEditSubFieldValueToNoSql({editSubFieldValue}){
    let result
    for(let singleFieldName in editSubFieldValue) {
        let singleFieldValue
        // console.log(`singleFieldName===>${JSON.stringify(singleFieldName)}`)
        if (undefined !== editSubFieldValue[singleFieldName]) {
            singleFieldValue = editSubFieldValue[singleFieldName]
        }
        // console.log(`singleFieldValue===>${JSON.stringify(singleFieldValue)}`)
        //如果from/to同时存在，且值一致，无需操作
        if (undefined !== singleFieldValue[e_subField.FROM] && undefined !== singleFieldValue[e_subField.TO] && singleFieldValue[e_subField.FROM] === singleFieldValue[e_subField.TO]) {
            continue
        }
        //设置key（id）
        if (undefined !== singleFieldValue[e_subField.TO]) {
            let toRecordId = singleFieldValue[e_subField.TO]
            let eleValue = singleFieldValue[e_subField.ELE_ARRAY]

            if (undefined === result) {
                result = {}
            }
            if (undefined === result[toRecordId]) {
                result[toRecordId] = {}
            }
            if (undefined === result[toRecordId]['$addToSet']) {
                result[toRecordId]['$addToSet'] = {}
            }
            if (undefined === result[toRecordId]['$addToSet'][singleFieldName]) {
                result[toRecordId]['$addToSet'][singleFieldName] = {}
            }
            if (undefined === result[toRecordId]['$addToSet'][singleFieldName]["$each"]) {
                result[toRecordId]['$addToSet'][singleFieldName]["$each"] = eleValue
            } else {
                result[toRecordId]['$addToSet'][singleFieldName]["$each"] = result[toRecordId]['$addToSet'][singleFieldName]["$each"].concat(eleValue)
            }
        }
        //设置key（id）
        if (undefined !== singleFieldValue[e_subField.FROM]) {
            let fromRecordId = singleFieldValue[e_subField.FROM]
            let eleValue = singleFieldValue[e_subField.ELE_ARRAY]

            if (undefined === result) {
                result = {}
            }
            if (undefined === result[fromRecordId]) {
                result[fromRecordId] = {}
            }
            if (undefined === result[fromRecordId]['$pullAll']) {
                result[fromRecordId]['$pullAll'] = {}
            }
            if (undefined === result[fromRecordId]['$pullAll'][singleFieldName]) {
                result[fromRecordId]['$pullAll'][singleFieldName] = eleValue
            } else {
                result[fromRecordId]['$pullAll'][singleFieldName] = result[fromRecordId]['$pullAll'][singleFieldName].concat(eleValue)
            }
            /*          if(undefined===result[singleFieldValue[e_subField.FROM]]['$addToSet'][singleFieldName]["$each"]) {
             result[singleFieldValue[e_subField.FROM]]['$addToSet'][singleFieldName]["$each"] = singleFieldValue[e_subField.ELE_ARRAY]
             }else{

             }*/
        }
    }
           /* console.log(`fromNoSql===>${JSON.stringify(fromNoSql)}`)
            //设置findByIdAndUpdate中的id
            if(undefined===fromNoSql[`id`]){
                fromNoSql[`id`]=singleFieldValue[e_subField.FROM]
            }
            //设置findByIdAndUpdate中的operation
            if(undefined===fromNoSql[`operation`]){
                fromNoSql[`operation`]={}
            }
            // ($pullAll)
            if(undefined===fromNoSql[`operation`][`$pullAll`]){
                fromNoSql[`operation`][`$pullAll`]={}
            }
            //设置字段
            if(undefined===fromNoSql[`operation`][`$pullAll`][singleFieldName]){
                fromNoSql[`operation`][`$pullAll`][singleFieldName]=[]
            }
            fromNoSql[`operation`][`$pullAll`][singleFieldName]=fromNoSql[`operation`][`$pullAll`][singleFieldName].concat(singleFieldValue[e_subField.ELE_ARRAY])
        }
        //to有值(增加)
        if(undefined!==singleFieldValue[e_subField.TO]){
            if(undefined===toNoSql){
                toNoSql={}
            }
            //设置findByIdAndUpdate中的id
            if(undefined===toNoSql[`id`]){
                toNoSql[`id`]=singleFieldValue[e_subField.TO]
            }
            //设置findByIdAndUpdate中的operation
            if(undefined===toNoSql[`operation`]){
                toNoSql[`operation`]={}
            }
            // ($addToSet)
            if(undefined===toNoSql[`operation`][`$addToSet`]){
                toNoSql[`operation`][`$addToSet`]={}
            }
            //设置字段
            if(undefined===toNoSql[`operation`][`$addToSet`][singleFieldName]){
                toNoSql[`operation`][`$addToSet`][singleFieldName]={}
            }
            //设置字段的$each
            if(undefined===toNoSql[`operation`][`$addToSet`][singleFieldName][`$each`]){
                toNoSql[`operation`][`$addToSet`][singleFieldName][`$each`]=[]
            }
            toNoSql[`operation`][`$addToSet`][singleFieldName][`$each`]=toNoSql[`operation`][`$addToSet`][singleFieldName][`$each`].concat(singleFieldValue[e_subField.ELE_ARRAY])
        }
    }

    let result={fromNoSql,toNoSql}
    if(undefined===result[`fromNoSql`]){
        delete result[`fromNoSql`]
    }
    if(undefined===result[`toNoSql`]){
        delete result[`toNoSql`]
    }*/
    return result
}
module.exports={
    convertSearchParamsToNoSQL,
    genNativeSearchCondition,
    convertCreateUpdateValueToServerFormat,
    constructCreateCriteria,
    constructUpdateCriteria,
    convertToClient,

    //只在dev环境下使用。//无需使用，recordInfo格式已经改成field:value
    // addSubFieldKeyValue,

    convertToObjectId,

    convertEditSubFieldValueToNoSql,
}
/*

let clientSql={
    user:{
        [e_searchFieldName.FIELD_OP]:e_fieldOp.AND,
        [e_searchFieldName.SEARCH_VALUE]: {
            name: {

                [e_searchFieldName.ARRAY_COMP_OP]: [e_arrayCompOp.ANY,e_arrayCompOp.NONE],
                [e_searchFieldName.ARRAY_VALUE]: [
                    {
                        [e_searchFieldName.SCALAR_COMP_OP]: e_scalarCompOpForString.INCLUDE,
                        [e_searchFieldName.SCALAR_VALUE]: 'zw',
                    },
                    {
                        [e_searchFieldName.SCALAR_COMP_OP]: e_scalarCompOpForString.INCLUDE,
                        [e_searchFieldName.SCALAR_VALUE]: 'wzhan039wzhan039wzhan039wzhan039wzhan039wzhan039wzhan039',
                    },
                ]
            },
            /!*            nickname:{
                            [e_searchFieldName.FIELD_OP]:[e_fieldOp.AND,e_fieldOp.NOT],
                            [e_searchFieldName.ARRAY_COMP_OP]:e_arrayCompOp.ANY,
                            [e_searchFieldName.ARRAY_VALUE]:[
                                {
                                    [e_searchFieldName.SCALAR_COMP_OP]:e_scalarCompOpForString.EXACT,
                                    [e_searchFieldName.SCALAR_VALUE]:'zhangwei',
                                },
                            ]
                        },*!/
            lastSignInDate: {

                [e_searchFieldName.ARRAY_COMP_OP]: [e_arrayCompOp.ANY,e_arrayCompOp.NONE],
                [e_searchFieldName.ARRAY_VALUE]: [
                    {
                        [e_searchFieldName.SCALAR_COMP_OP]: e_scalarCompOpForDigit.EQUAL,
                        [e_searchFieldName.SCALAR_VALUE]: 18,
                    },
                    {
                        [e_searchFieldName.SCALAR_COMP_OP]: e_scalarCompOpForDigit.EQUAL,
                        [e_searchFieldName.SCALAR_VALUE]: 65,
                    },
                ]
            },
        }
    }
}

santiySearchParams({searchParams:clientSql})
ap.inf('after sanity',clientSql)
ap.inf('nosql',convertSearchParamsToNoSQL({searchParams:clientSql}))*/
