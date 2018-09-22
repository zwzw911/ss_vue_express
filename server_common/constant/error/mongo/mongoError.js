/**
 * Created by wzhan039 on 2016-10-04.
 *
 * 定义mogoose操作错误
 */
'use strict'
/*{
    "errors": {
    "userType": {
        "message": "Cast to Number failed for value \"a\" at path
\"userType\"",
            "name": "CastError",
            "stringValue": "\"a\"",
            "kind": "Number",
            "value": "
        a",
        "path": "userType",
            "reason": {
            "message": "Cast to number failed for value \"a\"
            at path \"userType\"",
                "name": "CastError",
                "stringValue": "\"a\"",
                "kind": "number",
                "
            value": "a",
            "path": "userType"
        }
    }
},
    "_message": "admin_user validation failed",
    "name": "ValidationError",
    "message": "admin_user validation failed: userType: Cast to Nu
    mber failed for value \"a\" at path \"userType\""
}*/
    //用来获得chineseName，以便返回错误给client
// var inputRule=require('../validateRule/inputRule').inputRule
const mongooseOpEnum=require('../../enum/nodeEnum').MongooseOp

/*
* mongoose操作错误（不包含validator的错误？？）
* err:mongo返回的错误
* fieldName：如果是validto人返回的错误，需要fieldName来获得err中的errormsg
* */
const mongooseErrorHandler=function(err){
    // console.log(`mongoose err handler in`)
    // console.log(`mongooseOp ${JSON.stringify(mongooseOp)}`)
    //对特殊的操作做pre操作，如果有具体的error code，返回对应的error
    //例如，rep error
    if(!err.errors){
        if(err.code){
            switch (err.code){
                case 11000:
                    return error.common.duplicate(err.errmsg)

                    break;
                default:

                    return error.common.unknownErrorType(err)

            }
        }

    }

    //mongo validator错误。
    // 将错误 "错误代码20046:父类别不能为空" 转换成{rc:20046,msg:‘父类别不能为空’}
    if(err.errors){
        // console.log(`err.errors is ${JSON.stringify()}`)

        for(let single in err.errors){
            if(err.errors[single]['message']){
                //根据inputRule生成的内建validator
                if(-1!==err.errors[single]['message'].indexOf('错误代码')){
                    //只返回第一个字段的错误（如果多个字段同时出错），方便代码处理（直接检查rc即可）
                    let rc={}
                    let tmp=err.errors[single]['message'].split(':')
                    let regResultTmp=tmp[0].match(/.+(\d{5})/)
                    rc['rc']=regResultTmp[1]
                    rc['msg']=tmp[1]
                    return rc
                }else{
                    switch (err.errors[single]['name']){
                        case "CastError":
                            return {rc:30100, msg:err.errors[single]['message']}
                            break;
                        case "ValidatorError":
                            return {rc:30102, msg:err.errors[single]['message']}
                            break;
                        default:

                    }
                }

            }
        }

        //return err['errors'][fieldName]['message']
    }

/*    //具体操作祥光的error
    console.log(`common err is ${JSON.stringify(mongooseOp)}`)
    return error['common'][mongooseOp](err)*/
}

//常见错误
const error={
    common:{
        unknownErrorType:function(err){
            return {rc:30000,msg:{client:`未知数据操作错误`,server:`${JSON.stringify(err)}`}}
        },
        duplicate:function(errmsg){
            //'E11000 duplicate key error index: finance.billtypes.$name_1 dup key: { : \"aa\" }'=======>finance  billType   name
            //3.2.9   E11000 duplicate key error collection: finance.billtypes index: name_1 dup key: { : "aa" }
            // console.log(`mongoError->error: ${errmsg}`)
            let regex=/.*collection:\s(.*)\sindex:\s(.*)\sdup\skey:\s{\s:\s\"(.*)\"\s\}/
            let match=errmsg.match(regex)
            // console.log(`match is ${JSON.stringify(match)}`)
            let matchResult=match[1]
            // console.log(`match resultis ${JSON.stringify(matchResult)}`)
            let tmp=matchResult.split('.')
            // console.log(`tmp is ${JSON.stringify(tmp)}`)
            let [db,coll]=tmp
            let field=match[2].split("_")[0].replace("$","") //$name_1===>$name
            let dupValue=match[3]
/*            let regex=/.*collection:\s(.*)\sindex:\s(.*)\sdup\skey:\s{\s:\s\"(.*)\"\s\}/
            let matchResult=errmsg.match(regex)
            let [db,coll]=matchResult[1].split(".")
            let field=matchResult[2].split("_")[0]
            let dupValue=matchResult[3]*/
            // console.log(`db is ${db},coll is ${coll}, field is ${field}, dup is ${dupValue}`)
            //mongoose自动将coll的名称加上s，为了和inputRule匹配，删除s
            //let trueCollName
            if('s'===coll[coll.length-1]){
                coll=coll.substring(0,coll.length-1)
            }
            // console.log(`dup2`)
/*            let fieldRegex=/\$(\w+)_.*!/
            tmp=field.match(fieldRegex)
            field=tmp[1]*/

            //mongoose 自动将coll的名称改成全小写
/*            let chineseName
            for(let singleColl in inputRule){
                // console.log(`for coll is ${singleColl}`)
                if(singleColl.toLowerCase()===coll){
                    // console.log(`match coll is ${singleColl}`)

                    chineseName=inputRule[singleColl][field]['chineseName']
                }
            }*/
            // console.log(`ready to return mongooseErrorHandler`)
            return {rc:30002,msg:{client:`${field}的值已经存在`,server:`集合:${coll}-字段:${field}-值:${dupValue},重复`}}
        },
		//和duplicate不同，这是在insert前查找到的错误（而不是insert的时候通过mogoose得到的错误）
		uniqueFieldValue(coll,fieldName,fieldValue){
            return {rc:30004,msg:{client:`${fieldName}的值已经存在`,server:`集合:${coll}-字段:${fieldName}-值:${fieldValue},已经存在`}}
        },

		/*insertMany:function(err){
			return {rc:30003,msg:{client:`数据库错误，请联系管理员`,server:`insertMany err is ${JSON.stringify(err)}`}}
		},
        findById:function(err){
            return {rc:30004,msg:{client:`数据库错误，请联系管理员`,server:`findById err is ${JSON.stringify(err)}`}}
        },
        findByIdAndUpdate:function(err){
            return {rc:30006,msg:{client:`数据库错误，请联系管理员`,server:`findByIdAndUpdate err is ${JSON.stringify(err)}`}}
        },
        remove:function(err){
            return {rc:30008,msg:{client:`数据库错误，请联系管理员`,server:`remove err is ${JSON.stringify(err)}`}}
        },
        readAll:function(err){
            return {rc:30010,msg:{client:`数据库错误，请联系管理员`,server:`read all err is ${JSON.stringify(err)}`}}
        },
        readName:function(err){
            return {rc:30012,msg:{client:`数据库错误，请联系管理员`,server:`read name err is ${JSON.stringify(err)}`}}
        },
        search:function(err){
            return {rc:30014,msg:{client:`数据库错误，请联系管理员`,server:`search err is ${JSON.stringify(err)}`}}
        },
        count:function(err){
            return {rc:30014,msg:{client:`数据库错误，请联系管理员`,server:`count err is ${JSON.stringify(err)}`}}
        },*/
    },
    findByIdReturnRecord:{
        populateOptTypeError:{rc:30006,msg:{client:`内部错误`,server:`findById_returnRecord的参数populateOpt必须是数组`}},
        populateOptFieldNumExceed:{rc:30008,msg:{client:`内部错误`,server:`findById_returnRecord的参数populateOpt中需要populate的字段数量过多`}},
    }
}

module.exports={
    mongooseErrorHandler,
    error,
}