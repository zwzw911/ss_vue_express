/**
 * Created by wzhan039 on 2017-06-28.
 */
"use strict";
const testModel=require('../../../../../server/model/mongo/structure/admin/admin_user').collModel;
// let testSch=require('../../../../../server/model/mongo/structure/admin/admin_user').collSchema;

const browserInputRule=require('../../../../../server/constant/inputRule/browserInput/admin/admin_user').admin_user
const internalInputRule=require('../../../../../server/constant/inputRule/internalInput/admin/admin_user').admin_user
//根据inputRule的rule设置，对mongoose设置内建validator
const collInputRule=Object.assign({},browserInputRule,internalInputRule)


const enumValue=require('../../../../../server/constant/enum/mongo')

const serverRuleType=require('../../../../../server/constant/enum/inputDataRuleType').ServerRuleType

// const commonOperation=require('../../../../../server/model/mongo/operation/common')

// const mongooseErrHandler=require('../../../../../server/constant/error/mongo/mongoError').mongooseErrorHandler
const generateTestCase=require('../generateCommonTestCase').generateTestCase

let value,doc,result,errMsg,singleRule,field
const correctValue={
    name:'admin',
    password:'401b09eab3c013d4ca54922bb802bec8fd5318192b0a75f201d8b3727429080fb337591abd3e44453b954555b7a0812e1081c39b740293f765eae731f5a65ed1',
    userType:enumValue.AdminUserType.DB.NORMAL,
    userPriority:[enumValue.AdminPriorityType.DB.IMPEACH],
}

let newDoc=new testModel(correctValue)
newDoc.save(function(err){
    if(err){
        console.log(`correct value save failed with error ${JSON.stringify(err)}`)
    }
})
// async function validatePathValue(test){
const  validatePathValue=function(test){
    test.expect(11)

    //1 correct value
    generateTestCase({fieldName:undefined,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})



    field='name'
    //2 miss field name
    generateTestCase({fieldName:field,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //3 name too short
    generateTestCase({fieldName:field,singleRuleName:serverRuleType.MIN_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //4 name too long
    generateTestCase({fieldName:field,singleRuleName:serverRuleType.MAX_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})


    field='password'
    //5 miss password
    generateTestCase({fieldName:field,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //6 password not sha value
    generateTestCase({fieldName:field,singleRuleName:serverRuleType.FORMAT,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})


    field='userType'
    //7 miss type
    generateTestCase({fieldName:field,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //8 type not in enum( Number auto cast to String)
    generateTestCase({fieldName:field,singleRuleName:serverRuleType.ENUM,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})

    field='userPriority'
    //9 miss userPriority
    generateTestCase({fieldName:field,singleRuleName:serverRuleType.REQUIRE,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //10 userPriority not in enum( Number auto cast to String)
    /*              mongoose not build-in validator enum for  [String]          */
    generateTestCase({fieldName:field,singleRuleName:serverRuleType.ENUM,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})
    //11 userPriority number exceed array max length
    generateTestCase({fieldName:'userPriority',singleRuleName:serverRuleType.ARRAY_MAX_LENGTH,correctValue:correctValue,collInputRule:collInputRule,testModel:testModel,test:test})



    test.done()
}

module.exports={
    validatePathValue,


}