/**
 * Created by wzhan039 on 2017-06-29.
 */
"use strict";
const testModel=require('../../../../../server/model/mongo/structure/admin/store_path').collModel;
// let testSch=require('../../../../../server/model/mongo/structure/admin/admin_user').collSchema;

const browserInputRule=require('../../../../../server/constant/inputRule/browserInput/admin/store_path').store_path
// const internalInputRule=require('../../../../../server/constant/inputRule/internalInput/admin/ca').admin_user
//根据inputRule的rule设置，对mongoose设置内建validator
// const collInputRule=Object.assign({},browserInputRule,internalInputRule)
const collInputRule=browserInputRule

// const enumValue=require('../../../../../server/constant/enum/mongo')

const serverRuleType=require('../../../../../server/constant/enum/inputDataRuleType').ServerRuleType

// const commonOperation=require('../../../../../server/model/mongo/operation/common')

/*              为了测试FOLDER才有                        */
const mongooseErrHandler=require('../../../../../server/constant/error/mongo/mongoError').mongooseErrorHandler

const generateTestCase=require('../generateCommonTestCase').generateTestCase

let value,doc,result,errMsg,singleRule,field
const correctValue={
    name:'cat1',
    path:'D:/'
}
/*const correctValue1={
    name:'cat2',
    path:'D:/'
}*/

let newDoc=new testModel(correctValue)
newDoc.save(function(err){
    if(err){
        console.log(`correct value save failed with error ${JSON.stringify(err)}`)
    }
})

/*
let newDoc1=new testModel(correctValue1)
newDoc1.save(function(err){
    if(err){
        console.log(`correct value1 save failed with error ${JSON.stringify(err)}`)
    }
})
*/

/*//check name unique
newDoc.save(function(err){
    if(err){
        console.log(`correct value save again failed with error ${JSON.stringify(err)}`)
    }
})*/

// async function validatePathValue(test){
const  validatePathValue=function(test){
    test.expect(6)


    //1 correct value
    generateTestCase({fieldName:undefined,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    field='name'
    //2 miss field name
    generateTestCase({fieldName:field,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //3 name too short
    generateTestCase({fieldName:field,singleRuleName:serverRuleType.MIN_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //4 name too long
    generateTestCase({fieldName:field,singleRuleName:serverRuleType.MAX_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})




    field='path'
    //5 path miss
    generateTestCase({fieldName:field,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    //6 path invalid （mongoose not support such function）
    value=Object.assign({},correctValue)
    value[field]='z'
    doc=new testModel(value)
    result=doc.validateSync()
    console.log(`${JSON.stringify(result)}`)
/*    singleRule=collInputRule[field][serverRuleType.FORMAT]
    errMsg=`错误代码${singleRule['mongoError']['rc']}:${singleRule['mongoError']['msg']}`*/
    errMsg=mongooseErrHandler(result).msg
    console.log(`${JSON.stringify(mongooseErrHandler(result))}`)
    test.equal(result['errors'][field]['message'],errMsg,`field ${field} value contain not hex char`)


    test.done()
}

module.exports={
    validatePathValue,


}