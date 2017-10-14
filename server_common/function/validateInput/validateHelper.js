/**
 * Created by wzhan039 on 2016-02-25.
* validate用到的辅助函数
 * 1. dataTypeCheck：判断数据类型和数据是否为空
 * 2. valueTypeCheck: 根据数据类型，自动调用对应的dataTypeCheck进行检查
 * 3. ruleFormatCheck： 检查手工定义的rule文件（根据mongodb的定义），是否有错
 * 4. genInputError：产生可读的错误信息
 * 5. valueMatchRuleDefineCheck：出入值和某个rule（min/max/minLenght/maxLength），是否符合
 */
'use strict'
//require("babel-polyfill");
//require("babel-core/register")

/*import * as fs from 'fs'
import {serverRuleType} from '../../define/enum/validEnum'
import {regex} from '../../define/regex/regex'
 import {serverDataType,serverRuleType} from '../../define/enum/validEnum'
 */

const fs=require('fs')
const serverRuleType=require('../../constant/enum/inputDataRuleType').ServerRuleType
const serverDataType=require('../../constant/enum/inputDataRuleType').ServerDataType
const regex=require('../../constant/regex/regex').regex
const validateHelperError=require('../../constant/error/validateError').validateRule

const rightResult={rc:0,msg:null}

// const regex=require(`../../constant/regex`).regex
/*
 * 除了checkInputValue使用，其他地方也可能使用，所以单独作为一个函数
 * 数值123.0复制后，实际变成123，影响程序处理方式
 * */
const dataTypeCheck= {
    //是否已经赋值
    isSetValue(variant){
        return (undefined !== variant && null !== variant)
    },
    //已经赋值，赋的值是不是为空（string:空字符串；object:{},array:[]）
    isEmpty(value) {
        //console.log(`to be checked value type is ${typeof value}`)
        //console.log(`is empty to be checked value is ${JSON.stringify(value)}`)
        if (undefined === value || null === value ) {
            //console.log(`null/undefined/NaN checked`)
            return true
        }

        switch (typeof value) {
            case "string":
                return ( "" === value || 0 === value.length || "" === value.trim());
                break;
            case "object":
                if (true === this.isArray(value)) {
                    // console.log(`empty array checked: ${JSON.stringify(value)}`)
                    return 0 === value.length

                } else {
                    //console.log(`object checked`)
                    //console.log(`object length is ${Object.keys(value).length}`)
                    return 0 === Object.keys(value).length
                }
                break;
        }
        return false
    },

    isArray(obj) {
        //return obj && typeof obj === 'object' && Array == obj.constructor;
        return obj instanceof Array
        // return typeof obj === 'object'  && obj!==null && Array == obj.constructor;
    },

    isObject(obj){
        //return obj && typeof obj === 'object' && Object == obj.constructor;
        //如果添加obj的话，和bool值&&后，变成obj，而不是bool了
        // ‘’ && false 等于 ''       false  && ''   等于 false
        //null && false 等于 null         false  && null   等于 false
        //undefined && false 等于 undefined           false  && undefined   等于 false
        //null也是object，所以需要排除
        return typeof obj === 'object' && obj!==null && Object == obj.constructor;
    },
    isString(value){
        return typeof value === 'string'
    },
//检查是否有效日期; 返回false或者转换后的日期
    isDate(date) {
        let parsedDate=new Date(date)
        if(parsedDate.toLocaleString() ===  'Invalid Date'){
            return false
        }
        return parsedDate;
        //}
    },
    isInt(value) {
        //首先检查类型，只对number或者string进行处理（否则parseInt对array也起作用）
        let tmpType=typeof value
        if(tmpType!='number' && tmpType!='string'){
            return false
        }
        let parsedInt=parseInt(value)
        if(isNaN(parsedInt)){
            return false
        }
        //对于字符来说，如果小数点之后是全0，认为不是整数（即'1.0'不等于'1'）
        if (typeof value == 'string') {
            /*console.log(`${value} is string`)
             console.log(parseInt(value).toString()===value)*/
            if(parsedInt.toString() !== value){
                return false
            }
        }
        if (typeof value == 'number') {
            //对于数值来说，如果小数点之后是全0，认为是整数（即1.0等于1）
            if( parsedInt !== value){
                return false
            }
        }
        return parsedInt
        //return false
    },
    //严格模式，待检查值是数值（而不是字符）
    //value===parseInt(value)============> 1.0=>1
    isStrictInt(value){
        return ('number'===typeof value && !isNaN(parseInt(value)) && value===parseInt(value))
    },
    isStrictFloat(value){
        //json格式，可以传送原始数据格式
        //可能会出现1.0===>1  1234567891234567891234567899===>1.23456789e25，所以只能通过NaN判断是否为浮点
        return ('number'===typeof value && !isNaN(parseFloat(value)) && value===parseFloat(value))

    },
    //返回整数或者浮点数
    isStrictNumber(value){
        //json格式，可以传送原始数据格式
        //可能会出现1.0===>1  1234567891234567891234567899===>1.23456789e25，所以只能通过NaN判断是否为浮点
        return ('number'===typeof value && !isNaN(Number(value)) && value===Number(value))

    },
    //整数，但是超出int所能表示的范围（无法处理，大数会变成科学计数法，从而无法用regex判断）。所以只能处理string类型
    isNumber(value) {

        //是NaN，则确定必然是非number
        if(isNaN(value)){
            return false
        }
        //非NaN，还要排除是不是空数组或者空字符，这2个可以被转换成数字0
        let r=Number(value)
        //如果转换后是0，要判断是不是[]或者''转换得到的
        if(r===0){
            return r.toString() === value.toString()
        }
            return true
        //非字符，直接用isInt和isFloat判断
/*        if('string' !== typeof value){
            //value=value.toString()
            return false //无法处理数字，因为大数字在赋值时被转换成科学计数法，从而无法用regex判断
        }else{
            //字符，使用
            return regex.number.test(value)
        }*/

    },

    //对于大的数字，parseFloat会转换成科学计数法(1.23e+56)
    isFloat(value){
        //首先检查类型，只对number或者string进行处理（否则parseInt对array也起作用）
        let tmpType=typeof value
        if(tmpType!='number' && tmpType!='string'){
            return false
        }
        let parsedValue=parseFloat(value)
        if(true===isNaN(parsedValue)){
            return false
        }
        if('string' === typeof value){
            //==，string隐式转换成数字进行比较
            if( parsedValue!=value){
                return false
            }
        }

        if (typeof value == 'number') {
            if(parsedValue !== value){
                return false
            }
        }

        return parsedValue
    },


    isPositive(value) {

        let parsedValue = parseFloat(value)
        /*        if(isNaN(parsedValue)){
         return false
         }*/
        return parsedValue > 0
    },
    isFolder(path) {
        return fs.statSync(path).isDirectory()
    },

    isFile(file) {
        return fs.statSync(file).isFile()
    },
    isBoolean(value){
        return (typeof value === 'boolean')
    }
}

//对dataTypeCheck进行封装
function valueTypeCheck(value, type){
    switch (type) {
        case serverDataType.INT:
            return dataTypeCheck.isStrictInt(value)   //返回boolean（client可以保存传入的数据格式）
        case serverDataType.FLOAT:
            return dataTypeCheck.isStrictFloat(value)   //返回boolean（client可以保存传入的数据格式）
        case serverDataType.STRING:
            return dataTypeCheck.isString(value)
        case serverDataType.DATE:
            return dataTypeCheck.isDate(value)
        case serverDataType.ARRAY:
            return dataTypeCheck.isArray(value)
        case serverDataType.OBJECT:
            return dataTypeCheck.isObject(value)
            return true
        case serverDataType.OBJECT_ID://在validateValue中通过format进行判断
            return dataTypeCheck.isString(value)
            return true
        case serverDataType.FILE: //必须是string，且存在，才能判断
            return (dataTypeCheck.isString(value) && valueMatchRuleDefineCheck.isFileFolderExist(value) && dataTypeCheck.isFile(value));
        case serverDataType.FOLDER:
            return (dataTypeCheck.isString(value) && valueMatchRuleDefineCheck.isFileFolderExist(value) && dataTypeCheck.isFolder(value))
        case serverDataType.NUMBER:
            return dataTypeCheck.isStrictNumber(value)
        case serverDataType.BOOLEAN:
            return dataTypeCheck.isBoolean(value)
        default:
            return validateHelperError.unknownDataType
    }
}


/**
 * 对Rule定义进行检测，确保定义是正确
 */
/*          rule        */
/*1. 至少定义3个字段：chineseName/type/require
 * 2
 * */
/*
 * 对单个字段的所有rule定义进行检查
 * coll/singleFieldName:如果字段错误，为返回值提供错误coll/field的名称（其他错误，可以使用chineseName）；singleFieldInputRules：field的rule定义
 * 返回：{rc:0}或者{rc:xxxx,msg:'field的rule定义错误'}
 * */
function ruleFormatCheck(collName,singleFieldName,singleFieldInputRules){
    let rc={}
    //0 检测rle必须是object
    if(false==dataTypeCheck.isObject(singleFieldInputRules)){
        return validateHelperError.ruleMustBeObject
    }

    //1 检查必须的field
    let mandatoryFields=['chineseName','type','require']
    for(let mandatoryField of mandatoryFields){
        //console.log(inputRules[inputRule][mandatoryField])
        if(false===dataTypeCheck.isSetValue(singleFieldInputRules[mandatoryField])){
            //console.log()
            rc['rc']=validateHelperError.mandatoryFiledNotExist.rc
            rc['msg']=`${singleFieldName}的规则${mandatoryField}${validateHelperError.mandatoryFiledNotExist.msg}`
            return rc
        }
    }
    //2 检查chineseName是否为字符，是否空，type是否在指定范围内（require由后面的rule check统一处理）
    if(false===dataTypeCheck.isString(singleFieldInputRules['chineseName'])){
        rc['rc']=validateHelperError.chineseNameNotString.rc
        rc['msg']=`${singleFieldName}的${validateHelperError.chineseNameNotString.msg}`
        return rc
    }
    if(dataTypeCheck.isEmpty(singleFieldInputRules['chineseName'])){
        rc['rc']=validateHelperError.chineseNameEmpty.rc
        rc['msg']=`${singleFieldName}的${validateHelperError.chineseNameEmpty.msg}`
        return rc
    }

    //3 检查dataTpe是否validate
    let unknownDataType=true
    for(let key in serverDataType){
        if(serverDataType[key]===singleFieldInputRules['type']){
            unknownDataType=false
            break
        }
        continue
    }
    if(true===unknownDataType){
        rc['rc']=validateHelperError.unknownDataType.rc
        rc['msg']=`${singleFieldName}的type的${validateHelperError.unknownDataType.msg}`
        return rc
    }

    //singleFieldName可以用chineseName代替，如此，更容易查看错误
    let chineseName=singleFieldInputRules['chineseName']
    //4 某些类型必须有关联rule
    //console.log(inputRules[inputRule]['type'])
    switch (singleFieldInputRules['type']){

        case serverDataType.INT:
            if(false===dataTypeCheck.isSetValue(singleFieldInputRules['min'])){
                rc['rc']=validateHelperError.needMin.rc
                rc['msg']=`${chineseName}的${validateHelperError.needMin.msg}`
                return rc

            }
            if( false===dataTypeCheck.isSetValue(singleFieldInputRules['max'])){
                rc['rc']=validateHelperError.needMax.rc
                rc['msg']=`${chineseName}的${validateHelperError.needMax.msg}`
                return rc
            }
            break;
        //和int处理方式一样
        case serverDataType.FLOAT:
            if(false===dataTypeCheck.isSetValue(singleFieldInputRules['min'])){
                rc['rc']=validateHelperError.needMin.rc
                rc['msg']=`${chineseName}的${validateHelperError.needMin.msg}`
                return rc

            }
            if( false===dataTypeCheck.isSetValue(singleFieldInputRules['max'])){
                rc['rc']=validateHelperError.needMax.rc
                rc['msg']=`${chineseName}的${validateHelperError.needMax.msg}`
                return rc
            }
            break;
        case serverDataType.NUMBER:
            //console.log(inputRules[inputRule]['maxLength'])
            if(false===dataTypeCheck.isSetValue(singleFieldInputRules['maxLength'])){
                rc['rc']=validateHelperError.needMaxLength.rc
                rc['msg']=`${chineseName}的${validateHelperError.needMaxLength.msg}`
                //console.log(rc)
                return rc
            };
            break
        case serverDataType.STRING:
            //string: 如果即没有format，也没有enum，则必须有maxLenght
            if(false===dataTypeCheck.isSetValue(singleFieldInputRules['format']) && false===dataTypeCheck.isSetValue(singleFieldInputRules['enum'])){
                if(false===dataTypeCheck.isSetValue(singleFieldInputRules['maxLength'])){
                    rc['rc']=validateHelperError.needMaxLength.rc
                    rc['msg']=`${chineseName}的${validateHelperError.needMaxLength.msg}`
                    return rc
                };
            };

            break
        //ObjectId必须有format，用来出错时返回错误
        case serverDataType.OBJECT_ID:
            if(false===dataTypeCheck.isSetValue(singleFieldInputRules['format'])){
                rc['rc']=validateHelperError.needFormat.rc
                rc['msg']=`${chineseName}的${validateHelperError.needFormat.msg}`
                //console.log(rc)
                return rc
            };
            break
        default:
            break;
    }

    //5 检测单个rule的格式是否正确，是否有define，是否有error，且格式为error:{rc:xxx,msg:'yyy'}
    //需要排除chineseName/type/default
    for (let singleRule in singleFieldInputRules) {
        let excludeRuleName=['chineseName','type','default']
        if(-1<excludeRuleName.indexOf(singleRule)){
            continue
        }
        //检查rule中必须的字段是否存在（rule定义是否正确）
        //因为inputRule的msg是通过函数产生的，所以无需这个key
        if (true === dataTypeCheck.isSetValue(singleFieldInputRules[singleRule])) {
            if (false === dataTypeCheck.isSetValue(singleFieldInputRules[singleRule]['define'])) {
                rc['rc'] = validateHelperError.ruleDefineNotDefine.rc
                rc['msg'] = `${chineseName}的${singleRule}的${validateHelperError.ruleDefineNotDefine.msg}`
                return rc
            }
            if (false === dataTypeCheck.isSetValue(singleFieldInputRules[singleRule]['error'])) {
                rc['rc'] = validateHelperError.errorFieldNotDefine.rc
                rc['msg'] = `${chineseName}的${singleRule}的${validateHelperError.errorFieldNotDefine.msg}`
                return rc
            }
            if (false === dataTypeCheck.isSetValue(singleFieldInputRules[singleRule]['error']['rc'])) {
                rc['rc'] = validateHelperError.rcFieldNotDefine.rc
                rc['msg'] = `${chineseName}的${singleRule}的${validateHelperError.rcFieldNotDefine.msg}`
                return rc
            }
        }
    }


    //6 检测rule define是否正确(采用严格模式，mix/max/minLength/maxLength/exactLenght为数字，format为regex，enum为数组？，date为data)
    for (let singleRule in singleFieldInputRules){
        // let currentRule=singleFieldInputRules[singleRule]
        //字段chineseName/default/type是没有define的，所以singleRuleDefine为undefined，需要skip，防止js报错:undefined

        if('chineseName'===singleRule || 'type'===singleRule || 'default'===singleRule){
            continue
        }

        let singleRuleDefine=singleFieldInputRules[singleRule]['define']
        if(serverRuleType.require===singleRule){
            if(false!==singleRuleDefine && true!==singleRuleDefine){
                rc['rc']=validateHelperError.requireDefineNotBoolean.rc
                rc['msg']=`${chineseName}的${validateHelperError.requireDefineNotBoolean.msg}`
                return rc
            }else{
                continue
            }

        }

        //对数字进行检查，必须是数字而不是字符
        if(serverRuleType.minLength===singleRule || serverRuleType.maxLength===singleRule || serverRuleType.exactLength===singleRule || serverRuleType.min===singleRule || serverRuleType.max===singleRule ){
            //首先检查是不是为int
            let result=dataTypeCheck.isStrictInt(singleRuleDefine)
            if(false===result){
                //根据不同的类型，返回不同的rc以便区分具体的错误
                if(serverRuleType.minLength===singleRule || serverRuleType.maxLength===singleRule || serverRuleType.exactLength===singleRule){
                    rc['rc']=validateHelperError.lengthDefineNotInt.rc
                    rc['msg']=`${chineseName}的${validateHelperError.lengthDefineNotInt.msg}`
                }
                if(serverRuleType.min===singleRule){
                    rc['rc']=validateHelperError.minDefineNotInt.rc
                    rc['msg']=`${chineseName}的${validateHelperError.minDefineNotInt.msg}`
                }
                if(serverRuleType.max===singleRule){
                    rc['rc']=validateHelperError.maxDefineNotInt.rc
                    rc['msg']=`${chineseName}的${validateHelperError.maxDefineNotInt.msg}`
                }
                return rc
            }
            //如果是min/max/exactLength，还要检查值是否小于0
            if(serverRuleType.minLength===singleRule || serverRuleType.maxLength===singleRule || serverRuleType.exactLength===singleRule){
                if(singleRuleDefine<=0){
                    rc['rc']=validateHelperError.lengthDefineMustLargeThanZero.rc
                    rc['msg']=`${chineseName}的规则${singleRule}的${validateHelperError.lengthDefineMustLargeThanZero.msg}`
                    return rc
                }
            }
            // currentRule['define']=result
            continue
            //}

        }

        if(serverRuleType.format===singleRule){

            continue
        }

        if(serverRuleType.equalTo===singleRule){

            continue
        }

        if(serverRuleType.enum===singleRule){
            if(false===dataTypeCheck.isArray(singleRuleDefine)){
                rc['rc']=validateHelperError.enumDefineNotArray.rc
                rc['msg']=`${chineseName}的${validateHelperError.enumDefineNotArray.msg}`
                return rc
            }
            //数组lenght是否大于1
            if(singleRuleDefine.length<1){
                rc['rc']=validateHelperError.enumDefineLengthMustLargerThanZero.rc
                rc['msg']=`${chineseName}的${validateHelperError.enumDefineLengthMustLargerThanZero.msg}`
                return rc
            }
            // continue

        }

    }

    //7 default单独处理（只检查类型是否正确，而不检查是否在范围内，范围检查由checkInputValue执行）
    //7.1 不为空，检查dataType
    if(dataTypeCheck.isSetValue(singleFieldInputRules['default'])){
        let singleFiledDataType = singleFieldInputRules['type']
        let checkResult
        /*            console.log(`default value is ${singleFieldInputRules['default']}`)
         console.log(`is set value is ${dataTypeCheck.isSetValue(singleFieldInputRules['default'])}`)*/
        switch (singleFiledDataType) {
            case serverDataType.string:
                if (false === dataTypeCheck.isString(singleFieldInputRules['default'])) {
                    return validateHelperError.ruleDefineWrong(collName, singleFieldName, 'default')
                }
                break;
            case serverDataType.int:
                checkResult = dataTypeCheck.isStrictInt(singleFieldInputRules['default'])
                if (false === checkResult) {
                    return validateHelperError.ruleDefineWrong(collName, singleFieldName, 'default')
                }

                break
            case serverDataType.float:
                checkResult = dataTypeCheck.isStrictFloat(singleFieldInputRules['default'])
                if (false === checkResult) {
                    return validateHelperError.ruleDefineWrong(collName, singleFieldName, 'default')
                } else {
                    singleFieldInputRules['default'] = checkResult
                }
                break
            case serverDataType.number:
                checkResult = dataTypeCheck.isNumber(singleFieldInputRules['default'])
                if (false === checkResult) {
                    return validateHelperError.ruleDefineWrong(collName, singleFieldName, 'default')
                } else {
                    singleFieldInputRules['default'] = checkResult
                }
                break
            //其他默认通过
            default:
                break
        }
    }

    return rightResult

}


/*      产生人性化的errorMsg
* params：
* 1. fieldRule：对象，字段的所有rule，提供chineseName，和singleRule的define
* 2. currentSingleRule： enum，当前要检测的rule
*
* return：
* 字符串
* */
const genInputError=function(fieldRule,currentSingleRule){
    let ruleDefine=fieldRule[currentSingleRule]['define']
    let ruleRc=fieldRule[currentSingleRule]['error']['rc']
    let chineseName=fieldRule['chineseName']

    switch(currentSingleRule){
        case serverRuleType.REQUIRE:
            return {rc:ruleRc,msg:`${chineseName}不能为空`}
        case serverRuleType.MAX_LENGTH:
            return {rc:ruleRc,msg:`${chineseName}所包含的字符数不能超过${ruleDefine}个`}
            // return `${chineseName}所包含的字符数不能超过${ruleDefine}个`
        case serverRuleType.MIN_LENGTH:
            return {rc:ruleRc,msg:`${chineseName}所包含的字符数不能少于${ruleDefine}个`}
            // return `${chineseName}所包含的字符数不能少于${ruleDefine}个`
        case serverRuleType.ARRAY_MIN_LENGTH:
            return {rc:ruleRc,msg:`${chineseName}所包含的数据量未达到${ruleDefine}个`}
        case serverRuleType.ARRAY_MAX_LENGTH:
            return {rc:ruleRc,msg:`${chineseName}所包含的数据量不能超过${ruleDefine}个`}
        case serverRuleType.EXACT_LENGTH:
            return {rc:ruleRc,msg:`${chineseName}所包含的字符数不等于${ruleDefine}个`}
            // return `${chineseName}所包含的字符数不等于${ruleDefine}个`
        case serverRuleType.MAX:
            return {rc:ruleRc,msg:`${chineseName}所包含的字符数不能大于${ruleDefine}`}
            // return `${chineseName}所包含的字符数不能大于${ruleDefine}`
        case serverRuleType.MIN:
            return {rc:ruleRc,msg:`${chineseName}所包含的字符数不能小于${ruleDefine}`}
            // return `${chineseName}所包含的字符数不能小于${ruleDefine}`
        case serverRuleType.ENUM:
            return {rc:ruleRc,msg:`${chineseName}不是预定义的值`}
        // return `${chineseName}所包含的字符数不能小于${ruleDefine}`
        case serverRuleType.FORMAT:
            switch (ruleDefine) {
                case regex.password:
                    return {rc:ruleRc,msg:`${chineseName}的格式不正确，必须由6至20个字母数字和特殊符号组成`}
                    // return `${chineseName}的格式不正确，必须由6至20个字母数字和特殊符号组成`
                //break;
                case regex.objectId:
                    return {rc:ruleRc,msg:`${chineseName}的格式不正确，必须是objectId`}
                    // return `${chineseName}的格式不正确，必须是objectId`
                //break;
                case regex.userName:
                    return {rc:ruleRc,msg:`${chineseName}的格式不正确，必须由2至20个字符组成`}
                    // return `${chineseName}的格式不正确，必须由2至20个字符组成`
                case regex.mobilePhone:
                    return {rc:ruleRc,msg:`${chineseName}的格式不正确，必须由11个数字组成`}
                    // return `${chineseName}的格式不正确，必须由11至13个数字组成`
                case regex.originalThumbnail:
                    return {rc:ruleRc,msg:`${chineseName}的格式不正确，文件名由2到20个字符组成`}
                    // return `${chineseName}的格式不正确，文件名由2到20个字符组成`
                //hashedThumbnail不用单独列出，是内部检查，使用default错误消息即可
                default:
                    return {rc:ruleRc,msg:`${chineseName}的格式不正确`}
                    // return `${chineseName}的格式不正确`
            }
        case serverRuleType:
            return {rc:ruleRc,msg:`ruleType ${chineseName}(枚举值)不正确`}
            // return `${chineseName}(枚举值)不正确`
    }



}
/*
 *   值是否满足对应的rule
 */
const valueMatchRuleDefineCheck={

    //只处理当require为true
    require(fieldValue,requireDefine=true){
        // console.log(`dataTypeCheck.isSetValue(fieldValue) ${dataTypeCheck.isSetValue(fieldValue)}`)
        // console.log(`!dataTypeCheck.isEmpty(fieldValue)) ${!dataTypeCheck.isEmpty(fieldValue)}`)
        return dataTypeCheck.isSetValue(fieldValue) && !dataTypeCheck.isEmpty(fieldValue) //防止输入空字符/object/array等
        // console.log(`field value fieldValueSetFlag ${JSON.stringify(fieldValueSetFlag)}`)
        // console.log(`requireDefine ${JSON.stringify(requireDefine)}`)
        // let requireFlag=fieldRule[e_serverRuleType.REQUIRE]['define']
        

        
    },
    exceedMaxLength(value, maxLength) {
        // console.log( `exceed enter`)
        //length属性只能在数字/字符/数组上执行
        //其实只有float/number/int和string/array才有maxLength（在rule中定义）
        if(false===dataTypeCheck.isArray(value) && false===dataTypeCheck.isStrictInt(value) && false===dataTypeCheck.isStrictFloat(value) && false===dataTypeCheck.isStrictNumber(value) && false===dataTypeCheck.isString(value)){
            // console.log( `exceed:type wrong`)
            return false
        }
        //数字需要转换成字符才能执行length
        //float如下情况会自动转换  123.0===>123
        if(true===dataTypeCheck.isStrictFloat(value) || true===dataTypeCheck.isStrictInt(value) || true===dataTypeCheck.isStrictNumber(value)){
            // console.log( `exceed:type number`)
            return value.toString().length > maxLength
        }
        // console.log(`exceed function. value is ${value},define is ${maxLength}`)
        return value.length > maxLength
    },

    exceedMinLength(value, minLength) {
        //其实只有float/number/int和string/array才有maxLength（在rule中定义）
        if(false===dataTypeCheck.isArray(value) && false===dataTypeCheck.isStrictInt(value) && false===dataTypeCheck.isStrictFloat(value) && false===dataTypeCheck.isStrictNumber(value) && false===dataTypeCheck.isString(value)){
            return false
        }
        //数字需要转换成字符才能执行length
        //float如下情况会自动转换  123.0===>123
        if(true===dataTypeCheck.isStrictFloat(value) || true===dataTypeCheck.isStrictInt(value) || true===dataTypeCheck.isStrictNumber(value)){
            return value.toString().length < minLength
        }
        return value.length < minLength
    },

    exactLength(value, exactLength) {
        if(false===dataTypeCheck.isArray(value) && false===dataTypeCheck.isStrictInt(value) && false===dataTypeCheck.isStrictFloat(value) && false===dataTypeCheck.isStrictNumber(value) && false===dataTypeCheck.isString(value)){
            return false
        }
        //数字需要转换成字符才能执行length
        //float如下情况会自动转换  123.0===>123
        if(true===dataTypeCheck.isStrictFloat(value) || true===dataTypeCheck.isStrictInt(value) || true===dataTypeCheck.isStrictNumber(value)){
            return value.toString().length === exactLength
        }
        return value.length === exactLength
    },

    //广义比较，包括null和undefined的比较
    /*          equalTo 改在client执行*/
/*    equalTo(value, equalToValue) {
        //return (false===dataTypeCheck.isEmpty(value) && value===equalToValue)
        if(value instanceof Date && equalToValue instanceof Date){
            return value.toLocaleString()===equalToValue.toLocaleString()
        }
        return value === equalToValue
    },*/

    format(value, format) {
        return format.test(value)
    },

    enum(value,define){
        return -1!==define.indexOf(value)
    },
    //以下函数只能支持数值，必须由调用者确保参数的类型
    exceedMax(value, definedValue) {
        return parseFloat(value) > parseFloat(definedValue)
    },
    exceedMin(value, definedValue) {
        return parseFloat(value) < parseFloat(definedValue)
    },

    isFileFolderExist(value) {
        return fs.existsSync(value)
    },
}

module.exports={
    dataTypeCheck,
    valueTypeCheck,
    ruleFormatCheck,
    genInputError,
    valueMatchRuleDefineCheck,

}